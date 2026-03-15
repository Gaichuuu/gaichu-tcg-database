<?php
/**
 * SEO handler for card pages.
 * Serves proper Open Graph meta tags to social media bots and search engine crawlers.
 *
 * URL patterns:
 *   /cards/{series} - Series page
 *   /cards/{series}/sets/{set} - Set page
 *   /cards/{series}/sets/{set}/card/{sortBy}_{cardSlug} - Card detail
 */

$ua = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
$isBot = (bool) preg_match(
  '/facebookexternalhit|Twitterbot|Discordbot|Slackbot|LinkedInBot|WhatsApp|TelegramBot|Applebot|Google.*snippet|bingbot|SkypeUriPreview|redditbot|Meta-ExternalAgent|Googlebot/i',
  $ua
);

$debug = isset($_GET['dbg']);

$path = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';
$parsedPath = parse_url($path, PHP_URL_PATH);

$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'gaichu.com';
$projectId = (stripos($host, 'stage') !== false || stripos($host, 'dev') !== false)
  ? 'gaichu-stage'
  : 'gaichu-fe55f';

$pageType = null;
$seriesShortName = null;
$setShortName = null;
$sortBy = null;
$cardSlug = null;

$matches = [];
if (preg_match('~^/cards/([^/]+)/sets/([^/]+)/card/([^/?#]+)~', $parsedPath, $matches)) {
  $pageType = 'card';
  $seriesShortName = urldecode($matches[1]);
  $setShortName = urldecode($matches[2]);
  $sortByAndCardName = urldecode($matches[3]);

  $cardMatches = [];
  if (preg_match('/^(\d+(?:\.\d+)?)_(.+)$/', $sortByAndCardName, $cardMatches)) {
    $sortBy = floatval($cardMatches[1]);
    $cardSlug = $cardMatches[2];
  } else {
    $sortBy = null;
    $cardSlug = $sortByAndCardName;
  }
}
elseif (preg_match('~^/cards/([^/]+)/sets/([^/?#]+)(?:/(?:pack-art|card-back))?/?$~', $parsedPath, $matches)) {
  $pageType = 'set';
  $seriesShortName = urldecode($matches[1]);
  $setShortName = urldecode($matches[2]);
}
elseif (preg_match('~^/cards/([^/]+)/?$~', $parsedPath, $matches)) {
  $pageType = 'series';
  $seriesShortName = urldecode($matches[1]);
}

if (!$pageType) {
  serve_index();
  exit;
}

function firestore_query($projectId, $collection, $filters) {
  $url = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents:runQuery";

  $where = null;
  if (count($filters) === 1) {
    $f = $filters[0];
    $where = [
      'fieldFilter' => [
        'field' => ['fieldPath' => $f['field']],
        'op' => 'EQUAL',
        'value' => ['stringValue' => $f['value']]
      ]
    ];
  } elseif (count($filters) > 1) {
    $fieldFilters = [];
    foreach ($filters as $f) {
      $fieldFilters[] = [
        'fieldFilter' => [
          'field' => ['fieldPath' => $f['field']],
          'op' => 'EQUAL',
          'value' => ['stringValue' => $f['value']]
        ]
      ];
    }
    $where = [
      'compositeFilter' => [
        'op' => 'AND',
        'filters' => $fieldFilters
      ]
    ];
  }

  $query = [
    'structuredQuery' => [
      'from' => [['collectionId' => $collection]],
      'where' => $where,
      'limit' => 1
    ]
  ];

  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($query));
  curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
  curl_setopt($ch, CURLOPT_TIMEOUT, 4);

  $res = curl_exec($ch);
  curl_close($ch);

  if (!$res) return null;

  $json = json_decode($res, true);
  if (!$json || !isset($json[0]['document']['fields'])) return null;

  $result = parse_firestore_fields($json[0]['document']['fields']);

  if (isset($json[0]['document']['name'])) {
    $docName = $json[0]['document']['name'];
    $parts = explode('/', $docName);
    $result['id'] = end($parts);
  }

  return $result;
}

function parse_firestore_fields($fields) {
  $result = [];
  foreach ($fields as $key => $value) {
    if (isset($value['stringValue'])) {
      $result[$key] = $value['stringValue'];
    } elseif (isset($value['integerValue'])) {
      $result[$key] = (int)$value['integerValue'];
    } elseif (isset($value['doubleValue'])) {
      $result[$key] = (float)$value['doubleValue'];
    } elseif (isset($value['booleanValue'])) {
      $result[$key] = $value['booleanValue'];
    } elseif (isset($value['mapValue']['fields'])) {
      $result[$key] = parse_firestore_fields($value['mapValue']['fields']);
    } elseif (isset($value['arrayValue']['values'])) {
      $arr = [];
      foreach ($value['arrayValue']['values'] as $v) {
        if (isset($v['stringValue'])) {
          $arr[] = $v['stringValue'];
        } elseif (isset($v['mapValue']['fields'])) {
          $arr[] = parse_firestore_fields($v['mapValue']['fields']);
        }
      }
      $result[$key] = $arr;
    }
  }
  return $result;
}

function load_series_data($projectId, $seriesShortName) {
  return firestore_query($projectId, 'series', [
    ['field' => 'short_name', 'value' => $seriesShortName]
  ]);
}

function load_set_data($projectId, $seriesShortName, $setShortName) {
  return firestore_query($projectId, 'sets', [
    ['field' => 'series_short_name', 'value' => $seriesShortName],
    ['field' => 'short_name', 'value' => $setShortName]
  ]);
}

function load_card_data($projectId, $seriesShortName, $setShortName, $sortBy, $cardSlug) {

  $set = load_set_data($projectId, $seriesShortName, $setShortName);
  if (!$set || !isset($set['id'])) return null;

  $url = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents:runQuery";

  $filters = [
    [
      'fieldFilter' => [
        'field' => ['fieldPath' => 'set_ids'],
        'op' => 'ARRAY_CONTAINS',
        'value' => ['stringValue' => $set['id']]
      ]
    ]
  ];

  if ($sortBy !== null) {
    $sortByValue = floor($sortBy) == $sortBy
      ? ['integerValue' => (string)(int)$sortBy]
      : ['doubleValue' => $sortBy];
    $filters[] = [
      'fieldFilter' => [
        'field' => ['fieldPath' => 'sort_by'],
        'op' => 'EQUAL',
        'value' => $sortByValue
      ]
    ];
  }

  $query = [
    'structuredQuery' => [
      'from' => [['collectionId' => 'cards']],
      'where' => count($filters) === 1 ? $filters[0] : [
        'compositeFilter' => [
          'op' => 'AND',
          'filters' => $filters
        ]
      ],
      'limit' => $sortBy !== null ? 1 : 100
    ]
  ];

  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($query));
  curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
  curl_setopt($ch, CURLOPT_TIMEOUT, 4);

  $res = curl_exec($ch);
  curl_close($ch);

  if (!$res) return null;

  $json = json_decode($res, true);
  if (!$json) return null;

  foreach ($json as $result) {
    if (!isset($result['document']['fields'])) continue;

    $card = parse_firestore_fields($result['document']['fields']);

    $cardName = is_array($card['name'] ?? null)
      ? ($card['name']['en'] ?? reset($card['name']) ?? '')
      : ($card['name'] ?? '');

    if ($sortBy !== null) {
      return [
        'card' => $card,
        'set' => $set,
        'cardName' => $cardName
      ];
    }

    $nameSlug = slugify($cardName);
    if ($nameSlug === $cardSlug) {
      return [
        'card' => $card,
        'set' => $set,
        'cardName' => $cardName
      ];
    }
  }

  return null;
}

function slugify($s) {
  $s = strtolower(trim($s));
  $s = preg_replace("/['\\x{2019}]/u", '', $s);
  $s = preg_replace('/[^a-z0-9]+/', '-', $s);
  return trim($s, '-');
}

function get_card_description($card, $cardName) {
  $parts = [];

  if (!empty($card['average_price'])) {
    $parts[] = "Probably sells for " . $card['average_price'] . " USD";
  }

  $desc = is_array($card['description'] ?? null)
    ? ($card['description']['en'] ?? '')
    : ($card['description'] ?? '');
  if ($desc) {
    $parts[] = $desc;
  }

  $result = implode('. ', $parts);
  return $result ? $result : "View {$cardName} card details on Gaichu TCG Database.";
}

function render_og($host, $path, $title, $desc, $image, $card = null) {
  $url = 'https://' . $host . $path;

  $safeTitle = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
  $safeDesc = htmlspecialchars(substr($desc, 0, 300), ENT_QUOTES, 'UTF-8');
  $safeImg = htmlspecialchars($image, ENT_QUOTES, 'UTF-8');

  header('Content-Type: text/html; charset=utf-8');
  header('Cache-Control: public, max-age=3600, s-maxage=3600');

  echo "<!doctype html>\n<html lang=\"en\"><head>\n";
  echo "<meta charset=\"utf-8\" />\n";
  echo "<title>{$safeTitle} - Gaichu</title>\n";
  echo "<link rel=\"canonical\" href=\"{$url}\" />\n";
  echo "<meta name=\"description\" content=\"{$safeDesc}\" />\n";
  echo "<meta property=\"og:site_name\" content=\"Gaichu\" />\n";
  echo "<meta property=\"og:type\" content=\"article\" />\n";
  echo "<meta property=\"og:title\" content=\"{$safeTitle}\" />\n";
  echo "<meta property=\"og:description\" content=\"{$safeDesc}\" />\n";
  echo "<meta property=\"og:image\" content=\"{$safeImg}\" />\n";
  echo "<meta property=\"og:url\" content=\"{$url}\" />\n";
  echo "<meta name=\"twitter:card\" content=\"summary_large_image\" />\n";
  echo "<meta name=\"twitter:title\" content=\"{$safeTitle}\" />\n";
  echo "<meta name=\"twitter:description\" content=\"{$safeDesc}\" />\n";
  echo "<meta name=\"twitter:image\" content=\"{$safeImg}\" />\n";

  if ($card) {
    $avgPrice = isset($card['average_price']) && $card['average_price'] > 0
      ? $card['average_price']
      : null;

    $offer = [
      '@type' => 'Offer',
      'url' => $url,
      'itemCondition' => 'https://schema.org/UsedCondition',
      'availability' => 'https://schema.org/InStock',
      'priceCurrency' => 'USD'
    ];
    if ($avgPrice !== null) {
      $offer['price'] = $avgPrice;
    }

    $jsonLd = [
      '@context' => 'https://schema.org',
      '@type' => 'Product',
      'name' => $title,
      'description' => $desc,
      'image' => $image,
      'url' => $url,
      'brand' => [
        '@type' => 'Brand',
        'name' => 'Gaichu TCG'
      ],
      'category' => 'Trading Card',
      'offers' => $offer
    ];
    echo '<script type="application/ld+json">' . json_encode($jsonLd, JSON_UNESCAPED_SLASHES) . "</script>\n";
  }

  echo "<style>body{font:14px system-ui, sans-serif;padding:24px;color:#ddd;background:#000}</style>\n";
  echo "</head><body><a href=\"{$url}\">{$safeTitle}</a></body></html>";
}

function serve_index() {
  $indexPath = dirname(__DIR__) . '/index.html';
  if (is_file($indexPath)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($indexPath);
    exit;
  }
  http_response_code(404);
  echo 'Not found';
}

if ($debug) {
  header('Content-Type: text/plain; charset=utf-8');
  echo "UA: $ua\n";
  echo "HOST: $host\n";
  echo "PATH: $path\n";
  echo "PROJECT: $projectId\n";
  echo "PAGE_TYPE: $pageType\n";
  echo "SERIES: $seriesShortName\n";
  echo "SET: $setShortName\n";
  echo "SORT_BY: $sortBy\n";
  echo "CARD_SLUG: $cardSlug\n";
  echo "IS_BOT: " . ($isBot ? 'true' : 'false') . "\n\n";

  if ($pageType === 'series') {
    $data = load_series_data($projectId, $seriesShortName);
    echo "SERIES DATA: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
  } elseif ($pageType === 'set') {
    $seriesData = load_series_data($projectId, $seriesShortName);
    $setData = load_set_data($projectId, $seriesShortName, $setShortName);
    echo "SERIES DATA: " . json_encode($seriesData, JSON_PRETTY_PRINT) . "\n";
    echo "SET DATA: " . json_encode($setData, JSON_PRETTY_PRINT) . "\n";
  } else {
    $data = load_card_data($projectId, $seriesShortName, $setShortName, $sortBy, $cardSlug);
    echo "CARD DATA: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
  }
  exit;
}

if ($isBot) {
  $defaultImage = 'https://gaichu.b-cdn.net/assets/default.png?v=3';

  if ($pageType === 'series') {
    $series = load_series_data($projectId, $seriesShortName);
    if ($series) {
      $title = $series['name'];
      $desc = $series['description'] ?? "Browse all {$series['name']} card sets on Gaichu.";
      $image = $series['logo'] ?? $defaultImage;
      render_og($host, $parsedPath, $title, $desc, $image);
      exit;
    }
    render_og($host, $parsedPath, 'Card Series', 'Browse card series on Gaichu TCG Database.', $defaultImage);
    exit;
  }

  if ($pageType === 'set') {
    $series = load_series_data($projectId, $seriesShortName);
    $set = load_set_data($projectId, $seriesShortName, $setShortName);
    if ($set) {
      $seriesName = $series ? $series['name'] : $seriesShortName;
      $title = $set['name'] . ' - ' . $seriesName;
      $desc = $set['description'] ?? "Browse all cards in {$set['name']} on Gaichu.";
      $image = $set['logo'] ?? ($series['logo'] ?? $defaultImage);
      render_og($host, $parsedPath, $title, $desc, $image);
      exit;
    }
    render_og($host, $parsedPath, 'Card Set', 'Browse card sets on Gaichu TCG Database.', $defaultImage);
    exit;
  }

  $data = load_card_data($projectId, $seriesShortName, $setShortName, $sortBy, $cardSlug);
  if ($data) {
    $card = $data['card'];
    $set = $data['set'];
    $cardName = $data['cardName'];

    $title = $cardName . ' - ' . $set['name'];
    $desc = get_card_description($card, $cardName);
    $image = $card['image'] ?? $card['thumb'] ?? $defaultImage;

    render_og($host, $parsedPath, $title, $desc, $image, $card);
    exit;
  }

  render_og($host, $parsedPath, 'Card Details', 'View card details on Gaichu TCG Database.', $defaultImage);
  exit;
}

serve_index();

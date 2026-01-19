<?php
/**
 * SEO handler for card detail pages.
 * Serves proper Open Graph meta tags to social media bots and search engine crawlers.
 *
 * URL pattern: /cards/{series}/sets/{set}/card/{sortBy}_{cardSlug}
 * Example: /cards/wm/sets/set1/card/1_skipper
 */

$ua = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
$isBot = (bool) preg_match(
  '/facebookexternalhit|Twitterbot|Discordbot|Slackbot|LinkedInBot|WhatsApp|TelegramBot|Applebot|Google.*snippet|bingbot|SkypeUriPreview|redditbot|Meta-ExternalAgent|Googlebot/i',
  $ua
);

$debug = isset($_GET['dbg']);

// Parse URL to extract series, set, and card info
$path = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';
$parsedPath = parse_url($path, PHP_URL_PATH);

// Match pattern: /cards/{series}/sets/{set}/card/{sortBy_cardName}
$matches = [];
$pattern = '~^/cards/([^/]+)/sets/([^/]+)/card/([^/?#]+)~';
if (!preg_match($pattern, $parsedPath, $matches)) {
  // Not a card detail URL, serve index.html
  serve_index();
  exit;
}

$seriesShortName = urldecode($matches[1]);
$setShortName = urldecode($matches[2]);
$sortByAndCardName = urldecode($matches[3]);

// Parse sortBy_cardName format (e.g., "1_skipper" or "99.3_sunlight")
$cardMatches = [];
if (preg_match('/^(\d+(?:\.\d+)?)_(.+)$/', $sortByAndCardName, $cardMatches)) {
  $sortBy = floatval($cardMatches[1]);
  $cardSlug = $cardMatches[2];
} else {
  $sortBy = null;
  $cardSlug = $sortByAndCardName;
}

$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'gaichu.com';
$cdnBase = 'https://gaichu.b-cdn.net';

/**
 * Load card data from JSON files
 */
function load_card_data($seriesShortName, $setShortName, $sortBy, $cardSlug) {
  global $cdnBase;

  $baseDir = dirname(__DIR__);

  // Load sets.json to find the set
  $setsPath = $baseDir . '/data/sets.json';
  if (!file_exists($setsPath)) return null;

  $sets = json_decode(file_get_contents($setsPath), true);
  if (!$sets) return null;

  $targetSet = null;
  foreach ($sets as $set) {
    if ($set['series_short_name'] === $seriesShortName && $set['short_name'] === $setShortName) {
      $targetSet = $set;
      break;
    }
  }
  if (!$targetSet) return null;

  // Load cards.json for this series
  $cardsPath = $baseDir . '/data/' . $seriesShortName . '/cards.json';
  if (!file_exists($cardsPath)) return null;

  $cards = json_decode(file_get_contents($cardsPath), true);
  if (!$cards) return null;

  // Find the card by sort_by and/or slug match
  foreach ($cards as $card) {
    // Check if card belongs to this set
    if (!in_array($targetSet['id'], $card['set_ids'] ?? [])) continue;

    // Match by sortBy if provided
    if ($sortBy !== null && floatval($card['sort_by']) != $sortBy) continue;

    // Get card name
    $cardName = is_array($card['name'])
      ? ($card['name']['en'] ?? reset($card['name']) ?? '')
      : ($card['name'] ?? '');

    // Match slug
    $nameSlug = slugify($cardName);
    if ($nameSlug === $cardSlug || $sortBy !== null) {
      return [
        'card' => $card,
        'set' => $targetSet,
        'cardName' => $cardName,
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
  // Build a description from card data
  $parts = [];

  // Add parody info if available
  if (!empty($card['parody'])) {
    $parts[] = "A parody of " . $card['parody'];
  }

  // Add rarity
  if (!empty($card['rarity'])) {
    $parts[] = $card['rarity'] . " card";
  }

  // Add HP if available
  if (!empty($card['hp'])) {
    $parts[] = "HP: " . $card['hp'];
  }

  // Add description
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
  $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
             ((isset($_SERVER['SERVER_PORT']) ? $_SERVER['SERVER_PORT'] : '') == 443);
  $scheme = $isHttps ? 'https' : 'http';
  $url = $scheme . '://' . $host . $path;

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

  // Structured data for cards
  if ($card) {
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
      'category' => 'Trading Card'
    ];
    echo '<script type="application/ld+json">' . json_encode($jsonLd, JSON_UNESCAPED_SLASHES) . "</script>\n";
  }

  echo "<meta http-equiv=\"refresh\" content=\"0; url={$url}\" />\n";
  echo "<style>body{font:14px system-ui, sans-serif;padding:24px;color:#ddd;background:#000}</style>\n";
  echo "</head><body>Redirecting to <a href=\"{$url}\">{$safeTitle}</a>...</body></html>";
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

// Debug mode
if ($debug) {
  header('Content-Type: text/plain; charset=utf-8');
  echo "UA: $ua\n";
  echo "HOST: $host\n";
  echo "PATH: $path\n";
  echo "SERIES: $seriesShortName\n";
  echo "SET: $setShortName\n";
  echo "SORT_BY: $sortBy\n";
  echo "CARD_SLUG: $cardSlug\n";
  echo "IS_BOT: " . ($isBot ? 'true' : 'false') . "\n\n";

  $data = load_card_data($seriesShortName, $setShortName, $sortBy, $cardSlug);
  echo "CARD DATA: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
  exit;
}

// Serve meta tags for bots
if ($isBot) {
  $data = load_card_data($seriesShortName, $setShortName, $sortBy, $cardSlug);

  if ($data) {
    $card = $data['card'];
    $set = $data['set'];
    $cardName = $data['cardName'];

    $title = $cardName . ' - ' . $set['name'];
    $desc = get_card_description($card, $cardName);
    $image = $card['image'] ?? $card['thumb'] ?? 'https://gaichu.b-cdn.net/assets/default.png?v=3';

    render_og($host, $parsedPath, $title, $desc, $image, $card);
    exit;
  }

  // Fallback for unknown cards
  render_og(
    $host,
    $parsedPath,
    'Card Details',
    'View card details on Gaichu TCG Database.',
    'https://gaichu.b-cdn.net/assets/default.png?v=3'
  );
  exit;
}

// For regular users, serve the React app
serve_index();

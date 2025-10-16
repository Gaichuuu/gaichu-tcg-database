<?php
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
$isBot = (bool) preg_match(
  '/facebookexternalhit|Twitterbot|Discordbot|Slackbot|LinkedInBot|WhatsApp|TelegramBot|Applebot|Google.*snippet|bingbot|SkypeUriPreview|redditbot|Meta-ExternalAgent/i',
  $ua
);

$path = $_SERVER['REQUEST_URI'] ?? '';
$slug = (preg_match('#^/news/([^/?#]+)#', $path, $m)) ? urldecode($m[1]) : '';

$host = $_SERVER['HTTP_HOST'] ?? '';
$projectId = (stripos($host, 'stage') !== false || stripos($host, 'dev') !== false)
  ? 'gaichu-stage'
  : 'gaichu-fe55f';

function fetch_news($projectId, $slug) {
  if (!$slug) return null;
  $url = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents/news/" . rawurlencode($slug);

  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Accept: application/json'],
    CURLOPT_TIMEOUT => 4,
  ]);
  $res = curl_exec($ch);
  $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $cerr = curl_error($ch);
  curl_close($ch);

  if ($status !== 200 || !$res) {
    return null;
  }

  $json = json_decode($res, true);
  if (!isset($json['fields'])) return null;
  $f = $json['fields'];

  $str = fn($k) => $f[$k]['stringValue'] ?? '';
  $num = function($k) use ($f) {
    if (isset($f[$k]['integerValue'])) return (int)$f[$k]['integerValue'];
    if (isset($f[$k]['doubleValue'])) return (float)$f[$k]['doubleValue'];
    return 0;
  };

  return [
    'title' => $str('title'),
    'excerpt' => $str('excerpt'),
    'hero_url' => $str('hero_url'),
    'slug' => $slug,
    'created_at' => $num('created_at'),
  ];
}

function render_og($host, $slug, $title, $desc, $image) {
  $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['SERVER_PORT'] ?? '') == 443);
  $scheme = $isHttps ? 'https' : 'http';
  $url = "{$scheme}://{$host}/news/" . rawurlencode($slug);

  $safeTitle = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
  $safeDesc = htmlspecialchars($desc, ENT_QUOTES, 'UTF-8');
  $safeImg = htmlspecialchars($image, ENT_QUOTES, 'UTF-8');

  header('Content-Type: text/html; charset=utf-8');
  header('Cache-Control: public, max-age=600, s-maxage=600');

  echo "<!doctype html>\n<html lang=\"en\"><head>\n";
  echo "<meta charset=\"utf-8\" />\n";
  echo "<title>{$safeTitle}</title>\n";
  echo "<link rel=\"canonical\" href=\"{$url}\" />\n";
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
  echo "<meta http-equiv=\"refresh\" content=\"0; url={$url}\" />\n";
  echo "<style>body{font:14px system-ui, sans-serif;padding:24px;color:#ddd;background:#000}</style>\n";
  echo "</head><body>Redirecting to <a href=\"{$url}\">{$safeTitle}</a>…</body></html>";
}

if ($isBot) {
  $doc = fetch_news($projectId, $slug);

  $title = (is_array($doc) && !empty($doc['title'])) ? $doc['title'] : 'Gaichu';
  $desc = (is_array($doc) && !empty($doc['excerpt'])) ? $doc['excerpt'] : 'Your #2 source for parody and bootleg card games.';
  $img = (is_array($doc) && !empty($doc['hero_url'])) ? $doc['hero_url'] : 'https://gaichu.b-cdn.net/assets/default.jpg';

  render_og($host, $slug ?: 'news', $title, $desc, $img);
  exit;
}

$indexPath = dirname(__DIR__) . '/index.html'; 
if (is_file($indexPath)) {
  header('Content-Type: text/html; charset=utf-8');
  readfile($indexPath);
  exit;
}

http_response_code(404);
echo 'Not found';
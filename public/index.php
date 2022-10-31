<?php

require __DIR__ . '/../config.php';

$uri = strtr($_SERVER['REQUEST_URI'], [PUBLIC_PATH => '']);
$patternForecast = '#\/forecast\/(-?[0-9]+\.[0-9]+),(-?[0-9]+\.[0-9]+)#';
$included = true;

$pattern1 = '#\/(token)(\/([a-z]+))?#';

if (preg_match($patternForecast, $uri, $matches)) {
  $lat = $matches[1];
  $lon = $matches[2];
  require(PATH . "/includes/forecast.php");
} elseif (preg_match($pattern1, $uri, $matches)) {
  require(PATH . "/includes/{$matches[1]}.php");
} elseif ($uri == '/') {
  require('app.html');
} else {
  print_r($_SERVER);
  echo $uri;exit;
  call404();
}

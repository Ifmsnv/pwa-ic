<?php

/** @var float $lat */
/** @var float $lon */

if (!isset($included)) {
  require __DIR__ . '/../../config.php';
  call404();
}

$ini = loadIni();

$uri = strtr($ini['OPENWEATHER_API_URI'], [
  'API_ENDPOINT' => $ini['OPENWEATHER_API_ENDPOINT'],
  'API_KEY' => $ini['OPENWEATHER_API_KEY'],
  'LAT' => $lat,
  'LON' => $lon,
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $uri);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);

if ($response === FALSE) {
  $json = [
    'cod' => 500,
    'message' => curl_error($ch)
  ];
} else {
  $json = (array)json_decode($response);
}

curl_close($ch);

// header('Access-Control-Allow-Origin: *');
header("Content-type: application/json; charset=utf-8", true, $json['cod']);
echo json_encode($json);

<?php

session_start();

define('PATH', __DIR__);
define('PUBLIC_PATH', '/openweather');

function loadIni()
{
  return parse_ini_file(PATH . '/.env');
}

function call404()
{
  header("HTTP/1.0 404 Not Found");
  require(PATH . "/public/404.html");
  exit;
}

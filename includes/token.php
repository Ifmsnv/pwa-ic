<?php

/** @var array $matches */
/** @var boolean $included */

function detectRequestBody()
{
  $rawInput = fopen('php://input', 'r');
  $tempStream = fopen('php://temp', 'r+');
  stream_copy_to_stream($rawInput, $tempStream);
  rewind($tempStream);

  return $tempStream;
}

if (!isset($included)) {
  require __DIR__ . '/../../config.php';
  call404();
}

class IncludedToken
{

  /**
   * @var string
   */
  private $action;

  public function __construct()
  {
    $this->filedb = PATH . "/storage/tokens.json";
  }

  public function parseAction($matches)
  {
    $this->action = $matches[3];
  }

  public function run($matches)
  {

    switch ($this->action) {
      case '':
      case 'index':
        $this->listAction();
        break;
      case 'auth':
        $this->authAction();
        break;
      case 'logout':
        $this->logoutAction();
        break;
      case 'add':
        $this->addAction();
        break;
      case 'send':
        $this->sendAction();
        break;
      default:
        call404();
    }

  }

  private function addAction()
  {
    $body = stream_get_contents(detectRequestBody());
    $body = json_decode($body);

    $this->saveToken($body->token);

    $this->response($body);
  }

  private function response($data)
  {
    header('Access-Control-Allow-Origin: *');
    header("Content-type: application/json; charset=utf-8", true, 200);
    echo json_encode($data);
    exit;
  }

  private function saveToken($token)
  {
    if (!$token) {
      return;
    }
    $this->testFiledb();

    $tokens = $this->getTokens();

    if (!in_array($token, $tokens)) {
      $tokens[] = $token;

      $fopen = fopen($this->filedb, 'w+');
      fwrite($fopen, json_encode($tokens));
      fclose($fopen);
    }
  }

  private function testFiledb()
  {
    $dirname = dirname($this->filedb);
    if (!is_dir($dirname)) {
      mkdir($dirname);
    }
  }

  private function backupFiledb()
  {
    copy($this->filedb, $this->filedb . "-" . date("Ymd-His") . ".bck");
  }

  private function listAction()
  {
    $this->testAuth();

    $tokens = $this->getTokens();

    require PATH . "/includes/token-list.php";
    exit;
  }

  private function testAuth()
  {
    if (!$this->tokenIsAuth()) {
      $this->authAction();
      exit;
    }
  }

  private function authAction()
  {
    if ($_POST) {
      $ini = loadIni();
      if (!isset($ini['TOKEN_AUTH_ID'])) {
        die("Set TOKEN_AUTH_ID in .env file");
      }
      if ((isset($_POST['authId']))
        && ($ini['TOKEN_AUTH_ID'] == $_POST['authId'])) {
        $this->tokenAuth();

        header('location: ' . PUBLIC_PATH . '/token');
        exit;
      } else {
        die("Invalid Auth ID");
      }
    }

    require PATH . "/includes/token-login.php";
    exit;
  }

  private function tokenIsAuth()
  {
    return (isset($_SESSION['token_auth'])) && ($_SESSION['token_auth'] === true);
  }

  private function tokenAuth()
  {
    $_SESSION['token_auth'] = true;
  }

  private function logoutAction()
  {
    unset($_SESSION['token_auth']);
    header('location: ' . PUBLIC_PATH . '/token');
    exit;
  }

  private function sendAction()
  {
    $tokens = $this->getTokens();

    $sendTokens = [];
    foreach ($_POST['tokenid'] as $tokenId) {
      $sendTokens[] = $tokens[$tokenId];
    }

    $this->sendPush($_POST['title'], $_POST['body'], $sendTokens);

    /*$url = "https://fcm.googleapis.com/fcm/send";
    $data = [
      // "to" => "#", // one token
      "registration_ids" => $sendTokens, // multiple tokens
      // "collapse_key" => "type_a",
      //"notification" => [
      //  "body" => "Body of Your Notification",
      //  "title" => "Title of Your Notification"
      //],
      "data" => [
        "body" => $_POST['body'],
        "title" => $_POST['title'],
        //"key_1" => "Value for key_1",
        //"key_2" => "Value for key_2"
      ]
    ];
    $dataQuery = json_encode($data);
    $dataLength = strlen($dataQuery);

    $ini = loadIni();
    $opts = array('http' =>
      array(
        'method' => 'POST',
        'header' => "Content-type: application/json; charset=utf-8\r\n"
          . "Connection: close\r\n"
          . "Content-Length: $dataLength\r\n"
          . "Authorization: Bearer " . $ini['FCM_SERVER_KEY'] . ""
      ,
        'content' => $dataQuery,
        'timeout' => 60
      )
    );

    $context = stream_context_create($opts);
    $result = file_get_contents($url, false, $context, -1, 40000);

    echo "<h2>file_get_contents context</h2><pre>", var_export($opts, true), '</pre>';
    echo "<h2>Request JSON</h2><pre>", json_encode($data, JSON_PRETTY_PRINT), '</pre>';
    echo "<h2>Response</h2><pre>", var_export($result, true), '</pre>';
    echo "<h2>Response Header</h2><pre>", var_export($http_response_header, true), '</pre>';*/
  }

  private function getTokens()
  {
    if ($content = file_get_contents($this->filedb)) {
      $content = json_decode($content);
      if (!is_array($content)) {
        $this->backupFiledb();
      }
    }

    if (!$content) {
      $content = [];
    }
    return $content;
  }

  private function sendPush($title, $body, array $sendTokens)
  {
    $ini = loadIni();

    $url = "https://fcm.googleapis.com/fcm/send";
    $data = [
      // "to" => "#", // one token
      "registration_ids" => $sendTokens, // multiple tokens
      // "collapse_key" => "type_a",
      //"notification" => [
      //  "body" => "Body of Your Notification",
      //  "title" => "Title of Your Notification"
      //],
      "data" => [
        "body" => $_POST['body'],
        "title" => $_POST['title'],
        //"key_1" => "Value for key_1",
        //"key_2" => "Value for key_2"
      ]
    ];

    $curl = curl_init();

    curl_setopt_array($curl, array(
      CURLOPT_URL => $url,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_VERBOSE => true,
      CURLOPT_HEADER => true,
      CURLOPT_ENCODING => "",
      CURLOPT_TIMEOUT => 60,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => "POST",
      CURLOPT_POSTFIELDS => json_encode($data),
      CURLOPT_HTTPHEADER => array(
        "Authorization: Bearer " . $ini['FCM_SERVER_KEY'],
        "Content-Type: application/json",
      ),
    ));

    $response = curl_exec($curl);
    $err = curl_error($curl);

    $header_size = curl_getinfo($curl, CURLINFO_HEADER_SIZE);
    $header = substr($response, 0, $header_size);
    $body = substr($response, $header_size);

    curl_close($curl);

    if ($err) {
      echo "cURL Error #:" . $err;
      exit;
    }

    $bodyJson = json_decode($body, JSON_PRETTY_PRINT);

    echo "<h2>Request JSON</h2><pre>", json_encode($data, JSON_PRETTY_PRINT), '</pre>';
    echo "<h2>Response</h2><pre>", var_export($bodyJson ? $bodyJson : $body, true), '</pre>';
    echo "<h2>Response Header</h2><pre>", var_export($header, true), '</pre>';
  }
}

$includedToken = new IncludedToken();
$includedToken->parseAction($matches);
$includedToken->run($matches);

<?php
/** @var array $tokens */
?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">

  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Token list</title>

</head>

<body>
<h1>Enviar push</h1>

<form action="./send" method="post">

  <p>Título: <input type="text" name="title"></p>
  <p>Corpo: <input type="text" name="body"></p>
  <p><input type="submit" name="submit"></p>

  <table border="1">
    <thead>
    <tr>
      <th>#</th>
      <th>token</th>
    </tr>
    </thead>
    <tbody>
    <?php
    foreach ($tokens as $k => $item) { ?>
      <tr>
        <th><input type="checkbox" name="tokenid[]" value="<?= $k ?>"></th>
        <td><?= $item ?></td>
      </tr>
      <?php
    }
    ?>
    </tbody>
  </table>
</form>
</body>

</html>

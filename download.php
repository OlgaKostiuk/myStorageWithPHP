<?php

$storageLocation = '.';

if (isset($_GET['path']) && isset($_GET['name'])) {

    $fileLocation = $GLOBALS["storageLocation"] . DIRECTORY_SEPARATOR . $_GET['path'] . DIRECTORY_SEPARATOR . $_GET['name'];
    if (file_exists($fileLocation)) {

        $type = mime_content_type($fileLocation);

        header($_SERVER["SERVER_PROTOCOL"] . " 200 OK");
        header("Cache-Control: public"); // needed for internet explorer
        header("Content-Type: " . $type);
        header("Content-Transfer-Encoding: Binary");
        header("Content-Length:" . filesize($fileLocation));
        header("Content-Disposition: attachment; filename=\"" . basename($fileLocation) . "\"");
        readfile($fileLocation);
        die();
    } else {
        die("Error: File not found.");
    }
}
else{
    die(header("location:index.php"));
}

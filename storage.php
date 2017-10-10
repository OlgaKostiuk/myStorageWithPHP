<?php

require_once "Directory.php";
require_once "File.php";

use FileStorage\Directory;
use FileStorage\File;

$storageLocation = '.';

function uploadFile($file, $path)
{
    $absDirPath = $GLOBALS["storageLocation"] . DIRECTORY_SEPARATOR . $path;
    $absFilePath = $absDirPath . DIRECTORY_SEPARATOR . $file['name'];
    if(!file_exists($absFilePath)){
        if($file['error'] == UPLOAD_ERR_OK)
        {
            if(@move_uploaded_file($file['tmp_name'], $absFilePath)){
                $data['executed'] = true;
                $data['result'] = buildFile($path, $file['name']);
            }
            else{
                $data['executed'] = false;
                $error = error_get_last();
                $data['result'] = "File was not saved. Reason: " . str_replace("move_uploaded_file(): ", '', $error['message']);
            }
        }
        else
        {
            $data['executed'] = false;
            $data['result'] = "Upload failed with error code " . $file['error'];
        }
    }
    else{
        $data['executed'] = false;
        $data['result'] = "Uploaded file already exists. Rename it or delete the existing file at first";
    }
    echo json_encode($data);
}

if (isset($_POST['action']) && !empty($_POST['action'])) {
    $action = $_POST['action'];
    switch ($action) {
        case 'upload':
            if (isset($_POST['path']) && !empty($_POST['path'])
                && isset($_FILES['file']) && !empty($_FILES['file'])
            ) {
                $file = $_FILES['file'];
                $path = $_POST['path'];
                uploadFile($file, $path);
            }
            break;
    }
}

$rest_json = file_get_contents("php://input");
$_POST = json_decode($rest_json, true);

function buildFile($path, $name)
{
    $fullFilePath = $GLOBALS["storageLocation"] . DIRECTORY_SEPARATOR . $path . DIRECTORY_SEPARATOR . $name;
//need check fileExists
    $size = filesize($fullFilePath);
    $dataModified = filemtime($fullFilePath);
    $resultFile = new File($name, $size, $dataModified);
    return $resultFile;
}

function buildDirectory($path, $name)
{
    $fullDirPath = $path . DIRECTORY_SEPARATOR . $name;
    $absPath = $GLOBALS["storageLocation"] . DIRECTORY_SEPARATOR . $fullDirPath;
//need check dirExists
    $dataModified = filemtime($absPath);
    $resultDir = new Directory($name, $dataModified);

    $dir = scandir($absPath);
    foreach ($dir as $k => $v) {
        if (!in_array($v, array(".", ".."))) {
            if (is_dir($absPath . DIRECTORY_SEPARATOR . $v)) {
                $resultDir->pushSubDir(buildDirectory($absPath, $v));
            } else {
                $file = buildFile($fullDirPath, $v);
                $resultDir->pushFiles($file);
            }
        }
    }
    return $resultDir;
}

function load()
{
    $storageName = "Storage";
    $storagePath = '';
    echo json_encode(buildDirectory($storagePath, $storageName));
}

function createNewFolder($newFolderParams)
{
    $parentDirPath = $newFolderParams['newFolderParentPath'];
    $newFolderName = $newFolderParams['newFolderName'];
    $newFolderFullPath = $GLOBALS["storageLocation"] . DIRECTORY_SEPARATOR . $parentDirPath . DIRECTORY_SEPARATOR . $newFolderName;
    if (@mkdir($newFolderFullPath)) {
        $data['executed'] = true;
        $data['result'] = buildDirectory($parentDirPath, $newFolderName);
    } else {
        $data['executed'] = false;
        $error = error_get_last();
        $data['result'] = "Folder was not created. Reason: " . str_replace("mkdir(): ", '', $error['message']);
    }
    echo json_encode($data);
}

function renameItem($itemParams)
{
    $parentPath = $itemParams["parentPath"];
    $newName = $itemParams["newName"];
    $oldName = $itemParams["oldName"];
    $oldFullPath = $GLOBALS["storageLocation"] . DIRECTORY_SEPARATOR . $parentPath . DIRECTORY_SEPARATOR . $oldName;
    $newFullPath = $GLOBALS["storageLocation"] . DIRECTORY_SEPARATOR . $parentPath . DIRECTORY_SEPARATOR . $newName;
    if (file_exists($newFullPath)) {
        $data['executed'] = false;
        $data['result'] = "Item was not renamed. Reason: Another item in current folder has this name";
    } else {
        if (@rename($oldFullPath, $newFullPath)) {
            $data['executed'] = true;
            if (is_dir($newFullPath)) {
                $data['result'] = buildDirectory($parentPath, $newName);
            } else {
                $data['result'] = buildFile($parentPath, $newName);
            }
        } else {
            $data['executed'] = false;
            $error = error_get_last();
            $data['result'] = "Item was not renamed. Reason: " . str_replace("rename(): ", '', $error['message']);
        }
    }
    echo json_encode($data);
}

function deleteItem($itemParams)
{
    $parentPath = $itemParams["parentPath"];
    $name = $itemParams["name"];
    $fullPath = $parentPath . DIRECTORY_SEPARATOR . $name;
    $absPath = $GLOBALS["storageLocation"] . DIRECTORY_SEPARATOR . $fullPath;
    if (file_exists($absPath)) {
        if (is_dir($absPath)) {
            $data = deleteDir($fullPath);
        } else {
            $data = deleteFile($fullPath);
        }
    } else {
        $data['executed'] = false;
        $data['result'] = "Item does not exist already";
    }
    echo json_encode($data);
}

function deleteFile($fullFilePath)
{
    $absPath = $GLOBALS["storageLocation"] . DIRECTORY_SEPARATOR . $fullFilePath;
    if (@unlink($absPath)) {
        $data['executed'] = true;
        $data['result'] = "File was deleted";
    } else {
        $data['executed'] = false;
        $error = error_get_last();
        $data['result'] = "File was not deleted. Reason: " . str_replace("unlink(): ", '', $error['message']);
    }
    return $data;
}

function deleteDir($fullDirPath)
{
    $absPath = $GLOBALS["storageLocation"] . DIRECTORY_SEPARATOR . $fullDirPath;
    $dir = scandir($absPath);
    if (count($dir) === 2) {
        if (@rmdir($absPath)) {
            $data['executed'] = true;
            $data['result'] = "Directory was deleted";
            return $data;
        } else {
            $data['executed'] = false;
            $error = error_get_last();
            $data['result'] = "Directory was not deleted. Reason: " . str_replace("rmdir(): ", '', $error['message']);
            return $data;
        }
    } else {
        foreach ($dir as $k => $v) {
            if (!in_array($v, array(".", ".."))) {
                if (is_dir($absPath . DIRECTORY_SEPARATOR . $v)) {
                    deleteDir($fullDirPath . DIRECTORY_SEPARATOR . $v);
                } else {
                    deleteFile($fullDirPath . DIRECTORY_SEPARATOR . $v);
                }
            }
        }
        return deleteDir($fullDirPath);
    }
}

if (isset($_POST['action']) && !empty($_POST['action'])) {
    $action = $_POST['action'];
    switch ($action) {
        case 'load' :
            load();
            break;
        case 'createNewFolder':
            createNewFolder($_POST['data']);
            break;
        case 'rename':
            renameItem($_POST['data']);
            break;
        case 'delete':
            deleteItem($_POST['data']);
            break;
    }
}

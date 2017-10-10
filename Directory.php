<?php
namespace FileStorage;

require_once "File.php";

class Directory
{
    public $name;
    public $subDirs;
    public $files;
    public $dateModified;

    function __construct(string $name, int $dateModified)
    {
        $this->name = $name;
        $this->subDirs = array();
        $this->files = array();
        $this->dateModified = date("F d Y H:i:s", $dateModified);
    }

    function pushSubDir(Directory $directory)
    {
        $this->subDirs[] = $directory;
    }

    function pushFiles(File $file)
    {
        $this->files[] = $file;
    }

}
<?php
namespace FileStorage;
class File
{
    public $name;
    public $size;
    public $dateModified;

    function __construct(string $name, int $size, int $dateModified)
    {
        $this->name = $name;
        $this->size = $size;
        $this->dateModified = date("F d Y H:i:s", $dateModified);
    }
}
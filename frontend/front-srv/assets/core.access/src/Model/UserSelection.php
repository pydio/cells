<?php
/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */
namespace Pydio\Access\Core\Model;



use Pydio\Core\Model\Context;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Model\RepositoryInterface;
use Pydio\Core\Model\UserInterface;

use Pydio\Core\Utils\Vars\InputFilter;
use Pydio\Core\Utils\Vars\PathUtils;


defined('PYDIO_EXEC') or die( 'Access not allowed');
/**
 * Abstraction of a user selection passed via http parameters.
 * @package Pydio
 * @subpackage Core
 */
class UserSelection
{
    public $files;
    /**
     * @var Node[]
     */
    private $nodes;
    public $varPrefix = "file";
    public $dirPrefix = "dir";
    public $isUnique = true;
    public $dir;

    public $inZip = false;
    public $zipFile;
    public $localZipPath;

    /**
     * @var Repository
     */
    private $repository;

    /**
     * @var ContextInterface
     */
    private $context;
    
    

    /**
     * @param ContextInterface $ctx
     * @param array $parsedBody
     * @return UserSelection
     */
    public static function fromContext(ContextInterface $ctx, $parsedBody){
        $selection = new UserSelection($ctx->getRepository(), $parsedBody, $ctx->getUser());
        return $selection;
    }

    /**
     * Construction selector
     * @param RepositoryInterface|null $repository
     * @param array|null $httpVars
     * @param UserInterface $user
     */
    public function __construct($repository = null, $httpVars = null, $user = null)
    {
        $this->files = array();
        $this->context = Context::contextWithObjects($user, $repository);
        if(iSset($httpVars)){
            $this->initFromHttpVars($httpVars);
        }
    }
    /**
     * Init the selection from the query vars
     * @param array $passedArray
     * @return void
     */
    public function initFromHttpVars($passedArray=null)
    {
        if ($passedArray != null) {
            if (isSet($passedArray["selection_nodes"]) && is_array($passedArray["selection_nodes"])) {
                $this->initFromNodes($passedArray["selection_nodes"]);
            } else {
                $this->initFromArray($passedArray);
            }
        } else {
            $this->initFromArray($_GET);
            $this->initFromArray($_POST);
        }
    }

    /**
     * @param Node[] $nodes
     */
    public function initFromNodes($nodes)
    {
        $this->nodes = $nodes;
        $this->isUnique = (count($nodes) == 1);
        $this->dir = '/';
        $this->files = array();
        $this->inZip = false;
        foreach ($nodes as $n) {
            $this->addFile($n->getPath());
        }

    }

    /**
     * @param string $path
     * @return Node
     */
    public function nodeForPath($path){
        $n = new Node(rtrim($this->currentBaseUrl(), "/").$path);
        if($this->context->hasUser()){
            $n->setUserId($this->context->getUser()->getId());
        }
        return $n;
    }

    /**
     * @return ContextInterface
     */
    public function getContext()
    {
        return $this->context;
    }

    /**
     * @param ContextInterface $context
     */
    public function setContext($context)
    {
        $this->context = $context;
    }



    /**
     *
     * Init from a simple array
     * @param $array
     */
    public function initFromArray($array)
    {
        if (!is_array($array)) {
            return ;
        }
        if (isSet($array[$this->varPrefix]) && $array[$this->varPrefix] != "") {
            $v = $array[$this->varPrefix];
            if(strpos($v, "base64encoded:") === 0){
                $v = base64_decode(array_pop(explode(':', $v, 2)));
            }
            $this->addFile(InputFilter::decodeSecureMagic($v));
            $this->isUnique = true;
            //return ;
        }
        if (isSet($array[$this->varPrefix."_0"])) {
            $index = 0;
            while (isSet($array[$this->varPrefix."_".$index])) {
                $v = $array[$this->varPrefix."_".$index];
                if(strpos($v, "base64encoded:") === 0){
                    $v = base64_decode(array_pop(explode(':', $v, 2)));
                }
                $this->addFile(InputFilter::decodeSecureMagic($v));
                $index ++;
            }
            $this->isUnique = false;
            if (count($this->files) == 1) {
                $this->isUnique = true;
            }
            //return ;
        }
        if (isSet($array["path"])){
            if(!is_array($array["path"])){
                $array["path"] = [$array["path"]];
            }
            foreach ($array["path"] as $p){
                $p = InputFilter::decodeSecureMagic($p);
                // First part must be the repository ID
                $p = "/".implode("/", array_slice(explode("/", trim($p, "/")), 1));
                $this->addFile($p);
            }
        }
        if (isSet($array["nodes"]) && is_array($array["nodes"])) {
            $this->files = array();
            foreach($array["nodes"] as $value){
                $this->addFile(InputFilter::decodeSecureMagic($value));
            }
            $this->isUnique = count($this->files) == 1;
        }
        if (isSet($array[$this->dirPrefix])) {
            $this->dir = InputFilter::securePath($array[$this->dirPrefix]);
            if ($test = $this->detectZip($this->dir)) {
                $this->inZip = true;
                $this->zipFile = $test[0];
                $this->localZipPath = $test[1];
            }
        } else if (!$this->isEmpty() && $this->isUnique()) {
            if ($test = $this->detectZip(PathUtils::forwardSlashDirname($this->files[0]))) {
                $this->inZip = true;
                $this->zipFile = $test[0];
                $this->localZipPath = $test[1];
            }
        }
    }

    /**
     * @param string $filePath
     */
    public function addFile($filePath){
        if(!in_array($filePath, $this->files)){
            $this->files[] = $filePath;
        }
    }

    /**
     * Does the selection have one or more items
     * @return bool
     */
    public function isUnique()
    {
        return (count($this->files) == 1);
    }
    /**
     * Are we currently inside a zip?
     * @return bool
     */
    public function inZip()
    {
        return $this->inZip;
    }
    /**
     * Returns UTF8 encoded path
     * @param bool $decode
     * @return String
     */
    public function getZipPath($decode = false)
    {
        if($decode) return InputFilter::decodeSecureMagic($this->zipFile);
        else return $this->zipFile;
    }

    /**
     * Returns UTF8 encoded path
     * @param bool $decode
     * @return String
     */
    public function getZipLocalPath($decode = false)
    {
        if($decode) return InputFilter::decodeSecureMagic($this->localZipPath);
        else return $this->localZipPath;
    }
    /**
     * Number of selected items
     * @return int
     */
    public function getCount()
    {
        return count($this->files);
    }
    /**
     * List of items selected
     * @return string[]
     */
    public function getFiles()
    {
        return $this->files;
    }
    /**
     * First item of the list
     * @return string
     */
    public function getUniqueFile()
    {
        return $this->files[0];
    }

    /**
     * @return Node
     * @throws \Exception
     */
    public function getUniqueNode()
    {
        if (isSet($this->nodes) && is_array($this->nodes)) {
            return $this->nodes[0];
        }
        $currentFile = $this->getUniqueFile();
        return new Node($this->currentBaseUrl().$currentFile);

    }

    /**
     * @return Node[]
     * @throws \Exception
     */
    public function buildNodes()
    {
        if (isSet($this->nodes)) {
            return $this->nodes;
        }
        $nodes = array();
        foreach ($this->files as $file) {
            $node = new Node($this->currentBaseUrl().$file);
            if($this->context->hasUser()){
                $node->setUserId($this->context->getUser()->getId());
            }
            $nodes[] = $node;
        }
        $this->nodes = $nodes;
        return $nodes;

    }

    /**
     * Find common base path for current selection
     * @return mixed
     */
    public function commonDirFromSelection(){
        $items = array_values($this->files);
        return PathUtils::commonPath($items);
    }

    /**
     * @return string
     * @throws \Exception
     */
    public function currentBaseUrl(){
        if(!$this->context->hasRepository()){
            throw new \Exception("UserSelection::currentBaseUrl: cannot build nodes URL without a proper repository");
        }
        $uId = $this->context->hasUser()?$this->context->getUser()->getId():"shared";
        return "pydio://".$uId."@".$this->context->getRepositoryId();
    }

    /**
     * Is this selection empty?
     * @return bool
     */
    public function isEmpty()
    {
        if (count($this->files) == 0) {
            return true;
        }
        return false;
    }
    /**
     * Detect if there is .zip somewhere in the path
     * @static
     * @param string $dirPath
     * @return array|bool
     */
    public static function detectZip($dirPath)
    {
        if (preg_match("/\.zip\//i", $dirPath) || preg_match("/\.zip$/i", $dirPath)) {
            $contExt = strrpos(strtolower($dirPath), ".zip");
            $zipPath = substr($dirPath, 0, $contExt+4);
            $localPath = substr($dirPath, $contExt+4);
            if($localPath == "") $localPath = "/";
            return array($zipPath, $localPath);
        }
        return false;
    }
    /**
     * Sets the selected items
     * @param array $files
     * @return void
     */
    public function setFiles($files)
    {
        $this->files = $files;
    }

    /**
     * @param $file
     */
    public function removeFile($file){
        $newFiles = array();
        foreach($this->files as $k => $f){
            if($f != $file) $newFiles[] = $file;
        }
        $this->files = $newFiles;
        if(isSet($this->nodes)){
            $newNodes = array();
            foreach($this->nodes as $l => $n){
                if($n->getPath() != $file) $newNodes[] = $n;
            }
            $this->nodes = $newNodes;
        }
    }
    
}

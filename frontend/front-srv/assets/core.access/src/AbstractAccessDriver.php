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
namespace Pydio\Access\Core;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use Pydio\Access\Core\Model\Node;
use Pydio\Access\Core\Model\Repository;
use Pydio\Access\Core\Model\UserSelection;
use Pydio\Access\Core\Model\NodesDiff;
use Pydio\Core\Exception\PydioException;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Controller\Controller;
use Pydio\Core\Services\LocaleService;

use Pydio\Core\Services\UsersService;
use Pydio\Core\Utils\Vars\InputFilter;
use Pydio\Core\Utils\Vars\PathUtils;
use Pydio\Core\Utils\Vars\StatHelper;

use Pydio\Core\PluginFramework\Plugin;
use Pydio\Core\Utils\Vars\VarsFilter;
use Pydio\Log\Core\Logger;
use Pydio\Tasks\Task;
use Pydio\Tasks\TaskService;

use Pydio\Core\Http\Response\SerializableResponseStream;
use Pydio\Core\Http\Message\UserMessage;
use Swagger\Client\ApiException;

defined('PYDIO_EXEC') or die( 'Access not allowed');

/**
 * @package AjaXplorer_Plugins
 * @subpackage Core
 * @class AbstractAccessDriver
 * Abstract representation of an action driver. Must be implemented.
 */
abstract class AbstractAccessDriver extends Plugin
{
    /**
    * @var Repository
    */
    public $repository;
    public $driverType = "access";

    /**
     * @param ContextInterface $ctx
     * @param array $options
     * @throws PydioException
     */
    public function init(ContextInterface $ctx, $options = array())
    {
        parent::init($ctx, $options);
        if(!$ctx->hasRepository()){
            throw new PydioException("Cannot instanciate an access plugin without a valid repository");
        }
        $this->repository = $ctx->getRepository();
        $this->detectStreamWrapper(true, $ctx);
        $this->initRepository($ctx);
    }

    /**
     * @param ContextInterface $ctx
     */
    abstract protected function initRepository(ContextInterface $ctx);


    /**
     * @param ServerRequestInterface $request
     * @throws \Exception
     */
    public function accessPreprocess(ServerRequestInterface &$request)
    {
        $actionName = $request->getAttribute("action");
        $ctx        = $request->getAttribute("ctx");
        $httpVars   = $request->getParsedBody();

        if ($actionName == "apply_check_hook") {
            if (!in_array($httpVars["hook_name"], array("before_create", "before_path_change", "before_change"))) {
                return;
            }
            $selection = UserSelection::fromContext($ctx, $httpVars);
            Controller::applyHook("node.".$httpVars["hook_name"], array($selection->getUniqueNode(), $httpVars["hook_arg"]));
        }
        if ($actionName == "ls") {
            // UPWARD COMPATIBILTY
            if (isSet($httpVars["options"])) {
                if($httpVars["options"] == "al") $httpVars["mode"] = "file_list";
                else if($httpVars["options"] == "a") $httpVars["mode"] = "search";
                else if($httpVars["options"] == "d") $httpVars["skipZip"] = "true";
                // skip "complete" mode that was in fact quite the same as standard tree listing (dz)
                $request = $request->withParsedBody($httpVars);
            }
        }
    }

    /**
     * @param $node Node
     * @return int
     * @throws \Exception
     */
    public function directoryUsage(Node $node){
        throw new \Exception("Current driver does not support recursive directory usage!");
    }

    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     * @throws PydioException
     * @throws \Exception
     */
    public function crossRepositoryCopy(ServerRequestInterface &$requestInterface, ResponseInterface &$responseInterface)
    {
        $httpVars   = $requestInterface->getParsedBody();
        $mess       = LocaleService::getMessages();

        $taskId     = $requestInterface->getAttribute("pydio-task-id");
        $ctx        = $requestInterface->getAttribute("ctx");

        $selection = UserSelection::fromContext($ctx, $httpVars);
        $files = $selection->getFiles();

        $crtUser = $ctx->getUser()->getId();
        $repositoryId = $this->repository->getId();
        $origStreamURL = "pydio://$crtUser@$repositoryId";
        $origNode = new Node($origStreamURL);
        MetaStreamWrapper::detectWrapperForNode($origNode, true);

        $destRepoId = $httpVars["dest_repository_id"];
        $destStreamURL = "pydio://$crtUser@$destRepoId";
        $destNode = new Node($destStreamURL);
        $destCtx = $ctx->withRepositoryId($destRepoId);
        MetaStreamWrapper::detectWrapperForNode($destNode, true);

        $srcRepoData= array(
            'base_url'      => $origStreamURL,
            'recycle'       => $this->repository->getContextOption($ctx, "RECYCLE_BIN")
        );
        $destRepoData=array(
            'base_url'      => $destStreamURL,
            'chmod'         => $this->repository->getContextOption($ctx, 'CHMOD')
        );

        $origNodesDiffs = new NodesDiff();
        $destNodesDiffs = new NodesDiff();
        $messages = array();
        $errorMessages = array();

        // Looping through selections
        foreach ($files as $file) {
            $destFile = rtrim(InputFilter::decodeSecureMagic($httpVars["dest"]), "/") ."/". PathUtils::forwardSlashBasename($file);
            $this->copyOrMoveFile(
                $destFile,
                $file, $errorMessages, $messages, isSet($httpVars["moving_files"]) ? true: false,
                $srcRepoData, $destRepoData, $taskId);

            if(isSet($httpVars["moving_files"])){
                $origNodesDiffs->remove($file);
            }
            $destNodesDiffs->add($destNode->createChildNode($destFile));
        }

        // Handling task details
        if(!empty($taskId)){
            if (count($errorMessages)) {
                TaskService::getInstance()->updateTaskStatus($taskId, Task::STATUS_FAILED, implode("\n", $errorMessages));
            }else{
                TaskService::getInstance()->updateTaskStatus($taskId, Task::STATUS_COMPLETE, "");
            }
        }

        // Catching potential errors
        if (!empty($errorMessages)) {
            throw new PydioException(join("\n", $errorMessages));
        }

        // Sending success response along with nodes diff for the context
        $body = new SerializableResponseStream();
        $body->addChunk(new UserMessage(join("\n", $messages)));
        $body->addChunk($origNodesDiffs);
        $responseInterface = $responseInterface->withBody($body);

    }

    /**
     * @param String $destFile url of destination file
     * @param String $srcFile url of source file
     * @param array $error accumulator for error messages
     * @param array $success accumulator for success messages
     * @param bool $move Whether to copy or move
     * @param array $srcRepoData Set of data concerning source repository: base_url, recycle option
     * @param array $destRepoData Set of data concerning destination repository: base_url, chmod option
     * @param string $taskId Optional task UUID to update during operation
     */
    protected function copyOrMoveFile($destFile, $srcFile, &$error, &$success, $move = false, $srcRepoData = array(), $destRepoData = array(), $taskId = null)
    {
        $srcUrlBase = $srcRepoData['base_url'];
        $srcRecycle = $srcRepoData['recycle'];
        $destUrlBase = $destRepoData['base_url'];

        $mess = LocaleService::getMessages();
        /*
        $bName = basename($srcFile);
        $localName = '';
        Controller::applyHook("dl.localname", array($srcFile, &$localName));
        if(!empty($localName)) $bName = $localName;
        */
        $destDir = PathUtils::forwardSlashDirname($destFile);
        $destFile = $destUrlBase.$destFile;
        $realSrcFile = $srcUrlBase.$srcFile;

        $srcNode = new Node($realSrcFile);
        if(!$srcNode->exists()){
            $error[] = $mess[100].$srcFile;
            return ;
        }

        if (strpos($destFile, rtrim($realSrcFile, "/") . "/") === 0) {
            $error[] = $mess[101];
            return;
        }

        if (dirname($realSrcFile) == dirname($destFile) && basename($realSrcFile) == basename($destFile)) {
            if ($move) {
                $error[] = $mess[101];
                return ;
            } else {
                $base = basename($srcFile);
                $ext = "";
                if (is_file($realSrcFile)) {
                    $dotPos = strrpos($base, ".");
                    if ($dotPos>-1) {
                        $radic = substr($base, 0, $dotPos);
                        $ext = substr($base, $dotPos);
                    }
                }
                // auto rename file
                $destDir = PathUtils::forwardSlashDirname($destFile);
                $destDirNode = new Node($destDir);
                $i = 1;
                $newName = $base;
                while ($destDirNode->createChildNode($newName)->exists()) {
                    $suffix = "-$i";
                    if(isSet($radic)) $newName = $radic . $suffix . $ext;
                    else $newName = $base.$suffix;
                    $i++;
                }
                $destFile = $destDir."/".$newName;
            }
        }

        $destNode = new Node($destFile);
        if (!$srcNode->isLeaf()) {
            $errors = array();
            $succFiles = array();
            if ($move) {
                $res = rename($realSrcFile, $destFile);
                if($res!==true){
                    $errors[] = "Error while renaming $realSrcFile to $destFile";
                }
            } else {
                $dirRes = $this->dircopy($realSrcFile, $destFile, $errors, $succFiles, false, true, $srcRepoData, $destRepoData, $taskId);
            }
            if (count($errors)) {
                return;
            } else {
                $destNode->setLeaf(false);
            }
        } else {
            if ($move) {
                if(MetaStreamWrapper::nodesUseSameWrappers($realSrcFile, $destFile)){
                    rename($realSrcFile, $destFile);
                }else{
                    if (copy($realSrcFile, $destFile)) {
                        // Now delete original (with recycling if needed)
                        $this->deldir($realSrcFile, $srcRepoData, false); // both file and dir
                    }
                }
            } else {
                try {
                    $this->filecopy($realSrcFile, $destFile);
                    $this->changeMode($destFile, $destRepoData);
                } catch (\Exception $e) {
                    $error[] = $e->getMessage();
                    if(!empty($taskId)) TaskService::getInstance()->updateTaskStatus($taskId, Task::STATUS_FAILED, $e->getMessage());
                    return ;
                }
            }
        }

        // Handling the recycle bin
        if ($move) {
            $messagePart = $mess[74]." ".$destDir;

            // Register as recycled if we've done a move to the relative recycle bin
            if (RecycleBinManager::recycleEnabled() && $destDir == RecycleBinManager::getRelativeRecycle()) {
                RecycleBinManager::fileToRecycle($srcFile);
                $messagePart = $mess[123]." ".$mess[122];
            }
            if (!$srcNode->isLeaf()) {
                $successMessage = $mess[117]." ". basename($srcFile)." ".$messagePart;
            } else {
                $successMessage = $mess[34]." ". basename($srcFile)." ".$messagePart;
            }
        } else {
            if (RecycleBinManager::recycleEnabled() && $destDir == "/".$srcRecycle) {
                RecycleBinManager::fileToRecycle($srcFile);
            }
            if (isSet($dirRes)) {
                $successMessage = $mess[117]." ".basename($destFile)." ".$mess[73]." ".$destDir." (".$dirRes." ".$mess[116].")";
            } else {
                $successMessage = $mess[34]." ". basename($destFile)." ".$mess[73]." ". $destDir;
            }
        }
        $success[] = $successMessage;

    }

    /**
     * @param String $srcFile url of source file
     * @param String $destFile url of destination file
     */
    protected function filecopy($srcFile, $destFile)
    {
        if (!MetaStreamWrapper::nodesUseSameWrappers($srcFile, $destFile)
            || MetaStreamWrapper::wrapperIsRemote($srcFile)
            || MetaStreamWrapper::wrapperIsRemote($destFile)) {
            $src = fopen($srcFile, "r");
            $dest = fopen($destFile, "w");
            if (is_resource($src) && is_resource($dest)) {
                while (!feof($src)) {
                    //stream_copy_to_stream($src, $dest, 4096);
                    $count = stream_copy_to_stream($src, $dest, 4096);
                    if ($count == 0) break;
                }
            }
            if(is_resource($dest)) fclose($dest);
            if(is_resource($src)) fclose($src);
        } else {
            copy($srcFile, $destFile);
        }
    }

    /**
     * @param String $srcdir Url of source file
     * @param String $dstdir Url of dest file
     * @param array $errors Array of errors
     * @param array $success Array of success
     * @param bool $verbose Boolean
     * @param bool $convertSrcFile Boolean
     * @param array $srcRepoData Set of data concerning source repository: base_url, recycle option
     * @param array $destRepoData Set of data concerning destination repository: base_url, chmod option
     * @param string $taskId Optional Task ID
     * @return int
     */
    protected function dircopy($srcdir, $dstdir, &$errors, &$success, $verbose = false, $convertSrcFile = true, $srcRepoData = array(), $destRepoData = array(), $taskId = null)
    {
        $num = 0;
        //$verbose = true;
        $recurse = array();
        if (!is_dir($dstdir)) {
            $dirMode = 0755;
            $chmodValue = $destRepoData["chmod"]; //$this->repository->getOption("CHMOD_VALUE");
            if (isSet($chmodValue) && $chmodValue != "") {
                $dirMode = octdec(ltrim($chmodValue, "0"));
                if ($dirMode & 0400) $dirMode |= 0100; // User is allowed to read, allow to list the directory
                if ($dirMode & 0040) $dirMode |= 0010; // Group is allowed to read, allow to list the directory
                if ($dirMode & 0004) $dirMode |= 0001; // Other are allowed to read, allow to list the directory
            }
            $old = umask(0);
            mkdir($dstdir, $dirMode);
            umask($old);
        }
        if ($curdir = opendir($srcdir)) {
            while (($file = readdir($curdir)) !== FALSE) {
                if ($file != '.' && $file != '..') {
                    $srcfile = $srcdir . "/" . $file;
                    $dstfile = $dstdir . "/" . $file;
                    if (is_file($srcfile)) {
                        if(is_file($dstfile)) $ow = filemtime($srcfile) - filemtime($dstfile); else $ow = 1;
                        if ($ow > 0) {
                            try {
                                if($convertSrcFile) $tmpPath = MetaStreamWrapper::getRealFSReference($srcfile);
                                else $tmpPath = $srcfile;
                                if($verbose) echo "Copying '$tmpPath' to '$dstfile'...";
                                if(!empty($taskId)){
                                    TaskService::getInstance()->updateTaskStatus($taskId, Task::STATUS_RUNNING, "Copying ".$srcfile);
                                }
                                copy($tmpPath, $dstfile);
                                $success[] = $srcfile;
                                $num ++;
                                $this->changeMode($dstfile, $destRepoData);
                            } catch (\Exception $e) {
                                $errors[] = $e->getMessage()." - ".$srcfile;
                            }
                        }else{
                            if($verbose) echo "Skipping file ".$srcfile.", already there.";
                            if(!empty($taskId)){
                                TaskService::getInstance()->updateTaskStatus($taskId, Task::STATUS_RUNNING, "Skipping file ".$srcfile.", already there.");
                            }
                        }
                    } else {
                        $recurse[] = array("src" => $srcfile, "dest"=> $dstfile);
                    }
                }
            }
            closedir($curdir);
            foreach ($recurse as $rec) {
                if($verbose && isSet($srcfile)) echo "Dircopy $srcfile";
                $num += $this->dircopy($rec["src"], $rec["dest"], $errors, $success, $verbose, $convertSrcFile, $srcRepoData, $destRepoData, $taskId);
            }
        }
        return $num;
    }

    /**
     * @param $filePath
     * @param $repoData
     */
    protected function changeMode($filePath, $repoData)
    {
        $chmodValue = $repoData["chmod"];
        if (isSet($chmodValue) && $chmodValue != "") {
            $chmodValue = octdec(ltrim($chmodValue, "0"));
            MetaStreamWrapper::changeMode($filePath, $chmodValue);
        }
    }

    /**
     * @param string $location
     * @param array $repoData
     * @param string $taskId
     * @throws \Exception
     */
    protected function deldir($location, $repoData, $isDir = true)
    {
        if ($isDir) {
            $all=opendir($location);
            while (($file=readdir($all)) !== FALSE) {
                $childNode = new Node($location."/".$file);
                try{
                    $childNode->loadNodeInfo();
                } catch (\Exception $e){
                    continue;
                }
                $childDir = !$childNode->isLeaf();
                if ($childDir && $file !=".." && $file!=".") {
                    $this->deldir("$location/$file", $repoData, true);
                    @rmdir("$location/$file");
                    unset($file);
                } elseif (!$childDir) {
                    @unlink("$location/$file");
                    unset($file);
                }
            }
            closedir($all);
            @rmdir($location);
        } else {
            $test = @unlink("$location");
            if(!$test) throw new \Exception("Cannot delete file ".$location);
        }
        if (isSet($repoData["recycle"]) && basename(dirname($location)) == $repoData["recycle"]) {
            // DELETING FROM RECYCLE
            RecycleBinManager::deleteFromRecycle($location);
        }
    }


    /**
     *
     * Try to reapply correct permissions
     * @param Node $node
     * @param array $stat
     * @param callable $remoteDetectionCallback
     * @var integer $mode
     */
    public static function fixPermissions(Node $node, &$stat, $remoteDetectionCallback = null)
    {
        $repoObject = $node->getRepository();
        $fixPermPolicy = $repoObject->getContextOption($node->getContext(), "FIX_PERMISSIONS");
        $loggedUser = $node->getUser();
        if ($loggedUser == null) {
            return;
        }
        $sessionKey = md5($repoObject->getId()."-".$loggedUser->getId()."-fixPermData");


        if (!isSet($_SESSION[$sessionKey])) {
            if ($fixPermPolicy == "detect_remote_user_id" && $remoteDetectionCallback != null) {
                list($uid, $gid) = call_user_func($remoteDetectionCallback, $node);
                if ($uid != null && $gid != null) {
                    $_SESSION[$sessionKey] = array("uid" => $uid, "gid" => $gid);
                }

            } else if (substr($fixPermPolicy, 0, strlen("file:")) == "file:") {
                $filePath = VarsFilter::filter(substr($fixPermPolicy, strlen("file:")), $node->getContext());
                if (file_exists($filePath)) {
                    // GET A GID/UID FROM FILE
                    $lines = file($filePath);
                    foreach ($lines as $line) {
                        $res = explode(":", $line);
                        if ($res[0] == $loggedUser->getId()) {
                            $uid = $res[1];
                            $gid = $res[2];
                            $_SESSION[$sessionKey] = array("uid" => $uid, "gid" => $gid);
                            break;
                        }
                    }
                }
            }
            // If not set, set an empty anyway
            if (!isSet($_SESSION[$sessionKey])) {
                $_SESSION[$sessionKey] = array(null, null);
            }

        } else {
            $data = $_SESSION[$sessionKey];
            if (!empty($data)) {
                if(isSet($data["uid"])) $uid = $data["uid"];
                if(isSet($data["gid"])) $gid = $data["gid"];
            }
        }

        $p = $stat["mode"];
        //$st = sprintf("%07o", ($p & 7777770));
        //Logger::debug("FIX PERM DATA ($fixPermPolicy, $st)".$p,sprintf("%o", ($p & 000777)));
        if ($p != NULL) {
            /*
                decoct returns a string, it's more convenient to manipulate as we know the structure
                of the octal form of stat["mode"]
                    - first two or three chars => file type (dir: 40, file: 100, symlink: 120)
                    - three remaining characters => file permissions (1st char: user, 2nd char: group, 3rd char: others)
            */

            $p = decoct($p);
            $lastInd = (intval($p[0]) == 4)? 4 : 5;
            $otherPerms = decbin(intval($p[$lastInd]));
            $actualPerms = $otherPerms;

            if ( ( isSet($uid) && $stat["uid"] == $uid ) || $fixPermPolicy == "user"  ) {
                Logger::debug(__CLASS__,__FUNCTION__,"upgrading abit to ubit");
                $userPerms = decbin(intval($p[$lastInd - 2]));
                $actualPerms |= $userPerms;
            } else if ( ( isSet($gid) && $stat["gid"] == $gid ) || $fixPermPolicy == "group"  ) {
                Logger::debug(__CLASS__,__FUNCTION__,"upgrading abit to gbit");
                $groupPerms = decbin(intval($p[$lastInd - 1]));
                $actualPerms |= $groupPerms;
            }
            $test = bindec($actualPerms);
            $p[$lastInd] = $test;

            $stat["mode"] = $stat[2] = octdec($p);
            //Logger::debug(__CLASS__,__FUNCTION__,"FIXED PERM DATA ($fixPermPolicy)",sprintf("%o", ($p & 000777)));
        }
    }

    /**
     * Test if userSelection is containing a hidden file, which should not be the case!
     * @param ContextInterface $ctx
     * @param array $files
     * @throws \Exception
     */
    public function filterUserSelectionToHidden(ContextInterface $ctx, $files)
    {
        $showHiddenFiles = $this->getContextualOption($ctx, "SHOW_HIDDEN_FILES");
        foreach ($files as $file) {
            $file = basename($file);
            if (StatHelper::isHidden($file) && !$showHiddenFiles) {
                throw new \Exception("$file Forbidden", 411);
            }
            if ($this->filterFile($ctx, $file) || $this->filterFolder($ctx, $file)) {
                throw new \Exception("$file Forbidden", 411);
            }
        }
    }

    /**
     * @param ContextInterface $ctx
     * @param $nodePath
     * @param $nodeName
     * @param $isLeaf
     * @param $lsOptions
     * @return bool
     */
    public function filterNodeName(ContextInterface $ctx, $nodePath, $nodeName, &$isLeaf, $lsOptions)
    {
        $showHiddenFiles = $this->getContextualOption($ctx, "SHOW_HIDDEN_FILES");
        if($isLeaf === ""){
            $n = new Node($nodePath."/".$nodeName);
            $isLeaf = (($n->exists() && $n->isLeaf()) || StatHelper::isBrowsableArchive($nodeName));
        }
        if (StatHelper::isHidden($nodeName) && !$showHiddenFiles) {
            return false;
        }
        $nodeType = "d";
        if ($isLeaf) {
            if(StatHelper::isBrowsableArchive($nodeName)) $nodeType = "z";
            else $nodeType = "f";
        }
        if(!$lsOptions[$nodeType]) return false;
        if ($nodeType == "d") {
            if(RecycleBinManager::recycleEnabled()
                && $nodePath."/".$nodeName == RecycleBinManager::getRecyclePath()){
                return false;
            }
            return !$this->filterFolder($ctx, $nodeName);
        } else {
            if($nodeName == "." || $nodeName == "..") return false;
            if(RecycleBinManager::recycleEnabled()
                && $nodePath == RecycleBinManager::getRecyclePath()
                && $nodeName == RecycleBinManager::getCacheFileName()){
                return false;
            }
            return !$this->filterFile($ctx, $nodeName);
        }
    }

    /**
     * @param ContextInterface $ctx
     * @param string $fileName
     * @param bool $hiddenTest
     * @return bool
     */
    public function filterFile(ContextInterface $ctx, $fileName, $hiddenTest = false)
    {
        $pathParts = pathinfo($fileName);
        if($hiddenTest){
            $showHiddenFiles = $this->getContextualOption($ctx, "SHOW_HIDDEN_FILES");
            if (StatHelper::isHidden($pathParts["basename"]) && !$showHiddenFiles) return true;
        }
        $hiddenFileNames = $this->getContextualOption($ctx, "HIDE_FILENAMES");
        $hiddenExtensions = $this->getContextualOption($ctx, "HIDE_EXTENSIONS");
        if (!empty($hiddenFileNames)) {
            if (!is_array($hiddenFileNames)) {
                $hiddenFileNames = explode(",",$hiddenFileNames);
            }
            foreach ($hiddenFileNames as $search) {
                if(strcasecmp($search, $pathParts["basename"]) == 0) return true;
            }
        }
        if (!empty($hiddenExtensions)) {
            if (!is_array($hiddenExtensions)) {
                $hiddenExtensions = explode(",",$hiddenExtensions);
            }
            foreach ($hiddenExtensions as $search) {
                if(strcasecmp($search, $pathParts["extension"]) == 0) return true;
            }
        }
        return false;
    }

    /**
     * @param ContextInterface $ctx
     * @param string $folderName
     * @param string $compare
     * @return bool
     */
    public function filterFolder(ContextInterface $ctx, $folderName, $compare = "equals")
    {
        $hiddenFolders = $this->getContextualOption($ctx, "HIDE_FOLDERS");
        if (!empty($hiddenFolders)) {
            if (!is_array($hiddenFolders)) {
                $hiddenFolders = explode(",",$hiddenFolders);
            }
            foreach ($hiddenFolders as $search) {
                if($compare == "equals" && strcasecmp($search, $folderName) == 0) return true;
                if($compare == "contains" && strpos($folderName, "/".$search) !== false) return true;
            }
        }
        return false;
    }
}

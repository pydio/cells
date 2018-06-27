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

defined('PYDIO_EXEC') or die( 'Access not allowed');

use Pydio\Access\Core\AbstractAccessDriver;
use Pydio\Access\Core\MetaStreamWrapper;
use Pydio\Access\Meta\Core\IFileHasher;
use Pydio\Core\Model\Context;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Model\ContextProviderInterface;
use Pydio\Core\Model\RepositoryInterface;
use Pydio\Core\Model\UserInterface;


use Pydio\Core\Controller\Controller;
use Pydio\Core\PluginFramework\PluginsService;
use Pydio\Core\Services\RepositoryService;
use Pydio\Core\Utils\FileHelper;
use Pydio\Access\Metastore\Core\IMetaStoreProvider;
use Pydio\Core\Utils\Vars\UrlUtils;
use Swagger\Client\ApiException;
use Swagger\Client\Model\TreeNode;
use Swagger\Client\Model\TreeNodeType;


/**
 * Atomic representation of a data. This the basic node of the hierarchical data.
 * Encapsulates the path and url, the nature (leaf or not) and the metadata of the node.
 * @package Pydio\Access\Core\Model
 */
class Node implements \JsonSerializable, ContextProviderInterface
{
    /**
     * @var string URL of the node in the form ajxp.protocol://repository_id/path/to/node
     */
    protected $_url;
    /**
     * @var array The node metadata
     */
    protected $_metadata = [];
    /**
     * @var string Associated wrapper
     */
    protected $_wrapperClassName;
    /**
     * @var array Parsed url fragments
     */
    protected $urlParts = [];
    /**
     * @var string A local representation of a real file, if possible
     */
    protected $realFilePointer;
    /**
     * @var bool Whether the core information of the node is already loaded or not
     */
    protected $nodeInfoLoaded = false;
    /**
     * @var string Details level passed to nodeLoadInfo()
     */
    protected $nodeInfoLevel = "minimal";
    /**
     * @var RepositoryInterface
     */
    private $_repository;
    /**
     * @var AbstractAccessDriver
     */
    private $_accessDriver;
    /**
     * @var IMetaStoreProvider
     */
    private $_metaStore;
    /**
     * @var IFileHasher
     */
    private $_fileHasher;

    /**
     * @var String
     */
    private $_user;

    /**
     * @var array
     */
    private $_indexableMetaKeys = [];

    /**
     * @var bool
     */
    private $_metadataBulkUpdate = false;

    /**
     * @param string $url URL of the node in the form ajxp.protocol://repository_id/path/to/node
     * @param array $metadata Node metadata
     */
    public function __construct($url, $metadata = [])
    {
        $this->setUrl($url);
        $this->_metadata = $metadata;
    }

    public function getUuid(){
        return $this->_metadata["uuid"];
    }

    /**
     * @param TreeNode $node
     * @return Node
     */
    public static function fromApiNode(ContextInterface $ctx, TreeNode $node, $fullPath = false){
        // NODE URL : TreeNode should return the Workspace ID in order to being able to build the context
        $apiPath = $node->getPath(); // Will begin with current workspace slug
        if ($fullPath) {
            $localPath = $apiPath;
            $baseUrl = $apiPath;
        } else {
            $parts = explode("/", trim($apiPath, "/"));
            array_shift($parts);
            $localPath = implode("/", $parts);
            $baseUrl = $ctx->getUrlBase() . "/" . $localPath;
        }
        $meta = [];
        $metaStore = $node->getMetaStore();
        if(!empty($metaStore)) {
            foreach($metaStore as $metaKey => $serialMeta){
                $meta[$metaKey] = json_decode($serialMeta, true);
            }
        }
        // Legacy Meta
        $meta["uuid"] = $node->getUuid();
        $meta["bytesize"] = $node->getSize();
        $meta["ajxp_modiftime"] = $node->getMTime();
        $meta["etag"] = $node->getEtag();
        $pydioNode = new Node($baseUrl, $meta);
        if ($node->getType() == TreeNodeType::COLLECTION){
            $pydioNode->setLeaf(false);
        } else {
            $pydioNode->setLeaf(true);
        }
        $nameMeta = $pydioNode->name;
        if (!empty($nameMeta)){
            $pydioNode->setLabel($nameMeta);
        }
        $pydioNode->metadataLoaded = true;

        return $pydioNode;
    }

    /**
     * @return array
     */
    public function __sleep()
    {
        $t = array_diff(array_keys(get_class_vars("Pydio\\Access\\Core\\Model\\Node")), ["_accessDriver", "_repository", "_metaStore"]);
        return $t;
    }

    /**
     * @param string $url
     * @return ContextInterface
     */
    public static function contextFromUrl($url){
        $n = new Node($url);
        return $n->getContext();
    }

    /**
     * @param String $url of the node in the form ajxp.protocol://repository_id/path/to/node
     * @return void
     */
    public function setUrl($url)
    {
        $url = rtrim($url, "/");
        $this->_url = $url;
        // Clean url
        $testExp = explode("//", $url);
        if (count($testExp) > 1) {
            $this->_url = array_shift($testExp)."//";
            $this->_url .= implode("/", $testExp);
        }
        $this->parseUrl();
    }

    /**
     * @return RepositoryInterface
     */
    public function getRepository()
    {
        if (!isSet($this->_repository)) {
            $this->_repository = RepositoryService::getRepositoryById($this->urlParts["host"]);
        }
        return $this->_repository;
    }

    /**
     * @return ContextInterface
     * @throws \Exception
     */
    public function getContext(){
        if(empty($this->_user)){
            throw new \Exception("Missing user in node URL");
        }
        $ctx = new Context($this->getUserId());
        if($this->_repository){
            $ctx->setRepositoryObject($this->_repository);
        } else {
            $ctx->setRepositoryId($this->getRepositoryId());
        }
        if(isSet($uObject)){
            $ctx->setUserObject($uObject);
        }
        return $ctx;
    }

    /**
     * @param string $pathSegment
     * @return Node
     */
    public function createChildNode($pathSegment){
        $n = new Node($this->getUrl()."/".$pathSegment);
        return $n;
    }

    /**
     * @return AbstractAccessDriver
     */
    public function getDriver()
    {
        if (!isSet($this->_accessDriver)) {
            $plugin = PluginsService::getInstance($this->getContext())->getUniqueActivePluginForType("access");
            if(empty($plugin)){
                throw new RepositoryLoadException($this, ["Cannot find access driver for repository ".$this->getSlug()]);
            }
            $this->_accessDriver = $plugin;
        }
        return $this->_accessDriver;
    }

    /**
     * @param AbstractAccessDriver
     */
    public function setDriver($accessDriver)
    {
        $this->_accessDriver = $accessDriver;
    }

    /**
     * @return IMetaStoreProvider
     */
    protected function getMetaStore()
    {
        if (!isSet($this->_metaStore)) {
            $this->getDriver();
            $this->_metaStore = PluginsService::getInstance($this->getContext())->getUniqueActivePluginForType("metastore");
        }
        return $this->_metaStore;
    }

    /**
     * @return IFileHasher
     */
    protected function getFileHasher()
    {
        if (!isSet($this->_fileHasher)) {
            $this->getDriver();
            $hashers = PluginsService::getInstance($this->getContext())->getActivePluginsForType("meta");
            if(is_array($hashers) && array_key_exists("filehasher", $hashers)){
                $this->_fileHasher = $hashers["filehasher"];
            }else{
                $this->_fileHasher = false;
            }
        }
        return $this->_fileHasher;
    }

    /**
     * Check if there is currently a MetaStore provider set
     * @return bool
     */
    public function hasMetaStore()
    {
        return ($this->getMetaStore() !== false);
    }

    /**
     * Start a session of set / remove Metadata calls without applying the node.meta_change hook
     */
    public function startUpdatingMetadata(){
        $this->_metadataBulkUpdate = true;
    }

    /**
     * Finish updating the metadata and trigger the node.meta_change event
     * @throws \Exception
     */
    public function finishedUpdatingMetadata(){
        $this->_metadataBulkUpdate = false;
    }

    /**
     * @param $nameSpace
     * @param $metaData
     * @param bool $private
     * @param int $scope
     * @param bool $indexable
     */
    public function setMetadata($nameSpace, $metaData, $private = false, $scope=PYDIO_METADATA_SCOPE_REPOSITORY, $indexable = false)
    {
        if(!$this->hasMetaStore()){
            return;
        }
        $this->getMetaStore()->setMetadata($this, $nameSpace, $metaData, $private, $scope);
        //$this->mergeMetadata($metaData);
        if ($indexable) {
            if(!isSet($this->_indexableMetaKeys[$private ? "user":"shared"]))$this->_indexableMetaKeys[$private ? "user":"shared"] = [];
            $this->_indexableMetaKeys[$private ? "user":"shared"][$nameSpace] = $nameSpace;
        }
    }

    /**
     * @param String $nameSpace
     * @param bool $private
     * @param int $scope
     * @param bool $indexable
     */
    public function removeMetadata($nameSpace, $private = false, $scope=PYDIO_METADATA_SCOPE_REPOSITORY, $indexable = false)
    {
        if(!$this->hasMetaStore()){
            return;
        }
        $this->getMetaStore()->removeMetadata($this, $nameSpace, $private, $scope);
        if ($indexable && isSet($this->_indexableMetaKeys[$private ? "user":"shared"]) && isset($this->_indexableMetaKeys[$private ? "user":"shared"][$nameSpace])) {
            unset($this->_indexableMetaKeys[$private ? "user":"shared"][$nameSpace]);
        }
    }

    /**
     * @param String $nameSpace
     * @param bool $private
     * @param int $scope
     * @param bool $indexable
     * @return array
     */
    public function retrieveMetadata($nameSpace, $private = false, $scope=PYDIO_METADATA_SCOPE_REPOSITORY, $indexable = false)
    {
        if(!$this->hasMetaStore()){
            return [];
        }
        $data = $this->getMetaStore()->retrieveMetadata($this, $nameSpace, $private, $scope);
        if (!empty($data) && $indexable) {
            if(!isSet($this->_indexableMetaKeys[$private ? "user":"shared"]))$this->_indexableMetaKeys[$private ? "user":"shared"] = [];
            $this->_indexableMetaKeys[$private ? "user":"shared"][$nameSpace] = $nameSpace;
        }
        return $data;
    }

    /**
     * @param Node $originalNode
     * @param string $nameSpace
     * @param string $operation
     * @param bool $private
     * @param int $scope
     * @param bool $indexable
     * @return array()
     */
    public function copyOrMoveMetadataFromNode($originalNode, $nameSpace, $operation="move", $private = false, $scope=PYDIO_METADATA_SCOPE_REPOSITORY, $indexable = false){

        if($this->getMetaStore() == false || $this->getMetaStore()->inherentMetaMove()){
            return [];
        }
        $metaData = $originalNode->retrieveMetadata($nameSpace, $private, $scope, $indexable);
        if(isSet($metaData) && !empty($metaData)){
            $this->setMetadata($nameSpace, $metaData, $private, $scope, $indexable);
            if($operation == "move"){
                $originalNode->removeMetadata($nameSpace, $private, $scope, $indexable);
            }
            return $metaData;
        }
        return [];

    }

    /**
     * @return Node|null
     */
    public function getParent(){

        if(empty($this->urlParts["path"]) || $this->urlParts["path"] === "/"){
            return null;
        }
        $parent = new Node(dirname($this->_url));
        $parent->setDriver($this->_accessDriver);
        return $parent;

    }


    /**
     * Search for metadata in parents, recursively
     * @param $nameSpace
     * @param bool $private
     * @param int $scope
     * @param bool $indexable
     * @return array|bool
     */
    public function findMetadataInParent($nameSpace, $private = false, $scope=PYDIO_METADATA_SCOPE_REPOSITORY, $indexable = false){

        $metadata = false;
        $parentNode = $this->getParent();
        if($parentNode != null){
            $metadata = $parentNode->retrieveMetadata($nameSpace, $private, $scope,$indexable);
            if($metadata == false){
                $metadata = $parentNode->findMetadataInParent($nameSpace, $private, $scope, $indexable);
            }else{
                $metadata["SOURCE_NODE"] = $parentNode;
            }
        }
        return $metadata;

    }

    /**
     * @param String $nameSpace
     * @param bool $private
     * @param int $scope
     * @param bool $indexable
     * @param array $collect
     */
    public function collectMetadataInParents($nameSpace, $private = false, $scope=PYDIO_METADATA_SCOPE_REPOSITORY, $indexable = false, &$collect= []){

        $parentNode = $this->getParent();
        if($parentNode != null){
            $metadata = $parentNode->retrieveMetadata($nameSpace, $private, $scope,$indexable);
            if($metadata != false){
                $metadata["SOURCE_NODE"] = $parentNode;
                $collect[] = $metadata;
            }
            $parentNode->collectMetadataInParents($nameSpace, $private, $scope, $indexable, $collect);
        }

    }

    /**
     * @param array $nameSpaces
     * @param bool $private
     * @param int $scope
     * @param bool $indexable
     * @param array $collect
     */
    public function collectMetadatasInParents($nameSpaces, $private = false, $scope=PYDIO_METADATA_SCOPE_REPOSITORY, $indexable = false, &$collect= []){

        $parentNode = $this->getParent();
        if($parentNode != null){
            $nodeMeta = [];
            foreach($nameSpaces as $nameSpace){
                $metadata = $parentNode->retrieveMetadata($nameSpace, $private, $scope,$indexable);
                if($metadata != false){
                    $nodeMeta[$nameSpace] = $metadata;
                }
            }
            if(count($nodeMeta)){
                $nodeMeta["SOURCE_NODE"] = $parentNode;
                $collect[] = $nodeMeta;
            }
            $parentNode->collectMetadatasInParents($nameSpaces, $private, $scope, $indexable, $collect);
        }

    }

    /**
     * @param $nameSpace
     * @param $userScope
     * @return array
     */
    public function collectRepositoryMetadatasInChildren($nameSpace, $userScope){
        $result = [];
        $metaStore = $this->getMetaStore();
        if($metaStore !== false && method_exists($metaStore, "collectChildrenWithRepositoryMeta")){
            $result = $metaStore->collectChildrenWithRepositoryMeta($this, $nameSpace, $userScope);
        }
        return $result;
    }

    /**
     * @return void
     */
    public function loadHash(){
        if($this->getFileHasher() !== false){
            $this->getFileHasher()->getFileHash($this);
        }
    }

    /**
     * @param bool $boolean Leaf or Collection?
     * @return void
     */
    public function setLeaf($boolean)
    {
        $this->_metadata["is_file"] = $boolean;
    }

    /**
     * @return bool
     */
    public function isLeaf()
    {
        return isSet($this->_metadata["is_file"])?$this->_metadata["is_file"]:true;
    }

    public function isWriteable(){
        return !isSet($this->_metadata["node_readonly"]);
    }

    /**
     * @param $label String Main label, will set the metadata "text" key.
     * @return void
     */
    public function setLabel($label)
    {
        $this->_metadata["text"] = $label;
    }

    /**
     * @return string Try to get the metadata "text" key, or the basename of the node path.
     */
    public function getLabel()
    {
        return isSet($this->_metadata["text"])? $this->_metadata["text"] : basename($this->urlParts["path"]);
    }

    /**
     * @return string
     */
    public function getExtension(){
        return strtolower(pathinfo($this->urlParts["path"], PATHINFO_EXTENSION));
    }

    /**
     * @param $string
     * @return bool
     */
    public function hasExtension($string){
        return strcasecmp($string, $this->getExtension()) == 0;
    }

    /**
     * List all set metadata keys
     * @return array
     */
    public function listMetaKeys()
    {
        return array_keys($this->_metadata);
    }

    public function exists(){
        try{
            $this->loadNodeInfo();
            return true;
        }catch (ApiException $e){
            return false;
        }
    }

    /**
     * Applies the "node.info" hook, thus going through the plugins that have registered this node, and loading
     * all metadata at once.
     * @param bool $forceRefresh
     * @param bool $contextNode The parent node, if it can be useful for the hooks callbacks
     * @param mixed $details A specification of expected metadata fields, or minimal
     * @return void
     */
    public function loadNodeInfo($forceRefresh = false, $contextNode = false, $details = false)
    {
        if($this->nodeInfoLoaded && $this->nodeInfoLevel != $details){
            $forceRefresh = true;
        }
        if($this->nodeInfoLoaded && !$forceRefresh){
            return;
        }
        if (!empty($this->_wrapperClassName)) {
            $registered = PluginsService::getInstance($this->getContext())->getRegisteredWrappers();
            if (!isSet($registered[$this->getScheme()])) {
                $driver = $this->getDriver();
                if(is_object($driver)) $driver->detectStreamWrapper(true, $this->getContext());
            }
        }
        $current = $this;
        Controller::applyHook("node.info.start", [&$current, $contextNode, $details, $forceRefresh]);
        if($this->nodeInfoLoaded && !$forceRefresh && (isSet($this->_metadata["ajxp_mime"]) || isSet($this->_metadata["mimestring_id"]))){
            Controller::applyHook("node.info.nocache", [&$current, $contextNode, $details, $forceRefresh]);
            return;
        }
        Controller::applyHook("node.info", [&$current, $contextNode, $details, $forceRefresh]);
        Controller::applyHook("node.info.end", [&$current, $contextNode, $details, $forceRefresh]);
        Controller::applyHook("node.info.nocache", [&$current, $contextNode, $details, $forceRefresh]);
        $this->nodeInfoLoaded = true;
        $this->nodeInfoLevel = $details;
    }

    /**
     * Get a real reference to the filesystem. Remote wrappers will copy the file locally.
     * This will last the time of the script and will be removed afterward.
     * @return string
     */
    public function getRealFile()
    {
        if (!isset($this->realFilePointer)) {
        $this->realFilePointer = MetaStreamWrapper::getRealFSReference($this->_url, true);
            $isRemote = MetaStreamWrapper::wrapperIsRemote($this->_url);
            if ($isRemote) {
                register_shutdown_function(function(){
                    FileHelper::silentUnlink($this->realFilePointer);
                });

            }
        }
        return $this->realFilePointer;
    }

    /**
     * Check if node wrapper is local or remote
     * @return bool
     */
    public function wrapperIsRemote(){
        return MetaStreamWrapper::wrapperIsRemote($this->_url);
    }

    /**
     * @return string URL of the node in the form ajxp.protocol://repository_id/path/to/node
     */
    public function getUrl()
    {
        return $this->_url;
    }

    /**
     * @return string The path from the root of the repository
     */
    public function getPath()
    {
        return !empty($this->urlParts["path"]) ? $this->urlParts["path"] : "/";
    }

    /**
     * @return bool
     */
    public function isRoot()
    {
        return !isset($this->urlParts["path"]) || $this->urlParts["path"] == "/";
    }

    /**
     * @return string The scheme part of the url
     */
    public function getScheme()
    {
        return $this->urlParts["scheme"];
    }

    /**
     * @return string A username
     */
    public function getUserId(){
        return $this->_user;
    }

    /**
     * @return UserInterface
     */
    public function getUser(){
        return $this->getContext()->getUser();
    }

    /**
     * @param string $userId A username
     */
    public function setUserId($userId){
        // Update url with a user@workspaceID
        $this->_user = $userId;
        $this->urlParts["user"] = $userId;
        $this->setUrl($this->getScheme()."://".$this->_user."@".$this->getRepositoryId().$this->getPath());
    }

    /**
     * @return string A username passed through url
     */
    public function hasUser(){
        return isSet($this->_user);
    }

    /**
     * @return string The repository identifer
     */
    public function getRepositoryId()
    {
        return $this->urlParts["host"];
    }

    /**
     * Pass an array of metadata and merge its content with the current metadata.
     * @param array $metadata
     * @param bool $mergeValues
     * @return void
     */
    public function mergeMetadata($metadata, $mergeValues = false)
    {
        if ($mergeValues) {
            foreach ($metadata as $key => $value) {
                if (isSet($this->_metadata[$key]) && is_string($this->_metadata[$key]) && is_string($value)) {
                    $existingValue = explode(",", $this->_metadata[$key]);
                    if (!in_array($value, $existingValue)) {
                        array_push($existingValue, $value);
                        $this->_metadata[$key] = implode(",", $existingValue);
                    }
                } else {
                    $this->_metadata[$key] = $value;
                }
            }
        } else {
            $this->_metadata = array_merge($this->_metadata, $metadata);
        }
    }

    /**
     * Return all metadata loaded during node.info, mainly used for caching.
     * @return array
     */
    public function getNodeInfoMeta(){
        return $this->_metadata;
    }

    /**
     * Set nodeInfoLoaded to true from external.
     * @param string $level
     */
    public function setInfoLoaded($level){
        $this->nodeInfoLoaded = true;
        $this->nodeInfoLevel = $level;
    }

    /**
     * Try the size of collection recursively.
     * Will trigger the node.size.recursive hook, allowing certain plugins
     * to perform the operation if they have the information (e.g. meta.syncable).
     * Otherwise will use the directoryUsage() method of the accessDriver.
     * @return int|mixed
     */
    public function getSizeRecursive(){
        $this->loadNodeInfo();
        if($this->isLeaf()){
            return $this->_metadata["bytesize"];
        }else{
            $result = -1;
            $current = $this;
            Controller::applyHook("node.size.recursive", [&$current, &$result]);
            if($result == -1){
                try{
                    return $this->getDriver()->directoryUsage($this);
                }catch(\Exception $e){
                    return -1;
                }
            }else{
                return $result;
            }
        }
    }

    /**
     * Magic getter for metadata
     * @param $varName
     * @return array|null|string
     */
    public function __get($varName)
    {
        if(strtolower($varName) == "wrapperclassname") return $this->_wrapperClassName;
        if(strtolower($varName) == "url") return $this->_url;
        if(strtolower($varName) == "metadata") return $this->_metadata;
        if(strtolower($varName) == "indexablemetakeys") return $this->_indexableMetaKeys;

        if (isSet($this->_metadata[$varName])) {
            return $this->_metadata[$varName];
        } else {
            return null;
        }
    }

    /**
     * Magic setter for metadata
     * @param $metaName
     * @param $metaValue
     * @return void
     */
    public function __set($metaName, $metaValue)
    {
        if (strtolower($metaName) == "metadata") {
            $this->_metadata = $metaValue;
            return;
        }
        if($metaValue == null) unset($this->_metadata[$metaName]);
        else $this->_metadata[$metaName] = $metaValue;
    }

    /**
     * Safe parseUrl implementation
     * @return void
     */
    protected function parseUrl()
    {
        if (strstr($this->_url, "#") !== false) {
            $url = str_replace("#", "__HASH__", $this->_url);
            $this->urlParts = UrlUtils::mbParseUrl($url);
            foreach ($this->urlParts as $partKey => $partValue) {
                $this->urlParts[$partKey] = str_replace("__HASH__", "#", $partValue);
            }
        } else {
            $this->urlParts = UrlUtils::mbParseUrl($this->_url);
        }
        if(isSet($this->urlParts["user"])){
            $this->_user = $this->urlParts["user"];
        }

        if (strstr($this->urlParts["scheme"], "ajxp.")!==false) {
            $pServ = PluginsService::getInstance($this->getContext());
            $this->_wrapperClassName = $pServ->getWrapperClassName($this->urlParts["scheme"]);
        }else if($this->urlParts["scheme"] == "pydio"){
            $this->_wrapperClassName = "Pydio\\Access\\Core\\MetaStreamWrapper";
        }
    }

    /**
     * @return array fstat-formatted object, plus Etag passed as "hash" key
     */
    public function getStatObject(){
        $stat = [
            "size" => intval($this->_metadata["bytesize"]),
            "mtime" => intval($this->_metadata["ajxp_modiftime"]),
            "atime" => intval($this->_metadata["ajxp_modiftime"]),
            "ctime" => intval($this->_metadata["ajxp_modiftime"]),
        ];
        if($this->isLeaf()){
            $stat["hash"] = $this->_metadata["etag"];
        } else{
            $stat["hash"] = "directory";
        }
        return $stat;
    }

    /**
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     * @since 5.4.0
     */
    function jsonSerialize()
    {
        $data = $this->_metadata;
        unset($data["filename"]);
        $data["path"] = $this->_metadata["filename"];
        if(empty($data["path"]) && !empty($this->urlParts["path"])){
            $data["path"] = $this->urlParts["path"];
        }
        if(isSet($this->_metadata["is_file"])){
            unset($data["is_file"]);
            $data["type"] = $this->isLeaf() ? "leaf" : "collection";
        }
        if(isSet($this->_metadata["text"])){
            unset($data["text"]);
            $data["label"] = $this->getLabel();
        }
        return $data;
    }
}

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

use Pydio\Access\Core\AbstractAccessDriver;
use Pydio\Core\Exception\PydioException;
use Pydio\Core\Exception\RepositoryLoadException;
use Pydio\Core\Http\Client\MicroApi;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Model\RepositoryInterface;

use Pydio\Core\Model\RepositoryRoot;
use Pydio\Core\PluginFramework\PluginsService;
use Pydio\Core\Services\LocaleService;
use Pydio\Core\Services\RepositoryService;
use Pydio\Core\Utils\Vars\InputFilter;
use Pydio\Core\Utils\Vars\StatHelper;
use Pydio\Core\Utils\Vars\StringHelper;

use Pydio\Core\Utils\Vars\VarsFilter;
use Swagger\Client\ApiException;
use Swagger\Client\Model\IdmWorkspaceScope;
use Swagger\Client\Model\ServiceResourcePolicy;
use Swagger\Client\Model\TreeNode;
use Swagger\Client\Model\TreeReadNodeRequest;

defined('PYDIO_EXEC') or die( 'Access not allowed');

define('PYDIO_REPOSITORY_TYPE_LOCAL', 'local');

/**
 * Class Repository
 * @package Pydio\Access\Core\Model
 */
class Repository implements RepositoryInterface
{
    /**
     * @var string
     */
    public $uuid;
    /**
     * @var string
     */
    public $id;
    /**
     * @var string
     */
    public $path;
    /**
     * @var string
     */
    public $display;
    /**
     * @var string
     */
    public $displayStringId;
    /**
     * @var string
     */
    public $accessType = "fs";
    /**
     * @var string
     */
    public $recycle = "";
    /**
     * @var bool
     */
    public $create = true;
    /**
     * @var bool
     */
    public $writeable = true;
    /**
     * @var bool
     */
    public $enabled = true;
    /**
     * @var array
     */
    public $options = array();
    /**
     * @var string
     */
    public $slug;
    /**
     * @var bool
     */
    public $isTemplate = false;

    /**
     * @var string local or remote
     */
    protected $repositoryType = PYDIO_REPOSITORY_TYPE_LOCAL;

    /**
     * @var string status
     */
    protected $accessStatus;

    /**
     * @var string
     */
    private $owner;
    /**
     * @var string
     */
    private $parentId;
    /**
     * @var string
     */
    private $uniqueUser;
    /**
     * @var bool
     */
    private $inferOptionsFromParent;

    /**
     * @var String the groupPath of the administrator who created that repository.
     */
    protected $groupPath;


    /**
     * @var IdmWorkspaceScope
     */
    protected $scope;

    /**
     * @var ServiceResourcePolicy[]
     */
    protected $policies;

    /**
     * @var AbstractAccessDriver
     */
    public $driverInstance;

    /**
     * @var RepositoryRoot[]
     */
    protected $rootNodes;

    /**
     * @return RepositoryRoot[]
     */
    public function getRootNodes($reload = false){
        if (isSet($this->rootNodes) && !$reload) {
            return $this->rootNodes;
        }
        $treeApi = MicroApi::GetAdminTreeServiceApi();
        // Transform replicable options to RepositoryRoot nodes
        $nodes = [];
        foreach($this->options as $key => $value){
            if (strpos($key, "ROOT_NODES") === 0) {
                try {
                    if(strpos($value, "uuid:") === 0){
                        $apiNodeId = substr($value, strlen("uuid:"));
                    } else {
                        $request = new TreeReadNodeRequest();
                        $statNode = new TreeNode();
                        $statNode->setPath($value);
                        $request->setNode($statNode);
                        try{
                            $response = $treeApi->statAdminTree($request);
                            $apiNodeId = $response->getNode()->getUuid();
                        } catch (ApiException $ex) {
                            $apiNodeId = "";
                        }
                    }
                    if (empty($apiNodeId)) continue;
                }catch (ApiException $e) {
                    continue;
                }
                $node = new RepositoryRoot();
                $node->setPath($value);
                $node->setUuid($apiNodeId);
                $nodes[] = $node;
            }
        }
        $this->rootNodes = $nodes;
        return $nodes;
    }

    /**
     * @param $roots RepositoryRoot[]
     * @return void
     */
    public function setRootNodes($roots){
        // Transform RepositoryRoot nodes to replicable options
        $this->rootNodes = $roots;
        $i = 0;
        foreach($roots as $root) {
            $optKey = "ROOT_NODES";
            if ($i > 0) $optKey .= "_" . $i;
            $this->options[$optKey] = $root->getPath();
            $i++;
        }
    }



    /**
     * @param ContextInterface $contextInterface
     * @return AbstractAccessDriver
     * @throws RepositoryLoadException
     */
    public function getDriverInstance(ContextInterface $contextInterface)
    {
        if(!isSet($this->driverInstance)){
            $plugin = PluginsService::getInstance($contextInterface)->getUniqueActivePluginForType("access");
            if(empty($plugin)){
                throw new RepositoryLoadException($this, ["Cannot find access driver for repository ".$this->getSlug()]);
            }
            $this->driverInstance = $plugin;
        }
        return $this->driverInstance;
    }

    /**
     * @param AbstractAccessDriver $driverInstance
     */
    public function setDriverInstance($driverInstance)
    {
        $this->driverInstance = $driverInstance;
    }

    /**
     * @param string $id
     * @param string $display
     * @param string $driver
     */
    public function __construct($id, $display, $driver)
    {
        $this->setAccessType($driver);
        $this->setDisplay($display);
        $this->setId($id);
        $this->uuid = md5(microtime());
        $this->slug = StringHelper::slugify($display);
        $this->inferOptionsFromParent = false;
        $this->options["CREATION_TIME"] = time();
//        if (AuthService::usersEnabled() && AuthService::getLoggedUser() != null) {
//            $this->options["CREATION_USER"] = AuthService::getLoggedUser()->getId();
//        }
    }

    /**
     * @param $id string
     */
    public function setUniqueId($id) {
        $this->uuid = $id;
    }

    /**
     * @param string $newLabel
     * @param string $parentId
     * @param string $owner
     * @param array $newOptions
     * @return Repository
     * @internal param null $uniqueUser
     */
    public function createSharedChild($newLabel, $parentId, $owner, $newOptions = [])
    {
        $repo = new Repository(0, $newLabel, $this->accessType);
        $newOptions = array_merge($this->options, $newOptions);
        $newOptions["CREATION_TIME"] = time();
        $newOptions["CREATION_USER"] = $owner;
        $repo->options = $newOptions;
        if ($parentId === null) {
            $parentId = $this->getId();
        }
        $repo->setParentId($parentId);
        return $repo;
    }

    /**
     * @param string $newLabel
     * @param array $newOptions
     * @param null $creator
     * @param null $uniqueUser
     * @return Repository
     */
    public function createTemplateChild($newLabel, $newOptions, $creator = null, $uniqueUser = null)
    {
        $repo = new Repository(0, $newLabel, $this->accessType);
        $newOptions["CREATION_TIME"] = time();
        $newOptions["CREATION_USER"] = $creator;
        $repo->options = $newOptions;
        $repo->setParentId($this->getId());
        return $repo;
    }

    /**
     * @param bool $serial
     * @return string
     */
    public function getUniqueId($serial=false)
    {
        if ($serial) {
            return md5(serialize($this));
        }
        return $this->uuid;
    }

    /**
     * @return string
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * @param null $slug
     */
    public function setSlug($slug = null)
    {
        if (empty($slug)) {
            $this->slug = StringHelper::slugify($this->display);
        } else {
            $this->slug = $slug;
        }
    }

    /**
     * @param $oName
     * @param $oValue
     */
    public function addOption($oName, $oValue)
    {
        if (strpos($oName, "PATH") !== false) {
            $oValue = str_replace("\\", "/", $oValue);
        }
        $this->options[$oName] = $oValue;
    }

    /**
     * @param string $oName
     * @return mixed|string
     * @throws \Exception
     */
    public function getSafeOption($oName){
        if (isSet($this->options[$oName])) {
            $value = $this->options[$oName];
            return $value;
        }
        if ($this->inferOptionsFromParent && isSet($this->parentId)) {
            $parentTemplateObject = RepositoryService::getRepositoryById($this->parentId);
            if(empty($parentTemplateObject) || !$parentTemplateObject instanceof RepositoryInterface) {
                throw new PydioException("Option should be loaded from parent repository, but it was not found");
            }
            return $parentTemplateObject->getSafeOption($oName);
        }
        return null;
    }

    /**
     * @param ContextInterface $ctx
     * @param string $oName
     * @param null $default
     * @return mixed
     * @throws PydioException
     */
    public function getContextOption(ContextInterface $ctx, $oName, $default = null){
        if(isSet($this->inferOptionsFromParent) && isSet($this->parentId)){
            $parentTemplateObject = RepositoryService::getRepositoryById($this->parentId);
            if(empty($parentTemplateObject) || !$parentTemplateObject instanceof Repository) {
                throw new PydioException("Option should be loaded from parent repository, but it was not found");
            }
        }
        if ($this->inferOptionsFromParent && isSet($parentTemplateObject)) {
            $pvalue = $parentTemplateObject->getContextOption($ctx, $oName);
            $pathChanged = false;
            if (is_string($pvalue) && strstr($pvalue, "PYDIO_ALLOW_SUB_PATH") !== false) {
                $pvalue = rtrim(str_replace("PYDIO_ALLOW_SUB_PATH", "", $pvalue), "/")."/".$this->options[$oName];
                $pathChanged = true;
            }
            if ($pathChanged) {
                return InputFilter::securePath($pvalue);
            }
        }
        if (isSet($this->options[$oName]) && (!empty($this->options[$oName]) || empty($default))) {
            return VarsFilter::filter($this->options[$oName], $ctx);
        }
        if ($this->inferOptionsFromParent && isset($parentTemplateObject)) {
            return $parentTemplateObject->getContextOption($ctx, $oName);
        }
        return $default;

    }

    /**
     * @return array
     */
    public function getOptionsDefined()
    {
        $keys = array();
        foreach ($this->options as $key => $value) {
            if(is_string($value) && strstr($value, "PYDIO_ALLOW_SUB_PATH") !== false) continue;
            $keys[] = $key;
        }
        return $keys;
    }

    /**
     * @return mixed|string
     * @throws PydioException
     */
    public function getDefaultRight()
    {
        $opt = $this->getSafeOption("DEFAULT_RIGHTS");
        $opt = (isSet($opt)?$opt:"");
        $convert = ["r" => "read", "w" => "write", "rw" => "read,write"];
        if(array_key_exists($opt, $convert)){
            $opt = $convert[$opt];
        }
        return $opt;
    }

    /**
     * @return string
     */
    public function getAccessType()
    {
        return $this->accessType;
    }

    /**
     * @return mixed|string
     * @throws PydioException
     */
    public function getDisplay()
    {
        if (isSet($this->displayStringId)) {
            $mess = LocaleService::getMessages();
            if (isSet($mess[$this->displayStringId])) {
                return $mess[$this->displayStringId];
            }
        }
        return $this->display;
    }

    /**
     * @return string
     */
    public function getId()
    {
        if($this->isWriteable() || $this->id === null) return $this->getUniqueId();
        return $this->id;
    }

    /**
     * @return bool
     * @throws PydioException
     */
    public function getCreate()
    {
        return (bool) $this->getSafeOption("CREATE");
    }

    /**
     * @param bool $create
     */
    public function setCreate($create)
    {
        $this->options["CREATE"] = (bool) $create;
    }

    /**
     * @param String $accessType
     */
    public function setAccessType($accessType)
    {
        $this->accessType = $accessType;
    }

    /**
     * @param String $display
     */
    public function setDisplay($display)
    {
        $this->display = $display;
    }

    /**
     * @param int $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @return bool
     */
    public function isWriteable()
    {
        return (bool) $this->writeable;
    }

    /**
     * @param bool $w
     */
    public function setWriteable($w)
    {
        $this->writeable = (bool) $w;
    }

    /**
     * @param string $id
     */
    public function setDisplayStringId($id){
        $this->displayStringId = $id;
    }

    /**
     * @return string
     */
    public function getScope(){
        return $this->scope;
    }

    /**
     * @param string $scope
     */
    public function setScope($scope){
        $this->scope = $scope;
    }

    /**
     * @return ServiceResourcePolicy[]
     */
    public function getPolicies(){
        return $this->policies;
    }

    /**
     * @param ServiceResourcePolicy[] $policies
     */
    public function setPolicies($policies){
        $this->policies = $policies;
    }

    /**
     * @var array
     */
    private $idmAttributes;

    /**
     * @param $data array
     * @return void
     */
    public function setIdmAttributes($data){
        $this->idmAttributes = $data;
    }

    /**
     * @return array
     */
    public function getIdmAttributes(){
        if(empty($this->idmAttributes)) return [];
        return $this->idmAttributes;
    }



    /**
     * @param string $repoParentId
     * @param null $ownerUserId
     * @param null $childUserId
     */
    public function setParentId($repoParentId){
        $this->parentId = $repoParentId;
    }

    /**
     * @inheritdoc
     */
    public function getParentId()
    {
        return $this->parentId;
    }

    /**
     * @inheritdoc
     */
    public function isTemplate(){
        return $this->isTemplate;
    }
    /**
     * @return null|RepositoryInterface
     */
    public function getParentRepository(){
        if(!$this->hasParent()) return null;
        return RepositoryService::getRepositoryById($this->parentId);
    }

    /**
     * @return string
     */
    public function getUniqueUser()
    {
        return $this->uniqueUser;
    }

    /**
     * @return bool
     */
    public function hasOwner()
    {
        return isSet($this->owner);
    }

    /**
     * @return bool
     */
    public function hasParent()
    {
        return isSet($this->parentId);
    }

    /**
     * @param String $groupPath
     */
    public function setGroupPath($groupPath, $update = true)
    {
        if(strlen($groupPath) > 1) $groupPath = rtrim($groupPath, "/");
        $this->groupPath = $groupPath;
    }

    /**
     * @return String
     */
    public function getGroupPath()
    {
        return $this->groupPath;
    }

    /**
     * @param String $descriptionText
     */
    public function setDescription( $descriptionText )
    {
        $this->options["USER_DESCRIPTION"] = $descriptionText;
    }

    /**
     * @return string
     */
    public function getAccessStatus()
    {
        return $this->accessStatus;
    }

    /**
     * @param string $accessStatus
     */
    public function setAccessStatus($accessStatus)
    {
        $this->accessStatus = $accessStatus;
    }

    /**
     * @return string
     */
    public function getRepositoryType()
    {
        return $this->repositoryType;
    }

    /**
     * @param string $repositoryType
     */
    public function setRepositoryType($repositoryType)
    {
        $this->repositoryType = $repositoryType;
    }

    /**
     * @param bool $public
     * @param null $ownerLabel
     * @return mixed
     */
    public function getDescription( $public = false, $ownerLabel = null )
    {
        $m = LocaleService::getMessages();
        if (isset($this->options["USER_DESCRIPTION"]) && !empty($this->options["USER_DESCRIPTION"])) {
            if (isSet($m[$this->options["USER_DESCRIPTION"]])) {
                return $m[$this->options["USER_DESCRIPTION"]];
            } else {
                return $this->options["USER_DESCRIPTION"];
            }
        }
        if (isSet($this->parentId) && isset($this->owner)) {
            if (isSet($this->options["CREATION_TIME"])) {
                $date = StatHelper::relativeDate($this->options["CREATION_TIME"], $m);
                return str_replace(
                    array("%date", "%user"),
                    array($date, $ownerLabel!= null ? $ownerLabel : $this->owner),
                    $public?$m["470"]:$m["473"]);
            } else {
                if($public) return $m["474"];
                else return str_replace(
                    array("%user"),
                    array($ownerLabel!= null ? $ownerLabel : $this->owner),
                    $m["472"]);
            }
        } else if ($this->isWriteable() && isSet($this->options["CREATION_TIME"])) {
            $date = StatHelper::relativeDate($this->options["CREATION_TIME"], $m);
            if (isSet($this->options["CREATION_USER"])) {
                return str_replace(array("%date", "%user"), array($date, $this->options["CREATION_USER"]), $m["471"]);
            } else {
                return str_replace(array("%date"), array($date), $m["470"]);
            }
        } else {
            return $m["474"];
        }
    }

    /**
     * @return bool|string
     * @throws PydioException
     */
    public function securityScope()
    {
        if($this->hasParent()){
            $parentRepo = RepositoryService::getRepositoryById($this->getParentId());
            if(!empty($parentRepo) && $parentRepo->isTemplate()){
                $path = $parentRepo->getSafeOption("PATH");
                $container = $parentRepo->getSafeOption("CONTAINER");
                // If path is set in the template, compute identifier from the template path.
                if(!empty($path) || !empty($container)) return $parentRepo->securityScope();
            }
        }
        $path = $this->getSafeOption("CONTAINER");
        if(!empty($path)){
            if(strpos($path, "PYDIO_USER") !== false) return "USER";
            if(strpos($path, "PYDIO_GROUP_PATH") !== false) return "GROUP";
            if(strpos($path, "PYDIO_GROUP_PATH_FLAT") !== false) return "GROUP";
        }
        $path = $this->getSafeOption("PATH");
        if($this->accessType == "settings" || $this->accessType == "ajxp_admin") return "USER";
        if(empty($path)) return false;
        if(strpos($path, "PYDIO_USER") !== false) return "USER";
        if(strpos($path, "PYDIO_GROUP_PATH") !== false) return "GROUP";
        if(strpos($path, "PYDIO_GROUP_PATH_FLAT") !== false) return "GROUP";
        return false;
    }

    /**
     * @return array
     */
    public function __sleep()
    {
        $this->driverInstance = null;
        return array_keys(get_object_vars($this));
    }

}

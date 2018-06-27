<?php
/*
 * Copyright 2007-2017 Charles du Jeu <contact (at) cdujeu.me>
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
namespace Pydio\Conf\Core;

use Pydio\Core\Http\Client\MicroApi;
use Pydio\Core\Model\RepositoryInterface;
use Pydio\Core\Services\RolesService;
use Swagger\Client\Model\IdmRole;
use Swagger\Client\Model\IdmUser;
use Swagger\Client\Model\IdmUserSingleQuery;
use Swagger\Client\Model\IdmWorkspaceScope;
use Swagger\Client\Model\RestSearchUserRequest;

defined('PYDIO_EXEC') or die('Access not allowed');

define('PYDIO_VALUE_CLEAR', "PYDIO_VALUE_CLEAR");
define('PYDIO_REPO_SCOPE_ALL',"PYDIO_REPO_SCOPE_ALL");
define('PYDIO_REPO_SCOPE_SHARED',"PYDIO_REPO_SCOPE_SHARED");
define('PYDIO_PLUGINS_SCOPE_ALL',"plugin_all");

/**
 * @package Pydio
 * @subpackage Core
 */
class Role extends IdmRole implements IGroupPathProvider
{

    /**
     * @var IdmUser
     */
    private $owner;

    /**
     * @var array List of access rights for each workspaces (wsId => "r", "w", "rw", "d")
     */
    protected $acls = array();
    /**
     * @var array List of plugins parameters values, (SCOPE => PLUGIN NAME => PARAM NAME => value)
     */
    protected $parameters = array();
    /**
     * @var array List of plugin actions that can be disabled/enabled (SCOPE => PLUGIN NAME => ACTION NAME => status)
     */
    protected $actions = array();
    /**
     * @var array Automatically applies to a given list of profiles
     */
    protected $autoApplies = array();
    /**
     * @var array
     */
    protected $nodesAcls = array();

    /**
     * @return array
     */
    public function getNodesAcls()
    {
        return $this->nodesAcls;
    }

    /**
     * @param array $nodesAcls
     */
    public function setNodesAcls($nodesAcls)
    {
        $this->nodesAcls = $nodesAcls;
    }


    static $cypheredPassPrefix = '$pydio_password$';

    /**
     * Role constructor.
     * @param string $id
     */
    public function __construct($id, IdmRole $idmRole = null, $aclLoadDeferred = false)
    {
        parent::__construct();
        $this->setUuid($id);
        if ($idmRole != null) {
            $this->setGroupRole($idmRole->getGroupRole());
            $this->setUserRole($idmRole->getUserRole());
            $this->setLabel($idmRole->getLabel());
            $this->setLastUpdated($idmRole->getLastUpdated());
            $au = $idmRole->getAutoApplies();
            if(!empty($au)) {
                $this->setAutoApplies($au);
            }
            $this->setIsTeam($idmRole->getIsTeam());
            $this->setPolicies($idmRole->getPolicies());
            $this->setPoliciesContextEditable($idmRole->getPoliciesContextEditable());
            if(!$aclLoadDeferred) {
                $toLoad = [$id => $this];
                RolesService::loadAcls($toLoad);
            }
        }

    }

    /**
     * @return bool
     */
    public function isGroupRole()
    {
        return $this->getGroupRole();
    }

    /**
     * @return bool
     */
    public function isUserRole()
    {
        return $this->getUserRole();
    }

    /**
     * @param string $repositoryId
     * @param string $rightString
     * @return void
     */
    public function setAcl($repositoryId, $rightString)
    {
        if (empty($rightString)) {
            if(isSet($this->acls[$repositoryId])) unset($this->acls[$repositoryId]);
        } else {
            $this->acls[$repositoryId] = $rightString;
        }
        return;
    }
    /**
     * @param string $repositoryId
     * @return string
     */
    public function getAcl($repositoryId)
    {
        if (isSet($this->acls[$repositoryId])) {
            return $this->acls[$repositoryId];
        }
        return "";
    }

    /**
     * @param bool $accessibleOnly If set to true, return only r, w, or rw.
     * @return array Associative array[REPO_ID] => RIGHT_STRING (r / w / rw / PYDIO_VALUE_CLEAR)
     */
    public function listAcls($accessibleOnly = false)
    {
        if(!$accessibleOnly){
            return $this->acls;
        }
        $output = array();
        foreach ($this->acls as $id => $acl) {
            if(empty($acl) || $acl == PYDIO_VALUE_CLEAR) continue;
            $output[$id] = $acl;
        }
        return $output;
    }

    public function clearAcls()
    {
        $this->acls = array();
    }

    /**
     * Send all role informations as an associative array
     * @param bool $blurPasswords
     * @return array
     */
    public function getDataArray($blurPasswords = false)
    {
        $roleData = array();
        $roleData["ACL"] = $this->listAcls();
        $roleData["NODES"] = $this->getNodesAcls();
        $roleData["ACTIONS"] = $this->listActionsStates();
        $roleData["PARAMETERS"] = $this->listParameters(false, $blurPasswords);
        if($this->getAutoApplies() !== null && count($this->getAutoApplies()) > 0){
            $roleData["APPLIES"] = $this->getAutoApplies();
        } else {
            $roleData["APPLIES"] = [];
        }
        return $roleData;
    }

    /**
     * Update the role information from an associative array
     * @see getDataArray()
     * @param array $roleData
     */
    public function bunchUpdate($roleData){
        $this->acls = $roleData["ACL"];
        $this->actions = $roleData["ACTIONS"];
        $this->parameters = $roleData["PARAMETERS"];
        if(count($roleData["APPLIES"]) > 0){
            $this->setAutoApplies($roleData["APPLIES"]);
        }
    }


    /**
     * @param string $pluginId
     * @param string $parameterName
     * @param mixed $parameterValue can be PYDIO_VALUE_CLEAR (force clear previous), or empty string for clearing value (apply previous).
     * @param string|null $repositoryId
     */
    public function setParameterValue($pluginId, $parameterName, $parameterValue, $repositoryId = null)
    {
        if($repositoryId === null) $repositoryId = PYDIO_REPO_SCOPE_ALL;
        if (empty($parameterValue) && $parameterValue !== false && $parameterValue !== "0") {
            if (isSet($this->parameters[$repositoryId][$pluginId][$parameterName])) {
                unset($this->parameters[$repositoryId][$pluginId][$parameterName]);
                if(!count($this->parameters[$repositoryId][$pluginId])) unset($this->parameters[$repositoryId][$pluginId]);
                if(!count($this->parameters[$repositoryId])) unset($this->parameters[$repositoryId]);
            }
        } else {
            $this->parameters = $this->setArrayValue($this->parameters, $repositoryId, $pluginId, $parameterName, $parameterValue);
        }
        return;
    }

    /**
     * @param string $pluginId
     * @param array $parameters
     * @param string $repositoryId
     * @return array
     */
    public function filterPluginConfigs($pluginId, $parameters, $repositoryId){

        $roleParams = $this->listParameters();
        if (isSet($roleParams[PYDIO_REPO_SCOPE_ALL][$pluginId])) {
            $parameters = array_merge($parameters, $roleParams[PYDIO_REPO_SCOPE_ALL][$pluginId]);
        }
        if ($repositoryId !== null && isSet($roleParams[$repositoryId][$pluginId])) {
            $parameters = array_merge($parameters, $roleParams[$repositoryId][$pluginId]);
        }
        return $parameters;

    }

    /**
     * @param string $pluginId
     * @param string $parameterName
     * @param string $repositoryId
     * @param mixed $parameterValue
     * @return mixed
     */
    public function filterParameterValue($pluginId, $parameterName, $repositoryId, $parameterValue)
    {
        if (isSet($this->parameters[$repositoryId][$pluginId][$parameterName])) {
            $v = $this->parameters[$repositoryId][$pluginId][$parameterName];
            if($v === PYDIO_VALUE_CLEAR) return "";
            else return $this->filterCypheredPasswordValue($v);
        }
        if (isSet($this->parameters[PYDIO_REPO_SCOPE_ALL][$pluginId][$parameterName])) {
            $v = $this->parameters[PYDIO_REPO_SCOPE_ALL][$pluginId][$parameterName];
            if($v === PYDIO_VALUE_CLEAR) return "";
            else return $this->filterCypheredPasswordValue($v);
        }
        return $parameterValue;
    }

    /**
     * @param bool $preserveCypheredPasswords
     * @param bool $blurCypheredPasswords
     * @return array Associative array of parameters : array[REPO_ID][PLUGIN_ID][PARAMETER_NAME] = PARAMETER_VALUE
     */
    public function listParameters($preserveCypheredPasswords = false, $blurCypheredPasswords = false)
    {
        if($preserveCypheredPasswords) return $this->parameters;

        $copy = $this->parameters;
        foreach($copy as $repo => &$plugs){
            foreach($plugs as $plugName => &$plugData){
                foreach($plugData as $paramName => &$paramValue){
                    $testValue = $this->filterCypheredPasswordValue($paramValue);
                    if($testValue != $paramValue){
                        if($blurCypheredPasswords) $paramValue = "__PYDIO_VALUE_SET__";
                        else $paramValue = $testValue;
                    }
                }
            }
        }
        return $copy;
    }

    /**
     * @return array
     */
    public function listAutoApplies()
    {
        return $this->autoApplies;
    }

    /**
     * @param String $value
     * @return String
     */
    private function filterCypheredPasswordValue($value){
        if(is_string($value) && strpos($value, self::$cypheredPassPrefix) === 0) return str_replace(self::$cypheredPassPrefix, "", $value);
        return $value;
    }

    /**
     * @param string $pluginId
     * @param string $actionName
     * @param string|null $repositoryId
     * @param string $state
     */
    public function setActionState($pluginId, $actionName, $repositoryId = null, $state = "disabled")
    {
        $this->actions = $this->setArrayValue($this->actions, $repositoryId, $pluginId, $actionName, $state);
        return;
    }

    /**
     * @return array
     */
    public function listActionsStates()
    {
        return $this->actions;
    }

    /**
     * @param RepositoryInterface $repository
     * @return array
     */
    public function listActionsStatesFor($repository)
    {
        $actions = array();
        if (isSet($this->actions[PYDIO_REPO_SCOPE_ALL])) {
            $actions = $this->actions[PYDIO_REPO_SCOPE_ALL];
        }
        if ($repository != null && isSet($this->actions[PYDIO_REPO_SCOPE_SHARED]) && $repository->getScope() !== IdmWorkspaceScope::ADMIN) {
            $actions = $this->array_merge_recursive2($actions, $this->actions[PYDIO_REPO_SCOPE_SHARED]);
        }
        if ($repository != null && isSet($this->actions[$repository->getId()])) {
            $actions = $this->array_merge_recursive2($actions, $this->actions[$repository->getId()]);
        }
        return $actions;
    }

    /**
     * @param string $pluginId
     * @param string $actionName
     * @param string $repositoryId
     * @param boolean $inputState
     * @return boolean
     */
    public function actionEnabled($pluginId, $actionName, $repositoryId, $inputState)
    {
        if (isSet($this->actions[PYDIO_REPO_SCOPE_ALL][$pluginId][$actionName])) {
            return $this->actions[PYDIO_REPO_SCOPE_ALL][$pluginId][$actionName] == "enabled" ? true : false ;
        }
        if (isSet($this->actions[$repositoryId][$pluginId][$actionName])) {
            return $this->actions[$repositoryId][$pluginId][$actionName]  == "enabled" ? true : false ;
        }
        return $inputState;
    }

    /**
     * @return array
     */
    public function listAllActionsStates()
    {
        return $this->actions;
    }

    /**
     * @param Role $role
     * @return Role
     */
    public function override(Role $role)
    {
        $newRole = new Role($role->getId());

        $roleAcl = $role->listAcls();
        $newAcls = $this->array_merge_recursive2($roleAcl, $this->listAcls());
        foreach ($newAcls as $repoId => $rightString) {
            if(empty($rightString) && !empty($roleAcl[$repoId])){
                $rightString = $roleAcl[$repoId];
            }
            $newRole->setAcl($repoId, $rightString);
        }

        $roleParameters = $role->listParameters(true);
        $newParams = $this->array_merge_recursive2($roleParameters, $this->listParameters(true));
        foreach ($newParams as $repoId => $data) {
            foreach ($data as $pluginId => $param) {
                foreach ($param as $parameterName => $parameterValue) {
                    if ($parameterValue === true || $parameterValue === false) {
                        $newRole->setParameterValue($pluginId, $parameterName, $parameterValue, $repoId);
                        continue;
                    }
                    if($parameterValue == PYDIO_VALUE_CLEAR) continue;
                    if($parameterValue === "" && !empty($roleParameters[$repoId][$pluginId][$parameterName])){
                        $parameterValue = $newParams[$repoId][$pluginId][$parameterName];
                    }
                    $newRole->setParameterValue($pluginId, $parameterName, $parameterValue, $repoId);
                }
            }
        }

        $newActions = $this->array_merge_recursive2($role->listActionsStates(), $this->listActionsStates());
        foreach ($newActions as $repoId => $data) {
            foreach ($data as $pluginId => $action) {
                foreach ($action as $actionName => $actionState) {
                    $newRole->setActionState($pluginId, $actionName, $repoId, $actionState);
                }
            }
        }

        $newNodesAcls = $this->array_merge_recursive2($this->getNodesAcls(), $role->getNodesAcls());
        $newRole->setNodesAcls($newNodesAcls);

        return $newRole;
    }

    /**
     * @param array
     * @param key1
     * @param key2
     * @param key3...
     * @param value
     */
    public function setArrayValue()
    {
        $args = func_get_args();
        $arr = $args[0]; //array_shift($args);
        $argMaxIndex = count($args)-1;
        $value = $args[$argMaxIndex]; //array_pop($args);
        $current = &$arr;
        foreach ($args as $index => $key) {
            if($index == 0) continue;
            if ($index < $argMaxIndex -1) {
                if(!isset($current[$key])) $current[$key] = array();
                $current = &$current[$key];
            } else {
                $current[$key] = $value;
                break;
            }
        }
        return $arr;
    }

    /**
     * @param array $array1
     * @param array $array2
     * @return array
     */
    public function array_merge_recursive2($array1, $array2)
    {
        $arrays = func_get_args();
        $narrays = count($arrays);

        // check arguments
        // comment out if more performance is necessary (in this case the foreach loop will trigger a warning if the argument is not an array)
        for ($i = 0; $i < $narrays; $i ++) {
            if (!is_array($arrays[$i])) {
                // also array_merge_recursive returns nothing in this case
                trigger_error('Argument #' . ($i+1) . ' is not an array - trying to merge array with scalar! Returning null!', E_USER_WARNING);
                return null;
            }
        }

        // the first array is in the output set in every case
        $ret = $arrays[0];

        // merege $ret with the remaining arrays
        for ($i = 1; $i < $narrays; $i ++) {
            foreach ($arrays[$i] as $key => $value) {
                            //if (((string) $key) === ((string) intval($key))) { // integer or string as integer key - append
                //    $ret[] = $value;
                //}
                //{ // string key - megre
                    if (is_array($value) && isset($ret[$key])) {
                        // if $ret[$key] is not an array you try to merge an scalar value with an array - the result is not defined (incompatible arrays)
                        // in this case the call will trigger an E_USER_WARNING and the $ret[$key] will be null.
                        $ret[$key] = $this->array_merge_recursive2($ret[$key], $value);
                    } else {
                        $ret[$key] = $value;
                    }
               // }
            }
        }

        return $ret;
    }

    /**
     * @param String $groupPath
     * @param bool $update
     */
    public function setGroupPath($groupPath, $update = true)
    {
        if (empty($groupPath) || $groupPath == "/"){
            return;
        }
        // Find corresponding group and set as owner Uuid
        $api = MicroApi::GetUserServiceApi();
        $q = new IdmUserSingleQuery();
        $q->setFullPath($groupPath);
        $request = new RestSearchUserRequest();
        $request->setQueries([$q]);
        $collection = $api->searchUsers($request);
        if($collection->getGroups() != null) {
            $this->owner = $collection->getGroups()[0];
            $this->setOwnerUuid($this->owner->getUuid());
        }
    }

    /**
     * @return String
     */
    public function getGroupPath()
    {
        /*
        $uuid = $this->getOwnerUuid();
        if(!empty($this->getOwnerUuid()) && empty($this->owner)) {
            // Load Owner, may be a group (=> groupPath) or a user (Owned Role)
            $api = MicroApi::GetUserServiceApi();
            $q = new IdmUserSingleQuery();
            $q->setUuid($uuid);
            $request = new RestSearchUserRequest();
            $request->setQueries([$q]);
            $collection = $api->search($request);
            if($collection->getUsers() != null) {
                $this->owner = $collection->getUsers()[0];
            } else if($collection->getGroups() != null) {
                $this->owner = $collection->getGroups()[0];
            }
        }
        if(!empty($this->owner) && $this->owner->getIsGroup()){
            return rtrim($this->owner->getGroupPath(), "/") . "/" . $this->owner->getGroupLabel();
        }*/
        return "/";
    }

    /**
     * @return String
     */
    public function getId()
    {
        return $this->getUuid();
    }

    /**
     * @return mixed
     */
    public function alwaysOverrides()
    {
        $value = $this->filterParameterValue("core.conf", "ROLE_FORCE_OVERRIDE", PYDIO_REPO_SCOPE_ALL, false);
        if(is_string($value)) {
            return $value === "true";
        } else {
            return boolval($value);
        }
   }

    /**
     * @param string $specificRight
     * @return boolean
     */
    public function autoAppliesTo($specificRight)
    {
        if(empty($specificRight)) return false;
        $autoApplies = $this->getAutoApplies();
        if($autoApplies === null){
            return false;
        }
        return in_array($specificRight, $autoApplies);
    }
}

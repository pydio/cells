<?php
/*
 * Copyright 2007-2016 Abstrium <contact (at) pydio.com>
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
 * The latest code can be found at <https://pydio.com/>.
 */
namespace Pydio\Conf\Core;

use Pydio\Conf\Core\Role;
use Pydio\Conf\Core\IGroupPathProvider;
use Pydio\Core\Exception\PydioException;
use Pydio\Core\Exception\UserNotFoundException;
use Pydio\Core\Http\Client\MicroApi;
use Pydio\Core\Model\UserInterface;
use Pydio\Core\Services\RepositoryService;
use Pydio\Core\Services\RolesService;
use Swagger\Client\Api\UserServiceApi;
use Swagger\Client\Model\IdmNodeType;
use Swagger\Client\Model\IdmRole;
use Swagger\Client\Model\IdmUser;
use Swagger\Client\Model\IdmUserSingleQuery;
use Swagger\Client\Model\RestSearchUserRequest;
use Swagger\Client\Model\ServiceResourcePolicy;

defined('PYDIO_EXEC') or die('Access not allowed');

class PydioUser implements UserInterface
{
    private $boolAttributes = ["hidden", "active", "admin"];
    private $stringAttributes = ["profile", "parent", "displayName", "email", "avatar"];
    /**
     * @var IdmUser
     */
    private $idm;

    /**
     * @var
     */
    private $login;

    /**
     * @var Role
     */
    private $personalRole;
    /**
     * @var Role;
     */
    private $mergedRole;


    public function __construct($id, $loadedIdm = null, $personalIdmRole = null, $dontLoad = false)
    {
        $this->login = $id;
        if($loadedIdm !== null) {
            $this->idm = $loadedIdm;
            if(!$dontLoad){
                $this->loadRolesFromIdm($personalIdmRole);
            }
        } else {
            $this->idm = new IdmUser();
            $this->idm->setLogin($this->login);
            $this->load();
        }
    }

    /**
     * @return IdmUser
     */
    public function getIdmUser(){
        return $this->idm;
    }

    /**
     * @param bool $hidden
     */
    public function setHidden($hidden){
        $this->setIdmAttribute("hidden", true);
    }

    /**
     * @return bool
     */
    public function isHidden(){
        return $this->getIdmAttribute("hidden", false);
    }

    /**
     * @param ServiceResourcePolicy[] $policies
     */
    public function setPolicies($policies){
        $this->idm->setPolicies($policies);
    }

    /**
     * @return ServiceResourcePolicy[]
     */
    public function getPolicies() {
        return $this->idm->getPolicies();
    }

    public function getPersonalRoleUuid(){
        $uuid = $this->idm->getUuid();
        if (empty($uuid)) {
            throw new PydioException("Trying to get Uuid of user not yet loaded");
        }
        return $uuid;
    }

    /**
     * @return string
     */
    public function getId(){
        return $this->login;
    }

    /**
     * @return string
     */
    public function getUuid()
    {
        return $this->idm->getUuid();
    }

    /**
     * @param string $id
     */
    public function setId($id){
        $this->login = $id;
    }

    /**
     * @return bool
     */
    public function storageExists(){
        return true;
    }

    /**
     * @param Role $roleObject
     */
    public function addRole($roleObject){
        $roles = $this->getIdmRoles();
        foreach($roles as $existing){
            if ($existing->getUuid() == $roleObject->getId()){
                return;
            }
        }
        $roles[] = $roleObject;
        $this->setIdmRoles($roles);
    }

    /**
     * @param string $roleId
     * @throws \Exception
     */
    public function removeRole($roleId){
        $roles = $this->getIdmRoles();
        $newRoles = [];
        foreach($roles as $index => $existing){
            if ($existing->getUuid() != $roleId){
                $newRoles[] = $existing;
            }
        }
        $this->setIdmRoles($newRoles);
    }

    /**
     * @param $orderedRolesIds array of roles ids
     */
    public function updateRolesOrder($orderedRolesIds){

    }

    /**
     * @return Role[]
     */
    public function getRoles(){
        $roles = $this->getIdmRoles();
        $result = [];
        foreach($roles as $idmRole){
            $pRole = new Role($idmRole->getUuid(), $idmRole);
            $result[$pRole->getUuid()] = $pRole;
        }
        return $result;
    }

    /**
     * @return Role[]
     */
    public function getNonReservedRoles(){
        $userRoles = $this->getIdmRoles();
        $result = [];
        foreach($userRoles as $role){
            if($role->getUserRole() || $role->getGroupRole()){
                continue;
            }
            $pRole = new Role($role->getUuid(), $role, true);
            $result[$pRole->getUuid()] = $pRole;
        }
        return $result;
    }


    /**
     * @return string
     */
    public function getProfile(){
        return $this->getIdmAttribute("profile", "");
    }

    /**
     * @param string $profile
     */
    public function setProfile($profile){
        $this->setIdmAttribute("profile", $profile);
    }

    /**
     * @return bool
     */
    public function hasSharedProfile(){
        $p = $this->getProfile();
        return $p === "shared";
    }

    /**
     * @param string $lockAction
     * @throws \Exception
     */
    public function setLock($lockAction){
        $locks = $this->getIdmAttribute("locks", []);
        $locks[$lockAction] = true;
        $this->setIdmAttribute("locks", $locks);
    }

    /**
     * @throws \Exception
     */
    public function removeLock($lockAction){
        $locks = $this->getIdmAttribute("locks", []);
        $locks[$lockAction] = false;
        $this->setIdmAttribute("locks", $locks);

    }

    /**
     * @param $lockAction
     * @return string|false
     */
    public function hasLockByName($lockAction){
        $locks = $this->getIdmAttribute("locks", []);
        if(isSet($locks[$lockAction])){
            return $locks[$lockAction];
        }
        $roleLock = $this->mergedRole->filterParameterValue("core.conf", "USER_LOCK_ACTION", PYDIO_REPO_SCOPE_ALL, "");
        if(!empty($roleLock)){
            $roleLocks = explode(",", $roleLock);
            if(in_array($lockAction, $roleLocks)) return true;
        }
        return false;
    }

    /**
     * @return string|false
     */
    public function getLock(){
        $locks = $this->getIdmAttribute("locks", []);
        $roleLock = $this->mergedRole->filterParameterValue("core.conf", "USER_LOCK_ACTION", PYDIO_REPO_SCOPE_ALL, "");
        if(!empty($roleLock)){
            $roleLocks = explode(",", $roleLock);
            foreach($roleLocks as $rLock){
                if(isSet($locks[$rLock]) && $locks[$rLock] === false){
                    continue;
                }
                $locks[$rLock] = true;
            }
        }
        $locks = array_filter($locks, function ($v){return $v;});
        return implode(",", array_keys($locks));
    }

    /**
     * @return bool
     */
    public function isAdmin(){
        $p = $this->getProfile();
        if(!empty($p) && $p == "admin") {
            return true;
        }
        return $this->getIdmAttribute("admin", false);
    }

    /**
     * @param bool $boolean
     */
    public function setAdmin($boolean){
        $this->setIdmAttribute("admin", $boolean);
        $this->setProfile("admin");
    }

    /**
     * @param $prefName
     * @return mixed|string
     */
    public function getPref($prefName){
        $preferences = $this->getIdmAttribute("preferences", []);
        if (isSet($preferences[$prefName])) {
            if ($prefName == "gui_preferences") {
                return base64_decode($preferences[$prefName]);
            }
            return $preferences[$prefName];
        } else {
            return null;
        }
    }

    /**
     * @param $prefName
     * @param $prefValue
     */
    public function setPref($prefName, $prefValue){
        if ($prefName == "gui_preferences") {
            $prefValue = base64_encode($prefValue);
        }
        $preferences = $this->getIdmAttribute("preferences", []);
        $preferences[$prefName] = $prefValue;
        $this->setIdmAttribute("preferences", $preferences);
    }

    /**
     * @param string $prefName
     * @param string $prefPath
     * @param mixed $prefValue
     */
    public function setArrayPref($prefName, $prefPath, $prefValue){
        return null;
    }

    /**
     * @param $prefName
     * @param $prefPath
     * @return mixed|string
     */
    public function getArrayPref($prefName, $prefPath){
        return null;
    }

    /**
     * @param $repositoryId
     * @param string $path
     * @param string $title
     * @return
     */
    public function addBookmark($repositoryId, $path, $title){
        $bookmarks = $this->getIdmAttribute("bookmarks", []);
        if (!isSet($bookmarks[$repositoryId])) $bookmarks[$repositoryId] = [];
        $bookmarks[$repositoryId][$path] = $title;
        $this->setIdmAttribute("bookmarks", $bookmarks);
    }

    /**
     * @param string $repositoryId
     * @param string $path
     */
    public function removeBookmark($repositoryId, $path){
        $bookmarks = $this->getIdmAttribute("bookmarks", []);
        if (isSet($bookmarks[$repositoryId]) && isSet($bookmarks[$repositoryId][$path])){
            unset($bookmarks[$repositoryId][$path]);
        }
        $this->setIdmAttribute("bookmarks", $bookmarks);
    }

    /**
     * @param string $repositoryId
     * @param string $path
     * @param string $title
     */
    public function renameBookmark($repositoryId, $path, $title){
        $bookmarks = $this->getIdmAttribute("bookmarks", []);
        if (isSet($bookmarks[$repositoryId]) && isSet($bookmarks[$repositoryId][$path])){
            $bookmarks[$repositoryId][$path] = $title;
        }
        $this->setIdmAttribute("bookmarks", $bookmarks);
    }

    /**
     * @return array
     */
    public function getBookmarks($repositoryId){
        $bookmarks = $this->getIdmAttribute("bookmarks", []);
        if (isSet($bookmarks[$repositoryId])){
            return $bookmarks[$repositoryId];
        }
        return [];
    }

    /**
     * Check if the current user can administrate the GroupPathProvider object
     * @param IGroupPathProvider $provider
     * @return bool
     */
    public function canAdministrate(IGroupPathProvider $provider)
    {
        $pGP = $provider->getGroupPath();
        if(empty($pGP)) $pGP = "/";
        if($this->getGroupPath() == null) return true;
        return (strpos($pGP, $this->getGroupPath(), 0) === 0);
    }

    /**
     * Check if the current user can assign administration for the GroupPathProvider object
     * @param IGroupPathProvider $provider
     * @return bool
     */
    public function canSee(IGroupPathProvider $provider)
    {
        $pGP = $provider->getGroupPath();
        if(empty($pGP)) $pGP = "/";
        if($this->getGroupPath() == null || $pGP == null) return true;
        return (strpos($this->getGroupPath(), $pGP, 0) === 0);
    }

    /**
     * Automatically set the group to the current user base
     * @param $baseGroup
     * @return string
     */
    public function getRealGroupPath($baseGroup){
        // make sure it starts with a slash.
        $baseGroup = "/".ltrim($baseGroup, "/");
        $groupPath = $this->getGroupPath();
        if(empty($groupPath)) $groupPath = "/";
        if ($groupPath != "/") {
            if($baseGroup == "/") return $groupPath;
            else return $groupPath.$baseGroup;
        } else {
            return $baseGroup;
        }
    }

    /**
     * @abstract
     * @return String
     */
    public function getGroupPath(){
        return $this->idm->getGroupPath();
    }


    /**
     * @abstract
     * @param String $groupPath
     * @param bool $update Save use after setting groupPath
     * @return void
     */
    public function setGroupPath($groupPath, $update=true){
        $this->idm->setGroupPath($groupPath);
        if ($update) {
            $this->save();
        }
    }



    /**
     * @return mixed
     */
    public function load(){

        $api = MicroApi::GetUserServiceApi();
        $subQuery = new IdmUserSingleQuery();
        $subQuery->setLogin($this->login);
        $query = new RestSearchUserRequest();
        $query->setLimit(1);
        $query->setQueries([$subQuery]);
        $collection = $api->searchUsers($query);
        if ($collection->getTotal() == 0) {
            throw new UserNotFoundException($this->getId());
        }
        $this->idm = $collection->getUsers()[0];
        $this->loadRolesFromIdm();
    }

    protected function loadRolesFromIdm($personalIdmRole = null){
        if($personalIdmRole != null) {
            $this->personalRole = new Role($personalIdmRole->getUuid(), $personalIdmRole);
        } else {
            $roles = $this->idm->getRoles();
            if ($roles != null) {
                foreach ($roles as $idmRole) {
                    if ($idmRole->getUuid() == $this->idm->getUuid()) {
                        $this->personalRole = new Role($idmRole->getUuid(), $idmRole);
                    }
                }
            }
        }
        $this->recomputeMergedRole();
    }

    /**
     * @param string $context
     */
    public function save($includePersonalAcls = false, $includePersonalRole = true){
        $api = MicroApi::GetUserServiceApi();
        $this->idm = $api->putUser($this->idm->getLogin(), $this->idm);
        if ($includePersonalRole && $this->personalRole != null) {
            $this->personalRole->setUserRole(true);
            RolesService::updateRole($this->personalRole, $includePersonalAcls);
        }
    }

    /**
     * Just save the set of roles for this user, no
     * other attributes.
     */
    public function saveRoles() {
        $api = MicroApi::GetUserServiceApi();
        $this->idm = $api->putRoles($this->idm->getLogin(), $this->idm);
    }

    /**
     * @param $userUuid string
     * @return string
     * @throws UserNotFoundException
     */
    public static function getUserByUuid($userUuid){
        $api = MicroApi::GetUserServiceApi();
        $subQuery = new IdmUserSingleQuery();
        $subQuery->setUuid($userUuid);
        $subQuery->setNodeType(IdmNodeType::USER);
        $query = new RestSearchUserRequest();
        $query->setLimit(1);
        $query->setQueries([$subQuery]);
        $collection = $api->searchUsers($query);
        if ($collection->getTotal() == 0) {
            throw new UserNotFoundException($userUuid);
        }
        return $collection->getUsers()[0];
    }

    /**
     * @param string
     * @param mixed
     * @return mixed
     */
    public function getPersonalAttribute($attributeName, $defaultValue = null){
        $att = $this->getIdmAttribute($attributeName, $defaultValue);
        if (empty($att)) {
            return $defaultValue;
        }
        return $att;
    }

    /**
     * @param string
     * @param mixed
     * @return string
     */
    public function setPersonalAttribute($attributeName, $attributeValue){
        $this->setIdmAttribute($attributeName, $attributeValue);
    }


    /**
     * @param string $key
     * @return mixed
     */
    public function getTemporaryData($key){

    }

    /**
     * @param string $key
     * @param mixed $value
     * @return mixed
     */
    public function saveTemporaryData($key, $value){

    }

    /**
     * Rebuild the current merged role
     * @throws \Exception
     */
    public function recomputeMergedRole(){

        $loadedRoles = [];
        $roles = $this->idm->getRoles();
        if ($roles != null) {
            foreach ($roles as $idmRole) {
                $loadedRoles[$idmRole->getUuid()] = new Role($idmRole->getUuid(), $idmRole, true);
            }
            RolesService::loadAcls($loadedRoles);
        } else {
            return;
        }

        // TODO : ENFORCE ROLES SORTING ?
        //uksort($this->roles, array($this, "orderRoles"));

        $keys = array_keys($loadedRoles);
        $this->mergedRole =  clone $loadedRoles[array_shift($keys)];
        if (count($loadedRoles) > 1) {
            $this->parentRole = $this->mergedRole;
        }
        $index = 0;
        foreach ($loadedRoles as $role) {
            if ($index > 0) {
                $this->mergedRole = $role->override($this->mergedRole);
                if($index < count($loadedRoles) -1 ) $this->parentRole = $role->override($this->parentRole);
            }
            $index ++;
        }
        if ($this->hasSharedProfile() && isSet($this->parentRole)) {
            // It's a shared user, we don't want it to inherit the rights...
            $this->parentRole->clearAcls();
            //... but we want the parent user's role, filtered with inheritable properties only.
            //$stretchedParentUserRole = RolesService::limitedRoleFromParent($this->getParent());
            //if ($stretchedParentUserRole !== null) {
            //    $this->parentRole = $stretchedParentUserRole->override($this->parentRole);  //$this->parentRole->override($stretchedParentUserRole);
                // REAPPLY SPECIFIC "SHARED" ROLES & "OWNED" ROlES ( = teams )
                foreach ($loadedRoles as $role) {
                    if($role->autoAppliesTo("shared") || $role->getIsTeam()) {
                        $this->parentRole = $role->override($this->parentRole);
                    }
                }
            //}
            $this->mergedRole = $this->personalRole->override($this->parentRole);  // $this->parentRole->override($this->personalRole);
        }

    }

    /**
     * @return Role
     */
    public function getMergedRole(){
        return $this->mergedRole;
    }

    /**
     * @return Role
     */
    public function getPersonalRole(){
        if(empty($this->personalRole)){
            $idmRole = new IdmRole();
            $idmRole->setUuid($this->getUuid());
            $idmRole->setUserRole(true);
            $idmRole->setPolicies($this->getPolicies());
            $this->personalRole = new Role($this->getUuid(), $idmRole);
        }
        return $this->personalRole;
    }

    /**
     * @param Role $role
     */
    public function updatePersonalRole(Role $role){
        $this->personalRole = $role;
        //$this->mergedRole = $role;
        $this->recomputeMergedRole();
    }

    /**
     * @return array
     */
    public function getRolesKeys(){
        if ($this->idm == null) {
            $this->load();
        }
        $out = [];
        $roles = $this->idm->getRoles();
        if ($roles != null) {
            foreach ($roles as $role){
                $out[] = $role->getUuid();
            }
        }
        return $out;
    }

    /**
     * @param $name string
     * @param $value mixed
     */
    private function setIdmAttribute($name, $value){
        if ($this->idm == null) {
            $this->load();
        }
        $attributes = $this->idm->getAttributes();
        if ($attributes == null) {
            $attributes = [];
        }
        if (in_array($name, $this->boolAttributes)) {
            $value = $value ? "true" : "false";
        } else if(in_array($name, $this->stringAttributes)) {
            // keep string
        } else {
            $value = json_encode($value);
        }
        $attributes[$name] = $value;
        $this->idm->setAttributes($attributes);
    }

    /**
     * @param $name
     * @return mixed|null
     */
    private function getIdmAttribute($name, $default = null) {
        if ($this->idm == null) {
            $this->load();
        }
        $attributes = $this->idm->getAttributes();
        if ($attributes == null) {
            $attributes = [];
        }
        if (array_key_exists($name, $attributes)) {
            $value = $attributes[$name];
            if (in_array($name, $this->boolAttributes)) {
                return boolval($value);
            } else if(in_array($name, $this->stringAttributes)) {
                return $value;
            } else {
                return json_decode($value, true);
            }
        } else {
            return $default;
        }
    }

    /**
     * @return array|\Swagger\Client\Model\IdmRole[]
     */
    private function getIdmRoles() {
        if ($this->idm == null) {
            $this->load();
        }
        $roles = $this->idm->getRoles();
        if ($roles == null) {
            $roles = [];
        }
        return $roles;
    }

    /**
     * @param $roles array|\Swagger\Client\Model\IdmRole[]
     */
    private function setIdmRoles($roles) {
        if ($this->idm == null) {
            $this->load();
        }
        $this->idm->setRoles($roles);
    }

}
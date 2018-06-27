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
namespace Pydio\Auth\Driver;

use Exception;
use Pydio\Auth\Core\AbstractAuthDriver;
use Pydio\Conf\Core\PydioUser;
use Pydio\Core\Exception\PydioException;
use Pydio\Core\Http\Client\MicroApi;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Model\UserInterface;
use Pydio\Core\Utils\Vars\OptionsHelper;
use Pydio\Core\Utils\Vars\PasswordEncoder;
use Pydio\Core\Utils\Vars\StringHelper;
use Swagger\Client\Model\IdmNodeType;
use Swagger\Client\Model\IdmSearchUserRequest;
use Swagger\Client\Model\IdmUser;
use Swagger\Client\Model\IdmUserSingleQuery;
use Swagger\Client\Model\ProtobufAny;
use Swagger\Client\Model\ResourcePolicyQueryQueryType;
use Swagger\Client\Model\RestResourcePolicyQuery;
use Swagger\Client\Model\RestSearchUserRequest;
use Swagger\Client\Model\ServiceOperationType;
use Swagger\Client\Model\ServiceQuery;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * Store authentication data in an SQL database
 * @package AjaXplorer_Plugins
 * @subpackage Auth
 */
class PydioAuthDriver extends AbstractAuthDriver
{
    public $sqlDriver;
    public $driverName = "sql";

    /**
     * Wether users can be listed using offset and limit
     * @return bool
     */
    public function supportsUsersPagination()
    {
        return true;
    }

    // $baseGroup = "/"
    /**
     * List users using offsets
     * @param string $baseGroup
     * @param string $regexp
     * @param int $offset
     * @param int $limit
     * @param bool $recursive
     * @return []
     */
    public function listUsersPaginated($baseGroup, $regexp, $offset, $limit, $recursive = false)
    {
        $api = MicroApi::GetUserServiceApi();
        $subQueries = [];

        // Exclude hidden entries
        $subQueries[] = (new IdmUserSingleQuery())
            ->setAttributeName("hidden")
            ->setAttributeValue("true")
            ->setNot(true);

        $subQueries[] = (new IdmUserSingleQuery())
            ->setGroupPath($baseGroup)
            ->setRecursive($recursive);

        if (!empty($regexp)) {
            $subQueries[] = (new IdmUserSingleQuery())->setLogin(ltrim($regexp, "^"). "*");
        }

        $resourcePolicyQuery = new RestResourcePolicyQuery();
        $resourcePolicyQuery->setType(ResourcePolicyQueryQueryType::ANY);

        $query = new RestSearchUserRequest();
        $query->setQueries($subQueries);
        $query->setOperation(ServiceOperationType::_AND);
        $query->setResourcePolicyQuery($resourcePolicyQuery);
        if ($limit > 0) {
            $query->setLimit($limit);
        }
        if($offset >= 0) {
            $query->setOffset($offset);
        }
        $collection = $api->searchUsers($query);
        $pairs = [];
        if ($collection->getUsers() != null) {
            foreach ($collection->getUsers() as $user) {
                $pairs[$user->getLogin()] = new PydioUser($user->getLogin(), $user, null, true);
            }
        }
        return $pairs;

    }

    /**
     * See parent method
     * @param string $baseGroup
     * @param string $userLogin
     * @param int $usersPerPage
     * @param int $offset
     * @return float
     */
    public function findUserPage($baseGroup, $userLogin, $usersPerPage, $offset = 0)
    {
        return 1;
    }

    /**
     * @param string $baseGroup
     * @param string $regexp
     * @param null|string $filterProperty Can be "admin" or "parent"
     * @param null|string $filterValue Can be a user Id, or FILTER_EMPTY or FILTER_NOT_EMPTY
     * @param bool $recursive
     * @return int
     */
    public function getUsersCount($baseGroup = "/", $regexp = "", $filterProperty = null, $filterValue = null, $recursive = true)
    {

        $api = MicroApi::GetUserServiceApi();
        $subQuery = new IdmUserSingleQuery();
        // Exclude hidden entries
        $subQuery->setAttributeName("hidden");
        $subQuery->setAttributeValue("true");
        $subQuery->setNot(true);

        $subQuery->setGroupPath($baseGroup);
        $subQuery->setRecursive($recursive);

        if ($regexp != null) {
            $subQuery->setLogin(ltrim($regexp, "^") . "*");
        }

        if ($filterProperty !== null && $filterValue !== null) {

            if ($filterProperty == "parent") {
                $subQuery->setAttributeName("ajxp.parent_user");
                $subQuery->setAttributeAnyValue(true);
                $subQuery->setNot(true);
            } else if ($filterProperty == "admin") {
                $subQuery->setAttributeName("admin");
            } else {
                $subQuery->setAttributeName($filterProperty);
            }

            if ($filterValue == PYDIO_FILTER_EMPTY) {
                $subQuery->setAttributeAnyValue(true);
                $subQuery->setNot(true);
            } else if ($filterValue == PYDIO_FILTER_NOT_EMPTY) {
                $subQuery->setAttributeAnyValue(true);
                $subQuery->setNot(true);
            } else {
                $subQuery->setAttributeValue($filterValue);
            }
        }


        $query = new RestSearchUserRequest();
        $query->setQueries([$subQuery]);

        $globalQuery = new RestResourcePolicyQuery();
        $globalQuery->setType(ResourcePolicyQueryQueryType::ANY);
        $query->setResourcePolicyQuery($globalQuery);

        $query->setCountOnly(true);
        $collection = $api->searchUsers($query);
        return $collection->getTotal();

    }

    /**
     * @param string $baseGroup
     * @param $policyContext ResourcePolicyQueryQueryType
     * @return IdmUser[]
     */
    public function listChildrenGroups($baseGroup = "/", $policyContext = ResourcePolicyQueryQueryType::ANY, $term = null, $recursive = false)
    {

        $api = MicroApi::GetUserServiceApi();
        $subQueries = [];
        $subQuery = new IdmUserSingleQuery();
        $subQueries[] = $subQuery;


        $subQuery->setGroupPath($baseGroup);
        if($term != null) {
            $attQuery = (new  IdmUserSingleQuery())
                ->setAttributeName("displayName")
                ->setAttributeValue($term . "*");
            $subQueries[] = $attQuery;
        }
        $subQuery->setRecursive($recursive);
        $subQuery->setNodeType(IdmNodeType::GROUP);

        $query = new RestSearchUserRequest();
        $query->setQueries($subQueries);
        $query->setOperation(ServiceOperationType::_AND);

        $globalQuery = new RestResourcePolicyQuery();
        $globalQuery->setType($policyContext);
        $query->setResourcePolicyQuery($globalQuery);

         $collection = $api->searchUsers($query);
         $pairs = [];
         if ($collection->getGroups() != null) {
             foreach ($collection->getGroups() as $group) {
                 $base = $group->getGroupLabel();
                 $pairs["/" . ltrim($base, "/")] = $group;
             }
         }
         return $pairs;

    }


    /**
     * @abstract
     * @param $userId
     * @return UserInterface[]
     */
    public function getUserChildren($userId){

        $api = MicroApi::GetUserServiceApi();
        $subQuery = new IdmUserSingleQuery();
        $subQuery->setAttributeName("parent");
        $subQuery->setAttributeValue($userId);
        $hidQuery = new IdmUserSingleQuery();
        $hidQuery->setAttributeName("hidden");
        $hidQuery->setAttributeValue("true");
        $hidQuery->setNot(true);
        $query = new RestSearchUserRequest();
        $query->setOperation(ServiceOperationType::_AND);
        $query->setQueries([$subQuery, $hidQuery]);
        $collection = $api->searchUsers($query);
        $pairs = [];
        if ($collection->getUsers() != null) {
            foreach ($collection->getUsers() as $user) {
                $pairs[] = new PydioUser($user->getLogin(), $user);
            }
        }
        return $pairs;

    }

    /**
     * Bulk load users children
     * @param $userUuids[]
     * @return UserInterface[]
     */
    public function getUsersChildren($userUuids, $withHidden = false){

        if(empty($userUuids)) {
            return [];
        }
        $api = MicroApi::GetUserServiceApi();
        $queries = [];
        foreach($userUuids as $userId) {
            $subQuery = new IdmUserSingleQuery();
            $subQuery->setAttributeName("parent");
            $subQuery->setAttributeValue($userId);
            $queries[] = $subQuery;
        }
        $query = new RestSearchUserRequest();
        $query->setOperation(ServiceOperationType::_OR);
        $query->setQueries($queries);
        $collection = $api->searchUsers($query);
        $pairs = [];
        if ($collection->getUsers() != null) {
            foreach ($collection->getUsers() as $user) {
                $pydioUser = new PydioUser($user->getLogin(), $user);
                if(!$withHidden && $pydioUser->isHidden()) {
                    continue;
                }
                $pairs[$user->getLogin()] = $pydioUser;
            }
        }
        return $pairs;

    }

    /**
     * @param $login
     * @return boolean
     */
    public function userExists($login)
    {

        $api = MicroApi::GetUserServiceApi();
        $subQuery = new IdmUserSingleQuery();
        // Exclude hidden entries
        $subQuery->setLogin($login);
        $query = new RestSearchUserRequest();
        $query->setCountOnly(true);
        $query->setQueries([$subQuery]);
        $collection = $api->searchUsers($query);
        return $collection->getTotal() > 0;

    }

    /**
     * @param string $login
     * @param string $pass
     * @return bool
     */
    public function checkPassword($login, $pass)
    {
        return false;
    }

    /**
     * @return bool
     */
    public function usersEditable()
    {
        return true;
    }

    /**
     * @return bool
     */
    public function passwordsEditable()
    {
        return true;
    }

    /**
     * @param $login
     * @param $passwd
     */
    public function createUser($login, $passwd, $groupPath = "/")
    {
        $api = MicroApi::GetUserServiceApi();
        $user = new IdmUser();
        $user->setLogin($login);
        $user->setPassword($passwd);
        $user->setGroupPath($groupPath);
        $createdUser = $api->putUser($login, $user);
    }

    /**
     * @param $login
     * @param $newPass
     */
    public function changePassword($login, $newPass)
    {
        $api = MicroApi::GetUserServiceApi();

        $subQuery = new IdmUserSingleQuery();
        $subQuery->setLogin($login);
        $query = new RestSearchUserRequest();
        $query->setLimit(1);
        $query->setQueries([$subQuery]);
        $collection = $api->searchUsers($query);
        if ($collection->getTotal() == 0) {
            throw new UserNotFoundException($this->getId());
        }
        $idmUser = $collection->getUsers()[0];
        $idmUser->setPassword($newPass);
        $api->putUser($login, $idmUser);
    }

    /**
     * @param $login
     */
    public function deleteUser($login)
    {
        $api = MicroApi::GetUserServiceApi();
        $api->deleteUser($login);
    }


    /**
     * Check if group already exists
     * @param string $groupPath
     * @return boolean
     */
    public function groupExists($groupPath){

        $api = MicroApi::GetUserServiceApi();
        $subQuery = new IdmUserSingleQuery();

        $subQuery->setFullPath($groupPath);

        $query = new RestSearchUserRequest();
        $query->setCountOnly(true);
        $query->setQueries([$subQuery]);
        $collection = $api->searchUsers($query);
        return $collection->getTotal() > 0;

    }

    /**
     * Load a group object by path
     * @param $groupPath
     * @return bool|IdmUser
     */
    public function getGroupByPath($groupPath){

        $api = MicroApi::GetUserServiceApi();
        $subQuery = new IdmUserSingleQuery();

        $subQuery->setFullPath($groupPath);

        $query = new RestSearchUserRequest();
        $query->setQueries([$subQuery]);
        $collection = $api->searchUsers($query);
        if (is_array($collection->getGroups()) && count($collection->getGroups()) > 0){
            return $collection->getGroups()[0];
        }else {
            return false;
        }

    }

    /**
     * @param string $groupUuid
     * @return bool|IdmUser
     */
    public function getGroupById($groupUuid){

        $api = MicroApi::GetUserServiceApi();
        $subQuery = new IdmUserSingleQuery();

        $subQuery->setUuid($groupUuid);
        $subQuery->setNodeType(IdmNodeType::GROUP);

        $query = new RestSearchUserRequest();
        $query->setQueries([$subQuery]);
        $collection = $api->searchUsers($query);
        if (is_array($collection->getGroups()) && count($collection->getGroups()) > 0){
            return $collection->getGroups()[0];
        }else {
            return false;
        }

    }

    /**
     * @param string $groupPath
     * @param string $groupLabel
     * @return mixed
     */
    public function createGroup($groupPath, $groupLabel){
        $api = MicroApi::GetUserServiceApi();
        $group = new IdmUser();
        $group->setIsGroup(true);
        $group->setGroupPath($groupPath);
        $baseName = basename($groupPath);
        $group->setGroupLabel($baseName);
        $group->setAttributes(["displayName" => $groupLabel]);
        $createdUser = $api->putUser($baseName, $group);
    }

    /**
     * @abstract
     * @param $groupPath
     * @return void
     */
    public function deleteGroup($groupPath){
        $api = MicroApi::GetUserServiceApi();
        $arg = ltrim($groupPath . "/", "/");
        if(empty($arg)){
            throw new PydioException("Cannot delete root path");
        }
        $api->deleteUser(ltrim($groupPath . "/", "/"));
    }

    /**
     * @abstract
     * @param string $groupPath
     * @param string $groupLabel
     * @return void
     */
    public function relabelGroup($groupPath, $groupLabel){
        $this->createGroup($groupPath, $groupLabel);
        //throw new PydioException("Not Implemented");
    }

    /**
     * @param $login
     * @return mixed
     */
    public function getUserPass($login)
    {
        return "";
    }

}

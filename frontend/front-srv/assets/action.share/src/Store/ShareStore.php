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
namespace Pydio\Share\Store;


use Pydio\Access\Core\Model\Node;
use Pydio\Conf\Sql\SqlConfDriver;
use Pydio\Core\Exception\UserNotFoundException;
use Pydio\Core\Http\Client\SimpleStoreApi;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Model\FilteredRepositoriesList;
use Pydio\Core\Model\RepositoryInterface;
use Pydio\Core\Model\UserInterface;
use Pydio\Core\Services\LocaleService;
use Pydio\Core\Services\PoliciesFactory;
use Pydio\Core\Services\RepositoryService;
use Pydio\Core\Services\RolesService;
use Pydio\Core\Services\UsersService;
use Pydio\Log\Core\Logger;
use Pydio\OCS\Model\TargettedLink;
use Pydio\Share\Model\CompositeShare;
use Pydio\Share\Model\ShareLink;
use Swagger\Client\Model\DocstoreDocument;

defined('PYDIO_EXEC') or die( 'Access not allowed');

/**
 * Class ShareStore
 * @package Pydio\Share\Store
 */
class ShareStore {

    /**
     * @var int
     */
    private $hashMinLength;


    /** @var  ContextInterface */
    private $context;

    /**
     * ShareStore constructor.
     * @param ContextInterface $context
     * @param string $downloadFolder
     * @param int $hashMinLength
     */
    public function __construct(ContextInterface $context, $hashMinLength = 32){
        $this->context = $context;
        $this->hashMinLength = $hashMinLength;
    }

    /**
     * @return int
     */
    public function getHashMinLength(){
        return $this->hashMinLength;
    }

    /**
     * @param $nodeId
     * @param $wsId
     */
    public function loadCompositeShare($nodeId, $wsId){
        $composite = new CompositeShare($nodeId, $wsId);
        $this->loadLinks($composite);
        return $composite;
    }

    /**
     * TODO: HANDLE SCOPE
     * TODO: HANDLE MULTIPLE COMPOSITE SHARES
     * @param \Pydio\Access\Core\Model\Node $node
     * @param string $scope
     * @return CompositeShare[]
     */
    public function loadCompositeSharesForNode($node, $scope = "private"){

        $composites = array();
        $node->loadNodeInfo();
        $wsShares = $node->workspaces_shares;
        if(empty($wsShares)){
            return $composites;
        }
        foreach($wsShares as $workspace){
            $wsId = $workspace["UUID"];
            $composites[] = $this->loadCompositeShare($node->getUuid(), $wsId);
        }
        return $composites;

    }

    /**
     * @param CompositeShare $compositeShare
     */
    protected function loadLinks(CompositeShare &$compositeShare) {

        $metaQuery = "+REPOSITORY:\"".SimpleStoreApi::escapeMetaValue($compositeShare->getRepositoryId()). "\"";
        $api = new SimpleStoreApi();
        $docs = $api->listDocuments("share", $metaQuery);
        if(is_array($docs)){
            foreach($docs as $hash => $data){
                if($data["SHARE_TYPE"] == "repository") continue;
                if(isSet($data["TARGET"]) && $data["TARGET"] == "remote"){
                    $link = new TargettedLink($this, $data);
                }else{
                    $link = new ShareLink($this, $data);
                }
                $link->setHash($hash);
                $compositeShare->addLink($link);
            }
        }

    }


    /**
     * @param String $parentRepositoryId
     * @param array $shareData
     * @param string $type
     * @param String $existingHash
     * @param null $updateHash
     * @throws \Exception
     * @return string $hash
     */
    public function storeShare($parentRepositoryId, $shareData, $type="minisite", $existingHash = null, $updateHash = null){

        $data = serialize($shareData);
        if($existingHash){
            $hash = $existingHash;
        }else{
            $hash = $this->computeHash($data);
        }
        
        $api = new SimpleStoreApi();
        $shareData["SHARE_TYPE"] = $type;
        $shareData["PARENT_REPOSITORY_ID"] = $parentRepositoryId;
        if($updateHash != null){
            $api->deleteDocuments("share", $existingHash, "", $shareData["OWNER"]);
            $hash = $updateHash;
        }
        $api->storeDocument("share", $hash, $shareData["OWNER"], $shareData, $shareData);
        return $hash;

    }

    /**
     * Initialize an empty ShareLink object.
     * @return ShareLink
     */
    public function createEmptyLink(){
        $shareObject = new ShareLink($this);
        if(UsersService::usersEnabled()){
            $shareObject->setOwnerId($this->context->getUser()->getId());
        }
        return $shareObject;
    }

    /**
     * Initialize a ShareLink from persisted data.
     * @param string $hash
     * @return ShareLink
     * @throws \Exception
     */
    public function loadLink($hash){
        $data = $this->loadShare($hash);
        if($data === false){
            $mess = LocaleService::getMessages();
            throw new \Exception(str_replace('%s', 'Cannot find share with hash '.$hash, $mess["share_center.219"]));
        }
        if(isSet($data["TARGET"]) && $data["TARGET"] == "remote"){
            $shareObject = new TargettedLink($this, $data);
        }else{
            $shareObject = new ShareLink($this, $data);
        }
        $shareObject->setHash($hash);
        return $shareObject;
    }

    /**
     * Load data persisted from DocStore API
     * @param $hash
     * @return array|bool|mixed
     */
    public function loadShare($hash){

        $api = new SimpleStoreApi();
        $doc = $api->loadDocument("share", $hash);
        if(is_array($doc) ) {
            return $doc;
        } else {
            return [];
        }

    }

    /**
     * List shares based on child repository ID;
     * @param $repositoryId
     * @return DocstoreDocument[]
     */
    public function findSharesForRepo($repositoryId){
        $cursor = null;
        $metaQuery = "+REPOSITORY:".SimpleStoreApi::escapeMetaValue($repositoryId);
        $api = new SimpleStoreApi();
        $docs = $api->listDocuments("share", $metaQuery);
        if(is_array($docs)){
            return $docs;
        }
        return [];
    }

    /**
     * List all shares persisted in DB and on file.
     * @param string $limitToUser
     * @param string $parentRepository
     * @param null $cursor
     * @param null $shareType
     * @return array
     */
    public function listShares($limitToUser = '', $parentRepository = '', &$cursor = null, $shareType = null){

        $api = new SimpleStoreApi();

        // Get DB files
        $dataLikes = [];
        $childParameters = [];

        if(!empty($limitToUser) && $limitToUser !== '__GROUP__'){
            $childParameters['user_id'] = $limitToUser;
            $dataLikes["OWNER_ID"] = $limitToUser;
        }
        if(!empty($shareType) && $shareType !== '__GROUP__'){
            $childParameters['share_type'] = $shareType;
            $dataLikes["SHARE_TYPE"] = $shareType;
        }
        if($parentRepository !== '' && $parentRepository !== '__GROUP__'){
            $childParameters['parent_repository_id'] = $parentRepository;
            $dataLikes["PARENT_REPOSITORY_ID"] = $parentRepository;
        }

        if($parentRepository === '__GROUP__'){

            $result = [];
            // First list repositories
            if ($limitToUser != "") {
                try{
                    $userObject = UsersService::getUserById($limitToUser);
                }catch(UserNotFoundException $e) {
                    return [];
                }
            }
            $repoList = RepositoryService::listAllRepositories();// TODO: THIS SHOULD BE PORTED TO BACKEND; AND RESTRICTED TO USER WORKSPACES ONLY! new FilteredRepositoriesList($userObject);
            foreach($repoList as $repoId => $repoObject){
                $repoLabel = $repoObject->getDisplay();
                $metaParams = array_merge($dataLikes, ["PARENT_REPOSITORY_ID" => $repoId]);
                $countResponse = $api->listDocuments("share", SimpleStoreApi::buildMetaQuery($metaParams), "", true);
                if ($countResponse === 0) {
                    continue;
                }
                $params = $childParameters;
                $params['parent_repository_id'] = $repoId;
                $result[$repoId] = [
                    'label' => $repoLabel,
                    'count' => $countResponse,
                    'child_parameters' => $params
                ];
            }
            usort($result, function($a, $b){
                return $a['count'] === $b['count'] ? 0 : $a['count'] > $b['count'] ? -1 : 1 ;
            });
            return $result;

        }else if($shareType === '__GROUP__'){

            $dataLikesMini = $dataLikesRepo = $dataLikes;
            $paramsMini = $paramsRepo = $childParameters;
            $paramsMini['share_type'] = 'minisite';
            $paramsRepo['share_type'] = 'repository';
            $dataLikesRepo["SHARE_TYPE"] = "repository";
            $dataLikesMini["SHARE_TYPE"] = "minisite";

            $repoCount = $api->listDocuments("share", SimpleStoreApi::buildMetaQuery($dataLikesRepo), "", true);
            $linksCount = $api->listDocuments("share", SimpleStoreApi::buildMetaQuery($dataLikesMini), "", true);
            $result = [];
            $mess = LocaleService::getMessages();
            if($repoCount > 0){
                $result['repository'] = [
                    'label' => $mess['share_center.244'],
                    'count' => $repoCount,
                    'child_parameters' => $paramsRepo
                ];
            }
            if($linksCount > 0){
                $result['minisite'] = [
                    'label' => $mess['share_center.243'],
                    'count' => $linksCount,
                    'child_parameters' => $paramsMini
                ];
            }
            usort($result, function($a, $b){
                return $a['count'] === $b['count'] ? 0 : $a['count'] > $b['count'] ? -1 : 1 ;
            });
            return $result;

        }else if($limitToUser === '__GROUP__'){

            // Find shares for all users list
            return [];
            /*
            $params = $childParameters;
            $userLikes = $dataLikes;
            $params['user_context'] = 'user';
            $namespace = PYDIO_CACHE_SERVICE_NS_SHARED;
            $cacheKey = "shareslist" . "-" . StringHelper::slugify(json_encode(array_merge($dataLikes, ["parent-repo-id" => $parentRepository])));


            $users = [];
            if(CacheService::contains($namespace, $cacheKey)){

                $users = CacheService::fetch($namespace, $cacheKey);

            }else{

                $callbackFunction = function($objectId, $shareData) use (&$users, $cursor, $params) {

                    $ownerID = $shareData['OWNER_ID'];
                    if(empty($ownerID)) return false;
                    if(!$users[$ownerID]){
                        $userObject = UsersService::getUserById($ownerID, false);
                        if(!$userObject instanceof UserInterface) return false;
                        $users[$ownerID] = [
                            'label'=> UsersService::getUserPersonalParameter('USER_DISPLAY_NAME', $userObject, 'core.conf', $ownerID),
                            'count'=> 0,
                            'child_parameters' => array_merge($params, ['user_id' => $ownerID])
                        ];
                    }
                    $users[$ownerID]['count'] ++;
                    return false;
                };

                $c = null;
                $this->confStorage->simpleStoreList('share', $c, "", "serial", $userLikes, $parentRepository, $callbackFunction);

                usort($users, function($a, $b){
                    return $a['count'] === $b['count'] ? 0 : $a['count'] > $b['count'] ? -1 : 1 ;
                });

                CacheService::save($namespace, $cacheKey, $users, 600);

            }



            $cursor['total'] = count($users);
            $result = array_slice($users, $cursor[0], $cursor[1]);
            return $result;
            */

        }

        return $api->listDocuments("share", SimpleStoreApi::buildMetaQuery($dataLikes));

    }

    /**
     * @param UserInterface $user
     * @param RepositoryInterface $workspace
     * @return bool
     */
    public function testUserCanEditShare(UserInterface $user, RepositoryInterface $workspace){
        return PoliciesFactory::subjectCanWrite($workspace->getPolicies(), $user);
    }

    /**
     * @param String $type
     * @param String $element
     * @param bool $keepRepository
     * @param bool $ignoreRepoNotFound
     * @return bool
     * @throws \Exception
     */
    public function deleteShare($type, $element, $keepRepository = false, $ignoreRepoNotFound = false)
    {
        $mess = LocaleService::getMessages();
        Logger::debug(__CLASS__, __FILE__, "Deleting shared element ".$type."-".$element);
        $api = new SimpleStoreApi();

        if ($type == "repository") {
            if(strpos($element, "repo-") === 0) $element = str_replace("repo-", "", $element);
            $repo = RepositoryService::getRepositoryById($element);
            $share = $this->loadShare($element);
            if($repo == null) {
                // Maybe a share has
                if(is_array($share) && isSet($share["REPOSITORY"])){
                    $repo = RepositoryService::getRepositoryById($share["REPOSITORY"]);
                }
                if($repo == null && !$ignoreRepoNotFound){
                    throw new \Exception(str_replace('%s', 'Cannot find associated repository', $mess["share_center.219"]));
                }
            }
            if($repo != null){
                $this->testUserCanEditShare($this->context->getUser(), $repo);
                $res = RepositoryService::deleteRepository($element);
                if ($res == -1) {
                    throw new \Exception($mess[427]);
                }
            }
            if(isSet($share) && count($share)){
                $api->deleteDocuments("share", $element);
            }else{
                $shares = $this->findSharesForRepo($element);
                if(count($shares)){
                    $keys = array_keys($shares);
                    $api->deleteDocuments("share", $keys[0]);
                }
            }
        } else if ($type == "minisite") {
            $minisiteData = $this->loadShare($element);
            $repoId = $minisiteData["REPOSITORY"];
            $repo = RepositoryService::getRepositoryById($repoId);
            if ($repo == null) {
                if(!$ignoreRepoNotFound) {
                    throw new \Exception(str_replace('%s', 'Cannot find associated repository', $mess["share_center.219"]));
                }
            }else{
                $this->testUserCanEditShare($this->context->getUser(), $repo);
            }
            if($repoId !== null && !$keepRepository){
                $res = RepositoryService::deleteRepository($repoId);
                if ($res == -1) {
                    throw new \Exception($mess[427]);
                }
            }
            // Silently delete corresponding role if it exists
            try{RolesService::deleteRole("SHARE-DL-" . $repoId);}catch (\Exception $e){}
            try{RolesService::deleteRole("SHARE-NODL-" . $repoId);}catch (\Exception $e){}
            // If guest user created, remove it now.
            if (isSet($minisiteData["PRELOG_USER"]) && UsersService::userExists($minisiteData["PRELOG_USER"])) {
                UsersService::deleteUser($minisiteData["PRELOG_USER"]);
            }
            // If guest user created, remove it now.
            if (isSet($minisiteData["PRESET_LOGIN"]) && UsersService::userExists($minisiteData["PRESET_LOGIN"])) {
                UsersService::deleteUser($minisiteData["PRESET_LOGIN"]);
            }
            $api->deleteDocuments("share", $element);

        } else if ($type == "file") {
            $publicletData = $this->loadShare($element);
            if ($publicletData!== false /*&& isSet($publicletData["OWNER_ID"]) && $this->testUserCanEditShare($publicletData["OWNER_ID"], $publicletData)*/) {
                $api->deleteDocuments("share", $element);
            } else {
                throw new \Exception($mess["share_center.160"]);
            }
        }
        return true;
    }

    /**
     * @param $shareId
     */
    public function deleteShareEntry($shareId){
        $api = new SimpleStoreApi();
        $api->deleteDocuments("share", $shareId);
    }



    /**
     * Set the counter value to 0.
     * @param string $hash
     * @param string $userId
     * @throws \Exception
     */
    public function resetDownloadCounter($hash, $userId){

        $link = $this->loadLink($hash);
        $this->testUserCanEditShare($userId, $link->getRepository());
        $link->resetDownloadCount();
        $link->save();

    }
    
    /**
     * Find all expired shares and remove them.
     * @param bool|true $currentUser
     * @return array
     */
    public function clearExpiredFiles($currentUser = true)
    {
        if($currentUser){
            $loggedUser = $this->context->getUser();
            $userId = $loggedUser->getId();
        }else{
            $userId = null;
        }
        $deleted = [];

        $shares = $this->listShares($currentUser? $userId: '');
        foreach ($shares as $hash => $share) {
            if ($currentUser && ( !isSet($share["OWNER_ID"]) || $share["OWNER_ID"] != $userId )) {
                continue;
            }
            if (ShareLink::isShareExpired($share)){
                $this->deleteShare($share["SHARE_TYPE"], $hash, false, true);
                $deleted[] = $hash;
            }
            gc_collect_cycles();
        }
        return $deleted;
    }

    /**
     * Computes a short form of the hash, checking if it already exists in the folder,
     * in which case it increases the hashlength until there is no collision.
     * @static
     * @param String $outputData Serialized data
     * @param String|null $checkInFolder Path to folder
     * @return string
     */
    private function computeHash($outputData)
    {
        $length = $this->hashMinLength;
        $full =  md5($outputData);
        $starter = substr($full, 0, $length);
        return $starter;
    }

    /**
     * Check if the hash seems to correspond to the serialized data.
     * @static
     * @param String $outputData serialized data
     * @param String $hash Id to check
     * @return bool
     */
    private function checkHash($outputData, $hash)
    {
        $full = md5($outputData);
        return (!empty($hash) && strpos($full, $hash."") === 0);
    }


}
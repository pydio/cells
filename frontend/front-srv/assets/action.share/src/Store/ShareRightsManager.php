<?php
/*
 * Copyright 2007-2017 Abstrium <contact (at) pydio.com>
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
use Pydio\Access\Core\Model\Repository;
use Pydio\Conf\Core\PydioUser;
use Pydio\Conf\Core\Role;
use Pydio\Core\Controller\Controller;
use Pydio\Core\Exception\PydioException;
use Pydio\Core\Exception\UserNotFoundException;
use Pydio\Core\Http\Client\MicroApi;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Model\UserInterface;
use Pydio\Core\Services\ConfService;
use Pydio\Core\Services\LocaleService;
use Pydio\Core\Services\PoliciesFactory;
use Pydio\Core\Services\RepositoryService;
use Pydio\Core\Services\RolesService;
use Pydio\Core\Services\UsersService;
use Pydio\Core\Utils\Vars\InputFilter;
use Pydio\Notification\Core\ActivityCenter;
use Pydio\OCS\Model\TargettedLink;
use Pydio\Share\Model\ShareLink;
use Swagger\Client\Model\ServiceResourcePolicy;
use Swagger\Client\Model\ServiceResourcePolicyAction;
use Swagger\Client\Model\ServiceResourcePolicyPolicyEffect;

defined('PYDIO_EXEC') or die('Access not allowed');

define('PARAM_USER_LOGIN_PREFIX', "user_");
define('PARAM_USER_PASS_PREFIX', "user_pass_");
define('PARAM_USER_RIGHT_WATCH_PREFIX', "right_watch_");
define('PARAM_USER_RIGHT_READ_PREFIX', "right_read_");
define('PARAM_USER_RIGHT_WRITE_PREFIX', "right_write_");
define('PARAM_USER_ENTRY_TYPE', "entry_type_");

/**
 * Class ShareRightsManager
 * @package Pydio\Share\Store
 */
class ShareRightsManager
{
    /**
     * @var ShareStore $store
     */
    var $store;

    /**
     * @var array $options
     */
    var $options;

    /** @var  ContextInterface */
    var $context;

    /**
     * ShareRightsManager constructor.
     * @param ContextInterface $context
     * @param array $options
     * @param ShareStore $store
     * @param WatchRegister|bool $watcher
     */
    public function __construct(ContextInterface $context, $options, $store)
    {
        $this->context = $context;
        $this->options = $options;
        $this->store = $store;
    }

    /**
     * @param array $httpVars
     * @param ShareLink $shareObject
     * @param bool $update
     * @param null $guestUserPass
     * @return array
     * @throws \Exception
     */
    public function prepareSharedUserEntry($httpVars, &$shareObject, $update, $guestUserPass = null){
        $userPass = null;

        $forcePassword = $this->options["SHARE_FORCE_PASSWORD"];
        if($forcePassword && (
                (isSet($httpVars["create_guest_user"]) && $httpVars["create_guest_user"] == "true" && empty($guestUserPass))
                || (isSet($httpVars["guest_user_id"]) && isSet($guestUserPass) && strlen($guestUserPass) == 0)
            )){
            $mess = LocaleService::getMessages();
            throw new \Exception($mess["share_center.175"]);
        }

        if($update){

            // THIS IS AN EXISTING SHARE
            // FIND SHARE AND EXISTING HIDDEN USER ID
            if($shareObject->isAttachedToRepository()){
                $existingRepo = $shareObject->getRepository();
                $this->store->testUserCanEditShare($this->context->getUser(), $existingRepo);
            }
            $uniqueUser = $shareObject->getUniqueUser();
            if($guestUserPass !== null && strlen($guestUserPass)) {
                $userPass = $guestUserPass;
                $shareObject->setUniqueUser($uniqueUser, true);
            }else if(!$shareObject->shouldRequirePassword() || ($guestUserPass !== null && $guestUserPass == "")){
                $shareObject->setUniqueUser($uniqueUser, false);
                // Make sure to update userPass to original preset value
                $userPass = $shareObject->createHiddenUserPassword();
            }
            if($update && $forcePassword && !($shareObject instanceof TargettedLink) && !$shareObject->shouldRequirePassword() && empty($guestUserPass)){
                $mess = LocaleService::getMessages();
                throw new \Exception($mess["share_center.175"]);
            }

        } else {

            $update = false;
            $shareObject->createHiddenUserId(
                $this->options["SHARED_USERS_TMP_PREFIX"],
                !empty($guestUserPass)
            );
            if(!empty($guestUserPass)){
                $userPass = $guestUserPass;
            }else{
                $userPass = $shareObject->createHiddenUserPassword();
            }
            $uniqueUser = $shareObject->getUniqueUser();
        }

        $hiddenUserEntry = $this->createHiddenUserEntry($httpVars, $uniqueUser, $userPass, $update);
        if(empty($hiddenUserEntry["RIGHT"])){
            $mess = LocaleService::getMessages();
            throw new \Exception($mess["share_center.58"]);
        }
        $hiddenUserEntry["DISABLE_DOWNLOAD"] = $shareObject->disableDownload();
        if($shareObject instanceof TargettedLink){
            $hiddenUserEntry["REMOTE"] = true;
        }
        return $hiddenUserEntry;
    }


    /**
     * @param array $httpVars
     * @param string $userId
     * @param string|null $userPass
     * @param bool|false $update
     * @return array
     */
    public function createHiddenUserEntry($httpVars, $userId, $userPass = null, $update = false){

        $entry = array("ID" => $userId, "TYPE" => "user", "HIDDEN" => true);
        $read = isSet($httpVars["simple_right_read"]) ;
        $write = isSet($httpVars["simple_right_write"]);
        $disableDownload = !isSet($httpVars["simple_right_download"]);
        if (!$read && !$disableDownload) {
            $read = true;
        }
        $rData = [];
        if($read) $rData[] = "read";
        if($write) $rData[] = "write";
        $entry["RIGHT"] =  implode(",", $rData);
        $entry["WATCH"] = false;
        if(isSet($userPass)){
            if($update){
                $entry["UPDATE_PASSWORD"] = $userPass;
            }else{
                $entry["PASSWORD"] = $userPass;
            }
        }
        return $entry;

    }

    /**
     * @param $httpVars
     * @param array $users
     * @param array $groups
     * @throws \Exception
     */
    public function createUsersFromParameters($httpVars, &$users = array(), &$groups = array()){

        $index = 0;
        $allowCrossUserSharing = ConfService::getContextConf($this->context, "ALLOW_CROSSUSERS_SHARING", "auth");
        $allowSharedUsersCreation = ConfService::getContextConf($this->context, "USER_CREATE_USERS", "auth");
        $loggedUser = $this->context->getUser();
        $confDriver = ConfService::getConfStorageImpl();
        $mess = LocaleService::getMessages();

        while (isSet($httpVars[PARAM_USER_LOGIN_PREFIX.$index])) {

            $eType = $httpVars[PARAM_USER_ENTRY_TYPE.$index];
            $uWatch = $httpVars[PARAM_USER_RIGHT_WATCH_PREFIX.$index] == "true" ? true : false;
            $rights = [];
            if ($httpVars[PARAM_USER_RIGHT_READ_PREFIX.$index]=="true") $rights[] = "read";
            if ($httpVars[PARAM_USER_RIGHT_WRITE_PREFIX.$index]=="true") $rights[] = "write";
            $rightString = implode(",", $rights);
            if (empty($rightString)) {
                $index++;
                continue;
            }

            $LABEL = "";
            if ($eType == "user") {

                $u = InputFilter::decodeSecureMagic($httpVars[PARAM_USER_LOGIN_PREFIX . $index], InputFilter::SANITIZE_EMAILCHARS);
                $userExistsRead = UsersService::userExists($u);
                if (!$userExistsRead && !isSet($httpVars[PARAM_USER_PASS_PREFIX.$index])) {
                    $index++;
                    continue;
                } else if (UsersService::userExists($u, "w") && isSet($httpVars[PARAM_USER_PASS_PREFIX.$index])) {
                    throw new PydioException( str_replace("%s", $u, $mess["share_center.222"]));
                }
                if($userExistsRead){
                    $userObject = UsersService::getUserById($u, false);
                    if ( $allowCrossUserSharing != true && !$userObject->hasSharedProfile() ) {
                        throw new PydioException($mess["share_center.221"]);
                    }
                    $LABEL = $userObject->getPersonalAttribute("displayName");
                }else{
                    if(!$allowSharedUsersCreation || UsersService::isReservedUserId($u)){
                        throw new PydioException($mess["share_center.220"]);
                    }
                    if(!empty($this->options["SHARED_USERS_TMP_PREFIX"]) && strpos($u, $this->options["SHARED_USERS_TMP_PREFIX"])!==0 ){
                        $u = $this->options["SHARED_USERS_TMP_PREFIX"] . $u;
                    }
                }
                $entry = array("ID" => $u, "TYPE" => "user");

            } else {

                $u = InputFilter::decodeSecureMagic($httpVars[PARAM_USER_LOGIN_PREFIX . $index]);

                if (strpos($u, "/USER_TEAM/") === 0) {

                    $roleId = str_replace("/USER_TEAM/", "", $u);
                    $roleObject = RolesService::getUserTeamRoles($roleId);
                    if (empty($roleObject)) {
                        $index++;
                        continue;
                    } else {
                        // Replace now with roleId
                        $u = $roleId;
                        $LABEL = $roleObject->getLabel();
                    }

                    $entry = array("ID" => $u, "TYPE" => "group", "USER_TEAM" => true);
                } else{

                    if($u === RolesService::RootGroup){
                        $entry = [
                            "ID" => "PYDIO_GRP_".($this->context->hasUser() ? $this->context->getUser()->getRealGroupPath("/") : "/"),
                            "TYPE" => "group"
                        ];
                        $LABEL = $mess['447'];
                    } else {
                        $g = UsersService::getGroupByPath(str_replace("PYDIO_GRP_/", "", $u));
                        if($g !== false){
                            $LABEL = $g->getAttributes()["displayName"] OR $g->getGroupLabel();
                            $entry = array("ID" => $u, "TYPE" => "group");
                        } else {
                            $index++;
                        }
                    }
                }

            }
            $entry["LABEL"] = $LABEL;
            $entry["RIGHT"] = $rightString;
            $entry["PASSWORD"] = isSet($httpVars[PARAM_USER_PASS_PREFIX.$index])?$httpVars[PARAM_USER_PASS_PREFIX.$index]:"";
            $entry["WATCH"] = $uWatch;
            if($entry["TYPE"] == "user") {
                $users[$entry["ID"]] = $entry;
            }else{
                $groups[$entry["ID"]] = $entry;
            }
            $index ++;

        }

    }

    /**
     * @param array $ocsData
     * @param \Pydio\OCS\Model\ShareInvitation[] $existingInvitations
     * @param array $newOcsUsers
     * @param array $unshareInvitations
     * @return int
     */
    public function remoteUsersFromParameters($ocsData, $existingInvitations, &$newOcsUsers, &$unshareInvitations){
        $totalInvitations = count($ocsData["invitations"]);
        $newOcsUsers = array();
        $unshareInvitations = array();

        $resentIds = array();
        foreach($ocsData["invitations"] as $invitationData){
            if(isSet($invitationData["INVITATION_ID"])){
                $resentIds[] = $invitationData["INVITATION_ID"];
            }else{
                $newOcsUsers[] = $invitationData;
            }
        }
        foreach($existingInvitations as $invitation){
            if(!in_array($invitation->getId(), $resentIds)){
                $unshareInvitations[] = $invitation;
            }
        }
        return $totalInvitations;
    }

    /**
     * @param String $repoId
     * @param bool $mixUsersAndGroups
     * @param \Pydio\Access\Core\Model\Node|null $watcherNode
     * @return array
     */
    public function computeSharedRepositoryAccessRights($repoId, $mixUsersAndGroups, $watcherNodeId = null)
    {
        $roles = RolesService::getRolesForRepository($repoId);
        $sharedEntries = $sharedGroups = array();
        $mess = LocaleService::getMessages();
        foreach($roles as $rId => $role){
            $RIGHT = $role->getAcl($repoId);
            if (empty($RIGHT)) continue;
            $ID = $rId;
            $WATCH = false;
            $HIDDEN = false;
            $AVATAR = false;
            if($role->isUserRole()){
                try{
                    $userObject = UsersService::getUserFromUserRole($role);
                } catch(UserNotFoundException $e){
                    continue;
                }
                $LABEL = $userObject->getPersonalAttribute("displayName", $userId);
                $AVATAR = $userObject->getPersonalAttribute("avatar", "");
                if(empty($LABEL)) $LABEL = $userObject->getId();
                $TYPE = $userObject->hasSharedProfile()?"tmp_user":"user";
                $HIDDEN = $userObject->isHidden();
                if ($watcherNodeId != null) {
                    //$events = ActivityCenter::UserIsSubscribedToNode($userId, $watcherNodeId);
                    $WATCH = false;
                }
                $ID = $userObject->getId();
            }else if($rId == RolesService::RootGroup){
                $TYPE = "group";
                $LABEL = $mess["447"];
            }else if($role->isGroupRole()){
                $groupObject = UsersService::getGroupById($role->getUuid());
                if($groupObject === false){
                    continue;
                }
                $ID = "PYDIO_GRP_" . rtrim($groupObject->getGroupPath(), "/") . "/" . $groupObject->getGroupLabel();
                $LABEL = $groupObject->getAttributes()["displayName"];
                if(empty($LABEL)) $LABEL = $groupObject->getGroupLabel();

                if($ID === "PYDIO_GRP_/"){
                    $ID = RolesService::RootGroup;
                    $LABEL = $mess["447"];
                }
                $TYPE = "group";
            }else{
                $LABEL = $role->getLabel();
                if($role->getIsTeam()) $TYPE = "team";
                else $TYPE = 'group';
            }

            if(empty($LABEL)) $LABEL = $rId;
            $entry = array(
                "ID"    => $ID,
                "TYPE"  => $TYPE,
                "LABEL" => $LABEL,
                "RIGHT" => $RIGHT
            );
            if($WATCH) $entry["WATCH"] = $WATCH;
            if($HIDDEN) $entry["HIDDEN"] = true;
            if($AVATAR !== false) $entry["AVATAR"] = $AVATAR;
            if($TYPE === "group" || $TYPE === "team"){
                $sharedGroups[$entry["ID"]] = $entry;
            } else {
                $sharedEntries[$entry["ID"]] = $entry;
            }
        }

        if (!$mixUsersAndGroups) {
            return array("USERS" => $sharedEntries, "GROUPS" => $sharedGroups);
        }else{
            return array_merge(array_values($sharedGroups), array_values($sharedEntries));

        }
    }

    /**
     * @param \Pydio\Core\Model\RepositoryInterface $parentRepository
     * @param Repository $childRepository
     * @param bool $isUpdate
     * @param array $users
     * @param array $groups
     * @param \Pydio\Access\Core\Model\UserSelection $selection
     * @param Node $originalNode
     * @throws \Exception
     */
    public function assignSharedRepositoryPermissions($parentRepository, $childRepository, $isUpdate, $users, $groups, $selection){

        $addSubjects = [];
        $removedSubjects = [];

        $childRepoId = $childRepository->getId();
        if($isUpdate){
            $node = $selection->getUniqueNode();
            $currentRights = $this->computeSharedRepositoryAccessRights($childRepoId,false,$selection->getUniqueNode()->getUuid());
            // Will update $currentRights
            $removedSubjects = $this->unregisterRemovedUsers($currentRights, $childRepoId, $users, $groups);
        }

        $hiddenUsers = [];
        $loggedUser = $this->context->getUser();
        foreach ($users as $userName => $userEntry) {
            if(isSet($currentRights["USERS"][$userName]) && !$this->entriesDiffer($currentRights["USERS"][$userName], $userEntry)) {
                continue;
            }
            if (UsersService::userExists($userName, "r")) {
                $userObject = UsersService::getUserById($userName);
                if(isSet($userEntry["HIDDEN"]) && isSet($userEntry["UPDATE_PASSWORD"])){
                    UsersService::updatePassword($userName, $userEntry["UPDATE_PASSWORD"]);
                    unset($userEntry["UPDATE_PASSWORD"]);
                }
            } else {
                $mess = LocaleService::getMessages();
                $hiddenUserLabel = "[".$mess["share_center.109"]."] ". InputFilter::sanitize($childRepository->getDisplay(), InputFilter::SANITIZE_EMAILCHARS);
                $userObject = $this->createNewUser($loggedUser, $userName, $userEntry["PASSWORD"], isset($userEntry["HIDDEN"]), $hiddenUserLabel);
            }

            if(isSet($userEntry["HIDDEN"])) {
                // CREATE A MINISITE-LIKE ROLE FOR THIS REPOSITORY
                $minisiteRole = $this->createRoleForMinisite($loggedUser, $childRepoId, $userEntry["DISABLE_DOWNLOAD"], $isUpdate);
                $saveU = false;
                if($userObject->getPersonalRole()->getAcl($childRepoId) !== $userEntry["RIGHT"]
                    || $userObject->getPersonalRole()->filterParameterValue("core.conf", "DEFAULT_START_REPOSITORY", PYDIO_REPO_SCOPE_ALL, "") !== $childRepoId){
                    // Will create personal if not existing
                    $userObject->getPersonalRole()->setAcl($childRepoId, $userEntry["RIGHT"]);
                    $userObject->getPersonalRole()->setParameterValue("core.conf", "DEFAULT_START_REPOSITORY", PYDIO_REPO_SCOPE_ALL, $childRepoId);
                    $saveU = true;
                }
                if($minisiteRole != false){
                    $userObject->addRole($minisiteRole);
                    $saveU = true;
                }
                if($saveU){
                    $userObject->save(true);
                }
                $addSubjects[] = "user:" . $userObject->getId();
                $hiddenUsers[] = $userObject;
            } else {
                // ASSIGN/REPLACE NEW REPO RIGHTS
                RolesService::assignWorkspaceAcl($userObject->getUuid(), $childRepoId, $userEntry["RIGHT"], true);
                $addSubjects[] = "user:" . $userObject->getId();
            }
        }

        foreach ($groups as $group => $groupEntry) {
            if(isSet($currentRights["GROUPS"][$group]) && !$this->entriesDiffer($currentRights["GROUPS"][$group], $groupEntry)){
                continue;
            }
            $r = $groupEntry["RIGHT"];
            if($groupEntry["USER_TEAM"]){
                $grRole = RolesService::getUserTeamRoles($group);
            }else{
                $basePath = $this->context->hasUser() ? $this->context->getUser()->getGroupPath() : "";
                $groupPath = rtrim($basePath, "/") . "/" . ltrim(str_replace("PYDIO_GRP_", "", $groupEntry["ID"]), "/");
                if($groupPath === "/") {
                    $grRole = RolesService::getOrCreateRole(RolesService::RootGroup, $basePath, true);
                } else {
                    $groupObject = UsersService::getGroupByPath($groupPath);
                    if($groupObject === false){
                        continue;
                    }
                    $grRole = RolesService::getOrCreateRole($groupObject->getUuid(), $basePath, true);
                }
            }
            // ASSIGN / REPLACE
            RolesService::assignWorkspaceAcl($grRole->getUuid(), $childRepoId, $r, true);
            $addSubjects[] = "role:".$grRole->getUuid();
        }

        // Make sure all target users have the read right
        if(count($addSubjects) || count($removedSubjects)) {
            $policies = $childRepository->getPolicies();
            $newPolicies = $this->computeResourcePolicies($childRepoId, $policies, $addSubjects, $removedSubjects);
            $childRepository->setPolicies($newPolicies);
            RepositoryService::updateRepositoryPolicies($childRepository);
            foreach($hiddenUsers as $hiddenUser){
                $uPolicies = $hiddenUser->getPolicies();
                $uNewPolicies = $this->computeResourcePolicies($hiddenUser->getId(), $uPolicies, $addSubjects, $removedSubjects);
                $hiddenUser->setPolicies($uNewPolicies);
                $hiddenUser->save(false, false);
            }

        }

        return $childRepository;

    }

    private function entriesDiffer($entryA, $entryB){
        return $entryA["RIGHT"] !== $entryB["RIGHT"] || isset($entryB["UPDATE_PASSWORD"]) || (
            isSet($entryA["HIDDEN"]) && $entryA["DISABLE_DOWNLOAD"] !== $entryB["DISABLE_DOWNLOAD"]
            );
    }

    /**
     * @param $resourceId string
     * @param $policies ServiceResourcePolicy[]
     * @param $addSubjects array
     * @param $removedSubjects array
     * @return ServiceResourcePolicy[]
     */
    private function computeResourcePolicies($resourceId, $policies, $addSubjects, $removedSubjects) {
        $newPolicies = [];
        $filteredPolicies = array_filter($policies, function($policy) use ($removedSubjects){
            foreach($removedSubjects as $removedSubject){
                if($policy->getAction() === ServiceResourcePolicyAction::READ && $policy->getSubject() === $removedSubject){
                    return false;
                }
            }
            return true;
        });
        foreach($filteredPolicies as $passed){
            $newPolicies[] = $passed;
        }
        foreach($addSubjects as $addSubject){
            $existing = array_filter($policies, function($policy) use($addSubject){
                return ($policy->getSubject() === $addSubject && $policy->getAction() === ServiceResourcePolicyAction::READ);
            });
            if(!count($existing)){
                $newPolicies[] = (new ServiceResourcePolicy())
                    ->setResource($resourceId)
                    ->setAction(ServiceResourcePolicyAction::READ)
                    ->setSubject($addSubject)
                    ->setEffect(ServiceResourcePolicyPolicyEffect::ALLOW);
            }
        }
        return $newPolicies;
    }

    /**
     * @param string $repoId
     * @param array $newUsers
     * @param array $newGroups
     * @param Node|null $watcherNode
     * @return array
     */
    public function unregisterRemovedUsers(&$currentRights, $repoId, $newUsers, $newGroups){

        $subjects = [];

        $originalUsers = array_keys($currentRights["USERS"]);
        $removeUsers = array_diff($originalUsers, array_keys($newUsers));
        if (count($removeUsers)) {
            foreach ($removeUsers as $user) {
                try{
                    $userObject = UsersService::getUserById($user, false);
                    RolesService::removeWorkspaceAcls($userObject->getUuid(), $repoId);
                    $subjects[] = "user:".$userObject->getId();
                }catch (UserNotFoundException $e){}
                unset($currentRights["USER"][$user]);
            }
        }
        $originalGroups = array_keys($currentRights["GROUPS"]);
        $groupKeys = array_keys($newGroups);
        if(in_array("PYDIO_GRP_/", $groupKeys)){
            $groupKeys[] = RolesService::RootGroup;
            $groupKeys = array_diff($groupKeys, ["PYDIO_GRP_/"]);
        }
        $removeGroups = array_diff($originalGroups, $groupKeys);
        if (count($removeGroups)) {
            foreach ($removeGroups as $groupId) {
                if($groupId !== RolesService::RootGroup){
                    $groupObject = UsersService::getGroupByPath(str_replace("PYDIO_GRP_/", "", $groupId));
                    if($groupObject !== false){
                        $groupId = $groupObject->getUuid();
                    }
                }
                $role = RolesService::getRole($groupId);
                if ($role !== false) {
                    RolesService::removeWorkspaceAcls($groupId, $repoId);
                    $subjects[] = "role:" . $groupId;
                }
                unset($currentRights["GROUPS"][$groupId]);
            }
        }

        return $subjects;

    }

    /**
     * @param UserInterface $parentUser
     * @param string $userName
     * @param string $password
     * @param bool $isHidden
     * @param string $display
     * @return UserInterface
     * @throws \Exception
     */
    public function createNewUser($parentUser, $userName, $password, $isHidden, $display){

        if(!$isHidden){
            // This is an explicit user creation - check possible limits
            Controller::applyHook("user.before_create", array($this->context, $userName, null, false, false));
            $limit = $parentUser->getMergedRole()->filterParameterValue("core.conf", "USER_SHARED_USERS_LIMIT", PYDIO_REPO_SCOPE_ALL, "");
            if (!empty($limit) && intval($limit) > 0) {
                $count = count(UsersService::getUserChildren($parentUser->getId()));
                if ($count >= $limit) {
                    $mess = LocaleService::getMessages();
                    throw new \Exception($mess['483']);
                }
            }
        }

        $policies = PoliciesFactory::policiesForSharedUser($parentUser, $userName);
        $userObject = UsersService::createUser($userName, $password, false, $isHidden, $parentUser->getGroupPath(), "shared", ["displayName" => $display], $policies);
        Controller::applyHook("user.after_create", array($this->context, $userObject));

        return $userObject;

    }


    /**
     * @param $loggedUser UserInterface
     * @param string $repositoryId
     * @param bool $disableDownload
     * @param bool $replace
     * @return Role|false
     */
    public function createRoleForMinisite($loggedUser, $repositoryId, $disableDownload, $replace){
        if($replace){
            if($disableDownload){
                if(RolesService::roleExists("SHARE-NODL-" . $repositoryId)){
                    return false;
                }else{
                    try{
                        RolesService::deleteRole("SHARE-NODL-" . $repositoryId);
                    }catch (\Exception $e){}
                }
            } else {
                if(RolesService::roleExists("SHARE-DL-" . $repositoryId)){
                    return false;
                }else{
                    try{
                        RolesService::deleteRole("SHARE-DL-" . $repositoryId);
                    }catch (\Exception $e){}
                }
            }
        }
        $roleId = $disableDownload ? "SHARE-NODL-" . $repositoryId : "SHARE-DL-" . $repositoryId;
        $newRole = new Role($roleId);
        $r = RolesService::getRole("MINISITE");
        if ($r instanceof Role) {
            if ($disableDownload) {
                $f = RolesService::getRole("MINISITE_NODOWNLOAD");
                if ($f instanceof Role) {
                    $r = $f->override($r);
                }
            }
            $allData = $r->getDataArray();
            $newData = $newRole->getDataArray();
            if(isSet($allData["ACTIONS"][PYDIO_REPO_SCOPE_SHARED])) $newData["ACTIONS"][$repositoryId] = $allData["ACTIONS"][PYDIO_REPO_SCOPE_SHARED];
            if(isSet($allData["PARAMETERS"][PYDIO_REPO_SCOPE_SHARED])) $newData["PARAMETERS"][$repositoryId] = $allData["PARAMETERS"][PYDIO_REPO_SCOPE_SHARED];
            $newRole->bunchUpdate($newData);
            $newRole->setPolicies(PoliciesFactory::policiesForUniqueUser($loggedUser));
            RolesService::updateRole($newRole, true);
            return $newRole;
        }
        return false;
    }


}
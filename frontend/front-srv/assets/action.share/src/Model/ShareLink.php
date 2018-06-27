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
namespace Pydio\Share\Model;


use Pydio\Access\Core\Model\Node;
use Pydio\Core\Exception\PydioException;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Model\RepositoryInterface;
use Pydio\Core\Services\LocaleService;
use Pydio\Core\Services\RepositoryService;
use Pydio\Core\Services\ApplicationState;
use Pydio\Core\Utils\Vars\InputFilter;
use Pydio\Share\Store\ShareStore;
use Pydio\Share\View\PublicAccessManager;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * Class ShareLink
 * Model for a public link
 */
class ShareLink
{
    /**
     * @var string
     */
    protected $hash;

    /**
     * @var ShareStore
     */
    protected $store;

    /**
     * @var array
     */
    protected $internal;

    /**
     * @var string
     */
    protected $newHash;

    /**
     * @var array
     */
    protected $additionalMeta;

    /**
     * @var string
     */
    protected $parentRepositoryId;

    const PasswordComplexitySuffix = '#$!Az1';

    protected $modifiableShareKeys = ["counter", "tags", "short_form_url"];

    /**
     * @return string
     */
    public function getShortFormUrl()
    {
        return $this->internal["SHORT_FORM_URL"];
    }

    /**
     * @param string $shortFormUrl
     */
    public function setShortFormUrl($shortFormUrl)
    {
        $this->internal["SHORT_FORM_URL"] = $shortFormUrl;
    }

    /**
     * ShareLink constructor.
     * @param $store
     * @param array $storeData
     */
    public function __construct($store, $storeData = array()){
        $this->store = $store;
        $this->internal = $storeData;
    }

    /**
     * Persist the share to DB using the ShareStore
     * @return string
     * @throws \Exception
     */
    public function save(){
        $newHash = $this->store->storeShare(
            $this->getParentRepositoryId(),
            $this->internal,
            "minisite",
            $this->getHash(),
            $this->getNewHash()
        );
        $this->setHash($newHash);
        return $newHash;
    }

    /**
     * @param string $hash
     */
    public function setHash($hash){
        $this->hash = $hash;
    }

    /**
     * @param string $repositoryId
     */
    public function attachToRepository($repositoryId){
        $this->internal["REPOSITORY"] = $repositoryId;
    }

    /**
     * @return bool
     */
    public function isAttachedToRepository(){
        return isSet($this->internal["REPOSITORY"]);
    }

    /**
     * @return string
     */
    public function getRepositoryId(){
        return $this->internal["REPOSITORY"];
    }

    /**
     * @return array
     */
    public function getAdditionalMeta()
    {
        return $this->additionalMeta;
    }

    /**
     * @param array $additionalMeta
     */
    public function setAdditionalMeta($additionalMeta)
    {
        $this->additionalMeta = $additionalMeta;
    }

    /**
     * @return RepositoryInterface
     * @throws \Exception
     */
    public function getRepository(){
        if(isSet($this->internal["REPOSITORY"])){
            return RepositoryService::getRepositoryById($this->internal["REPOSITORY"]);
        }else{
            $mess = LocaleService::getMessages();
            throw new \Exception(str_replace('%s', 'No repository attached to link', $mess["share_center.219"]));
        }
    }

    /**
     * Update some internal configs from httpVars
     * @param $httpVars
     * @param $node Node
     * @throws \Exception
     */
    public function parseHttpVars($httpVars, $node){

        $data = &$this->internal;
        $data["DOWNLOAD_DISABLED"] = (isSet($httpVars["simple_right_download"]) ? false : true);
        $data["PYDIO_APPLICATION_BASE"] = ApplicationState::detectServerURL(true);
        if(isSet($httpVars["minisite_layout"])){
            $data["PYDIO_TEMPLATE_NAME"] = $httpVars["minisite_layout"];
        } else {
            if($node->isLeaf()) $data["PYDIO_TEMPLATE_NAME"] = "pydio_unique_strip";
            else $data["PYDIO_TEMPLATE_NAME"] = "pydio_shared_folder";
        }
        if(isSet($httpVars["expiration"])){
            if(intval($httpVars["expiration"]) > 0){
                $data["EXPIRE_TIME"] = time() + intval($httpVars["expiration"]) * 86400;
            }else if(isSet($data["EXPIRE_TIME"])) {
                unset($data["EXPIRE_TIME"]);
            }
        }
        if(isSet($httpVars["downloadlimit"])){
            if(intval($httpVars["downloadlimit"]) > 0){
                $data["DOWNLOAD_LIMIT"] = intval($httpVars["downloadlimit"]);
            }else if(isSet($data["DOWNLOAD_LIMIT"])){
                unset($data["DOWNLOAD_LIMIT"]);
            }
        }

        if(isSet($httpVars["custom_handle"]) && !empty($httpVars["custom_handle"]) &&
            (!isSet($this->hash) || $httpVars["custom_handle"] != $this->hash)){
            // Existing already
            $value = InputFilter::sanitize($httpVars["custom_handle"], InputFilter::SANITIZE_ALPHANUM);
            $value = strtolower($value);
            if(strlen($value) < $this->store->getHashMinLength()){
                $mess = LocaleService::getMessages();
                throw new \Exception(str_replace("%s", $this->store->getHashMinLength(), $mess["share_center.223"]));
            }
            $test = $this->store->loadShare($value);
            $mess = LocaleService::getMessages();
            if(!empty($test)) {
                throw new \Exception($mess["share_center.172"]);
            }
            if(!isSet($this->hash)){
                $this->hash = $value;
            }else{
                $this->newHash = $value;
            }
        }

    }

    /**
     * @param PublicAccessManager $publicAccessManager
     * @param array $messages
     * @return mixed
     * @throws \Exception
     */
    public function getJsonData($publicAccessManager, $messages){

        $storedData = $this->internal;
        $minisiteIsPublic = !empty($storedData["PRELOG_USER"]);
        $dlDisabled = isSet($storedData["DOWNLOAD_DISABLED"]) && $storedData["DOWNLOAD_DISABLED"] === true;
        $shareMeta = isSet($this->additionalMeta) ? $this->additionalMeta : array();
        $internalUserId = (!empty($storedData["PRELOG_USER"]) ? $storedData["PRELOG_USER"] : $storedData["PRESET_LOGIN"]);
        if(empty($internalUserId)){
            throw new \Exception("Oops, link ".$this->getHash()." has no internal user id, this is not normal.");
        }

        $jsonData = array(
            "public"            => $minisiteIsPublic?"true":"false",
            "disable_download"  => $dlDisabled,
            "hash"              => $this->getHash(),
            "hash_is_shorten"   => isSet($shareMeta["short_form_url"]) || isSet($this->internal["SHORT_FORM_URL"]),
            "internal_user_id"   => $internalUserId
        );

        if(empty($storedData["TARGET"]) || $storedData["TARGET"] == "public"){
            if (isSet($shareMeta["short_form_url"])) {
                $jsonData["public_link"] = $shareMeta["short_form_url"];
            } else if(!empty($this->internal["SHORT_FORM_URL"])){
                $jsonData["public_link"] = $this->getShortFormUrl();
            } else {
                $jsonData["public_link"] = $publicAccessManager->buildPublicLink($this->getHash());
            }
        }

        if(!empty($storedData["DOWNLOAD_LIMIT"]) && !$dlDisabled){
            $jsonData["download_counter"] = $this->getDownloadCount();
            $jsonData["download_limit"] = $storedData["DOWNLOAD_LIMIT"];
        }
        if(!empty($storedData["EXPIRE_TIME"])){
            $delta = $storedData["EXPIRE_TIME"] - time();
            $days = round($delta / (60*60*24));
            $jsonData["expire_time"] = date($messages["date_format"], $storedData["EXPIRE_TIME"]);
            $jsonData["expire_after"] = $days;
        }else{
            $jsonData["expire_after"] = 0;
        }
        $jsonData["is_expired"] = $this->isExpired();
        if(isSet($storedData["PYDIO_TEMPLATE_NAME"])){
            $jsonData["minisite_layout"] = $storedData["PYDIO_TEMPLATE_NAME"];
        }
        if(!$minisiteIsPublic){
            $jsonData["has_password"] = true;
        }
        if(isSet($storedData['TARGET_USERS'])){
            $jsonData["target_users"] = $storedData["TARGET_USERS"];
        }
        if(isSet($storedData['RESTRICT_TO_TARGET_USERS']) && $storedData['RESTRICT_TO_TARGET_USERS']){
            $jsonData["restrict_to_target_users"] = true;
        }
        foreach($this->modifiableShareKeys as $key){
            if(isSet($storedData[$key])) $jsonData[$key] = $storedData[$key];
        }

        return $jsonData;

    }

    /**
     * @param string $ownerId
     */
    public function setOwnerId($ownerId){
        if(!empty($ownerId)){
            $this->internal["OWNER_ID"] = $ownerId;
        }
    }

    /**
     * @return string
     */
    public function getOwnerId(){
        return $this->internal["OWNER_ID"];
    }

    /**
     * Generate a random user ID. Set in PRELOG_USER or PRESET_LOGIN depending on the hasPassword value.
     * @param string $prefix
     * @param bool|false $hasPassword
     */
    public function createHiddenUserId($prefix = "", $hasPassword = false){
        $userId = substr(md5(time()), 0, 12);
        if (!empty($prefix)) {
            $userId = $prefix.$userId;
        }
        $this->setUniqueUser($userId, $hasPassword);
    }

    /**
     * Generate a random password
     * @return string
     */
    public function createHiddenUserPassword(){
        return $this->getUniqueUser().self::PasswordComplexitySuffix; //substr(md5(time()), 13, 24);
    }

    /**
     * @return string
     */
    public function getUniqueUser(){
        if(!empty($this->internal["PRELOG_USER"])) return $this->internal["PRELOG_USER"];
        else return $this->internal["PRESET_LOGIN"];
    }

    /**
     * @param string $userId
     * @param bool|false $requirePassword
     */
    public function setUniqueUser($userId, $requirePassword = false){
        if(isSet($this->internal["PRELOG_USER"])) unset($this->internal["PRELOG_USER"]);
        if(isSet($this->internal["PRESET_LOGIN"])) unset($this->internal["PRESET_LOGIN"]);
        if($requirePassword){
            $this->internal["PRESET_LOGIN"] = $userId;
        }else{
            $this->internal["PRELOG_USER"] = $userId;
        }
    }

    /**
     * @return bool
     */
    public function shouldRequirePassword(){
        return isSet($this->internal["PRESET_LOGIN"]);
    }

    /**
     * @return bool
     */
    public function disableDownload(){
        return $this->internal["DOWNLOAD_DISABLED"];
    }

    /**
     * @return string
     */
    public function getApplicationBase(){
        return $this->internal["PYDIO_APPLICATION_BASE"];
    }

    /**
     * @return array
     */
    public function getData(){
        return $this->internal;
    }

    /**
     * @return string
     */
    public function getHash()
    {
        return $this->hash;
    }

    /**
     * @return string
     */
    public function getNewHash()
    {
        return $this->newHash;
    }

    /**
     * @return bool
     */
    public function isExpired(){
        return self::isShareExpired($this->internal);
    }

    /**
     * @return bool
     */
    public function hasDownloadLimit(){
        return isSet($this->internal["DOWNLOAD_LIMIT"]) && $this->internal["DOWNLOAD_LIMIT"] > 0;
    }

    /**
     * @return int|null
     */
    public function getDownloadLimit(){
        return $this->internal["DOWNLOAD_LIMIT"];
    }

    /**
     * @param $data
     * @return bool
     */
    public static function isShareExpired($data){
        $timeExpire = !empty($data["EXPIRE_TIME"]) && time() > $data["EXPIRE_TIME"];
        if($timeExpire) return true;
        if(!empty($data["DOWNLOAD_LIMIT"]) && $data["DOWNLOAD_LIMIT"]> 0){
            $dlLimit = $data['DOWNLOAD_LIMIT'];
            $expired = ($data['DOWNLOAD_COUNT'] >= $dlLimit);
            if(isSet($data['TARGET_USERS'])){
                // If there are target users, make sure they are all expired
                $expired = array_reduce($data['TARGET_USERS'], function($input, $entry) use ($dlLimit) {
                    return $input || ($entry['download_count'] >= $dlLimit);
                }, $expired);
            }
            if($expired) return true;
        }
        return false;

    }

    /**
     * Number of times the link has been download
     * @return int|mixed
     */
    public function getDownloadCount(){
        $globalDl = isSet($this->internal["DOWNLOAD_COUNT"]) ? $this->internal["DOWNLOAD_COUNT"] : 0;
        if($this->hasTargetUsers()){
            foreach($this->internal['TARGET_USERS'] as $entry){
                $globalDl += $entry['download_count'];
            }
        }
        return $globalDl;
    }

    /**
     * Increments internal counter
     * @param ContextInterface $ctx
     * @throws PydioException
     */
    public function incrementDownloadCount($ctx){
        $found = false;
        if($this->hasTargetUsers() && $ctx->hasUser()){
            $u = $ctx->getUser();
            $tmpLabel = $u->getPersonalRole()->filterParameterValue("core.conf","USER_TEMPORARY_DISPLAY_NAME", PYDIO_REPO_SCOPE_ALL, "");
            if(!empty($tmpLabel)){
                foreach($this->internal['TARGET_USERS'] as &$entry){
                    if($entry['display'] === $tmpLabel){
                        if(!empty($this->internal['DOWNLOAD_LIMIT']) && $entry['download_count'] >= $this->internal['DOWNLOAD_LIMIT']){
                            throw new PydioException("You have reached the maximum number of downloads!");
                        }
                        $entry['download_count'] ++;
                        $found = true;
                        break;
                    }
                }
            }
        }
        if(!$found){
            $this->internal["DOWNLOAD_COUNT"] = $this->getDownloadCount() + 1;
        }
    }

    /**
     * Set internal counter to 0
     */
    public function resetDownloadCount(){
        $this->internal["DOWNLOAD_COUNT"] = 0;
        if($this->hasTargetUsers()){
            foreach($this->internal['TARGET_USERS'] as &$entry){
                $entry['download_count'] = 0;
            }
        }
    }

    /**
     * @param array $usersList
     * @param bool $restrict
     */
    public function addTargetUsers($usersList, $restrict = false){
        $internal = isSet($this->internal['TARGET_USERS']) ? $this->internal['TARGET_USERS'] : [];
        foreach($usersList as $id => $display){
            $internal[$id] = ['display' => $display, 'download_count' => 0];
        }
        $this->internal['TARGET_USERS'] = $internal;
        $this->internal["RESTRICT_TO_TARGET_USERS"] = $restrict;
    }

    /**
     * @return bool
     */
    public function hasTargetUsers(){
        return isSet($this->internal['TARGET_USERS']) && count($this->internal['TARGET_USERS']);
    }

    /**
     * @return bool
     */
    public function restrictToTargetUsers(){
        return (isSet($this->internal['RESTRICT_TO_TARGET_USERS']) && $this->internal['RESTRICT_TO_TARGET_USERS'] === true);
    }

    /**
     * @return array
     */
    public function getTargetUsers(){
        return $this->internal['TARGET_USERS'];
    }

    /**
     * @return string
     */
    public function getParentRepositoryId()
    {
        return $this->parentRepositoryId;
    }

    /**
     * @param string $parentRepositoryId
     */
    public function setParentRepositoryId($parentRepositoryId)
    {
        $this->parentRepositoryId = $parentRepositoryId;
    }

}
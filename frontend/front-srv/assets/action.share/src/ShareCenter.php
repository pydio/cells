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
namespace Pydio\Share;

use DOMNode;
use DOMXPath;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Pydio\Access\Core\AbstractAccessDriver;
use Pydio\Access\Core\Model\Node;
use Pydio\Access\Core\Model\NodesDiff;
use Pydio\Access\Core\Model\NodesList;
use Pydio\Access\Core\Model\Repository;
use Pydio\Access\Core\Model\UserSelection;
use Pydio\Core\Controller\Controller;
use Pydio\Core\Exception\PydioException;
use Pydio\Core\Http\Base;
use Pydio\Core\Http\Message\UserMessage;
use Pydio\Core\Http\Response\SerializableResponseStream;
use Pydio\Core\Model\Context;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Model\RepositoryInterface;
use Pydio\Core\Model\RepositoryRoot;
use Pydio\Core\PluginFramework\Plugin;
use Pydio\Core\PluginFramework\PluginsService;
use Pydio\Core\Services\ApplicationState;
use Pydio\Core\Services\ConfService;
use Pydio\Core\Services\LocaleService;
use Pydio\Core\Services\PoliciesFactory;
use Pydio\Core\Services\RepositoryService;
use Pydio\Core\Services\SessionService;
use Pydio\Core\Services\UsersService;
use Pydio\Core\Utils\Vars\InputFilter;
use Pydio\Notification\Core\ActivityCenter;
use Pydio\OCS as OCS;
use Pydio\OCS\Model\TargettedLink;
use Pydio\Share\Http\MinisiteServer;
use Pydio\Share\Model\CompositeShare;
use Pydio\Share\Model\ShareLink;
use Pydio\Share\Store\ShareRightsManager;
use Pydio\Share\Store\ShareStore;
use Pydio\Share\View\PublicAccessManager;
use Swagger\Client\Model\IdmWorkspaceScope;
use Zend\Diactoros\Response;
use Zend\Diactoros\Response\JsonResponse;

defined('PYDIO_EXEC') or die( 'Access not allowed');
require_once(dirname(__FILE__)."/../vendor/autoload.php");

/**
 * @package AjaXplorer_Plugins
 * @subpackage Action
 */
class ShareCenter extends Plugin
{
    /**
     * @var AbstractAccessDriver
     */
    private $accessDriver;
    /**
     * @var RepositoryInterface
     */
    private $repository;
    private $urlBase;

    /**
     * @var ShareStore
     */
    private $shareStore;

    /**
     * @var PublicAccessManager
     */
    private $publicAccessManager;

    /**
     * @var ShareRightsManager
     */
    private $rightsManager;

    /**
     * @var ContextInterface
     */
    private $currentContext;

    /**************************/
    /* PLUGIN LIFECYCLE METHODS
    /**************************/
    /**
     * Plugin initializer
     * @param ContextInterface $ctx
     * @param array $options
     */
    public function init(ContextInterface $ctx, $options = [])
    {
        parent::init($ctx, $options);
        if(!$ctx->hasRepository()){
            return;
        }
        $this->repository = $ctx->getRepository();
        if (!($this->repository->getDriverInstance($ctx) instanceof \Pydio\Access\Core\IPydioWrapperProvider)) {
            return;
        }
        $this->accessDriver = $this->repository->getDriverInstance($ctx);
        $this->urlBase = $ctx->getUrlBase();
        $this->currentContext = $ctx;
    }

    /**
     * Extend parent
     * @param DOMNode $contribNode
     */
    protected function parseSpecificContributions(ContextInterface $ctx, \DOMNode &$contribNode)
    {
        parent::parseSpecificContributions($ctx, $contribNode);
        if(!$ctx->getRepository()){
            return;
        }

        $disableSharing = false;
        $xpathesToRemove = array();
        $selectionContext = false;

        if( strpos($ctx->getRepository()->getAccessType(), "ajxp_") === 0){

            $disableSharing = true;

        }else if (UsersService::usersEnabled()) {

            $loggedUser = $ctx->getUser();
            if ($loggedUser != null && UsersService::isReservedUserId($loggedUser->getId())) {
                $disableSharing = true;
            }

        } else {

            $disableSharing = true;

        }
        if ($disableSharing) {
            // All share- actions
            $xpathesToRemove[] = 'action[@name="share-edit-shared"]';
            $xpathesToRemove[] = 'action[@name="share_react"]';

        }else{
            $folderSharingAllowed = $this->getAuthorization($ctx, "folder", "any");
            $fileSharingAllowed   = $this->getAuthorization($ctx, "file", "any");
            if($folderSharingAllowed && !$fileSharingAllowed){
                $selectionContext = "dir";
            }else if(!$folderSharingAllowed && $fileSharingAllowed){
                $selectionContext = "file";
            }else if(!$fileSharingAllowed && !$folderSharingAllowed){
                // All share- actions
                $xpathesToRemove[] = 'action[@name="share-edit-shared"]';
                $xpathesToRemove[] = 'action[@name="share_react"]';
            }
        }

        foreach($xpathesToRemove as $xpath){
            $actionXpath=new DOMXPath($contribNode->ownerDocument);
            $nodeList = $actionXpath->query($xpath, $contribNode);
            foreach($nodeList as $shareActionNode){
                $contribNode->removeChild($shareActionNode);
            }
        }
        if(isSet($selectionContext)){
            $actionXpath=new DOMXPath($contribNode->ownerDocument);
            $nodeList = $actionXpath->query('action[@name="share_react"]/gui/selectionContext', $contribNode);
            if(!$nodeList->length) return;
            /** @var \DOMElement $selectionContextNode */
            $selectionContextNode =  $nodeList->item(0);
            if($selectionContext == "dir") $selectionContextNode->setAttribute("file", "false");
            else if($selectionContext == "file") $selectionContextNode->setAttribute("dir", "false");
        }

    }


    /**************************/
    /* PUBLIC LINKS ROUTER
    /**************************/
    /**
     * @param $serverBase
     * @param $route
     * @param $params
     */
    public static function publicRoute($serverBase, $route, $params){

        if(isSet($_GET['minisite_session'])){

            $base = new Base();
            $h = $_GET['minisite_session'];
            SessionService::setSessionName("AjaXplorer_Shared".str_replace(".","_",$h));
            $base->handleRoute($serverBase, "/", ["minisite" => true]);

        }else{

            $hash = isSet($params["hash"])? $params["hash"] : "";
            if(strpos($hash, "--") !== false){
                list($hash, $lang) = explode("--", $hash);
            }
            if(strpos($hash, ".php") !== false){
                $hash = array_shift(explode(".php", $hash));
            }

            ConfService::init();
            ConfService::start();
            if(isSet($lang)){
                $_GET["lang"] = $lang;
            }
            if(isSet($params["optional"])){
                $_GET["dl"] = true;
                $_GET["file"] = "/".$params["optional"];
            }
            ConfService::getAuthDriverImpl();

            $minisiteServer = new MinisiteServer($serverBase, $hash, isSet($params["optional"]));
            $minisiteServer->registerCatchAll();
            $minisiteServer->listen();

        }
    }

    /**************************/
    /* BOOTLOADERS FOR LINKS
    /**************************/
    /**
     * Loader for minisites
     * @param array $data
     * @param string $hash
     * @param null $error
     */
    public static function loadMinisite($data, $hash = '', $error = null)
    {
        $base = rtrim(dirname($_SERVER["SCRIPT_NAME"]), "/");
        $id = pathinfo($_SERVER["SCRIPT_NAME"], PATHINFO_FILENAME);
        self::publicRoute($base, "/proxy", ["hash" => $id]);
    }

    /**************************/
    /* UTILS & ACCESSORS
    /**************************/
    /**
     * Compute right to create shares based on plugin options
     * @param ContextInterface $ctx
     * @param string $nodeType "file"|"folder"
     * @param string $shareType "any"|"minisite"|"workspace"
     * @return bool
     */
    protected function getAuthorization(ContextInterface $ctx, $nodeType, $shareType = "any"){

        $all             = $this->getContextualOption($ctx, "DISABLE_ALL_SHARING");
        if($all){
            return false;
        }
        /*
         *
        if($ctx->getRepository()->hasParent()){
            $p = $ctx->getRepository()->getParentRepository();
            if(!empty($p) && !$p->isTemplate()){
                $pContext = new Context($ctx->getRepository()->getOwner(), $p->getId());
                $all = $this->getContextualOption($pContext, "DISABLE_RESHARING");
                if($all){
                    return false;
                }
            }
        }
        */
        
        $filesMini       = $this->getContextualOption($ctx, "ENABLE_FILE_PUBLIC_LINK");
        $filesInternal   = $this->getContextualOption($ctx, "ENABLE_FILE_INTERNAL_SHARING");
        $foldersMini     = $this->getContextualOption($ctx, "ENABLE_FOLDER_PUBLIC_LINK");
        $foldersInternal = $this->getContextualOption($ctx, "ENABLE_FOLDER_INTERNAL_SHARING");

        if($shareType == "any"){
            return ($nodeType == "file" ? $filesInternal || $filesMini : $foldersInternal || $foldersMini);
        }else if($shareType == "minisite"){
            return ($nodeType == "file" ? $filesMini : $foldersMini);
        }else if($shareType == "workspace"){
            return ($nodeType == "file" ? $filesInternal : $foldersInternal);
        }
        return false;

    }

    /**
     * @return ShareCenter
     */
    public static function getShareCenter(ContextInterface $ctx = null){
        if($ctx === null){
            $ctx = Context::emptyContext();
        }
        /** @var ShareCenter $shareCenter */
        $shareCenter = PluginsService::getInstance($ctx)->getPluginById("action.share");
        if(empty($shareCenter->currentContext)){
            $shareCenter->currentContext = $ctx;
        }
        return $shareCenter;
    }

    /**
     * @return bool
     */
    public static function currentContextIsLinkDownload(){
        return (isSet($_GET["dl"]) && isSet($_GET["dl"]) == "true");
    }

    /**
     * Check if the hash seems to correspond to the serialized data.
     * Kept there only for backward compatibility
     * @static
     * @param String $outputData serialized data
     * @param String $hash Id to check
     * @return bool
     */
    public static function checkHash($outputData, $hash)
    {
        // Never return false, otherwise it can break listing due to hardcore exit() call;
        // Rechecked later
        return true;

        //$full = md5($outputData);
        //return (!empty($hash) && strpos($full, $hash."") === 0);
    }


    /**
     * @param ContextInterface $ctx
     * @return ShareStore
     */
    public function getShareStore(ContextInterface $ctx = null){

        if(!isSet($this->shareStore) || $ctx !== null){
            $hMin = 32;
            $context = $ctx !== null ? $ctx : $this->currentContext;
            if(!empty($context)){
                $hMin = $this->getContextualOption($context, "HASH_MIN_LENGTH");
            }
            $this->shareStore = new ShareStore($context, $hMin);
        }
        return $this->shareStore;
    }

    /**
     * @return View\PublicAccessManager
     */
    public function getPublicAccessManager(){

        if(!isSet($this->publicAccessManager)){
            $this->publicAccessManager = new PublicAccessManager([]);
        }
        return $this->publicAccessManager;

    }

    /**
     * @return ShareRightsManager
     */
    protected function getRightsManager(){
        if(!isSet($this->rightsManager)){
            if(isSet($this->currentContext)){
                $options = array(
                    "SHARED_USERS_TMP_PREFIX" => $this->getContextualOption($this->currentContext, "SHARED_USERS_TMP_PREFIX"),
                    "SHARE_FORCE_PASSWORD" => $this->getContextualOption($this->currentContext, "SHARE_FORCE_PASSWORD")
                );
            }else{
                $options = array(
                    "SHARED_USERS_TMP_PREFIX" => "ext_",
                    "SHARE_FORCE_PASSWORD" => false
                );
            }
            $this->rightsManager = new ShareRightsManager(
                $this->currentContext,
                $options,
                $this->getShareStore());
        }
        return $this->rightsManager;
    }

    /**
     * Update parameter value based on current max allowed option.
     * @param array $httpVars
     * @param string $parameterName
     * @param string $optionName
     */
    protected function updateToMaxAllowedValue(&$httpVars, $parameterName, $optionName){

        $maxvalue = abs(intval($this->getContextualOption($this->currentContext, $optionName)));
        $value = isset($httpVars[$parameterName]) ? abs(intval($httpVars[$parameterName])) : 0;
        if ($maxvalue == 0) {
            $httpVars[$parameterName] = $value;
        } elseif ($maxvalue > 0 && $value == 0) {
            $httpVars[$parameterName] = $maxvalue;
        } else {
            $httpVars[$parameterName] = min($value,$maxvalue);
        }

    }

    /**
     * @param $userId string
     * @param $nodeUuid string
     * @param bool $toggle
     */
    protected function toggleWatchOnSharedRepository($userId, $nodeUuid, $toggle = true){
        if (!$this->currentContext->hasUser()) {
            return;
        }
        if ($toggle) {
            $events = [ActivityCenter::SUBSCRIBE_CHANGE];
        } else {
            $events = [];
        }
        ActivityCenter::UserSubscribeToNode($userId, $nodeUuid, $events);
    }

    /**************************/
    /* CALLBACKS FOR ACTIONS
    /**************************/
    /**
     * Added as preprocessor on Download action to handle download Counter.
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     * @throws \Exception
     */
    public function preProcessDownload(ServerRequestInterface &$requestInterface, ResponseInterface &$responseInterface){

        if(!ApplicationState::hasMinisiteHash()) {
            return;
        }

        $hash = ApplicationState::getMinisiteHash();
        $share = $this->getShareStore()->loadLink($hash);
        if(!empty($share)){
            if($share->isExpired()){
                throw new \Exception('Link is expired');
            }
            if($share->hasDownloadLimit() || $share->hasTargetUsers()){
                $share->incrementDownloadCount($requestInterface->getAttribute('ctx'));
                $share->save();
            }
        }

    }

    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     * @return null
     * @throws \Exception
     * @throws \Pydio\Core\Exception\PydioException
     */
    public function switchAction(ServerRequestInterface &$requestInterface, ResponseInterface &$responseInterface)
    {
        $action = $requestInterface->getAttribute("action");
        $httpVars = $requestInterface->getParsedBody();
        /** @var ContextInterface $ctx */
        $this->currentContext = $ctx = $requestInterface->getAttribute("ctx");

        if (strpos($action, "sharelist") === false && !isSet($this->accessDriver)) {
            //throw new \Exception("Cannot find access driver!");
            $this->accessDriver = $ctx->getRepository()->getDriverInstance($ctx);
        }


        if (strpos($action, "sharelist") === false && $this->accessDriver->getId() == "access.demo") {
            $errorMessage = "This is a demo, all 'write' actions are disabled!";
            if ($httpVars["sub_action"] === "delegate_repo") {
                $responseInterface = $responseInterface->withBody(new SerializableResponseStream([new UserMessage($errorMessage, LOG_LEVEL_ERROR)]));
                return;
            } else {
                $responseInterface->getBody()->write($errorMessage);
            }
            return null;
        }

        switch ($action) {

            //------------------------------------
            // SHARING FILE OR FOLDER
            //------------------------------------
            case "share":

                $subAction = (isSet($httpVars["sub_action"])?$httpVars["sub_action"]:"");
                // REST API COMPATIBILITY
                if(empty($subAction) && isSet($httpVars["simple_share_type"])){
                    $subAction = "create_minisite";
                    if(!isSet($httpVars["simple_right_read"]) && !isSet($httpVars["simple_right_download"])){
                        $httpVars["simple_right_read"] = $httpVars["simple_right_download"] = "true";
                    }else if(!isSet($httpVars["simple_right_read"]) && isSet($httpVars["simple_right_download"]) && !isSet($httpVars["simple_right_write"])){
                        $httpVars["minisite_layout"] = "pydio_unique_dl";
                    }
                    $httpVars["create_guest_user"] = "true";
                    if($httpVars["simple_share_type"] == "private" && !isSet($httpVars["guest_user_pass"])){
                        throw new \Exception("Please provide a guest_user_pass for private link");
                    }
                }
                $userSelection = UserSelection::fromContext($ctx, $httpVars);
                $pydioNode = $userSelection->getUniqueNode();
                if (!file_exists($pydioNode->getUrl())) {
                    throw new \Exception("Cannot share a non-existing file: ".$pydioNode->getUrl());
                }

                $this->updateToMaxAllowedValue($httpVars, "downloadlimit", "FILE_MAX_DOWNLOAD");
                $this->updateToMaxAllowedValue($httpVars, "expiration", "FILE_MAX_EXPIRATION");

                $httpHash = null;
                $originalHash = null;

                if ($subAction == "delegate_repo") {

                    $auth = $this->getAuthorization($ctx, "folder", "workspace");
                    if(!$auth){
                        $mess = LocaleService::getMessages();
                        throw new \Exception($mess["351"]);
                    }

                    $users = array(); $groups = array();
                    $this->getRightsManager()->createUsersFromParameters($httpVars, $users, $groups);

                    $result = $this->createSharedRepository($httpVars, $isUpdate, $users, $groups);

                    if (is_object($result) && $result instanceof Repository) {

                        if(!$isUpdate){
                            $this->getShareStore()->storeShare($this->repository->getId(), array(
                                "REPOSITORY" => $result->getUniqueId(),
                                "OWNER_ID" => $ctx->getUser()->getId()), "repository");
                        }

                        $plainResult = 200;
                    } else {
                        $plainResult = $result;
                    }

                } else if ($subAction == "create_minisite") {

                    if(isSet($httpVars["hash"]) && !empty($httpVars["hash"])) $httpHash = $httpVars["hash"];

                    $result = $this->createSharedMinisite($httpVars, $pydioNode, $isUpdate);
                    
                    if (!is_array($result)) {
                        $url = $result;
                    } else {
                        list($hash, $url) = $result;
                    }
                    $plainResult = $url;

                } else if ($subAction == "share_node"){

                    $httpVars["return_json"] = true;
                    if(isSet($httpVars["hash"]) && !empty($httpVars["hash"])) $httpHash = $httpVars["hash"];
                    $pydioNode->loadNodeInfo();

                    $compositeShare = $this->shareNode($ctx, $pydioNode, $httpVars, $isUpdate);
                }

                if(!isSet($httpVars["return_json"]) && isSet($plainResult)){

                    $responseInterface = $responseInterface->withHeader("Content-type", "text/plain");
                    $responseInterface->getBody()->write($plainResult);

                }else{

                    if(isSet($plainResult)){
                        // Reload
                        $compositeShares = $this->getShareStore()->loadCompositeSharesForNode($pydioNode);
                        if(!empty($compositeShares)){
                            $responseInterface = new JsonResponse($this->compositeShareToJson($ctx, $compositeShares[0]));
                        }else{
                            $responseInterface = new JsonResponse([]);
                        }
                    } else if ($compositeShare === null) {
                        $responseInterface = new JsonResponse([]);
                    } else {
                        $responseInterface = new JsonResponse($this->compositeShareToJson($ctx, $compositeShare));
                    }

                }

                break;

            case "load_shared_element_data":

                SessionService::close();
                $mess = LocaleService::getMessages();

                if(isSet($httpVars["file"])){

                    $file = InputFilter::decodeSecureMagic($httpVars["file"]);
                    $node = new Node($ctx->getUrlBase().$file);
                    $compositeShares = $this->getShareStore()->loadCompositeSharesForNode($node);
                    if(empty($compositeShare)){
                        throw new \Exception(str_replace('%s', "Could not find any share data for ".$file, $mess["share_center.219"]));
                    }
                    // TODO : RETURN MANY SHARES ?
                    $compositeShare = $compositeShares[0];

                } else {

                    $uuid = InputFilter::decodeSecureMagic($httpVars["node_uuid"], InputFilter::SANITIZE_NODE_UUID);
                    $shareId = InputFilter::decodeSecureMagic($httpVars["share_id"], InputFilter::SANITIZE_ALPHANUM);
                    $compositeShare = $this->getShareStore()->loadCompositeShare($uuid, $shareId);

                }
                $responseInterface = new JsonResponse($this->compositeShareToJson($ctx, $compositeShare));


            break;

            case "unshare":

                $mess = LocaleService::getMessages();
                $userSelection = UserSelection::fromContext($ctx, $httpVars);
                if(isSet($httpVars["hash"])){

                    $sanitizedHash = InputFilter::sanitize($httpVars["hash"], InputFilter::SANITIZE_ALPHANUM);
                    $pydioNode = ($userSelection->isEmpty() ? null : $userSelection->getUniqueNode());
                    $result = $this->getShareStore()->deleteShare($httpVars["element_type"], $sanitizedHash, false, false);
                    if($result !== false){
                        $x = new SerializableResponseStream([new UserMessage($mess["share_center.216"])]);
                        $responseInterface = $responseInterface->withBody($x);
                    }

                }else{

                    $userSelection = UserSelection::fromContext($ctx, $httpVars);
                    $pydioNode = $userSelection->getUniqueNode();
                    $shares = array();
                    $compositeShares = $this->getShareStore()->loadCompositeSharesForNode($pydioNode);
                    foreach($compositeShares as $compositeShare){
                        foreach($compositeShare->getLinks() as $shareLink){
                            $this->getShareStore()->deleteShare("minisite", $shareLink->getHash(), false, true);
                        }
                        $this->getShareStore()->deleteShare("repository", $compositeShare->getRepositoryId(), false, true);
                    }
                    $x = new SerializableResponseStream([new UserMessage($mess["share_center.216"])]);
                    $responseInterface = $responseInterface->withBody($x);

                }
                break;

            case "reset_counter":

                if(isSet($httpVars["hash"])){

                    $userId = $ctx->getUser()->getId();
                    $this->getShareStore()->resetDownloadCounter($httpVars["hash"], $userId);

                }else{

                    $userSelection = UserSelection::fromContext($ctx, $httpVars);
                    $pydioNode = $userSelection->getUniqueNode();
                    /*
                     * TODO : Use CompositeShare
                    $metadata = $this->getShareStore()->getMetaManager()->getNodeMeta($ajxpNode);
                    if(!isSet($metadata["shares"]) || !is_array($metadata["shares"])){
                        return null;
                    }
                    if ( isSet($httpVars["element_id"]) && isSet($metadata["shares"][$httpVars["element_id"]])) {
                        $this->getShareStore()->resetDownloadCounter($httpVars["element_id"], $httpVars["owner_id"]);
                    }else{
                        $keys = array_keys($metadata["shares"]);
                        foreach($keys as $key){
                            $this->getShareStore()->resetDownloadCounter($key, null);
                        }
                    }
                    */

                }

            break;

            case "share_link_update_target_users":

                $hash = InputFilter::decodeSecureMagic($httpVars["hash"]);
                $shareLink = $this->getShareStore()->loadLink($hash);
                $repository = $shareLink->getRepository();
                $this->getShareStore()->testUserCanEditShare($ctx->getUser(), $repository);
                if(isSet($httpVars['json_users'])){
                    $values = json_decode($httpVars['json_users'], true);
                }
                if(!empty($values)){
                    $values = array_map( function($e){ return InputFilter::sanitize($e, InputFilter::SANITIZE_EMAILCHARS);}, $values );
                    $shareLink->addTargetUsers($values, (isSet($httpVars['restrict']) && $httpVars['restrict'] === 'true'));
                    $shareLink->save();
                    $responseInterface = new JsonResponse(['success' => true, 'users' => $values]);
                }else{
                    $responseInterface = new JsonResponse(['success' => false]);
                }

                break;

            case "sharelist-load":

                $itemsPerPage   = 50;
                $crtPage        = 1;
                $crtOffset      = 0;
                $parentRepoId   = isset($httpVars["parent_repository_id"]) ? $httpVars["parent_repository_id"] : "";
                $userContext    = $httpVars["user_context"];
                $shareType      = isSet($httpVars["share_type"])? InputFilter::sanitize($httpVars["share_type"], InputFilter::SANITIZE_ALPHANUM) : null;
                $currentUser    = $ctx->getUser()->getId();
                $clearBroken    = (isSet($httpVars["clear_broken_links"]) && $httpVars["clear_broken_links"] === "true") ? 0 : -1;
                if($userContext == "global" && $ctx->getUser()->isAdmin()){
                    $currentUser = false;
                }else if($userContext == "user" && $ctx->getUser()->isAdmin() && !empty($httpVars["user_id"])){
                    $currentUser = InputFilter::sanitize($httpVars["user_id"], InputFilter::SANITIZE_EMAILCHARS);
                }
                if (isSet($httpVars["dir"]) && strstr($httpVars["dir"], "%23")!==false) {
                    $parts = explode("%23", $httpVars["dir"]);
                    $crtPage = intval($parts[1]);
                    $crtOffset = ($crtPage - 1) * $itemsPerPage;
                }else if(isSet($httpVars["page"])){
                    $crtPage = intval($httpVars["page"]);
                    $crtOffset = ($crtPage - 1) * $itemsPerPage;
                }
                $cursor = [$crtOffset, $itemsPerPage];
                if($clearBroken > -1) {
                    $cursor = null;
                }
                if($httpVars['format'] === 'json'){
                    $data = $this->listSharesJson($ctx, $currentUser, $parentRepoId, $shareType, $cursor);
                    if($currentUser !== '__GROUP__' && $parentRepoId !== '__GROUP__' && $shareType !== '__GROUP__'){
                        foreach($data as $hash => $shareData){
                            $clearBroken = 0;
                            if($shareData === null) {
                                unset($data[$hash]);
                                $this->getShareStore($ctx)->deleteShareEntry($hash);
                                continue;
                            }

                            $metadata = $this->buildMetadataForShare($ctx, $hash, $shareData, $parentRepoId, $clearBroken);
                            if($metadata !== null){
                                $data[$hash]["metadata"] = $metadata;
                            }else{
                                $this->getShareStore($ctx)->deleteShareEntry($hash);
                                unset($data[$hash]);
                            }
                        }
                    }
                    $responseInterface = new JsonResponse(["data" => $data, "cursor" => $cursor]);
                    break;
                }
                $nodes = $this->listSharesAsNodes($ctx, "/data/repositories/$parentRepoId/shares", $currentUser, $parentRepoId, $cursor, $clearBroken, $shareType);
                if($clearBroken > -1){
                    $responseInterface = new JsonResponse(["cleared_count" => $clearBroken]);
                    break;
                }
                $total = $cursor["total"];

                $nodesList = new NodesList();
                if($total > $itemsPerPage){
                    $nodesList->setPaginationData($total, $crtPage, round($total / $itemsPerPage));
                }
                if($userContext == "current"){
                    $nodesList->initColumnsData("", "", "ajxp_user.shares");
                    $nodesList->appendColumn("settings.8", "ajxp_label");
                    $nodesList->appendColumn("share_center.132", "shared_element_parent_repository_label");
                    $nodesList->appendColumn("3", "share_type_readable");
                }else{
                    $nodesList->initColumnsData("filelist", "list", "settings.repositories");
                    $nodesList->appendColumn("settings.8", "ajxp_label");
                    $nodesList->appendColumn("share_center.159", "owner");
                    $nodesList->appendColumn("3", "share_type_readable");
                    $nodesList->appendColumn("share_center.52", "share_data");
                }
                foreach($nodes as $node){
                    $nodesList->addBranch($node);
                }
                $x = new SerializableResponseStream([$nodesList]);
                $responseInterface = $responseInterface->withBody($x);

            break;

            case "sharelist-clearExpired":

                $accessType = $ctx->getRepository()->getAccessType();
                $currentUser  = ($accessType != "settings" && $accessType != "ajxp_admin");
                $count = $this->getShareStore()->clearExpiredFiles($currentUser);
                if($count){
                    $message = "Removed ".count($count)." expired links";
                }else{
                    $message = "Nothing to do";
                }
                $x = new SerializableResponseStream([new UserMessage($message)]);
                $responseInterface = $responseInterface->withBody($x);


            break;

            default:
            break;
        }

        return null;

    }

    /**************************/
    /* CREATE / EDIT SHARES
    /**************************/

    /**
     * @param array $httpVars
     * @param UserSelection $userSelection
     * @return int
     * @throws \Exception
     */
    public function filterHttpVarsForLeafPath(&$httpVars, $userSelection){
        // ANALYSE SELECTION
        // TO CREATE PROPER FILTER / PATH FOR SHARED REPO
        $httpVars["minisite"] = true;
        $httpVars["selection"] = true;
        $nodes = $userSelection->buildNodes();
        $hasDir = false; $hasFile = false;
        foreach($nodes as $n){
            $n->loadNodeInfo();
            if($n->isLeaf()) $hasFile = true;
            else $hasDir = true;
        }
        if( ( $hasDir && !$this->getAuthorization($this->currentContext, "folder", "minisite") )
            || ($hasFile && !$this->getAuthorization($this->currentContext, "file"))){
            throw new \Exception(103);
        }
        if(!isSet($httpVars["repo_label"])){
            $first = $userSelection->getUniqueNode();
            $httpVars["repo_label"] = $first->getLabel();
        }

    }

    /**
     * @param array $httpVars
     * @param Node $node
     */
    public function filterHttpVarsFromUniqueNode(&$httpVars, $node){
        $httpVars["minisite"] = true;
        $httpVars["selection"] = true;
        if(!isSet($httpVars["repo_label"])){
            $httpVars["repo_label"] = $node->getLabel();
        }
    }

    /**
     * @param array $httpVars
     * @param bool $update
     * @return RepositoryInterface
     * @throws \Exception
     */
    protected function createOrLoadSharedRepository($httpVars, &$update){

        if (!isSet($httpVars["repo_label"]) || $httpVars["repo_label"] == "") {
            $mess = LocaleService::getMessages();
            throw new \Exception($mess["349"]);
        }

        if (isSet($httpVars["repository_id"])) {
            $editingRepo = RepositoryService::getRepositoryById($httpVars["repository_id"]);
            $update = true;
        }

        // CHECK REPO DOES NOT ALREADY EXISTS WITH SAME LABEL
        $label = InputFilter::sanitize(InputFilter::securePath($httpVars["repo_label"]), InputFilter::SANITIZE_HTML);
        $description = InputFilter::sanitize(InputFilter::securePath($httpVars["repo_description"]), InputFilter::SANITIZE_HTML);

        $loggedUser = $this->currentContext->getUser();
        $currentRepo = $this->currentContext->getRepository();

        if (isSet($editingRepo)) {

            $this->getShareStore()->testUserCanEditShare($this->currentContext->getUser(), $editingRepo);
            $newRepo = $editingRepo;
            $replace = false;
            if ($editingRepo->getDisplay() != $label) {
                $newRepo->setDisplay($label);
                $replace = true;
            }
            if($editingRepo->getDescription() != $description){
                $newRepo->setDescription($description);
                $replace = true;
            }
            if(isSet($httpVars["transfer_owner"])){
                $newOwnerId = InputFilter::sanitize($httpVars["transfer_owner"], InputFilter::SANITIZE_EMAILCHARS);
                if (!PoliciesFactory::isOwner($editingRepo->getPolicies(), $this->currentContext->getUser())) {
                    throw new PydioException($mess["share_center.224"]);
                }
                $newOwner = UsersService::getUserById($newOwnerId);
                $newPolicies = PoliciesFactory::replaceOwner($editingRepo->getPolicies(), $newOwner);
                $editingRepo->setPolicies($newPolicies);
                $replace = true;
            }

            if($replace) {
                RepositoryService::replaceRepository($newRepo->getId(), $newRepo);
            }

        } else {

            $newRoot = new RepositoryRoot();
            $newRoot->setUuid(InputFilter::decodeSecureMagic($httpVars["node_uuid"], InputFilter::SANITIZE_NODE_UUID));

            $newRepo = $currentRepo->createSharedChild(
                $label, $currentRepo->getId(), $loggedUser->getId()
            );
            $newRepo->setRootNodes([$newRoot]);
            $newRepo->setDescription($description);
            $newRepo->setPolicies(PoliciesFactory::policiesForUniqueUser($loggedUser));
            $newRepo->setScope(IdmWorkspaceScope::ROOM);
            RepositoryService::addRepository($newRepo);
        }
        return $newRepo;

    }

    /**
     * @param array $httpVars
     * @param bool $update
     * @param $node Node
     * @return mixed An array containing the hash (0) and the generated url (1)
     * @throws \Exception
     */
    public function createSharedMinisite($httpVars, $node, &$update)
    {
        // PREPARE HIDDEN USER DATA
        if(isSet($httpVars["hash"])){
            $shareObject = $this->getShareStore()->loadLink($httpVars["hash"]);
        }else{
            $shareObject = $this->getShareStore()->createEmptyLink();
        }
        $shareObject->parseHttpVars($httpVars, $node);
        $hiddenUserEntry = $this->getRightsManager()->prepareSharedUserEntry(
            $httpVars,
            $shareObject,
            isSet($httpVars["hash"]),
            (isSet($httpVars["guest_user_pass"])?$httpVars["guest_user_pass"]:null)
        );
        $userSelection = UserSelection::fromContext($this->currentContext, $httpVars);

        $this->filterHttpVarsForLeafPath($httpVars, $userSelection);

        $users = array(); $groups = array();
        $users[$hiddenUserEntry["ID"]] = $hiddenUserEntry;

        $newRepo = $this->createSharedRepository($httpVars, $repoUpdate, $users, $groups);

        $shareObject->setParentRepositoryId($this->repository->getId());
        $shareObject->attachToRepository($newRepo->getId());
        // STORE DATA & HASH IN SHARE STORE
        $hash = $shareObject->save();
        $url = $this->getPublicAccessManager()->buildPublicLink($hash);
        Controller::applyHook("url.shorten", array($this->currentContext, &$shareObject, $this->getPublicAccessManager()));

        // LOG AND PUBLISH EVENT
        $update = isSet($httpVars["repository_id"]);
        $data = $shareObject->getData();
        
        $this->logInfo(($update?"Update":"New")." Share", array(
            "file" => "'".$userSelection->getUniqueFile()."'",
            "files" => $userSelection->getFiles(),
            "url" => $url,
            "expiration" => $data["EXPIRATE_TIME"],
            "limit" => $data['DOWNLOAD_LIMIT'],
            "repo_uuid" => $this->repository->getId()
        ));

        return array($hash, $url);
    }

    /**
     * @param array $httpVars
     * @param bool $update
     * @param array $users
     * @param array $groups
     * @param Node $originalNode
     * @return [RepositoryInterface, array]
     * @throws \Exception
     */
    public function createSharedRepository($httpVars, &$update, $users=array(), $groups=array())
    {
        // ERRORS
        // 100 : missing args
        // 101 : repository label already exists
        // 102 : user already exists
        // 103 : current user is not allowed to share
        // SUCCESS
        // 200
        $loggedUser = $this->currentContext->getUser();
        $currentRepo = $this->currentContext->getRepository();
        $actRights = $loggedUser->getMergedRole()->listActionsStatesFor($currentRepo);
        if (isSet($actRights["share"]) && $actRights["share"] === false) {
            $mess = LocaleService::getMessages();
            throw new \Exception($mess["351"]);
        }

        $newRepo = $this->createOrLoadSharedRepository($httpVars, $update);

        $selection = UserSelection::fromContext($this->currentContext, $httpVars);
        $selection->buildNodes();
        $nodeUuid = InputFilter::decodeSecureMagic($httpVars["node_uuid"], InputFilter::SANITIZE_NODE_UUID);
        if (empty($nodeUuid)) {
            throw new PydioException("You must provide a node_uuid parameter");
        }
        $selection->getUniqueNode()->mergeMetadata(["uuid" => $nodeUuid]);
        $newRepo = $this->getRightsManager()->assignSharedRepositoryPermissions($currentRepo, $newRepo, $update, $users, $groups, $selection);

        // HANDLE WATCHES ON CHILDREN AND PARENT
        foreach($users as $userName => $userEntry) {
            $this->toggleWatchOnSharedRepository($userName, $nodeUuid, $userEntry["WATCH"]);
        }
        $this->toggleWatchOnSharedRepository($loggedUser->getId(), $nodeUuid, ($httpVars["self_watch_folder"] == "true"));

        $this->logInfo(($update?"Update":"New")." Share", array(
            "file" => "'".$selection->getUniqueFile()."'",
            "files" => $selection->getFiles(),
            "repo_uuid" => $currentRepo->getId(),
            "shared_repo_uuid" => $newRepo->getId()
        ));

        return $newRepo;
    }

    /**
     * @param Node $node
     * @param array $linkData
     * @param array $hiddenUserEntries
     * @param array $shareObjects
     * @param string $type
     * @param string $invitationLabel
     * @return Model\ShareLink
     * @throws \Exception
     */
    protected function shareObjectFromParameters($node, $linkData, &$hiddenUserEntries, &$shareObjects, $type = "public", $invitationLabel = ""){

        if(isSet($linkData["hash"])){
            $link = $this->getShareStore()->loadLink($linkData["hash"]);
        }else{
            if($type == "public"){
                $link = $this->getShareStore()->createEmptyLink();
            }else{
                $link = new TargettedLink($this->getShareStore());
                if(UsersService::usersEnabled()) {
                    $link->setOwnerId($this->currentContext->getUser()->getId());
                }
                $link->prepareInvitation($linkData["HOST"], $linkData["USER"], $invitationLabel);
            }
        }
        $link->parseHttpVars($linkData, $node);
        $hiddenUserEntries[] = $this->getRightsManager()->prepareSharedUserEntry(
            $linkData,
            $link,
            isSet($linkData["hash"]),
            (isSet($linkData["guest_user_pass"])?$linkData["guest_user_pass"]:null)
        );
        $shareObjects[] = $link;

    }

    /**
     * @param Node $node
     * @param array $httpVars
     * @param bool $update
     * @return CompositeShare
     * @throws \Exception
     */
    public function shareNode(ContextInterface $ctx, $node, $httpVars, &$update){

        $hiddenUserEntries = array();
        $originalHttpVars = $httpVars;
        $ocsStore = new OCS\Model\SQLStore();
        $ocsClient = new OCS\Client\OCSClient();
        $userSelection = UserSelection::fromContext($ctx, $httpVars);
        $mess = LocaleService::getMessages();

        /**
         * @var ShareLink[] $shareObjects
         */
        $shareObjects = array();

        // PUBLIC LINK
        if(isSet($httpVars["enable_public_link"])){
            if(!$this->getAuthorization($ctx, $node->isLeaf() ? "file":"folder", "minisite")){
                throw new \Exception($mess["share_center." . ($node->isLeaf() ? "225" : "226")]);
            }
            $this->shareObjectFromParameters($node, $httpVars, $hiddenUserEntries, $shareObjects, "public");
        }else if(isSet($httpVars["disable_public_link"])){
            $this->getShareStore()->deleteShare("minisite", $httpVars["disable_public_link"], true);
        }

        if(isSet($httpVars["ocs_data"])){
            $ocsData = json_decode($httpVars["ocs_data"], true);
            $removeLinks = $ocsData["REMOVE"];
            foreach($removeLinks as $linkHash){
                // Delete Link, delete invitation(s)
                $this->getShareStore()->deleteShare("minisite", $linkHash, true);
                $invitations = $ocsStore->invitationsForLink($linkHash);
                foreach($invitations as $invitation){
                    $ocsStore->deleteInvitation($invitation);
                    $ocsClient->cancelInvitation($invitation);
                }
            }
            $newLinks = $ocsData["LINKS"];
            foreach($newLinks as $linkData){
                $this->shareObjectFromParameters($node, $linkData, $hiddenUserEntries, $shareObjects, "targetted", $userSelection->getUniqueNode()->getLabel());
            }
        }

        $this->filterHttpVarsFromUniqueNode($httpVars, $node);

        $users = array(); $groups = array();
        $this->getRightsManager()->createUsersFromParameters($httpVars, $users, $groups);
        if((count($users) || count($groups)) && !$this->getAuthorization($ctx, $node->isLeaf()?"file":"folder", "workspace")){
            $users = $groups = array();
        }
        foreach($hiddenUserEntries as $entry){
            $users[$entry["ID"]] = $entry;
        }

        if(!count($users) && !count($groups)){
            ob_start();
            unset($originalHttpVars["hash"]);
            $request = Controller::executableRequest($ctx, "unshare", $originalHttpVars);
            $this->switchAction($request, new Response());
            ob_end_clean();
            return null;
        }

        $newRepo = $this->createSharedRepository($httpVars, $update, $users, $groups);

        foreach($shareObjects as $shareObject){

            $shareObject->setParentRepositoryId($ctx->getRepositoryId());
            $shareObject->attachToRepository($newRepo->getId());
            $shareObject->save();
            if($shareObject instanceof \Pydio\OCS\Model\TargettedLink){
                $invitation = $shareObject->getPendingInvitation();
                if(!empty($invitation)){
                    $ocsStore->generateInvitationId($invitation);
                    try{
                        $ocsClient->sendInvitation($invitation);
                    }catch (\Exception $e){
                        $this->getShareStore()->deleteShare("minisite", $shareObject->getHash(), true);
                        $shareUserId = $shareObject->getUniqueUser();
                        unset($users[$shareUserId]);
                        if(!count($users) && !count($groups)){
                            $this->getShareStore()->deleteShare("repository", $newRepo->getId());
                        }
                        throw $e;
                    }
                    $ocsStore->storeInvitation($invitation);
                }
            }else{
                Controller::applyHook("url.shorten", array($this->currentContext, &$shareObject, $this->getPublicAccessManager()));
            }

        }
        if(count($groups) || (count($users) && count($users) > count($hiddenUserEntries) )){
            // Add an internal entry
            $this->getShareStore()->storeShare(
                $ctx->getRepositoryId(),
                [
                    'SHARE_TYPE'=>'repository',
                    'OWNER_ID'=>$ctx->getUser()->getId(),
                    'REPOSITORY'=>$newRepo->getId(),
                    'USERS_COUNT' => count($users) - count($hiddenUserEntries),
                    'GROUPS_COUNT' => count($groups)
                ],
                "repository",
                "repo-".$newRepo->getId()
            );
        }else{
            // Delete 'internal' if it exists
            $this->getShareStore()->deleteShareEntry("repo-" . $newRepo->getId());
        }

        $composite = new CompositeShare($node->getUuid(), $newRepo->getId());
        foreach($shareObjects as $link){
            $composite->addLink($link);
        }
        $composite->setSharedEntries(array_merge(array_values($users), array_values($groups)));
        return $composite;

    }

    /**************************/
    /* LISTING FUNCTIONS
    /**************************/
    /**
     * @param bool|string $currentUser if true, currently logged user. if false all users. If string, user ID.
     * @param string $parentRepositoryId
     * @param null $cursor
     * @param null $shareType
     * @return array
     */
    public function listShares($currentUser, $parentRepositoryId="", &$cursor = null, $shareType = null){
        if($currentUser === false){
            $crtUser = "";
        }else {
            $crtUser = $currentUser;
        }
        return $this->getShareStore()->listShares($crtUser, $parentRepositoryId, $cursor, $shareType);
    }

    /**
     * @param ContextInterface $ctx
     * @param bool $currentUser
     * @param string $parentRepositoryId
     * @param null $shareType
     * @param null $cursor
     * @return array
     */
    public function listSharesJson(ContextInterface $ctx, $currentUser = true, $parentRepositoryId = '', $shareType = null, &$cursor = null){
        $shares =  $this->listShares($currentUser, $parentRepositoryId, $cursor, $shareType);
        return $shares;
    }

    /**
     * @param ContextInterface $ctx
     * @param $hash
     * @param $shareData
     * @param string $parentRepositoryId
     * @param int $clearBroken
     * @return mixed
     */
    private function buildMetadataForShare(ContextInterface $ctx, $hash, $shareData, $parentRepositoryId = '', &$clearBroken = -1){

        $shareType = $shareData["SHARE_TYPE"];
        $meta["share_type"] = $shareType;
        $meta["pydio_is_shared"] = "true";

        $repoId = $shareData["REPOSITORY"];
        $repoObject = RepositoryService::getRepositoryById($repoId);
        if($repoObject === null){
            return null;
        }
        $meta["text"] = $repoObject->getDisplay();
        $meta["pydio_share"] = $repoId;
        if(count($repoObject->getRootNodes()) === 0) {
            return null;
        }
        $meta["uuid"] = $repoObject->getRootNodes()[0]->getUuid();

        $permissions = $this->getRightsManager()->computeSharedRepositoryAccessRights($repoId, true);
        $regularUsers = count(array_filter($permissions, function($a){
                return (!isSet($a["HIDDEN"]) || $a["HIDDEN"] == false);
            })) > 0;
        $hiddenUsers = count(array_filter($permissions, function($a){
                return (isSet($a["HIDDEN"]) && $a["HIDDEN"] == true);
            })) > 0;
        if($regularUsers && $hiddenUsers){
            $meta["share_type_readable"] = "Public Link & Internal Users";
        }elseif($regularUsers){
            $meta["share_type_readable"] = "Internal Users";
        }else if($hiddenUsers){
            $meta["share_type_readable"] = "Public Link";
        }else{
            $meta["share_type_readable"] =  ($shareType == "repository"? "Internal Users": "Public Link" );
            if(isSet($shareData["LEGACY_REPO_OR_MINI"])){
                $meta["share_type_readable"] = "Internal Only";
            }
        }
        $meta["share_data"] = ($shareType == "repository" ? 'Shared as workspace: '.$repoObject->getDisplay() : $this->getPublicAccessManager()->buildPublicLink($hash));
        $meta["shared_element_hash"] = $hash;
        $meta["owner"] = "shared";

        if(!empty($parentRepositoryId)) {
            $meta["shared_element_parent_repository"] = $parentRepositoryId;
            $parent = RepositoryService::getRepositoryById($parentRepositoryId);
            $meta["shared_element_parent_repository_label"] = $parent->getDisplay();
        }

        $meta["ajxp_shared_minisite"] = "public";
        $meta["icon"] = "folder.png";
        $meta["fonticon"] = "folder";

        return $meta;

    }

    /**
     * @param ContextInterface $ctx
     * @param $rootPath
     * @param bool|string $currentUser if true, currently logged user. if false all users. If string, user ID.
     * @param string $parentRepositoryId
     * @param null $cursor
     * @param int $clearBroken
     * @param null $shareType
     * @return Node[]
     */
    public function listSharesAsNodes(ContextInterface $ctx, $rootPath, $currentUser, $parentRepositoryId = "", &$cursor = null, &$clearBroken = -1, $shareType = null){

        $shares =  $this->listShares($currentUser, $parentRepositoryId, $cursor, $shareType);
        $nodes = array();

        foreach($shares as $hash => $shareData){

            $icon = "folder";

            if(!is_object($shareData["REPOSITORY"])){

                $meta = $this->buildMetadataForShare($ctx, $hash, $shareData, $parentRepositoryId, $clearBroken);
                if($meta === null) {
                    continue;
                }
                $meta["icon"] = $meta["openicon"] = $icon;
                $meta["ajxp_mime"] = "repository_editable";

            }else if($shareData["REPOSITORY"] instanceof Repository && !empty($shareData["FILE_PATH"])){

                $meta = array(
                    "icon"			=> $icon,
                    "openicon"		=> $icon,
                    "ajxp_mime" 	=> "repository_editable"
                );

                $shareType = $shareData["SHARE_TYPE"];
                $meta["share_type"] = $shareType;
                $meta["owner"] = $shareData["OWNER_ID"];
                $meta["share_type_readable"] = "Publiclet (legacy)";
                $meta["text"] = basename($shareData["FILE_PATH"]);
                $meta["icon"] = "mime_empty.png";
                $meta["fonticon"] = "file";
                $meta["share_data"] = $meta["copy_url"] = $this->getPublicAccessManager()->buildPublicLink($hash);
                $meta["share_link"] = true;
                $meta["shared_element_hash"] = $hash;
                $meta["ajxp_shared_publiclet"] = $hash;

            }else{

                continue;

            }
            $nodes[] = new Node($rootPath."/".$hash, $meta);

        }

        return $nodes;


    }

    /**
     * @param CompositeShare $compositeShare
     * @return array
     */
    public function compositeShareToJson(ContextInterface $ctx, $compositeShare){

        $repoId = $compositeShare->getRepositoryId();
        $repo = $compositeShare->getRepository();
        $messages = LocaleService::getMessages();

        $notExistsData = array(
            "error"         => true,
            "repositoryId"  => $repoId,
            "users_number"  => 0,
            "label"         => "Error - Cannot find shared data",
            "description"   => "Cannot find repository",
            "entries"       => array(),
            "element_watch" => false,
            "repository_url"=> ""
        );

        if($repoId == null || $repo == null){
            return $notExistsData;
        }

        $jsonData = $compositeShare->toJson($ctx, $this->getRightsManager(), $this->getPublicAccessManager(), $messages);
        if($jsonData === false){
            return $notExistsData;
        }
        return $jsonData;

    }


}

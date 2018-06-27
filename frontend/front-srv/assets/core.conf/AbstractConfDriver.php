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
namespace Pydio\Conf\Core;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\UploadedFileInterface;
use Pydio\Access\Core\IPydioWrapperProvider;
use Pydio\Access\Core\Model\Node;
use Pydio\Core\Exception\PydioException;
use Pydio\Core\Exception\UserNotFoundException;
use Pydio\Core\Http\Client\MicroApi;
use Pydio\Core\Http\Message\RegistryMessage;
use Pydio\Core\Http\Message\ReloadMessage;
use Pydio\Core\Http\Message\UserMessage;
use Pydio\Core\Http\Message\XMLDocMessage;
use Pydio\Core\Http\Message\XMLMessage;
use Pydio\Core\Http\Response\AsyncResponseStream;
use Pydio\Core\Http\Response\SerializableResponseStream;

use Pydio\Core\Model\AddressBookItem;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Model\FilteredUsersList;
use Pydio\Core\Model\IdmAdressBookItem;
use Pydio\Core\Model\RepositoryInterface;
use Pydio\Core\Model\UserInterface;
use Pydio\Core\Serializer\UserXML;
use Pydio\Core\Services\AuthService;
use Pydio\Core\Controller\Controller;
use Pydio\Core\Services\BinaryService;
use Pydio\Core\Services\LocaleService;
use Pydio\Core\Services\PoliciesFactory;
use Pydio\Core\Services\RepositoryService;
use Pydio\Core\Services\RolesService;
use Pydio\Core\Services\SessionService;
use Pydio\Core\Services\UsersService;
use Pydio\Core\Services\ApplicationState;
use Pydio\Core\Utils\Crypto;
use Pydio\Core\Utils\Vars\InputFilter;
use Pydio\Core\Utils\Vars\OptionsHelper;
use Pydio\Core\Utils\Vars\StatHelper;

use Pydio\Core\Utils\Vars\XMLFilter;
use Pydio\Core\PluginFramework\Plugin;
use Pydio\Core\PluginFramework\PluginsService;
use Pydio\Core\Services\ConfService;
use Pydio\Core\Utils\Vars\StringHelper;
use Swagger\Client\Model\IdmWorkspaceScope;
use Swagger\Client\Model\MailerMail;
use Swagger\Client\Model\MailerUser;
use Swagger\Client\Model\ServiceResourcePolicy;
use Swagger\Client\Model\ServiceResourcePolicyAction;
use Swagger\Client\Model\ServiceResourcePolicyPolicyEffect;
use Zend\Diactoros\Response\JsonResponse;

defined('PYDIO_EXEC') or die( 'Access not allowed');

/**
 * @package AjaXplorer_Plugins
 * @subpackage Core
 * @class AbstractConfDriver
 * Abstract representation of a conf driver. Must be implemented by the "conf" plugin
 */
abstract class AbstractConfDriver extends Plugin
{
    public $options;
    public $driverType = "conf";

    /**
     * @param ContextInterface $ctx
     * @param array $options
     */
    public function init(ContextInterface $ctx, $options = [])
    {
        parent::init($ctx, $options);
        $options = $this->options;

    }

    /**
     * @inheritdoc
     */
    protected function parseSpecificContributions(ContextInterface $ctx, \DOMNode &$contribNode)
    {
        parent::parseSpecificContributions($ctx, $contribNode);

        if($contribNode->nodeName != "actions") return;

        $exposed = UsersService::getUsersExposedParameters();
        if (!count($exposed)) {
            $actionXpath=new \DOMXPath($contribNode->ownerDocument);
            $publicUrlNodeList = $actionXpath->query('action[@name="custom_data_edit"]', $contribNode);
            $publicUrlNode = $publicUrlNodeList->item(0);
            $contribNode->removeChild($publicUrlNode);
        }

        // CREATE A NEW USER
        if (!ConfService::getContextConf($ctx, "USER_CREATE_USERS", "auth")) {
            $actionXpath=new \DOMXPath($contribNode->ownerDocument);
            $publicUrlNodeList = $actionXpath->query('action[@name="user_create_user"]', $contribNode);
            if ($publicUrlNodeList->length) {
                $publicUrlNode = $publicUrlNodeList->item(0);
                $contribNode->removeChild($publicUrlNode);
            }
            $actionXpath=new \DOMXPath($contribNode->ownerDocument);
            $publicUrlNodeList = $actionXpath->query('action[@name="user_update_user"]', $contribNode);
            if ($publicUrlNodeList->length) {
                $publicUrlNode = $publicUrlNodeList->item(0);
                $contribNode->removeChild($publicUrlNode);
            }
            $actionXpath=new \DOMXPath($contribNode->ownerDocument);
            $publicUrlNodeList = $actionXpath->query('action[@name="user_delete_user"]', $contribNode);
            if ($publicUrlNodeList->length) {
                $publicUrlNode = $publicUrlNodeList->item(0);
                $contribNode->removeChild($publicUrlNode);
            }
        }

    }

    // NEW FUNCTIONS FOR  LOADING/SAVING PLUGINS CONFIGS
    /**
     * Returns an array of options=>values merged from various sources (.inc.php, implementation source)
     * @return array
     * @param String $pluginType
     * @param String $pluginName
     */
    public function loadPluginConfig($pluginType, $pluginName)
    {
        $options = [];
        if (is_file(PYDIO_CONF_PATH."/conf.$pluginType.inc")) {
            include PYDIO_CONF_PATH."/conf.$pluginType.inc";
            if (!empty($DRIVER_CONF)) {
                foreach ($DRIVER_CONF as $key=>$value) {
                    $options[$key] = $value;
                }
                unset($DRIVER_CONF);
            }
        }
        if (is_file(PYDIO_CONF_PATH."/conf.$pluginType.$pluginName.inc")) {
            include PYDIO_CONF_PATH."/conf.$pluginType.$pluginName.inc";
            if (!empty($DRIVER_CONF)) {
                foreach ($DRIVER_CONF as $key=>$value) {
                    $options[$key] = $value;
                }
                unset($DRIVER_CONF);
            }
        }
        if ($this->pluginUsesBootConf($pluginType.".".$pluginName)) {
            ConfService::getBootConfStorageImpl()->_loadPluginConfig($pluginType.".".$pluginName, $options);
        } else {
            $this->_loadPluginConfig($pluginType.".".$pluginName, $options);
        }
        return $options;
    }

    /**
     * @param string $pluginId
     * @param array $options
     * @return mixed
     */
    abstract public function _loadPluginConfig($pluginId, &$options);

    /**
     * Intercept CONF and AUTH configs to use the BootConf Storage
        * @param String $pluginId
        * @param array $options
        */
    public function savePluginConfig($pluginId, $options)
    {
        if ($this->pluginUsesBootConf($pluginId)) {
            ConfService::getBootConfStorageImpl()->_savePluginConfig($pluginId, $options);
        } else {
            $this->_savePluginConfig($pluginId, $options);
        }
    }

    /**
     * @param String $pluginId
     * @return bool
     */
    protected function pluginUsesBootConf($pluginId)
    {
        return ($pluginId == "core.conf" || strpos($pluginId, "conf.") === 0
          || $pluginId == "core.auth" || strpos($pluginId, "auth.") === 0
          || $pluginId == "core.cache" || strpos($pluginId, "cache.") === 0);
    }

    /**
     * @param String $pluginId
     * @param String $options
     */
    abstract public function _savePluginConfig($pluginId, $options);


    /**
     * Instantiate a new UserInterface
     *
     * @param String $userId
     * @return UserInterface
     */
    public function createUserObject($userId)
    {
        $userId = UsersService::filterUserSensitivity($userId);
        $abstractUser = new PydioUser($userId);
        if (!$abstractUser->storageExists()) {
            RolesService::updateDefaultRights($abstractUser);
        }
        RolesService::updateAutoApplyRole($abstractUser);
        RolesService::updateAuthProvidedData($abstractUser);
        $args = [&$abstractUser];
        Controller::applyIncludeHook("include.user.updateUserObject", $args);
        return $abstractUser;
    }

    /**
     * @inheritdoc
     */
    public function getOption($optionName)
    {
        return (isSet($this->options[$optionName])?$this->options[$optionName]:"");
    }

    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     * @throws PydioException
     * @throws \Exception
     * @throws \Pydio\Core\Exception\UserNotFoundException
     */
    public function switchAction(ServerRequestInterface $requestInterface, ResponseInterface &$responseInterface)
    {
        /** @var ContextInterface $ctx */
        $ctx            = $requestInterface->getAttribute("ctx");
        $httpVars       = $requestInterface->getParsedBody();
        $action         = $requestInterface->getAttribute("action");
        $loggedUser     = $ctx->getUser();
        $mess           = LocaleService::getMessages();
        $temporaryUploadFolder = ApplicationState::getTemporaryBinariesFolder();

        switch ($action) {
            //------------------------------------
            //	SWITCH THE ROOT REPOSITORY
            //------------------------------------
            case "switch_repository":


                if (!isSet($httpVars['repository_id'])) {
                    break;
                }
                $repositoryId = InputFilter::sanitize($httpVars['repository_id'], InputFilter::SANITIZE_ALPHANUM);
                if(!$ctx->hasUser()) {
                    break;
                }
                $accessList = RepositoryService::contextUserRepositories($ctx->getUser());
                // May trigger a WorkspaceForbiddenException
                $accessList->workspaceById($repositoryId);
                SessionService::switchSessionRepositoryId($repositoryId);
                $newContext = $ctx->withRepositoryId($repositoryId);
                PluginsService::getInstance($newContext);
                register_shutdown_function(function () use($loggedUser, $repositoryId) {
                    if (UsersService::usersEnabled() && $loggedUser !== null) {
                        $loggedUser->setArrayPref("repository_last_connected", $repositoryId, time());
                        $loggedUser->save(false, false);
                    }
                });
                $this->logInfo("Switch Repository", ["rep. id"=>$repositoryId]);
                $requestInterface = $requestInterface->withAttribute("action", "state");
                $requestInterface = $requestInterface->withAttribute("ctx", $newContext);
                $this->switchAction($requestInterface, $responseInterface);

            break;

            //------------------------------------
            //	SEND XML REGISTRY
            //------------------------------------
            case "get_xml_registry" :
            case "state" :
            case "user_state" :

                if($action === "user_state"){
                    // Build xPath manually
                    $uri = $requestInterface->getServerParams()["REQUEST_URI"];
                    if(strpos($uri, "/user/workspaces") !== false) $xPath = "user/repositories";
                    else if(strpos($uri, "/user/preferences") !== false) $xPath = "user/preferences";
                    else $xPath = "user";
                    $httpVars["xPath"] = $xPath;
                }
                
                $clone = PluginsService::getInstance($ctx)->getFilteredXMLRegistry(true, true);
                $xPath = null;
                if (isSet($httpVars["xPath"])) {
                    $xPath = ltrim(InputFilter::securePath($httpVars["xPath"]), "/");
                }
                $json = (isSet($httpVars["format"]) && $httpVars["format"] == "json");
                $message = new RegistryMessage($clone, $xPath);
                if(empty($xPath) && !$json){
                    $string = $message->toXML();
                    $etag = md5($string);
                    $match = isSet($requestInterface->getServerParams()["HTTP_IF_NONE_MATCH"])?$requestInterface->getServerParams()["HTTP_IF_NONE_MATCH"]:'';
                    if($match == $etag){
                        header('HTTP/1.1 304 Not Modified');
                        $responseInterface = $responseInterface->withStatus(304);
                        break;
                    }else{
                        $responseInterface = $responseInterface
                            ->withHeader("Cache-Control", "public, max-age=31536000")
                            ->withHeader("ETag", $etag);
                    }
                }
                ApplicationState::safeIniSet("zlib.output_compression", "4096");
                $x = new SerializableResponseStream();
                $responseInterface = $responseInterface->withBody($x);
                $x->addChunk($message);

            break;

            //------------------------------------
            //	SAVE USER PREFERENCE
            //------------------------------------
            case "save_user_pref":

                $i = 0;
                while (isSet($httpVars["pref_name_".$i]) && isSet($httpVars["pref_value_".$i])) {
                    $prefName = InputFilter::sanitize($httpVars["pref_name_" . $i], InputFilter::SANITIZE_ALPHANUM);
                    $prefValue = InputFilter::sanitize(InputFilter::magicDequote($httpVars["pref_value_" . $i]));
                    if($prefName == "password") continue;
                    if ($prefName != "pending_folder" && $loggedUser == null) {
                        $i++;
                        continue;
                    }
                    $loggedUser->setPref($prefName, $prefValue);
                    $loggedUser->save();
                    $i++;
                }

                $responseInterface = $responseInterface->withHeader("Content-type", "text/plain");
                $responseInterface->getBody()->write("SUCCESS");

            break;

            //------------------------------------
            // TEAMS MANAGEMENT
            //------------------------------------
            case "user_team_create":

                $crtUser = $ctx->getUser()->getId();
                $teamLabel = InputFilter::sanitize($httpVars["team_label"], InputFilter::SANITIZE_HTML_STRICT);
                if(empty($teamLabel)){
                    throw new PydioException("Empty Team Label!");
                }
                $teamId = StringHelper::slugify($teamLabel) ."-".intval(rand(0,1000));
                $roleObject = RolesService::getOrCreateTeamRole($ctx, $teamId);
                $roleObject->setLabel($teamLabel);
                RolesService::updateRole($roleObject, false);

                $userIds = isSet($httpVars["user_ids"]) ? $httpVars["user_ids"] : [];
                foreach ($userIds as $userId) {
                    $id = InputFilter::sanitize($userId, InputFilter::SANITIZE_EMAILCHARS);
                    $uObject = UsersService::getUserById($id);
                    $uObject->addRole($roleObject);
                    $uObject->saveRoles();
                }
                $responseInterface = new JsonResponse(["message" => "Created Team with id " . $teamId, "insertId" => $teamId]);

                break;

            case "user_team_delete":

                $tId = InputFilter::sanitize($httpVars["team_id"], InputFilter::SANITIZE_ALPHANUM);
                $crtUser = $ctx->getUser()->getId();
                // Role ownership is already checked inside deleteRole() function.
                RolesService::deleteRole($tId);
                break;

            case "user_team_update_label":

                $tId = InputFilter::sanitize($httpVars["team_id"], InputFilter::SANITIZE_ALPHANUM);
                $roleObject = RolesService::getUserTeamRoles($tId);
                if($roleObject === null){
                    throw new PydioException("Cannot find team!");
                }
                $teamLabel = InputFilter::sanitize($httpVars["team_label"], InputFilter::SANITIZE_HTML_STRICT);
                if(empty($teamLabel)){
                    throw new PydioException("Empty Team Label!");
                }
                $roleObject->setLabel($teamLabel);
                RolesService::updateRole($roleObject, false);
                $responseInterface = new JsonResponse(["message" => "Team $tId was updated"]);
                break;

            case "user_team_add_user":

                $id = InputFilter::sanitize($httpVars["user_id"], InputFilter::SANITIZE_EMAILCHARS);
                $tId = InputFilter::sanitize($httpVars["team_id"], InputFilter::SANITIZE_ALPHANUM);
                $uObject = UsersService::getUserById($id);
                $roleObject = RolesService::getUserTeamRoles($tId);
                if($roleObject === null){
                    throw new PydioException("Cannot find team!");
                }
                $uObject->addRole($roleObject);
                $uObject->saveRoles();
                $responseInterface = new JsonResponse(["message" => "User $id added to team " . $tId]);
                break;

            case "user_team_delete_user":

                $id = InputFilter::sanitize($httpVars["user_id"], InputFilter::SANITIZE_EMAILCHARS);
                $tId = InputFilter::sanitize($httpVars["team_id"], InputFilter::SANITIZE_ALPHANUM);
                $roleObject = RolesService::getUserTeamRoles($tId);
                if($roleObject === null){
                    throw new PydioException("Cannot find team!");
                }
                $uObject = UsersService::getUserById($id);
                $uObject->removeRole($tId);
                $uObject->saveRoles();
                $responseInterface = new JsonResponse(["message" => "User $id deleted from team " . $tId]);
                break;

            //------------------------------------
            //	USERS MANAGEMENT
            //------------------------------------
            case "custom_data_edit":
            case "user_create_user":

                $data = [];

                if ($action == "user_create_user" && isSet($httpVars["NEW_new_user_id"])) {
                    $updating = false;
                    OptionsHelper::parseStandardFormParameters($ctx, $httpVars, $data, "NEW_");
                    $originalId = InputFilter::decodeSecureMagic($data["new_user_id"]);
                    $newUserId = InputFilter::decodeSecureMagic($data["new_user_id"], InputFilter::SANITIZE_EMAILCHARS);
                    if($originalId != $newUserId){
                        throw new PydioException(str_replace("%s", $newUserId, $mess["settings.127"]));
                    }
                    $prefix = '';
                    $sharePlugin = PluginsService::getInstance($ctx)->getPluginById("action.share");
                    if($sharePlugin !== null){
                        $prefix = $sharePlugin->getContextualOption($ctx, "SHARED_USERS_TMP_PREFIX");
                    }
                    if(!empty($prefix) && strpos($newUserId, $prefix) !== 0){
                        $newUserId = $prefix . $newUserId;
                    }
                    if (UsersService::userExists($newUserId, "w")) {
                        throw new PydioException($mess["settings.43"]);
                    }
                    $limit = $loggedUser->getMergedRole()->filterParameterValue("core.conf", "USER_SHARED_USERS_LIMIT", PYDIO_REPO_SCOPE_ALL, "");
                    if (!empty($limit) && intval($limit) > 0) {
                        $count = count(UsersService::getChildrenUsers($loggedUser->getUuid()));
                        if ($count >= $limit) {
                            throw new \Exception($mess['483']);
                        }
                    }
                    $policies = PoliciesFactory::policiesForSharedUser($loggedUser, $newUserId);
                    $userObject = UsersService::createUser($newUserId, $data["new_password"], false, false, $loggedUser->getGroupPath(), "shared", [], $policies);

                } else if($action == "user_create_user" && isSet($httpVars["NEW_existing_user_id"])){

                    $updating = true;
                    OptionsHelper::parseStandardFormParameters($ctx, $httpVars, $data, "NEW_");
                    $userId = InputFilter::sanitize($data["existing_user_id"], InputFilter::SANITIZE_EMAILCHARS);
                    $userObject = UsersService::getUserById($userId);
                    if(!empty($data["new_password"])){
                        UsersService::updatePassword($userId, $data["new_password"]);
                    }

                } else {
                    $updating = false;
                    $userObject = $loggedUser;
                    OptionsHelper::parseStandardFormParameters($ctx, $httpVars, $data, "PREFERENCES_");
                }

                $rChanges = false;
                $uChanges = false;
                $exposed = UsersService::getUsersExposedParameters();
                foreach($exposed as $parameter){
                    $pluginId = $parameter["PLUGIN_ID"];
                    $name     = $parameter["NAME"];
                    $scope    = $parameter["SCOPE"];
                    if (isSet($data[$name]) || $data[$name] === "") {
                        if($data[$name] === "__PYDIO_VALUE_SET__") continue;
                        if ($scope === "user") {
                            $userObject->setPersonalAttribute($name, $data[$name]);
                            $uChanges = true;
                        } else {
                            $pRole = null;
                            $persRole = $userObject->getPersonalRole();
                            if($userObject instanceof UserInterface) $pRole = $userObject->parentRole;
                            if ($data[$name] === ""
                                || $pRole === null || $pRole->filterParameterValue($pluginId, $name, PYDIO_REPO_SCOPE_ALL, "") != $data[$name]
                                || $persRole->filterParameterValue($pluginId, $name, PYDIO_REPO_SCOPE_ALL, "") != $data[$name])
                            {
                                $persRole->setParameterValue($pluginId, $name, $data[$name]);
                                $rChanges = true;
                            }
                        }
                    }
                }
                if ($uChanges) {
                    $userObject->save();
                }
                if ($rChanges) {
                    RolesService::updateRole($userObject->getPersonalRole(), false);
                    $userObject->recomputeMergedRole();
                    if ($action == "custom_data_edit") {
                        AuthService::updateSessionUser($userObject);
                        $crtLang = LocaleService::getLanguage();
                        $newLang = $userObject->getPersonalRole()->filterParameterValue("core.conf", "lang", PYDIO_REPO_SCOPE_ALL, $crtLang);
                        if($newLang !== $crtLang){
                            LocaleService::setLanguage($newLang);
                            $mess = LocaleService::getMessages(true);
                        }
                    }
                    UsersService::updateUser($userObject);
                }

                if ($action == "user_create_user") {

                    if(isSet($newUserId)){

                        Controller::applyHook($updating?"user.after_update":"user.after_create", [$ctx, $userObject]);
                        if (isset($data["send_email"]) && $data["send_email"] == true && !empty($data["email"])) {
                            $inviter = $ctx->getUser()->getPersonalAttribute("displayName");
                            if(empty($inviter)){
                                $inviter = $ctx->getUser()->getId();
                            }
                            $api = MicroApi::GetMailerServiceApi();
                            $mail = (new MailerMail())
                                ->setTo([(new MailerUser())
                                    ->setUuid($userObject->getUuid())
                                    ->setName($userObject->getPersonalAttribute("displayName"))
                                    ->setAddress($data["email"])])
                                ->setTemplateId("Invite")
                                ->setTemplateData([
                                    "Inviter" => $inviter,
                                    "Login"   => $newUserId,
                                    "Password"=> $data["new_password"]
                                ]);
                            $api->send($mail);
                        }

                    }
                    $addressBookItem = new IdmAdressBookItem($userObject->getIdmUser());
                    $responseInterface = new JsonResponse(["result" => "SUCCESS", "user" => $addressBookItem]);

                } else {

                    $x = new SerializableResponseStream();
                    $responseInterface = $responseInterface->withBody($x);
                    $x->addChunk(new UserMessage($mess["241"]));

                }

            break;

            case "user_update_user":

                if(!isSet($httpVars["user_id"])) {
                    throw new \Exception("invalid arguments");
                }
                $userId = InputFilter::sanitize($httpVars["user_id"], InputFilter::SANITIZE_EMAILCHARS);
                $userObject = UsersService::getUserById($userId);
                $paramsString = ConfService::getContextConf($ctx, "NEWUSERS_EDIT_PARAMETERS", "auth");
                $result = [];
                $params = explode(",", $paramsString);
                foreach($params as $p){
                    $result[$p] = $userObject->getPersonalAttribute($p, "");
                }

                $responseInterface = $responseInterface->withHeader("Content-type", "application/json");
                $responseInterface->getBody()->write(json_encode($result));

            break;

            case "user_public_data":

                $userId = InputFilter::sanitize($httpVars["user_id"], InputFilter::SANITIZE_EMAILCHARS);
                $responseInterface = $responseInterface->withHeader("Content-type", "application/json");
                try{
                    $userObject = UsersService::getUserById($userId);
                }catch(UserNotFoundException $e){
                    $responseInterface->getBody()->write(json_encode(["error"=>"not_found"]));
                    break;
                }
                $userLabel = $userObject->getPersonalAttribute("displayName", $userId);
                $userAvatar = $userObject->getPersonalAttribute("avatar", "");
                $email = $userObject->getPersonalAttribute("email", "");

                $addressBookItem = new AddressBookItem('user', $userObject->getUuid(), $userId, $userLabel, false, $userObject->hasSharedProfile(), $userAvatar);
                $addressBookItem->appendData('hasEmail', !empty($email));
                if($userObject->hasSharedProfile()){
                    // This user belongs to current user, we can display more data
                    $addressBookItem->appendData('displayName', $userLabel);
                    if(!empty($email)) $addressBookItem->appendData('email', $email);
                    $lang = $userObject->getMergedRole()->filterParameterValue("core.conf", "lang", PYDIO_REPO_SCOPE_ALL, "");
                    $addressBookItem->appendData('lang', $lang);
                }

                $data = [ 'user'      => $addressBookItem ];
                if(isSet($httpVars['graph']) && $httpVars['graph'] === 'true'){

                    $api = MicroApi::GetGraphServiceApi();
                    $response = $api->relation($userObject->getId());

                    $data['graph'] = ['cells' => [], 'teams' => []];

                    if($response->getSharedCells() != null) {
                        foreach($response->getSharedCells() as $workspace){
                            $data['graph']['cells'][$workspace->getUuid()] = $workspace->getLabel();
                        }
                    }
                    if($response->getBelongsToTeams() != null){
                        foreach($response->getBelongsToTeams() as $role) {
                            $data['graph']['teams'][] = new AddressBookItem('group', $role->getUuid(), FilteredUsersList::TEAM_PREFIX.'/'.$role->getUuid(), $role->getLabel());
                        }
                    }
                }

                $responseInterface->getBody()->write(json_encode($data));

            break;

            case "user_delete_user":

                $userId = InputFilter::sanitize($httpVars["user_id"], InputFilter::SANITIZE_EMAILCHARS);
                $userObject = UsersService::getUserById($userId);
                if ($userObject == null || !$userObject->hasSharedProfile()) {
                    throw new PydioException("You are not allowed to edit this user");
                }
                UsersService::deleteUser($userId);
                $responseInterface = $responseInterface->withHeader("Content-type", "text/plain");
                $responseInterface->getBody()->write("SUCCESS");

                break;

            case "user_list_authorized_users" :

                if(isSet($httpVars["processed"])){
                    break;
                }

                $alphaPages     = isSet($httpVars["alpha_pages"]) && $httpVars["alpha_pages"] === "true" ? true : false;
                $crtValue       = InputFilter::sanitize($httpVars['value'], InputFilter::SANITIZE_DIRNAME);
                $groupPath      = isSet($httpVars["group_path"]) ? InputFilter::sanitize($httpVars['group_path'], InputFilter::SANITIZE_DIRNAME) : '';
                $existingOnly   = isSet($httpVars["existing_only"]) && $httpVars["existing_only"] === "true";
                $excludeCurrent = isSet($httpVars["exclude_current"]) && ($httpVars["exclude_current"] === "false" || $httpVars["exclude_current"] === false) ? false : true;
                $range          = isSet($httpVars["range"]) ? $httpVars["range"] : null;
                if($alphaPages){
                    if($crtValue === '') $crtValue = 'a';
                    $existingOnly = true;
                }

                if(isSet($httpVars["filter_value"])){
                    $filterValue = intval(InputFilter::sanitize($httpVars["filter_value"], InputFilter::SANITIZE_ALPHANUM));
                }else{
                    $usersOnly      = isSet($httpVars["users_only"]) && $httpVars["users_only"] === "true";
                    $filterValue = FilteredUsersList::FILTER_USERS_INTERNAL | FilteredUsersList::FILTER_USERS_EXTERNAL;
                    if(!$usersOnly){
                        $filterValue |= FilteredUsersList::FILTER_GROUPS | FilteredUsersList::FILTER_TEAMS;
                    }
                }

                $list = new FilteredUsersList($ctx, $excludeCurrent, $range);
                $items = $list->load($filterValue, !$existingOnly, $crtValue, $groupPath);
                $list->setResponseHeaders($responseInterface);

                $format = $httpVars["format"];
                if(!isSet($format)) $format = 'json';
                switch($format){
                    case 'xml':
                    case 'json':
                        $x = new SerializableResponseStream($items);
                        $x->forceArray();
                        $responseInterface = $responseInterface->withBody($x);
                        break;
                    case 'html':
                        $responseInterface = $responseInterface->withHeader('Content-type', 'text/html; charset=UTF-8');
                        $responseInterface->getBody()->write('<ul>');
                        foreach($items as $chunk){
                            $responseInterface->getBody()->write($chunk->toXml());
                        }
                        $responseInterface->getBody()->write('</ul>');
                        break;
                    default:
                        break;
                };

                break;

            case "load_repository_info":

                SessionService::close();
                $data = [];
                $repo = $ctx->getRepository();
                if($repo != null){
                    $users = UsersService::countUsersForRepository($ctx, $repo->getId(), true);
                    $data["core.users"] = $users;
                    if(isSet($httpVars["collect"]) && $httpVars["collect"] == "true"){
                        Controller::applyHook("repository.load_info", [$ctx, &$data]);
                    }
                }

                $responseInterface = $responseInterface->withHeader("Content-type", "application/json");
                $responseInterface->getBody()->write(json_encode($data));
                break;

            case "clear_all_caches":
                $user = $ctx->getUser();
                if(empty($user) || !$user->isAdmin()){
                    break;
                }
                ConfService::clearAllCaches();
                $userMessage = new UserMessage($mess["settings." . (PYDIO_SKIP_CACHE ? "132" : "131")]);
                $reloadMessage = new ReloadMessage();
                $responseInterface = $responseInterface->withBody(new SerializableResponseStream([$userMessage, $reloadMessage]));

                break;


            case "get_binary_param" :

                if (isSet($httpVars["tmp_file"])) {
                    $file = $temporaryUploadFolder ."/". InputFilter::securePath($httpVars["tmp_file"]);
                    if (file_exists($file)) {
                        session_write_close();
                        header("Content-Type:image/png");
                        readfile($file);
                    }else{
                        $responseInterface = $responseInterface->withStatus(401, 'Forbidden');
                    }
                } else if (isSet($httpVars["binary_id"])) {
                    if (isSet($httpVars["user_id"])) {
                        $context = ["USER" => InputFilter::sanitize($httpVars["user_id"], InputFilter::SANITIZE_EMAILCHARS)];
                    } else if($loggedUser !== null) {
                        $context = ["USER" => $loggedUser->getId()];
                    } else {
                        $context = [];
                    }
                    session_write_close();
                    BinaryService::loadBinary($context, InputFilter::sanitize($httpVars["binary_id"], InputFilter::SANITIZE_ALPHANUM));
                }
            break;

            case "get_global_binary_param" :

                session_write_close();
                if (isSet($httpVars["tmp_file"])) {
                    $file = $temporaryUploadFolder ."/". InputFilter::securePath($httpVars["tmp_file"]);
                    if (file_exists($file)) {
                        header("Content-Type:image/png");
                        readfile($file);
                    }else{
                        $responseInterface = $responseInterface->withStatus(401, 'Forbidden');
                    }
                } else if (isSet($httpVars["binary_id"])) {
                    BinaryService::loadBinary([], InputFilter::sanitize($httpVars["binary_id"], InputFilter::SANITIZE_ALPHANUM));
                }
            break;

            case "store_binary_temp" :

                $uploadedFiles = $requestInterface->getUploadedFiles();
                if (count($uploadedFiles)) {
                    /**
                     * @var UploadedFileInterface $boxData
                     */
                    $boxData = array_shift($uploadedFiles);
                    $err = InputFilter::parseFileDataErrors($boxData);
                    if ($err != null) {

                    } else {
                        $rand = substr(md5(time()), 0, 6);
                        $tmp = $rand."-". $boxData->getClientFilename();
                        if(!file_exists($temporaryUploadFolder)){
                            mkdir($temporaryUploadFolder);
                        }
                        $boxData->moveTo($temporaryUploadFolder . "/" . $tmp);
                    }
                }
                if (isSet($tmp) && file_exists($temporaryUploadFolder ."/".$tmp)) {
                    print('<script type="text/javascript">');
                    print('parent.formManagerHiddenIFrameSubmission("'.$tmp.'");');
                    print('</script>');
                }

                break;
            default;
            break;
        }

    }

}

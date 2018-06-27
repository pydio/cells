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
 * The latest code can be found at <https://pydio.com/>.
 */
namespace Pydio\Access\Driver\DataProvider\Provisioning;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Pydio\Access\Core\AbstractAccessDriver;
use Pydio\Access\Core\Model\Node;
use Pydio\Access\Core\Model\NodesList;
use Pydio\Access\Core\Model\Repository;
use Pydio\Core\Exception\PydioException;
use Pydio\Core\Http\Client\MicroApi;
use Pydio\Core\Http\Client\SimpleStoreApi;
use Pydio\Core\Http\Message\ReloadMessage;
use Pydio\Core\Http\Message\UserMessage;
use Pydio\Core\Http\Message\XMLDocMessage;
use Pydio\Core\Http\Response\SerializableResponseStream;
use Pydio\Core\Model\Context;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Model\RepositoryInterface;
use Pydio\Core\PluginFramework\PluginsService;
use Pydio\Core\Services\AuthService;
use Pydio\Core\Services\ConfService;
use Pydio\Core\Services\LocaleService;
use Pydio\Core\Services\PoliciesFactory;
use Pydio\Core\Services\RepositoryService;
use Pydio\Core\Services\RolesService;
use Pydio\Core\Services\UsersService;
use Pydio\Core\Utils\Vars\InputFilter;
use Pydio\Core\Utils\Vars\StringHelper;
use Pydio\Core\Utils\Vars\XMLFilter;
use Pydio\Core\Utils\XMLHelper;
use Swagger\Client\ApiException;
use Swagger\Client\Model\IdmWorkspaceScope;
use Swagger\Client\Model\RestDataSource;
use Swagger\Client\Model\RestDataSourceType;
use Swagger\Client\Model\RestEncryptionMode;
use Swagger\Client\Model\TreeListNodesRequest;
use Swagger\Client\Model\TreeNode;
use Swagger\Client\Model\TreeNodeType;
use Zend\Diactoros\Response\JsonResponse;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * Class WorkspacesManager
 * @package Pydio\Access\Driver\DataProvider\Provisioning
 */
class WorkspacesManager extends AbstractManager
{

    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     * @return ResponseInterface
     * @throws PydioException
     * @throws \Exception
     */
    public function repositoriesActions(ServerRequestInterface $requestInterface, ResponseInterface $responseInterface){

        $action     = $requestInterface->getAttribute("action");
        /** @var ContextInterface $ctx */
        $ctx        = $requestInterface->getAttribute("ctx");
        $httpVars   = $requestInterface->getParsedBody();
        $mess       = LocaleService::getMessages();
        $currentAdminBasePath = "/";
        $loggedUser = $ctx->getUser();
        if ($loggedUser!=null && $loggedUser->getGroupPath()!=null) {
            $currentAdminBasePath = $loggedUser->getGroupPath();
        }

        switch ($action){

            // REPOSITORIES
            case "get_drivers_definition":

                $buffer = "<drivers allowed='".($this->currentUserIsGroupAdmin() ? "false" : "true")."'>";
                $buffer .= XMLFilter::resolveKeywords(self::availableDriversToXML("param", "", true));
                $buffer .= "</drivers>";
                $responseInterface = $responseInterface->withBody(new SerializableResponseStream(new XMLDocMessage($buffer)));

                break;

            case "get_templates_definition":

                // TODO Unused Action
                $buffer = "<repository_templates>";
                $count = 0;
                $repositories = RepositoryService::listRepositoriesWithCriteria(array(
                    "isTemplate" => '1'
                ), $count);
                foreach ($repositories as $repo) {
                    if(!$repo->isTemplate()) continue;
                    $repoId = $repo->getUniqueId();
                    $repoLabel = $repo->getDisplay();
                    $repoType = $repo->getAccessType();
                    $buffer .= "<template repository_id=\"$repoId\" repository_label=\"$repoLabel\" repository_type=\"$repoType\">";
                    foreach ($repo->getOptionsDefined() as $optionName) {
                        $buffer .= "<option name=\"$optionName\"/>";
                    }
                    $buffer .= "</template>";
                }
                $buffer .= "</repository_templates>";
                $responseInterface = $responseInterface->withBody(new SerializableResponseStream(new XMLDocMessage($buffer)));

                break;

            case "create_repository" :

                $repDef = $httpVars;
                $isTemplate = isSet($httpVars["sf_checkboxes_active"]);
                unset($repDef["get_action"]);
                unset($repDef["sf_checkboxes_active"]);
                if (isSet($httpVars["json_data"])) {
                    $repDef = json_decode(InputFilter::magicDequote($httpVars["json_data"]), true);
                    $options = $repDef["DRIVER_OPTIONS"];
                } else {
                    $options = array();
                    $this->parseParameters($ctx, $repDef, $options, true);
                }
                if (count($options)) {
                    $repDef["DRIVER_OPTIONS"] = $options;
                    if(isSet($options["PYDIO_SLUG"])){
                        $repDef["PYDIO_SLUG"] = $options["PYDIO_SLUG"];
                        unset($repDef["DRIVER_OPTIONS"]["PYDIO_SLUG"]);
                    }
                    if(isSet($options["ALLOW_SYNC"])){
                        $repDef["ALLOW_SYNC"] = $options["ALLOW_SYNC"];
                        unset($repDef["DRIVER_OPTIONS"]["ALLOW_SYNC"]);
                    }
                }

                if ($this->currentUserIsGroupAdmin()) {
                    throw new \Exception("You are not allowed to create a workspace from a driver. Use a template instead.");
                }
                $pServ = PluginsService::getInstance($ctx);
                $driver = $pServ->getPluginByTypeName("access", $repDef["DRIVER"]);

                $newRep = RepositoryService::createRepositoryFromArray(0, $repDef);

                if ($this->repositoryExists($newRep->getDisplay())) {
                    throw new PydioException($mess["settings.50"]);
                }
                if ($this->currentUserIsGroupAdmin()) {
                    $newRep->setGroupPath($ctx->getUser()->getGroupPath());
                }
                $newRep->setPolicies(PoliciesFactory::defaultAdminResource($ctx->getUser()));
                $newRep->setScope(IdmWorkspaceScope::ADMIN);
                if(isSet($repDef["ALLOW_SYNC"]) && $repDef["ALLOW_SYNC"] === true) {
                    $newRep->setIdmAttributes(["allowSync" => true]);
                }
                $res = RepositoryService::addRepository($newRep);

                if ($res == -1) {
                    throw new PydioException($mess["settings.51"]);
                }

                $defaultRights = $newRep->getDefaultRight();
                if(!empty($defaultRights)){
                    if(empty($currentAdminBasePath) || $currentAdminBasePath === "/"){
                        $groupRole = RolesService::getOrCreateRole(RolesService::RootGroup, "/", true);
                    } else {
                        $groupObject = UsersService::getGroupByPath($currentAdminBasePath);
                        $groupRole = RolesService::getOrCreateRole($groupObject->getUuid(), $currentAdminBasePath, true);
                    }
                    $groupRole->setAcl($newRep->getId(), $defaultRights);
                }
                $loggedUser = $ctx->getUser();
                $loggedUser->getPersonalRole()->setAcl($newRep->getUniqueId(), "read,write");
                $loggedUser->recomputeMergedRole();
                RolesService::updateRole($loggedUser->getPersonalRole(), true);
                AuthService::updateSessionUser($loggedUser);

                $message = new UserMessage($mess["settings.52"]);
                $reload = new ReloadMessage("", $newRep->getUniqueId());
                $responseInterface = $responseInterface->withBody(new SerializableResponseStream([$message, $reload]));

                break;

            case "post_repository":

                $jsonDataCreateWorkspace = json_decode($httpVars["payload"], true);
                if ($jsonDataCreateWorkspace === null) {
                    throw new PydioException("Invalid JSON !!");
                }
                if(!isSet($jsonDataCreateWorkspace["id"])) {
                    $jsonDataCreateWorkspace["id"] = 0;
                }
                if(!isSet($jsonDataCreateWorkspace["parameters"]["CREATE"])) {
                    $jsonDataCreateWorkspace["parameters"]["CREATE"] = true;
                }
                $repo = new Repository($jsonDataCreateWorkspace["id"], $jsonDataCreateWorkspace["display"], $jsonDataCreateWorkspace["accessType"]);
                foreach($jsonDataCreateWorkspace["parameters"] as $name => $value) {
                    $repo->addOption($name, $value);
                }
                if ($this->repositoryExists($repo->getDisplay())) {
                    throw new PydioException($mess["settings.50"]);
                }
                $newRep->setPolicies(PoliciesFactory::defaultAdminResource($ctx->getUser()));
                $repo->setScope(IdmWorkspaceScope::ADMIN);
                $res = RepositoryService::addRepository($repo);
                if ($res == -1) {
                    throw new PydioException($mess["settings.51"]);
                }
                $defaultRights = $repo->getDefaultRight();
                if(!empty($defaultRights)){
                    if(empty($currentAdminBasePath) || $currentAdminBasePath === "/"){
                        $groupRole = RolesService::getOrCreateRole(RolesService::RootGroup, "/", true);
                    } else {
                        $groupObject = UsersService::getGroupByPath($currentAdminBasePath);
                        $groupRole = RolesService::getOrCreateRole($groupObject->getUuid(), $currentAdminBasePath, true);
                    }
                    $groupRole->setAcl($repo->getId(), $defaultRights);
                }
                $loggedUser = $ctx->getUser();
                $loggedUser->getPersonalRole()->setAcl($repo->getUniqueId(), "read,write");
                $loggedUser->recomputeMergedRole();
                RolesService::updateRole($loggedUser->getPersonalRole(), true);
                $message = new UserMessage($mess["settings.52"]);
                $reload = new ReloadMessage("", $repo->getUniqueId());
                $responseInterface = $responseInterface->withBody(new SerializableResponseStream([$message, $reload]));
                break;

            case "patch_repository":
                $jsonDataEditWorkspace = json_decode($httpVars["payload"], true);
                if ($jsonDataEditWorkspace === null) {
                    throw new PydioException("Invalid JSON !!");
                }
                $workspaceId = $httpVars["workspaceId"];
                $repo = RepositoryService::findRepositoryByIdOrAlias($workspaceId);
                if ($repo === null) {
                    throw new PydioException("Workspace not found !!");
                }
                foreach ($jsonDataEditWorkspace as $name => $value) {
                    if($name !== "parameters" && $name !== "features") {
                        $repo->$name = $value;
                    }
                }
                foreach($jsonDataEditWorkspace["parameters"] as $name => $value) {
                    $repo->addOption($name, $value);
                }
                $pluginService = PluginsService::getInstance($ctx);
                $driver = $pluginService->getPluginByTypeName("access", $repo->getAccessType());
                if ($driver != null && $driver->getConfigs() != null) {
                    $arrayPluginToOverWrite = array();
                    $arrayWorkspaceMetasources = $repo->getSafeOption("META_SOURCES");
                    if(isSet($jsonDataEditWorkspace["features"])) {
                        foreach($arrayWorkspaceMetasources as $metaSourcePluginName => $metaSourcePluginArray) {
                            foreach($jsonDataEditWorkspace["features"] as $pluginName => $arrayPluginValue) {
                                if ($metaSourcePluginName === $pluginName) {
                                    $arrayPluginToOverWrite[$pluginName] = $arrayPluginValue;
                                    unset($jsonDataEditWorkspace["features"][$pluginName]);
                                }
                            }
                        }
                        $arrayPluginToAdd = $jsonDataEditWorkspace["features"];
                        foreach($arrayPluginToOverWrite as $pluginName => $arrayPlugin) {
                            if(!empty($arrayPlugin)) {
                                foreach($arrayPlugin as $name => $value) {
                                    $arrayWorkspaceMetasources[$pluginName][$name] = $value;
                                }
                            }
                        }
                        $arrayWorkspaceMetasources = array_merge($arrayWorkspaceMetasources, $arrayPluginToAdd);
                    }
                    $repo->addOption("META_SOURCES", $arrayWorkspaceMetasources);
                }
                RepositoryService::replaceRepository($workspaceId, $repo);
                $message = new UserMessage("Workspace successfully edited !!");
                $reload = new ReloadMessage("", $repo->getUniqueId());
                $responseInterface = $responseInterface->withBody(new SerializableResponseStream([$message, $reload]));
                break;

            case "edit_repository_label" :
            case "edit_repository_data" :

                $repId                  = $httpVars["repository_id"];
                $repo                   = RepositoryService::getRepositoryById($repId);
                $initialDefaultRights   = $repo->getDefaultRight();

                if(!$repo->isWriteable()){

                    if (isSet($httpVars["permission_mask"]) && !empty($httpVars["permission_mask"])){

                        $mask = json_decode($httpVars["permission_mask"], true);
                        if(empty($mask)) $mask = [];
                        $rootGroupRole = RolesService::getRole(RolesService::RootGroup);
                        $rootGroupRole->setNodesAcls($mask);
                        RolesService::updateRole($rootGroupRole, true);

                        $responseInterface = $responseInterface->withBody(new SerializableResponseStream(new UserMessage("The permission mask was updated for this workspace")));
                        break;

                    }else{

                        throw new PydioException("This workspace is not writeable. Please edit directly the conf/bootstrap_repositories.php file.");

                    }
                }

                $res = 0;
                if (isSet($httpVars["newLabel"])) {
                    $newLabel = InputFilter::sanitize(InputFilter::securePath($httpVars["newLabel"]), InputFilter::SANITIZE_HTML);
                    if ($this->repositoryExists($newLabel)) {
                        throw new PydioException($mess["settings.50"]);
                    }
                    $repo->setDisplay($newLabel);
                    $res = RepositoryService::replaceRepository($repId, $repo);
                } else {
                    $options = array();
                    $existing = $repo->getOptionsDefined();
                    $existingValues = array();
                    foreach($existing as $exK) {
                        $existingValues[$exK] = $repo->getSafeOption($exK);
                    }
                    $this->parseParameters($ctx, $httpVars, $options, true, $existingValues);
                    if (count($options)) {
                        foreach ($options as $key=>$value) {
                            if ($key == "PYDIO_SLUG") {
                                $repo->setSlug($value);
                                continue;
                            } else if ($key == "WORKSPACE_LABEL" || $key == "TEMPLATE_LABEL") {
                                $newLabel = InputFilter::sanitize($value, InputFilter::SANITIZE_HTML);
                                if ($repo->getDisplay() != $newLabel) {
                                    if ($this->repositoryExists($newLabel)) {
                                        throw new \Exception($mess["settings.50"]);
                                    } else {
                                        $repo->setDisplay($newLabel);
                                    }
                                }
                            } else if ($key === "ALLOW_SYNC") {
                                $atts = $repo->getIdmAttributes();
                                $atts["allowSync"] = $value;
                                $repo->setIdmAttributes($atts);
                            } else if($key === "META_LAYOUT") {
                                $atts = $repo->getIdmAttributes();
                                if($value == "default" && !empty($atts["plugins"])){
                                    unset($atts["plugins"]);
                                    $repo->setIdmAttributes($atts);
                                } else {
                                    if(!isSet($atts["plugins"])) $atts["plugins"] = [];
                                    $atts["plugins"][$value] = [];
                                    $repo->setIdmAttributes($atts);
                                }
                            }
                            $repo->addOption($key, $value);
                        }
                    }

                    if(empty($currentAdminBasePath) || $currentAdminBasePath === "/"){
                        $rootGroupRole = RolesService::getOrCreateRole(RolesService::RootGroup, "/", true);
                    } else {
                        $groupObject = UsersService::getGroupByPath($currentAdminBasePath);
                        $rootGroupRole = RolesService::getOrCreateRole($groupObject->getUuid(), $currentAdminBasePath, true);
                    }
                    if (isSet($httpVars["permission_mask"]) && !empty($httpVars["permission_mask"])){
                        $mask = json_decode($httpVars["permission_mask"], true);
                        if(empty($mask)) $mask = [];
                        $rootGroupRole->setNodesAcls($mask);
                        RolesService::updateRole($rootGroupRole, true);
                    }
                    $defaultRights = $repo->getDefaultRight();
                    if($defaultRights != $initialDefaultRights){
                        $currentDefaultRights = $rootGroupRole->getAcl($repId);
                        if(!empty($defaultRights) || !empty($currentDefaultRights)){
                            $rootGroupRole->setAcl($repId, empty($defaultRights) ? "" : $defaultRights);
                            RolesService::updateRole($rootGroupRole, true);
                        }
                    }
                    RepositoryService::replaceRepository($repId, $repo);
                }
                if ($res == -1) {
                    throw new PydioException($mess["settings.53"]);
                }

                $chunks = [];
                $chunks[] = new UserMessage($mess["settings.54"]);
                if (isSet($httpVars["newLabel"])) {
                    $chunks[] = new ReloadMessage("", $repId);
                }
                $responseInterface = $responseInterface->withBody(new SerializableResponseStream($chunks));

                break;

            case "edit_repository" :

                if(isSet($httpVars["workspaceId"])){
                    $repId = $httpVars["workspaceId"];
                }else{
                    $repId = $httpVars["repository_id"];
                }
                $format = isSet($httpVars["format"]) && $httpVars["format"] == "json" ? "json" : "xml";

                $repository = RepositoryService::findRepositoryByIdOrAlias($repId);
                if ($repository == null) {
                    throw new \Exception("Cannot find workspace with id $repId");
                }
                if ($ctx->hasUser() && !$ctx->getUser()->canAdministrate($repository)) {
                    throw new \Exception("You are not allowed to edit this workspace!");
                }
                $pServ = PluginsService::getInstance($ctx);
                /** @var AbstractAccessDriver $plug */
                $plug = $pServ->getPluginById("access.".$repository->getAccessType());
                if ($plug == null) {
                    throw new \Exception("Cannot find access driver (".$repository->getAccessType().") for workspace!");
                }
                $slug = $repository->getSlug();
                if ($slug == "" && $repository->isWriteable()) {
                    $repository->setSlug();
                    RepositoryService::replaceRepository($repId, $repository);
                }

                $definitions = $plug->getConfigsDefinitions();
                if($format === "json"){
                    $data = $this->serializeRepositoryToJSON($ctx, $repository, $definitions, $currentAdminBasePath);
                    if(isSet($httpVars["load_fill_values"]) && $httpVars["load_fill_values"] === "true"){
                        $data["PARAMETERS_INFO"] = $this->serializeRepositoryDriverInfos($pServ, $format, $plug, $repository);
                    }
                    $responseInterface = new JsonResponse($data);
                }else{
                    $buffer = "<admin_data>";
                    $buffer .= $this->serializeRepositoryToXML($ctx, $repository, $definitions, $currentAdminBasePath);
                    $buffer .= $this->serializeRepositoryDriverInfos($pServ, $format, $plug, $repository);
                    $buffer .= "</admin_data>";
                    $responseInterface = $responseInterface->withBody(new SerializableResponseStream(new XMLDocMessage($buffer)));
                }

                break;


            case "meta_source_add" :

                $repId      = InputFilter::sanitize(isSet($httpVars["workspaceId"]) ? $httpVars["workspaceId"] : $httpVars["repository_id"]);
                $metaId     = InputFilter::sanitize(isSet($httpVars["metaId"]) ? $httpVars["metaId"] : $httpVars["new_meta_source"]);
                $repo       = RepositoryService::findRepositoryByIdOrAlias($repId);

                if (!is_object($repo)) {
                    throw new PydioException("Invalid workspace id! $repId");
                }
                list($type, $name) = explode(".", $metaId);
                if(PluginsService::findPluginWithoutCtxt($type, $name) === false){
                    throw new PydioException("Cannot find plugin with id $metaId");
                }
                if(isSet($httpVars["request_body"])){
                    $options = $httpVars["request_body"];
                }else if (isSet($httpVars["json_data"])) {
                    $options = json_decode(InputFilter::magicDequote($httpVars["json_data"]), true);
                } else {
                    $options = array();
                    $this->parseParameters($ctx, $httpVars, $options, true);
                }

                $repoOptions = $repo->getContextOption($ctx, "META_SOURCES");
                if (is_array($repoOptions) && isSet($repoOptions[$metaId])) {
                    throw new PydioException($mess["settings.55"]);
                }
                if (!is_array($repoOptions)) {
                    $repoOptions = array();
                }
                $repoOptions[$metaId] = $options;
                uksort($repoOptions, array($this,"metaSourceOrderingFunction"));
                $repo->addOption("META_SOURCES", $repoOptions);
                RepositoryService::replaceRepository($repId, $repo);

                $responseInterface = $responseInterface->withBody(new SerializableResponseStream(new UserMessage($mess["settings.56"])));

                break;

            case "meta_source_delete" :

                $repId        = InputFilter::sanitize(isSet($httpVars["workspaceId"]) ? $httpVars["workspaceId"] : $httpVars["repository_id"]);
                $metaSourceId = InputFilter::sanitize(isSet($httpVars["metaId"]) ? $httpVars["metaId"] : $httpVars["plugId"]);
                $repo         = RepositoryService::findRepositoryByIdOrAlias($repId);
                if (!is_object($repo)) {
                    throw new PydioException("Invalid workspace id! $repId");
                }

                $repoOptions = $repo->getContextOption($ctx, "META_SOURCES");
                if (is_array($repoOptions) && array_key_exists($metaSourceId, $repoOptions)) {
                    unset($repoOptions[$metaSourceId]);
                    uksort($repoOptions, array($this,"metaSourceOrderingFunction"));
                    $repo->addOption("META_SOURCES", $repoOptions);
                    RepositoryService::replaceRepository($repId, $repo);
                }else{
                    throw new PydioException("Cannot find meta source ".$metaSourceId);
                }

                $responseInterface = $responseInterface->withBody(new SerializableResponseStream(new UserMessage($mess["settings.57"])));

                break;

            case "meta_source_edit" :

                $repId        = InputFilter::sanitize(isSet($httpVars["workspaceId"]) ? $httpVars["workspaceId"] : $httpVars["repository_id"]);
                $repo         = RepositoryService::findRepositoryByIdOrAlias($repId);
                if (!is_object($repo)) {
                    throw new PydioException("Invalid workspace id! $repId");
                }
                if (isSet($httpVars["bulk_data"])) {
                    $bulkData = json_decode(InputFilter::magicDequote($httpVars["bulk_data"]), true);
                    $repoOptions = $repo->getContextOption($ctx, "META_SOURCES");
                    if (!is_array($repoOptions)) {
                        $repoOptions = array();
                    }
                    if (isSet($bulkData["delete"]) && count($bulkData["delete"])) {
                        foreach ($bulkData["delete"] as $key) {
                            if (isSet($repoOptions[$key])) unset($repoOptions[$key]);
                        }
                    }
                    if (isSet($bulkData["add"]) && count($bulkData["add"])) {
                        foreach ($bulkData["add"] as $key => $value) {
                            if (isSet($repoOptions[$key])) $this->mergeExistingParameters($value, $repoOptions[$key]);
                            $repoOptions[$key] = $value;
                        }
                    }
                    if (isSet($bulkData["edit"]) && count($bulkData["edit"])) {
                        foreach ($bulkData["edit"] as $key => $value) {
                            if (isSet($repoOptions[$key])) $this->mergeExistingParameters($value, $repoOptions[$key]);
                            $repoOptions[$key] = $value;
                        }
                    }
                } else {
                    $metaSourceId = InputFilter::sanitize(isSet($httpVars["metaId"]) ? $httpVars["metaId"] : $httpVars["plugId"]);
                    $repoOptions = $repo->getContextOption($ctx, "META_SOURCES");
                    if (!is_array($repoOptions)) {
                        $repoOptions = array();
                    }
                    if(isSet($httpVars["request_body"])){
                        $options = $httpVars["request_body"];
                    }else if (isSet($httpVars["json_data"])) {
                        $options = json_decode(InputFilter::magicDequote($httpVars["json_data"]), true);
                    } else {
                        $options = array();
                        $this->parseParameters($ctx, $httpVars, $options, true);
                    }
                    if (isset($repoOptions[$metaSourceId])) {
                        $this->mergeExistingParameters($options, $repoOptions[$metaSourceId]);
                    }
                    $repoOptions[$metaSourceId] = $options;
                }
                uksort($repoOptions, array($this,"metaSourceOrderingFunction"));
                $repo->addOption("META_SOURCES", $repoOptions);
                RepositoryService::replaceRepository($repId, $repo);

                $responseInterface = $responseInterface->withBody(new SerializableResponseStream(new UserMessage($mess["settings.58"])));
                break;

            case "list_all_repositories_json":

                $repositories = RepositoryService::listAllRepositories();
                $repoOut = array();
                foreach ($repositories as $repoObject) {
                    $repoOut[$repoObject->getId()] = $repoObject->getDisplay();
                }
                $mess = LocaleService::getMessages();
                $responseInterface = new JsonResponse(["LEGEND" => $mess["settings.150"], "LIST" => $repoOut]);

                break;

            case "list_versioning_policies":

                $api = MicroApi::GetConfigServiceApi();
                $response = $api->listVersioningPolicies();
                $result = ["LEGEND" => "Policies", "LIST" => []];
                if($response->getPolicies() != null){
                    foreach($response->getPolicies() as $policy){
                        $result["LIST"][$policy->getUuid()] = $policy->getName();
                    }
                }
                $responseInterface = new JsonResponse($result);
                break;

            case "admin_list_tree":

                $api = MicroApi::GetAdminTreeServiceApi();
                $basePath = $httpVars["path"] OR "/";
                $request = new TreeListNodesRequest();
                $node = new TreeNode();
                $node->setPath($basePath);
                $request->setNode($node);
                $request->setFilterType(TreeNodeType::COLLECTION);
                $results = $api->listAdminTree($request);
                $nodes = [];
                if ($results->getChildren() != null) {
                    foreach ($results->getChildren() as $child) {
                        $nodes[] = Node::fromApiNode($ctx, $child, true);
                    }
                }
                $responseInterface = new JsonResponse($nodes);

                break;

            case "virtualnodes_list":

                $api = new SimpleStoreApi();
                $documents = $api->listDocuments("virtualnodes", "");
                $responseInterface = new JsonResponse($documents);

                break;

            case "virtualnodes_put":

                $api = new SimpleStoreApi();
                $docId = $httpVars["docId"];
                $node = json_decode($httpVars["node"], true);
                $api->storeDocument("virtualnodes", $docId, $ctx->getUser()->getId(), $node, $node);
                $responseInterface = new JsonResponse($node);

                break;

            case "virtualnodes_delete":

                $api = new SimpleStoreApi();
                $docId = $httpVars["docId"];
                $api->deleteDocuments("virtualnodes", $docId);

                break;

            case "meta_user_clear_cache":
                $cacheFile = PYDIO_CACHE_DIR . "/plugins/meta.user/metadefinitions.json";
                if(file_exists($cacheFile)){
                    unlink($cacheFile);
                }
                ConfService::clearAllCaches();

            default:
                break;

        }

        return $responseInterface;
    }

    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     * @return ResponseInterface
     * @throws PydioException
     */
    public function delete(ServerRequestInterface $requestInterface, ResponseInterface $responseInterface){

        $mess = LocaleService::getMessages();
        $httpVars = $requestInterface->getParsedBody();

        $repositories = "";
        if(isSet($httpVars["repository_id"])) $repositories = $httpVars["repository_id"];
        else if(isSet($httpVars["workspaceId"])) $repositories = $httpVars["workspaceId"];
        if(!is_array($repositories)){
            $repositories = [$repositories];
        }
        $repositories = array_map(function($r){
            return InputFilter::sanitize($r, InputFilter::SANITIZE_ALPHANUM);
        }, $repositories);

        foreach($repositories as $repId){
            $repo         = RepositoryService::findRepositoryByIdOrAlias($repId);
            if(!is_object($repo)){
                $res = -1;
            }else{
                $res = RepositoryService::deleteRepository($repId);
            }
            if ($res == -1) {
                throw new PydioException($mess[427]);
            }
        }

        $message = new UserMessage($mess["settings.59"]);
        $reload = new ReloadMessage();
        return $responseInterface->withBody(new SerializableResponseStream([$message, $reload]));

    }


    /**
     * @param ServerRequestInterface $requestInterface Full set of query parameters
     * @param string $rootPath Path to prepend to the resulting nodes
     * @param string $relativePath Specific path part for this function
     * @param string $paginationHash Number added to url#2 for pagination purpose.
     * @param string $findNodePosition Path to a given node to try to find it
     * @param string $aliasedDir Aliased path used for alternative url
     * @return NodesList A populated NodesList object, eventually recursive.
     */
    public function listNodes(ServerRequestInterface $requestInterface, $rootPath, $relativePath, $paginationHash = null, $findNodePosition = null, $aliasedDir = null)
    {
        $fullBasePath       = "/" . $rootPath . "/" . $relativePath;
        $REPOS_PER_PAGE     = 10000;
        $paginationHash     = $paginationHash === null ? 1 : $paginationHash;
        $offset             = ($paginationHash - 1) * $REPOS_PER_PAGE;
        $count              = null;
        $ctxUser            = $this->context->getUser();
        $nodesList          = new NodesList($fullBasePath);
        $v2Api              = $requestInterface->getAttribute("api") === "v2";

        // Load all repositories = normal, templates, and templates children
        $criteria = array(
            "ORDERBY"       => array("KEY" => "display", "DIR"=>"ASC"),
            "CURSOR"        => array("OFFSET" => $offset, "LIMIT" => $REPOS_PER_PAGE)
        );
        if($this->currentUserIsGroupAdmin()){
            $criteria = array_merge($criteria, array(
                "scope" => IdmWorkspaceScope::ADMIN,
                "groupPath"     => "regexp:/^".str_replace("/", "\/", $ctxUser->getGroupPath()).'/',
            ));
        }else{
            $criteria["scope"] = IdmWorkspaceScope::ADMIN;
        }
        if(isSet($requestInterface->getParsedBody()["template_children_id"])){
            $criteria["parent_uuid"] = InputFilter::sanitize($requestInterface->getParsedBody()["template_children_id"], InputFilter::SANITIZE_ALPHANUM);
        }

        $repos = RepositoryService::listRepositoriesWithCriteria($criteria, $count);
        $nodesList->initColumnsData("filelist", "list", "settings.repositories");
        $nodesList->setPaginationData($count, $paginationHash, ceil($count / $REPOS_PER_PAGE));
        $nodesList->appendColumn("settings.8", "ajxp_label");
        $nodesList->appendColumn("settings.9", "accessType");
        $nodesList->appendColumn("settings.125", "slug");

        $driverLabels = array();

        foreach ($repos as $repoIndex => $repoObject) {

            if($repoObject->getAccessType() == "settings") continue;
            if (!empty($ctxUser) && !$ctxUser->canAdministrate($repoObject))continue;
            if(is_numeric($repoIndex)) $repoIndex = "".$repoIndex;

            $icon           = "hdd_external_unmount.png";
            $accessType     = $repoObject->getAccessType();
            $accessLabel    = $this->getDriverLabel($accessType, $driverLabels);
            $label          = $repoObject->getDisplay();
            $editable       = $repoObject->isWriteable();
            $rootNodesData = [];
            $rootNodes = $repoObject->getRootNodes();
            foreach($rootNodes as $rootNode){
                $rootNodesData[] = $rootNode->getPath();
            }
            $meta = [
                "text"          => $label,
                "repository_id" => $repoIndex,
                "accessType"	=> $repoObject->getAccessType(),
                "accessLabel"	=> $accessLabel,
                "owner"			=> $repoObject->getScope() !== IdmWorkspaceScope::ADMIN ? "shared" : "",
                "slug"          => $repoObject->getSlug(),
                "description"   => $repoObject->getDescription(),
                "rootNodes"     => json_encode($rootNodesData),
                "parentname"	=> "/repositories",
                "ajxp_mime" 	=> "repository".($editable?"_editable":""),
                "is_datasource"   => "false"
            ];

            $nodeKey = "/data/repositories/$repoIndex";
            $this->appendBookmarkMeta($nodeKey, $meta);
            $repoNode = new Node($v2Api ? (string)$repoIndex : $nodeKey, $meta);
            $nodesList->addBranch($repoNode);

        }

        return $nodesList;
    }

    /**
     * Get label for an access.* plugin
     * @param $pluginId
     * @param $labels
     * @return mixed|string
     */
    protected function getDriverLabel($pluginId, &$labels){
        if(isSet($labels[$pluginId])){
            return $labels[$pluginId];
        }
        $plugin = PluginsService::getInstance(Context::emptyContext())->getPluginById("access.".$pluginId);
        if(!is_object($plugin)) {
            $label = "access.$plugin (plugin disabled!)";
        }else{
            $label = $plugin->getManifestLabel();
        }
        $labels[$pluginId] = $label;
        return $label;
    }

    /**
     * @param $name
     * @return bool
     */
    public function repositoryExists($name)
    {
        RepositoryService::listRepositoriesWithCriteria(array("display" => $name), $count);
        return $count > 0;
    }

    /**
     * Reorder meta sources
     * @param $key1
     * @param $key2
     * @return int
     */
    public function metaSourceOrderingFunction($key1, $key2)
    {
        $a1 = explode(".", $key1);
        $t1 = array_shift($a1);
        $a2 = explode(".", $key2);
        $t2 = array_shift($a2);
        if($t1 == "index") return 1;
        if($t1 == "metastore") return -1;
        if($t2 == "index") return -1;
        if($t2 == "metastore") return 1;
        if($key1 == "meta.git" || $key1 == "meta.svn") return 1;
        if($key2 == "meta.git" || $key2 == "meta.svn") return -1;
        return strcmp($key1, $key2);
    }

    /**
     * @param ContextInterface $ctx
     * @param RepositoryInterface $repository
     * @param array $definitions
     * @param string $currentAdminBasePath
     * @return array
     * @throws ApiException
     */
    protected function serializeRepositoryToJSON(ContextInterface $ctx, $repository, $definitions, $currentAdminBasePath){
        $nested = [];
        $buffer = [
            "id"            => $repository->getId(),
            "securityScope" => $repository->securityScope(),
            "slug"          => $repository->getSlug(),
        ];
        foreach ($repository as $name => $option) {
            if(strstr($name, " ")>-1) continue;
            if (in_array($name, ["driverInstance", "id", "uuid", "path", "recycle", "create", "enabled"])) continue;
            if(is_array($option)) {
                $nested[] = $option;
            } else{
                $buffer[$name] = $option;
            }
        }
        if (count($nested)) {
            $buffer["parameters"]= [];

            foreach ($nested as $option) {
                foreach ($option as $key => $optValue) {
                    if(isSet($definitions[$key]) && $definitions[$key]["type"] == "password" && !empty($optValue)){
                        $optValue = "__PYDIO_VALUE_SET__";
                    }
                    $buffer["parameters"][$key] = $optValue;
                }
            }
            // Add SLUG?
            /*
            if(!empty($buffer["slug"])) {
                $buffer["PARAMETERS"]["PYDIO_SLUG"] = $buffer["slug"];
            }
            */
        }
        if(isSet($buffer["parameters"]) && isSet($buffer["parameters"]["META_SOURCES"])){
            $buffer["features"] = $buffer["parameters"]["META_SOURCES"];
            unset($buffer["parameters"]["META_SOURCES"]);
        }

        $buffer["info"]= [];
        $users = UsersService::countUsersForRepository($ctx, $repository->getId(), false, true);
        $cursor = ["count"];
        $shares = [];
        $buffer["info"] = [
            "users" => $users,
            "shares" => count($shares)
        ];
        return $buffer;
    }

    /**
     * @param ContextInterface $ctx
     * @param RepositoryInterface $repository
     * @param array $definitions
     * @param string $currentAdminBasePath
     * @return string
     * @throws ApiException
     */
    protected function serializeRepositoryToXML(ContextInterface $ctx, $repository, $definitions, $currentAdminBasePath){
        $nested = [];
        $buffer = "<repository index=\"".$repository->getId()."\" securityScope=\"".$repository->securityScope()."\"";
        foreach ($repository as $name => $option) {
            if(strstr($name, " ")>-1) continue;
            if ($name == "driverInstance") continue;
            if (!is_array($option)) {
                if (is_bool($option)) {
                    $option = ($option?"true":"false");
                }
                $buffer .= " $name=\"".StringHelper::xmlEntities($option, true)."\" ";
            } else if (is_array($option)) {
                $nested[] = $option;
            }
        }
        if (count($nested)) {
            $buffer .= ">" ;
            foreach ($nested as $option) {
                foreach ($option as $key => $optValue) {
                    if (is_array($optValue) /*&& count($optValue) */) {
                        $buffer .= "<param name=\"$key\"><![CDATA[".json_encode($optValue)."]]></param>" ;
                    } else if (is_object($optValue)){
                        $buffer .= "<param name=\"$key\"><![CDATA[".json_encode($optValue)."]]></param>";
                    } else {
                        if (is_bool($optValue)) {
                            $optValue = ($optValue?"true":"false");
                        } else if(isSet($definitions[$key]) && $definitions[$key]["type"] == "password" && !empty($optValue)){
                            $optValue = "__PYDIO_VALUE_SET__";
                        }

                        $optValue = StringHelper::xmlEntities($optValue, true);
                        $buffer .= "<param name=\"$key\" value=\"$optValue\"/>";
                    }
                }
            }
            // Add SLUG
            $buffer .= "<param name=\"PYDIO_SLUG\" value=\"".$repository->getSlug()."\"/>";

            // Add Default Rights
            try{
                $rootRole = RolesService::getRole(RolesService::RootGroup);
                if($rootRole !== null) {
                    $r = $rootRole->getAcl($repository->getId());
                    if(!empty($r)){
                        $rights = "";
                        if(strpos($r, "read") !== false) $rights .= "r";
                        if(strpos($r, "write") !== false) $rights .= "w";
                        $buffer .=  "<param name=\"DEFAULT_RIGHTS\" value=\"".$rights."\"/>";
                    }
                }

            } catch (ApiException $e){}
            $repoAttr = $repository->getIdmAttributes();

            // Add Allow Sync
            $allowSync = "false";
            if(isSet($repoAttr["allowSync"]) && $repoAttr["allowSync"] === true) {
                $allowSync = "true";
            }
            $buffer .= "<param name='ALLOW_SYNC' value='$allowSync'/>";

            // Add Meta Layout
            $metaLayout = "<param name='META_LAYOUT' value='default'/>";
            if(isSet($repoAttr["plugins"])){
                foreach($repoAttr["plugins"] as $k => $v){
                    if(strpos($k, "meta.layout") === 0) {
                        $metaLayout = "<param name='META_LAYOUT' value='$k'/>";
                    }
                }
            }
            $buffer .= $metaLayout;
            $buffer .= "</repository>";
        } else {
            $buffer .= "/>";
        }

        $buffer .= "<additional_info>";
        $users = UsersService::countUsersForRepository($ctx, $repository->getId(), false, true);
        $cursor = ["count"];
        $shares = [];
        $buffer .= '<users total="'.$users.'"/>';
        $buffer .= '<shares total="'.count($shares).'"/>';
        $rootGroup = RolesService::getRole(RolesService::RootGroup);
        $buffer .= "</additional_info>";

        return $buffer;
    }

    /**
     * @param PluginsService $pServ
     * @param string $format
     * @param AbstractAccessDriver $plug
     * @param RepositoryInterface $repository
     * @return string|array
     */
    protected function serializeRepositoryDriverInfos(PluginsService $pServ, $format, $plug, $repository){
        $manifest = $plug->getManifestRawContent("server_settings/param");
        $manifest = XMLFilter::resolveKeywords($manifest);
        $clientSettings = $plug->getManifestRawContent("client_settings", "xml");
        $iconClass = "";$descriptionTemplate = "";
        if($clientSettings->length){
            $iconClass = $clientSettings->item(0)->getAttribute("iconClass");
            $descriptionTemplate = $clientSettings->item(0)->getAttribute("description_template");
        }
        $metas = [];
        $metaLayouts = [];
        $metas = $pServ->getPluginsByType("meta");
        foreach($metas as $meta){
            if(strpos($meta->getId(), "meta.layout") === 0){
                $metaLayouts[] = $meta;
            }
        }
        if(count($metaLayouts)){
            $values = ['default|Default'];
            foreach($metaLayouts as $metaLayout){
                $values[] = $metaLayout->getId() . '|' . StringHelper::xmlEntities($metaLayout->getManifestLabel());
            }
            // Create an additional parameter
            $manifest .= '<param name="META_LAYOUT" type="select" choices="'.implode(",",$values).'" mandatory="true" label="Layout" group="Repository Commons" no_templates="true" default="default"/>';
        }


        if($format === "xml"){
            $buffer = "<ajxpdriver name=\"".$repository->getAccessType()."\" label=\"". StringHelper::xmlEntities($plug->getManifestLabel()) ."\"
            iconClass=\"$iconClass\" description_template=\"$descriptionTemplate\"
            description=\"". StringHelper::xmlEntities($plug->getManifestDescription()) ."\">$manifest</ajxpdriver>";
            $buffer .= "<metasources/>";
            return $buffer;
        }else{
            $dData = [
                "name" => $repository->getAccessType(),
                "label" => $plug->getManifestLabel(),
                "description" => $plug->getManifestDescription(),
                "iconClass" => $iconClass,
                "descriptionTemplate" => $descriptionTemplate,
                "parameters" => $this->xmlServerParamsToArray($manifest)
            ];
            $data = ["driver" => $dData];
            return $data;
        }
    }

    /**
     * @param string $xmlParamsString
     * @return array
     */
    protected function xmlServerParamsToArray($xmlParamsString){
        $doc = new \DOMDocument();
        $doc->loadXML("<parameters>$xmlParamsString</parameters>");
        $result = XMLHelper::xmlToArray($doc, ["attributePrefix" => ""]);
        if(isSet($result["parameters"]["param"])){
            return $result["parameters"]["param"];
        }else{
            return [];
        }
    }

    /**
     * Search the manifests declaring ajxpdriver as their root node. Remove ajxp_* drivers
     * @static
     * @param string $filterByTagName
     * @param string $filterByDriverName
     * @param bool $limitToEnabledPlugins
     * @return string
     */
    protected function availableDriversToXML($filterByTagName = "", $filterByDriverName="", $limitToEnabledPlugins = false)
    {
        $nodeList = PluginsService::getInstance(Context::emptyContext())->searchAllManifests("//ajxpdriver", "node", false, $limitToEnabledPlugins);
        $xmlBuffer = "";
        /** @var \DOMElement $node */
        foreach ($nodeList as $node) {
            $dName = $node->getAttribute("name");
            if($filterByDriverName != "" && $dName != $filterByDriverName) continue;
            if($dName === "homepage" || $dName === "settings") continue;
            if ($filterByTagName == "") {
                $xmlBuffer .= $node->ownerDocument->saveXML($node);
                continue;
            }
            $q = new \DOMXPath($node->ownerDocument);
            $cNodes = $q->query("//".$filterByTagName, $node);
            $xmlBuffer .= "<ajxpdriver ";
            foreach($node->attributes as $attr) $xmlBuffer.= " $attr->name=\"$attr->value\" ";
            $xmlBuffer .=">";
            foreach ($cNodes as $child) {
                $xmlBuffer .= $child->ownerDocument->saveXML($child);
            }
            $xmlBuffer .= "</ajxpdriver>";
        }
        return $xmlBuffer;
    }


}

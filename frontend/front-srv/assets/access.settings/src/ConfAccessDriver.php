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
 *
 */
namespace Pydio\Access\Driver\DataProvider\Provisioning;

require_once(dirname(__FILE__)."/../vendor/autoload.php");

use DOMXPath;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Pydio\Access\Core\AbstractAccessDriver;
use Pydio\Core\Http\Client\MicroApi;
use Pydio\Core\Http\Response\SerializableResponseStream;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\PluginFramework\PluginsService;
use Pydio\Core\Services\LocaleService;
use Pydio\Core\Services\RepositoryService;
use Pydio\Core\Services\UsersService;
use Zend\Diactoros\Response\JsonResponse;

defined('PYDIO_EXEC') or die( 'Access not allowed');

/**
 * Plugin to access the configurations data
 * Class ConfAccessDriver
 * @package Pydio\Access\Driver\DataProvider
 */
class ConfAccessDriver extends AbstractAccessDriver
{

    /**
     * Called internally to populate left menu
     * @param ContextInterface $ctx
     * @return array
     * @throws \Exception
     */
    protected function getMainTree(ContextInterface $ctx){

        $api = MicroApi::GetFrontendServiceApi();
        $client = $api->getApiClient();
        list($response, $statusCode, $httpHeader) = $client->callApi(
            "/frontend/settings-menu","GET", [], [], ["Content-Type"=>"application/json"], null, "frontend/settings-menu"
        );
        $response = json_decode(json_encode($response), true); // transform to array instead of StdClass
        $rootNodes = [
            "__metadata__" => $response["__metadata__"]
        ];
        $sections = $response["Sections"];
        foreach($sections as $section){
            $children = $section["CHILDREN"];
            $section["CHILDREN"] = [];
            foreach($children as $child){
                $section["CHILDREN"][$child["Key"]] = $child;
            }
            $rootNodes[$section["Key"]] = $section;
        }
        return $rootNodes;

    }

    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     * @return bool
     */
    public function preprocessLsApi2(ServerRequestInterface &$requestInterface, ResponseInterface &$responseInterface){

        $uri = $requestInterface->getAttribute("api_uri");
        $vars = $requestInterface->getParsedBody();
        if($uri === "/admin/roles") {
            
            $vars["dir"] = "/idm/roles";
            $requestInterface = $requestInterface->withParsedBody($vars);

        }else if(strpos($uri, "/admin/people") === 0){

            $crtPath = "";
            if(isSet($vars["path"]) && !empty($vars["path"]) && $vars["path"] !== "/"){
                $crtPath = $vars["path"];
            }
            $vars["dir"] = "/idm/users".$crtPath;
            $requestInterface = $requestInterface->withParsedBody($vars);

        }
        
        
    }
    
    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     */
    public function listAction(ServerRequestInterface $requestInterface, ResponseInterface &$responseInterface){

        if($requestInterface->getAttribute("action") === "stat"){
            $responseInterface = new JsonResponse(["mode" => true]);
            return;
        }

        if($requestInterface->getAttribute("api") === "v2"){
            
            $uri = $requestInterface->getAttribute("api_uri");
            $vars = $requestInterface->getParsedBody();
            if($uri === "/admin/roles") {

                $vars["dir"] = "/idm/roles";
                $requestInterface = $requestInterface->withParsedBody($vars);
                
            }else if($uri === "/admin/workspaces") {

                $vars["dir"] = "/data/workspaces";
                $requestInterface = $requestInterface->withParsedBody($vars);

            }else if(strpos($uri, "/admin/people") === 0){
                
                $crtPath = "";
                if(isSet($vars["path"]) && !empty($vars["path"]) && $vars["path"] !== "/"){
                    $crtPath = $vars["path"];
                }
                $vars["dir"] = "/idm/users/".ltrim($crtPath, "/");
                $requestInterface = $requestInterface->withParsedBody($vars);
                
            }
        }

        /** @var ContextInterface $ctx */
        $ctx = $requestInterface->getAttribute("ctx");
        $treeManager = new TreeManager($ctx, $this->getName(), $this->getMainTree($ctx));
        $nodesList = $treeManager->dispatchList($requestInterface);
        $responseInterface = $responseInterface->withBody(new SerializableResponseStream($nodesList));

    }

    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     */
    public function pluginsAction(ServerRequestInterface $requestInterface, ResponseInterface &$responseInterface){
        $pluginManager = new PluginsManager($requestInterface->getAttribute("ctx"), $this->getName());
        $responseInterface = $pluginManager->pluginsActions($requestInterface, $responseInterface);
    }

    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     */
    public function rolesAction(ServerRequestInterface $requestInterface, ResponseInterface &$responseInterface){
        $pluginManager = new RolesManager($requestInterface->getAttribute("ctx"), $this->getName());
        $responseInterface = $pluginManager->rolesActions($requestInterface, $responseInterface);
    }

    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     * @throws \Pydio\Core\Exception\PydioException
     * @throws \Exception
     */
    public function usersAction(ServerRequestInterface $requestInterface, ResponseInterface &$responseInterface){
        $pluginManager = new UsersManager($requestInterface->getAttribute("ctx"), $this->getName());
        $action = $requestInterface->getAttribute("action");
        if(strpos($action, "people-") === 0){
            $responseInterface = $pluginManager->peopleApiActions($requestInterface, $responseInterface);
        }else{
            $responseInterface = $pluginManager->usersActions($requestInterface, $responseInterface);
        }
    }

    /**
     * Search users
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     */
    public function searchUsersAction(ServerRequestInterface $requestInterface, ResponseInterface &$responseInterface) {
        $pluginManager = new UsersManager($requestInterface->getAttribute("ctx"), $this->getName());
        $responseInterface = $pluginManager->search($requestInterface, $responseInterface);
    }

    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     */
    public function repositoriesAction(ServerRequestInterface $requestInterface, ResponseInterface &$responseInterface){
        $pluginManager = new WorkspacesManager($requestInterface->getAttribute("ctx"), $this->getName());
        $responseInterface = $pluginManager->repositoriesActions($requestInterface, $responseInterface);
    }

    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     */
    public function logsAction(ServerRequestInterface $requestInterface, ResponseInterface &$responseInterface){
        $pluginManager = new LogsManager($requestInterface->getAttribute("ctx"), $this->getName());
        $responseInterface = $pluginManager->logsAction($requestInterface, $responseInterface);
    }

    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     */
    public function handleTasks(ServerRequestInterface $requestInterface, ResponseInterface &$responseInterface){
        $action = $requestInterface->getAttribute("action");
        if($action === "scheduler_listRepositories"){

            $repositories = RepositoryService::listAllRepositories();
            $repoOut = [
                "*" => "Apply on all repositories"
            ];
            foreach ($repositories as $repoObject) {
                $repoOut[$repoObject->getId()] = $repoObject->getDisplay();
            }
            $mess = LocaleService::getMessages();
            $responseInterface = new JsonResponse(["LEGEND" => $mess["settings.150"], "LIST" => $repoOut]);


        }else{
            $scheduler = PluginsService::getInstance($requestInterface->getAttribute('ctx'))->getPluginById("action.scheduler");
            $scheduler->handleTasks($requestInterface, $responseInterface);
        }
    }



    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     */
    public function editAction(ServerRequestInterface $requestInterface, ResponseInterface &$responseInterface){

        $subAction = $requestInterface->getParsedBody()["sub_action"];
        $requestInterface = $requestInterface->withAttribute("action", $subAction);

        switch($subAction){
            case "edit_plugin_options":
                $this->pluginsAction($requestInterface, $responseInterface);
                break;
            case "edit_role":
            case "post_json_role":
                $this->rolesAction($requestInterface, $responseInterface);
                break;
            case "user_set_lock":
            case "change_admin_right":
            case "user_add_role":
            case "create_user":
            case "user_delete_role":
            case "user_reorder_roles":
            case "users_bulk_update_roles":
            case "save_custom_user_params":
            case "update_user_pwd":
                $this->usersAction($requestInterface, $responseInterface);
                break;
            case "edit_repository":
            case "create_repository":
            case "edit_repository_label":
            case "edit_repository_data":
            case "get_drivers_definition":
            case "get_templates_definition":
            case "meta_source_add":
            case "meta_source_edit":
            case "meta_source_delete":
                $this->repositoriesAction($requestInterface, $responseInterface);
                break;
            default:
                break;
        }
    }

    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     */
    public function deleteAction(ServerRequestInterface $requestInterface, ResponseInterface &$responseInterface){

        $httpVars = $requestInterface->getParsedBody();
        // REST API V1 mapping
        if (isSet($httpVars["data_type"])) {
            switch ($httpVars["data_type"]) {
                case "repository":
                    $httpVars["repository_id"] = basename($httpVars["data_id"]);
                    break;
                case "role":
                    $httpVars["role_id"] = basename($httpVars["data_id"]);
                    break;
                case "user":
                    $httpVars["user_id"] = basename($httpVars["data_id"]);
                    break;
                case "group":
                    $httpVars["group"] = "/idm/users".$httpVars["data_id"];
                    break;
                default:
                    break;
            }
            unset($httpVars["data_type"]);
            unset($httpVars["data_id"]);
            $requestInterface = $requestInterface->withParsedBody($httpVars);

        }

        /** @var ContextInterface $ctx */
        $ctx = $requestInterface->getAttribute("ctx");

        if (isSet($httpVars["repository_id"]) || isSet($httpVars["workspaceId"])) {

            $manager = new WorkspacesManager($ctx, $this->getName());

        } else if (isSet($httpVars["role_id"]) || isSet($httpVars["roleId"])) {

            $manager = new RolesManager($ctx, $this->getName());

        } else {

            $manager = new UsersManager($ctx, $this->getName());
        }

        $responseInterface = $manager->delete($requestInterface, $responseInterface);

    }

    /**
     * Bookmark any page for the admin interface
     * @param ServerRequestInterface $request
     * @param ResponseInterface $response
     */
    public function preProcessBookmarkAction(ServerRequestInterface &$request, ResponseInterface $response)
    {

        $httpVars = $request->getParsedBody();
        /** @var ContextInterface $ctx */
        $ctx = $request->getAttribute("ctx");
        if (isSet($httpVars["bm_action"]) && $httpVars["bm_action"] == "add_bookmark" && UsersService::usersEnabled()) {
            $bmUser = $ctx->getUser();
            $repositoryId = $ctx->getRepositoryId();
            $bookmarks = $bmUser->getBookmarks($repositoryId);
            foreach ($bookmarks as $bm) {
                if ($bm["PATH"] == $httpVars["bm_path"]) {
                    $httpVars["bm_action"] = "delete_bookmark";
                    $request = $request->withParsedBody($httpVars);
                    break;
                }
            }
        }

    }


    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     * @throws \Exception
     */
    public function displayEnterprise(ServerRequestInterface $requestInterface, ResponseInterface &$responseInterface){
        $touchFile = $this->getPluginWorkDir(true).DIRECTORY_SEPARATOR."enterprise-display";
        if(file_exists($touchFile)){
            $lastDisplay = intval(file_get_contents($touchFile));
            if(time() - $lastDisplay > 60 * 60 * 24 * 15){
                $responseInterface = new JsonResponse(["display" => true]);
                file_put_contents($touchFile, time());
            }else{
                $responseInterface = new JsonResponse(["display" => false]);
            }
        }else{
            $responseInterface = new JsonResponse(["display" => true]);
            file_put_contents($touchFile, time());
        }
    }


    /********************/
    /* PLUGIN LIFECYCLE
    /********************/
    /**
     * @param ContextInterface $ctx
     */
    protected function initRepository(ContextInterface $ctx){
    }

}
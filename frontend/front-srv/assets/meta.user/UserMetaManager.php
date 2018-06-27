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
namespace Pydio\Access\Meta\UserGenerated;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Pydio\Access\Core\AbstractAccessDriver;
use Pydio\Access\Core\Model\Node;
use Pydio\Access\Core\Model\UserSelection;
use Pydio\Core\Exception\PydioException;
use Pydio\Core\Http\Client\MicroApi;
use Pydio\Core\Http\Client\SimpleStoreApi;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Services\ConfService;
use Pydio\Core\Controller\Controller;
use Pydio\Core\Services\UsersService;
use Pydio\Core\Utils\Vars\InputFilter;

use Pydio\Core\PluginFramework\PluginsService;
use Pydio\Access\Meta\Core\AbstractMetaSource;
use Pydio\Access\Metastore\Core\IMetaStoreProvider;
use Pydio\Core\Utils\Vars\StringHelper;
use Swagger\Client\Model\IdmUpdateUserMetaRequest;
use Swagger\Client\Model\IdmUserMeta;
use Swagger\Client\Model\ServiceResourcePolicy;
use Swagger\Client\Model\ServiceResourcePolicyAction;
use Swagger\Client\Model\ServiceResourcePolicyPolicyEffect;

defined('PYDIO_EXEC') or die( 'Access not allowed');

/**
 * Simple metadata implementation, stored in hidden files inside the
 * folders
 * @package AjaXplorer_Plugins
 * @subpackage Meta
 */
class UserMetaManager extends AbstractMetaSource
{
    private static $optionsLoaded = null;

    protected function definitionsToManifest(){

        $def = $this->getCachedDefinitions();
        $this->exposeConfigInManifest("meta_definitions", json_encode($def));

        $selection = $this->getXPath()->query('registry_contributions/client_configs/component_config[@component="FilesList"]/columns');
        $contrib = $selection->item(0);
        $even = false;
        $searchables = []; $searchablesReactRenderers = [];
        $index = 0;

        foreach ($def as $key=> $data) {
            $label = $data["label"];
            $fieldType = $data["type"];
            $visible = $data["visible"];

            $index ++;
            $col = $this->manifestDoc->createElement("additional_column");
            $col->setAttribute("messageString", $label);
            $col->setAttribute("attributeName", $key);
            $col->setAttribute("sortType", "String");
            if($visible) $col->setAttribute("defaultVisibilty", $lastVisibility);
            switch ($fieldType) {
                case "stars_rate":
                    $col->setAttribute("reactModifier", "ReactMeta.Renderer.renderStars");
                    $col->setAttribute("sortType", "CellSorterValue");
                    $searchables[$key] = $label;
                    $searchablesReactRenderers[$key] = "ReactMeta.Renderer.formPanelStars";
                    break;
                case "css_label":
                    $col->setAttribute("reactModifier", "ReactMeta.Renderer.renderCSSLabel");
                    $col->setAttribute("sortType", "CellSorterValue");
                    $searchables[$key] = $label;
                    $searchablesReactRenderers[$key] = "ReactMeta.Renderer.formPanelCssLabels";
                    break;
                case "textarea":
                    $searchables[$key] = $label;
                    break;
                case "string":
                    $searchables[$key] = $label;
                    break;
                case "choice":
                    $searchables[$key] = $label;
                    $col->setAttribute("reactModifier", "ReactMeta.Renderer.renderSelector");
                    $col->setAttribute("sortType", "CellSorterValue");
                    $col->setAttribute("metaAdditional", $data["data"]);
                    $searchablesReactRenderers[$key] = "ReactMeta.Renderer.formPanelSelectorFilter";
                    break;
                case "tags":
                    $searchables[$key] = $label;
                    $col->setAttribute("reactModifier", "ReactMeta.Renderer.renderTagsCloud");
                    $searchablesReactRenderers[$key] = "ReactMeta.Renderer.formPanelTags";
                    break;
                default:
                    break;
            }
            $contrib->appendChild($col);
        }

        $selection = $this->getXPath()->query('registry_contributions/client_configs/template_part[@ajxpClass="SearchEngine"]');
        foreach ($selection as $tag) {
            $v = $tag->attributes->getNamedItem("ajxpOptions")->nodeValue;
            if(!empty($v)) $vDat = json_decode($v, true);
            else $vDat = [];
            if(count($searchables)){
                $vDat['metaColumns'] = $searchables;
            }
            if(count($searchablesReactRenderers)){
                $vDat['reactColumnsRenderers'] = $searchablesReactRenderers;
            }
            $tag->setAttribute("ajxpOptions", json_encode($vDat));
        }

        if(count($def) === 0) {
            $toRemove = $this->getXPath()->query("registry_contributions/client_configs|registry_contributions/actions");
            foreach($toRemove as $element){
                $element->parentNode->removeChild($element);
            }
        }

    }

    public function loadManifest()
    {
        parent::loadManifest();

    }

    /**
     * @param ContextInterface $ctx
     * @param array $options
     */
    public function init(ContextInterface $ctx, $options = [])
    {
        $this->options = $options;

        $this->definitionsToManifest();
        parent::init($ctx, $this->options);

    }

    protected function getCachedDefinitions(){
        if(self::$optionsLoaded !== null) {
            return self::$optionsLoaded;
        }
        $cacheDir = $this->getPluginCacheDir(false, true);
        if(file_exists($cacheDir . "/metadefinitions.json")) {
            $data = file_get_contents($cacheDir . "/metadefinitions.json");
            self::$optionsLoaded = json_decode($data, true);
        } else {
            $result = $this->getMetaDefinition();
            file_put_contents($cacheDir."/metadefinitions.json", json_encode($result));
            self::$optionsLoaded = $result;
        }
        return self::$optionsLoaded;
    }

    /**
     * @return array
     */
    protected function getMetaDefinition() {
        $api = MicroApi::GetUserMetaServiceApi();
        $response = $api->listUserMetaNamespace();
        if($response->getNamespaces() === null) {
            return [];
        }
        $result = [];
        foreach($response->getNamespaces() as $namespace){
            $name = $namespace->getNamespace();
            $label = $namespace->getLabel();
            $indexable = $namespace->getIndexable();
            $order = $namespace->getOrder();
            $def = $namespace->getJsonDefinition();
            if($def !== null){
                $def = json_decode($def, true);
            } else {
                $def = [];
            }
            $policies = $namespace->getPolicies();
            $read = ""; $write = "";
            if($policies === null) $policies = [];
            foreach($policies as $resourcePolicy){
                if($resourcePolicy->getAction() === 'READ'){
                    $read = $resourcePolicy->getSubject();
                } else if($resourcePolicy->getAction() === 'WRITE'){
                    $write = $resourcePolicy->getSubject();
                }
            }
            $def["label"] = $label;
            $def["readSubject"] = $read;
            $def["writeSubject"] = $write;
            $def["indexable"] =  $indexable === 1 ? true : false;
            $def["visible"] =  true;
            $def["order"] = $order;
            $result[$name] = $def;
        }
        return $result;
    }

    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     * @throws \Exception
     */
    public function editMeta(ServerRequestInterface &$requestInterface, ResponseInterface &$responseInterface)
    {
        /** @var ContextInterface $ctx */
        $ctx = $requestInterface->getAttribute("ctx");
        $httpVars = $requestInterface->getParsedBody();
        if ($ctx->getRepository()->getDriverInstance($ctx) instanceof \Pydio\Access\Driver\StreamProvider\FS\DemoAccessDriver) {
            throw new PydioException("Write actions are disabled in demo mode!");
        }
        $user = $ctx->getUser();
        $userMetaApi = MicroApi::GetUserMetaServiceApi();

        $selection = UserSelection::fromContext($ctx, $httpVars);
        $nodes = $selection->buildNodes();
        $nodesDiffs = new \Pydio\Access\Core\Model\NodesDiff();
        $def = $this->getCachedDefinitions();
        foreach($nodes as $node){

            $node->loadNodeInfo();
            if($node->node_readonly === 'true'){
                throw new PydioException("You are not allowed to perform this action");
            }
            $nodeUuid = $node->getUuid();
            $metadatas = [];
            $values = [];
            foreach ($def as $key => $data) {
                if (isSet($httpVars[$key])) {
                    $newValue = InputFilter::decodeSecureMagic($httpVars[$key]);
                    if($data["type"] == "tags"){
                        $this->updateTags($ctx, $key, InputFilter::decodeSecureMagic($httpVars[$key]));
                    }
                    $meta = (new IdmUserMeta())
                        ->setNamespace($key)
                        ->setNodeUuid($nodeUuid)
                        ->setJsonValue(json_encode($newValue))
                        ->setPolicies([
                        (new ServiceResourcePolicy())->setAction(ServiceResourcePolicyAction::READ)->setSubject("*")->setEffect(ServiceResourcePolicyPolicyEffect::ALLOW),
                        (new ServiceResourcePolicy())->setAction(ServiceResourcePolicyAction::WRITE)->setSubject("*")->setEffect(ServiceResourcePolicyPolicyEffect::ALLOW),
                    ]);
                    $metadatas[] = $meta;
                    $values[$key] = $newValue;
                }
            }
            $request = (new IdmUpdateUserMetaRequest())
                ->setOperation("PUT")
                ->setMetaDatas($metadatas);
            $response = $userMetaApi->updateUserMeta($request);

            foreach($values as $k => $v){
                $node->$k = $v;
            }
            $nodesDiffs->update($node);

        }
        $respStream = new \Pydio\Core\Http\Response\SerializableResponseStream();
        $responseInterface = $responseInterface->withBody($respStream);
        $respStream->addChunk($nodesDiffs);
    }

    /**
     *
     * @param Node $node
     * @param bool $contextNode
     * @param bool $details
     * @return void
     */
    public function extractMeta(&$node, $contextNode = false, $details = false)
    {
        $metadata = $node->retrieveMetadata("users_meta", false, PYDIO_METADATA_SCOPE_GLOBAL);
        if(empty($metadata)) $metadata = array();
        $node->mergeMetadata($metadata);

    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $requestInterface
     * @param \Psr\Http\Message\ResponseInterface $responseInterface
     * @return \Psr\Http\Message\ResponseInterface|\Zend\Diactoros\Response\JsonResponse
     */
    public function listTags(\Psr\Http\Message\ServerRequestInterface $requestInterface, \Psr\Http\Message\ResponseInterface &$responseInterface){

        $namespace = $requestInterface->getParsedBody()["namespace"];
        $tags = $this->loadTags($requestInterface->getAttribute("ctx"), $namespace);
        if(empty($tags)) $tags = array();
        // Use array_values to make sure it is serialized as an array, not an object
        $responseInterface = new \Zend\Diactoros\Response\JsonResponse(array_values($tags));
        return $responseInterface;

    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $requestInterface
     * @param \Psr\Http\Message\ResponseInterface $responseInterface
     * @return \Psr\Http\Message\ResponseInterface|\Zend\Diactoros\Response\JsonResponse
     */
    public function resetTags(\Psr\Http\Message\ServerRequestInterface $requestInterface, \Psr\Http\Message\ResponseInterface &$responseInterface){

        /** @var ContextInterface $ctx */
        $ctx = $requestInterface->getAttributes("ctx");
        if(!$ctx->getUser()->isAdmin()){
            throw new PydioException("Not Authorized");
        }

        $namespace = $requestInterface->getParsedBody()["namespace"];
        $api = new SimpleStoreApi();
        $api->storeDocument("meta_user_tags", $namespace, "", [], []);
        $responseInterface = new \Zend\Diactoros\Response\JsonResponse(["message"=>"Tags removed for namespace ".$namespace]);
        return $responseInterface;

    }

    /**
     * @param ContextInterface $ctx
     * @param $namespace string
     * @return array
     */
    protected function loadTags(ContextInterface $ctx, $namespace){

        $api = new SimpleStoreApi();
        try{
            $data = $api->loadDocument("meta_user_tags", $namespace);
        } catch (Exception $e){
            $data = [];
        }
        return $data;

    }

    /**
     * @param ContextInterface $ctx
     * @param $namespace string
     * @param $tagString string
     * @throws \Exception
     */
    protected function updateTags(ContextInterface $ctx, $namespace, $tagString){

        $tags = $this->loadTags($ctx, $namespace);
        $tags = array_merge($tags, array_map("trim", explode(",", $tagString)));
        $tags = array_unique($tags);
        $api = new SimpleStoreApi();
        $api->storeDocument("meta_user_tags", $namespace, "", $tags, []);

    }

}

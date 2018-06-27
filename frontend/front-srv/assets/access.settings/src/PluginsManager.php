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
use Pydio\Access\Core\Model\Node;
use Pydio\Access\Core\Model\NodesList;
use Pydio\Core\Utils\Vars\XMLFilter;
use Pydio\Core\Http\Message\ReloadMessage;
use Pydio\Core\Http\Message\UserMessage;
use Pydio\Core\Http\Message\XMLDocMessage;
use Pydio\Core\Http\Response\SerializableResponseStream;
use Pydio\Core\PluginFramework\Plugin;
use Pydio\Core\PluginFramework\PluginsService;
use Pydio\Core\Services\CacheService;
use Pydio\Core\Services\ConfService;
use Pydio\Core\Services\LocaleService;
use Pydio\Core\Utils\Vars\InputFilter;
use Pydio\Core\Utils\Vars\StringHelper;
use Zend\Diactoros\Response\JsonResponse;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * Class PluginsManager
 * @package Pydio\Access\Driver\DataProvider\Provisioning
 */
class PluginsManager extends AbstractManager
{

    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     * @return ResponseInterface
     */
    public function pluginsActions(ServerRequestInterface $requestInterface, ResponseInterface $responseInterface){

        $action     = $requestInterface->getAttribute("action");
        $ctx        = $requestInterface->getAttribute("ctx");
        $httpVars   = $requestInterface->getParsedBody();
        $mess       = LocaleService::getMessages();

        switch ($action){
            // PLUGINS
            case "clear_plugins_cache":

                ConfService::clearAllCaches();
                $userMessage = new UserMessage($mess["settings." . (PYDIO_SKIP_CACHE ? "132" : "131")]);
                $reloadMessage = new ReloadMessage();
                $responseInterface = $responseInterface->withBody(new SerializableResponseStream([$userMessage, $reloadMessage]));

                break;

            case "get_plugin_manifest" :

                $pluginId       = InputFilter::sanitize($httpVars["plugin_id"], InputFilter::SANITIZE_ALPHANUM);
                if($pluginId === "core") {
                    $pluginId = "core.pydio";
                }
                $pydioPlugin     = PluginsService::getInstance($ctx)->getPluginById($pluginId);
                $buffer = "<admin_data>";

                $fullManifest = $pydioPlugin->getManifestRawContent("", "xml");
                $xPath = new \DOMXPath($fullManifest->ownerDocument);
                $addParams = "";
                $instancesDefinitions = array();
                $pInstNodes = $xPath->query("server_settings/global_param[contains(@type, 'plugin_instance:')]");
                /** @var \DOMElement $pInstNode */
                foreach ($pInstNodes as $pInstNode) {
                    $type = $pInstNode->getAttribute("type");
                    $instType = str_replace("plugin_instance:", "", $type);
                    $fieldName = $pInstNode->getAttribute("name");
                    $pInstNode->setAttribute("type", "group_switch:" . $fieldName);
                    $typePlugs = PluginsService::getInstance($ctx)->getPluginsByType($instType);
                    foreach ($typePlugs as $typePlug) {
                        if (!$typePlug->isEnabled()) continue;
                        if ($typePlug->getId() == "auth.multi") continue;
                        $checkErrorMessage = "";
                        try {
                            $typePlug->performChecks();
                        } catch (\Exception $e) {
                            $checkErrorMessage = " (Warning : " . $e->getMessage() . ")";
                        }
                        $tParams = XMLFilter::resolveKeywords($typePlug->getManifestRawContent("server_settings/param[not(@group_switch_name)]"));
                        $addParams .= '<global_param group_switch_name="' . $fieldName . '" name="instance_name" group_switch_label="' . $typePlug->getManifestLabel() . $checkErrorMessage . '" group_switch_value="' . $typePlug->getId() . '" default="' . $typePlug->getId() . '" type="hidden"/>';
                        $addParams .= str_replace("<param", "<global_param group_switch_name=\"${fieldName}\" group_switch_label=\"" . $typePlug->getManifestLabel() . $checkErrorMessage . "\" group_switch_value=\"" . $typePlug->getId() . "\" ", $tParams);
                        $addParams .= str_replace("<param", "<global_param", XMLFilter::resolveKeywords($typePlug->getManifestRawContent("server_settings/param[@group_switch_name]")));
                        $addParams .= XMLFilter::resolveKeywords($typePlug->getManifestRawContent("server_settings/global_param"));
                        $instancesDefs = $typePlug->getConfigsDefinitions();
                        if (!empty($instancesDefs) && is_array($instancesDefs)) {
                            foreach ($instancesDefs as $defKey => $defData) {
                                $instancesDefinitions[$fieldName . "/" . $defKey] = $defData;
                            }
                        }
                    }
                }
                $allParams = XMLFilter::resolveKeywords($fullManifest->ownerDocument->saveXML($fullManifest));
                $allParams = str_replace('type="plugin_instance:', 'type="group_switch:', $allParams);
                $allParams = str_replace("</server_settings>", $addParams . "</server_settings>", $allParams);

                $buffer .= $allParams ;
                $definitions = $instancesDefinitions;
                $configsDefs = $pydioPlugin->getConfigsDefinitions();
                if (is_array($configsDefs)) {
                    $definitions = array_merge($configsDefs, $instancesDefinitions);
                }
                $values = $pydioPlugin->getConfigs();
                if (!is_array($values)) $values = array();
                $buffer .= "<plugin_settings_values>";
                // First flatten keys
                $flattenedKeys = array();
                foreach ($values as $key => $value) {
                    $type = $definitions[$key]["type"];
                    if ((strpos($type, "group_switch:") === 0 || strpos($type, "plugin_instance:") === 0) && is_array($value)) {
                        $res = array();
                        $this->flattenKeyValues($res, $definitions, $value, $key);
                        $flattenedKeys += $res;
                        // Replace parent key by new flat value
                        $values[$key] = $flattenedKeys[$key];
                    }
                }
                $values += $flattenedKeys;

                foreach ($values as $key => $value) {
                    $attribute = true;
                    $type = $definitions[$key]["type"];
                    if ($type == "array" && is_array($value)) {
                        $value = implode(",", $value);
                    } else if ($type == "boolean") {
                        $value = ($value === true || $value === "true" || $value == 1 ? "true" : "false");
                    } else if ($type == "textarea") {
                        $attribute = false;
                    } else if ($type == "password" && !empty($value)) {
                        $value = "__PYDIO_VALUE_SET__";
                    }
                    if ($attribute) {
                        $buffer .= "<param name=\"$key\" value=\"" . StringHelper::xmlEntities($value) . "\"/>";
                    } else {
                        $buffer .= "<param name=\"$key\" cdatavalue=\"true\"><![CDATA[" . $value . "]]></param>";
                    }
                }
                if ($pydioPlugin->getType() != "core") {
                    $buffer .= "<param name=\"PYDIO_PLUGIN_ENABLED\" value=\"" . ($pydioPlugin->isEnabled() ? "true" : "false") . "\"/>";
                }
                $buffer .= "</plugin_settings_values>";
                $buffer .= "<plugin_doc><![CDATA[<p>" . $pydioPlugin->getPluginInformationHTML("Charles du Jeu", "https://pydio.com/en/docs/references/plugins/") . "</p>";
                if (file_exists($pydioPlugin->getBaseDir() . "/plugin_doc.html")) {
                    $buffer .= file_get_contents($pydioPlugin->getBaseDir() . "/plugin_doc.html");
                }
                $buffer .= "]]></plugin_doc>";
                $buffer .= "</admin_data>";

                $responseInterface = $responseInterface->withHeader("Content-type", "text/xml");
                $responseInterface->getBody()->write($buffer);

                break;

            case "run_plugin_action":

                $options = array();
                $responseInterface = $responseInterface->withHeader("Content-type", "text/plain");
                $this->parseParameters($ctx, $httpVars, $options, true);
                $pluginId = $httpVars["action_plugin_id"];
                if (isSet($httpVars["button_key"])) {
                    $options = $options[$httpVars["button_key"]];
                }
                $plugin = PluginsService::getInstance($ctx)->softLoad($pluginId, $options);
                if (method_exists($plugin, $httpVars["action_plugin_method"])) {
                    try {
                        $res = call_user_func(array($plugin, $httpVars["action_plugin_method"]), $options, $ctx);
                        $response = $res;
                    } catch (\Exception $e) {
                        $response = "ERROR:" . $e->getMessage();
                    }
                } else {
                    $response = 'ERROR: Plugin ' . $httpVars["action_plugin_id"] . ' does not implement ' . $httpVars["action_plugin_method"] . ' method!';
                }
                $responseInterface->getBody()->write($response);

                break;

            case "edit_plugin_options":

                $options = array();
                $this->parseParameters($ctx, $httpVars, $options, true);
                $confStorage = ConfService::getConfStorageImpl();
                $pluginId = InputFilter::sanitize($httpVars["plugin_id"], InputFilter::SANITIZE_ALPHANUM);
                if($pluginId === "core") {
                    $pluginId = "core.pydio";
                }
                list($pType, $pName) = explode(".", $pluginId);
                $existing = $confStorage->loadPluginConfig($pType, $pName);
                $this->mergeExistingParameters($options, $existing);
                $confStorage->savePluginConfig($pluginId, $options);
                ConfService::clearAllCaches();
                $responseInterface = $responseInterface->withBody(new SerializableResponseStream([new UserMessage($mess["settings.97"])]));

                break;

            case "list_all_plugins_actions":

                if($this->currentUserIsGroupAdmin()){
                    // Group admin : do not allow actions edition
                    return new JsonResponse(["LIST" => array(), "HAS_GROUPS" => true]);
                }

                if(CacheService::contains(PYDIO_CACHE_SERVICE_NS_SHARED, "ALL_ACTIONS_CACHE")){

                    $actions = CacheService::fetch(PYDIO_CACHE_SERVICE_NS_SHARED, "ALL_ACTIONS_CACHE");

                }else{

                    $nodes = PluginsService::getInstance($ctx)->searchAllManifests("//action", "node", false, true, true);
                    $actions = array();
                    foreach ($nodes as $node) {
                        $xPath = new \DOMXPath($node->ownerDocument);
                        $proc = $xPath->query("processing", $node);
                        if(!$proc->length) continue;
                        $txt = $xPath->query("gui/@text", $node);
                        if ($txt->length) {
                            $messId = $txt->item(0)->nodeValue;
                        } else {
                            $messId = "";
                        }
                        $parentPlugin = $node->parentNode->parentNode->parentNode;
                        $pId = $parentPlugin->attributes->getNamedItem("id")->nodeValue;
                        if (empty($pId)) {
                            $pId = $parentPlugin->nodeName .".";
                            if($pId == "ajxpdriver.") $pId = "access.";
                            $pId .= $parentPlugin->attributes->getNamedItem("name")->nodeValue;
                        }
                        if(!is_array($actions[$pId])) $actions[$pId] = array();
                        $actionName = $node->attributes->getNamedItem("name")->nodeValue;
                        $actionData = [
                            "action" => $actionName ,
                            "label" => $messId,
                            "server_processing" => $xPath->query("processing/serverCallback", $node)->length ? true : false
                        ];
                        // Parse parameters if they are defined
                        $params = $xPath->query("processing/serverCallback/input_param", $node);
                        if($params->length){
                            $actionParameters = [];
                            /** @var \DOMElement $pNode */
                            foreach($params as $pNode){
                                $actionParameters[] = [
                                    "type" => $pNode->getAttribute("type"),
                                    "name" => $pNode->getAttribute("name"),
                                    "description" => $pNode->getAttribute("description")
                                ];
                            }
                            $actionData["parameters"] = $actionParameters;
                        }
                        $actions[$pId][$actionName] = $actionData;
                    }
                    ksort($actions, SORT_STRING);
                    foreach ($actions as $actPid => $actionGroup) {
                        ksort($actionGroup, SORT_STRING);
                        $actions[$actPid] = array();
                        foreach ($actionGroup as $v) {
                            $actions[$actPid][] = $v;
                        }
                    }
                    CacheService::save(PYDIO_CACHE_SERVICE_NS_SHARED, "ALL_ACTIONS_CACHE", $actions);
                }
                $responseInterface = new JsonResponse(["LIST" => $actions, "HAS_GROUPS" => true]);
                break;

            case "list_all_plugins_parameters":

                if(CacheService::contains(PYDIO_CACHE_SERVICE_NS_SHARED, "ALL_PARAMS_CACHE")){
                    $parameters = CacheService::fetch(PYDIO_CACHE_SERVICE_NS_SHARED, "ALL_PARAMS_CACHE");
                }else{
                    $currentUserIsGroupAdmin = ($ctx->hasUser() && $ctx->getUser()->getGroupPath() != "/");
                    $parameters = $this->getEditableParameters($ctx, $currentUserIsGroupAdmin, true);
                    CacheService::save(PYDIO_CACHE_SERVICE_NS_SHARED, "ALL_PARAMS_CACHE", $parameters);
                }
                $responseInterface = new JsonResponse(["LIST" => $parameters, "HAS_GROUPS" => true]);
                break;

            case "parameters_to_form_definitions" :

                $data = json_decode(InputFilter::magicDequote($httpVars["json_parameters"]), true);
                $buffer = "<standard_form>";
                foreach ($data as $repoScope => $pluginsData) {
                    $buffer .= "<repoScope id='$repoScope'>";
                    foreach ($pluginsData as $pluginId => $paramData) {
                        foreach ($paramData as $paramId => $paramValue) {
                            $query = "//param[@name='$paramId']|//global_param[@name='$paramId']";
                            $nodes = PluginsService::getInstance($ctx)->searchAllManifests($query, "node", false, true, true);
                            if(!count($nodes)) continue;
                            $n = $nodes[0];
                            if ($n->attributes->getNamedItem("group") != null) {
                                $n->attributes->getNamedItem("group")->nodeValue = "$pluginId";
                            } else {
                                $n->appendChild($n->ownerDocument->createAttribute("group"));
                                $n->attributes->getNamedItem("group")->nodeValue = "$pluginId";
                            }
                            if(is_bool($paramValue)) $paramValue = ($paramValue ? "true" : "false");
                            if ($n->attributes->getNamedItem("default") != null) {
                                $n->attributes->getNamedItem("default")->nodeValue = $paramValue;
                            } else {
                                $n->appendChild($n->ownerDocument->createAttribute("default"));
                                $n->attributes->getNamedItem("default")->nodeValue = $paramValue;
                            }
                            $buffer .= XMLFilter::resolveKeywords($n->ownerDocument->saveXML($n));
                        }
                    }
                    $buffer .= "</repoScope>";
                }
                $buffer .= "</standard_form>";
                $responseInterface = $responseInterface->withBody(new SerializableResponseStream(new XMLDocMessage($buffer)));
                break;

            default:
                break;
        }

        return $responseInterface;
    }

    /**
     * @param ServerRequestInterface $requestInterface Full set of query parameters
     * @param string $rootPath Path to prepend to the resulting nodes
     * @param string $relativePath Specific path part for this function
     * @param string $paginationHash Number added to url#2 for pagination purpose.
     * @param string $findNodePosition Path to a given node to try to find it
     * @param string $aliasedDir Aliased path used for alternative url
     * @return NodesList A populated NodesList object, eventually recursive.
     * @throws \Pydio\Core\Exception\PydioException
     */
    public function listNodes(ServerRequestInterface $requestInterface, $rootPath, $relativePath, $paginationHash = null, $findNodePosition = null, $aliasedDir = null)
    {

        $relativePath   = "/$relativePath";
        if($aliasedDir != null && $aliasedDir != "/".$rootPath.$relativePath){
            $baseDir = $aliasedDir;
        }else{
            $baseDir = "/".$rootPath.$relativePath;
        }
        $nodesList      = new NodesList($baseDir);
        $pServ          = PluginsService::getInstance($this->context);
        $types          = $pServ->getDetectedPlugins();
        $mess           = LocaleService::getMessages();
        $uniqTypes      = array("core");
        $coreTypes      = array("access", "cache", "metastore", "auth", "conf", "boot", "feed", "log", "mailer", "mq");

        if ($relativePath == "/plugins" || $relativePath == "/core_plugins" || $relativePath=="/all") {

            if($relativePath == "/core_plugins") {
                $uniqTypes = $coreTypes;
            } else if($relativePath == "/plugins" || $relativePath == "/all") {
                $uniqTypes = array_diff(array_keys($types), $coreTypes);
            }
            $nodesList->initColumnsData("filelist", "detail", "settings.plugins_folder");
            $nodesList->appendColumn("settings.101", "ajxp_label");
            $nodesList->appendColumn("settings.103", "plugin_description");
            $nodesList->appendColumn("settings.102", "plugin_id");
            ksort($types);

            foreach ($types as $t => $tPlugs) {
                if(!empty($findNodePosition) && $t !== $findNodePosition) continue;
                if(!in_array($t, $uniqTypes))continue;
                if($t == "core") continue;
                $nodeKey = $baseDir."/".$t;
                $meta = array(
                    "icon" 		         => "folder_development.png",
                    "plugin_id"          => $t,
                    "text"               => $mess["plugtype.title.".$t],
                    "plugin_description" => $mess["plugtype.desc.".$t],
                    "is_file"            => false
                );
                $this->appendBookmarkMeta($nodeKey, $meta);
                $nodesList->addBranch(new Node($nodeKey, $meta));
            }

        } else if ($relativePath == "/core") {

            $nodesList->initColumnsData("filelist", "detail", "settings.plugins");
            $nodesList->appendColumn("settings.101", "ajxp_label");
            $nodesList->appendColumn("settings.102", "plugin_id");
            $nodesList->appendColumn("settings.103", "plugin_description");

            $all = []; $first = null;
            foreach ($uniqTypes as $type) {
                if(!isset($types[$type])) continue;
                /** @var Plugin $pObject */
                foreach ($types[$type] as $pObject) {
                    if(!empty($findNodePosition) && $pObject->getId() !== $findNodePosition) continue;

                    $isMain = ($pObject->getId() == "core.pydio");
                    $meta = array(
                        "icon" 		         => ($isMain?"preferences_desktop.png":"desktop.png"),
                        "ajxp_mime"          => "plugin",
                        "plugin_id"          => $pObject->getId(),
                        "plugin_description" => $pObject->getManifestDescription(),
                        "text"               => $pObject->getManifestLabel()
                    );
                    // Check if there are actually any parameters to display!
                    if($pObject->getManifestRawContent("server_settings", "xml")->length == 0) {
                        continue;
                    }
                    $nodeKey = $baseDir."/".$pObject->getId();
                    $this->appendBookmarkMeta($nodeKey, $meta);
                    $plugNode = new Node($nodeKey, $meta);
                    if ($isMain) {
                        $first = $plugNode;
                    } else {
                        $all[] = $plugNode;
                    }
                }
            }

            if($first !== null) $nodesList->addBranch($first);
            foreach($all as $node) $nodesList->addBranch($node);

        } else {
            $split = explode("/", $relativePath);
            if(empty($split[0])) array_shift($split);
            $type = $split[1];

            $nodesList->initColumnsData("filelist", "full", "settings.plugin_detail");
            $nodesList->appendColumn("settings.101", "ajxp_label", "String", "10%");
            $nodesList->appendColumn("settings.102", "plugin_id", "String", "10%");
            $nodesList->appendColumn("settings.103", "plugin_description", "String", "60%");
            $nodesList->appendColumn("settings.104", "enabled", "String", "10%");
            $nodesList->appendColumn("settings.105", "can_active", "String", "10%");

            $mess = LocaleService::getMessages();
            /** @var Plugin $pObject */
            foreach ($types[$type] as $pObject) {
                if(!empty($findNodePosition) && $pObject->getId() !== $findNodePosition) continue;
                $errors = "OK";
                try {
                    $pObject->performChecks();
                } catch (\Exception $e) {
                    $errors = "ERROR : ".$e->getMessage();
                }
                $meta = array(
                    "icon" 		    => "preferences_plugin.png",
                    "text"          => $pObject->getManifestLabel(),
                    "ajxp_mime"     => "plugin",
                    "can_active"	=> $errors,
                    "enabled"	    => ($pObject->isEnabled()?$mess[440]:$mess[441]),
                    "plugin_id"     => $pObject->getId(),
                    "plugin_description" => $pObject->getManifestDescription()
                );
                $nodeKey = $baseDir."/".$pObject->getId();
                $this->appendBookmarkMeta($nodeKey, $meta);
                $nodesList->addBranch(new Node($nodeKey, $meta));
            }
        }
        return $nodesList;

    }

    /**
     * @param $result
     * @param $definitions
     * @param $values
     * @param string $parent
     */
    protected function flattenKeyValues(&$result, &$definitions, $values, $parent = "")
    {
        foreach ($values as $key => $value) {
            if (is_array($value)) {
                $this->flattenKeyValues($result, $definitions, $value, $parent."/".$key);
            } else {
                if ($key == "instance_name") {
                    $result[$parent] = $value;
                }
                if ($key == "group_switch_value") {
                    $result[$parent] = $value;
                } else {
                    $result[$parent.'/'.$key] = $value;
                    if(isSet($definitions[$key])){
                        $definitions[$parent.'/'.$key] = $definitions[$key];
                    }else if(isSet($definitions[dirname($parent)."/".$key])){
                        $definitions[$parent.'/'.$key] = $definitions[dirname($parent)."/".$key];
                    }
                }
            }
        }
    }

}
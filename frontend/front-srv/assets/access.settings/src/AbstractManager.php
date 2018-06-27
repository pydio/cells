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

use Psr\Http\Message\ServerRequestInterface;
use Pydio\Access\Core\Model\NodesList;
use Pydio\Core\Services\LocaleService;
use Pydio\Core\Utils\Vars\XMLFilter;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\PluginFramework\PluginsService;
use Pydio\Core\Services\ConfService;
use Pydio\Core\Services\UsersService;
use Pydio\Core\Utils\Vars\OptionsHelper;

defined('PYDIO_EXEC') or die('Access not allowed');


/**
 * Parent Class for CRUD operation of application objects.
 * @package Pydio\Access\Driver\DataProvider\Provisioning
 */
abstract class AbstractManager
{
    /** @var  ContextInterface */
    protected $context;

    /** @var  array */
    protected $bookmarks;

    /** @var  string */
    protected $pluginName;

    /** @var bool */
    protected $listSpecialRoles = PYDIO_SERVER_DEBUG;

    /**
     * Manager constructor.
     * @param ContextInterface $ctx
     * @param string $pluginName
     */
    public function __construct(ContextInterface $ctx, $pluginName){
        $this->context = $ctx;
        $this->pluginName = $pluginName;
    }

    /**
     * @return bool
     */
    protected function currentUserIsGroupAdmin(){
        if(ConfService::getAuthDriverImpl()->isPydioAdmin($this->context->getUser()->getId())){
            return false;
        }
        return (UsersService::usersEnabled() && $this->context->getUser()->getGroupPath() !== "/");
    }

    /**
     * @return array
     */
    protected function getBookmarks(){
        if(!isSet($this->bookmarks)){
            $this->bookmarks = [];
            if(UsersService::usersEnabled()) {
                $bookmarks = $this->context->getUser()->getBookmarks($this->context->getRepositoryId());
                foreach ($bookmarks as $bm) {
                    $this->bookmarks[] = $bm["PATH"];
                }
            }
        }
        return $this->bookmarks;
    }

    /**
     * @param string $nodePath
     * @param array $meta
     */
    protected function appendBookmarkMeta($nodePath, &$meta){
        if(in_array($nodePath, $this->getBookmarks())) {
            $meta = array_merge($meta, array(
                "ajxp_bookmarked" => "true",
                "overlay_icon" => "bookmark.png"
            ));
        }
    }


    /**
     * @param ContextInterface $ctx
     * @param $repDef
     * @param $options
     * @param bool $globalBinaries
     * @param array $existingValues
     */
    protected function parseParameters(ContextInterface $ctx, &$repDef, &$options, $globalBinaries = false, $existingValues = array())
    {
        OptionsHelper::parseStandardFormParameters($ctx, $repDef, $options, "DRIVER_OPTION_", ($globalBinaries ? array() : null));
        if(!count($existingValues)){
            return;
        }
        $this->mergeExistingParameters($options, $existingValues);
    }

    /**
     * @param array $parsed
     * @param array $existing
     */
    protected function mergeExistingParameters(&$parsed, $existing){
        foreach($parsed as $k => &$v){
            if($v === "__PYDIO_VALUE_SET__" && isSet($existing[$k])){
                $parsed[$k] = $existing[$k];
            }else if(is_array($v) && is_array($existing[$k])){
                $this->mergeExistingParameters($v, $existing[$k]);
            }
        }
    }


    /**
     * @param ContextInterface $ctx
     * @param $currentUserIsGroupAdmin
     * @param bool $withLabel
     * @return array
     */
    protected function getEditableParameters($ctx, $currentUserIsGroupAdmin, $withLabel = false){

        $query = "//param|//global_param";
        if($currentUserIsGroupAdmin){
            $query = "//param[@scope]|//global_param[@scope]";
        }

        $nodes = PluginsService::getInstance($ctx)->searchAllManifests($query, "node", false, true, true);
        $parameters = array();
        $enableMessage = LocaleService::getMessages()["settings.170"];
        foreach ($nodes as $node) {
            if($node->parentNode->nodeName != "server_settings") continue;
            $parentPlugin = $node->parentNode->parentNode;
            $pId = $parentPlugin->attributes->getNamedItem("id")->nodeValue;
            if (empty($pId)) {
                $pId = $parentPlugin->nodeName .".";
                if($pId == "ajxpdriver.") $pId = "access.";
                $pId .= $parentPlugin->attributes->getNamedItem("name")->nodeValue;
            }
            if(!is_array($parameters[$pId])) $parameters[$pId] = array();
            $pType = array_shift(explode('.', $pId));
            if(in_array($pType, ['uploader', 'action', 'editor', 'meta', 'shorten', 'authfront'])){
                if($withLabel){
                    $parentPluginLabel = XMLFilter::resolveKeywords($parentPlugin->attributes->getNamedItem("label")->nodeValue);
                    $parentPluginLabel = "test";
                    $paramLabel = str_replace(['%1', '%2'], [$parentPluginLabel, $pId], $enableMessage);
                    $parameters[$pId]['PYDIO_PLUGIN_ENABLED'] = [
                        'parameter' => 'PYDIO_PLUGIN_ENABLED',
                        'label'     => $paramLabel,
                        'attributes'=> [
                            'name'          => 'PYDIO_PLUGIN_ENABLED',
                            'default'       => 'true',
                            'description'   => $paramLabel,
                            'label'         => $paramLabel,
                            'mandatory'     => 'false',
                            'type'          => 'boolean'
                        ]
                    ];
                }else{
                    $parameters[$pId][] = 'PYDIO_PLUGIN_ENABLED';
                }
            }
            $parameterName = $node->attributes->getNamedItem("name")->nodeValue;
            $attributes = array();
            for( $i = 0; $i < $node->attributes->length; $i ++){
                $att = $node->attributes->item($i);
                $value = $att->nodeValue;
                if(in_array($att->nodeName, array("choices", "description", "group", "label"))) {
                    $value = XMLFilter::resolveKeywords($value);
                }
                $attributes[$att->nodeName] = $value;
            }
            if($withLabel){
                $parameters[$pId][$parameterName] = array(
                    "parameter" => $parameterName ,
                    "label" => $attributes["label"],
                    "attributes" => $attributes
                );
            }else{
                $parameters[$pId][] = $parameterName;
            }

        }
        foreach ($parameters as $actPid => $actionGroup) {
            ksort($actionGroup, SORT_STRING);
            $parameters[$actPid] = array();
            foreach ($actionGroup as $v) {
                $parameters[$actPid][] = $v;
            }
        }
        return $parameters;
    }


    /**
     * @param ServerRequestInterface $requestInterface
     * @param string $rootPath Path to prepend to the resulting nodes
     * @param string $relativePath Specific path part for this function
     * @param string $paginationHash Number added to url#2 for pagination purpose.
     * @param string $findNodePosition Path to a given node to try to find it
     * @param string $aliasedDir Aliased path used for alternative url
     * @return NodesList A populated NodesList object, eventually recursive.
     */
    public abstract function listNodes(ServerRequestInterface $requestInterface, $rootPath, $relativePath, $paginationHash = null, $findNodePosition=null, $aliasedDir=null);

}
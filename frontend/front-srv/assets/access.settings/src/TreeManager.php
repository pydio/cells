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
use Pydio\Access\Core\Model\Node;
use Pydio\Access\Core\Model\NodesList;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Services\LocaleService;
use Pydio\Core\Utils\Vars\InputFilter;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * Class TreeManager
 * @package Pydio\Access\Driver\DataProvider\Provisioning
 */
class TreeManager extends AbstractManager
{
    /**
     * @var array
     */
    protected $mainTree;

    /**
     * @var array
     */
    protected $currentBookmarks = [];

    /**
     * TreeManager constructor.
     * @param ContextInterface $ctx
     * @param string $pluginName
     * @param array $mainTree
     */
    public function __construct(ContextInterface $ctx, $pluginName, $mainTree)
    {
        parent::__construct($ctx, $pluginName);
        $this->mainTree = $mainTree;
    }

    /**
     * Forward call to dedicated managers, must implement AbstractManager
     * @param ServerRequestInterface $requestInterface
     * @param $childData
     * @param $initialPath
     * @param $rootSegment
     * @param $otherSegments
     * @param $hashValue
     * @return NodesList
     */
    protected function forwardToManagers(ServerRequestInterface $requestInterface, $childData, $initialPath, $rootSegment, $otherSegments, $hashValue){

        if(!isSet($childData["LIST"]) && !isSet($childData["MANAGER"])){
            return new NodesList($initialPath);
        }

        if(isSet($childData["ALIAS"])){
            $reSplits = explode("/", ltrim($childData["ALIAS"], "/"));
            $rootSegment = array_shift($reSplits);
            // additional part?
            array_shift($otherSegments);
            foreach($otherSegments as $vS) $reSplits[] = $vS;
            $otherSegments = $reSplits;
        }

        $httpVars = $requestInterface->getParsedBody();
        if(!isSet($childData["MANAGER"]) && isSet($childData["LIST"]) && is_callable($childData["LIST"])){
            return call_user_func($childData["LIST"], $httpVars, $rootSegment, implode("/", $otherSegments), $hashValue, isSet($httpVars["file"])?$httpVars["file"]:'', $initialPath);
        }

        $callback = $childData["MANAGER"];
        // Backward compat
        $callback = str_replace("RepositoriesManager", "WorkspacesManager", $callback);
        /** @var AbstractManager $manager */
        if($callback === "TreeManager") {
            $manager = $this;
        }else{
            $manager = new $callback($this->context, $this->pluginName);
        }

        return $manager->listNodes($requestInterface, $rootSegment, implode("/", $otherSegments), $hashValue, isSet($httpVars["file"])?$httpVars["file"]:'', $initialPath);

    }

    /**
     * Render a bookmark node
     * @param NodesList $nodesList
     * @param $path
     * @param $data
     * @param $messages
     */
    protected function appendNodeFromTree($nodesList, $path, $data, $messages){

        if(!isSet($data["LABEL"])){
            return;
        }
        if(isSet($messages[$data["LABEL"]])) $data["LABEL"] = $messages[$data["LABEL"]];
        if(isSet($messages[$data["DESCRIPTION"]])) $data["DESCRIPTION"] = $messages[$data["DESCRIPTION"]];

        $attributes = array(
            "description" => $data["DESCRIPTION"],
            "icon"        => $data["ICON"],
            "text"        => $data["LABEL"],
            "is_file"     => false
        );
        $this->appendBookmarkMeta($path, $attributes);
        if(basename($path) == "users") {
            $attributes["remote_indexation"] = "admin_search_users";
        }
        if(isSet($data["MIME"])) {
            $attributes["ajxp_mime"] = $data["MIME"];
        }
        if(isSet($data["METADATA"]) && is_array($data["METADATA"])){
            $attributes = array_merge($attributes, $data["METADATA"]);
        }
        $node = new Node($path, $attributes);
        $hasChildren = isSet($data["CHILDREN"]);
        if($hasChildren){
            $branch = new NodesList();
            $branch->setParentNode($node);
            foreach($data["CHILDREN"] as $cKey => $cData){
                $this->appendNodeFromTree($branch, $path."/".$cKey, $cData, $messages);
            }
            $nodesList->addBranch($branch);
        }else{
            $nodesList->addBranch($node);
        }

    }


    /**
     * @param ServerRequestInterface $requestInterface
     * @return NodesList
     */
    public function dispatchList(ServerRequestInterface $requestInterface){

        $httpVars           = $requestInterface->getParsedBody();
        $messages           = LocaleService::getMessages();
        $rootAttributes     = array();
        $rootNodes          = $this->mainTree;

        if(isSet($rootNodes["__metadata__"])){
            $rootAttributes = $rootNodes["__metadata__"];
            unset($rootNodes["__metadata__"]);
        }
        $parentName = "";
        $dir = trim(InputFilter::decodeSecureMagic((isset($httpVars["dir"]) ? $httpVars["dir"] : "")), " /");
        if (!empty($dir)) {
            $hash = null;
            if (strstr(urldecode($dir), "#") !== false) {
                list($dir, $hash) = explode("#", urldecode($dir));
            }
            if(isSet($httpVars['page'])){
                $hash = intval($httpVars['page']);
            }
            $splits = explode("/", $dir);
            $root = array_shift($splits);
            if (count($splits)) {
                $child = $splits[0];
                if (isSet($rootNodes[$root]["CHILDREN"][$child])) {
                    $childData = $rootNodes[$root]["CHILDREN"][$child];
                    return $this->forwardToManagers($requestInterface, $childData, "/" . $dir, $root, $splits, $hash);
                }
            } else {
                $parentName = "/".$root."/";
                $nodes = $rootNodes[$root]["CHILDREN"];
            }
        } else {
            $parentName = "/";
            $nodes = $rootNodes;
            if($this->currentUserIsGroupAdmin()){
                $rootAttributes["group_admin"]  = "1";
            }
        }
        if (isSet($httpVars["file"])) {
            // = LS with Find Node Position
            $parentName = $httpVars["dir"]."/";
            $nodes = array(basename($httpVars["file"]) =>  array("LABEL" => basename($httpVars["file"])));
        }
        $nodesList = new NodesList();
        if (isSet($nodes)) {
            $nodesList->setParentNode(new Node("/", $rootAttributes));
            if(!isSet($httpVars["file"])){
                $nodesList->initColumnsData("", "detail");
                $nodesList->appendColumn("settings.1", "ajxp_label");
                $nodesList->appendColumn("settings.102", "description");
            }
            foreach($nodes as $key => $data){
                $this->appendNodeFromTree($nodesList, $parentName . $key, $data, $messages);
            }
        }
        return $nodesList;

    }


    /**
     * @param array|ServerRequestInterface $requestInterface Full set of query parameters
     * @param string $rootPath Path to prepend to the resulting nodes
     * @param string $relativePath Specific path part for this function
     * @param string $paginationHash Number added to url#2 for pagination purpose.
     * @param string $findNodePosition Path to a given node to try to find it
     * @param string $aliasedDir Aliased path used for alternative url
     * @return NodesList A populated NodesList object, eventually recursive.
     */
    public function listNodes(ServerRequestInterface $requestInterface, $rootPath, $relativePath, $paginationHash = null, $findNodePosition = null, $aliasedDir = null)
    {
        return new NodesList();
    }
}
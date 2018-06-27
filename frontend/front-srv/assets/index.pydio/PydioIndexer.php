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
namespace Pydio\Access\Indexer\Implementation;

use Pydio\Access\Core\AbstractAccessDriver;
use Pydio\Access\Core\Model\Node;
use Pydio\Access\Core\Model\NodesList;
use Pydio\Access\Indexer\Core\AbstractSearchEngineIndexer;
use Pydio\Core\Exception\PydioException;
use Pydio\Core\Http\Client\MicroApi;
use Pydio\Core\Http\Message\UserMessage;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Services\ConfService;
use Pydio\Core\Controller\Controller;
use Pydio\Core\Services\LocaleService;
use Pydio\Core\Services\UsersService;
use Pydio\Core\Services\ApplicationState;
use Pydio\Core\Utils\Vars\InputFilter;
use Pydio\Core\Utils\Vars\StatHelper;
use Swagger\Client\Model\TreeNodeType;
use Swagger\Client\Model\TreeQuery;
use Swagger\Client\Model\TreeSearchRequest;

defined('PYDIO_EXEC') or die( 'Access not allowed');

/**
 * Encapsultion of the Zend_Search_Lucene component as a plugin
 * @package AjaXplorer_Plugins
 * @subpackage Index
 */
class PydioIndexer extends AbstractSearchEngineIndexer
{
    private $metaFields = [];
    private $indexContent = false;
    private $verboseIndexation = false;

    /**
     * @param ContextInterface $ctx
     * @param array $options
     */
    public function init(ContextInterface $ctx, $options = [])
    {
        parent::init($ctx, $options);
        set_include_path(get_include_path().PATH_SEPARATOR.PYDIO_INSTALL_PATH."/plugins/index.lucene");
        $metaFields = $this->getContextualOption($ctx, "index_meta_fields");
        if (!empty($metaFields)) {
            $this->metaFields = explode(",",$metaFields);
        }
        $this->indexContent = ($this->getContextualOption($ctx, "index_content") == true);
    }

    /**
     * @param ContextInterface $contextInterface
     * @param AbstractAccessDriver $accessDriver
     */
    public function initMeta(ContextInterface $contextInterface, AbstractAccessDriver $accessDriver)
    {
        $messages = LocaleService::getMessages();
        parent::initMeta($contextInterface, $accessDriver);
        if (!empty($this->metaFields) || $this->indexContent) {
            $metaFields = $this->metaFields;
            $el = $this->getXPath()->query("/indexer")->item(0);
            if ($this->indexContent) {
                if($this->indexContent) $metaFields[] = "ajxp_document_content";
                $data = ["indexed_meta_fields" => $metaFields,
                              "additionnal_meta_columns" => ["ajxp_document_content" => $messages["index.lucene.13"]]
                ];
                $el->setAttribute("indexed_meta_fields", json_encode($data));
            } else {
                $el->setAttribute("indexed_meta_fields", json_encode($metaFields));
            }
        }
        parent::init($contextInterface, $this->options);
    }


    public function searchAction(\Psr\Http\Message\ServerRequestInterface &$requestInterface, \Psr\Http\Message\ResponseInterface &$responseInterface) {

        $messages = LocaleService::getMessages();
        $actionName = $requestInterface->getAttribute("action");
        $httpVars   = $requestInterface->getParsedBody();
        /** @var ContextInterface $ctx */
        $ctx = $requestInterface->getAttribute("ctx");

        if ($actionName != "search") {
            throw new PydioException("Action not supported");
        }

        $PathPrefix = "";
        $Type = "";
        $Extension = "";
        $SizeRange = [];
        $DateRange = [];

        $textQuery = $httpVars["query"];
        $qParts = [];
        if (strpos($textQuery, ":") !== FALSE) {
            $split = array_map("trim", explode("AND", $textQuery));
            foreach ($split as $s) {
                list($k, $v) = explode(":", $s, 2);
                if (strpos($k, "ajxp_meta_") === 0)  {
                    $metaName = str_replace("ajxp_meta_", "", $k);
                    $qParts["Meta.users_meta." . $metaName] = $this->autoQuote($v);
                } else if ($k == "ajxp_mime") {
                    if ($v == "ajxp_folder") {
                        $Type = TreeNodeType::COLLECTION;
                    } else {
                        $Type = TreeNodeType::LEAF;
                        $Extension = $v;
                    }
                } else if ($k == "basename") {
                    $qParts["Basename"] = $this->autoQuote($v);
                } else if ($k == "ajxp_modiftime") {
                    $DateRange = $this->parseDateRange($v);
                } else if ($k == "ajxp_bytesize" && preg_match('/\[(.*) TO (.*)\]/', $v, $matches)) {
                    $SizeRange = [StatHelper::convertBytes($matches[1]), StatHelper::convertBytes($matches[2])];
                }
            }
        } else {
            $qParts["Basename"] = $this->autoQuote($textQuery);
        }
        $q2 = [];
        foreach($qParts as $qKey => $qPart){
            $q2[] = "+" . $qKey . ":" . $qPart;
        }
        $textQuery = implode(" ", $q2);

        $repoSlug = $ctx->getRepository()->getSlug();
        if (isSet($httpVars["current_dir"]) && !empty($httpVars["current_dir"]) && $httpVars["current_dir"] !== "/") {
            // Search in current dir only
            $PathPrefix = $repoSlug . "/" . trim( InputFilter::sanitize($httpVars["current_dir"], InputFilter::SANITIZE_DIRNAME), "/" ) . "/";
        } else if (isSet($httpVars["all_workspaces"])) {
            // Search in all repositories
            $PathPrefix = "";
        } else {
            // Search in current workspace by default
            $PathPrefix = $repoSlug . "/";
        }

        $nodesList = new NodesList();
        $x = new \Pydio\Core\Http\Response\SerializableResponseStream();
        $responseInterface = $responseInterface->withBody($x);
        $x->addChunk($nodesList);

        $api = MicroApi::GetSearchServiceApi();
        $request = new TreeSearchRequest();
        $request->setFrom(0);
        $request->setSize(10);
        $request->setDetails(true);
        $query = new TreeQuery();

        if(!empty($PathPrefix)) {
            $query->setPathPrefix([$PathPrefix]);
        }
        if(strpos($textQuery, ":") !== FALSE) {
            $query->setFreeString($textQuery);
        } else {
            $query->setFileName($textQuery);
        }
        if(!empty($Type)){
            $query->setType($Type);
        }
        if(!empty($SizeRange)) {
            $query->setMinSize($SizeRange[0]);
            $query->setMaxDate($SizeRange[1]);
        }
        if(!empty($DateRange)) {
            $query->setMinDate($DateRange[0]);
            $query->setMaxDate($DateRange[1]);
        }
        if(!empty($Extension)) {
            $query->setExtension($Extension);
        }
        $request->setQuery($query);
        $response = $api->nodes($request);
        if(!empty($response->getResults())) {
            foreach($response->getResults() as $treeNode) {
                $nodesList->addBranch(Node::fromApiNode($ctx, $treeNode));
            }
        }

    }

    protected function autoQuote($value) {
        if (strpos($value, " ") !== false){
            return "\"". $value . "\"";
        }
        return $value;
    }

    protected function parseDateRange($value) {
        switch ($value) {
            case "PYDIO_SEARCH_RANGE_TODAY":
                    $t1 = mktime(0, 0, 0, date('m'), date('d'), date('Y'));
                    $t2 = mktime(23, 59, 0, date('m'), date('d'), date('Y'));
                break;
            case "PYDIO_SEARCH_RANGE_YESTERDAY":
                    $t1 = mktime(0, 0, 0, date('m'), date('d') - 1, date('Y'));
                    $t2 = mktime(0, 0, 0, date('m'), date('d'), date('Y'));
                break;
            case "PYDIO_SEARCH_RANGE_LAST_WEEK":
                    $t1 = mktime(0, 0, 0, date('m'), date('d') - 7, date('Y'));
                    $t2 = mktime(23, 59, 0, date('m'), date('d'), date('Y'));
                break;
            case "PYDIO_SEARCH_RANGE_LAST_MONTH":
                    $t1 = mktime(0, 0, 0, date('m') - 1, date('d'), date('Y'));
                    $t2 = mktime(23, 59, 0, date('m'), date('d'), date('Y'));
                break;
            case "PYDIO_SEARCH_RANGE_LAST_YEAR":
                    $t1 = mktime(0, 0, 0, date('m'), date('d'), date('Y') - 1);
                    $t2 = mktime(23, 59, 0, date('m'), date('d'), date('Y'));
                break;
            default:
                if (preg_match('/\[(.*) TO (.*)\]/', $value, $matches)) {
                    $t1 = strtotime($matches[1]);
                    $t2 = strtotime($matches[2]);
                } else {
                    return [];
                }
                break;
        }
        return [$t1, $t2];

    }

}

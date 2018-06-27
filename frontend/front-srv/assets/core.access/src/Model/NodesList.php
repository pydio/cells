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
namespace Pydio\Access\Core\Model;

defined('PYDIO_EXEC') or die('Access not allowed');

use Pydio\Core\Utils\Vars\XMLFilter;
use Pydio\Core\Http\Response\CLISerializableResponseChunk;
use Pydio\Core\Http\Response\JSONSerializableResponseChunk;
use Pydio\Core\Http\Response\XMLDocSerializableResponseChunk;
use Pydio\Core\Serializer\NodeXML;
use Pydio\Core\Services\LocaleService;
use Pydio\Core\Utils\XMLHelper;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * Class NodesList
 * @package Pydio\Access\Core\Model
 */
class NodesList implements XMLDocSerializableResponseChunk, JSONSerializableResponseChunk, CLISerializableResponseChunk
{

    /**
     * @var Node
     */
    private $parentNode;
    /**
     * @var (Node|NodesList)[]
     */
    private $children = array();

    private $isRoot = true;

    private $paginationData;

    private $columnsDescription;

    /**
     * NodesList constructor.
     * @param string $rootPath
     */
    public function __construct($rootPath = "/"){
        // Create a fake parent node by default, without label
        $this->parentNode = new Node($rootPath, ["text" => "", "is_file" => false]);
    }

    /**
     * @param Node $parentNode
     */
    public function setParentNode(Node $parentNode){
        $this->parentNode = $parentNode;
    }

    /**
     * @return Node
     */
    public function getParentNode(){
        return $this->parentNode;
    }

    /**
     * @param Node|NodesList $nodeOrList
     */
    public function addBranch($nodeOrList){
        $this->children[] = $nodeOrList;
        if($nodeOrList instanceof NodesList){
            $nodeOrList->setRoot(false);
        }
    }

    /**
     * @return Node[]|NodesList[]
     */
    public function getChildren(){
        return $this->children;
    }

    /**
     * @param $path
     * @return Node
     */
    public function findChildByPath( $path ){
        return array_shift(array_filter($this->children, function($child) use ($path){
            return ($child instanceof Node && $child->getPath() == $path);
        }));
    }

    /**
     * @param $count
     * @param $currentPage
     * @param $totalPages
     * @param int $dirsCount
     * @param null $remoteSortAttributes
     */
    public function setPaginationData($count, $currentPage, $totalPages, $dirsCount = -1, $remoteSortAttributes = null){
        $this->paginationData = [
            'count' => $count,
            'current' => $currentPage,
            'total'   => $totalPages,
            'dirs'   => $dirsCount,
            'remoteSort' => $remoteSortAttributes
        ];
    }

    /**
     * @param $bool
     */
    public function setRoot($bool){
        $this->isRoot = $bool;
    }

    /**
     * @return string
     */
    public function toXML()
    {
        $buffer  = "";
        $buffer .= NodeXML::toXML($this->parentNode, false);
        if(isSet($this->paginationData)){
            $buffer .= $this->renderPaginationData(
                $this->paginationData["count"],
                $this->paginationData["current"],
                $this->paginationData["total"],
                $this->paginationData["dirs"],
                $this->paginationData["remoteSort"]);
        }
        $messages = LocaleService::getMessages();
        if(isSet($this->columnsDescription)){
            $xmlChildren = [];
            foreach($this->columnsDescription['columns'] as $column){
                if(!isSet($messages[$column["messageId"]])){
                    $column["messageString"] = $column["messageId"];
                    unset($column["messageId"]);
                }
                $xmlChildren[] = XMLHelper::toXmlElement("column", $column);
            }
            $xmlConfig = XMLHelper::toXmlElement("columns", $this->columnsDescription['description'], implode("", $xmlChildren));
            $xmlConfig = XMLHelper::toXmlElement("component_config", ["component" => "FilesList"], $xmlConfig);
            $buffer .= XMLHelper::toXmlElement("client_configs", [], $xmlConfig);
        }
        foreach ($this->children as $child){
            if($child instanceof NodesList){
                $buffer .= $child->toXML();
            }else{
                $buffer .= NodeXML::toXML($child, true);
            }
        }
        $buffer .= "</tree>";
        return $buffer;
    }

    /**
     * @param string $switchGridMode
     * @param string $switchDisplayMode
     * @param string $templateName
     * @return $this
     */
    public function initColumnsData($switchGridMode='', $switchDisplayMode='', $templateName=''){
        $this->columnsDescription = [
            'description' => ['switchGridMode' => $switchGridMode, 'switchDisplayMode' => $switchDisplayMode, 'template_name' => $templateName],
            'columns'     => []
        ];
        return $this;
    }

    /**
     * @param string $messageId
     * @param string $attributeName
     * @param string $sortType
     * @param string $width
     * @param array $additionalMeta
     * @return $this
     */
    public function appendColumn($messageId, $attributeName, $sortType='String', $width='', $additionalMeta = []){
        $col = [
            'messageId'     => $messageId,
            'attributeName' => $attributeName,
            'sortType'      => $sortType,
            'width'         => $width
        ];
        foreach($additionalMeta as $k => $v){
            $col[$k] = $v;
        }
        $this->columnsDescription['columns'][] = $col;
        return $this;
    }

    /**
     * @return mixed
     */
    public function jsonSerializableData()
    {
        $children = [];
        foreach ($this->children as $child){
            if($child instanceof NodesList){
                $children[$child->jsonSerializableKey()] = $child->jsonSerializableData();
            }else{
                $children[$child->getPath()] = $child;
            }
        }
        if(isSet($this->paginationData)){
            return [
                "pagination" => $this->paginationData,
                "data"      => ["node" => $this->parentNode, "children" => $children]
            ];
        }else{
            return [ "node" => $this->parentNode, "children" => $children];
        }
    }

    /**
     * @return string
     */
    public function jsonSerializableKey()
    {
        return $this->parentNode->getPath();
    }

    /**
     * @return string
     */
    public function getCharset()
    {
        return "UTF-8";
    }

    /**
     * @param OutputInterface $output
     * @return mixed
     */
    public function render($output)
    {
        // If recursive, back to JSON for the moment
        $recursive = false;
        foreach($this->children as $child){
            if($child instanceof NodesList){
                $recursive = true;
            }
        }
        if($recursive){
            $data = $this->jsonSerializableData();
            $output->writeln(json_encode($data, JSON_PRETTY_PRINT));
            return;
        }

        $table      = new Table($output);
        $headers    = [];
        $rows       = [];

        // Prepare Headers
        if(isSet($this->columnsDescription["columns"])){
            $messages = LocaleService::getMessages();
            foreach($this->columnsDescription["columns"] as $column){
                $colTitle = isSet($messages[$column["messageId"]]) ? $messages[$column["messageId"]] : $column["messageId"];
                $collAttr = $column["attributeName"];
                $headers[$collAttr] = $colTitle;
            }
        }else if(count($this->children)){
            /** @var Node $firstNode */
            $firstNode = $this->children[0];
            $headers["text"] = "Label"; //$firstNode->getLabel();
            $meta = $firstNode->getNodeInfoMeta();
            foreach($meta as $attName => $value){
                if ($attName === "text") {
                    continue;
                }else if($attName === "filename") {
                    $headers[$attName] = "Path";
                }else{
                    $headers[$attName] = ucfirst($attName);
                }
            }
        }else{
            $headers["h"] = "No results found";
        }
        $table->setHeaders(array_values($headers));

        // Prepare Rows
        foreach($this->children as $child){
            $row = [];
            foreach($headers as $attName => $label){
                if($attName === "text" || $attName === "ajxp_label") $row[] = $child->getLabel();
                else if($attName === "is_file") $row[] = $child->isLeaf() ? "True" : "False";
                else $row[] = $child->$attName;
            }
            $rows[] = $row;
        }
        $table->setRows($rows);

        // Render
        $table->render();
    }

    /**
     * Ouput the <pagination> tag
     * @static
     * @param integer $count
     * @param integer $currentPage
     * @param integer $totalPages
     * @param integer $dirsCount
     * @param null $remoteSortAttributes
     * @return string
     */
    private function renderPaginationData($count, $currentPage, $totalPages, $dirsCount = -1, $remoteSortAttributes = null)
    {
        $remoteSortString = "";
        if (is_array($remoteSortAttributes)) {
            foreach($remoteSortAttributes as $k => $v) $remoteSortString .= " $k='$v'";
        }
        return '<pagination count="'.$count.'" total="'.$totalPages.'" current="'.$currentPage.'" overflowMessage="'.$currentPage."/".$totalPages.'" icon="folder.png" openicon="folder_open.png" dirsCount="'.$dirsCount.'"'.$remoteSortString.'/>';
    }


}
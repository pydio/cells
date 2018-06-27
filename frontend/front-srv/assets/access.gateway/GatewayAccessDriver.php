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
namespace Pydio\Access\Driver\StreamProvider\Gateway;

use GuzzleHttp\Psr7\Stream;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Pydio\Access\Core\AbstractAccessDriver;
use Pydio\Access\Core\Exception\FileNotFoundException;
use Pydio\Access\Core\IPydioWrapperProvider;
use Pydio\Access\Core\Model\Node;
use Pydio\Access\Core\Model\NodesList;
use Pydio\Access\Core\Model\UserSelection;
use Pydio\Access\Core\RecycleBinManager;
use Pydio\Access\Driver\StreamProvider\S3\S3AccessDriver;
use Pydio\Core\Controller\HTMLWriter;
use Pydio\Core\Exception\PydioException;
use Pydio\Core\Http\Client\DexApi;
use Pydio\Core\Http\Client\MicroApi;
use Pydio\Core\Http\Response\FileReaderResponse;
use Pydio\Core\Http\Response\SerializableResponseStream;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\PluginFramework\Plugin;
use Pydio\Core\Services\LocaleService;
use Pydio\Core\Services\SessionService;
use Pydio\Core\Utils\FileHelper;
use Pydio\Core\Utils\Vars\InputFilter;
use Pydio\Core\Utils\Vars\PathUtils;
use Pydio\Core\Utils\Vars\StatHelper;
use Swagger\Client\ApiException;
use Swagger\Client\Model\IdmWorkspaceScope;
use Swagger\Client\Model\RestChangeRequest;
use Swagger\Client\Model\RestGetBulkMetaRequest;
use Zend\Diactoros\Response;
use Zend\Diactoros\Response\JsonResponse;

defined('PYDIO_EXEC') or die( 'Access not allowed');

/**
 * Class GatewayAccessDriver
 * @package Pydio\Access\Driver\StreamProvider\Gateway
 */
class GatewayAccessDriver extends AbstractAccessDriver implements IPydioWrapperProvider
{

    public function initRepository(ContextInterface $ctx)
    {
        // TODO: Implement initRepository() method.
    }

    /**
     * @param ServerRequestInterface $request
     * @param ResponseInterface $response
     * @throws ApiException
     * @throws FileNotFoundException
     * @throws \Exception
     * @throws \Pydio\Core\Exception\ForbiddenCharacterException
     */
    public function lsAction(ServerRequestInterface &$request, ResponseInterface &$response){

        /** @var ContextInterface $ctx */
        $ctx = $request->getAttribute("ctx");
        $action = $request->getAttribute("action");
        $httpVars = $request->getParsedBody();

        $selection = UserSelection::fromContext($ctx, $httpVars);
        if (!$selection->isEmpty()) {
            $this->filterUserSelectionToHidden($ctx, $selection->getFiles());
            RecycleBinManager::filterActions($action, $selection, $httpVars);
        }

        $nodesList = new NodesList();
        $dir = trim(InputFilter::sanitize($httpVars["dir"], InputFilter::SANITIZE_DIRNAME), "/") OR "";

        $metaData = [];
        $dirNode = $selection->nodeForPath("/" . $dir);
        $checkRecycle = false;
        $recycleNode = null;
        if (RecycleBinManager::recycleEnabled() && $dir == "") {
            if($selection->isEmpty()){
                $checkRecycle = true;
            }
            $dirNode->mergeMetadata(["repo_has_recycle" => RecycleBinManager::getRelativeRecycle()]);
        }
        try{
            $dirNode->setLeaf(false);
            $dirNode->loadNodeInfo(false, true, ($lsOptions["l"]?"all":"minimal"));

        } catch(ApiException $e){
            if($e->getCode() == 404) {
                throw new FileNotFoundException($dirNode->getPath());
            } else {
                throw $e;
            }
        }
        $nodesList->setParentNode($dirNode);

        $api = MicroApi::GetMetaServiceApi();
        $bulkRequest = new RestGetBulkMetaRequest();
        if($httpVars["versions"] === "true") {
            $bulkRequest->setVersions(true);
        }

        if(!$selection->isEmpty()){

            $selPath = trim($dir, "/") . "/" . $selection->getUniqueFile();
            $bulkRequest->setNodePaths([$ctx->getRepository()->getSlug() . "/" . $selPath]);

        } else {

            $bulkRequest->setNodePaths([$ctx->getRepository()->getSlug() . "/" . ltrim($dir . "/", "/")."*"]);

        }

        try{
            $result = $api->getBulkMeta($bulkRequest);
        } catch(ApiException $e){
            if ($e->getCode() == 404) {
                throw new FileNotFoundException($dirNode->getPath());
            } else {
                throw $e;
            }
        }
        $nodesResult = $result->getNodes();
        if ($nodesResult !== null ){
            $i = count($nodesResult);
            foreach($nodesResult as $idmNode){
                $node = Node::fromApiNode($ctx, $idmNode);
                if ($checkRecycle && $node->getPath() === RecycleBinManager::getRelativeRecycle()){
                    $recycleNode = $node;
                }
                if (StatHelper::isHidden($node->getLabel())){
                    continue;
                }
                if($bulkRequest->getVersions()){
                    $nodePath = $node->getPath();
                    $versionId = $node->versionId;
                    $node->index = "" . $i;
                    $node->readableSize = StatHelper::roundSize($node->bytesize);
                    $nodeUrl = str_replace($node->getUrl(), $nodePath, "/".$versionId);
                    $node->setUrl($nodeUrl);
                    $i--;
                } else {
                    $node->loadNodeInfo();
                }
                $nodesList->addBranch($node);
            }
        }
        if($checkRecycle && $recycleNode === null){
            // Create Recycle bin now!
            $recycleNode = new Node(RecycleBinManager::getRecyclePath(), [
                "ajxp_modiftime" => time(),
                "fonticon" => "delete",
                "mimestring_id" => 122,
                "ajxp_mime" => "ajxp_recycle",
            ]);
            $recycleNode->setLeaf(false);
            $recycleNode->setLabel(LocaleService::getMessages()[122]);
            @mkdir($recycleNode->getUrl());
            $nodesList->addBranch($recycleNode);
        }

        $body = new SerializableResponseStream();
        $body->addChunk($nodesList);
        $response = $response->withBody($body);

    }

    /**
     * Update node metadata with core FS metadata.
     * @param \Pydio\Access\Core\Model\Node $node
     * @param bool $parentNode
     * @param bool $details
     * @return void
     */
    public function loadNodeInfo(&$node, $parentNode = false, $details = false){
        $nodeName = basename($node->getPath());
        $metaData = $node->metadata;
        $isLeaf = $node->isLeaf();

        if(RecycleBinManager::recycleEnabled() && $node->getPath() === RecycleBinManager::getRelativeRecycle()) {
            $metaData["fonticon"] = "delete";
            $metaData["mimestring_id"] = 122;
            $metaData["ajxp_mime"] = "ajxp_recycle";
        } else {
            $mimeData = StatHelper::getMimeInfo($node, !$isLeaf);
            $metaData["mimestring_id"] = $mimeData[0];
            $metaData["icon"] = $mimeData[1];
            if(!empty($mimeData[2])){
                $metaData["fonticon"] = $mimeData[2];
            }
            if (!$isLeaf) {
                $metaData["ajxp_mime"] = "ajxp_folder";
            }
            if (StatHelper::isBrowsableArchive($nodeName)) {
                $metaData["ajxp_mime"] = "ajxp_browsable_archive";
            }
        }
        $node->mergeMetadata($metaData);
    }


    /**
     * Create a Presigned Url
     * @param ServerRequestInterface $request
     * @param ResponseInterface $response
     * @throws PydioException
     * @throws \Exception
     */
    public function getPresignedUrl(ServerRequestInterface $request, ResponseInterface &$response) {

        $ctx = $request->getAttribute('ctx');
        $userSelection = UserSelection::fromContext($ctx, $request->getParsedBody());
        if($userSelection->isEmpty()){
            throw new PydioException("User Selection Cannot be empty");
        }
        $node = $userSelection->getUniqueNode();
        $client = $this->getS3Service($ctx);
        $requestVars = $request->getParsedBody();

        $token = DexApi::getValidToken();

        $cmdName = 'GetObject';
        if ($requestVars['cmd'] === 'PUT') {
            $cmdName = 'PutObject';
        }
        $nodePath = $node->getRepository()->getSlug() . "/" . ltrim($node->getPath(), "/");
        $cmdParams = [
            'Bucket' => 'io',
            'Key' => $nodePath,
        ];
        if(isSet($requestVars['accept'])) {
            switch ($requestVars['accept']){
                case 'image/png':
                case 'image/jpeg':
                case 'image/bmp':
                case 'text/plain':
                    $cmdParams['ResponseContentType'] = $requestVars['accept'];
                    $cmdParams['ResponseContentDisposition'] = 'inline';
                    break;
                case 'audio/mp3':
                    $cmdParams['ResponseContentType'] = $requestVars['accept'];
                    break;
                case 'video/mp4':
                    $cmdParams['ResponseContentType'] = $requestVars['accept'];
                    break;
                case 'detect':
                    $cmdParams['ResponseContentType'] = FileHelper::detectMime($node->getUrl());
                    $cmdParams['ResponseContentDisposition'] = 'inline';
                default:
                    break;
            }
        }
        $cmd = $client->getCommand($cmdName, $cmdParams);
        $req = $client->createPresignedRequest($cmd, '+20 minutes');


        $response = new JsonResponse([
            'path'     => $nodePath,
            'signedUrl'=> (string)$req->getUri(),
            'validity' => '20 minutes',
            'jwt'      => $token,
        ]);
    }


    /**
     * Create a Presigned Url
     * @param ServerRequestInterface $request
     * @param ResponseInterface $response
     * @throws PydioException
     * @throws \Exception
     */
    public function downloadVersion(ServerRequestInterface $request, ResponseInterface &$response)
    {

        $ctx = $request->getAttribute('ctx');
        $userSelection = UserSelection::fromContext($ctx, $request->getParsedBody());
        if ($userSelection->isEmpty()) {
            throw new PydioException("User Selection Cannot be empty");
        }
        $node = $userSelection->getUniqueNode();
        $client = $this->getS3Service($ctx);
        $nodePath = $node->getRepository()->getSlug() . "/" . ltrim($node->getPath(), "/");
        $versionId = InputFilter::sanitize($request->getParsedBody()['versionId'], InputFilter::SANITIZE_NODE_UUID);
        if(empty($versionId)) {
            throw new PydioException("versionId Cannot be empty");
        }

        $command = $client->getCommand('GetObject', [
            'Bucket' => 'io',
            'Key'    => $nodePath,
            'VersionId' => $versionId
        ]);
        $command['@http']['stream'] = true;
        $result = $client->execute($command);

        $size = $result["ContentLength"];
        $body = $result["Body"];
        $headers = $result["@metadata"]["headers"];
        $attachmentName = basename($nodePath);


        $response = new Response($body, 200, $result["@metadata"]["headers"]);
        $response = HTMLWriter::responseWithAttachmentsHeaders($response, $attachmentName, $size);

    }

    /**
     * Create a Presigned Url
     * @param ServerRequestInterface $request
     * @param ResponseInterface $response
     * @throws PydioException
     * @throws \Exception
     */
    public function restoreVersion(ServerRequestInterface $request, ResponseInterface &$response)
    {

        $ctx = $request->getAttribute('ctx');
        $userSelection = UserSelection::fromContext($ctx, $request->getParsedBody());
        if ($userSelection->isEmpty()) {
            throw new PydioException("User Selection Cannot be empty");
        }
        $node = $userSelection->getUniqueNode();
        $client = $this->getS3Service($ctx);
        $nodePath = $node->getRepository()->getSlug() . "/" . ltrim($node->getPath(), "/");
        $versionId = InputFilter::sanitize($request->getParsedBody()['versionId'], InputFilter::SANITIZE_NODE_UUID);
        if(empty($versionId)) {
            throw new PydioException("versionId Cannot be empty");
        }

        $client->copy("io", $nodePath, "io", $nodePath, "private", ["version_id" => $versionId]);

        $response = new JsonResponse(["success" => true]);

    }

    /**
     * @param ServerRequestInterface $request
     * @param ResponseInterface $response
     * @throws ApiException
     * @throws \Exception
     */
    public function statHashAction(ServerRequestInterface $request, ResponseInterface &$response){

        /** @var ContextInterface $ctx */
        $ctx = $request->getAttribute("ctx");
        $action = $request->getAttribute("action");
        $httpVars = $request->getParsedBody();

        $selection = UserSelection::fromContext($ctx, $httpVars);
        $currentSlug = $ctx->getRepository()->getSlug();

        $nodes = $selection->buildNodes();
        $api = MicroApi::GetMetaServiceApi();
        $apiReq = new RestGetBulkMetaRequest();
        $paths = [];
        foreach ($nodes as $node){
            $paths[] = $currentSlug . "/" . trim($node->getPath(), "/");
        }
        $apiReq->setNodePaths($paths);
        $apiReq->setAllMetaProviders(false);
        $apiResp = $api->getBulkMeta($apiReq);
        $jsonResponse = new \stdClass();
        if($selection->isUnique()){
            if($apiResp->getNodes() != null && count($apiResp->getNodes()) === 1){
                $jsonResponse = Node::fromApiNode($ctx, $apiResp->getNodes()[0])->getStatObject();
            }
        } else {
            if($apiResp->getNodes() != null ) {
                foreach ($apiResp->getNodes() as $apiNode) {
                    $respNode = Node::fromApiNode($ctx, $apiNode);
                    $returnPath = $respNode->getPath();
                    $jsonResponse->$returnPath = $respNode->getStatObject();
                    $paths = array_filter($paths, function ($v) use ($returnPath, $currentSlug) {
                        return $currentSlug . $returnPath !== $v;
                    });
                }
            }
            foreach($paths as $remainingPath){
                $remaining = substr($remainingPath, strlen($currentSlug));
                $jsonResponse->$remaining = new \stdClass();
            }
        }

        $response = new JsonResponse($jsonResponse);

    }


    /**
     * @param ServerRequestInterface $request
     * @param ResponseInterface $responseInterface
     * @throws ApiException
     * @throws PydioException
     */
    public function changesAction(ServerRequestInterface $request, ResponseInterface &$responseInterface){

        $api = MicroApi::GetChangesServiceApi();
        $req = new RestChangeRequest();
        $httpVars = $request->getParsedBody();
        /** @var ContextInterface $ctx */
        $ctx = $request->getAttribute("ctx");
        $workspace = $ctx->getRepository();
        $pathFilter = $workspace->getSlug();
        $scope = $workspace->getScope();
        $attributes = $workspace->getIdmAttributes();
        if($scope !== IdmWorkspaceScope::ADMIN || empty($attributes) || !isSet($attributes["allowSync"]) || $attributes["allowSync"] !== true) {
            throw new PydioException("You are not allowed to sync this workspace");
        }

        $stream = $request->getParsedBody()["stream"] === "true";
        $seqId = 0;
        if(isSet($httpVars["seq_id"])){
            $seqId = intval($httpVars["seq_id"]);
        }
        if(isSet($httpVars["filter"])) {
            $pathFilter .= "/" . ltrim($httpVars["filter"], "/");
        }
        $req->setSeqId($seqId);
        $req->setFlatten(false);
        $req->setFilter($pathFilter);
        $postData = [
            "Flatten" => false,
            "SeqID"   => $seqId,
            "filter"  => $pathFilter,
        ];

        // Forward directly to API
        $headerParams = [];
        $_header_accept = $api->getApiClient()->selectHeaderAccept(['application/json']);
        if (!is_null($_header_accept)) {
            $headerParams['Accept'] = $_header_accept;
        }
        $headerParams['Content-Type'] = $api->getApiClient()->selectHeaderContentType(['application/json']);
        list($response, $statusCode, $httpHeader) = $api->getApiClient()->callApi(
            "/changes/".$seqId,
            'POST',
            $postData,
            $req,
            $headerParams,
            '\Swagger\Client\Model\RestChangeCollection',
            '/changes/'.$seqId
        );

        if(!$stream) {
            if(isSet($response->changes)){
                foreach($response->changes as &$change){
                    $this->updateTypes($change);
                }
            }
            if(isSet($response->last_seq)){
                $response->last_seq = intval($response->last_seq);
            }
            $responseInterface = new JsonResponse($response);
        } else {
            // TODO STREAM RESPONSE - BUILD FAKE STREAM AS OF NOW
            $responseInterface = $responseInterface->withHeader("Content-type", "text/plain");
            if(isSet($response->changes)){
                foreach($response->changes as $change){
                    $this->updateTypes($change);
                    $responseInterface->getBody()->write(json_encode($change) . "\n");
                }
            }
            if(isSet($response->last_seq)){
                $responseInterface->getBody()->write("LAST_SEQ:" . $response->last_seq);
            }
        }

    }

    /**
     * @param \StdClass $change
     */
    public function updateTypes(&$change) {
        $change->seq = intval($change->seq);
        if($change->node){
            $change->node->bytesize = intval($change->node->bytesize);
            $change->node->mtime = intval($change->node->mtime);
        }
    }


    /**
     * Convert a path (from the repository root) to a fully
     * qualified Pydio url like ajxp.protocol://repoId/path/to/node
     * @param String $path
     * @return String
     */
    public function getResourceUrl($path){}

    /**
     * Creates a directory
     * @param String $path
     * @param String $newDirName
     * @param bool $ignoreExists
     * @param bool $recursive
     * @return
     */
    public function mkDir($path, $newDirName, $ignoreExists=false, $recursive=false){}

    /**
     * Creates an empty file
     * @param Node $node
     * @param string $content
     * @param bool $forceCreation
     * @return
     */
    public function createEmptyFile(Node $node, $content = "", $forceCreation = false){}

    /**
     * @param ContextInterface $ctx
     * @param $nodePath
     * @param $nodeName
     * @param $isLeaf
     * @param $lsOptions
     * @return mixed
     */
    public function filterNodeName(ContextInterface $ctx, $nodePath, $nodeName, &$isLeaf, $lsOptions){}

}

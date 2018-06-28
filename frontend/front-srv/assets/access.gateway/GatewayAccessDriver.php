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
    
}

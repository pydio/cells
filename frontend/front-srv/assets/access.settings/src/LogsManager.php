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
use Pydio\Core\Controller\HTMLWriter;
use Pydio\Core\Exception\PydioException;
use Pydio\Core\Http\Client\MicroApi;
use Pydio\Log\Core\Logger;
use Swagger\Client\Model\ListLogRequestLogFormat;
use Swagger\Client\Model\LogListLogRequest;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * Class LogsManager
 * @package Pydio\Access\Driver\DataProvider\Provisioning
 */
class LogsManager
{
    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $response
     */
    public function logsAction(ServerRequestInterface &$requestInterface, ResponseInterface &$response){

        return $this->exportLogs($requestInterface, $response);

    }

    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $response
     */
    public function exportLogs(ServerRequestInterface &$requestInterface, ResponseInterface &$response){

        $body = $requestInterface->getParsedBody();
        $format = $body["format"];
        if(!in_array($format, ["CSV", "XLSX"])){
            throw new PydioException("Unsupported Format");
        }

        $req = (new LogListLogRequest())
            ->setFormat($format)
            ->setPage(0)
            ->setSize(10000)
            ->setQuery($body["query"]);

        $service = $body["service"];
        $api = MicroApi::GetLogServiceApi();
        $headerParams['Content-Type'] = $api->getApiClient()->selectHeaderContentType(['application/json']);

        $path = '/log/sys/export';
        if($service == 'audit'){
            $path = '/log/audit/export';
        }

        $filename = "pydio-logs";
        if(!empty($body["date"])){
            $filename .= "-" .$body["date"];
        } else {
            $filename .= "-filtered";
        }
        $filename .= ($format === 'CSV' ?  ".csv" : ".xlsx");

        try {
            list($resp, $statusCode, $httpHeader) = $api->getApiClient()->callApi(
                $path,
                'POST',
                [],
                $req,
                $headerParams,
                '\Swagger\Client\Model\RestLogMessageCollection',
                $path
            );
            $response = HTMLWriter::responseWithAttachmentsHeaders($response, $filename, strlen($resp), false, false);
            $response->getBody()->write($resp);

        } catch (ApiException $e) {
            switch ($e->getCode()) {
                case 200:
                    $data = $this->apiClient->getSerializer()->deserialize($e->getResponseBody(), '\Swagger\Client\Model\RestLogMessageCollection', $e->getResponseHeaders());
                    $e->setResponseObject($data);
                    break;
            }

            throw $e;
        }

        return $response;

    }
}

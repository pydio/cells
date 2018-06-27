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
namespace Pydio\Share\Http;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Pydio\Core\Exception\PydioException;
use Pydio\Core\Http\Middleware\SapiMiddleware;
use Pydio\Core\Http\Server;
use Pydio\Core\Model\Context;
use Pydio\Core\PluginFramework\PluginsService;
use Pydio\Core\Services\AuthService;
use Pydio\Core\Services\LocaleService;
use Pydio\Share\Model\ShareLink;
use Pydio\Share\ShareCenter;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * Class MinisiteRootMiddleware
 * @package Pydio\Share\Http
 */
class MinisiteRootMiddleware extends SapiMiddleware
{

    private $hash;

    /**
     * MinisiteRootMiddleware constructor.
     * @param $hash
     */
    public function __construct($hash){
        $this->hash = $hash;
    }

    /**
     * @param ServerRequestInterface $request
     * @param ResponseInterface $response
     * @param callable|null $next
     * @return ResponseInterface|null
     * @throws PydioException
     */
    public function handleRequest(ServerRequestInterface $request, ResponseInterface $response, callable $next = null){

        PluginsService::getInstance()->initActivePlugins();
        $shareCenter = ShareCenter::getShareCenter(Context::emptyContext());
        $data = $shareCenter->getShareStore()->loadShare($this->hash);
        $mess = LocaleService::getMessages();
        if($data === false){
            AuthService::disconnect();
            throw new PydioException($mess["share_center.166"]);
        }
        if(ShareLink::isShareExpired($data)){
            AuthService::disconnect();
            throw new PydioException($mess["share_center.165"]);
        }
        if(!empty($data) && is_array($data)){
            $request = $request->withAttribute("hash", $this->hash);
            $request = $request->withAttribute("data", $data);
        }else{
            throw new PydioException($mess["share_center.166"]);
        }
        $response = Server::callNextMiddleWare($request, $response, $next);
        $this->emitResponse($request, $response);
        return null;
        
    }
}
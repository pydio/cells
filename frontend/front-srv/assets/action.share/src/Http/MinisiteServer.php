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

use Psr\Http\Message\ServerRequestInterface;
use Pydio\Core\Http\Server;
use Pydio\Core\Model\Context;
use Pydio\Core\Services\ConfService;
use Pydio\Core\Services\ApplicationState;
use Pydio\Share\View\MinisiteRenderer;
use Zend\Diactoros\Response;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * Class ShareServer
 * @package Pydio\Share\Http
 */
class MinisiteServer extends Server
{

    /**
     * @var string
     */
    private $crtLinkHash;

    /**
     * @var bool
     */
    private $rest = false;

    /**
     * MinisiteServer constructor.
     * @param $base
     * @param $linkHash
     * @param bool $rest
     */
    public function __construct($base, $linkHash, $rest = false)
    {
        $this->crtLinkHash = $linkHash;
        $this->rest = $rest;
        parent::__construct($base, []);
        if($rest){
            ApplicationState::setSapiRestBase($base);
        }
    }

    protected function stackMiddleWares()
    {
        $this->middleWares->push(array("Pydio\\Share\\View\\MinisiteRenderer", "handleRequest"));
        $this->middleWares->push(array("Pydio\\Share\\Http\\MinisiteAuthMiddleware", "handleRequest"));
        $topMiddleware = new MinisiteRootMiddleware($this->crtLinkHash);
        $this->topMiddleware = $topMiddleware;
        $this->middleWares->push(array($this->topMiddleware, "handleRequest"));
    }

    /**
     * @param bool $rest
     * @return ServerRequestInterface
     */
    protected function initServerRequest($rest = false){

        $request = parent::initServerRequest();
        $body = $request->getParsedBody();
        if(is_array($_GET) && count($_GET)){
            $body = array_merge($body, $_GET);
            $request = $request->withParsedBody($body);
        }
        if($this->rest){
            $request = $request->withAttribute("rest", true);
        }
        return $request;

    }

    /**
     * @param $code
     * @param $message
     * @param $fichier
     * @param $ligne
     * @param $context
     */
    public function catchError($code, $message, $fichier, $ligne, $context)
    {
        $req = $this->getRequest();
        $resp = new Response();

        $setUrl = ConfService::getGlobalConf("FRONTEND_URL", "conf");
        $data = array();
        if (!empty($setUrl)) {
            $data["PYDIO_APPLICATION_BASE"] = $setUrl;
        }
        MinisiteRenderer::writeHtml($resp, Context::emptyContext(), $data, "", $message);
        $this->topMiddleware->emitResponse($req, $resp);
    }

}
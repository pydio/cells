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
namespace Pydio\Auth\Frontend;

require_once dirname(__FILE__)."/../authfront.session_login/SessionLoginFrontend.php";

use Duo;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Services\AuthService;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * Class DuoSecurityFrontend
 * @package Pydio\Auth\Frontend
 */
class DuoSecurityFrontend extends SessionLoginFrontend
{

    /**
     * Authfront implementation
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface $response
     * @param bool $isLast
     * @return bool
     */
    function tryToLogUser(\Psr\Http\Message\ServerRequestInterface &$request, \Psr\Http\Message\ResponseInterface &$response, $isLast = false)
    {

        if ($request->getAttribute("action") !== "login") {

            return false;

        }

        $testResponse = $this->logUserFromLoginAction($request, $response, $isLast);
        if(!$testResponse){
            return false;
        }
        /** @var ContextInterface $ctx */
        $ctx = $request->getAttribute("ctx");
        if(!$ctx->hasUser()){
            return false;
        }
        $uObject = $ctx->getUser();
        $duoActive = $uObject->getMergedRole()->filterParameterValue("authfront.duosecurity", "DUO_AUTH_ACTIVE", PYDIO_REPO_SCOPE_ALL, false);
        if(!$duoActive){
            return false;
        }


        require_once($this->getBaseDir() . "/vendor/autoload.php");
        $appUnique = $this->getContextualOption($ctx, "DUO_AUTH_AKEY");
        $iKey = $this->getContextualOption($ctx, "DUO_AUTH_IKEY");
        $sKey = $this->getContextualOption($ctx, "DUO_AUTH_SKEY");

        $res = Duo\Web::signRequest($iKey, $sKey, $appUnique, $uObject->getId());

        $uObject->getPersonalRole()->setParameterValue("authfront.duosecurity", "DUO_AUTH_LAST_SIGNATURE", $res);
        $uObject->setLock("duo_show_iframe");
        $uObject->save();

        return true;


    }


    /**
     * @param \Psr\Http\Message\ServerRequestInterface $requestInterface
     * @param \Psr\Http\Message\ResponseInterface $responseInterface
     * @throws \Exception
     * @throws \Pydio\Core\Exception\AuthRequiredException
     */
    public function postVerificationCode(\Psr\Http\Message\ServerRequestInterface $requestInterface, \Psr\Http\Message\ResponseInterface &$responseInterface)
    {

        if ($requestInterface->getAttribute("action") !== "duo_post_verification_code") {
            return;
        }

        $httpVars = $requestInterface->getParsedBody();
        /** @var \Pydio\Core\Model\ContextInterface $ctx */
        $ctx = $requestInterface->getAttribute("ctx");
        $u = $ctx->getUser();
        if ($u == null) return;
        $sigResponse = $httpVars["sig_response"];

        require_once($this->getBaseDir() . "/vendor/autoload.php");
        $appUnique = $this->getContextualOption($ctx, "DUO_AUTH_AKEY");
        $iKey = $this->getContextualOption($ctx, "DUO_AUTH_IKEY");
        $sKey = $this->getContextualOption($ctx, "DUO_AUTH_SKEY");

        $verif = Duo\Web::verifyResponse($iKey, $sKey, $appUnique, $sigResponse);

        if ($verif != null && $verif == $u->getId()) {
            $u->removeLock("duo_show_iframe");
            $u->save();
            $u->recomputeMergedRole();
            AuthService::updateSessionUser($u);
        } else {
            AuthService::disconnect();
            throw new \Pydio\Core\Exception\AuthRequiredException();
        }

    }


}
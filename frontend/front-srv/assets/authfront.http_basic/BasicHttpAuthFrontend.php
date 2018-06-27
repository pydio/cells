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

use Pydio\Core\Model\Context;
use Pydio\Core\Services\AuthService;
use Pydio\Auth\Frontend\Core\AbstractAuthFrontend;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * Class BasicHttpAuthFrontend
 * @package Pydio\Auth\Frontend
 */
class BasicHttpAuthFrontend extends AbstractAuthFrontend
{

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Message\ResponseInterface $response
     * @param bool $isLast
     * @return bool
     */
    function tryToLogUser(\Psr\Http\Message\ServerRequestInterface &$request, \Psr\Http\Message\ResponseInterface &$response, $isLast = false)
    {

        $serverData = $request->getServerParams();
        $localHttpLogin = $serverData["PHP_AUTH_USER"];
        $localHttpPassw = $serverData['PHP_AUTH_PW'];

        // mod_php
        if (isset($serverData['PHP_AUTH_USER'])) {
            $localHttpLogin = $serverData['PHP_AUTH_USER'];
            $localHttpPassw = $serverData['PHP_AUTH_PW'];

            // most other servers
        } elseif (isset($serverData['HTTP_AUTHORIZATION'])) {
            if (strpos(strtolower($serverData['HTTP_AUTHORIZATION']), 'basic') === 0) {
                list($localHttpLogin, $localHttpPassw) = explode(':', base64_decode(substr($serverData['HTTP_AUTHORIZATION'], 6)));
            }
            // Sometimes prepend a REDIRECT
        } elseif (isset($serverData['REDIRECT_HTTP_AUTHORIZATION'])) {

            if (strpos(strtolower($serverData['REDIRECT_HTTP_AUTHORIZATION']), 'basic') === 0) {
                list($localHttpLogin, $localHttpPassw) = explode(':', base64_decode(substr($serverData['REDIRECT_HTTP_AUTHORIZATION'], 6)));
            }

        }

        if ($isLast && empty($localHttpLogin)) {
            $response = $response->withHeader("WWW-Authenticate", "Basic realm=\"Pydio API\"")->withStatus(401);
            return true;
        }
        if (!isSet($localHttpLogin)) {
            return false;
        }

        try {

            $loggedUser = AuthService::logUser($localHttpLogin, $localHttpPassw, false, false);
            $request = $request->withAttribute("ctx", Context::contextWithObjects($loggedUser, null));
            return true;

        } catch (\Pydio\Core\Exception\LoginException $l) {
            if ($isLast && $l->getLoginError() !== -4) {
                $response = $response->withHeader("WWW-Authenticate", "Basic realm=\"Pydio API\"")->withStatus(401);
                return true;
            }
        }
        return false;

    }

} 
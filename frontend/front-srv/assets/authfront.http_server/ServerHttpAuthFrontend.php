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

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Pydio\Core\Model\Context;
use Pydio\Core\Services\AuthService;
use Pydio\Auth\Frontend\Core\AbstractAuthFrontend;
use Pydio\Core\Services\UsersService;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * Class ServerHttpAuthFrontend
 * @package Pydio\Auth\Frontend
 */
class ServerHttpAuthFrontend extends AbstractAuthFrontend
{

    /**
     * Try to authenticate the user based on various external parameters
     * Return true if user is now logged.
     *
     * @param ServerRequestInterface $request
     * @param ResponseInterface $response
     * @param bool $isLast Whether this is is the last plugin called.
     * @return bool
     */
    function tryToLogUser(ServerRequestInterface &$request, ResponseInterface &$response, $isLast = false)
    {

        $serverData = $request->getServerParams();
        $localHttpLogin = $serverData["REMOTE_USER"];
        $localHttpPassw = isSet($serverData['PHP_AUTH_PW']) ? $serverData['PHP_AUTH_PW'] : "";
        if (!isSet($localHttpLogin)) return false;

        if (!UsersService::userExists($localHttpLogin) && $this->pluginConf["CREATE_USER"] === true) {
            UsersService::createUser($localHttpLogin, $localHttpPassw, (isset($this->pluginConf["PYDIO_ADMIN"]) && $this->pluginConf["PYDIO_ADMIN"] == $localHttpLogin));
        }
        try {
            $logged = AuthService::logUser($localHttpLogin, $localHttpPassw, true);
            $request = $request->withAttribute("ctx", Context::contextWithObjects($logged, null));
            return true;
        } catch (\Pydio\Core\Exception\LoginException $l) {
        }
        return false;

    }

} 
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
use Pydio\Core\Exception\AuthRequiredException;
use Pydio\Core\Exception\PydioException;
use Pydio\Core\Http\Server;
use Pydio\Core\Model\Context;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Services\AuthService;
use Pydio\Core\Services\RepositoryService;
use Pydio\Core\Services\SessionService;
use Pydio\Core\Services\UsersService;
use Pydio\Core\Services\ApplicationState;
use Pydio\Core\Utils\Vars\InputFilter;
use Pydio\Share\Model\ShareLink;
use Pydio\Share\ShareCenter;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * Class MinisiteAuthMiddleware
 * @package Pydio\Share\Http
 */
class MinisiteAuthMiddleware
{
    /**
     * Parse request parameters
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     * @param callable $next
     * @return ResponseInterface
     * @throws AuthRequiredException
     * @throws PydioException
     */
    public static function handleRequest(ServerRequestInterface $requestInterface, ResponseInterface $responseInterface, callable $next = null){

        $sessions = ApplicationState::sapiUsesSession();
        $hash = $requestInterface->getAttribute("hash");
        $shareData = $requestInterface->getAttribute("data");

        if($sessions){
            session_name("AjaXplorer_Shared".str_replace(".","_",$hash));
            session_start();
            AuthService::disconnect();
        }

        if(isSet($shareData['TARGET_USERS'])){
            //$shareLink = ShareCenter::getShareCenter($requestInterface->getAttribute('ctx'))->getShareStore()->loadShareObject($hash);
            if(array_key_exists("u", $requestInterface->getParsedBody())){
                $targetUserId = $requestInterface->getParsedBody()["u"];
                if(isSet($shareData['TARGET_USERS'][$targetUserId])){
                    $userTemporaryLabel = $shareData['TARGET_USERS'][$targetUserId]['display'];
                }else{
                    throw new AuthRequiredException("User not recognized");
                }
            }else if(isSet($shareData['RESTRICT_TO_TARGET_USERS'])){
                throw new PydioException("User not recognized");
            }
        }

        if (!empty($shareData["PRELOG_USER"])) {

            $userId = $shareData["PRELOG_USER"];
            $userPassword = $shareData["PRELOG_USER"] . ShareLink::PasswordComplexitySuffix;
            $loggedUser = AuthService::logUser($userId, $userPassword, false);
            if(!empty($userTemporaryLabel)){
                $loggedUser->getPersonalRole()->setParameterValue("core.conf", "USER_TEMPORARY_DISPLAY_NAME", $userTemporaryLabel);
                if($sessions) SessionService::save(SessionService::USER_TEMPORARY_DISPLAY_NAME, $userTemporaryLabel);
            }
            $requestInterface = $requestInterface->withAttribute("ctx", Context::contextWithObjects($loggedUser, null));
            if($sessions){
                AuthService::updateSessionUser($loggedUser);
            }

        } else if(isSet($shareData["PRESET_LOGIN"])) {

            if($sessions) {

                SessionService::save(SessionService::PENDING_REPOSITORY_ID, $shareData["REPOSITORY"]);
                SessionService::save(SessionService::PENDING_FOLDER, "/");
                if(!empty($userTemporaryLabel)){
                    SessionService::save(SessionService::USER_TEMPORARY_DISPLAY_NAME, $userTemporaryLabel);
                }

            } else {
                $responseInterface = self::basicHttp($shareData["PRESET_LOGIN"], $requestInterface, $responseInterface);
                if ($responseInterface->getStatusCode() === 401) {
                    return $responseInterface;
                }
            }

        }

        /** @var ContextInterface $ctx */
        $ctx = $requestInterface->getAttribute("ctx");

        if (isSet($_GET["lang"])) {
            if ($ctx->hasUser()) {
                $ctx->getUser()->setPref("lang", $_GET["lang"]);
            } else {
                setcookie("PYDIO_lang", $_GET["lang"]);
            }
        }

        if($sessions){
            SessionService::save(SessionService::CTX_MINISITE_HASH, $hash);
            ApplicationState::setStateMinisite($hash);
        }
        if(!empty($ctx) && $ctx->hasUser() && isSet($shareData["REPOSITORY"])){
            if($sessions){
                SessionService::saveRepositoryId($shareData["REPOSITORY"]);
            }
            $uLock = $ctx->getUser()->getLock();
            if(empty($uLock)){
                $accessList = RepositoryService::contextUserRepositories($ctx->getUser(), true);
                $repoObject = $accessList->workspaceById($shareData["REPOSITORY"]);
                $ctx->setRepositoryObject($repoObject);
                $requestInterface = $requestInterface->withAttribute("ctx", $ctx);
            }
        }

        return Server::callNextMiddleWare($requestInterface, $responseInterface, $next);

    }

    /**
     * Perform Basic HTTP Auth
     * @param string $presetLogin
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     * @return ResponseInterface
     * @throws \Pydio\Core\Exception\LoginException
     */
    public static function basicHttp($presetLogin, ServerRequestInterface &$requestInterface, ResponseInterface $responseInterface){

        $serverData = $requestInterface->getServerParams();
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

        // Check that localHttpLogin == Hash ?

        if (empty($localHttpPassw)) {
            return $responseInterface->withHeader("WWW-Authenticate", "Basic realm=\"Please provide password\"")->withStatus(401);
        }

        try {

            $loggedUser = AuthService::logUser($presetLogin, $localHttpPassw, false, false);
            $requestInterface = $requestInterface->withAttribute("ctx", Context::contextWithObjects($loggedUser, null));
            return $responseInterface;

        } catch (\Pydio\Core\Exception\LoginException $l) {
            if ($l->getLoginError() !== -4) {
                return $responseInterface->withHeader("WWW-Authenticate", "Basic realm=\"Please provide a valid password\"")->withStatus(401);
            }else{
                throw $l;
            }
        }

    }

}
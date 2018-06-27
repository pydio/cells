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
 * The latest code can be found at <http://pyd.io/>.
 */

namespace Pydio\Editor\LibreOffice;

use JWT;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Pydio\Access\Core\Model\Node;
use Pydio\Access\Core\Model\NodesDiff;
use Pydio\Access\Core\Model\UserSelection;
use Pydio\Core\Exception\AuthRequiredException;
use Pydio\Core\Exception\PydioException;
use Pydio\Core\Http\Client\DexApi;
use Pydio\Core\Http\Message\UserMessage;
use Pydio\Core\Http\Response\SerializableResponseStream;
use Pydio\Core\Model\Context;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\PluginFramework\Plugin;
use Pydio\Core\Services\ApiKeysService;
use Pydio\Core\Services\ApplicationState;
use Pydio\Core\Services\AuthService;
use Pydio\Core\Services\ConfService;
use Pydio\Core\Services\LocaleService;
use Pydio\Core\Services\RepositoryService;
use Pydio\Core\Services\UsersService;
use Pydio\Core\Utils\Vars\InputFilter;
use Zend\Diactoros\Response\JsonResponse;

defined('PYDIO_EXEC') or die( 'Access not allowed');

/**
 * Extract the mimetype of a file and send it to the browser
 * @package AjaXplorer_Plugins
 * @subpackage Editor
 */
class Driver extends Plugin
{
    /**
     * @param ServerRequestInterface $request
     * @param ResponseInterface $response
     * @return bool|null
     * @throws AuthRequiredException
     */
    public function switchAction(ServerRequestInterface &$request, ResponseInterface &$response)
    {

        /** @var ContextInterface $ctx */
        $ctx = $request->getAttribute("ctx");
        $action = $request->getAttribute("action");
        $httpVars = $request->getParsedBody();

        $repository = $ctx->getRepository();
        $repositoryId = $repository->getId();

        $user = $ctx->getUser();

        if ($user === null && ConfService::getGlobalConf("ALLOW_GUEST_BROWSING", "auth")) {
            $authDriver = ConfService::getAuthDriverImpl();

            if (!$authDriver->userExists("guest")) {
                $guest = UsersService::createUser("guest", "");
                $guest->save();
            }
            $logged = AuthService::logUser("guest", null);
            $request = $request->withAttribute("ctx", Context::contextWithObjects($logged, null));
            return true;
        }

        $userId = $user->getId();
        if ($user->isAdmin() && isSet($httpVars["user_id"])) {
            $userId = InputFilter::sanitize($httpVars["user_id"], InputFilter::SANITIZE_EMAILCHARS);
        }

        $selection = UserSelection::fromContext($ctx, $httpVars);
        $destStreamURL = $selection->currentBaseUrl();
        $node = $selection->getUniqueNode();

        if (empty($userId) || empty($node) || empty($repository)) return false;

        if ($action == "libreoffice_get_file_url") {

            $node->loadNodeInfo();
            $uuid = $node->getUuid();
            $read_only = $node->node_readonly;

            $token = DexApi::getValidToken();

            $resp = [
                'uri' => "/wopi/files/".$uuid,
                'jwt'      => $token,
                'permission' => $read_only == "true" ? 'readonly' : 'edit'
            ];

            $response = $response->withHeader("Content-type", "application/json; charset=UTF-8");
            $response->getBody()->write(json_encode($resp));
        }

        return null;
    }

    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     * @throws PydioException
     */
    public function createEmptyAction(ServerRequestInterface $requestInterface, ResponseInterface &$responseInterface)
    {

        /** @var ContextInterface $ctx */
        $ctx = $requestInterface->getAttribute('ctx');
        $httpVars = $requestInterface->getParsedBody();
        $format = InputFilter::sanitize($httpVars["format"], InputFilter::SANITIZE_ALPHANUM);
        $templateDir = $this->getBaseDir() . DIRECTORY_SEPARATOR . 'resources' . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR;
        if (!file_exists($templateDir . 'empty.' . $format)) {
            throw new PydioException(LocaleService::getMessages()["libreoffice.15"]);
        }
        $dir = InputFilter::sanitize($httpVars["dir"], InputFilter::SANITIZE_DIRNAME);
        $baseUrl = $ctx->getUrlBase() . $dir;
        $i = 1;
        $message = LocaleService::getMessages()["libreoffice.13"];
        $newFileName = $message."." . $format;
        while (file_exists($baseUrl . "/" . $newFileName)) {
            $newFileName = $message."-$i." . $format;
            $i++;
        }
        copy($templateDir . 'empty.' . $format, $baseUrl . "/" . $newFileName);
        $nodesDiff = new NodesDiff();
        $nodesDiff->add(new Node($baseUrl . "/" . $newFileName));
        $userMessage = new UserMessage(LocaleService::getMessages()["libreoffice.14"]);
        $responseInterface = $responseInterface->withBody(new SerializableResponseStream([$nodesDiff, $userMessage]));

    }

    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     * @throws PydioException
     */
    public function listEmptyFormatsAction(ServerRequestInterface $requestInterface, ResponseInterface &$responseInterface){

        $templateDir = $this->getBaseDir() . DIRECTORY_SEPARATOR . 'resources' . DIRECTORY_SEPARATOR . 'templates';
        $messages = LocaleService::getMessages();
        $files = scandir($templateDir);
        $list = [];
        foreach($files as $file){
            if($file === '.' || $file === '..') continue;
            $ext = pathinfo($file, PATHINFO_EXTENSION);
            if(!isSet($messages["libreoffice.ext.".$ext])){
                continue;
            }
            $list[$ext] = $messages["libreoffice.ext.".$ext];
        }
        asort($list);
        $responseInterface = new JsonResponse($list);

    }
}

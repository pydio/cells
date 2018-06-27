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
namespace Pydio\Gui;

use Exception;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Pydio\Core\Exception\PydioException;
use Pydio\Core\Http\Client\MicroApi;
use Pydio\Core\Http\Client\SimpleStoreApi;
use Pydio\Core\Services\AuthService;
use Pydio\Core\Services\ConfService;
use Pydio\Core\Controller\Controller;
use Pydio\Core\Services\LocaleService;
use Pydio\Core\Services\UsersService;
use Pydio\Core\Services\ApplicationState;
use Pydio\Core\Utils\Vars\InputFilter;
use Pydio\Core\Utils\Vars\StringHelper;

use Pydio\Core\PluginFramework\Plugin;
use Pydio\Core\PluginFramework\PluginsService;
use Pydio\Mailer\Core\Mailer;
use Swagger\Client\Model\RestResetPasswordRequest;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * @package AjaXplorer_Plugins
 * @subpackage Gui
 * @class Pydio\Gui\UserGuiController
 * Handle the specific /user access point
 */
class UserGuiController extends Plugin
{

    /**
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     * @throws Exception
     */
    public function processUserAccessPoint(ServerRequestInterface &$requestInterface, ResponseInterface &$responseInterface)
    {
        $action = $requestInterface->getAttribute("action");
        $httpVars = $requestInterface->getParsedBody();
        $context = $requestInterface->getAttribute("ctx");

        switch ($action) {
            
            case "user_access_point":
                
                $action = "reset-password";
                $key = InputFilter::sanitize($httpVars["key"], InputFilter::SANITIZE_ALPHANUM);
                $_SESSION['OVERRIDE_GUI_START_PARAMETERS'] = array(
                    "REBASE" => "../../",
                    "USER_GUI_ACTION" => $action,
                    "USER_ACTION_KEY" => $key
                );
                $req = $requestInterface->withAttribute("action", "get_boot_gui");
                $responseInterface = Controller::run($req);
                unset($_SESSION['OVERRIDE_GUI_START_PARAMETERS']);

                break;
            
            case "reset-password-ask":

                $mailUId = InputFilter::sanitize($httpVars["email"], InputFilter::SANITIZE_EMAILCHARS);
                $api = MicroApi::GetTokenServiceApi();
                $resp = $api->resetPasswordToken($mailUId);
                if($resp->getSuccess()){
                    echo "SUCCESS";
                } else {
                    echo "ERROR";
                }

                break;
            
            case "reset-password":

                $keyString = InputFilter::sanitize($httpVars["key"], InputFilter::SANITIZE_NODE_UUID);
                $userUuid = InputFilter::sanitize($httpVars["user_id"], InputFilter::SANITIZE_EMAILCHARS);
                $newPass = $httpVars["new_pass"];
                $api = MicroApi::GetTokenServiceApi();
                $resp = $api->resetPassword((new RestResetPasswordRequest())
                    ->setUserLogin($userUuid)
                    ->setResetPasswordToken($keyString)
                    ->setNewPassword($newPass)
                );
                AuthService::disconnect();
                if($resp->getSuccess()){
                    echo "SUCCESS";
                } else {
                    echo "ERROR";
                }

                break;
            default:
                break;
        }
    }

    /**
     * @param $actionName
     * @param $args
     * @throws Exception
     */
    /*
    protected function processSubAction($actionName, $args)
    {
        switch ($actionName) {
            case "reset-password-ask":
                break;
            case "reset-password":
                break;
            default:
                break;
        }
    }
    */

}

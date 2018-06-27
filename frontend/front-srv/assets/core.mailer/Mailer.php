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

namespace Pydio\Mailer\Core;

use Exception;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Pydio\Core\Http\Client\MicroApi;
use Pydio\Core\Http\Message\UserMessage;
use Pydio\Core\Http\Response\SerializableResponseStream;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Model\UserInterface;
use Pydio\Core\PluginFramework\Plugin;
use Pydio\Core\Services\ConfService;
use Pydio\Core\Services\LocaleService;
use Pydio\Core\Services\UsersService;
use Pydio\Core\Utils\Vars\InputFilter;
use Pydio\Notification\Core\Notification;
use Swagger\Client\Model\MailerMail;
use Swagger\Client\Model\MailerUser;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * @package AjaXplorer_Plugins
 * @subpackage Core
 */
class Mailer extends Plugin
{
    /**
     * @param ContextInterface $ctx
     * @param $recipients
     * @param $subject
     * @param $body
     * @param null $from
     * @param null $imageLink
     * @param bool $useHtml
     */
    public function sendMail(ContextInterface $ctx, $recipients, $subject, $body, $templateId = "", $templateData = []) {
        $mail = new MailerMail();
        $mail->setSubject($subject);
        $mail->setContentPlain($body);
        $tos = [];
        foreach($recipients as $userId){
            $user = new MailerUser();
            $user->setUuid($userId);
            $tos[] = $user;
        }
        if($templateId != ""){
            $mail->setTemplateId($templateId);
            $mail->setTemplateData($templateData);
        }
        $mail->setTo($tos);
        MicroApi::GetMailerServiceApi()->send($mail);
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $requestInterface
     * @param \Psr\Http\Message\ResponseInterface $responseInterface
     * @throws Exception
     */
    public function sendMailAction(ServerRequestInterface &$requestInterface, ResponseInterface &$responseInterface)
    {
        $mess = LocaleService::getMessages();
        /** @var ContextInterface $ctx */
        $ctx = $requestInterface->getAttribute("ctx");
        $httpVars = $requestInterface->getParsedBody();

        $toUsers = array_map(function($email){
            return InputFilter::sanitize($email, InputFilter::SANITIZE_EMAILCHARS);
        }, $httpVars["emails"]);

        $from = $ctx->getUser()->getId();
        $imageLink = isSet($httpVars["link"]) ? $httpVars["link"] : null;

        $multipleSubjects = isSet($httpVars["subjects"]) && count($httpVars["subjects"]) === count($toUsers) ? $httpVars["subjects"] : null;
        $multipleMessages = isSet($httpVars["messages"]) && count($httpVars["messages"]) === count($toUsers) ? $httpVars["messages"] : null;

        $templateId = "";
        $templateData = [];
        if(!empty($httpVars["template_id"])){
            $templateId = $httpVars["template_id"];
            $templateData = json_decode($httpVars["template_data"], true);
            $templateData["Message"] = $httpVars["message"];
        }

        $sentMails = 0;
        if(isSet($multipleMessages) || isset($multipleSubjects)){
            // Email contents are different per user
            foreach($toUsers as $index => $toUser){
                $subject = isSet($multipleSubjects) ? $multipleSubjects[$index] : $httpVars["subject"];
                $body = isSet($multipleMessages) ? $multipleMessages[$index] : $httpVars["message"];
                $this->sendMail($ctx, [$toUser], $subject, $body, $templateId, $templateData);
                $sentMails ++;
            }
        }else{
            $subject = $httpVars["subject"];
            $body = $httpVars["message"];
            $this->sendMail($requestInterface->getAttribute("ctx"), $toUsers, $subject, $body, $templateId, $templateData);
            $sentMails = count($toUsers);
        }

        $x = new SerializableResponseStream();
        $responseInterface = $responseInterface->withBody($x);
        if($sentMails){
            $x->addChunk(new UserMessage(str_replace("%s", $sentMails, $mess["core.mailer.1"])));
        }else {
            $x->addChunk(new UserMessage($mess["core.mailer.2"], LOG_LEVEL_ERROR));
        }

    }

    /**
     * @param ContextInterface $ctx
     * @param null $fromAdress
     * @return array|mixed
     */
    public function resolveFrom(ContextInterface $ctx, $fromAdress = null)
    {
        $fromResult = array();
        if ($fromAdress != null) {
            $arr = $this->resolveAdresses($ctx, array($fromAdress));
            if (count($arr)) $fromResult = $arr[0];
        } else if ($ctx->hasUser()) {
            $arr = $this->resolveAdresses($ctx, array($ctx->getUser()));
            if (count($arr)) $fromResult = $arr[0];
        }
        if (!count($fromResult)) {
            $f = ConfService::getContextConf($ctx, "FROM", "mailer");
            $fName = ConfService::getContextConf($ctx, "FROM_NAME", "mailer");
            $fromResult = array("adress" => $f, "name" => $fName);
        }
        return $fromResult;
    }

    /**
     * @param array $recipients
     * @return array
     *
     */
    public function resolveAdresses(ContextInterface $ctx, $recipients)
    {
        $realRecipients = array();
        foreach ($recipients as $recipient) {
            if (is_string($recipient) && strpos($recipient, "/USER_TEAM/") === 0) {
                $confDriver = ConfService::getConfStorageImpl();
                if (method_exists($confDriver, "teamIdToUsers")) {
                    $newRecs = $confDriver->teamIdToUsers($ctx->getUser(), str_replace("/USER_TEAM/", "", $recipient));
                }
            }
        }
        if (isSet($newRecs)) {
            $recipients = array_merge($recipients, $newRecs);
        }
        // Recipients can be either UserInterface objects, either array(adress, name), either "adress".
        foreach ($recipients as $recipient) {
            if (is_object($recipient) && $recipient instanceof UserInterface) {
                $resolved = $this->abstractUserToAdress($recipient);
                if ($resolved !== false) {
                    $realRecipients[] = $resolved;
                }
            } else if (is_array($recipient)) {
                if (array_key_exists("adress", $recipient)) {
                    if (!array_key_exists("name", $recipient)) {
                        $recipient["name"] = $recipient["adress"];
                    }
                    $realRecipients[] = $recipient;
                }
            } else if (is_string($recipient)) {
                if (strpos($recipient, ":") !== false) {
                    $parts = explode(":", $recipient, 2);
                    $realRecipients[] = array("name" => $parts[0], "adress" => $parts[2]);
                } else {
                    if (UsersService::userExists($recipient)) {
                        $user = UsersService::getUserById($recipient, false);
                        $res = $this->abstractUserToAdress($user);
                        if ($res !== false) $realRecipients[] = $res;
                    } else if ($this->validateEmail($recipient)) {
                        $realRecipients[] = array("name" => $recipient, "adress" => $recipient);
                    }
                }
            }
        }

        return $realRecipients;
    }

    /**
     * @param UserInterface $user
     * @return array|bool
     */
    public function abstractUserToAdress(UserInterface $user)
    {
        // SHOULD CHECK THAT THIS USER IS "AUTHORIZED" TO AVOID SPAM
        $userEmail = $user->getPersonalAttribute("email");
        if (empty($userEmail)) {
            return false;
        }
        $displayName = $user->getPersonalAttribute("displayName", $user->getId());
        return array("name" => $displayName, "adress" => $userEmail);
    }


    /**
     * @param $email
     * @return bool
     */
    public function validateEmail($email)
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * @param $html
     * @return string
     */
    public static function simpleHtml2Text($html)
    {

        $html = preg_replace('/<br\>/', "\n", $html);
        $html = preg_replace('/<br>/', "\n", $html);
        $html = preg_replace('/<li>/', "\n * ", $html);
        $html = preg_replace('/<\/li>/', '', $html);
        return strip_tags($html);
    }

}

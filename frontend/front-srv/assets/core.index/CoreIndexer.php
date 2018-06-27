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

namespace Pydio\Access\Indexer\Core;

use Pydio\Access\Core\Model\Node;
use Pydio\Access\Core\Model\UserSelection;
use Pydio\Core\Exception\PydioException;
use Pydio\Core\Exception\UserInterruptException;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Model\UserInterface;
use Pydio\Core\Controller\Controller;
use Pydio\Core\PluginFramework\Plugin;
use Pydio\Core\Services\LocaleService;
use Pydio\Core\Services\ApplicationState;
use Pydio\Tasks\Schedule;
use Pydio\Tasks\Task;
use Pydio\Tasks\TaskService;

defined('PYDIO_EXEC') or die( 'Access not allowed');

/**
 * Class CoreIndexer
 * @package Pydio\Access\Indexer\Core
 */
class CoreIndexer extends Plugin {

    private $verboseIndexation = false;
    private $currentTaskId;

    /**
     * @param string $message
     */
    public function debug($message = ""){
        $this->logDebug("core.indexer", $message);
        if($this->verboseIndexation && ApplicationState::sapiIsCli()){
            print($message."\n");
        }
    }

    /**
     * @param \Psr\Http\Message\ServerRequestInterface $requestInterface
     * @param \Psr\Http\Message\ResponseInterface $responseInterface
     * @return null|\Psr\Http\Message\ResponseInterface
     * @throws \Exception
     * @throws \Pydio\Core\Exception\PydioException
     */
    public function applyAction(\Psr\Http\Message\ServerRequestInterface $requestInterface, \Psr\Http\Message\ResponseInterface &$responseInterface)
    {

        $actionName = $requestInterface->getAttribute("action");
        $httpVars   = $requestInterface->getParsedBody();
        /** @var \Pydio\Core\Model\ContextInterface $ctx */
        $ctx        = $requestInterface->getAttribute("ctx");
        $this->currentTaskId = $requestInterface->getAttribute("pydio-task-id") OR null;
        $mess       = LocaleService::getMessages();

        if ($actionName !== "index") return null;

        $userSelection = UserSelection::fromContext($ctx, $httpVars);
        if($userSelection->isEmpty()){
            $userSelection->addFile("/");
        }
        $nodes = $userSelection->buildNodes();

        if (isSet($httpVars["verboz"]) && $httpVars["verboz"] == "true") {
            $this->verboseIndexation = true;
        }
        // GIVE BACK THE HAND TO USER
        session_write_close();

        foreach($nodes as $node){

            $dir = $node->getPath() == "/" || is_dir($node->getUrl());
            $this->debug("TODO: SHOULD BE REWIRED TO DATASOURCE INDEXATION");

        }

        return null;
    }


} 
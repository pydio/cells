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
 * The latest code can be found at <https://pydio.com>.
 */
namespace Pydio\Share\Model;


use Pydio\Access\Core\Model\Node;
use Pydio\Access\Core\Model\Repository;
use Pydio\Access\Meta\Watch\WatchRegister;
use Pydio\Core\Model\ContextInterface;


use Pydio\Core\Services\PoliciesFactory;
use Pydio\Core\Services\RepositoryService;
use Pydio\Core\Services\UsersService;
use Pydio\Core\Services\ApplicationState;
use Pydio\Notification\Core\ActivityCenter;
use Pydio\Share\Store\ShareRightsManager;
use Pydio\Share\View\PublicAccessManager;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * Class CompositeShare
 * Object containing a repository and one or many links
 * @package Pydio\Share\Model
 */
class CompositeShare
{
    /**
     * @var string
     */
    protected $nodeId;

    /**
     * @var string
     */
    protected $repositoryId;

    /**
     * @var Repository
     */
    protected $repository;

    /**
     * @var ShareLink[]
     */
    protected $shareLinks = array();

    /**
     * @var array
     */
    protected $sharedEntries = null;

    /**
     * CompositeShare constructor.
     * @param $node
     * @param $repositoryId
     */
    public function __construct($nodeId, $repositoryId)
    {
        $this->nodeId = $nodeId;
        $this->repositoryId = $repositoryId;
    }

    /**
     * @param $entries array
     */
    public function setSharedEntries($entries){
        $this->sharedEntries = $entries;
    }

    /**
     * @return Repository
     */
    public function getRepository(){
        if(!isSet($this->repository)){
            $this->repository = RepositoryService::getRepositoryById($this->repositoryId);
        }
        return $this->repository;
    }

    /**
     * @param ShareLink $link
     */
    public function addLink($link){
        $this->shareLinks[] = $link;
    }

    /**
     * @return ShareLink[]
     */
    public function getLinks(){
        return $this->shareLinks;
    }

    /**
     * @return string
     */
    public function getRepositoryId(){
        return $this->repositoryId;
    }

    /**
     * @return bool
     */
    public function isInvalid(){
        return $this->getRepository() == null;
    }

    /**
     * @param WatchRegister|false $watcher
     * @param ShareRightsManager $rightsManager
     * @param PublicAccessManager $publicAccessManager
     * @param array $messages
     * @return array|false
     */
    public function toJson(ContextInterface $ctx, $rightsManager, $publicAccessManager, $messages){

        $elementWatch = false;
        $currentUser = $ctx->getUser();
        //$events = ActivityCenter::UserIsSubscribedToNode($ctx->getUser()->getId(), $this->nodeId);
        $elementWatch = false;// count($events) > 0;
        $policies = $this->getRepository()->getPolicies();


        if(!isSet($this->sharedEntries)) {
            $this->sharedEntries = $rightsManager->computeSharedRepositoryAccessRights($this->getRepositoryId(), true, $this->nodeId);
        }
        foreach ($this->sharedEntries as $index => $entry){
            if($entry["TYPE"] === "tmp_user") {
                $entry["TYPE"] = "user";
                $this->sharedEntries[$index] = $entry;
            }
            if($entry["USER_TEAM"] && strpos($entry["ID"], '/USER_TEAM/') !== 0) {
                $entry["ID"] = "/USER_TEAM/" . $entry["ID"];
                $this->sharedEntries[$index] = $entry;
            }
            if(!empty($entry["UPDATE_PASSWORD"])){
                unset($entry["UPDATE_PASSWORD"]);
                $this->sharedEntries[$index] = $entry;
            }
        }

        $jsonData = array(
            "repositoryId"  => $this->getRepositoryId(),
            "users_number"  => UsersService::countUsersForRepository($ctx, $this->getRepositoryId()),
            "label"         => $this->getRepository()->getDisplay(),
            "description"   => $this->getRepository()->getDescription(),
            "entries"       => $this->sharedEntries,
            "element_watch" => $elementWatch,
            "repository_url"=> ApplicationState::getWorkspaceShortcutURL($this->getRepository()) ."/",
        );
        if(PoliciesFactory::isOwner($policies, $currentUser)){
            $jsonData["canWrite"] = true;
        } else {
            $jsonData["canWrite"] = PoliciesFactory::subjectCanWrite($policies, $currentUser);
        }
        $jsonData["links"]  = array();
        foreach ($this->shareLinks as $shareLink) {
            $uniqueUser = $shareLink->getUniqueUser();
            $found = false;
            foreach($this->sharedEntries as $entry){
                if($entry["ID"] == $uniqueUser) $found = true;
            }
            if(!$found){
                // STRANGE, THE ASSOCIATED USER IS MISSING
                error_log("Found shareLink orphan with uniqueUser ".$uniqueUser);
                continue;
            }
            $jsonData["links"][$shareLink->getHash()] = $shareLink->getJsonData($publicAccessManager, $messages);
        }
        return $jsonData;

    }

}
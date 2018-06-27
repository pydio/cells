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

use DOMXPath;
use Exception;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Services\ApplicationState;
use Pydio\Core\Services\ConfService;
use Pydio\Core\Utils\Http\UserAgent;

use Pydio\Core\PluginFramework\Plugin;
use Pydio\Core\PluginFramework\PluginsService;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * Test user agent
 * @package AjaXplorer_Plugins
 * @subpackage Editor
 */
class MobileGuiPlugin extends Plugin
{
    public function performChecks()
    {
        if (!UserAgent::userAgentIsMobile()) throw new Exception("no");
    }

    /**
     * @param ContextInterface $ctx
     * @param $htmlContent
     */
    public function filterHTML(ContextInterface $ctx, &$htmlContent){

        if (ApplicationState::hasMinisiteHash()) {
            // Do not activate smart banner for minisites
            return;
        }

        $confs = $this->getConfigs();
        $iosAppId = $confs['IOS_APP_ID'];
        $iosAppIcon = $confs['IOS_APP_ICON'];
        $androidAppId = $confs['ANDROID_APP_ID'];
        $androidAppIcon = $confs['ANDROID_APP_ICON'];
        $meta = "    
            <meta name=\"apple-itunes-app\" content=\"app-id=$iosAppId\"/>
            <meta name=\"google-play-app\" content=\"app-id=$androidAppId\"/>
            <link rel=\"apple-touch-icon\" href=\"$iosAppIcon\">
            <link rel=\"android-touch-icon\" href=\"$androidAppIcon\" />
        ";
        $htmlContent = str_replace("</head>", "$meta\n</head>", $htmlContent);

    }

}

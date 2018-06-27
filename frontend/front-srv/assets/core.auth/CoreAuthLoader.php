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

namespace Pydio\Auth\Core;

use Exception;
use Pydio\Core\Model\Context;
use Pydio\Core\PluginFramework\CoreInstanceProvider;
use Pydio\Core\Services\ConfService;
use Pydio\Core\PluginFramework\Plugin;
use Pydio\Core\PluginFramework\PluginsService;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * Config loader overrider
 * @package AjaXplorer_Plugins
 * @subpackage Core
 */
class CoreAuthLoader extends Plugin implements CoreInstanceProvider
{
    /**
     * @var AbstractAuthDriver
     */
    protected static $authStorageImpl;

    /**
     * Return this plugin configs, merged with its associated "core" configs.
     * @return array
     */
    public function getConfigs()
    {
        $configs = parent::getConfigs();
        $configs["ALLOW_GUEST_BROWSING"] = !isSet($_SERVER["HTTP_PYDIO_FORCE_LOGIN"]) && ($configs["ALLOW_GUEST_BROWSING"] === "true" || $configs["ALLOW_GUEST_BROWSING"] === true || intval($configs["ALLOW_GUEST_BROWSING"]) == 1);
        return $configs;
    }

    /**
     * @param PluginsService|null $pluginsServiceInstance
     * @return null|AbstractAuthDriver|Plugin
     * @throws Exception
     */
    public function getImplementation($pluginsServiceInstance = null)
    {
        if ($pluginsServiceInstance === null) {
            $pluginsServiceInstance = PluginsService::getInstance(Context::emptyContext());
        }
        if (!isSet(self::$authStorageImpl)) {
            if (!isSet($this->pluginConf["MASTER_INSTANCE_CONFIG"])) {
                throw new Exception("Please set up at least one MASTER_INSTANCE_CONFIG in core.auth options");
            }
            $masterName = is_array($this->pluginConf["MASTER_INSTANCE_CONFIG"]) ? $this->pluginConf["MASTER_INSTANCE_CONFIG"]["instance_name"] : $this->pluginConf["MASTER_INSTANCE_CONFIG"];
            self::$authStorageImpl = ConfService::instanciatePluginFromGlobalParams($this->pluginConf["MASTER_INSTANCE_CONFIG"], "Pydio\\Auth\\Core\\AbstractAuthDriver", $pluginsServiceInstance);
        }
        return self::$authStorageImpl;
    }


}

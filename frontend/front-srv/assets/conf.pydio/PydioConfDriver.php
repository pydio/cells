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
namespace Pydio\Conf\Pydio;

use Pydio\Conf\Core\AbstractConfDriver;
use Pydio\Core\Http\Client\MicroApi;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Utils\Vars\OptionsHelper;
use Swagger\Client\Model\RestConfiguration;

defined('PYDIO_EXEC') or die( 'Access not allowed');

/**
 * Configuration stored in Pydio Backend
 * Class PydioConfDriver
 * @package Pydio\Conf\Pydio
 */
class PydioConfDriver extends AbstractConfDriver
{
    /**
     * @param string $pluginId
     * @param array $options
     */
    public function _loadPluginConfig($pluginId, &$options)
    {
        $options = (new MicroApi())->configGet(MicroApi::CONFIG_NAMESPACE_FRONTEND, "plugin/$pluginId");
    }

    /**
     *
     * @param String $pluginId
     * @param String $options
     */
    public function _savePluginConfig($pluginId, $options)
    {
        (new MicroApi())->configSet(MicroApi::CONFIG_NAMESPACE_FRONTEND, "plugin/$pluginId", $options);
    }

}

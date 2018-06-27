<?php
/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>, mosen
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
namespace Pydio\Log\Core;

use Pydio\Core\PluginFramework\Plugin;

defined('PYDIO_EXEC') or die( 'Access not allowed');

if (!defined('LOG_LEVEL_DEBUG')) {
    define("LOG_LEVEL_DEBUG", "Debug");
    define("LOG_LEVEL_INFO", "Info");
    define("LOG_LEVEL_NOTICE", "Notice");
    define("LOG_LEVEL_WARNING", "Warning");
    define("LOG_LEVEL_ERROR", "Error");
}

/**
 * @package AjaXplorer_Plugins
 * @subpackage Core
 * @class AbstractLogDriver
 * @author mosen
 * @abstract
 * Abstraction of the logging system
 * The output stream/file/device will be implemented by the plugin which extends this class.
 * The object has a chance to open its stream or file from the init() method. all subsequent calls assume
 * the availability of the stream or file.
 */
abstract class AbstractLogDriver extends Plugin
{
    /**
     * Driver type
     *
     * @var String type of driver
     */
    public $driverType = "log";

    /**
     * Write an entry to the log.
     *
     * @param String $level Log severity: one of LOG_LEVEL_* (DEBUG,INFO,NOTICE,WARNING,ERROR)
     * @param String $ip The client ip
     * @param String $user The user login
     * @param String $source The source of the message
     * @param String $prefix  The prefix of the message
     * @param String $message The message to log
     *
     */
    public function write2($level, $ip, $user, $repoId, $source, $prefix, $message, $nodePathes = array())
    {
        //for backward compatibility
        $this->write($source."\t".$prefix."\t".$message, $level);
    }

    /**
     * List available log files in XML
     *
     * @param string $nodeName
     * @param null $year
     * @param null $month
     * @param string $rootPath
     * @return \String[]
     */
    abstract public function listLogFiles($nodeName = "file", $year = null, $month = null, $rootPath = "/logs");

    /**
     * List log contents in XML
     *
     * @param $parentDir
     * @param String $date Assumed to be m-d-y format.
     * @param string $nodeName
     * @param string $rootPath
     * @param int $cursor
     * @return
     */
    abstract public function listLogs($parentDir, $date, $nodeName = "log", $rootPath = "/logs", $cursor = -1);

}

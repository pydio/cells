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
namespace Pydio\Log\Core;

use Pydio\Access\Core\Model\UserSelection;
use Pydio\Core\Model\Context;
use Pydio\Core\Model\ContextInterface;

use Pydio\Core\Services\ConfService;
use Pydio\Core\PluginFramework\Plugin;
use Pydio\Core\PluginFramework\PluginsService;
use Pydio\Core\Services\UsersService;

defined('PYDIO_EXEC') or die( 'Access not allowed');

define("LOG_LEVEL_DEBUG", "Debug");
define("LOG_LEVEL_INFO", "Info");
define("LOG_LEVEL_NOTICE", "Notice");
define("LOG_LEVEL_WARNING", "Warning");
define("LOG_LEVEL_ERROR", "Error");

/**
 * Class Logger
 * @package Pydio\Log\Core
 */
class Logger extends Plugin
{
    /**
     * @var AbstractLogDriver
     */
    protected $pluginInstance;
    /**
     * @var AbstractLogDriver
     */
    protected static $loggerInstance;
    protected static $globalOptions;

    /** @var  ContextInterface */
    private static $context;

    /**
     * @param ContextInterface $ctx
     * @param array $options
     */
    public function init(ContextInterface $ctx, $options = [])
    {
        parent::init($ctx, $options);
        self::$globalOptions = $this->pluginConf;
        $pService = PluginsService::getInstance($ctx);
        $this->pluginInstance = ConfService::instanciatePluginFromGlobalParams($this->pluginConf["UNIQUE_PLUGIN_INSTANCE"], "Pydio\\Log\\Core\\AbstractLogDriver", $pService);
        if ($this->pluginInstance != false) {
            $pService->setPluginUniqueActiveForType("log", $this->pluginInstance->getName(), $this->pluginInstance);
        }
        self::$loggerInstance = $this->pluginInstance;
        self::$context =  $ctx;
    }

    /**
     * @return AbstractLogDriver
     */
    public function getLoggerInstance(){
        return $this->pluginInstance;
    }

    /**
     * @param ContextInterface $context
     */
    public static function updateContext($context){
        self::$context = $context;
    }

    /**
     * Use current logger instance and write a message at the desired loglevel
     * @static
     * @param string $level The log level
     * @param string $source The source of the message (plugin id or classname)
     * @param string $prefix A quick description
     * @param array $messages An array of messages (string or array).
     */
    public static function log2($level, $source, $prefix, $messages = [])
    {
        $res = "";
        $i = 0;
        $nodePathes = [];
        foreach ($messages as $value) {
            if($i > 0) $res .= "\t";
            $i++;

            if (is_string($value)) {
                $res .= $value;
            } else if (is_array($value) && count($value)) {
                $res .= self::arrayToString($value);
                if(isSet($value["files"])) {
                    if(is_array($value["files"])) $nodePathes = $value["files"];
                    else $nodePathes[] = $value["files"];
                }
            } else if (!empty($value)) {
                $res .= print_r($value, true);
            }
        }
        $res = str_replace(["\r\n", "\n", "\r"], ' ', $res);
        $ip = self::getClientAdress();
        $user = self::getLoggedUser();
        $logger = self::getInstance();
        $repoId = (!empty(self::$context) && self::$context->hasRepository()) ? self::$context->getRepositoryId() : "no-repository";
        if ($logger != null) {
            try {
                $logger->write2($level, $ip, $user, $repoId, $source, $prefix, $res, $nodePathes);
                if ( $level == LOG_LEVEL_ERROR && self::$globalOptions["ERROR_TO_ERROR_LOG"] === true) {
                    error_log("[PYDIO] IP $ip | user $user | $level | $prefix | from $source | ".$res);
                }
            } catch (\Exception $e) {
                error_log("Exception while logging");
                error_log("Log message was : IP => $ip | user => $user | level => $level | source => $source | prefix => $prefix | message => ".$res);
                error_log("Exception is:".$e->getMessage());
                error_log("In ".$e->getFile()." line ".$e->getLine());
                error_log($e->getTraceAsString());
            }
        } else {
            error_log("No logger");
            error_log("Message was : IP => $ip | user => $user | level => $level | source => $source | prefix => $prefix | message => ".$res);
        }
    }

    /**
     * Use current logger instance and write a debug message
     * @static
     * @param string $source  The source of the message (plugin id or classname)
     * @param string $prefix  A quick description
     * @return void
     */
    public static function debug($source, $prefix = "")
    {
        if(!class_exists("Pydio\\Core\\Services\\ConfService")) return ;
        if(!ConfService::getConf("SERVER_DEBUG")) return ;
        if (func_num_args() <= 2) {
            self::notice(__CLASS__, "Deprecated", "You are calling debug() with ".func_num_args()." arguments, please use at least 3");
            $args = [];
            $args[0] = $prefix;
            self::log2(LOG_LEVEL_DEBUG, "Deprecated", $source, $args);
        } else {
            $args = func_get_args();
            array_shift($args);
            array_shift($args);
            self::log2(LOG_LEVEL_DEBUG, $source, $prefix, $args);
        }
    }

    /**
     * Use current logger instance and write an info message
     * @static
     * @param string $source  The source of the message (plugin id or classname)
     * @param string $prefix  A quick description
     * @param string|array $messages Variable number of message args (string or array).
     * @return void
     */
    public static function info($source, $prefix, $messages)
    {
        $args = func_get_args();
        array_shift($args);
        array_shift($args);
        self::log2(LOG_LEVEL_INFO, $source, $prefix, $args);
    }


    /**
     * Use current logger instance and write a notice message
     * @static
     * @param string $source  The source of the message (plugin id or classname)
     * @param string $prefix  A quick description
     * @param string|array $messages Variable number of message args (string or array).
     * @return void
     */
    public static function notice($source, $prefix, $messages)
    {
        $args = func_get_args();
        array_shift($args);
        array_shift($args);
        self::log2(LOG_LEVEL_NOTICE, $source, $prefix, $args);
    }

    /**
     * Use current logger instance and write a warning message
     * @static
     * @param string $source  The source of the message (plugin id or classname)
     * @param string $prefix  A quick description
     * @param string|array $messages Variable number of message args (string or array).
     * @return void
     */
    public static function warning($source, $prefix, $messages)
    {
        $args = func_get_args();
        array_shift($args);
        array_shift($args);
        self::log2(LOG_LEVEL_WARNING, $source, $prefix, $args);
    }

    /**
     * Use current logger instance and write an error message
     * @static
     * @param string $source  The source of the message (plugin id or classname)
     * @param string $prefix  A quick description
     * @param string|array $messages Variable number of message args (string or array).
     * @return void
     */
    public static function error($source, $prefix, $messages)
    {
        $args = func_get_args();
        array_shift($args);
        array_shift($args);
        self::log2(LOG_LEVEL_ERROR, $source, $prefix, $args);
    }

    /**
     * Send an action log message to the current logger instance.
     * @deprecated Deprecated since version 5.0.4
     * @static
     * @param string $action
     * @param string|array $params
     * @return void
     */
    public static function logAction($action, $params= [])
    {
        self::notice(__CLASS__, "Deprecated", "Function logAction() is deprecated, use info() instead");
        $args = [];
        $args[0] = $params;
        self::log2(LOG_LEVEL_INFO, "Deprecated", $action, $args);
    }

    /**
     * Return the client IP adress
     * @static
     * @return String client IP adress
     */
    public static function getClientAdress()
    {
        if (isSet(self::$globalOptions["CUSTOM_HEADER_FOR_IP"])){
            $hName = "HTTP_".strtoupper(str_replace("-", "_", self::$globalOptions["CUSTOM_HEADER_FOR_IP"]));
            if(isSet($_SERVER[$hName])) {
                return $_SERVER[$hName];
            }
        }
        if (isSet($_SERVER['REMOTE_ADDR'])) {
            return $_SERVER['REMOTE_ADDR'];
        }
        if (php_sapi_name() == "cli") {
            return "PHP_CLI";
        }
        return "Unknown Origin";
    }

    /**
     * Return the user if it exists
     * @static
     * @return String client login
     */
    public static function getLoggedUser()
    {
        $user = "No User";
        if (UsersService::usersEnabled()) {
            if (self::$context !== null && self::$context->hasUser()) {
                $user = self::$context->getUser()->getId();
            } else {
                $user = "shared";
            }
        }
        return $user;
    }

    /**
     * Format an array as a readable string
     *
     * @param array $params
     * @return String readable list of parameters.
     */
    public static function arrayToString($params)
    {
        $st = "";
        $index=0;
        foreach ($params as $key=>$value) {
            $index++;
            if (!is_numeric($key)) {
                $st.="$key=";
            }
            if (is_string($value) || is_numeric($value)) {
                $st .= $value;
            } else if (is_array($value)) {
                $st .= self::arrayToString($value);
            } else if (is_bool($value)) {
                $st .= ($value?"true":"false");
            } else if (is_object($value) && $value instanceof UserSelection) {
                $st .= self::arrayToString($value->getFiles());
            }

            if ($index < count($params)) {
                if (is_numeric($key)) {
                    $st.=",";
                } else {
                    $st.=";";
                }
            }
        }
        return $st;
    }

    /**
     * returns an instance of the AbstractLogDriver object
     *
     * @access public
     * @static
     *
     * @return AbstractLogDriver an instance of the Logger object
     */
    public static function getInstance()
    {
        if (!isset(self::$loggerInstance)) {
            $ctx = Context::emptyContext();
            $p = PluginsService::getInstance($ctx)->getPluginByTypeName("core", "log");
            if(is_object($p)) {
                $p->init($ctx, []);
            }
        }
        return self::$loggerInstance;
    }

}

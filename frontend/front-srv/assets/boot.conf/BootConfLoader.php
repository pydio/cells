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

namespace Pydio\Conf\Boot;

use DOMXPath;
use Exception;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Pydio\Conf\Core\AbstractConfDriver;
use Pydio\Conf\Core\CoreConfLoader;
use Pydio\Core\Exception\PydioException;
use Pydio\Core\Http\Client\DexApi;
use Pydio\Core\Http\Client\MicroApi;
use Pydio\Core\Model\Context;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\PluginFramework\PluginsService;
use Pydio\Core\Services\ApplicationState;
use Pydio\Core\Services\AuthService;
use Pydio\Core\Services\ConfService;
use Pydio\Core\Services\LocaleService;
use Pydio\Core\Services\RolesService;
use Pydio\Core\Services\SessionService;
use Pydio\Core\Services\UsersService;
use Pydio\Core\Utils\FileHelper;
use Pydio\Core\Utils\TextEncoder;
use Pydio\Core\Utils\Vars\InputFilter;
use Pydio\Core\Utils\Vars\OptionsHelper;
use Pydio\Core\Utils\Vars\StringHelper;
use Pydio\Core\Utils\Vars\VarsFilter;
use Pydio\Core\Utils\Vars\XMLFilter;
use Swagger\Client\ApiException;
use Zend\Diactoros\Response\JsonResponse;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * Implementation of the configuration driver on serial files
 */
class BootConfLoader extends AbstractConfDriver
{
    private static $internalConf;

    /**
     * @return mixed
     */
    private function getInternalConf()
    {
        if (!isSet(BootConfLoader::$internalConf)) {
            if (file_exists(PYDIO_CONF_PATH . "/bootstrap_plugins.php")) {
                include(PYDIO_CONF_PATH . "/bootstrap_plugins.php");
                if (isSet($PLUGINS)) {
                    BootConfLoader::$internalConf = $PLUGINS;
                }
            } else {
                BootConfLoader::$internalConf = array();
            }
        }
        return BootConfLoader::$internalConf;
    }

    /**
     * @param ContextInterface $ctx
     * @param array $options
     */
    public function init(ContextInterface $ctx, $options = [])
    {
        parent::init($ctx, $options);
        try {
            $dir = $this->getPluginWorkDir(true);
            if (!is_file($dir . DIRECTORY_SEPARATOR . "server_uuid")) {
                file_put_contents($dir . DIRECTORY_SEPARATOR . "server_uuid", md5(json_encode($_SERVER)));
            }
        } catch (Exception $e) {
            die("Impossible write into the DATA_PATH folder: Make sure to grant write access to this folder for your webserver!");
        }
    }

    public function loadManifest()
    {
        parent::loadManifest();
        if (!ApplicationState::detectApplicationFirstRun()) {
            $actions = $this->getXPath()->query("server_settings|registry_contributions");
            foreach ($actions as $ac) {
                $ac->parentNode->removeChild($ac);
            }
            $this->reloadXPath();
        }
    }

    /**
     * @return string
     * @throws Exception
     */
    public function getServerUuid()
    {
        return file_get_contents($this->getPluginWorkDir() . DIRECTORY_SEPARATOR . "server_uuid");
    }

    /**
     * @param $fullManifest
     * @return string
     */
    public function printFormFromServerSettings($fullManifest)
    {

        $xmlString = "<admin_data>";
        $xPath = new DOMXPath($fullManifest->ownerDocument);
        $url = ApplicationState::detectServerURL(true);

        $loadedValues = array(
            "ENDPOINT_REST_API" => rtrim($url, "/") . "/a"
        );
        foreach ($loadedValues as $pName => $pValue) {
            $vNodes = $xPath->query("server_settings/global_param[@name='$pName']");
            if (!$vNodes->length) continue;
            $vNodes->item(0)->setAttribute("default", $pValue);
        }
        $allParams = XMLFilter::resolveKeywords($fullManifest->ownerDocument->saveXML($fullManifest));
        $allParams = str_replace('type="plugin_instance:', 'type="group_switch:', $allParams);

        $xmlString .= $allParams;
        $xmlString .= "</admin_data>";
        return $xmlString;

    }

    /**
     * Transmit to the ajxp_conf load_plugin_manifest action
     * @param \Psr\Http\Message\ServerRequestInterface $requestInterface
     * @param \Psr\Http\Message\ResponseInterface $responseInterface
     */
    public function loadInstallerForm(ServerRequestInterface $requestInterface, ResponseInterface &$responseInterface)
    {
        $httpVars = $requestInterface->getParsedBody();
        if (isSet($httpVars["lang"])) {
            LocaleService::setLanguage($httpVars["lang"]);
        }
        $fullManifest = $this->getManifestRawContent("", "xml");
        $xmlString = $this->printFormFromServerSettings($fullManifest);
        $doc = new \Pydio\Core\Http\Message\XMLDocMessage($xmlString);
        $x = new \Pydio\Core\Http\Response\SerializableResponseStream([$doc]);
        $responseInterface = $responseInterface->withBody($x);
    }

    /**
     * Transmit to the ajxp_conf load_plugin_manifest action
     * @param ServerRequestInterface $requestInterface
     * @param ResponseInterface $responseInterface
     */
    public function applyInstallerForm(ServerRequestInterface $requestInterface, ResponseInterface &$responseInterface)
    {
        $data = array();
        OptionsHelper::parseStandardFormParameters(
            $requestInterface->getAttribute("ctx"),
            $requestInterface->getParsedBody(),
            $data, "");
        $this->sendInstallResult(null, $htContent, $responseInterface);

    }

    /**
     * Send output to the user.
     * @param String $htAccessToUpdate file path
     * @param String $htContent file content
     * @param ResponseInterface $responseInterface
     */
    public function sendInstallResult($htAccessToUpdate, $htContent, ResponseInterface &$responseInterface)
    {
        ConfService::clearAllCaches();
        ApplicationState::setApplicationFirstRunPassed();

        if ($htAccessToUpdate != null) {
            $responseInterface = new JsonResponse(['file' => $htAccessToUpdate, 'content' => $htContent]);
        } else {
            session_destroy();
            $responseInterface->getBody()->write("OK");
        }

    }

    /**
     * Update the plugins parameters. OptionsLinks can be an array associating keys of $data
     * to pluginID/plugin_parameter_name
     *
     * @param AbstractConfDriver $confDriver
     * @param array $data
     * @param null|array $optionsLinks
     */
    public function feedPluginsOptions($confDriver, $data, $optionsLinks = null)
    {

        if (isSet($optionsLinks)) {
            $direct = $optionsLinks;
        } else {
            // Prepare plugins configs
            $direct = array(
                "APPLICATION_TITLE"     => "core.pydio/APPLICATION_TITLE",
            );
        }

        foreach ($direct as $key => $value) {
            list($pluginId, $param) = explode("/", $value);
            $options = array();
            $confDriver->_loadPluginConfig($pluginId, $options);
            $options[$param] = $data[$key];
            $confDriver->_savePluginConfig($pluginId, $options);
        }


    }

    /**
     * Create or update the bootstrap json file.
     * @param array $data Parsed result of the installer form
     * @return array 2 entries array containing the new Conf Driver (0) and Auth Driver (1)
     * @throws Exception
     */
    public function createBootstrapConf($data)
    {

        // Create a custom bootstrap.json file
        $coreConf = array();
        $coreAuth = array();
        $coreCache = array();
        $this->_loadPluginConfig("core.conf", $coreConf);
        $this->_loadPluginConfig("core.auth", $coreAuth);
        $this->_loadPluginConfig("core.cache", $coreCache);
        if (!isSet($coreConf["UNIQUE_INSTANCE_CONFIG"])) $coreConf["UNIQUE_INSTANCE_CONFIG"] = array();
        if (!isSet($coreAuth["MASTER_INSTANCE_CONFIG"])) $coreAuth["MASTER_INSTANCE_CONFIG"] = array();
        if (!isSet($coreCache["UNIQUE_INSTANCE_CONFIG"])) $coreCache["UNIQUE_INSTANCE_CONFIG"] = array();

        // REWRITE BOOTSTRAP.JSON
        foreach($data as $key => $value) {
            if (strpos($key, "ENDPOINT_") === 0) {
                $coreConf[$key] = $value;
            }
        }

        $coreConf["UNIQUE_INSTANCE_CONFIG"] = array_merge($coreConf["UNIQUE_INSTANCE_CONFIG"], array(
            "instance_name" => "conf.pydio",
            "group_switch_value" => "conf.pydio"
        ));
        $coreAuth["MASTER_INSTANCE_CONFIG"] = array_merge($coreAuth["MASTER_INSTANCE_CONFIG"], array(
            "instance_name" => "auth.pydio",
            "group_switch_value" => "auth.pydio"
        ));
        $coreCache["UNIQUE_INSTANCE_CONFIG"] = array_merge($coreCache["UNIQUE_INSTANCE_CONFIG"], array());

        $oldBoot = $this->getPluginWorkDir(true) . "/bootstrap.json";
        if (is_file($oldBoot)) {
            copy($oldBoot, $oldBoot . ".bak");
            unlink($oldBoot);
        }
        $newBootstrap = array("core.conf" => $coreConf, "core.auth" => $coreAuth, "core.cache" => $coreCache);
        FileHelper::saveSerialFile($oldBoot, $newBootstrap, true, false, "json", true);

    }

    /**
     * Helpers to test SQL connection and send a test email.
     * @param $action
     * @param $httpVars
     * @param $fileVars
     * @throws Exception
     */
    public function testConnexions($action, $httpVars, $fileVars, ContextInterface $ctx)
    {
        $data = array();
        OptionsHelper::parseStandardFormParameters($ctx, $httpVars, $data, "DRIVER_OPTION_");

        if ($action == "boot_test_discovery") {

            $api = MicroApi::GetConfigServiceApi();
            $api->getApiClient()->getConfig()->setHost($data["ENDPOINT_REST_API"]);
            $discovery = $api->endpointsDiscovery();
            $endpoints = $discovery->getEndpoints();
            if($endpoints != null) {
                $bootData = [
                    "ENDPOINT_REST_API" => $data["ENDPOINT_REST_API"],
                    "ENDPOINT_FRONT_PLUGINS" => $data["ENDPOINT_FRONT_PLUGINS"],
                    "ENDPOINT_S3_GATEWAY" => $endpoints["s3"],
                    "ENDPOINT_WEBSOCKET" => $endpoints["websocket"],
                    "ENDPOINT_DEX" => $endpoints["oidc"],
                    "FRONTEND_URL" => $endpoints["frontend"],
                ];
                $this->createBootstrapConf($bootData);
            }

            echo 'SUCCESS:Retrieved discovery urls and created bootstrap.json';

        } else if ($action == "boot_test_authenticate") {

            $cId = $data["ENDPOINT_DEX_CLIENTID"];
            $cSecret = $data["ENDPOINT_DEX_CLIENTSECRET"];
            $adminLogin = $data["ADMIN_USER_LOGIN"];
            $adminPassword = $data["ADMIN_USER_PASS"];

            $jsonData = CoreConfLoader::getBootstrapConf();

            $dexApi = new DexApi();
            $dexApi->setDexUrl($jsonData["core.conf"]["ENDPOINT_DEX"]);
            $dexApi->setClientID($cId);
            $dexApi->setClientSecret($cSecret);

            $tokens = $dexApi->getToken($adminLogin, $adminPassword);

            $jsonData["core.conf"]["ENDPOINT_DEX_CLIENTID"] = $cId;
            $jsonData["core.conf"]["ENDPOINT_DEX_CLIENTSECRET"] = $cSecret;
            CoreConfLoader::saveBootstrapConf($jsonData);

            echo 'SUCCESS:Administrator successfully logged in';

        }
    }

    /**
     * @param string $pluginId
     * @param array $options
     * @return mixed
     */
    public function _loadPluginConfig($pluginId, &$options)
    {
        $internal = self::getInternalConf();

        if ($pluginId == "core.conf" && isSet($internal["CONF_DRIVER"])) {
            // Reformat
            $options["UNIQUE_INSTANCE_CONFIG"] = array(
                "instance_name" => "conf." . $internal["CONF_DRIVER"]["NAME"],
                "group_switch_value" => "conf." . $internal["CONF_DRIVER"]["NAME"],
            );
            unset($internal["CONF_DRIVER"]["NAME"]);
            $options["UNIQUE_INSTANCE_CONFIG"] = array_merge($options["UNIQUE_INSTANCE_CONFIG"], $internal["CONF_DRIVER"]["OPTIONS"]);
            return;

        } else if ($pluginId == "core.cache" && isSet($internal["CACHE_DRIVER"])) {
            $options['UNIQUE_INSTANCE_CONFIG'] = array(
                "instance_name" => "cache." . $internal["CACHE_DRIVER"]["NAME"]
            );
            return;
        }

        CoreConfLoader::loadBootstrapConfForPlugin($pluginId, $options);
    }

    /**
     * @param String $pluginId
     * @param String $options
     */
    public function _savePluginConfig($pluginId, $options)
    {
        $jsonData = CoreConfLoader::getBootstrapConf();

        if (!is_array($jsonData)) $jsonData = array();
        $jsonData[$pluginId] = $options;

        if ($pluginId == "core.conf" || $pluginId == "core.auth" || $pluginId == "core.cache") {
            $testKey = ($pluginId == "core.conf" || $pluginId == "core.cache" ? "UNIQUE_INSTANCE_CONFIG" : "MASTER_INSTANCE_CONFIG");
            $current = array();
            $this->_loadPluginConfig($pluginId, $current);
            if (isSet($current[$testKey]["instance_name"]) && $current[$testKey]["instance_name"] != $options[$testKey]["instance_name"]) {
                $forceDisconnexion = $pluginId;
            }
        }

        CoreConfLoader::saveBootstrapConf($jsonData);

        if (isSet($forceDisconnexion) && $pluginId == "core.conf") {
            // DISCONNECT
            AuthService::disconnect();
        }
    }

}

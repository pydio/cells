/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package runtime

const (
	KeyDiscovery    = "discovery"
	KeyRegistry     = "registry"
	KeyBroker       = "broker"
	KeyConfig       = "config"
	KeyVault        = "vault"
	KeyFork         = "fork"
	KeyForkLegacy   = "is_fork"
	KeyArgTags      = "tags"
	KeyArgExclude   = "exclude"
	KeyNodeCapacity = "cap"

	KeyAdvertiseAddress  = "advertise_address"
	KeyBindHost          = "bind_address"
	KeyGrpcDiscoveryPort = "grpc_discovery_port"
	KeyGrpcPort          = "grpc_port"
	KeyHttpPort          = "http_port"
	KeyGrpcExternal      = "grpc_external"
	KeyHealthCheckPort   = "healthcheck"
	KeyRegistryPort      = "port_registry"
	KeyBrokerPort        = "port_broker"

	KeySiteBind               = "bind"
	KeySiteExternal           = "external"
	KeySiteNoTLS              = "no_tls"
	KeySiteTlsCertFile        = "tls_cert_file"
	KeySiteTlsKeyFile         = "tls_key_file"
	KeySiteLetsEncryptEmail   = "le_email"
	KeySiteLetsEncryptAgree   = "le_agree"
	KeySiteLetsEncryptStaging = "le_staging"

	KeyInstallCli       = "install_cli"
	KeyInstallYaml      = "install_yaml"
	KeyInstallJson      = "install_json"
	KeyInstallExitAfter = "exit_after_install"

	KeyInstallCliLegacy  = "cli"
	KeyInstallYamlLegacy = "yaml"
	KeyInstallJsonLegacy = "json"

	KeyLog       = "log"
	KeyLogJson   = "log_json"
	KeyLogToFile = "log_to_file"

	KeyEnableMetrics = "enable_metrics"
	KeyEnablePprof   = "enable_pprof"

	KeyHttpServer    = "http"
	HttpServerCaddy  = "caddy"
	HttpServerNative = "http"

	DefaultGrpcPort      = "8001"
	DefaultDiscoveryPort = "8002"
	DefaultHttpPort      = "8080"
)

const (
	NodeMetaPID          = "PID"
	NodeMetaParentPID    = "parentPID"
	NodeMetaMetrics      = "metrics"
	NodeMetaStartTag     = "start"
	NodeMetaForkStartTag = "forkStartTag"
	NodeMetaHostName     = "hostname"
	NodeMetaCapacities   = "capacities"
)

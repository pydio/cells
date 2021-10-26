/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package cmd

import (
	"net/url"

	"github.com/spf13/pflag"
	"github.com/spf13/viper"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro/broker"
	"github.com/pydio/cells/common/micro/registry"
	"github.com/pydio/cells/common/micro/transport/grpc"
	cells_registry "github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/utils/net"
)

// addRegistryFlags registers necessary flags to connect to the registry
func addRegistryFlags(flags *pflag.FlagSet, hideAll ...bool) {
	flags.String("registry", "memory", "Registry used to manage services (currently nats only)")
	flags.String("broker", "memory", "Pub/sub service for events between services (currently nats only)")
	flags.String("transport", "grpc", "Transport protocol for RPC")
	flags.Int("port_registry", net.GetAvailableRegistryAltPort(), "Port used to start a registry discovery service")
	flags.Int("port_broker", net.GetAvailableBrokerAltPort(), "Port used to start a broker discovery service")

	if len(hideAll) > 0 && hideAll[0] {
		flags.MarkHidden("registry")
		flags.MarkHidden("broker")
		flags.MarkHidden("transport")
	}
}

// bindViperFlags visits all flags in FlagSet and bind their key to the corresponding viper variable
func bindViperFlags(flags *pflag.FlagSet, replaceKeys map[string]string) {
	flags.VisitAll(func(flag *pflag.Flag) {
		key := flag.Name
		if replace, ok := replaceKeys[flag.Name]; ok {
			key = replace
		}
		viper.BindPFlag(key, flag)
	})
}

// handleRegistry looks up for "registry" key in viper and starts the registry
func handleRegistry() {
	addr := viper.GetString("registry")
	u, err := url.Parse(addr)
	if err != nil {
		log.Fatal("Registry address is not right")
		return
	}

	switch u.Scheme {
	case "grpc":
		registry.EnableService(u.Hostname(), u.Port())
	case "memory":
		fallthrough
	default:
		registry.EnableMemory()
	}
}

// handleBroker looks up for "broker" key in viper and starts the registry
func handleBroker() {
	addr := viper.GetString("broker")
	u, err := url.Parse(addr)
	if err != nil {
		log.Fatal("broker address is not right")
		return
	}

	switch u.Scheme {
	case "nats":
		broker.EnableNATS()
	case "stan":
		broker.EnableSTAN()
	case "http":
		broker.EnableHTTP()
	case "grpc":
		broker.EnableService(u.Hostname(), u.Port())
	case "memory":
		fallthrough
	default:
		broker.EnableMemory()
	}
}

// handleTransport looks up for "transport" key in viper and starts the registry
func handleTransport() {
	switch viper.Get("transport") {
	case "grpc":
		fallthrough
	default:
		grpc.Enable()
	}
}

// initServices initializes the Cells internal registry (different from micro registry)
func initServices() {
	cells_registry.Default.BeforeInit()

	cells_registry.Init()

	cells_registry.Default.AfterInit()
}

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
	"github.com/spf13/pflag"

	"github.com/pydio/cells/v4/common/runtime"
)

// addRegistryFlags registers necessary flags to connect to the registry (defaults to memory)
func addRegistryFlags(flags *pflag.FlagSet, hideAll ...bool) {

	flags.String(runtime.KeyRegistry, "mem://?cache=shared", "Registry used to manage services")
	flags.String(runtime.KeyBroker, "mem://", "Pub/sub service for events between services")
	flags.String(runtime.KeyDiscovery, "mem://", "Combine registry, config and pub/sub discovery service")

	//Todo: remove ?
	//flags.Int(runtime.KeyRegistryPort, net.GetAvailableRegistryAltPort(), "Port used to start a registry discovery service")
	//flags.Int(runtime.KeyBrokerPort, net.GetAvailableBrokerAltPort(), "Port used to start a broker discovery service")

	if len(hideAll) > 0 && hideAll[0] {
		flags.MarkHidden(runtime.KeyDiscovery)
		flags.MarkHidden(runtime.KeyRegistry)
		flags.MarkHidden(runtime.KeyBroker)
	}
}

// addExternalCmdRegistryFlags registers necessary flags to connect to the registry with defaults :8001
func addExternalCmdRegistryFlags(flags *pflag.FlagSet, hideAll ...bool) {
	discoveryAddress := "grpc://:" + runtime.DefaultDiscoveryPort
	flags.String(runtime.KeyDiscovery, discoveryAddress, "Registry and pub/sub")
	flags.String(runtime.KeyRegistry, discoveryAddress, "Registry used to contact services")
	flags.String(runtime.KeyBroker, discoveryAddress, "Pub/sub service for events between services")

	if len(hideAll) > 0 && hideAll[0] {
		flags.MarkHidden(runtime.KeyDiscovery)
		flags.MarkHidden(runtime.KeyRegistry)
		flags.MarkHidden(runtime.KeyBroker)
	}
}

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
	"github.com/pydio/cells/v4/common/utils/net"
	"github.com/spf13/pflag"
)

// addRegistryFlags registers necessary flags to connect to the registry (defaults to memory)
func addRegistryFlags(flags *pflag.FlagSet, hideAll ...bool) {
	flags.String("registry", "mem://", "Registry used to manage services")
	flags.String("broker", "mem://", "Pub/sub service for events between services")
	flags.String("transport", "grpc", "Transport protocol for RPC")
	flags.Int("port_registry", net.GetAvailableRegistryAltPort(), "Port used to start a registry discovery service")
	flags.Int("port_broker", net.GetAvailableBrokerAltPort(), "Port used to start a broker discovery service")

	if len(hideAll) > 0 && hideAll[0] {
		flags.MarkHidden("registry")
		flags.MarkHidden("broker")
		flags.MarkHidden("transport")
	}
}

// addExternalCmdRegistryFlags registers necessary flags to connect to the registry with defaults :8001
func addExternalCmdRegistryFlags(flags *pflag.FlagSet, hideAll ...bool) {
	flags.String("registry", "grpc://:8001", "Registry used to contact services")
	flags.String("broker", "grpc://:8001", "Pub/sub service for events between services")
	flags.String("transport", "grpc", "Transport protocol for RPC")
	flags.Int("port_registry", net.GetAvailableRegistryAltPort(), "Port used to start a registry discovery service")
	flags.Int("port_broker", net.GetAvailableBrokerAltPort(), "Port used to start a broker discovery service")

	if len(hideAll) > 0 && hideAll[0] {
		flags.MarkHidden("registry")
		flags.MarkHidden("broker")
		flags.MarkHidden("transport")
	}
}

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
	"fmt"
	"time"

	"github.com/manifoldco/promptui"
	"github.com/micro/go-micro/broker"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
)

func init() {
	AdminCmd.AddCommand(sitesCaddy)
}

var sitesCaddy = &cobra.Command{
	Use:    "caddy",
	Hidden: true,
	Short:  "Dump content of the Caddyfile currently served by pydio.gateway.proxy",
	Long: `
DESCRIPTION

  Send an event to pydio.gateway.proxy to make it dump the Caddy configuration in the logs.

`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Sending a DebugPrintInternals event to service gateway.proxy...")
		broker.Publish(common.TopicServiceRegistration, &broker.Message{
			Header: map[string]string{
				common.EventHeaderServiceRegisterService: common.ServiceGatewayProxy,
			},
			Body: []byte(common.EventTypeDebugPrintInternals),
		})
		<-time.After(1 * time.Second)
		fmt.Println(promptui.IconGood + " Done!")
	},
}

/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

	"github.com/spf13/cobra"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/install"
)

var proxyCmd = &cobra.Command{
	Use:   "proxy",
	Short: "Manage main proxy configuration",
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
}

func promptAndApplyProxyConfig() (*install.ProxyConfig, error) {

	if sites, e := config.LoadSites(); e == nil {
		return sites[0], nil
	} else {
		return nil, e
	}

	site := &install.ProxyConfig{}

	// Get SSL info from end user
	e := promptURLs(site, true)
	if e != nil {
		return nil, e
	}
	fmt.Println(site)

	// Save and reload
	e = applyProxySites([]*install.ProxyConfig{site})
	if e != nil {
		return nil, e
	}
	return site, e
}

func applyProxySites(sites []*install.ProxyConfig) error {

	// Save configs
	config.Set(sites, "defaults", "sites")
	err := config.Save("cli", "Saving sites configs")
	if err != nil {
		return err
	}

	// Clean TLS context after the update
	config.ResetTlsConfigs()
	return nil

}

func init() {
	configCmd.AddCommand(proxyCmd)
}

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
	"log"
	"net/url"
	"strings"

	p "github.com/manifoldco/promptui"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/install"
	"github.com/pydio/cells/common/utils/net"
)

var urlCmd = &cobra.Command{
	Use:   "url",
	Short: "Manage main URLs of the application",
	Long: `

`,
	Run: func(cmd *cobra.Command, args []string) {

		proxyConfig := &install.ProxyConfig{}

		// Retrieve already defined URLs
		proxyConfig.BindURL = config.Get("defaults", "urlInternal").String("")
		proxyConfig.ExternalURL = config.Get("defaults", "url").String("")

		// Get SSL info from end user
		e := promptURls(proxyConfig)
		if e != nil {
			log.Fatal(e)
		}

		applyProxyConfig(proxyConfig)

		cmd.Println("*************************************************************")
		cmd.Println(" Config has been updated, please restart now!")
		cmd.Println("**************************************************************")

	},
}

func promptURls(proxyConfig *install.ProxyConfig) (e error) {
	// Get SSL info from end user
	e = promptBindURl(proxyConfig)
	if e != nil {
		return
	}

	// TODO Check if TLS is already defined
	// YES => ask we want to change
	// NO => change anyway

	_, e = promptTLSMode(proxyConfig)
	if e != nil {
		return
	}

	e = promptExtURl(proxyConfig)
	if e != nil {
		return
	}
	return
}

func promptBindURl(proxyConfig *install.ProxyConfig) (e error) {

	defaultPort := "8080"
	var internalHost string
	defaultIps, e := net.GetAvailableIPs()
	if e != nil {
		return
	}
	var items []string

	testExt, eExt := net.GetOutboundIP()
	if eExt == nil {
		items = append(items, fmt.Sprintf("%s:%s", testExt.String(), defaultPort))
	}
	for _, ip := range defaultIps {
		if testExt != nil && testExt.String() == ip.String() {
			continue
		}
		items = append(items, fmt.Sprintf("%s:%s", ip.String(), defaultPort))
	}
	items = append(items, "localhost:"+defaultPort, "0.0.0.0:"+defaultPort)

	prompt := p.SelectWithAdd{
		Label:    "Internal Url (address that the web server will listen to, use ip:port or yourdomain.tld, without http/https)",
		Items:    items,
		AddLabel: "Other",
		Validate: validHostPort,
	}
	_, internalHost, e = prompt.Run()
	if e != nil {
		return
	}
	internalHost = strings.TrimSuffix(internalHost, "/")
	dn := strings.TrimPrefix(internalHost, "http://")
	dn = strings.TrimPrefix(dn, "https://")
	parts := strings.Split(dn, ":")

	// TODO retry
	if len(parts) != 2 {
		return fmt.Errorf("Please use an [IP|DOMAIN]:[PORT] string")
	}

	// Default to https
	scheme := "https://"
	if parts[1] == "80" || proxyConfig.GetTLSConfig() == nil {
		scheme = "http://"

	}
	proxyConfig.BindURL = scheme + dn

	return nil
}

func promptExtURl(proxyConfig *install.ProxyConfig) error {

	// Gather predefined info to enhance suggestions
	bind := proxyConfig.GetBindURL()
	dn := strings.TrimPrefix(bind, "http://")
	dn = strings.TrimPrefix(dn, "https://")
	parts := strings.Split(dn, ":")
	if len(parts) != 2 {
		return fmt.Errorf("Bind URL %s is not valid. Please correct to use an [IP|DOMAIN]:[PORT] string", dn)
	}

	if parts[1] == "80" || parts[1] == "443" {
		dn = parts[0]
	}

	scheme := "http://"
	if parts[1] == "443" || proxyConfig.GetTLSConfig() != nil {
		scheme = "https://"
	}

	external := fmt.Sprintf("%s%s", scheme, dn)

	fmt.Println("Your instance will be accessible at " + external + ". If you are behind a reverse proxy or inside a private network, you may need to manually set an alternative External URL. Do not change this is you are not sure!")
	changeExternal := p.Select{
		Label: "Setup a different URL for external access",
		Items: []string{"Use " + external, "Set another URL"},
	}
	if choice, _, _ := changeExternal.Run(); choice == 1 {
		extPrompt := p.Prompt{
			Label:    "External Url used to access application from outside world",
			Validate: validScheme,
			Default:  fmt.Sprintf("%s://%s", scheme, dn),
		}
		var err error
		external, err = extPrompt.Run()
		if err != nil {
			return err

		}
		external = strings.TrimSuffix(external, "/")
	}

	_, err := url.Parse(external)
	if err != nil {
		return err
	}

	proxyConfig.ExternalURL = external
	return nil
}

func init() {
	proxyCmd.AddCommand(urlCmd)
}

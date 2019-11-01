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

	"github.com/pydio/cells/common/proto/install"
	"github.com/pydio/cells/common/utils/net"
)

var urlCmd = &cobra.Command{
	Use:   "url",
	Short: "Manage main URLs of the application",
	Long: `

`,
	Run: func(cmd *cobra.Command, args []string) {

		proxyConfig := loadProxyConf()

		// Get SSL info from end user
		e := promptURLs(proxyConfig, false)
		if e != nil {
			log.Fatal(e)
		}

		applyProxyConfig(proxyConfig)

		cmd.Println("*************************************************************")
		cmd.Println(" Config has been updated, please restart now!")
		cmd.Println("**************************************************************")

	},
}

func promptURLs(proxyConfig *install.ProxyConfig, includeTLS bool) (e error) {
	// Get URL info from end user
	e = promptBindURL(proxyConfig)
	if e != nil {
		return
	}

	if !includeTLS {
		// TLS not included by default, still ask the user if he wants to change it
		promptTls := p.Prompt{Label: "Do you want to change your TLS config as well? [y/N] ", Default: ""}
		if val, e1 := promptTls.Run(); e1 == nil && (val == "Y" || val == "y" || val == "") {
			includeTLS = true
		}
	}

	if includeTLS {
		_, e = promptTLSMode(proxyConfig)
		if e != nil {
			return
		}
	}

	e = promptExtURL(proxyConfig)
	if e != nil {
		return
	}

	return
}

func promptBindURL(proxyConfig *install.ProxyConfig) (e error) {

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

func promptExtURL(proxyConfig *install.ProxyConfig) error {

	// Gather predefined info to enhance suggestions
	bind, e := url.Parse(proxyConfig.GetBindURL())
	if e != nil {
		return e
	}
	parts := strings.Split(bind.Host, ":")
	if len(parts) != 2 {
		return fmt.Errorf("Bind URL %s is not valid. Please correct to use an [IP|DOMAIN]:[PORT] string", bind.Host)
	}
	extUrl := &url.URL{
		Scheme: "http",
		Host:   bind.Host,
	}
	if parts[1] == "80" || parts[1] == "443" {
		extUrl.Host = parts[0] // Strip port
	}
	if parts[1] == "443" || proxyConfig.GetTLSConfig() != nil {
		extUrl.Scheme = "https"
	}

	external := extUrl.String()

	fmt.Println("Your instance will be accessible at " + external + ". If you are behind a reverse proxy or inside a private network, you may need to manually set an alternative External URL. Do not change this is you are not sure!")
	changeExternal := p.Select{
		Label: "Setup a different URL for external access",
		Items: []string{"Use " + external, "Set another URL"},
	}
	if choice, _, _ := changeExternal.Run(); choice == 1 {
		extPrompt := p.Prompt{
			Label:    "External Url used to access application from outside world",
			Validate: validScheme,
			Default:  extUrl.String(),
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

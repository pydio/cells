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
	"net/url"

	"github.com/micro/go-log"
	"github.com/spf13/cobra"

	"github.com/manifoldco/promptui"
	"github.com/pydio/cells/common/config"
)

// enableCmd represents the enable command
var SslModeCmd = &cobra.Command{
	Use:   "mode",
	Short: "Manage HTTPS support on proxy",
	Long: `
This command lets you enable/disabled SSL on application main access point.

Three modes are currently supported :
- TLS mode : provide the paths to certificate and key (as you would on an apache server)
- Self-Signed : a self-signed certificate will be generated at each application start
- Disabled : application will be served on HTTP

`,
	Run: func(cmd *cobra.Command, args []string) {

		enabled, e := promptSslMode()
		if e != nil {
			log.Fatal(e)
		}

		// Replace Main URLS
		extUrl, _ := url.Parse(config.Get("defaults", "url").String(""))
		intUrl, _ := url.Parse(config.Get("defaults", "urlInternal").String(""))
		if enabled {
			extUrl.Scheme = "https"
			intUrl.Scheme = "https"
		} else {
			extUrl.Scheme = "http"
			intUrl.Scheme = "http"
		}
		config.Set(extUrl.String(), "defaults", "url")
		config.Set(intUrl.String(), "defaults", "urlInternal")
		if e := config.Save("cli", "Update SSL mode"); e != nil {
			cmd.Println("Error while saving config: " + e.Error())
		}

		cmd.Println("*************************************************************")
		cmd.Println(" Config has been updated, please restart now!")
		cmd.Println("**************************************************************")

	},
}

func promptSslMode() (enabled bool, e error) {

	certFile := config.Get("cert", "proxy", "certFile").String("")
	keyFile := config.Get("cert", "proxy", "keyFile").String("")

	selector := promptui.Select{
		Label: "Choose SSL activation mode",
		Items: []string{
			"Provide paths to certificate/key files",
			"Generate a self-signed certificate (for staging environments only!)",
			"Disable SSL (not recommended)",
		},
	}
	var i int
	i, _, e = selector.Run()
	if e != nil {
		return
	}

	switch i {
	case 0:
		certPrompt := promptui.Prompt{Label: "Provide absolute path to the HTTP certificate", Default: certFile}
		keyPrompt := promptui.Prompt{Label: "Provide absolute path to the HTTP private key", Default: keyFile}
		if certFile, e = certPrompt.Run(); e != nil {
			return
		}
		if keyFile, e = keyPrompt.Run(); e != nil {
			return
		}
		enabled = true
		config.Set(true, "cert", "proxy", "ssl")
		config.Set(false, "cert", "proxy", "self")
		config.Set(certFile, "cert", "proxy", "certFile")
		config.Set(keyFile, "cert", "proxy", "keyFile")
	case 1:
		enabled = true
		config.Set(true, "cert", "proxy", "ssl")
		config.Set(true, "cert", "proxy", "self")
	case 2:
		config.Set(false, "cert", "proxy", "ssl")
	}

	enableRedir := false
	if enabled {
		redirPrompt := promptui.Select{
			Label: "Do you want to automatically redirect HTTP (80) to HTTPS? Warning, this require the right to bind to port 80 on this machine.",
			Items: []string{
				"Yes",
				"No",
			}}
		if i, _, e = redirPrompt.Run(); e == nil && i == 0 {
			enableRedir = true
		}
	}
	if enableRedir {
		fmt.Println("Setting httpRedir flag")
		config.Set(true, "cert", "proxy", "httpRedir")
	} else {
		config.Del("cert", "proxy", "httpRedir")
	}

	return
}

func init() {
	SslCmd.AddCommand(SslModeCmd)
}

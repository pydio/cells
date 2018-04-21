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
	"github.com/pydio/cells/common/utils"
)

// enableCmd represents the enable command
var SslModeCmd = &cobra.Command{
	Use:   "mode",
	Short: "Enable HTTPS on proxy",
	Long:  `Setup SSL on application main access point`,
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
		utils.SaveConfigs()

		var frontWrite error
		if fConf, e := config.FrontBootstrapFromConfig(extUrl.String()); e == nil {
			root := config.Get("defaults", "frontRoot").String("")
			if root != "" {
				frontWrite = config.FrontWriteBootstrap(root, fConf)
				config.FrontClearCache(root)
			} else {
				frontWrite = fmt.Errorf("cannot find root for frontend")
			}
		} else {
			frontWrite = e
		}

		if frontWrite == nil {
			cmd.Println("*************************************************************")
			cmd.Println(" Please restart pydio now. Frontend config has been updated  ")
			cmd.Println("**************************************************************")
		} else {
			cmd.Println("*************************************************************")
			cmd.Println(" Please restart pydio now.")
			cmd.Println(" WARNING: Frontend Config was not updated, update it manually!")
			cmd.Println(" Error was  ", frontWrite.Error())
			cmd.Println("**************************************************************")
		}

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

	return
}

func init() {
	SslCmd.AddCommand(SslModeCmd)
}

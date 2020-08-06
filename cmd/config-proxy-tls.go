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

	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/install"
)

var tlsModeCmd = &cobra.Command{
	Use:   "tls",
	Short: "Manage TLS configuration of the application internal proxy",
	Long: `
This command lets you enable/disabled TLS on the application main access point.

Four modes are currently supported:
- TLS mode : provide the paths to certificate and key (as you would on an apache server)
- Let's Encrypt: certificate is automagically generated during installation process, and later managed (e.g. renewed) by the embedded Caddy server
- Self-Signed : a self-signed certificate will be generated at each application start
- Disabled : application will be served on HTTP

`,
	Run: func(cmd *cobra.Command, args []string) {

		proxyConfig := loadProxyConf()
		initialTLS := proxyConfig.TLSConfig != nil
		// Get TLS info from end user
		_, e := promptTLSMode(proxyConfig)
		if e != nil {
			log.Fatal(e)
		}
		if initialTLS != (proxyConfig.TLSConfig != nil) {
			// There was a change in tls => this will impact external URL !
			cmd.Println("Switching TLS mode: checking external URL")
			e := promptExtURL(proxyConfig)
			if e != nil {
				log.Fatal(e)
			}
		}

		applyProxyConfig(proxyConfig)

		cmd.Println("*************************************************************")
		cmd.Println(" Config has been updated, please restart now!")
		cmd.Println("**************************************************************")

	},
}

func promptTLSMode(proxyConfig *install.ProxyConfig) (enabled bool, e error) {

	// Load defaults
	certFile := config.Get("cert", "proxy", "certFile").String()
	keyFile := config.Get("cert", "proxy", "keyFile").String()
	certEmail := config.Get("cert", "proxy", "email").String()
	enabled = true

	selector := promptui.Select{
		Label: "Choose TLS activation mode. Please note that you should enable SSL even behind a reverse proxy, as HTTP2 'TLS => Clear' is generally not supported",
		Items: []string{
			"Provide paths to certificate/key files",
			"Use Let's Encrypt to automagically generate certificate during installation process",
			"Generate your own locally trusted certificate (for staging env or if you are behind a reverse proxy)",
			"Disable TLS (staging environments only, never recommended!)",
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
		tlsConf := &install.ProxyConfig_Certificate{
			Certificate: &install.TLSCertificate{
				CertFile: certFile,
				KeyFile:  keyFile,
			}}
		proxyConfig.TLSConfig = tlsConf

	case 1:
		mailPrompt := promptui.Prompt{Label: "Please enter the mail address for certificate generation", Validate: validateMailFormat, Default: certEmail}
		acceptEulaPrompt := promptui.Prompt{Label: "Do you agree to the Let's Encrypt SA? [Y/n] ", Default: ""}
		useStagingPrompt := promptui.Prompt{Label: "Do you want to use Let's Encrypt staging entrypoint? [y/N] ", Default: ""}

		certMail, e1 := mailPrompt.Run()
		if e1 != nil {
			e = e1
			return
		}
		// TODO validate email

		acceptEula := true
		if val, e1 := acceptEulaPrompt.Run(); e1 != nil {
			e = e1
			return
		} else if !(val == "Y" || val == "y" || val == "") {
			e = fmt.Errorf("You must agree to Let's Encrypt SA to use automated certificate generation feature.")
			return
		}

		useStaging := true
		if val, e1 := useStagingPrompt.Run(); e1 != nil {
			e = e1
			return
		} else if val == "N" || val == "n" || val == "" {
			useStaging = false
		}

		tlsConf := &install.ProxyConfig_LetsEncrypt{
			LetsEncrypt: &install.TLSLetsEncrypt{
				Email:      certMail,
				AcceptEULA: acceptEula,
				StagingCA:  useStaging,
			},
		}
		proxyConfig.TLSConfig = tlsConf

	case 2:

		tlsConf := &install.ProxyConfig_SelfSigned{SelfSigned: &install.TLSSelfSigned{}}
		proxyConfig.TLSConfig = tlsConf

	case 3:
		enabled = false
		proxyConfig.TLSConfig = nil
	}

	// Adapt bind URLS in case TLS mode has changed
	scheme := "http"
	if enabled {
		scheme = "https"
	}
	bu, err := url.Parse(proxyConfig.GetBindURL())
	if err != nil {
		return enabled, fmt.Errorf("could not parse bind URL %s, cause: %s", proxyConfig.GetBindURL(), err.Error())
	}
	bu.Scheme = scheme
	proxyConfig.BindURL = bu.String()

	// Reset redirect URL: for the time being we rather use this as a flag
	proxyConfig.RedirectURLs = []string{}
	if enabled {
		redirPrompt := promptui.Select{
			Label: "Do you want to automatically redirect HTTP (80) to HTTPS? Warning: this requires the right to bind to port 80 on this machine.",
			Items: []string{
				"Yes",
				"No",
			}}
		if i, _, e = redirPrompt.Run(); e == nil && i == 0 {
			proxyConfig.RedirectURLs = []string{"http://" + bu.Host}
		}
	}

	return
}

func init() {
	proxyCmd.AddCommand(tlsModeCmd)
}

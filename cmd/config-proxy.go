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
	"os"
	"path/filepath"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/install"
	"github.com/pydio/cells/common/utils/net"
	"github.com/spf13/cobra"
)

var proxyCmd = &cobra.Command{
	Use:   "proxy",
	Short: "Manage main proxy configuration",
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
}

func promptAndApplyProxyConfig() (*install.ProxyConfig, error) {

	proxyConfig := &install.ProxyConfig{}

	// Get SSL info from end user
	e := promptURLs(proxyConfig, true)
	if e != nil {
		return nil, e
	}

	// Save and reload
	e = applyProxyConfig(proxyConfig)
	if e != nil {
		return nil, e
	}
	return proxyConfig, e
}

func loadProxyConf() *install.ProxyConfig {
	i := &install.ProxyConfig{}
	// Retrieve already defined URLs and Redirects
	i.BindURL = config.Get("defaults", "urlInternal").String("")
	i.ExternalURL = config.Get("defaults", "url").String("")
	if redir := config.Get("cert", "proxy", "httpRedir").String(""); redir != "" {
		i.RedirectURLs = append(i.RedirectURLs, redir)
	}
	// Retrieve TLS config
	confData := make(map[string]interface{})
	e := config.Get("cert", "proxy").Scan(&confData)
	if e != nil {
		return i
	}
	if _, ok := confData["ssl"]; !ok {
		// No SSL configured
		return i
	}
	if _, ok := confData["autoCA"]; ok {
		i.TLSConfig = &install.ProxyConfig_SelfSigned{SelfSigned: &install.TLSSelfSigned{}}
	} else if caUrl, ok2 := confData["caUrl"]; ok2 {
		i.TLSConfig = &install.ProxyConfig_LetsEncrypt{LetsEncrypt: &install.TLSLetsEncrypt{
			Email:      confData["email"].(string),
			AcceptEULA: true,
			StagingCA:  caUrl == config.DefaultCaStagingUrl,
		}}
	} else if cert, ok3 := confData["certFile"]; ok3 {
		i.TLSConfig = &install.ProxyConfig_Certificate{Certificate: &install.TLSCertificate{
			CertFile: cert.(string),
			KeyFile:  confData["keyFile"].(string),
		}}
	}
	return i
}

func applyProxyConfig(pconf *install.ProxyConfig) error {

	var saveMsg string

	config.Set(pconf.GetBindURL(), "defaults", "urlInternal")
	config.Set(pconf.GetExternalURL(), "defaults", "url")
	err := config.Save("cli", "Saving proxy URLs")
	if err != nil {
		fmt.Printf("Could not save proxy URLs: %s\n", err.Error())
		return err
	}

	newConfig := make(map[string]interface{})

	if pconf.TLSConfig == nil {

		saveMsg = "Install / Non-Interactive / Without SSL"

	} else {

		switch v := pconf.TLSConfig.(type) {

		case *install.ProxyConfig_SelfSigned:

			// Generate a custom certificate
			saveMsg += "With self signed certificate"
			storageLocation := filepath.Join(config.ApplicationWorkingDir(), "certs")
			os.MkdirAll(storageLocation, 0700)
			mkCert := config.NewMkCert(filepath.Join(config.ApplicationWorkingDir(), "certs"))

			hns := v.SelfSigned.GetHostnames()
			if len(hns) == 0 {
				// by default, use the bind url
				u, err := url.Parse(pconf.GetBindURL())
				if err != nil {
					return err
				}
				bindHost := u.Hostname()
				if bindHost != "0.0.0.0" {
					// Standard case : use internal by default
					hns = append(hns, bindHost)
				} else {
					// Special case for 0.0.0.0 => use all interfaces and external
					ii, _ := net.GetAvailableIPs()
					for _, i := range ii {
						hns = append(hns, i.String())
					}
					if u2, e := url.Parse(pconf.GetExternalURL()); e == nil {
						hns = append(hns, u2.Hostname())
					}
				}
			}

			err := mkCert.MakeCert(hns)
			if err != nil {
				return err
			}
			certFile, certKey, caFile, _ := mkCert.GeneratedResources()

			fmt.Println("")
			fmt.Println("")
			fmt.Println("👉 If you are behind a reverse proxy, you can either install the RootCA on the proxy machine " +
				"trust store, or configure your proxy to `insecure_skip_verify` for pointing to Cells.")
			fmt.Println("👉 If you are developing locally, you may install the RootCA in your system trust store to " +
				"see a green light in your browser!")
			fmt.Println("🗒  To easily install the RootCA in your trust store, use https://github.com/FiloSottile/mkcert. " +
				"Set the $CAROOT environment variable to the rootCA folder then use 'mkcert -install'")
			fmt.Println("")

			newConfig["ssl"] = true
			newConfig["certFile"] = certFile
			newConfig["keyFile"] = certKey
			newConfig["autoCA"] = caFile

		case *install.ProxyConfig_LetsEncrypt:

			newConfig["ssl"] = true
			newConfig["email"] = v.LetsEncrypt.GetEmail()
			newConfig["caUrl"] = config.DefaultCaUrl
			if v.LetsEncrypt.GetStagingCA() {
				newConfig["caUrl"] = config.DefaultCaStagingUrl
			}
			saveMsg += "With Let's Encrypt automatic cert generation"

		case *install.ProxyConfig_Certificate:

			newConfig["ssl"] = true
			newConfig["certFile"] = v.Certificate.GetCertFile()
			newConfig["keyFile"] = v.Certificate.GetKeyFile()
			saveMsg += "With provided certificate"

		default:
			saveMsg = "Install / Non-Interactive / Without SSL"
		}

	}

	// Simplified management of redirect URLs
	if redirects := pconf.GetRedirectURLs(); redirects != nil && len(redirects) > 0 {
		newConfig["httpRedir"] = true
	}
	if len(newConfig) > 0 {
		config.Set(newConfig, "cert", "proxy")
	} else {
		config.Del("cert", "proxy")
	}
	err = config.Save("cli", saveMsg)
	if err != nil {
		return err
	}

	// Clean TLS context after the update
	config.ResetTlsConfigs()
	return nil

}

func init() {
	ConfigCmd.AddCommand(proxyCmd)
}

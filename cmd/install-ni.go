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
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/url"
	"os"
	"time"

	"path/filepath"
	"strings"

	"github.com/spf13/cobra"
	"gopkg.in/yaml.v2"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/install"
	"github.com/pydio/cells/common/utils/net"
	"github.com/pydio/cells/discovery/install/lib"
)

func nonInterractiveInstall(cmd *cobra.Command, args []string) (*url.URL, *url.URL, bool, error) {

	// We starts the install server by default when performing a non interactive install
	// TODO: Enhance
	startInstallServer := true

	// Install from config file
	if ymlFile != "" || jsonFile != "" {
		pconf, err := installFromConf()
		if err != nil {
			return nil, nil, false, err
		}
		bind, _ := url.Parse(pconf.GetProxyConfig().GetBindURL())
		ext, _ := url.Parse(pconf.GetProxyConfig().GetExternalURL())
		return bind, ext, false, nil
	}

	pconf, err := proxyConfigFromArgs()
	if err != nil {
		return nil, nil, false, err
	}

	err = preConfigureProxy(pconf)
	if err != nil {
		return nil, nil, false, err
	}

	data1, _ := json.MarshalIndent(pconf, "", "  ")
	fmt.Println(string(data1))

	data2, _ := yaml.Marshal(pconf)
	fmt.Println(string(data2))

	// At this point we assume URLs are correctly formatted
	bind, _ := url.Parse(pconf.GetBindURL())
	ext, _ := url.Parse(pconf.GetExternalURL())
	return bind, ext, startInstallServer, nil
}

func proxyConfigFromArgs() (*install.ProxyConfig, error) {

	proxyConfig := &install.ProxyConfig{}

	var prefix string

	hostname := niBindUrl
	if strings.HasPrefix(niBindUrl, "http://") || strings.HasPrefix(niBindUrl, "https://") {
		hostname = strings.Split(niBindUrl, "://")[1]
	}

	if niDisableSsl {
		prefix = "http://"
	} else {
		prefix = "https://"

		if niCertFile != "" && niKeyFile != "" {
			tlsConf := &install.ProxyConfig_Certificate{
				&install.TLSCertificate{
					CertFile: niCertFile,
					KeyFile:  niKeyFile,
				}}
			proxyConfig.TLSConfig = tlsConf
		} else if niLeEmailContact != "" {

			if !niLeAcceptEula {
				return nil, fmt.Errorf("you must accept Let's Encrypt EULA by setting the corresponding flag in order to use this mode")
			}

			tlsConf := &install.ProxyConfig_LetsEncrypt{
				&install.TLSLetsEncrypt{
					Email:      niLeEmailContact,
					AcceptEULA: niLeAcceptEula,
					StagingCA:  niLeUseStagingCA,
				},
			}
			proxyConfig.TLSConfig = tlsConf
		} else {
			// TODO enable more than one hostname
			hostName := niBindUrl
			if strings.HasPrefix(niBindUrl, "http://") {
				return nil, fmt.Errorf("you should provide an URL that starts witjh https of self-signed mode")
			}

			// Remove port
			hostNameNoPort := strings.Split(hostName, ":")[0]

			tlsConf := &install.ProxyConfig_SelfSigned{
				&install.TLSSelfSigned{
					Hostname: []string{hostNameNoPort},
				},
			}
			proxyConfig.TLSConfig = tlsConf
		}
	}

	proxyConfig.BindURL = prefix + hostname

	var external *url.URL

	var err error
	// Enables more complex configs with a proxy.
	if strings.HasPrefix(niExtUrl, "http://") || strings.HasPrefix(niExtUrl, "https://") {
		external, err = url.Parse(niExtUrl)
	} else {
		external, err = url.Parse(prefix + niExtUrl)
	}
	if err != nil {
		return nil, fmt.Errorf("Malformed exception for External URL: %s, error: %s", niExtUrl, err.Error())
	}
	proxyConfig.ExternalURL = external.String()

	return proxyConfig, nil
}

func preConfigureProxy(pconf *install.ProxyConfig) error {

	var saveMsg string

	config.Set(pconf.GetBindURL(), "defaults", "urlInternal")
	config.Set(pconf.GetExternalURL(), "defaults", "url")

	if pconf.TLSConfig == nil {
		saveMsg = "Install / Non-Interactive / Without SSL"
	}

	switch v := pconf.TLSConfig.(type) {

	case *install.ProxyConfig_SelfSigned:

		// Generate a custom certificate
		saveMsg += "With self signed certificate"
		storageLocation := filepath.Join(config.ApplicationWorkingDir(), "certs")
		os.MkdirAll(storageLocation, 0700)
		mkCert := config.NewMkCert(filepath.Join(config.ApplicationWorkingDir(), "certs"))

		err := mkCert.MakeCert(v.SelfSigned.GetHostname())
		if err != nil {
			return err
		}
		certFile, certKey, caFile, _ := mkCert.GeneratedResources()
		config.Set(certFile, "cert", "proxy", "certFile")
		config.Set(certKey, "cert", "proxy", "keyFile")
		config.Set(caFile, "cert", "proxy", "autoCA")

	case *install.ProxyConfig_LetsEncrypt:

		config.Set(false, "cert", "proxy", "self")
		config.Set(v.LetsEncrypt.GetEmail(), "cert", "proxy", "email")
		config.Set(config.DefaultCaUrl, "cert", "proxy", "caUrl")
		if v.LetsEncrypt.GetStagingCA() {
			config.Set(config.DefaultCaStagingUrl, "cert", "proxy", "caUrl")
		}
		saveMsg += "With Let's Encrypt automatic cert generation"

	case *install.ProxyConfig_Certificate:

		config.Set(v.Certificate.GetCertFile(), "cert", "proxy", "certFile")
		config.Set(v.Certificate.GetKeyFile(), "cert", "proxy", "keyFile")
		saveMsg += "With provided certificate"

	default:
		saveMsg = "Install / Non-Interactive / Without SSL"
	}

	return config.Save("cli", saveMsg)
}

func installFromConf() (*install.InstallConfig, error) {

	var confFromFile *install.InstallConfig
	var path string

	if ymlFile != "" {
		path = ymlFile
		file, err := ioutil.ReadFile(ymlFile)
		if err != nil {
			return nil, fmt.Errorf("could not read YAML file at %s: %s", ymlFile, err.Error())
		}
		err = yaml.Unmarshal(file, &confFromFile)
		if err != nil {
			return nil, fmt.Errorf("error parsing YAML file at %s: %s", ymlFile, err.Error())
		}

	}

	if jsonFile != "" {
		path = jsonFile

		file, err := ioutil.ReadFile(jsonFile)
		if err != nil {
			return nil, fmt.Errorf("could not read JSON file at %s: %s", jsonFile, err.Error())
		}
		err = json.Unmarshal(file, &confFromFile)
		if err != nil {
			return nil, fmt.Errorf("error parsing JSON file at %s: %s", jsonFile, err.Error())
		}
	}

	fmt.Printf("\033[1m## Performing Installation\033[0m using default config from %s\n", path)

	//
	// _ := lib.GenerateDefaultConfig()

	microStr := confFromFile.GetExternalMicro()
	if microStr == "" || microStr == "0" {
		micro := net.GetAvailablePort()
		config.Set(micro, "ports", common.SERVICE_MICRO_API)
		err := config.Save("cli", "Install / Setting default Ports")
		if err != nil {
			return nil, fmt.Errorf("could not save config after micro port definition: %s", err.Error())
		}
	}

	// Preconfiguring proxy:
	err := preConfigureProxy(confFromFile.GetProxyConfig())
	if err != nil {
		return nil, fmt.Errorf("could not preconfigure proxy: %s", err.Error())
	}

	// Check if pre-configured DB is up and running
	nbRetry := 10
	for i := 0; i < nbRetry; i++ {
		if res := lib.PerformCheck(context.Background(), "DB", confFromFile); res.Success {
			break
		}
		if i == nbRetry-1 {
			fmt.Println("[Error] Cannot connect to database, you should double check your server and your connection config")
			return nil, fmt.Errorf("no DB. Aborting...")
		}
		fmt.Println("... Cannot connect to database, wait before retry")
		<-time.After(3 * time.Second)
	}

	// err = handleSSLConfig(currConfig.SSLConfig)
	// if err != nil {
	// 	log.Fatal(fmt.Sprintf("Could not configure SSL mode: %s\n", err.Error()))
	// }

	// Really ?
	confFromFile.InternalUrl = confFromFile.GetProxyConfig().GetBindURL()

	err = lib.Install(context.Background(), confFromFile, lib.INSTALL_ALL, func(event *lib.InstallProgressEvent) {
		fmt.Println(event.Message)
	})
	if err != nil {
		return nil, fmt.Errorf("error while performing installation: %s", err.Error())
	}

	return confFromFile, nil
}

// var installYmlCmd = &cobra.Command{
// 	Use:   "install-yaml",
// 	Short: "Install Cells using this terminal",
// 	Long:  "This command launch the installation process of Pydio Cells in the command line instead of a browser.",
// 	Run: func(cmd *cobra.Command, args []string) {

// 		/*
// 			// SAMPLE TEST
// 			testProxyConfig := &install.ProxyConfig{
// 				BindURL:      "bindUrl",
// 				ExternalURL:  "extUrl",
// 				RedirectURLs: []string{"redirectUrl"},
// 				TLSConfig: &install.ProxyConfig_LetsEncrypt{
// 					&install.TLSLetsEncrypt{
// 						Email:      "email@toto.com",
// 						AcceptEULA: true,
// 						StagingCA:  false,
// 					},
// 				},
// 			}
// 				data1, _ := json.MarshalIndent(testProxyConfig, "", "  ")
// 				fmt.Println(string(data1))

// 				data2, _ := yaml.Marshal(testProxyConfig)
// 				fmt.Println(string(data2))
// 				os.Exit(0)
// 		*/

// 	},
// }

// func handleSSLConfig(c *SSLConfig) error {

// 	if c.BindUrl == "" || c.ExtUrl == "" {
// 		return fmt.Errorf("Please define a Bind *and* a public URL to be able to install Cells")
// 	}

// 	var saveMsg, prefix string
// 	var internal, external *url.URL
// 	isLE := false

// 	if c.DisableSSL {
// 		prefix = "http://"
// 		saveMsg = "Install / From Yaml Config / Without SSL"
// 	} else {
// 		saveMsg = "Install / From Yaml Config / "
// 		prefix = "https://"
// 		config.Set(true, "cert", "proxy", "ssl")

// 		if c.CertFile != "" && c.KeyFile != "" {
// 			config.Set(c.CertFile, "cert", "proxy", "certFile")
// 			config.Set(c.KeyFile, "cert", "proxy", "keyFile")
// 			saveMsg += "With provided certificate"
// 		} else if c.LeEmailContact != "" {
// 			if !c.LeAcceptEula {
// 				return fmt.Errorf("You must accept Let's Encrypt EULA by setting the 'leaccepteula' property to 'true' in order to use this mode")
// 			}
// 			config.Set(false, "cert", "proxy", "self")
// 			config.Set(c.LeEmailContact, "cert", "proxy", "email")
// 			config.Set(config.DefaultCaUrl, "cert", "proxy", "caUrl")
// 			saveMsg += "With Let's Encrypt automatic cert generation"

// 		} else {
// 			config.Set(true, "cert", "proxy", "self")
// 			saveMsg += "With self signed certificate"
// 		}

// 		if c.HttpRedir {
// 			config.Set(true, "cert", "proxy", "httpRedir")
// 		}
// 	}

// 	internal, _ = url.Parse(prefix + c.BindUrl)
// 	config.Set(internal.String(), "defaults", "urlInternal")
// 	c.BindUrl = internal.String()

// 	// Enables more complex configs with a proxy.
// 	if strings.HasPrefix(c.ExtUrl, "http://") || strings.HasPrefix(c.ExtUrl, "https://") {
// 		external, _ = url.Parse(c.ExtUrl)
// 	} else {
// 		external, _ = url.Parse(prefix + c.ExtUrl)
// 	}
// 	config.Set(external.String(), "defaults", "url")
// 	config.Save("cli", saveMsg)

// 	if isLE { // Sleeps 10 seconds to let automated cert process run
// 		fmt.Println("... Waiting after Let's Encrypt configuration")
// 		<-time.After(10 * time.Second)
// 	}
// 	return nil
// }

// func init() {

// 	flags := installYmlCmd.PersistentFlags()
// 	flags.StringVarP(&ymlFile, "yml-conf-file", "f", "", "[Non interactive mode] with a single YML file")

// 	RootCmd.AddCommand(installYmlCmd)

// }

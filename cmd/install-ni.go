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
	"strings"
	"time"

	"github.com/spf13/cobra"
	"gopkg.in/yaml.v2"

	"github.com/pydio/cells/common/proto/install"
	"github.com/pydio/cells/discovery/install/lib"
)

func nonInterractiveInstall(cmd *cobra.Command, args []string) (*url.URL, *url.URL, bool, error) {

	// We starts the install server by default when performing a non interactive install
	// TODO: Enhance
	startInstallServer := true

	// Install from config file
	if niYmlFile != "" || niJsonFile != "" {
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

	err = applyProxyConfig(pconf)
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

	scheme := "https://"
	if niCertFile != "" && niKeyFile != "" {
		tlsConf := &install.ProxyConfig_Certificate{
			Certificate: &install.TLSCertificate{
				CertFile: niCertFile,
				KeyFile:  niKeyFile,
			}}
		proxyConfig.TLSConfig = tlsConf
	} else if niLeEmailContact != "" {

		if !niLeAcceptEula {
			return nil, fmt.Errorf("you must accept Let's Encrypt EULA by setting the corresponding flag in order to use this mode")
		}

		tlsConf := &install.ProxyConfig_LetsEncrypt{
			LetsEncrypt: &install.TLSLetsEncrypt{
				Email:      niLeEmailContact,
				AcceptEULA: niLeAcceptEula,
				StagingCA:  niLeUseStagingCA,
			},
		}
		proxyConfig.TLSConfig = tlsConf
	} else if niSelfSigned {
		// TODO enable more than one hostname
		hostName := niBindUrl
		if strings.HasPrefix(niBindUrl, "http://") {
			return nil, fmt.Errorf("you must provide an URL that starts with https in self-signed mode")
		}

		// Remove port
		hostNameNoPort := strings.Split(hostName, ":")[0]

		tlsConf := &install.ProxyConfig_SelfSigned{
			SelfSigned: &install.TLSSelfSigned{
				Hostnames: []string{hostNameNoPort},
			},
		}
		proxyConfig.TLSConfig = tlsConf
	} else { // NO TLS
		scheme = "http://"
	}

	proxyConfig.BindURL = scheme + hostname

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

func installFromConf() (*install.InstallConfig, error) {

	fmt.Printf("\033[1m## Performing Installation\033[0m \n")

	installConf, err := unmarshallConf()

	// FIXME double check this
	// _ := lib.GenerateDefaultConfig()

	// Preconfiguring proxy:
	err = applyProxyConfig(installConf.GetProxyConfig())
	if err != nil {
		return nil, fmt.Errorf("could not preconfigure proxy: %s", err.Error())
	}

	// Check if pre-configured DB is up and running
	nbRetry := 10
	for i := 0; i < nbRetry; i++ {
		if res := lib.PerformCheck(context.Background(), "DB", installConf); res.Success {
			break
		}
		if i == nbRetry-1 {
			fmt.Println("[Error] Cannot connect to database, you should double check your server and your connection config")
			return nil, fmt.Errorf("no DB. Aborting...")
		}
		fmt.Println("... Cannot connect to database, wait before retry")
		<-time.After(3 * time.Second)
	}

	// TODO: Double check this
	installConf.InternalUrl = installConf.GetProxyConfig().GetBindURL()

	err = lib.Install(context.Background(), installConf, lib.INSTALL_ALL, func(event *lib.InstallProgressEvent) {
		fmt.Println(event.Message)
	})
	if err != nil {
		return nil, fmt.Errorf("error while performing installation: %s", err.Error())
	}

	return installConf, nil
}

func unmarshallConf() (*install.InstallConfig, error) {

	var confFromFile *install.InstallConfig
	var path string

	if niYmlFile != "" {
		path = niYmlFile
		file, err := ioutil.ReadFile(niYmlFile)
		if err != nil {
			return nil, fmt.Errorf("could not read YAML file at %s: %s", niYmlFile, err.Error())
		}
		err = yaml.Unmarshal(file, &confFromFile)
		if err != nil {
			return nil, fmt.Errorf("error parsing YAML file at %s: %s", niYmlFile, err.Error())
		}

		fmt.Printf("%v", confFromFile)

	}

	if niJsonFile != "" {
		path = niJsonFile

		file, err := ioutil.ReadFile(niJsonFile)
		if err != nil {
			return nil, fmt.Errorf("could not read JSON file at %s: %s", niJsonFile, err.Error())
		}
		err = json.Unmarshal(file, &confFromFile)
		if err != nil {
			return nil, fmt.Errorf("error parsing JSON file at %s: %s", niJsonFile, err.Error())
		}
	}
	fmt.Printf("Retrieved default config from %s\n", path)

	return confFromFile, nil
}

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
	"strings"
	"time"

	"github.com/spf13/cobra"
	"gopkg.in/yaml.v2"

	"github.com/pydio/cells/common/proto/install"
	"github.com/pydio/cells/discovery/install/lib"
)

func nonInteractiveInstall(cmd *cobra.Command, args []string) (*install.InstallConfig, error) {

	if niYamlFile != "" || niJsonFile != "" {
		return installFromConf()
	}

	pconf, err := proxyConfigFromArgs()
	if err != nil {
		return nil, err
	}

	err = applyProxySites([]*install.ProxyConfig{pconf})
	if err != nil {
		return nil, err
	}

	return &install.InstallConfig{ProxyConfig: pconf}, nil
}

func proxyConfigFromArgs() (*install.ProxyConfig, error) {

	proxyConfig := &install.ProxyConfig{}

	bindURL, err := guessSchemeAndParseBaseURL(niBindUrl, true)
	if err != nil {
		return nil, fmt.Errorf("could not parse provided bind URL %s: %s", niBindUrl, err.Error())
	}

	parts := strings.Split(bindURL.Host, ":")
	if len(parts) != 2 {
		return nil, fmt.Errorf("Bind URL %s is not valid. Please correct to use an [IP|DOMAIN]:[PORT] string", niBindUrl)
	}

	scheme := "https"
	if niNoTls { // NO TLS
		scheme = "http"
	} else if niCertFile != "" && niKeyFile != "" {

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
	} else {

		tlsConf := &install.ProxyConfig_SelfSigned{
			SelfSigned: &install.TLSSelfSigned{
				Hostnames: []string{bindURL.Hostname()},
			},
		}
		proxyConfig.TLSConfig = tlsConf
	}

	bindURL.Scheme = scheme

	proxyConfig.Binds = []string{bindURL.String()}

	return proxyConfig, nil
}

func installFromConf() (*install.InstallConfig, error) {

	fmt.Printf("\033[1m## Performing Installation\033[0m \n")

	installConf, err := unmarshallConf()
	if err != nil {
		return nil, err
	}

	// Preconfiguring proxy:
	err = applyProxySites([]*install.ProxyConfig{installConf.GetProxyConfig()})
	if err != nil {
		return nil, fmt.Errorf("could not preconfigure proxy: %s", err.Error())
	}

	if installConf.InternalUrl == "" {
		// only proxy conf => return and launch browser install server
		return installConf, nil
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

	if niYamlFile != "" {
		path = niYamlFile
		file, err := ioutil.ReadFile(niYamlFile)
		if err != nil {
			return nil, fmt.Errorf("could not read YAML file at %s: %s", niYamlFile, err.Error())
		}
		err = yaml.Unmarshal(file, &confFromFile)
		if err != nil {
			return nil, fmt.Errorf("error parsing YAML file at %s: %s", niYamlFile, err.Error())
		}

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

	fmt.Printf("... Install config loaded from %s \n", path)

	return confFromFile, nil
}

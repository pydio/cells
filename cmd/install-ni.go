//go:build exclude

/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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
	"bytes"
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/spf13/cobra"
	"gopkg.in/yaml.v2"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/install"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/discovery/install/lib"
)

type NiInstallConfig struct {
	install.InstallConfig `yaml:",inline"`
	ProxyConfigs          []*install.ProxyConfig `json:"proxyConfigs" yaml:"proxyconfigs"`
	CustomConfigs         map[string]interface{} `json:"customConfigs" yaml:"customconfigs"`
}

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

	if niBindUrl == "" {
		niBindUrl = "default"
	}

	if niBindUrl == "default" {
		def := *config.DefaultBindingSite
		proxyConfig = &def
	} else if p := strings.Split(niBindUrl, ":"); len(p) != 2 {
		return nil, fmt.Errorf("Bind URL %s is not valid. Please correct to use an [IP|DOMAIN]:[PORT] string", niBindUrl)
	} else {
		if p[0] == "" {
			// Only port is set - use DefaultBindSite host
			pp := strings.Split(config.DefaultBindingSite.Binds[0], ":")
			niBindUrl = pp[0] + ":" + p[1]
		}
		proxyConfig.Binds = []string{niBindUrl}
	}

	if niNoTls {

		proxyConfig.TLSConfig = nil

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
			SelfSigned: &install.TLSSelfSigned{}, // Leave hostnames empty
		}
		proxyConfig.TLSConfig = tlsConf

	}

	if niExtUrl != "" {
		extURL, err := guessSchemeAndParseBaseURL(niExtUrl, true)
		if err != nil {
			return nil, fmt.Errorf("could not parse provided URL %s: %s", niExtUrl, err.Error())
		}
		proxyConfig.ReverseProxyURL = extURL.String()
	}

	return proxyConfig, nil
}

func installFromConf() (*install.InstallConfig, error) {

	fmt.Printf("\033[1m## Performing Installation\033[0m \n")

	installConf, err := unmarshallConf()
	if err != nil {
		return nil, err
	}

	updateMultiple := false
	if installConf.ProxyConfig == nil {
		fmt.Println(".... No proxy config")
		if envProxy, e := proxyConfigFromArgs(); e == nil {
			fmt.Println(".... No error while retrieving proxy from args")
			fmt.Printf(".... Env Proxy: %v\n", envProxy)
			installConf.ProxyConfig = envProxy
			updateMultiple = true
		}
	}
	if installConf.ProxyConfig == nil {
		installConf.ProxyConfig = config.DefaultBindingSite
		updateMultiple = true
	}

	// Preconfiguring Sites
	if updateMultiple {
		installConf.ProxyConfigs = append(installConf.ProxyConfigs, installConf.ProxyConfig)
	}
	err = applyProxySites(installConf.ProxyConfigs)
	if err != nil {
		return nil, fmt.Errorf("could not preconfigure proxy: %s", err.Error())
	}

	// Preconfiguring any custom value passed in Json/Yaml
	if installConf.CustomConfigs != nil {
		for k, v := range installConf.CustomConfigs {
			fmt.Println(".... Setting custom configuration key " + k)
			cPath := strings.Split(k, "/")
			if e := config.Set(v, cPath...); e != nil {
				return nil, fmt.Errorf("could not set value for config key " + k)
			}
		}
		if e := config.Save(common.PydioSystemUsername, "Setting custom configs from installation file"); e != nil {
			return nil, e
		}
	}

	iConf := &installConf.InstallConfig
	if installConf.FrontendLogin == "" {
		// only proxy conf => return and launch browser install server
		fmt.Println("FrontendLogin not specified in conf, starting browser-based installation")
		// Make a copy (including defaults => including FrontendLogin) and store it as Partial
		i := *iConf
		err = lib.MergeWithDefaultConfig(&i)
		if err != nil {
			return nil, err
		}
		lib.PartialDefaultConfig = &i
		return iConf, nil
	}

	// Merge with GetDefaults()
	err = lib.MergeWithDefaultConfig(iConf)
	if err != nil {
		log.Fatal("Could not merge conf with defaults", err)
	}

	// Check if pre-configured DB is up and running
	nbRetry := 20
	for i := 0; i < nbRetry; i++ {
		if res, _ := lib.PerformCheck(context.Background(), "DB", iConf); res.Success {
			break
		}
		if i == nbRetry-1 {
			fmt.Println("[Error] Cannot connect to database, you should double check your server and your connection configuration.")
			return nil, fmt.Errorf("No DB. Aborting...")
		}
		fmt.Println("... Cannot connect to database, wait before retry")
		<-time.After(10 * time.Second)
	}

	err = lib.Install(context.Background(), iConf, lib.InstallAll, func(event *lib.InstallProgressEvent) {
		fmt.Println(event.Message)
	})
	if err != nil {
		return nil, fmt.Errorf("error while performing installation: %s", err.Error())
	}

	return iConf, nil
}

func unmarshallConf() (*NiInstallConfig, error) {

	confFromFile := &NiInstallConfig{}
	var path string

	if niYamlFile != "" {
		path = niYamlFile
		file, err := os.ReadFile(niYamlFile)
		if err != nil {
			return nil, fmt.Errorf("could not read YAML file at %s: %s", niYamlFile, err.Error())
		}

		// Replace environment variables before unmarshalling
		resolvedFile, err := replaceEnvVars(file)
		if err != nil {
			return nil, fmt.Errorf("could not replace environment variable in YAML file at %s: %s", niYamlFile, err.Error())
		}

		err = yaml.Unmarshal(resolvedFile, &confFromFile)
		if err != nil {
			return nil, fmt.Errorf("error parsing YAML file at %s: %s", niYamlFile, err.Error())
		}
	}

	if niJsonFile != "" {
		path = niJsonFile
		file, err := os.ReadFile(niJsonFile)
		if err != nil {
			return nil, fmt.Errorf("could not read JSON file at %s: %s", niJsonFile, err.Error())
		}
		err = json.Unmarshal(file, &confFromFile)
		if err != nil {
			return nil, fmt.Errorf("error parsing JSON file at %s: %s", niJsonFile, err.Error())
		}
	}

	if confFromFile.ProxyConfig != nil && len(confFromFile.ProxyConfigs) > 0 {
		return nil, fmt.Errorf("Use one of proxyConfig or proxyConfigs keys, but not both")
	}

	if confFromFile.ProxyConfig != nil {
		confFromFile.ProxyConfigs = append(confFromFile.ProxyConfigs, confFromFile.ProxyConfig)
	} else if len(confFromFile.ProxyConfigs) > 0 {
		confFromFile.ProxyConfig = confFromFile.ProxyConfigs[0]
	}

	if confFromFile.CustomConfigs != nil {
		if title, o := confFromFile.CustomConfigs["frontend/plugin/core.pydio/APPLICATION_TITLE"]; o {
			confFromFile.FrontendApplicationTitle = title.(string)
		}
		if lang, o := confFromFile.CustomConfigs["frontend/plugin/core.pydio/DEFAULT_LANGUAGE"]; o {
			confFromFile.FrontendDefaultLanguage = lang.(string)
		}
	}

	fmt.Printf("... Install config loaded from %s \n", path)

	return confFromFile, nil
}

func applyProxySites(sites []*install.ProxyConfig) error {

	// Save configs
	config.Set(sites, "defaults", "sites")
	err := config.Save("cli", "Saving sites configs")
	if err != nil {
		return err
	}

	// Clean TLS context after the update
	// config.ResetTlsConfigs()
	return nil

}

// replaceEnvVars replaces all occurrences of environment variables.
// Thanks to mholt and Light Code Labs, LLC. See: https://github.com/caddyserver/caddy
func replaceEnvVars(input []byte) ([]byte, error) {
	var offset int
	for {
		begin := bytes.Index(input[offset:], spanOpen)
		if begin < 0 {
			break
		}
		begin += offset // make beginning relative to input, not offset
		end := bytes.Index(input[begin+len(spanOpen):], spanClose)
		if end < 0 {
			break
		}
		end += begin + len(spanOpen) // make end relative to input, not begin

		// get the name; if there is no name, skip it
		envVarName := input[begin+len(spanOpen) : end]
		if len(envVarName) == 0 {
			offset = end + len(spanClose)
			continue
		}

		// get the value of the environment variable
		envVarValue := []byte(os.ExpandEnv(os.Getenv(string(envVarName))))

		// splice in the value
		input = append(input[:begin],
			append(envVarValue, input[end+len(spanClose):]...)...)

		// continue at the end of the replacement
		offset = begin + len(envVarValue)
	}
	return input, nil
}

// spanOpen and spanClose are used to bound spans that
// contain the name of an environment variable.
var spanOpen, spanClose = []byte{'{', '$'}, []byte{'}'}

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

	"google.golang.org/protobuf/proto"
	yaml "gopkg.in/yaml.v2"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/config/routing"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/install"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/discovery/install/lib"
)

type NiInstallConfig struct {
	install.InstallConfig `yaml:",inline"`
	ProxyConfigs          []*install.ProxyConfig `json:"proxyConfigs" yaml:"proxyconfigs"`
}

func nonInteractiveInstall(ctx context.Context) (*install.InstallConfig, error) {

	if niYamlFile != "" || niJsonFile != "" {
		return installFromConf(ctx)
	}

	pconf, err := proxyConfigFromArgs()
	if err != nil {
		return nil, err
	}

	err = applyProxySites(ctx, []*install.ProxyConfig{pconf})
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

		proxyConfig = proto.Clone(routing.DefaultBindingSite).(*install.ProxyConfig)

	} else if p := strings.Split(niBindUrl, ":"); len(p) != 2 {
		return nil, fmt.Errorf("Bind URL %s is not valid. Please correct to use an [IP|DOMAIN]:[PORT] string", niBindUrl)
	} else {
		if p[0] == "" {
			// Only port is set - use DefaultBindSite host
			pp := strings.Split(routing.DefaultBindingSite.Binds[0], ":")
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
			return nil, errors.New("you must accept Let's Encrypt EULA by setting the corresponding flag in order to use this mode")
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

func installFromConf(ctx context.Context) (*install.InstallConfig, error) {

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
		installConf.ProxyConfig = routing.DefaultBindingSite
		updateMultiple = true
	}

	// Preconfiguring Sites
	if updateMultiple {
		installConf.ProxyConfigs = append(installConf.ProxyConfigs, installConf.ProxyConfig)
	}

	err = applyInstallConfigs(ctx, installConf.ProxyConfigs, installConf.CustomConfigs)
	if err != nil {
		return nil, fmt.Errorf("could not preconfigure installation: %s", err.Error())
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
	const nbRetry = 20
	const retryInterval = 10 * time.Second
	ticker := time.NewTicker(retryInterval)
	defer ticker.Stop()
	for attempt := 1; attempt <= nbRetry; attempt++ {
		res, checkErr := lib.PerformCheck(ctx, "DB", iConf)
		if res.Success {
			break
		}
		if checkErr == nil {
			checkErr = errors.New(res.JsonResult)
		}
		if !isRetryableDBError(checkErr) {
			fmt.Printf("[Error] Database check failed (not retryable): %s\n", checkErr)
			return nil, checkErr
		}
		if attempt == nbRetry {
			fmt.Printf("[Error] Cannot connect to database after %d attempts: %s\n", nbRetry, checkErr)
			fmt.Println("Double-check your server, credentials and connection configuration.")
			return nil, errors.New("No DB. Aborting...")
		}
		fmt.Printf("... Database check failed (attempt %d/%d): %s — retrying in %s\n", attempt, nbRetry, checkErr, retryInterval)
		select {
		case <-ctx.Done():
			fmt.Println("[Error] Retries interrupted by user, aborting...")
			return nil, ctx.Err()
		case <-ticker.C:
		}
	}

	err = lib.Install(ctx, iConf, lib.InstallAll, func(event *lib.InstallProgressEvent) {
		fmt.Println(event.Message)
	})
	if err != nil {
		return nil, fmt.Errorf("error while performing installation: %s", err.Error())
	}

	// Installation must leave the configured database usable. This final
	// check also makes sure a database-creation/reconnect failure cannot be
	// mistaken for a successful YAML installation.
	if result, checkErr := lib.PerformCheck(ctx, "DB", iConf); checkErr != nil || !result.Success {
		if checkErr == nil {
			checkErr = errors.New(result.JsonResult)
		}
		return nil, fmt.Errorf("database is not available after installation: %s", checkErr.Error())
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
		return nil, errors.New("Use one of proxyConfig or proxyConfigs keys, but not both")
	}

	if confFromFile.ProxyConfig != nil {
		confFromFile.ProxyConfigs = append(confFromFile.ProxyConfigs, confFromFile.ProxyConfig)
	} else if len(confFromFile.ProxyConfigs) > 0 {
		confFromFile.ProxyConfig = confFromFile.ProxyConfigs[0]
	}

	if confFromFile.CustomConfigs != nil {
		if title, o := confFromFile.CustomConfigs["frontend/plugin/core.pydio/APPLICATION_TITLE"]; o {
			confFromFile.FrontendApplicationTitle = title
		}
		if lang, o := confFromFile.CustomConfigs["frontend/plugin/core.pydio/DEFAULT_LANGUAGE"]; o {
			confFromFile.FrontendDefaultLanguage = lang
		}
	}

	fmt.Printf("... Install config loaded from %s \n", path)

	return confFromFile, nil
}

func applyProxySites(ctx context.Context, sites []*install.ProxyConfig) error {
	return applyInstallConfigs(ctx, sites, nil)
}

// applyInstallConfigs builds and saves one configuration snapshot. In particular,
// this prevents a distributed store watcher from replaying the sites-only save
// over CustomConfigs while a non-interactive installation is still applying them.
func applyInstallConfigs(ctx context.Context, sites []*install.ProxyConfig, customConfigs map[string]string) error {
	if err := setProxySites(ctx, sites); err != nil {
		return err
	}
	if err := setCustomConfigs(ctx, customConfigs); err != nil {
		return err
	}
	user, message := "cli", "Saving sites configs"
	if len(customConfigs) > 0 {
		user = common.PydioSystemUsername
		message = "Setting sites and custom configs from installation file"
	}
	return config.Save(ctx, user, message)
}

func setProxySites(ctx context.Context, sites []*install.ProxyConfig) error {
	return config.Set(ctx, sites, "defaults", "sites")
}

func setCustomConfigs(ctx context.Context, customConfigs map[string]string) error {
	for key, value := range customConfigs {
		configKey := strings.TrimSuffix(key, "#json")
		var configValue interface{} = value
		if strings.HasSuffix(key, "#json") {
			if err := json.Unmarshal([]byte(value), &configValue); err != nil {
				return fmt.Errorf("could not unmarshal custom config %s: %s", configKey, err.Error())
			}
			fmt.Println(".... Setting custom configuration key " + configKey + " (JSON format)")
		} else {
			fmt.Println(".... Setting custom configuration key " + configKey)
		}
		if err := config.Set(ctx, configValue, strings.Split(configKey, "/")...); err != nil {
			return fmt.Errorf("could not set value for config key %s: %w", configKey, err)
		}
	}
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

// isRetryableDBError reports whether a DB check error is worth retrying.
// Auth failures, missing privileges and malformed DSNs won't change between
// retries — return false so install fails fast instead of spinning for 200s.
// Anything else (network errors, server still starting up) stays retryable.
func isRetryableDBError(err error) bool {
	if err == nil {
		return false
	}
	s := err.Error()
	nonRetryable := []string{
		"Error 1045", // MySQL: access denied for user
		"Error 1044", // MySQL: access denied for user to database
		"Error 1142", // MySQL: table-level permission denied
		"Error 1227", // MySQL: access denied; specific privilege required
		"28000",      // Postgres: invalid authorization specification
		"28P01",      // Postgres: invalid password
		"42501",      // Postgres: insufficient privilege
		"Unknown type",
		"could not parse",
		"invalid scheme",
	}
	for _, n := range nonRetryable {
		if strings.Contains(s, n) {
			return false
		}
	}
	return true
}

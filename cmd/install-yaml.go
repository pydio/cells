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
	"fmt"
	"io/ioutil"
	"net/url"
	"os"
	"strings"

	"github.com/spf13/cobra"
	"gopkg.in/yaml.v2"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/install"
	"github.com/pydio/cells/common/utils/net"
	"github.com/pydio/cells/discovery/install/lib"
)

var (
	ymlFile string
)

type SSLConfig struct {
	BindUrl        string `yaml:"bindurl"`
	ExtUrl         string `yaml:"exturl"`
	DisableSSL     bool   `yaml:"disablessl"`
	CertFile       string `yaml:"certfile"`
	KeyFile        string `yaml:"keyfile"`
	LeEmailContact string `yaml:"lemailcontact"`
	LeAcceptEula   bool   `yaml:"leaccepteula"`
}

type CustomConfig struct {
	SSLConfig     *SSLConfig             `yaml:"sslconfig"`
	InstallConfig *install.InstallConfig `yaml:"installconfig"`
}

var installYmlCmd = &cobra.Command{
	Use:   "install-yml",
	Short: "Install Cells using this terminal",
	Long:  "This command launch the installation process of Pydio Cells in the command line instead of a browser.",
	Run: func(cmd *cobra.Command, args []string) {

		if ymlFile == "" {
			log.Fatal("Please provide yaml file by using -f option")
		}

		yamlFile, err := ioutil.ReadFile(ymlFile)
		if err != nil {
			log.Fatal(fmt.Sprintf("Error reading YAML file at %s: %s\n", ymlFile, err.Error()))
		}

		var currConfig *CustomConfig
		err = yaml.Unmarshal(yamlFile, &currConfig)
		if err != nil {
			log.Fatal(fmt.Sprintf("Error parsing YAML file at %s: %s\n", ymlFile, err.Error()))
		}

		cmd.Printf("CurrentConfig: %v\n", currConfig)

		err = handleSSLConfig(currConfig.SSLConfig)
		if err != nil {
			log.Fatal(fmt.Sprintf("Could not configure SSL mode: %s\n", err.Error()))
		}

		cmd.Println("SSL mode configured")

		microStr := currConfig.InstallConfig.GetExternalMicro()
		if microStr == "" || microStr == "0" {
			micro := net.GetAvailablePort()
			config.Set(micro, "ports", common.SERVICE_MICRO_API)
			config.Save("cli", "Install / Setting default Ports")
		}
		cmd.Println("Micro Set")

		_ = lib.GenerateDefaultConfig()
		fmt.Println("\033[1m## Performing Installation\033[0m")

		currConfig.InstallConfig.InternalUrl = currConfig.SSLConfig.BindUrl
		fmt.Println("InternalUrl:", currConfig.InstallConfig.InternalUrl, ":", currConfig.SSLConfig.BindUrl)

		e := lib.Install(context.Background(), currConfig.InstallConfig, lib.INSTALL_ALL, func(event *lib.InstallProgressEvent) {
			fmt.Println(event.Message)
		})
		if e != nil {
			log.Fatal("Error while performing installation: " + e.Error())
		}

		fmt.Println("")
		fmt.Println("... Installation Finished: please restart with '" + os.Args[0] + " start' command")
		fmt.Println("")
	},
}

func handleSSLConfig(c *SSLConfig) error {

	if c.BindUrl == "" || c.ExtUrl == "" {
		return fmt.Errorf("Please define a Bind *and* a public URL to be able to install Cells")
	}

	var saveMsg, prefix string
	var internal, external *url.URL

	if c.DisableSSL {
		prefix = "http://"
		saveMsg = "Install / From Yaml Config / Without SSL"
	} else {
		saveMsg = "Install / From Yaml Config / "
		prefix = "https://"
		config.Set(true, "cert", "proxy", "ssl")

		if c.CertFile != "" && c.KeyFile != "" {
			config.Set(c.CertFile, "cert", "proxy", "certFile")
			config.Set(c.KeyFile, "cert", "proxy", "keyFile")
			saveMsg += "With provided certificate"
		} else if c.LeEmailContact != "" {
			if !c.LeAcceptEula {
				return fmt.Errorf("You must accept Let's Encrypt EULA by setting the 'leaccepteula' property to 'true' in order to use this mode")
			}
			config.Set(false, "cert", "proxy", "self")
			config.Set(c.LeEmailContact, "cert", "proxy", "email")
			config.Set(config.DefaultCaUrl, "cert", "proxy", "caUrl")
			saveMsg += "With Let's Encrypt automatic cert generation"

		} else {
			config.Set(true, "cert", "proxy", "self")
			saveMsg += "With self signed certificate"
		}
	}

	internal, _ = url.Parse(prefix + c.BindUrl)
	config.Set(internal.String(), "defaults", "urlInternal")
	c.BindUrl = internal.String()

	// Enables more complex configs with a proxy.
	if strings.HasPrefix(c.ExtUrl, "http://") || strings.HasPrefix(c.ExtUrl, "https://") {
		external, _ = url.Parse(c.ExtUrl)
	} else {
		external, _ = url.Parse(prefix + c.ExtUrl)
	}
	config.Set(external.String(), "defaults", "url")
	config.Save("cli", saveMsg)

	return nil
}

func init() {

	flags := installYmlCmd.PersistentFlags()
	flags.StringVarP(&ymlFile, "yml-conf-file", "f", "", "[Non interactive mode] with a single YML file")

	RootCmd.AddCommand(installYmlCmd)

}

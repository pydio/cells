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
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
	"gopkg.in/yaml.v2"

	"github.com/pydio/cells/common/proto/install"
)

var (
	testInstallNoTLS = &install.InstallConfig{
		ProxyConfig: &install.ProxyConfig{
			BindURL:     "http://localhost:80",
			ExternalURL: "http://localhost",
		},
	}

	testInstallSelf = &install.InstallConfig{
		ProxyConfig: &install.ProxyConfig{
			BindURL:      "https://localhost:443",
			ExternalURL:  "https://localhost",
			RedirectURLs: []string{"http://localhost"},
			TLSConfig: &install.ProxyConfig_SelfSigned{
				&install.TLSSelfSigned{
					Hostnames: []string{"localhost"},
				},
			},
		},
	}

	testInstallLE = &install.InstallConfig{
		ProxyConfig: &install.ProxyConfig{
			BindURL:      "https://localhost:443",
			ExternalURL:  "https://localhost",
			RedirectURLs: []string{"http://localhost"},
			TLSConfig: &install.ProxyConfig_LetsEncrypt{
				&install.TLSLetsEncrypt{
					Email:      "sofia@example.com",
					AcceptEULA: true,
					StagingCA:  true,
				},
			},
		},
	}

	testInstallCert = &install.InstallConfig{
		ProxyConfig: &install.ProxyConfig{
			BindURL:      "https://localhost:443",
			ExternalURL:  "https://localhost",
			RedirectURLs: []string{"http://localhost"},
			TLSConfig: &install.ProxyConfig_Certificate{
				&install.TLSCertificate{
					CertFile: "/var/cells/cert/cert.pem",
					KeyFile:  "/var/cells/cert/key.pem",
				},
			},
		},
	}
)

func SkipTestMarshallConf(t *testing.T) {

	printMarshalled("NO TLS", testInstallNoTLS)
	printMarshalled("Self Signed", testInstallSelf)
	printMarshalled("Let's encrypt", testInstallLE)
	printMarshalled("Certificate", testInstallCert)

}

func printMarshalled(title string, conf *install.InstallConfig) {

	fmt.Println("#", title)
	fmt.Println("## JSON ")
	data1, _ := json.MarshalIndent(conf, "", "  ")
	fmt.Println(string(data1))
	fmt.Println("## YAML ")
	data2, _ := yaml.Marshal(conf)
	fmt.Println(string(data2))

}

func TestUnmarshallConf(t *testing.T) {
	// FIXME this will fail with modules.
	testDir := filepath.Join(os.Getenv("GOPATH"), "src", "github.com", "pydio", "cells", "cmd", "testdata")

	Convey("Insure sample files are valid", t, func() {

		Convey("From YAML File", func() {

			Convey("No TLS", func() {
				niYmlFile = filepath.Join(testDir, "no-tls.yml")
				installConf, err := unmarshallConf()
				So(err, ShouldBeNil)
				So(installConf.GetProxyConfig(), ShouldNotBeNil)
				So(installConf.GetProxyConfig().GetBindURL(), ShouldEqual, "http://localhost:80")
				So(installConf.GetProxyConfig().GetExternalURL(), ShouldEqual, "http://localhost")
				So(installConf.GetProxyConfig().GetTLSConfig(), ShouldBeNil)
				niYmlFile = ""
			})

			Convey("Self-Signed", func() {
				niYmlFile = filepath.Join(testDir, "self-signed.yml")
				installConf, err := unmarshallConf()
				So(err, ShouldBeNil)

				pc := installConf.GetProxyConfig()

				So(pc, ShouldNotBeNil)
				So(pc.GetBindURL(), ShouldEqual, "https://localhost:8080")
				So(pc.GetExternalURL(), ShouldEqual, "https://localhost:8080")
				So(pc.GetTLSConfig(), ShouldNotBeNil)
				So(pc.GetSelfSigned(), ShouldNotBeNil)
				So(pc.GetLetsEncrypt(), ShouldBeNil)
				So(len(pc.GetSelfSigned().GetHostnames()), ShouldEqual, 1)
				niYmlFile = ""
			})

			Convey("Let's Encrypt", func() {
				niYmlFile = filepath.Join(testDir, "lets-encrypt.yml")
				installConf, err := unmarshallConf()
				So(err, ShouldBeNil)

				pc := installConf.GetProxyConfig()
				So(pc, ShouldNotBeNil)
				So(pc.GetBindURL(), ShouldEqual, "https://localhost:443")
				So(pc.GetExternalURL(), ShouldEqual, "https://localhost")
				So(pc.GetTLSConfig(), ShouldNotBeNil)
				So(pc.GetSelfSigned(), ShouldBeNil)
				So(pc.GetLetsEncrypt(), ShouldNotBeNil)
				So(pc.GetLetsEncrypt().GetEmail(), ShouldEqual, "sofia@example.com")
				So(pc.GetLetsEncrypt().GetAcceptEULA(), ShouldBeTrue)
				So(pc.GetLetsEncrypt().GetStagingCA(), ShouldBeTrue)

				niYmlFile = ""
			})

			Convey("Provided Certificate", func() {
				niYmlFile = filepath.Join(testDir, "provided-cert.yml")
				installConf, err := unmarshallConf()
				So(err, ShouldBeNil)

				pc := installConf.GetProxyConfig()
				So(pc, ShouldNotBeNil)
				So(pc.GetBindURL(), ShouldEqual, "https://localhost:443")
				So(pc.GetExternalURL(), ShouldEqual, "https://localhost")
				So(pc.GetTLSConfig(), ShouldNotBeNil)
				So(pc.GetSelfSigned(), ShouldBeNil)
				So(pc.GetLetsEncrypt(), ShouldBeNil)
				So(pc.GetCertificate(), ShouldNotBeNil)
				So(pc.GetCertificate().GetCertFile(), ShouldEqual, "/var/cells/cert/cert.pem")
				So(pc.GetCertificate().GetKeyFile(), ShouldEqual, "/var/cells/cert/key.pem")
				niYmlFile = ""
			})

		})

		Convey("From JSON File", func() {

			Convey("Bind and Ext should generate a plain HTTP config", func() {
				niJsonFile = filepath.Join(testDir, "no-tls.json")
				installConf, err := unmarshallConf()
				So(err, ShouldBeNil)
				So(installConf.GetProxyConfig(), ShouldNotBeNil)
				So(installConf.GetProxyConfig().GetBindURL(), ShouldEqual, "http://localhost:8080")
				So(installConf.GetProxyConfig().GetExternalURL(), ShouldEqual, "http://localhost:8080")
				So(installConf.GetProxyConfig().GetTLSConfig(), ShouldBeNil)
				niJsonFile = ""
			})

			Convey("Self-Signed", func() {
				niJsonFile = filepath.Join(testDir, "self-signed.json")
				installConf, err := unmarshallConf()
				So(err, ShouldBeNil)

				pc := installConf.GetProxyConfig()

				So(pc, ShouldNotBeNil)
				So(pc.GetBindURL(), ShouldEqual, "https://localhost:8080")
				So(pc.GetExternalURL(), ShouldEqual, "https://localhost:8080")
				So(pc.GetTLSConfig(), ShouldNotBeNil)
				So(pc.GetSelfSigned(), ShouldNotBeNil)
				So(pc.GetLetsEncrypt(), ShouldBeNil)
				So(len(pc.GetSelfSigned().GetHostnames()), ShouldEqual, 1)
				niJsonFile = ""
			})

			Convey("Let's Encrypt", func() {
				niJsonFile = filepath.Join(testDir, "lets-encrypt.json")
				installConf, err := unmarshallConf()
				So(err, ShouldBeNil)

				pc := installConf.GetProxyConfig()
				So(pc, ShouldNotBeNil)
				So(pc.GetBindURL(), ShouldEqual, "https://localhost:443")
				So(pc.GetExternalURL(), ShouldEqual, "https://localhost")
				So(pc.GetTLSConfig(), ShouldNotBeNil)
				So(pc.GetSelfSigned(), ShouldBeNil)
				So(pc.GetLetsEncrypt(), ShouldNotBeNil)
				So(pc.GetLetsEncrypt().GetEmail(), ShouldEqual, "sofia@example.com")
				So(pc.GetLetsEncrypt().GetAcceptEULA(), ShouldBeTrue)
				So(pc.GetLetsEncrypt().GetStagingCA(), ShouldBeTrue)

				niJsonFile = ""
			})

			Convey("Provided Certificate", func() {
				niJsonFile = filepath.Join(testDir, "provided-cert.json")
				installConf, err := unmarshallConf()
				So(err, ShouldBeNil)

				pc := installConf.GetProxyConfig()
				So(pc, ShouldNotBeNil)
				So(pc.GetBindURL(), ShouldEqual, "https://localhost:443")
				So(pc.GetExternalURL(), ShouldEqual, "https://localhost")
				So(pc.GetTLSConfig(), ShouldNotBeNil)
				So(pc.GetSelfSigned(), ShouldBeNil)
				So(pc.GetLetsEncrypt(), ShouldBeNil)
				So(pc.GetCertificate(), ShouldNotBeNil)
				So(pc.GetCertificate().GetCertFile(), ShouldEqual, "/var/cells/cert/cert.pem")
				So(pc.GetCertificate().GetKeyFile(), ShouldEqual, "/var/cells/cert/key.pem")

				niJsonFile = ""
			})

		})
	})
}

func TestNonInteractiveInstall(t *testing.T) {

	Convey("Given an empty config", t, func() {

		// Convey("Bind and Ext should generate a NO TLS config", func() {
		// 	niBindUrl = "localhost:80"
		// 	niExtUrl = "http://localhost"
		// 	pconf, err := proxyConfigFromArgs()
		// 	So(err, ShouldBeNil)
		// 	So(pconf.GetBindURL(), ShouldEqual, "http://"+niBindUrl)
		// 	So(pconf.GetExternalURL(), ShouldEqual, niExtUrl)
		// 	So(pconf.GetTLSConfig(), ShouldBeNil)
		// 	niBindUrl = ""
		// 	niExtUrl = ""
		// })

		// Convey("Selfsign flags is ok", func() {
		// 	niBindUrl = "localhost:443"
		// 	niExtUrl = "https://localhost"
		// 	niSelfSigned = true
		// 	pconf, err := proxyConfigFromArgs()
		// 	So(err, ShouldBeNil)
		// 	So(pconf.GetBindURL(), ShouldEqual, "https://"+niBindUrl)
		// 	So(pconf.GetExternalURL(), ShouldEqual, niExtUrl)
		// 	So(pconf.GetTLSConfig(), ShouldNotBeNil)
		// 	// So(pconf.GetTLSConfig(), ShouldHaveSameTypeAs, *install.ProxyConfig_SelfSigned)

		// 	niBindUrl = "http://localhost:443"
		// 	_, err = proxyConfigFromArgs()
		// 	So(err, ShouldNotBeNil)

		// 	niBindUrl = ""
		// 	niExtUrl = ""
		// 	niSelfSigned = false
		// })

	})
}

// TODO Implement a way to cleanly launch tests on fake commands and test the config store.

// var (
// 	isDebug = false
// )

// func init() {
// 	test = true
// }

// func executeCommand(root *cobra.Command, args ...string) error {

// 	buf := new(bytes.Buffer)
// 	root.SetOutput(buf)
// 	root.SetArgs(args)

// 	_, err := root.ExecuteC()
// 	if err != nil {
// 		return err
// 	}
// 	if isDebug {
// 		fmt.Println(buf.String())
// 	}
// 	return nil
// }

// func TestNonInteractiveInstall(t *testing.T) {

// 	Convey("Given an empty config", t, func() {

// 		Convey("Bind and Ext should generate a self signed config", func() {
// 			// Default self signed
// 			bind := "localhost:80"
// 			ext := "http://localhost"

// 			err := executeCommand(RootCmd, "install", "--bind="+bind, "--external="+ext)
// 			if err != nil {
// 				t.Errorf("Unexpected error: %v", err)
// 			}

// 			So(config.Get("defaults", "urlInternal").String(""), ShouldEqual, "http://"+bind)
// 			So(config.Get("defaults", "url").String(""), ShouldEqual, ext)
// 			So(config.Get("cert", "proxy", "ssl").Bool(false), ShouldBeFalse)
// 		})

// 	})

// }

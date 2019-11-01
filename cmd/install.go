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
	"bytes"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"

	"github.com/manifoldco/promptui"
	_ "github.com/mholt/caddy/caddyhttp"
	"github.com/mholt/caddy/caddytls"
	"github.com/micro/cli"
	"github.com/micro/go-micro/broker"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/caddy"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/utils/net"
	"github.com/pydio/cells/discovery/install/assets"
)

const (
	caddyfile = `
		 {{.URL}} {
			 root "{{.Root}}"
			 proxy /install {{urls .Micro}}
		 	{{if .TLS}}tls {{.TLS}}{{end}}
			{{if .TLSCert}}tls "{{.TLSCert}}" "{{.TLSKey}}"{{end}}
		 }
	 `
)

var (
	caddyconf = struct {
		URL     *url.URL
		Root    string
		Micro   string
		TLS     string
		TLSCert string
		TLSKey  string
	}{}

	niBindUrl        string
	niExtUrl         string
	niDisableSsl     bool
	niCertFile       string
	niKeyFile        string
	niLeEmailContact string
	niLeAcceptEula   bool
	niLeUseStagingCA bool
	ymlFile          string
	jsonFile         string
)

var installCmd = &cobra.Command{
	Use:   "install",
	Short: "Install Cells using a friendly user interface (browser)",
	Long: `This command launch the installation process of Pydio Cells.

 It will ask for the Bind Host to hook the webserver on a network interface IP, and you can set different hosts for accessing
 the machine from outside world (if it is behind a proxy or inside a container with ports mapping for instance).
 
 You can launch this installer in non-interactive mode by providing --bind and --external. This will launch the browser-based
 installer with SSL active using self_signed setup by default. See the possible flags for more details.
 
 You might also use Let's Encrypt automatic certificate generation by providing a contact email and accepting Let's Encrypt EULA, for instance:
 $ ` + os.Args[0] + ` install --bind share.mydomain.tld:443 --external https://share.mydomain.tld --le_email admin@mydomain.tld --le_agree true

 For instance:
 - Bind Host: 0.0.0.0:8080
 - External Host: https://share.mydomain.tld
 Or
 - Bind Host: share.mydomain.tld
 - External Host: https://share.mydomain.tld
 Or
 - Bind Host: IP:1515       # internal port
 - External Host: https://IP:8080   # external port mapped by docker
 Or
 - Bind Host: IP:8080
 - External Host: https://IP:8080
 Or
 - Bind Host: localhost:8080
 - External Host: http://localhost:8080  # for non-secured local installation

 It will open a browser to gather necessary information and configuration for Pydio Cells. 
 Services will all start automatically after the install process is finished.
 
 If you do not have a browser access, you can also perform the whole installation process using this CLI.

 `,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		if err := checkFdlimit(); err != nil {
			return err
		}

		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {

		cmd.Println("")
		cmd.Println("\033[1mWelcome to " + common.PackageLabel + " installation\033[0m")
		cmd.Println(common.PackageLabel + " will be configured to run on this machine. Make sure to prepare the following data")
		cmd.Println(" - IPs and ports for binding the webserver to outside world")
		cmd.Println(" - MySQL 5.6+ (or MariaDB equivalent) server access")
		cmd.Println("Pick your installation mode when you are ready.")
		cmd.Println("")

		var internal, external *url.URL
		exposeInstallServer := false
		var err error

		// A quoi ca sert ca?
		micro := config.Get("ports", common.SERVICE_MICRO_API).Int(0)
		if micro == 0 {
			micro = net.GetAvailablePort()
			config.Set(micro, "ports", common.SERVICE_MICRO_API)
			// config.Save("cli", "Install / Setting default Ports")
			err = config.Save("cli", "Install / Setting default Ports")
			fatalIfError(cmd, err)
		}

		if (niBindUrl != "" && niExtUrl != "") || ymlFile != "" || jsonFile != "" {
			// If these flags are set, non interractive mode
			internal, external, exposeInstallServer, err = nonInterractiveInstall(cmd, args)
			fatalIfError(cmd, err)

		} else {

			// Choose between browser or CLI
			p := promptui.Select{Label: "Installation mode", Items: []string{"Browser-based (requires a browser access)", "Command line (performed in this terminal)"}}
			installIndex, _, err := p.Run()
			fatalIfError(cmd, err)

			// Gather proxy information (we do that now because we must do it anyway in both version of the installer)
			internal, external, err = promptAndApplyProxyConfig()
			fatalIfError(cmd, err)

			if installIndex == 0 {
				exposeInstallServer = true
			} else {
				err := cliInstall(internal)
				fatalIfError(cmd, err)
				return
			}
		}

		if exposeInstallServer { // Run browser install
			performBrowserInstall(cmd, internal, external)
		}

		cmd.Println("")
		cmd.Println(promptui.IconGood + "\033[1m Installation Finished: server will restart\033[0m")
		cmd.Println("")

		// Re-building allServices list
		if s, err := registry.Default.ListServices(); err != nil {
			cmd.Print("Could not retrieve list of services")
			os.Exit(0)
		} else {
			allServices = s
		}

		// Start all services
		excludes := []string{
			common.SERVICE_MICRO_API,
			common.SERVICE_REST_NAMESPACE_ + common.SERVICE_INSTALL,
		}
		for _, service := range allServices {
			ignore := false
			for _, ex := range excludes {
				if service.Name() == ex {
					ignore = true
				}
			}
			if service.Regexp() != nil {
				ignore = true
			}
			if !ignore {
				if service.RequiresFork() {
					if !service.AutoStart() {
						continue
					}
					go service.ForkStart()
				} else {
					go service.Start()
				}
			}
		}

		wg.Add(1)
		wg.Wait()
	},
}

func performBrowserInstall(cmd *cobra.Command, internal, external *url.URL) {

	// Installing the JS data
	dir, err := assets.GetAssets("../discovery/install/assets/src")
	if err != nil {
		dir = filepath.Join(config.ApplicationWorkingDir(), "static", "install")
		if err, _, _ := assets.RestoreAssets(dir, assets.PydioInstallBox, nil); err != nil {
			cmd.Println("Could not restore install package", err)
			os.Exit(0)
		}
	}

	// config.Save("cli", "Install / Setting default Port")	cmd.Println("Got the assets, internal is ", internal.String())

	// Manage TLS settings
	var tls, tlsKey, tlsCert string
	if config.Get("cert", "proxy", "ssl").Bool(false) {
		if config.Get("cert", "proxy", "self").Bool(false) {
			tls = "self_signed"
		} else if config.Get("cert", "proxy", "email").String("") != "" {
			tls = config.Get("cert", "proxy", "email").String("")
			caddytls.Agreed = true
			caddytls.DefaultCAUrl = config.Get("cert", "proxy", "caUrl").String("")
			// useStagingCA := config.Get("cert", "proxy", "useStagingCA").Bool(false)
		} else {
			cert := config.Get("cert", "proxy", "certFile").String("")
			key := config.Get("cert", "proxy", "keyFile").String("")
			if cert != "" && key != "" {
				tlsCert = cert
				tlsKey = key
			}
		}
	}

	config.Save("cli", "Install / Saving final configs")
	cmd.Println("final configs saved")

	// starting the micro service
	micro := registry.Default.GetServiceByName(common.SERVICE_MICRO_API)
	micro.Start()
	cmd.Println("micro started")

	// starting the installation REST service
	install := registry.Default.GetServiceByName(common.SERVICE_INSTALL)

	installServ := install.(service.Service)
	// Strip some flag to avoid panic on re-registering a flag twice
	flags := installServ.Options().Web.Options().Cmd.App().Flags
	var newFlags []cli.Flag
	for _, f := range flags {
		if f.GetName() == "register_ttl" || f.GetName() == "register_interval" {
			continue
		}
		newFlags = append(newFlags, f)
	}
	installServ.Options().Web.Options().Cmd.App().Flags = newFlags

	cmd.Println("starting install server")

	// Starting service install
	install.Start()
	cmd.Println("install server started")

	// Creating temporary caddy file
	caddyconf.URL = internal
	caddyconf.Root = dir
	caddyconf.Micro = common.SERVICE_MICRO_API
	if tls != "" {
		caddyconf.TLS = tls
	} else if tlsCert != "" {
		caddyconf.TLSCert = tlsCert
		caddyconf.TLSKey = tlsKey
	}

	caddy.Enable(caddyfile, play)

	restartDone, err := caddy.StartWithFastRestart()
	if err != nil {
		cmd.Println("Could not start with fast restart:", err)
		os.Exit(1)
	}

	cmd.Println("")
	cmd.Println(promptui.Styler(promptui.FGWhite)("Installation Server is starting ") + promptui.Styler(promptui.FGYellow)("..."))
	cmd.Println(promptui.Styler(promptui.FGWhite)(" internal URL: " + internal.String()))
	cmd.Println(promptui.Styler(promptui.FGWhite)(" external URL: " + external.String()))
	cmd.Println("")

	subscriber, err := broker.Subscribe(common.TOPIC_PROXY_RESTART, func(p broker.Publication) error {
		cmd.Println("")
		cmd.Printf(promptui.Styler(promptui.FGWhite)("Opening URL ") + promptui.Styler(promptui.FGWhite, promptui.FGUnderline, promptui.FGBold)(external.String()) + promptui.Styler(promptui.FGWhite)(" in your browser. Please copy/paste it if the browser is not on the same machine."))
		cmd.Println("")

		open(external.String())

		return nil
	})

	if err != nil {
		cmd.Print(err)
		os.Exit(1)
	}

	<-restartDone
	instance := caddy.GetInstance()
	instance.Wait()

	subscriber.Unsubscribe()
	install.Stop()

}

/* HELPERS */

func play() (*bytes.Buffer, error) {
	template := caddy.Get().GetTemplate()

	buf := bytes.NewBuffer([]byte{})
	if err := template.Execute(buf, caddyconf); err != nil {
		return nil, err
	}

	return buf, nil
}

// open opens the specified URL in the default browser of the user.
func open(url string) error {
	var cmd string
	var args []string
	switch runtime.GOOS {
	case "windows":
		cmd = "cmd"
		args = []string{"/c", "start"}
	case "darwin":
		cmd = "open"
	default: // "linux", "freebsd", "openbsd", "netbsd"
		cmd = "xdg-open"
	}
	args = append(args, url)
	return exec.Command(cmd, args...).Start()
}

func fatalIfError(cmd *cobra.Command, err error) {
	if err != nil {
		cmd.Help()
		log.Fatal(err.Error())
		os.Exit(1)
	}
}

func init() {

	flags := installCmd.PersistentFlags()
	flags.StringVar(&niBindUrl, "bind", "", "Internal URL:PORT on which the main proxy will bind. Self-signed SSL will be used by default")
	flags.StringVar(&niExtUrl, "external", "", "External PROTOCOL:URL:PORT exposed to the outside")
	flags.BoolVar(&niDisableSsl, "no_ssl", false, "Use raw http (no TLS)")
	flags.StringVar(&niCertFile, "ssl_cert_file", "", "TLS cert file path")
	flags.StringVar(&niKeyFile, "ssl_key_file", "", "TLS key file path")
	flags.StringVar(&niLeEmailContact, "le_email", "", "Contact e-mail for Let's Encrypt provided certificate")
	flags.BoolVar(&niLeAcceptEula, "le_agree", false, "Accept Let's Encrypt EULA")
	flags.BoolVar(&niLeUseStagingCA, "le_staging", false, "Rather use staging CA entry point")
	flags.StringVar(&ymlFile, "yaml", "", "Points toward a configuration in YAML format")
	flags.StringVar(&jsonFile, "json", "", "Points toward a configuration in JSON format")

	RootCmd.AddCommand(installCmd)
}

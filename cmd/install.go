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
	"os"
	"os/exec"
	"path/filepath"
	"runtime"

	"github.com/manifoldco/promptui"
	_ "github.com/mholt/caddy/caddyhttp"
	"github.com/micro/cli"
	"github.com/micro/go-micro/broker"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/caddy"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/proto/install"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/utils/net"
	"github.com/pydio/cells/discovery/install/assets"
)

const (
	caddyfile = `
{{range .Sites}}
{{range .Binds}}{{.}} {{end}}{
	root "{{$.WebRoot}}"
	proxy /install {{urls $.Micro}}

	{{if .TLS}}tls {{.TLS}}{{end}}
	{{if .TLSCert}}tls "{{.TLSCert}}" "{{.TLSKey}}"{{end}}
}
{{end}}
	 `
)

var (
	caddyconf = struct {
		Sites   []caddy.SiteConf
		WebRoot string
		Micro   string
	}{}

	niBindUrl          string
	niExtUrl           string
	niNoTls            bool
	niCertFile         string
	niKeyFile          string
	niLeEmailContact   string
	niLeAcceptEula     bool
	niLeUseStagingCA   bool
	niYamlFile         string
	niJsonFile         string
	niExitAfterInstall bool
)

var installCmd = &cobra.Command{
	Use:   "install",
	Short: "Launch the installation process",
	Long: `
 This command launches the installation process of Pydio Cells.

 Be ready to answer a few questions to configure the network connection of your application:
   1. Bind URL: the name (or IP) and port to hook the internal webserver on a the network interface 
   2. TLS Settings: choose the TLS configuration that is exposed by this internal webserver
   3. External URL: the URL you communicate to your end-users. It can differ from your bind address, 
      typically if the app is behind a proxy or inside a container with ports mapping.

 You can also provide these connection parameters via flags to configure the main gateway 
 and directly launch the browser install.
 Typically, define only --bind and --external flags to launch in default self-signed mode: 
 it generates locally trusted certificate with mkcert.
 If you are working locally, the installer opens a browser (if you are installing on a remote server, copy/paste the URL),
 to gather necessary extra information to finalize Pydio Cells installation. 

 Upon installation termination, all micro-services are started automatically and you can directly start using Cells. 
 It is yet good practice to stop the installer and restart cells in normal mode before going live.

 If you do not have a browser access, you can also perform the whole installation process using this CLI.

 See additional flags for more details or use another TLS mode, like in the following example that uses Let's Encrypt automatic certificate generation.

 $ ` + os.Args[0] + ` install --bind share.mydomain.tld:443 --external https://share.mydomain.tld --le_email admin@mydomain.tld --le_agree true

 Here is a list with a few examples of valid URL couples:
 
 - Bind Host: 0.0.0.0:8080
 - External Host: https://share.mydomain.tld
 Or
 - Bind Host: share.mydomain.tld:443
 - External Host: https://share.mydomain.tld
 Or
 - Bind Host: IP:1515               # internal port
 - External Host: https://IP:8080   # external port mapped by docker
 Or
 - Bind Host: localhost:8080
 - External Host: http://localhost:8080  # Non-secured local installation

 `,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		if err := checkFdlimit(); err != nil {
			return err
		}

		plugins.InstallInit()

		initServices()

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

		var proxyConf *install.ProxyConfig
		var err error

		// Do this in a better way
		micro := config.Get("ports", common.SERVICE_MICRO_API).Int(0)
		if micro == 0 {
			micro = net.GetAvailablePort()
			config.Set(micro, "ports", common.SERVICE_MICRO_API)
			err = config.Save("cli", "Install / Setting default Ports")
			fatalIfError(cmd, err)
		}

		if niYamlFile != "" || niJsonFile != "" || (niBindUrl != "" && niExtUrl != "") {

			installConf, err := nonInteractiveInstall(cmd, args)
			fatalIfError(cmd, err)
			if installConf.InternalUrl != "" {
				// We assume we have completely configured Cells. Exit.
				return
			}

			// we only non-interactively configured the proxy, launching browser install
			proxyConf = installConf.GetProxyConfig()

		} else {
			// Ask user to choose between browser or CLI interactive install
			p := promptui.Select{Label: "Installation mode", Items: []string{"Browser-based (requires a browser access)", "Command line (performed in this terminal)"}}
			installIndex, _, err := p.Run()
			fatalIfError(cmd, err)

			// Gather proxy information
			proxyConf, err = promptAndApplyProxyConfig()
			fatalIfError(cmd, err)

			// Prompt for config with CLI, apply and exit
			if installIndex == 1 {
				_, err := cliInstall(proxyConf)
				fatalIfError(cmd, err)
				return
			}
		}

		// Run browser install
		performBrowserInstall(cmd, proxyConf)

		if niExitAfterInstall {
			cmd.Println("")
			cmd.Println(promptui.IconGood + "\033[1m Installation Finished: installation server will stop\033[0m")
			cmd.Println("")
			return
		}

		cmd.Println("")
		cmd.Println(promptui.IconGood + "\033[1m Installation Finished: server will restart\033[0m")
		cmd.Println("")

		plugins.Init()

		initServices()

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

func performBrowserInstall(cmd *cobra.Command, proxyConf *install.ProxyConfig) {

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

	// config.Save("cli", "Install / Saving final configs")
	// cmd.Println("final configs saved")

	// starting the micro service
	micro := registry.Default.GetServiceByName(common.SERVICE_MICRO_API)
	micro.Start()

	// starting the installation REST service
	regService := registry.Default.GetServiceByName(common.SERVICE_INSTALL)

	installServ := regService.(service.Service)
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

	// Starting service install
	regService.Start()

	// Creating temporary caddy file
	sites, err := config.LoadSites()
	if err != nil {
		cmd.Println("Could not start with fast restart:", err)
		os.Exit(1)
	}
	var er error
	caddyconf.Sites, er = caddy.SitesToCaddyConfigs(sites)
	if er != nil {
		cmd.Println("Could not convert sites to caddy confs", er)
	}
	caddyconf.WebRoot = dir
	caddyconf.Micro = common.SERVICE_MICRO_API

	caddy.Enable(caddyfile, play)

	restartDone, err := caddy.StartWithFastRestart()
	if err != nil {
		cmd.Println("Could not start with fast restart:", err)
		os.Exit(1)
	}

	cmd.Println("")
	cmd.Println(promptui.Styler(promptui.FGWhite)("Installation Server is starting ") + promptui.Styler(promptui.FGYellow)("..."))
	cmd.Println(promptui.Styler(promptui.FGWhite)(" internal URL: " + proxyConf.GetBinds()[0]))
	cmd.Println("")

	subscriber, err := broker.Subscribe(common.TOPIC_PROXY_RESTART, func(p broker.Publication) error {
		cmd.Println("")
		cmd.Printf(promptui.Styler(promptui.FGWhite)("Opening URL ") + promptui.Styler(promptui.FGWhite, promptui.FGUnderline, promptui.FGBold)(proxyConf.GetDefaultBindURL()) + promptui.Styler(promptui.FGWhite)(" in your browser. Please copy/paste it if the browser is not on the same machine."))
		cmd.Println("")

		open(proxyConf.GetDefaultBindURL())

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
	regService.Stop()

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
	flags.BoolVar(&niNoTls, "no_tls", false, "Configure the main gateway to rather use plain HTTP")
	flags.StringVar(&niCertFile, "tls_cert_file", "", "TLS cert file path")
	flags.StringVar(&niKeyFile, "tls_key_file", "", "TLS key file path")
	flags.StringVar(&niLeEmailContact, "le_email", "", "Contact e-mail for Let's Encrypt provided certificate")
	flags.BoolVar(&niLeAcceptEula, "le_agree", false, "Accept Let's Encrypt EULA")
	flags.BoolVar(&niLeUseStagingCA, "le_staging", false, "Rather use staging CA entry point")
	flags.StringVar(&niYamlFile, "yaml", "", "Points toward a configuration in YAML format")
	flags.StringVar(&niJsonFile, "json", "", "Points toward a configuration in JSON format")
	flags.BoolVar(&niExitAfterInstall, "exit_after_install", false, "Simply exits main process after the installation is done")

	RootCmd.AddCommand(installCmd)
}

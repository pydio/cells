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
	"net/url"
	"os"
	"os/exec"
	"os/user"
	"path/filepath"
	"runtime"
	"time"

	"github.com/manifoldco/promptui"
	_ "github.com/mholt/caddy/caddyhttp"
	"github.com/micro/go-micro/broker"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/caddy"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/proto/install"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service/metrics"
	"github.com/pydio/cells/common/utils/net"
	"github.com/pydio/cells/discovery/install/assets"
)

const (
	caddyfile = `
{{range .Sites}}
{{range .Binds}}{{.}} {{end}} {
	root "{{$.WebRoot}}"
	proxy /install {{urls $.Micro}}

	{{if .TLS}}tls {{.TLS}}{{end}}
	{{if .TLSCert}}tls "{{.TLSCert}}" "{{.TLSKey}}"{{end}}
}
{{if .SSLRedirect}}
{{range $k,$v := .Redirects}}
{{$k}} {
	redir {{$v}}
}
{{end}}
{{end}}

{{end}}
	 `
)

var (
	DefaultStartCmd *cobra.Command
)

func init() {
	DefaultStartCmd = StartCmd
}

var (
	caddyconf = struct {
		Sites   []caddy.SiteConf
		WebRoot string
		Micro   string
	}{}

	niBindUrl          string
	niExtUrl           string
	niNoTls            bool
	niModeCli          bool
	niCertFile         string
	niKeyFile          string
	niLeEmailContact   string
	niLeAcceptEula     bool
	niLeUseStagingCA   bool
	niYamlFile         string
	niJsonFile         string
	niExitAfterInstall bool
)

// ConfigureCmd launches a wizard (either in this CLI or in your web browser) to configure a new instance of Pydio Cells.
var ConfigureCmd = &cobra.Command{
	Use:     "configure",
	Aliases: []string{"install"},
	Short:   "Setup required configurations",
	Long: `
DESCRIPTION

  Launch the configuration process of Pydio Cells.

REQUIREMENTS

  You must have an available MySQL database, along with a privileged user (for instance 'pydio').
  Supported databases are:
   - MariaDB version 10.3 and above,
   - MySQL version 5.7 and above (except 8.0.22 that has a bug preventing Cells to run correctly).

  As recommended by database documentation, tune the 'max_connections' parameter to a value in line
  with your production database server specifications. For reference, the default value of 151 will have a 
  maximum memory usage of about 575MB, but will not scale up for a multiple users load in production.

BROWSER-BASED INSTALLER

  If you are on a desktop machine, pick browser-based installation at first prompt, or you can force it with:
  $ ` + os.Args[0] + ` configure --bind default
 
  The installer opens a web page on port 8080 with a wizard for you to provide various configuration parameters, 
  including DB connection info and the login/password of the main administrator.

  In case where default port is busy, you can choose another one via the 'bind' flag, for instance:
  $ ` + os.Args[0] + ` configure --bind 0.0.0.0:12345
  or   
  $ ` + os.Args[0] + ` configure --bind <your server IP or FQDN>:12345

  After browser configuration, all microservices are started automatically and you can directly start using Cells. 
  It is yet good practice to stop the installer and restart Cells in normal mode before going live.

COMMAND-LINE INSTALLER

  If you are more a shell person, you can perform the configuration process directly using this CLI (using the '--cli' 
  flag or by choosing so at first prompt). You will then be able to choose to either use the default bindings for the 
  embedded webserver or adapt these to your specific setup.
 
  You can always reconfigure the webserver bindings afterwards by calling this command:
  $ ` + os.Args[0] + ` configure sites
  See corresponding inline documentation for further details.

AUTOMATED PROVISIONING

  For automated, non-interactive installation, you can pass a YAML or a JSON config file that contains all necessary 
  information, please refer to the documentation on https://pydio.com

ENVIRONMENT

  All the command flags documented below are mapped to their associated ENV var using upper case and CELLS_ prefix.
  For example :
  $ ` + os.Args[0] + ` configure --bind :9876
  is equivalent to 
  $ export CELLS_BIND=":9876"; ` + os.Args[0] + ` configure

  For backward compatibility reasons, the --cli, --yaml and --json flags do not respect the above rule (this might evolve in a future version).
  They are respectively equivalent to CELLS_INSTALL_CLI, CELLS_INSTALL_YAML and CELLS_INSTALL_JSON ENV vars.

 `,
	PreRunE: func(cmd *cobra.Command, args []string) error {

		if err := checkFdlimit(); err != nil {
			return err
		}

		initConfig()

		replaceKeys := map[string]string{
			"yaml": "install_yaml",
			"json": "install_json",
			"cli":  "install_cli",
		}

		cmd.Flags().VisitAll(func(flag *pflag.Flag) {
			key := flag.Name
			if replace, ok := replaceKeys[flag.Name]; ok {
				key = replace
			}
			viper.BindPFlag(key, flag)
		})

		// Manually bind to viper instead of flags.StringVar, flags.BoolVar, etc
		niBindUrl = viper.GetString("bind")
		niExtUrl = viper.GetString("external")
		niNoTls = viper.GetBool("no_tls")
		niModeCli = viper.GetBool("install_cli")
		niCertFile = viper.GetString("tls_cert_file")
		niKeyFile = viper.GetString("tls_key_file")
		niLeEmailContact = viper.GetString("le_email")
		niLeAcceptEula = viper.GetBool("le_agree")
		niLeUseStagingCA = viper.GetBool("le_staging")
		niYamlFile = viper.GetString("install_yaml")
		niJsonFile = viper.GetString("install_json")
		niExitAfterInstall = viper.GetBool("exit_after_install")

		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {

		cmd.Println("")
		cmd.Println("\033[1mWelcome to " + common.PackageLabel + " installation\033[0m ")
		cmd.Println(common.PackageLabel + " (v" + common.Version().String() + ") will be configured to run on this machine.")
		cmd.Println("Make sure to prepare access and credentials to a MySQL 5.6+ (or MariaDB equivalent) server.")
		cmd.Println("Pick your installation mode when you are ready.")
		cmd.Println("")

		var proxyConf *install.ProxyConfig
		var err error

		// Do this in a better way
		micro := config.Get("ports", common.ServiceMicroApi).Int()
		if micro == 0 {
			micro = net.GetAvailablePort()
			config.Set(micro, "ports", common.ServiceMicroApi)
			err = config.Save("cli", "Install / Setting default Ports")
			fatalIfError(cmd, err)
		}

		if niYamlFile != "" || niJsonFile != "" || niBindUrl != "" {

			installConf, err := nonInteractiveInstall(cmd, args)
			fatalIfError(cmd, err)
			if installConf.FrontendLogin != "" {
				// We assume we have completely configured Cells. Exit.
				return
			}

			// we only non-interactively configured the proxy, launching browser install
			proxyConf = installConf.GetProxyConfig()

		} else {
			if !niModeCli {
				// Ask user to choose between browser or CLI interactive install
				p := promptui.Select{Label: "Installation mode", Items: []string{"Browser-based (requires a browser access)", "Command line (performed in this terminal)"}}
				installIndex, _, err := p.Run()
				fatalIfError(cmd, err)
				niModeCli = installIndex == 1
			}

			// Gather proxy information
			sites, err := config.LoadSites()
			fatalIfError(cmd, err)
			proxyConf = sites[0]

			// Eventually switch default to HTTP instead of HTTPS
			proxyConf, err = switchDefaultTls(cmd, proxyConf, niNoTls)
			fatalIfError(cmd, err)

			// In Browser mode (and bind url is not explicitly set), make sure to find an available HttpAlt port
			if !niModeCli {
				var message string
				proxyConf, message, err = checkDefaultBusy(cmd, proxyConf, true)
				fatalIfError(cmd, err)
				if message != "" {
					cmd.Println(promptui.IconWarn, message)
				}
			}
		}

		// Prompt for config with CLI, apply and exit
		if niModeCli {
			_, err := cliInstall(cmd, proxyConf)
			fatalIfError(cmd, err)
		} else {
			// Run browser install
			performBrowserInstall(cmd, proxyConf)
		}

		if niExitAfterInstall || (niModeCli && cmd.Name() != "start") {
			cmd.Println("")
			cmd.Println(promptui.IconGood + "\033[1m Installation Finished\033[0m")
			cmd.Println("")
			return
		}

		select {
		case <-cmd.Context().Done():
			return
		default:
			if DefaultStartCmd.PreRunE != nil {
				if err := DefaultStartCmd.PreRunE(cmd, args); err != nil {
					return
				}
			} else if DefaultStartCmd.PreRun != nil {
				DefaultStartCmd.PreRun(cmd, args)
			}

			if DefaultStartCmd.RunE != nil {
				if err := DefaultStartCmd.RunE(cmd, args); err != nil {
					return
				}
			} else if DefaultStartCmd.Run != nil {
				DefaultStartCmd.Run(cmd, args)
			}

			if DefaultStartCmd.PostRunE != nil {
				if err := DefaultStartCmd.PostRunE(cmd, args); err != nil {
					return
				}
			} else if DefaultStartCmd.PostRun != nil {
				DefaultStartCmd.PostRun(cmd, args)
			}
		}
	},
}

func switchDefaultTls(cmd *cobra.Command, proxyConf *install.ProxyConfig, disableTls bool) (*install.ProxyConfig, error) {
	if proxyConf == config.DefaultBindingSite && disableTls {
		// Create a siteConf without TLS
		noTlsConf := *proxyConf
		noTlsConf.TLSConfig = nil
		proxyConf = &noTlsConf
		return proxyConf, config.SaveSites([]*install.ProxyConfig{proxyConf}, common.PydioSystemUsername, "Binding to http (no tls)")
	}
	return proxyConf, nil
}

func checkDefaultBusy(cmd *cobra.Command, proxyConf *install.ProxyConfig, pickOne bool) (*install.ProxyConfig, string, error) {
	if proxyConf != config.DefaultBindingSite {
		return proxyConf, "", nil
	}
	var msg string
	u, e := url.Parse(proxyConf.GetDefaultBindURL())
	if e != nil {
		return proxyConf, "", e
	}
	if e := net.CheckPortAvailability(u.Port()); e != nil {
		if !pickOne {
			// Just inform that port is busy
			return proxyConf, u.Port(), nil
		}
		// Port is busy, pick another one!
		newPort := net.GetAvailableHttpAltPort()
		newConf := *proxyConf
		newConf.Binds[0] = fmt.Sprintf("%s:%d", u.Hostname(), newPort)
		proxyConf = &newConf
		msg = fmt.Sprintf("Default bind : using alternate port %d as default one is busy", newPort)
	}

	var err error
	if msg != "" {
		err = config.SaveSites([]*install.ProxyConfig{proxyConf}, common.PydioSystemUsername, msg)
	}
	return proxyConf, msg, err
}

func performBrowserInstall(cmd *cobra.Command, proxyConf *install.ProxyConfig) {

	ctx, cancel := context.WithCancel(cmd.Context())
	defer cancel()

	initStartingToolsOnce.Do(func() {
		initLogLevel()

		metrics.Init()

		// Initialise the default registry
		handleRegistry()

		// Initialise the default broker
		handleBroker()

		// Initialise the default transport
		handleTransport()

		// Making sure we capture the signals
		handleSignals()
	})

	plugins.Init(ctx, "install")

	initServices()

	// Installing the JS data
	dir, err := assets.GetAssets("../discovery/install/assets/src")
	if err != nil {
		dir = filepath.Join(config.ApplicationWorkingDir(), "static", "install")
		if _, _, err := assets.RestoreAssets(dir, assets.PydioInstallBox, nil); err != nil {
			cmd.Println("Could not restore install package", err)
			os.Exit(0)
		}
	}

	// starting the microservice
	micro := registry.Default.GetServiceByName(common.ServiceMicroApi)
	micro.Start(ctx)

	// starting the installation REST service
	regService := registry.Default.GetServiceByName(common.ServiceInstall)

	// Starting service install
	regService.Start(ctx)

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
	caddyconf.Micro = common.ServiceMicroApi

	caddy.Enable(caddyfile, play)

	restartDone, err := caddy.StartWithFastRestart()
	if err != nil {
		cmd.Println("Could not start with fast restart:", err)
		os.Exit(1)
	}

	cmd.Println("")
	cmd.Println(promptui.Styler(promptui.BGMagenta, promptui.FGWhite)("Installation Server is starting..."))
	cmd.Println(promptui.Styler(promptui.BGMagenta, promptui.FGWhite)("Listening to: " + proxyConf.GetBinds()[0]))
	cmd.Println("")

	subscriber, err := broker.Subscribe(common.TopicProxyRestarted, func(p broker.Publication) error {

		url := proxyConf.ReverseProxyURL
		if url == "" {
			url = proxyConf.GetDefaultBindURL()
		}

		cmd.Println("")
		cmd.Printf(promptui.Styler(promptui.BGMagenta, promptui.FGWhite)("Opening URL ") + promptui.Styler(promptui.BGMagenta, promptui.FGWhite, promptui.FGUnderline, promptui.FGBold)(url) + promptui.Styler(promptui.BGMagenta, promptui.FGWhite)(" in your browser. Please copy/paste it if the browser is not on the same machine."))
		cmd.Println("")

		open(url)

		return nil
	})

	if err != nil {
		cmd.Print("Could not subscribe to broker: ", err)
		os.Exit(1)
	}

	instanceDone := make(chan struct{}, 1)

	go func() {
		<-restartDone
		instance := caddy.GetInstance()
		instance.Wait()
		instanceDone <- struct{}{}
	}()

	defer subscriber.Unsubscribe()

	select {
	case <-instanceDone:
		return
	case <-cmd.Context().Done():
		return
	}
}

/* HELPERS */

func play(site ...caddy.SiteConf) (*bytes.Buffer, error) {
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
		if err == promptui.ErrInterrupt {
			fmt.Println(promptui.IconBad, "Operation aborted by user")
			<-time.After(10 * time.Millisecond)
			os.Exit(1)
		}
		fmt.Println(promptui.IconBad, "Unexpected error happened :", err.Error())
		fmt.Printf("Use \"%s [command] --help\" for more information.", os.Args[0])
		<-time.After(10 * time.Millisecond)
		os.Exit(1)
	}
}

func init() {
	flags := ConfigureCmd.Flags()

	flags.String("bind", "", "Internal IP|DOMAIN:PORT on which the main proxy will bind. Self-signed SSL will be used by default")
	flags.String("external", "", "External full URL (http[s]://IP|DOMAIN[:PORT]) exposed to the outside")

	flags.Bool("cli", false, "Do not prompt for install mode, use CLI mode by default")

	flags.Bool("no_tls", false, "Configure the main gateway to rather use plain HTTP")
	flags.String("tls_cert_file", "", "TLS cert file path")
	flags.String("tls_key_file", "", "TLS key file path")

	flags.String("le_email", "", "Contact e-mail for Let's Encrypt provided certificate")
	flags.Bool("le_agree", false, "Accept Let's Encrypt EULA")
	flags.Bool("le_staging", false, "Rather use staging CA entry point")
	flags.MarkHidden("le_staging")

	flags.String("yaml", "", "Points toward a configuration in YAML format")
	flags.String("json", "", "Points toward a configuration in JSON format")
	flags.Bool("exit_after_install", false, "Simply exits main process after the installation is done")

	addRegistryFlags(flags, true)

	RootCmd.AddCommand(ConfigureCmd)
}

func triggerInstall(message string, prompt string, cmd *cobra.Command, args []string) error {

	cmd.Println("")
	cmd.Println(promptui.IconBad + " " + message)
	cmd.Println("")

	pr := promptui.Prompt{IsConfirm: true, Label: prompt}

	if _, e := pr.Run(); e != nil {
		// Pre-check that pydio.json is properly configured
		var crtUser string
		if u, er := user.Current(); er == nil {
			crtUser = "(currently running as '" + u.Username + "')"
		}
		cmd.Println("")
		cmd.Println("If you have already gone through the basic configuration steps,")
		cmd.Println("it may be that the configuration file is not accessible. Check the permissions.")
		cmd.Println("")
		cmd.Println("The Working Directory is " + config.ApplicationWorkingDir())
		cmd.Println("")
		cmd.Println("If you did not set the CELLS_WORKING_DIR environment variable, make sure you are ")
		cmd.Println("launching the process as the correct OS user " + crtUser + ".")
		cmd.Println("")
		cmd.Println("")
		os.Exit(0)
	} else {
		if ConfigureCmd.PreRunE != nil {
			if err := ConfigureCmd.PreRunE(cmd, args); err != nil {
				return err
			}
		} else if ConfigureCmd.PreRun != nil {
			ConfigureCmd.PreRun(cmd, args)
		}

		if ConfigureCmd.RunE != nil {
			if err := ConfigureCmd.RunE(cmd, args); err != nil {
				return err
			}
		} else if ConfigureCmd.Run != nil {
			ConfigureCmd.Run(cmd, args)
		}

		if ConfigureCmd.PostRunE != nil {
			if err := ConfigureCmd.PostRunE(cmd, args); err != nil {
				return err
			}
		} else if ConfigureCmd.PostRun != nil {
			ConfigureCmd.PostRun(cmd, args)
		}
	}
	return nil
}

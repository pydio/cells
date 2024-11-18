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
	"context"
	_ "embed"
	"fmt"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"net/url"
	"os"
	"os/exec"
	"os/user"
	"runtime"
	"strings"
	"text/template"
	"time"

	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config/routing"
	"github.com/pydio/cells/v4/common/proto/install"
	cruntime "github.com/pydio/cells/v4/common/runtime"
	unet "github.com/pydio/cells/v4/common/utils/net"
)

func init() {
	DefaultStartCmd = StartCmd
}

var (
	//go:embed bootstrap.yaml
	BootstrapYAML string

	DefaultStartCmd *cobra.Command

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

		replaceKeys := map[string]string{
			cruntime.KeyInstallYamlLegacy: cruntime.KeyInstallYaml,
			cruntime.KeyInstallJsonLegacy: cruntime.KeyInstallJson,
			cruntime.KeyInstallCliLegacy:  cruntime.KeyInstallCli,
		}

		cmd.Flags().VisitAll(func(flag *pflag.Flag) {
			key := flag.Name
			if replace, ok := replaceKeys[flag.Name]; ok {
				key = replace
			}
			_ = cellsViper.BindPFlag(key, flag)
		})

		// Manually bind to viper instead of flags.StringVar, flags.BoolVar, etc
		niModeCli = cruntime.GetBool(cruntime.KeyInstallCli)
		niYamlFile = cruntime.GetString(cruntime.KeyInstallYaml)
		niJsonFile = cruntime.GetString(cruntime.KeyInstallJson)
		niExitAfterInstall = cruntime.GetBool(cruntime.KeyInstallExitAfter)

		niBindUrl = cruntime.GetString(cruntime.KeySiteBind)
		niExtUrl = cruntime.GetString(cruntime.KeySiteExternal)
		niNoTls = cruntime.GetBool(cruntime.KeySiteNoTLS)
		niCertFile = cruntime.GetString(cruntime.KeySiteTlsCertFile)
		niKeyFile = cruntime.GetString(cruntime.KeySiteTlsKeyFile)
		niLeEmailContact = cruntime.GetString(cruntime.KeySiteLetsEncryptEmail)
		niLeAcceptEula = cruntime.GetBool(cruntime.KeySiteLetsEncryptAgree)
		niLeUseStagingCA = cruntime.GetBool(cruntime.KeySiteLetsEncryptStaging)

		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {

		cmd.Println("")
		cmd.Println("\033[1mWelcome to " + common.PackageLabel + " installation\033[0m ")
		cmd.Println(common.PackageLabel + " (v" + common.Version().String() + ") will be configured to run on this machine.")
		cmd.Println("Make sure to prepare access and credentials to a MySQL 5.6+ (or MariaDB equivalent) server.")
		cmd.Println("Pick your installation mode when you are ready.")
		cmd.Println("")

		var installConf *install.InstallConfig
		var proxyConf *install.ProxyConfig

		ctx := cmd.Context()

		if niYamlFile != "" || niJsonFile != "" {

			ctx = cruntime.MultiContextManager().RootContext(cmd.Context())
			//cruntime.GetRuntime().Set(cruntime.KeyConfig, "file:///tmp/pydio/pydio.json")
			//cruntime.GetRuntime().Set(cruntime.KeyVault, "file:///tmp/pydio/vault.json")

			mgr, err := manager.NewManager(ctx, "cmd", nil)
			if err != nil {
				return err
			}

			ctx = mgr.Context()
			cmd.SetContext(ctx)
			//var er error
			//ctx, _, er = initConfig(ctx, false)
			//fatalIfError(cmd, er)

			installConf, err = nonInteractiveInstall(ctx)
			fatalIfError(cmd, err)

			// we only non-interactively configured the proxy, launching browser install
			// make sure default bind is set here
			proxyConf = installConf.GetProxyConfig()
			if len(proxyConf.Binds) == 0 {
				fatalIfError(cmd, fmt.Errorf("no bind was found in default site, non interactive install probably has a wrong format"))
			}

		} else {
			if !niModeCli {
				// Ask user to choose between browser or CLI interactive install
				p := promptui.Select{Label: "Installation mode", Items: []string{"Browser-based (requires a browser access)", "Command line (performed in this terminal)"}}
				installIndex, _, err := p.Run()
				fatalIfError(cmd, err)
				niModeCli = installIndex == 1
			}

			var er error
			ctx, _, er = initConfig(ctx, !niModeCli)
			fatalIfError(cmd, er)

			// Gather proxy information
			sites, err := routing.LoadSites(ctx)
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

		cmd.SetContext(ctx)

		// Prompt for config with CLI, apply and exit
		//if niModeCli {
		//	_, err := cliInstall(cmd, proxyConf)
		//	fatalIfError(cmd, err)
		//} else {
		//	// Prepare Context and run browser install
		//	performBrowserInstall(cmd, ctx, proxyConf)
		//}
		//
		//// TODO - allow time for config to be saved - probably a better way ?
		//<-time.After(1 * time.Second)
		//
		//if niExitAfterInstall || (niModeCli && cmd.Name() != "start") {
		//	cmd.Println("")
		//	cmd.Println(promptui.IconGood + "\033[1m Installation Finished\033[0m")
		//	cmd.Println("")
		//	return nil
		//}

		// Reset runtime and hardcode new command to run
		initViperRuntime()

		// Reading template
		tmpl := template.New("bootstrap")
		yml, err := tmpl.Parse(BootstrapYAML)
		fatalIfError(cmd, err)

		str := &strings.Builder{}

		err = yml.Execute(str, installConf)
		fatalIfError(cmd, err)

		bin := os.Args[0]
		cruntime.GetRuntime().Set(cruntime.KeyBootstrapYAML, str.String())
		//cruntime.GetRuntime().Set(cruntime.KeyConfig, "mem://?config=true&env=CELLS_CONFIG_")
		//cruntime.GetRuntime().Set(cruntime.KeyVault, "mem://?vault=true")

		//cruntime.GetRuntime().Set(cruntime.KeyConfig, "file:///tmp/pydio/pydio.json?env=CELLS_CONFIG_")
		//cruntime.GetRuntime().Set(cruntime.KeyVault, "file:///tmp/pydio/vault.json")

		for k, v := range installConf.CustomConfigs {
			os.Setenv("CELLS_CONFIG_"+k, v)
		}

		//dsObjectsMap := map[string]any{
		//	"Name":        installConf.DsName,
		//	"StorageType": object.StorageType_S3,
		//	"RunningPort": installConf.DsPort,
		//	"EndpointURL": installConf.DsS3Custom,
		//	"ApiKey":      installConf.DsS3ApiKey,
		//	"ApiSecret":   installConf.DsS3ApiSecret,
		//	"GatewayConfiguration": map[string]string{
		//		object.StorageKeySignatureVersion: "v4",
		//	},
		//	"LocalFolder": installConf.DsFolder,
		//}
		//dsObjectsMapStr, _ := json.Marshal(dsObjectsMap)
		//
		//dsSyncStorageConfiguration := map[string]string{
		//	object.StorageKeyFolder:           installConf.DsFolder,
		//	object.StorageKeyFolderCreate:     "true",
		//	object.StorageKeyCellsInternal:    "false",
		//	object.StorageKeyCustomEndpoint:   installConf.DsS3Custom,
		//	object.StorageKeySignatureVersion: "v4",
		//	object.StorageKeyMinioServer:      "true",
		//	object.StorageKeyBucketsTags:      "",
		//	object.StorageKeyObjectsTags:      "",
		//	object.StorageKeyNativeEtags:      "",
		//	object.StorageKeyBucketsRegexp:    "",
		//	object.StorageKeyReadonly:         "false",
		//	object.StorageKeyStorageClass:     "STANDARD",
		//}
		//
		//dsSyncMap := map[string]any{
		//	"Name":                 installConf.DsName,
		//	"StorageType":          object.StorageType_S3,
		//	"StorageConfiguration": dsSyncStorageConfiguration,
		//	"ObjectsServiceName":   installConf.DsName,
		//	"ObjectsBucket":        "test",
		//	"ApiKey":               installConf.DsS3ApiKey,
		//	"ApiSecret":            installConf.DsS3ApiSecret,
		//	"FlatStorage":          true,
		//}
		//dsSyncMapStr, _ := json.Marshal(dsSyncMap)
		//
		//dsThumbsStore := map[string]string{
		//	"bucket":     "thumbs",
		//	"datasource": installConf.DsName,
		//}
		//dsThumbsStoreStr, _ := json.Marshal(dsThumbsStore)
		//
		//dsVersionsStore := map[string]string{
		//	"bucket":     "versions",
		//	"datasource": installConf.DsName,
		//}
		//
		//dsVersionsStoreStr, _ := json.Marshal(dsVersionsStore)
		//
		//dsSources := []string{
		//	installConf.DsName,
		//}
		//dsSourcesStr, _ := json.Marshal(dsSources)
		//
		//os.Setenv("CELLS_CONFIG_"+"services/pydio.grpc.data.sync."+installConf.DsName, string(dsSyncMapStr))
		//os.Setenv("CELLS_CONFIG_"+"services/pydio.grpc.data.objects."+installConf.DsName, string(dsObjectsMapStr))
		//os.Setenv("CELLS_CONFIG_"+"services/pydio.thumbs_store", string(dsThumbsStoreStr))
		//os.Setenv("CELLS_CONFIG_"+"services/pydio.versions-store", string(dsVersionsStoreStr))
		//os.Setenv("CELLS_CONFIG_"+"services/pydio.grpc.data.objects/sources", string(dsSourcesStr))
		//os.Setenv("CELLS_CONFIG_"+"services/pydio.grpc.data.index/sources", string(dsSourcesStr))
		//os.Setenv("CELLS_CONFIG_"+"services/pydio.grpc.data.sync/sources", string(dsSourcesStr))
		//
		//// TODO - align with idm/user/grpc/defaults.go
		//cruntime.GetRuntime().Set("PYDIO_ADMIN_USER_LOGIN", installConf.FrontendLogin)
		//cruntime.GetRuntime().Set("PYDIO_ADMIN_USER_PASSWORD", installConf.FrontendPassword)
		//os.Setenv("PYDIO_ADMIN_USER_LOGIN", installConf.FrontendLogin)
		//os.Setenv("PYDIO_ADMIN_USER_PASSWORD", installConf.FrontendPassword)

		fmt.Println("HERE IS THE BOOTSTRAP YAML", str.String())

		os.Args = []string{bin, "start"}

		e := DefaultStartCmd.ExecuteContext(ctx)
		if e != nil {
			panic(e)
		}

		return nil
	},
}

func switchDefaultTls(cmd *cobra.Command, proxyConf *install.ProxyConfig, disableTls bool) (*install.ProxyConfig, error) {
	if proxyConf == routing.DefaultBindingSite && disableTls {
		// Create a siteConf without TLS
		noTlsConf := *proxyConf
		noTlsConf.TLSConfig = nil
		proxyConf = &noTlsConf
		return proxyConf, routing.SaveSites(ctx, []*install.ProxyConfig{proxyConf}, common.PydioSystemUsername, "Binding to http (no tls)")
	}
	return proxyConf, nil
}

func checkDefaultBusy(cmd *cobra.Command, proxyConf *install.ProxyConfig, pickOne bool) (*install.ProxyConfig, string, error) {
	if proxyConf != routing.DefaultBindingSite {
		return proxyConf, "", nil
	}
	var msg string
	u, e := url.Parse(proxyConf.GetDefaultBindURL())
	if e != nil {
		return proxyConf, "", e
	}
	if e := unet.CheckPortAvailability(u.Port()); e != nil {
		if !pickOne {
			// Just inform that port is busy
			return proxyConf, u.Port(), nil
		}
		// Port is busy, pick another one!
		newPort := unet.GetAvailableHttpAltPort()
		newConf := *proxyConf
		newConf.Binds[0] = fmt.Sprintf("%s:%d", u.Hostname(), newPort)
		proxyConf = &newConf
		msg = fmt.Sprintf("Default bind : using alternate port %d as default one is busy", newPort)
	}

	var err error
	if msg != "" {
		err = routing.SaveSites(ctx, []*install.ProxyConfig{proxyConf}, common.PydioSystemUsername, msg)
	}
	return proxyConf, msg, err
}

func performBrowserInstall(cmd *cobra.Command, ctx context.Context, proxyConf *install.ProxyConfig) {
	panic("implement me")
	/*
		ctx, cancel := context.WithCancel(ctx)
		defer cancel()

		initLogLevel()

		reg, err := registry.OpenRegistry(ctx, cruntime.RegistryURL())
		if err != nil {
			return
		}
		cruntime.SetDefault(cruntime.KeyHttpServer, cruntime.HttpServerCaddy)
		managerLogger := log.Logger(cruntime.WithServiceName(ctx, "pydio.server.manager"))
		m := manager.NewManager(ctx, reg, "mem:///", "install", managerLogger)

		bkr := broker.NewBroker(cruntime.BrokerURL())
		ctx = propagator.With(broker.ContextKey, bkr)

		openURL := proxyConf.GetDefaultBindURL()
		if runtime.GOOS == "windows" {
			// Windows browser cannot find 0.0.0.0 - use localhost instead.
			openURL = strings.Replace(openURL, "0.0.0.0", "localhost", 1)
		}

		cmd.Println("")
		cmd.Println(promptui.Styler(promptui.BGMagenta, promptui.FGWhite)("Installation Server is starting..."))
		cmd.Println(promptui.Styler(promptui.BGMagenta, promptui.FGWhite)("Listening to: " + proxyConf.GetDefaultBindURL()))
		cmd.Println("")

		if err := m.Init(ctx); err != nil {
			panic(err)
		}

		m.ServeAll(server.WithErrorCallback(func(err error) {
			panic(err)
		}))

		<-time.After(2 * time.Second)
		if err := open(openURL); err != nil {
			fmt.Println(promptui.Styler(promptui.BGMagenta, promptui.FGWhite)("Open a browser window to: [" + openURL + "]"))
		}

		done := make(chan bool, 1)
		unsub, _ := bkr.Subscribe(ctx, common.TopicInstallSuccessEvent, func(context.Context, broker.Message) error {
			fmt.Println("Browser install is finished. Stopping server in 5s...")
			<-time.After(2 * time.Second)
			done <- true
			return nil
		})

		<-done
		close(done)
		m.StopAll()
		_ = unsub()

		return

	*/
}

/* HELPERS */

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

	flags.Bool(cruntime.KeyInstallCliLegacy, false, "Do not prompt for install mode, use CLI mode by default")
	flags.String(cruntime.KeyInstallYamlLegacy, "", "Points toward a configuration in YAML format")
	flags.String(cruntime.KeyInstallJsonLegacy, "", "Points toward a configuration in JSON format")
	flags.Bool(cruntime.KeyInstallExitAfter, false, "Simply exits main process after the installation is done")
	flags.String(cruntime.KeyBindHost, "127.0.0.1", "Address on which servers will bind. Binding port depends on the server type (grpc, http, etc).")

	addSiteOverrideFlags(flags, true)
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
		cmd.Println("The Working Directory is " + cruntime.ApplicationWorkingDir())
		cmd.Println("")
		cmd.Println("If you did not set the CELLS_WORKING_DIR environment variable, make sure you are ")
		cmd.Println("launching the process as the correct OS user " + crtUser + ".")
		cmd.Println("")
		cmd.Println("")
		os.Exit(0)
	} else {

		initViperRuntime()
		bin := os.Args[0]
		os.Args = []string{bin, "configure"}
		return ConfigureCmd.ExecuteContext(cmd.Context())

	}
	return nil
}

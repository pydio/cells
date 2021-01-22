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

// Package cmd implements commands for running pydio services
package cmd

import (
	"context"
	"fmt"
	log2 "log"
	"os"
	"os/user"
	"path/filepath"
	"strings"
	"time"

	"github.com/manifoldco/promptui"
	"github.com/spf13/pflag"

	"github.com/micro/go-micro/server"
	"github.com/micro/go-web"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/config/micro"
	"github.com/pydio/cells/common/config/micro/file"
	"github.com/pydio/cells/common/config/micro/vault"
	"github.com/pydio/cells/common/config/migrations"
	"github.com/pydio/cells/common/config/sql"
	"github.com/pydio/cells/common/log"
	microregistry "github.com/pydio/cells/common/micro/registry"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/utils/net"
	"github.com/pydio/cells/x/filex"
	json "github.com/pydio/cells/x/jsonx"

	// All brokers
	httpbroker "github.com/pydio/cells/common/micro/broker/http"
	natsbroker "github.com/pydio/cells/common/micro/broker/nats"

	// All registries

	// All transports
	grpctransport "github.com/pydio/cells/common/micro/transport/grpc"

	//
	microconfig "github.com/pydio/go-os/config"
)

var (
	ctx         context.Context
	cancel      context.CancelFunc
	allServices []registry.Service

	profiling bool
	profile   *os.File

	IsFork       bool
	EnvPrefixOld = "pydio"
	EnvPrefixNew = "cells"

	installCommands = []string{"configure", "install"}
	infoCommands    = []string{"version", "completion", "doc", "help", "--help", "bash", "zsh", os.Args[0]}
)

const startTagUnique = "unique"

// RootCmd represents the base command when called without any subcommands
var RootCmd = &cobra.Command{
	Use:   os.Args[0],
	Short: "Secure File Sharing for business",
	Long: `
DESCRIPTION

  Cells is a comprehensive sync & share solution for your collaborators. 
  Open-source software deployed on-premise or in a private cloud.

CONFIGURE

  For the very first run, use '` + os.Args[0] + ` configure' to begin the browser-based or command-line based installation wizard. 
  Services will automatically start at the end of a browser-based installation.

RUN

  Run '$ ` + os.Args[0] + ` start' to load all services.

WORKING DIRECTORIES

  By default, application data is stored under the standard OS application dir : 
  
   - Linux: ${USER_HOME}/.config/pydio/cells
   - Darwin: ${USER_HOME}/Library/Application Support/Pydio/cells
   - Windows: ${USER_HOME}/ApplicationData/Roaming/Pydio/cells

  You can customize the storage locations with the following ENV variables : 
  
   - CELLS_WORKING_DIR: replace the whole standard application dir
   - CELLS_DATA_DIR: replace the location for storing default datasources (default CELLS_WORKING_DIR/data)
   - CELLS_LOG_DIR: replace the location for storing logs (default CELLS_WORKING_DIR/logs)
   - CELLS_SERVICES_DIR: replace location for services-specific data (default CELLS_WORKING_DIR/services) 

LOGS LEVEL

  By default, logs are outputted in console format at the Info level. You can set the --log flag or set the 
  CELLS_LOGS_LEVEL environment variable to one of the following values:
   - debug, info, error: logs are written in console format with the according level
   - production: logs are written in json format, to be used with a log aggregator tool.

SERVICES DISCOVERY

  Microservices use NATS as a registry mechanism to discover each other. Cells ships and starts its own NATS (nats.io) 
  implementation, unless a nats server is already running on the standard port, in which case it will be detected.
`,
	PersistentPreRun: func(cmd *cobra.Command, args []string) {
		// Special case
		if cmd.Long == StartCmd.Long {
			common.LogCaptureStdOut = true
		}

		// These commands do not need to init the configuration
		for _, skip := range infoCommands {
			if cmd.Name() == skip {
				return
			}
		}
	},
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
}

func skipInstallInit() bool {
	if len(os.Args) <= 1 {
		return true
	}
	arg := os.Args[1]

	for _, skip := range installCommands {
		if arg == skip {
			return false
		}
	}

	return true
}

func skipCoreInit() bool {
	if len(os.Args) == 1 {
		return true
	}

	arg := os.Args[1]

	for _, skip := range infoCommands {
		if arg == skip {
			return true
		}
	}

	return false
}

func init() {
	cobra.OnInitialize(
		initInstallConfig,
		initConfig,
	)

	initEnvPrefixes()
	viper.SetEnvPrefix(EnvPrefixNew)
	viper.AutomaticEnv()

	flags := RootCmd.PersistentFlags()

	flags.String("config", "local", "Config")
	flags.MarkHidden("config")

	replaceKeys := map[string]string{
		"log":  "logs_level",
		"fork": "is_fork",
	}
	flags.VisitAll(func(flag *pflag.Flag) {
		key := flag.Name
		if replace, ok := replaceKeys[flag.Name]; ok {
			key = replace
		}
		flag.Usage += " [" + strings.ToUpper("$"+EnvPrefixNew+"_"+key) + "]"
		viper.BindPFlag(key, flag)
	})

}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	// Check PrivateIP and setup Advertise
	initAdvertiseIP()

	ctx, cancel = context.WithCancel(context.Background())
	defer cancel()

	if err := RootCmd.ExecuteContext(ctx); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func initInstallConfig() {

	if skipInstallInit() {
		return
	}

	versionsStore := filex.NewStore(config.PydioConfigDir)

	written, err := filex.WriteIfNotExists(filepath.Join(config.PydioConfigDir, config.PydioConfigFile), config.SampleConfig)
	if err != nil {
		fmt.Println("Error while trying to create default config file")
		os.Exit(1)
	}

	if written {
		var data interface{}
		if e := json.Unmarshal([]byte(config.SampleConfig), &data); e == nil {
			versionsStore.Put(&filex.Version{
				User: "cli",
				Date: time.Now(),
				Log:  "Initialize with sample config",
				Data: data,
			})
		}
	}
}

func initConfig() {

	if skipCoreInit() {
		return
	}

	if !filex.Exists(filepath.Join(config.PydioConfigDir, config.PydioConfigFile)) {
		var crtUser string
		if u, er := user.Current(); er == nil {
			crtUser = "(currently running as '" + u.Username + "')"
		}
		fmt.Println("****************************************************************************************")
		fmt.Println("# ")
		fmt.Println("# " + promptui.IconBad + " Oops, cannot find a valid configuration for Cells !")
		fmt.Println("# ")
		fmt.Println("# A - If it is your first start, make sure to first run the configuration steps using:")
		fmt.Println("#     $> " + os.Args[0] + " configure")
		fmt.Println("# ")
		fmt.Println("# B - If you have already installed, maybe the configuration file is not accessible.")
		fmt.Println("#     Working Directory is " + config.ApplicationWorkingDir())
		fmt.Println("#     If you did not set the CELLS_WORKING_DIR environment variable, make sure you are ")
		fmt.Println("#     launching the process as the correct OS user " + crtUser + ".")
		fmt.Println("# ")
		fmt.Println("****************************************************************************************")
		fmt.Println("")
		fmt.Println("Exiting now...")
		os.Exit(0)
		return
	}

	versionsStore := filex.NewStore(config.PydioConfigDir)

	var vaultConfig config.Store
	var defaultConfig config.Store

	switch viper.GetString("config") {
	case "mysql":
		vaultConfig = config.New(sql.New("mysql", "root@tcp(localhost:3306)/cells?parseTime=true", "vault"))
		defaultConfig = config.NewVault(
			config.New(config.NewVersionStore(versionsStore, sql.New("mysql", "root@tcp(localhost:3306)/cells?parseTime=true", "default"))),
			vaultConfig,
		)
	default:
		source := file.NewSource(
			microconfig.SourceName(filepath.Join(config.PydioConfigDir, config.PydioConfigFile)),
		)

		vaultConfig = config.New(
			micro.New(
				microconfig.NewConfig(
					microconfig.WithSource(
						vault.NewVaultSource(
							filepath.Join(config.PydioConfigDir, "pydio-vault.json"),
							filepath.Join(config.PydioConfigDir, "cells-vault-key"),
							true,
						),
					),
					microconfig.PollInterval(10*time.Second),
				),
			))

		defaultConfig =
			config.NewVault(
				config.New(
					config.NewVersionStore(versionsStore, micro.New(
						microconfig.NewConfig(
							microconfig.WithSource(source),
							microconfig.PollInterval(10*time.Second),
						),
					),
					)),
				vaultConfig,
			)
	}

	config.Register(defaultConfig)
	config.RegisterVault(vaultConfig)
	config.RegisterVersionStore(versionsStore)

	// Need to do something for the versions
	if save, err := migrations.UpgradeConfigsIfRequired(defaultConfig.Val(), common.Version()); err == nil && save {
		if err := config.Save(common.PydioSystemUsername, "Configs upgrades applied"); err != nil {
			log.Fatal("Could not save config migrations", zap.Error(err))
		}
	}
}

func initLogLevel() {

	if skipCoreInit() {
		return
	}

	// Init log level
	logLevel := viper.GetString("logs_level")

	// Making sure the log level is passed everywhere (fork processes for example)
	os.Setenv("CELLS_LOGS_LEVEL", logLevel)

	if logLevel == "production" {
		common.LogConfig = common.LogConfigProduction
	} else {
		common.LogConfig = common.LogConfigConsole
		switch logLevel {
		case "info":
			common.LogLevel = zap.InfoLevel
		case "debug":
			common.LogLevel = zap.DebugLevel
		case "error":
			common.LogLevel = zap.ErrorLevel
		}
	}

	log.Init()
}

func initServices() {
	registry.Default.BeforeInit()

	registry.Init()

	registry.Default.AfterInit()
}

func initAdvertiseIP() {
	ok, advertise, err := net.DetectHasPrivateIP()
	if err != nil {
		log2.Fatal(err.Error())
	}
	if !ok {
		net.DefaultAdvertiseAddress = advertise
		web.DefaultAddress = advertise + ":0"
		server.DefaultAddress = advertise + ":0"
		if advertise != "127.0.0.1" {
			fmt.Println("Warning: no private IP detected for binding broker. Will bind to " + net.DefaultAdvertiseAddress + ", which may give public access to the broker.")
		}
	}
}

func handleRegistry() {

	switch viper.Get("registry") {
	case "nats":
		microregistry.EnableNats()
	default:
		log.Fatal("registry not supported - currently only nats is supported")
	}
}

func handleBroker() {
	switch viper.Get("broker") {
	case "nats":
		natsbroker.Enable()
	case "http":
		httpbroker.Enable()
	default:
		log.Fatal("broker not supported")
	}
}

func handleTransport() {
	switch viper.Get("transport") {
	case "grpc":
		grpctransport.Enable()
	default:
		log.Fatal("transport not supported")
	}
}

func initEnvPrefixes() {
	prefOld := strings.ToUpper(EnvPrefixOld) + "_"
	prefNew := strings.ToUpper(EnvPrefixNew) + "_"
	for _, pair := range os.Environ() {
		if strings.HasPrefix(pair, prefOld) {
			parts := strings.Split(pair, "=")
			if len(parts) == 2 && parts[1] != "" {
				//fmt.Println("Setting", pair, prefNew+strings.TrimPrefix(parts[0], prefOld), parts[1])
				os.Setenv(prefNew+strings.TrimPrefix(parts[0], prefOld), parts[1])
			}
		}
	}
}

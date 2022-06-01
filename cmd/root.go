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
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/config/migrations"
	"github.com/pydio/cells/v4/common/config/revisions"
	"github.com/pydio/cells/v4/common/crypto"
	"github.com/pydio/cells/v4/common/log"
	cw "github.com/pydio/cells/v4/common/log/context-wrapper"
	log2 "github.com/pydio/cells/v4/common/proto/log"
	"github.com/pydio/cells/v4/common/runtime"

	// Implicit available config types
	_ "github.com/pydio/cells/v4/common/config/etcd"
	_ "github.com/pydio/cells/v4/common/config/service"
	_ "github.com/pydio/cells/v4/common/config/vault"
)

var (
	ctx          context.Context
	cancel       context.CancelFunc
	cellsViper   *viper.Viper
	infoCommands = []string{"version", "completion", "doc", "help", "--help", "bash", "zsh", os.Args[0]}
)

const (
	EnvPrefixOld = "pydio"
	EnvPrefixNew = "cells"
)

// RootCmd represents the base command when called without any subcommands
var RootCmd = &cobra.Command{
	Use:   os.Args[0],
	Short: "Secure File Sharing for business",
	Long: `
DESCRIPTION

  Pydio Cells is self-hosted Document Sharing & Collaboration software for organizations that need 
  advanced sharing without security trade-offs. Cells gives you full control of your document sharing 
  environment – combining fast performance, huge file transfer sizes, granular security, and advanced 
  workflow automations in an easy-to-set-up and easy-to-support self-hosted platform.

CONFIGURE

  For the very first run, use '` + os.Args[0] + ` configure' to begin the browser-based or command-line based installation wizard. 
  Services will automatically start at the end of a browser-based installation.

RUN

  Run '$ ` + os.Args[0] + ` start' to load all services.

WORKING DIRECTORIES

  By default, application data is stored under the standard OS application dir: 
  
   - Linux: ${USER_HOME}/.config/pydio/cells
   - Darwin: ${USER_HOME}/Library/Application Support/Pydio/cells
   - Windows: ${USER_HOME}/ApplicationData/Roaming/Pydio/cells

  You can customize the storage locations with the following ENV variables: 
  
   - CELLS_WORKING_DIR: replace the whole standard application dir
   - CELLS_DATA_DIR: replace the location for storing default datasources (default CELLS_WORKING_DIR/data)
   - CELLS_LOG_DIR: replace the location for storing logs (default CELLS_WORKING_DIR/logs)
   - CELLS_SERVICES_DIR: replace location for services-specific data (default CELLS_WORKING_DIR/services) 

LOGS LEVEL

  By default, logs are outputted in console format at the Info level and appended to a CELLS_LOG_DIR/pydio.log file. You can: 
   - Change the level (debug, info, warn or error) with the --log flag
   - Output the logs in json format with --log_json=true 
   - Prevent logs from being written to a file with --log_to_file=false

  For backward compatibility:
   - The CELLS_LOGS_LEVEL environment variable still works to define the --log flag (or CELLS_LOG env var)
     but is now deprecated and will disappear in version 4.     
   - The --log=production flag still works and is equivalent to "--log=info --log_json=true --log_to_file=true"
      
`,
}

func init() {
	initEnvPrefixes()
	initViperRuntime()

	RootCmd.PersistentFlags().String(runtime.KeyConfig, "file://"+filepath.Join(runtime.ApplicationWorkingDir(), runtime.DefaultConfigFileName), "Configuration URL")

	RootCmd.PersistentFlags().String(runtime.KeyVault, "detect", "Vault URL")
	_ = RootCmd.PersistentFlags().MarkHidden(runtime.KeyVault)

	RootCmd.PersistentFlags().String(runtime.KeyKeyring, "file://"+filepath.Join(runtime.ApplicationWorkingDir(), runtime.DefaultKeyringFileName)+"?keyring=true", "Keyring URL")
	_ = RootCmd.PersistentFlags().MarkHidden(runtime.KeyKeyring)
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	ctx, cancel = context.WithCancel(context.Background())
	if err := RootCmd.ExecuteContext(ctx); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

// initEnvPrefixes looks up for legacy ENV and replace them
func initEnvPrefixes() {
	prefOld := strings.ToUpper(EnvPrefixOld) + "_"
	prefNew := strings.ToUpper(EnvPrefixNew) + "_"
	for _, pair := range os.Environ() {
		if strings.HasPrefix(pair, prefOld) {
			parts := strings.Split(pair, "=")
			if len(parts) == 2 && parts[1] != "" {
				os.Setenv(prefNew+strings.TrimPrefix(parts[0], prefOld), parts[1])
			}
		} else if strings.HasPrefix(pair, "CELLS_LOGS_LEVEL") {
			parts := strings.Split(pair, "=")
			if len(parts) == 2 && parts[1] != "" {
				os.Setenv("CELLS_LOG", parts[1])
			}
		}
	}
}

func initViperRuntime() {
	cellsViper = viper.New()
	cellsViper.SetEnvPrefix(EnvPrefixNew)
	cellsViper.AutomaticEnv()
	cellsViper.AddConfigPath(runtime.ApplicationWorkingDir())
	if p, er := os.Getwd(); er == nil {
		cellsViper.AddConfigPath(p)
	}
	// TODO - not sure what it should be but not cells - else it's trying to load the binary as config
	cellsViper.SetConfigName("cells_local")
	cellsViper.SetConfigType("env")
	_ = cellsViper.ReadInConfig()

	runtime.SetRuntime(cellsViper)
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

func initConfig(ctx context.Context, debounceVersions bool) (new bool, keyring crypto.Keyring, er error) {

	if skipCoreInit() {
		return
	}

	// Keyring store
	keyringStore, err := config.OpenStore(ctx, runtime.KeyringURL())
	if err != nil {
		return false, nil, fmt.Errorf("could not init keyring store %v", err)
	}
	// Keyring start and creation of the master password
	keyring = crypto.NewConfigKeyring(keyringStore, crypto.WithAutoCreate(true))
	password, err := keyring.Get(common.ServiceGrpcNamespace_+common.ServiceUserKey, common.KeyringMasterKey)
	if err != nil {
		return false, nil, fmt.Errorf("could not get master password %v", err)
	}

	mainConfig, err := config.OpenStore(ctx, runtime.ConfigURL())
	if err != nil {
		return false, nil, err
	}

	// Init RevisionsStore if config is config.RevisionsProvider
	if revProvider, ok := mainConfig.(config.RevisionsProvider); ok {
		var rOpt []config.RevisionsStoreOption
		if debounceVersions {
			rOpt = append(rOpt, config.WithDebounce(2*time.Second))
		}
		var versionsStore revisions.Store
		mainConfig, versionsStore = revProvider.AsRevisionsStore(rOpt...)
		config.RegisterRevisionsStore(versionsStore)
	}

	// Wrap config with vaultConfig if set
	vaultConfig, err := config.OpenStore(ctx, runtime.VaultURL(password))
	if err != nil {
		return false, nil, err
	}
	config.RegisterVault(vaultConfig)
	mainConfig = config.NewVault(vaultConfig, mainConfig)

	// Additional Proxy
	mainConfig = config.Proxy(mainConfig)

	// Register default now
	config.Register(mainConfig)

	if config.Get("version").String() == "" && config.Get("defaults/database").String() == "" {
		new = true
		var data interface{}
		if err := json.Unmarshal([]byte(config.SampleConfig), &data); err == nil {
			if err := config.Get().Set(data); err == nil && config.RevisionsStore() != nil {
				_ = config.RevisionsStore().Put(&revisions.Version{
					User: "cli",
					Date: time.Now(),
					Log:  "Initialize with sample config",
					Data: data,
				})
			}
		}
	}

	// Need to do something for the versions
	if save, err := migrations.UpgradeConfigsIfRequired(config.Get(), common.Version()); err == nil && save {
		if err := config.Save(common.PydioSystemUsername, "Configs upgrades applied"); err != nil {
			return false, nil, fmt.Errorf("could not save config migrations %v", err)
		}
	}

	return
}

func initLogLevel() {

	if skipCoreInit() {
		return
	}

	// Init log level
	logLevel := runtime.LogLevel()
	logJson := runtime.LogJSON()
	common.LogToFile = runtime.LogToFile()

	// Backward compatibility
	if os.Getenv("PYDIO_LOGS_LEVEL") != "" {
		logLevel = os.Getenv("PYDIO_LOGS_LEVEL")
	}
	if logLevel == "production" {
		logLevel = "info"
		logJson = true
		common.LogToFile = true
	}

	// Making sure the log level is passed everywhere (fork processes for example)
	os.Setenv("CELLS_LOG", logLevel)
	os.Setenv("CELLS_LOG_TO_FILE", strconv.FormatBool(common.LogToFile))

	if logJson {
		os.Setenv("CELLS_LOG_JSON", "true")
		common.LogConfig = common.LogConfigProduction
	} else {
		common.LogConfig = common.LogConfigConsole
	}
	switch logLevel {
	case "info":
		common.LogLevel = zap.InfoLevel
	case "warn":
		common.LogLevel = zap.WarnLevel
	case "debug":
		common.LogLevel = zap.DebugLevel
	case "error":
		common.LogLevel = zap.ErrorLevel
	}

	log.Init(runtime.ApplicationWorkingDir(runtime.ApplicationDirLogs), cw.RichContext)

	// Using it once
	log.Logger(context.Background())
}

func initLogLevelListener(ctx context.Context) {
	_, er := broker.Subscribe(ctx, common.TopicLogLevelEvent, func(message broker.Message) error {
		event := &log2.LogLevelEvent{}
		if _, e := message.Unmarshal(event); e == nil {
			log.SetDynamicDebugLevels(event.GetResetInfo(), event.GetLevelDebug(), event.GetServices()...)
		} else {
			return e
		}
		return nil
	})
	if er != nil {
		fmt.Println("Cannot subscribe to broker for TopicLogLevelEvent", er.Error())
	}
}

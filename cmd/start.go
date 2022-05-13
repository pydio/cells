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
	"fmt"

	"net/url"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/cobra"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	clientcontext "github.com/pydio/cells/v4/common/client/context"
	clientgrpc "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/nodes"
	nodescontext "github.com/pydio/cells/v4/common/nodes/context"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/server"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/metrics"
	"github.com/pydio/cells/v4/common/utils/filex"
)

// StartCmd represents the start command
var StartCmd = &cobra.Command{
	Use:     "start",
	Aliases: []string{"daemon"},
	Short:   "A brief description of your command",
	Long: `A longer description that spans multiple lines and likely contains examples
and usage of using your command. For example:

Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		bindViperFlags(cmd.Flags(), map[string]string{
			runtime.KeyFork: runtime.KeyForkLegacy,
		})

		runtime.SetArgs(args)
		metrics.Init()
		handleSignals(args)

		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := cmd.Context()

		if runtime.NeedsGrpcDiscoveryConn() {
			u, err := url.Parse(runtime.DiscoveryURL())
			if err != nil {
				return err
			}
			discoveryConn, err := grpc.Dial(u.Host, grpc.WithTransportCredentials(insecure.NewCredentials()))
			if err != nil {
				return err
			}
			ctx = clientcontext.WithClientConn(ctx, discoveryConn)
		}

		configFile := filepath.Join(config.PydioConfigDir, config.PydioConfigFile)
		if runtime.ConfigIsLocalFile() && !filex.Exists(configFile) {
			return triggerInstall(
				"We cannot find a configuration file ... "+configFile,
				"Do you want to create one now",
				cmd, args)
		}

		// Init config
		isNew, keyring, er := initConfig(ctx, true)
		if er != nil {
			return er
		}
		if isNew && runtime.ConfigIsLocalFile() {
			return triggerInstall(
				"Oops, the configuration is not right ... "+configFile,
				"Do you want to reset the initial configuration", cmd, args)
		}
		ctx = servicecontext.WithKeyring(ctx, keyring)

		// Init registry
		reg, err := registry.OpenRegistry(ctx, runtime.RegistryURL())
		if err != nil {
			return err
		}
		ctx = servercontext.WithRegistry(ctx, reg)

		// Init broker
		broker.Register(broker.NewBroker(runtime.BrokerURL(), broker.WithContext(ctx)))

		// Starting discovery server containing registry, broker, config and log
		if !runtime.IsGrpcScheme(runtime.RegistryURL()) {
			if err := startDiscoveryServer(ctx, reg); err != nil {
				return err
			}
		}

		// Create a main client connection
		clientgrpc.WarnMissingConnInContext = true
		conn, err := grpc.Dial("cells:///", clientgrpc.DialOptionsForRegistry(reg)...)
		if err != nil {
			return err
		}
		ctx = clientcontext.WithClientConn(ctx, conn)
		ctx = nodescontext.WithSourcesPool(ctx, nodes.NewPool(ctx, reg))

		m := manager.NewManager(reg, "mem:///?cache=plugins&byname=true", "main")
		if err := m.Init(ctx); err != nil {
			return err
		}

		runtime.InitGlobalConnConsumers(ctx, "main")
		go initLogLevelListener(ctx)
		initLogLevel()

		go m.WatchServicesConfigs()
		go m.WatchBroker(ctx, broker.Default())

		if os.Args[1] == "daemon" {
			msg := "| Starting daemon, use '" + os.Args[0] + " ctl' to control services |"
			line := strings.Repeat("-", len(msg))
			cmd.Println(line)
			cmd.Println(msg)
			cmd.Println(line)
			m.SetServeOptions(
				server.WithGrpcBindAddress(runtime.GrpcBindAddress()),
				server.WithHttpBindAddress(runtime.HttpBindAddress()),
			)
		} else {
			m.ServeAll(
				server.WithGrpcBindAddress(runtime.GrpcBindAddress()),
				server.WithHttpBindAddress(runtime.HttpBindAddress()),
			)
		}

		select {
		case <-ctx.Done():
		}

		m.StopAll()

		return nil
	},
}

func startDiscoveryServer(ctx context.Context, reg registry.Registry) error {

	m := manager.NewManager(reg, "mem:///", "discovery")
	if er := m.Init(ctx); er != nil {
		return er
	}

	errrorCallback := func(err error) {
		if !strings.Contains(err.Error(), "context canceled") {
			fmt.Println("************************************************************")
			fmt.Println("FATAL : Error while starting discovery server")
			fmt.Println("---------------------------------------------")
			fmt.Println(err.Error())
			fmt.Println("FATAL : SHUTTING DOWN NOW!")
			fmt.Println("************************************************************")
			cancel()
		} else {
			fmt.Println(err)
		}
	}

	go func() {
		m.ServeAll(server.WithErrorCallback(errrorCallback), server.WithGrpcBindAddress(runtime.GrpcDiscoveryBindAddress()))
		<-ctx.Done()
		m.StopAll()
	}()

	return nil
}

func init() {
	// Flags for selecting / filtering services
	StartCmd.Flags().StringArrayP(runtime.KeyArgTags, "t", []string{}, "Select services to start by tags, possible values are 'broker', 'data', 'datasource', 'discovery', 'frontend', 'gateway', 'idm', 'scheduler'")
	StartCmd.Flags().StringArrayP(runtime.KeyArgExclude, "x", []string{}, "Select services to start by filtering out some specific ones by name")

	StartCmd.Flags().String(runtime.KeyBindHost, "0.0.0.0", "Address on which the servers should bind")
	StartCmd.Flags().String(runtime.KeyAdvertiseAddress, "", "Address that should be advertised to other members of the cluster (leave it empty for default advertise address)")
	StartCmd.Flags().String(runtime.KeyGrpcPort, runtime.DefaultGrpcPort, "gRPC Server Port")
	StartCmd.Flags().String(runtime.KeyGrpcDiscoveryPort, runtime.DefaultDiscoveryPort, "gRPC Server Discovery Port")
	StartCmd.Flags().String(runtime.KeyHttpServer, "caddy", "HTTP Server Type")
	StartCmd.Flags().String(runtime.KeyHttpPort, runtime.DefaultHttpPort, "HTTP Server Port")

	StartCmd.Flags().Bool(runtime.KeyFork, false, "Used internally by application when forking processes")

	addRegistryFlags(StartCmd.Flags())

	_ = StartCmd.Flags().MarkHidden(runtime.KeyFork)
	_ = StartCmd.Flags().MarkHidden(runtime.KeyRegistry)
	_ = StartCmd.Flags().MarkHidden(runtime.KeyBroker)

	// Other internal flags
	StartCmd.Flags().String(runtime.KeyLog, "info", "Sets the log level: 'debug', 'info', 'warn', 'error' (for backward-compatibility, 'production' is equivalent to log_json+info)")
	StartCmd.Flags().Bool(runtime.KeyLogJson, false, "Sets the log output format to JSON instead of text")
	StartCmd.Flags().Bool(runtime.KeyLogToFile, common.MustLogFileDefaultValue(), "Write logs on-file in CELLS_LOG_DIR")
	StartCmd.Flags().Bool(runtime.KeyEnableMetrics, false, "Instrument code to expose internal metrics")
	StartCmd.Flags().Bool(runtime.KeyEnablePprof, false, "Enable pprof remote debugging")
	StartCmd.Flags().Int(runtime.KeyHealthCheckPort, 0, "Healthcheck port number")

	RootCmd.AddCommand(StartCmd)
}

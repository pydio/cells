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
	"fmt"
	"log"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common/broker"
	clientcontext "github.com/pydio/cells/v4/common/client/context"
	clientgrpc "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/config/runtime"
	"github.com/pydio/cells/v4/common/nodes"
	nodescontext "github.com/pydio/cells/v4/common/nodes/context"
	"github.com/pydio/cells/v4/common/plugins"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/caddy"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"github.com/pydio/cells/v4/common/server/fork"
	"github.com/pydio/cells/v4/common/server/generic"
	servergrpc "github.com/pydio/cells/v4/common/server/grpc"
	"github.com/pydio/cells/v4/common/server/http"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
)

var (
	FilterStartTags    []string
	FilterStartExclude []string
)

// StartCmd represents the start command
var StartCmd = &cobra.Command{
	Use:   "start",
	Short: "A brief description of your command",
	Long: `A longer description that spans multiple lines and likely contains examples
and usage of using your command. For example:

Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		viper.Set("args", args)

		bindViperFlags(cmd.Flags(), map[string]string{
			// "log":  "logs_level",
			"fork": "is_fork",
		})

		initLogLevel()

		initConfig()

		// Making sure we capture the signals
		handleSignals(args)

		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := cmd.Context()

		// Warning - if re-enabled, should support a "byname" approach to allow plugins to be overridden.
		//pluginsRegStore := memory.New()
		//pluginsReg := configregistry.NewConfigRegistry(pluginsRegStore)
		pluginsReg, err := registry.OpenRegistry(ctx, "mem:///?cache=plugins&byname=true")

		// Version memory
		reg, err := registry.OpenRegistry(ctx, viper.GetString("registry"))
		if err != nil {
			return err
		}

		// Create a main client connection
		conn, err := grpc.Dial("cells:///", clientgrpc.DialOptionsForRegistry(reg)...)
		if err != nil {
			return err
		}

		ctx = servercontext.WithRegistry(ctx, reg)
		ctx = servicecontext.WithRegistry(ctx, pluginsReg)
		ctx = clientcontext.WithClientConn(ctx, conn)
		ctx = nodescontext.WithNodesPool(ctx, nodes.ContextPool(ctx))

		broker.Register(broker.NewBroker(viper.GetString("broker"), broker.WithContext(ctx)))
		plugins.InitGlobalConnConsumers(ctx, "main")
		go initLogLevelListener(ctx)

		plugins.Init(ctx, "main")

		services, err := pluginsReg.List(registry.WithType(pb.ItemType_SERVICE))
		if err != nil {
			return err
		}

		var (
			srvGRPC    server.Server
			srvHTTP    server.Server
			srvGeneric server.Server
			srvs       []server.Server
		)

		runtime.BuildProcessStartTag()

		for _, ss := range services {
			var s service.Service
			if !ss.As(&s) {
				continue
			}
			if !runtime.IsRequired(s.Name(), s.Options().Tags...) {
				continue
			}
			opts := s.Options()

			opts.Context = servicecontext.WithRegistry(opts.Context, reg)
			opts.Context = servicecontext.WithKeyring(opts.Context, keyring)

			if opts.Fork && !runtime.IsFork() {
				if !opts.AutoStart {
					continue
				}

				srvFork := fork.NewServer(opts.Context)
				var srvForkAs *fork.ForkServer
				if srvFork.As(&srvForkAs) {
					srvForkAs.RegisterForkParam(opts.Name)
				}

				srvs = append(srvs, srvFork)

				opts.Server = srvFork

				continue
			}

			if opts.Server != nil {

				srvs = append(srvs, opts.Server)

			} else if opts.ServerProvider != nil {

				serv, er := opts.ServerProvider(ctx)
				if er != nil {
					log.Fatal(er)
				}
				opts.Server = serv
				srvs = append(srvs, opts.Server)

			} else {
				if s.IsGRPC() {

					if srvGRPC == nil {
						srvGRPC = servergrpc.New(ctx)
						srvs = append(srvs, srvGRPC)
					}
					opts.Server = srvGRPC

				}
				if s.IsREST() {

					if srvHTTP == nil {
						if runtime.IsFork() {
							srvHTTP = http.New(ctx)
						} else {
							if s, e := caddy.New(opts.Context, ""); e != nil {
								log.Fatal(e)
							} else {
								srvHTTP = s
							}
						}
						srvs = append(srvs, srvHTTP)
					}
					opts.Server = srvHTTP

				}
				if s.IsGeneric() {

					if srvGeneric == nil {
						srvGeneric = generic.New(ctx)
						srvs = append(srvs, srvGeneric)
					}
					opts.Server = srvGeneric

				}
			}

			opts.Server.BeforeServe(s.Start)
			opts.Server.AfterServe(func() error {
				// Register service again to update nodes information
				if err := reg.Register(s); err != nil {
					return err
				}
				return nil
			})
			opts.Server.BeforeStop(s.Stop)

		}

		// var g errgroup.Group

		go func() {
			ch, err := config.WatchMap("services")
			if err != nil {
				return
			}

			for kv := range ch {
				s, err := reg.Get(kv.Key)
				if err != nil {
					continue
				}
				var rs service.Service
				if s.As(&rs) && rs.Options().AutoRestart {
					rs.Stop()

					rs.Start()
				}
			}
		}()

		// wg := &sync.WaitGroup{}
		for _, srv := range srvs {
			// g.Go(srv.Serve)
			// wg.Add(1)
			go func(srv server.Server) {
				//	defer wg.Done()
				if err := srv.Serve(); err != nil {
					fmt.Println(err)
				}

				return
			}(srv)
		}
		// wg.Wait()

		// l.Unlock()

		select {
		case <-cmd.Context().Done():
		}

		for _, srv := range srvs {
			if err := srv.Stop(); err != nil {
				fmt.Println("Error stopping server ", err)
			}
		}

		return nil
	},
}

func init() {
	// Flags for selecting / filtering services
	StartCmd.Flags().StringArrayVarP(&FilterStartTags, "tags", "t", []string{}, "Select services to start by tags, possible values are 'broker', 'data', 'datasource', 'discovery', 'frontend', 'gateway', 'idm', 'scheduler'")
	StartCmd.Flags().StringArrayVarP(&FilterStartExclude, "exclude", "x", []string{}, "Select services to start by filtering out some specific ones by name")

	StartCmd.Flags().String("grpc.address", ":8001", "gRPC Server Address")
	StartCmd.Flags().String("http.address", ":8002", "HTTP Server Address")

	StartCmd.Flags().Bool("fork", false, "Used internally by application when forking processes")

	addRegistryFlags(StartCmd.Flags())

	StartCmd.Flags().MarkHidden("fork")
	StartCmd.Flags().MarkHidden("registry")
	StartCmd.Flags().MarkHidden("broker")

	// Other internal flags
	StartCmd.Flags().String("log", "info", "Sets the log level: 'debug', 'info', 'warn', 'error' (for backward-compatibility, 'production' is equivalent to log_json+info)")
	//StartCmd.Flags().Bool("log_json", false, "Sets the log output format to JSON instead of text")
	//StartCmd.Flags().Bool("log_to_file", common.MustLogFileDefaultValue(), "Write logs on-file in CELLS_LOG_DIR")
	//StartCmd.Flags().Bool("enable_metrics", false, "Instrument code to expose internal metrics")
	//StartCmd.Flags().Bool("enable_pprof", false, "Enable pprof remote debugging")
	//StartCmd.Flags().Int("healthcheck", 0, "Healthcheck port number")

	RootCmd.AddCommand(StartCmd)
}

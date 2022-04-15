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
	"log"
	"net"
	"net/url"

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
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/caddy"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"github.com/pydio/cells/v4/common/server/fork"
	"github.com/pydio/cells/v4/common/server/generic"
	servergrpc "github.com/pydio/cells/v4/common/server/grpc"
	"github.com/pydio/cells/v4/common/server/http"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/metrics"
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
		bindViperFlags(cmd.Flags(), map[string]string{
			runtime.KeyFork: runtime.KeyForkLegacy,
		})

		runtime.SetArgs(args)
		initLogLevel()
		metrics.Init()
		handleSignals(args)

		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := cmd.Context()

		pluginsReg, err := registry.OpenRegistry(ctx, "mem:///?cache=plugins&byname=true")

		if runtime.IsFork() {
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

		// Init config
		initConfig(ctx)

		// Init registry
		reg, err := registry.OpenRegistry(ctx, runtime.RegistryURL())
		if err != nil {
			return err
		}

		// Init broker
		broker.Register(broker.NewBroker(runtime.BrokerURL(), broker.WithContext(ctx)))

		// Starting discovery server containing registry, broker and config
		if !runtime.IsFork() {
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

		ctx = servercontext.WithRegistry(ctx, reg)
		ctx = servicecontext.WithRegistry(ctx, pluginsReg)
		ctx = clientcontext.WithClientConn(ctx, conn)
		ctx = nodescontext.WithSourcesPool(ctx, nodes.NewPool(ctx, reg))

		runtime.InitGlobalConnConsumers(ctx, "main")
		go initLogLevelListener(ctx)

		runtime.Init(ctx, "main")

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
						lis, err := net.Listen("tcp", runtime.GrpcBindAddress())
						if err != nil {
							return err
						}

						srvGRPC = servergrpc.New(ctx, servergrpc.WithListener(lis))
						srvs = append(srvs, srvGRPC)
					}

					opts.Server = srvGRPC
				}

				if s.IsREST() {
					if srvHTTP == nil {
						if runtime.HttpServerType() == runtime.HttpServerCaddy {
							if s, e := caddy.New(opts.Context, ""); e != nil {
								log.Fatal(e)
							} else {
								srvHTTP = s
							}
						} else {
							srvHTTP = http.New(ctx)
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

func startDiscoveryServer(ctx context.Context, reg registry.Registry) error {
	runtimeReg, err := registry.OpenRegistry(ctx, "mem:///")
	if err != nil {
		return err
	}

	ctx = servicecontext.WithRegistry(ctx, runtimeReg)
	runtime.Init(ctx, "discovery")

	services, err := runtimeReg.List(registry.WithType(pb.ItemType_SERVICE))
	if err != nil {
		return err
	}

	lis, err := net.Listen("tcp", runtime.GrpcDiscoveryBindAddress())
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	ctx = servercontext.WithRegistry(ctx, reg)
	srv := servergrpc.New(ctx, servergrpc.WithListener(lis))

	for _, ss := range services {
		var s service.Service
		if !ss.As(&s) {
			continue
		}

		opts := s.Options()
		opts.Context = servicecontext.WithRegistry(opts.Context, reg)
		opts.Server = srv
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

	go func() {
		if err := srv.Serve(); err != nil {
			fmt.Println(err)
		}
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

	StartCmd.Flags().MarkHidden(runtime.KeyFork)
	StartCmd.Flags().MarkHidden(runtime.KeyRegistry)
	StartCmd.Flags().MarkHidden(runtime.KeyBroker)

	// Other internal flags
	StartCmd.Flags().String(runtime.KeyLog, "info", "Sets the log level: 'debug', 'info', 'warn', 'error' (for backward-compatibility, 'production' is equivalent to log_json+info)")
	StartCmd.Flags().Bool(runtime.KeyLogJson, false, "Sets the log output format to JSON instead of text")
	StartCmd.Flags().Bool(runtime.KeyLogToFile, common.MustLogFileDefaultValue(), "Write logs on-file in CELLS_LOG_DIR")
	StartCmd.Flags().Bool(runtime.KeyEnableMetrics, false, "Instrument code to expose internal metrics")
	StartCmd.Flags().Bool(runtime.KeyEnablePprof, false, "Enable pprof remote debugging")
	StartCmd.Flags().Int(runtime.KeyHealthCheckPort, 0, "Healthcheck port number")

	RootCmd.AddCommand(StartCmd)
}

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

package registry

import (
	"context"
	"time"

	ss "github.com/pydio/cells/common/micro/selector"

	"github.com/pydio/cells/common/micro/registry/cluster"
	"github.com/pydio/cells/common/micro/registry/service"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/selector"
	"github.com/micro/go-micro/server"
	"github.com/micro/go-plugins/registry/memory"
	"github.com/pydio/cells/common/micro/client/grpc"

	defaults "github.com/pydio/cells/common/micro"
	cs "github.com/pydio/cells/common/micro/selector/cache"
	rs "github.com/pydio/cells/common/micro/selector/registry"
	"github.com/spf13/viper"
)

func EnableService(hostname string, port string) {
	r := service.NewRegistry(
		service.WithClient(
			grpc.NewClient(
				client.RequestTimeout(10*time.Minute),
				client.Selector(rs.NewSelector(hostname, port)),
				client.Retries(20),
				client.Retry(func(ctx context.Context, req client.Request, retryCount int, err error) (bool, error) {
					if errors.Parse(err.Error()).Detail == "not found" {
						return false, err
					}

					return true, nil
				}),
			),
		),
	)

	r = NewRegistryWithExpiry(r, 20*time.Minute)
	r = NewRegistryWithUnique(r)
	r = NewRegistryWithPeers(r)
	r = NewRegistryWithProcesses(r)

	s := cs.NewSelector(selector.Registry(r))
	s = ss.NewSelectorWithMaxRetries(s, 5)

	defaults.InitServer(func() server.Option {
		return server.Registry(r)
	})

	defaults.InitClient(
		func() client.Option {
			return client.Selector(s)
		},
		func() client.Option {
			return client.Registry(r)
		}, func() client.Option {
			return client.Retries(5)
		}, func() client.Option {
			return client.Retry(RetryOnError)
		},
	)

	registry.DefaultRegistry = r
}

func EnableMemory() {
	// addr := "127.0.0.1:8000"

	r := memory.NewRegistry()

	r = cluster.NewRegistry(r,
		registry.Addrs(viper.GetString("nats_address")),
		cluster.ClusterID(viper.GetString("nats_streaming_cluster_id")),
	)
	r = NewRegistryWithExpiry(r, 20*time.Minute)
	r = NewRegistryWithUnique(r)
	r = NewRegistryWithPeers(r)
	r = NewRegistryWithProcesses(r)

	s := selector.NewSelector(selector.Registry(r))
	s = ss.NewSelectorWithMaxRetries(s, 5)

	defaults.InitServer(func() server.Option {
		return server.Registry(r)
	})

	defaults.InitClient(
		func() client.Option {
			return client.Selector(s)
		},
		func() client.Option {
			return client.Registry(r)
		}, func() client.Option {
			return client.Retries(5)
		}, func() client.Option {
			return client.Retry(RetryOnError)
		},
	)

	registry.DefaultRegistry = r
}

// RetryOnError retries a request on a 500 or timeout error
func RetryOnError(ctx context.Context, req client.Request, retryCount int, err error) (bool, error) {
	if err == nil {
		return false, nil
	}

	e := errors.Parse(err.Error())
	if e == nil {
		return false, nil
	}

	switch e.Code {
	// retry on timeout or internal server error
	case 408, 500:
		return true, nil
	default:
		return false, nil
	}
}

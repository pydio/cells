/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package grpc

import (
	"context"
	"fmt"
	"path"
	runtime2 "runtime"
	"runtime/debug"
	"strings"
	"sync"
	"time"

	"go.uber.org/zap/zapcore"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/telemetry/metrics"
	"github.com/pydio/cells/v4/common/utils/propagator"

	_ "google.golang.org/grpc/xds"
)

type ctxBalancerFilterKey struct{}

var (
	CallTimeoutShort = 1 * time.Second
)

func ResolveConn(ctx context.Context, serviceName string, opt ...Option) grpc.ClientConnInterface {
	var reg registry.Registry
	propagator.Get(ctx, registry.ContextKey, &reg)

	if reg == nil {
		panic("Should have a registry")
	}

	opts := new(Options)
	for _, o := range opt {
		o(opts)
	}

	if c, err := reg.Get(common.ServiceGrpcNamespace_+serviceName, registry.WithType(pb.ItemType_GENERIC)); err == nil && c != nil {
		var conn *grpc.ClientConn
		if c.As(&conn) {
			opts.ClientConn = conn
		}
	} else {
		fmt.Println("grpc client not found ", common.ServiceGrpcNamespace_+serviceName)
		return nil
	}

	tenantName := "default"
	if mm, ok := propagator.FromContextRead(ctx); ok {
		if p, o := mm[common.XPydioTenantUuid]; o {
			tenantName = p
		}
	}

	return &clientConn{
		callTimeout:         opts.CallTimeout,
		ClientConnInterface: opts.ClientConn,
		balancerFilter:      opts.BalancerFilter,
		serviceName:         common.ServiceGrpcNamespace_ + strings.TrimPrefix(serviceName, common.ServiceGrpcNamespace_),
		tenantName:          tenantName,
	}
}

type clientConn struct {
	grpc.ClientConnInterface
	serviceName    string
	tenantName     string
	callTimeout    time.Duration
	balancerFilter client.BalancerTargetFilter
}

// Invoke performs a unary RPC and returns after the response is received
// into reply.
func (cc *clientConn) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {

	opts = append([]grpc.CallOption{
		grpc.WaitForReady(true),
	}, opts...)

	//if metadata.ValueFromIncomingContext(ctx, ckeys.CtxTargetServiceName)
	ctx = metadata.AppendToOutgoingContext(ctx, common.CtxTargetServiceName, cc.serviceName)
	ctx = metadata.AppendToOutgoingContext(ctx, common.CtxTargetTenantName, cc.tenantName)
	if pc, file, line, ok := runtime2.Caller(2); ok {
		var fName string
		if fDesc := runtime2.FuncForPC(pc); fDesc != nil {
			fName = ":" + path.Base(fDesc.Name()) + "()"
		}
		ctx = metadata.AppendToOutgoingContext(ctx, common.CtxGrpcClientCaller, fmt.Sprintf("%s:%d%s", file, line, fName))
	}

	var cancel context.CancelFunc
	if cc.callTimeout > 0 {
		ctx, cancel = context.WithTimeout(ctx, cc.callTimeout)
	}
	if cc.balancerFilter != nil {
		ctx = context.WithValue(ctx, ctxBalancerFilterKey{}, cc.balancerFilter)
	}
	er := cc.ClientConnInterface.Invoke(ctx, method, args, reply, opts...)
	if er != nil && cancel != nil {
		cancel()
	}
	return er
}

var (
	clientRC  = map[string]float64{}
	clientRCL = sync.Mutex{}
)

// NewStream begins a streaming RPC.
func (cc *clientConn) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	opts = append([]grpc.CallOption{
		grpc.WaitForReady(true),
	}, opts...)

	ctx = metadata.AppendToOutgoingContext(ctx, common.CtxTargetServiceName, cc.serviceName)
	ctx = metadata.AppendToOutgoingContext(ctx, common.CtxTargetTenantName, cc.tenantName)
	if pc, file, line, ok := runtime2.Caller(2); ok {
		var fName string
		if fDesc := runtime2.FuncForPC(pc); fDesc != nil {
			fName = ":" + path.Base(fDesc.Name()) + "()"
		}
		ctx = metadata.AppendToOutgoingContext(ctx, common.CtxGrpcClientCaller, fmt.Sprintf("%s:%d%s", file, line, fName))
	}

	var cancel context.CancelFunc
	if cc.callTimeout > 0 {
		ctx, cancel = context.WithTimeout(ctx, cc.callTimeout)
	}
	if cc.balancerFilter != nil {
		ctx = context.WithValue(ctx, ctxBalancerFilterKey{}, cc.balancerFilter)
	}

	s, e := cc.ClientConnInterface.NewStream(ctx, desc, method, opts...)
	if e != nil && cancel != nil {
		cancel()
	}
	if e == nil {
		// Prepare gauges
		key := cc.serviceName + desc.StreamName
		scope := metrics.TaggedHelper(map[string]string{"target": cc.serviceName, "method": desc.StreamName})
		gauge := scope.Gauge("open_streams", "Number of GRPC streams currently open")
		pri := common.LogLevel == zapcore.DebugLevel
		if cc.serviceName == "pydio.grpc.broker" || cc.serviceName == "pydio.grpc.log" || cc.serviceName == "pydio.grpc.audit" ||
			cc.serviceName == "pydio.grpc.jobs" || cc.serviceName == "pydio.grpc.registry" ||
			desc.StreamName == "StreamChanges" || desc.StreamName == "PostNodeChanges" {
			pri = false
		}

		clientRCL.Lock()
		clientRC[key]++
		gauge.Update(clientRC[key])
		clientRCL.Unlock()
		ss := debug.Stack()
		go func() {
			select {
			case <-s.Context().Done():
				clientRCL.Lock()
				clientRC[key]--
				gauge.Update(clientRC[key])
				clientRCL.Unlock()
			case <-time.After(20 * time.Second):
				if pri {
					fmt.Println("==> Stream Not Closed After 20s", key)
					fmt.Print(string(ss))
				}
			}
		}()
	}
	return s, e
}

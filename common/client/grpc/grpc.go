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
	"bytes"
	"context"
	"errors"
	"fmt"
	"path"
	"regexp"
	runtime2 "runtime"
	"runtime/debug"
	"slices"
	"strings"
	"sync"
	"sync/atomic"
	"text/template"
	"time"

	"go.uber.org/zap/zapcore"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client"
	pb "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/telemetry/metrics"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/openurl"
	"github.com/pydio/cells/v5/common/utils/propagator"

	_ "google.golang.org/grpc/xds"
)

type ctxBalancerFilterKey struct{}

var (
	CallTimeoutShort    = 1 * time.Second
	serviceTransformers []ServiceTransformer
)

type ServiceTransformer func(context.Context, string) (string, []string, bool)

func RegisterServiceTransformer(transformer ServiceTransformer) {
	serviceTransformers = append(serviceTransformers, transformer)
}

func ResolveConn(ctx context.Context, serviceName string, opt ...Option) grpc.ClientConnInterface {

	if cc, ok := mox[serviceName]; ok {
		return cc
	}

	var headerKVs []string
	for _, tr := range serviceTransformers {
		if newServiceName, headers, ok := tr(ctx, serviceName); ok {
			serviceName = newServiceName
			headerKVs = append(headerKVs, headers...)
		}
	}

	opts := new(Options)
	for _, o := range opt {
		o(opts)
	}

	cc := &clientConn{
		callTimeout:    opts.CallTimeout,
		balancerFilter: opts.BalancerFilter,
		silentNotFound: opts.SilentNotFound,
		serviceName:    serviceName,
		headerKVs:      headerKVs,
		lock:           &sync.Mutex{},
	}

	return cc
}

type clientConn struct {
	conn atomic.Value
	// grpc.ClientConnInterface
	serviceName    string
	headerKVs      []string
	callTimeout    time.Duration
	balancerFilter client.BalancerTargetFilter
	silentNotFound bool

	lock *sync.Mutex
}

func (cc *clientConn) resolveConn(ctx context.Context) error {
	cc.lock.Lock()
	defer cc.lock.Unlock()

	var reg registry.Registry
	propagator.Get(ctx, registry.ContextKey, &reg)

	if reg == nil {
		debug.PrintStack()
		return errors.New("no registry found")
	}

	templates := make(map[string]*template.Template)
	getTpl := func(filter string) (*template.Template, error) {
		if t, ok := templates[filter]; ok {
			return t, nil
		}
		t, er := template.New(filter).Parse(filter)
		if er != nil {
			return nil, er
		}
		templates[filter] = t
		return t, nil
	}

	connPoolItems, err := reg.List(
		registry.WithType(pb.ItemType_GENERIC),
		registry.WithFilter(func(item registry.Item) bool {
			// Retrieving server services information to see which services we need to start
			if b, ok := item.Metadata()["services"]; ok {
				var sm []map[string]string
				if err := json.Unmarshal([]byte(b), &sm); err != nil {
					return false
				}
				for _, smm := range sm {
					if filter, ok := smm["filter"]; ok {
						tmpl, err := getTpl(filter)
						if err != nil {
							return false
						}

						var buf bytes.Buffer
						if err := tmpl.Execute(&buf, struct {
							Name string
						}{
							Name: cc.serviceName,
						}); err != nil {
							return false
						}

						f := strings.SplitN(buf.String(), " ", 3)
						var fn func(string, []byte) (bool, error)
						switch f[1] {
						case "=":
						case "~=":
							fn = regexp.Match
						}

						if fn != nil {
							match, err := fn(f[2], []byte(f[0]))
							if err != nil {
								return false
							}

							if !match {
								return false
							}
						}
					}
				}
			} else {
				return false
			}

			return true
		}),
	)

	if err != nil {
		return err
	}

	if len(connPoolItems) != 1 {
		return errors.New("ResolveConn called with multiple services")
	}

	var pool *openurl.Pool[grpc.ClientConnInterface]
	if !connPoolItems[0].As(&pool) {
		return errors.New("should be a connection")
	}

	conn, err := pool.Get(ctx)
	if err != nil {
		return errors.New("connection should be valid")
	}

	cc.conn.Store(conn)

	return nil
}

func (cc *clientConn) getConn(ctx context.Context) (grpc.ClientConnInterface, error) {
	conn := cc.conn.Load()
	if conn != nil {
		return conn.(grpc.ClientConnInterface), nil
	}

	if err := cc.resolveConn(ctx); err != nil {
		return nil, err
	}

	return cc.getConn(ctx)
}

// Invoke performs a unary RPC and returns after the response is received
// into reply.
func (cc *clientConn) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {

	conn, err := cc.getConn(ctx)
	if err != nil {
		return err
	}

	opts = append([]grpc.CallOption{
		grpc.WaitForReady(true),
	}, opts...)

	if len(cc.headerKVs) > 0 {
		for i := 0; i < len(cc.headerKVs)-1; i = i + 2 {
			ctx = metadata.AppendToOutgoingContext(ctx, cc.headerKVs[i], cc.headerKVs[i+1])
		}
	}

	ctx = metadata.AppendToOutgoingContext(ctx, common.CtxTargetServiceName, cc.serviceName)
	if pc, file, line, ok := runtime2.Caller(2); ok {
		var fName string
		if fDesc := runtime2.FuncForPC(pc); fDesc != nil {
			fName = ":" + path.Base(fDesc.Name()) + "()"
		}
		thisCaller := fmt.Sprintf("%s:%d%s", file, line, fName)
		if prev := metadata.ValueFromIncomingContext(ctx, common.CtxGrpcClientCaller); len(prev) > 0 {
			prev = append(prev, thisCaller)
			thisCaller = strings.Join(prev, "|")
		}
		ctx = metadata.AppendToOutgoingContext(ctx, common.CtxGrpcClientCaller, thisCaller)
	}

	if cc.silentNotFound {
		ctx = metadata.AppendToOutgoingContext(ctx, common.CtxGrpcSilentNotFound, "true")
	}

	var cancel context.CancelFunc
	if cc.callTimeout > 0 {
		ctx, cancel = context.WithTimeout(ctx, cc.callTimeout)
	}
	if cc.balancerFilter != nil {
		ctx = context.WithValue(ctx, ctxBalancerFilterKey{}, cc.balancerFilter)
	}
	er := conn.Invoke(ctx, method, args, reply, opts...)
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
	conn, err := cc.getConn(ctx)
	if err != nil {
		return nil, err
	}

	opts = append([]grpc.CallOption{
		grpc.WaitForReady(true),
	}, opts...)

	if len(cc.headerKVs) > 0 {
		for i := 0; i < len(cc.headerKVs)-1; i = i + 2 {
			ctx = metadata.AppendToOutgoingContext(ctx, cc.headerKVs[i], cc.headerKVs[i+1])
		}
	}

	ctx = metadata.AppendToOutgoingContext(ctx, common.CtxTargetServiceName, cc.serviceName)
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

	s, e := conn.NewStream(ctx, desc, method, opts...)
	if e != nil && cancel != nil {
		cancel()
	}
	if e == nil {
		// Prepare gauges
		key := cc.serviceName + desc.StreamName
		scope := metrics.TaggedHelper(map[string]string{"target": cc.serviceName, "method": desc.StreamName})
		gauge := scope.Gauge("open_streams", "Number of GRPC streams currently open")
		pri := common.LogLevel == zapcore.DebugLevel
		silentServices := []string{
			"pydio.grpc.broker",
			"pydio.grpc.log",
			"pydio.grpc.audit",
			"pydio.grpc.jobs",
			"pydio.grpc.registry",
			"pydio.grpc.config",
		}
		silentStreams := []string{
			"StreamChanges",
			"PostNodeChanges",
		}
		pri = !(slices.Contains(silentServices, cc.serviceName) || slices.Contains(silentStreams, desc.StreamName))

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

package grpc

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/runtime"
	"os"
	"runtime/debug"
	"strconv"
	"strings"
	"sync"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/backoff"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v4/common"
	clientcontext "github.com/pydio/cells/v4/common/client/context"
	"github.com/pydio/cells/v4/common/registry"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/context/ckeys"
	"github.com/pydio/cells/v4/common/service/metrics"
)

type ctxSubconnSelectorKey struct{}

var (
	mox = map[string]grpc.ClientConnInterface{}

	CallTimeoutDefault       = 10 * time.Minute
	CallTimeoutShort         = 1 * time.Second
	WarnMissingConnInContext = false
)

func DialOptionsForRegistry(reg registry.Registry, options ...grpc.DialOption) []grpc.DialOption {
	backoffConfig := backoff.DefaultConfig

	return append([]grpc.DialOption{
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithResolvers(NewBuilder(reg)),
		grpc.WithConnectParams(grpc.ConnectParams{MinConnectTimeout: 1 * time.Minute, Backoff: backoffConfig}),
		grpc.WithChainUnaryInterceptor(
			servicecontext.SpanUnaryClientInterceptor(),
			MetaUnaryClientInterceptor(),
		),
		grpc.WithChainStreamInterceptor(
			servicecontext.SpanStreamClientInterceptor(),
			MetaStreamClientInterceptor(),
		),
	}, options...)
}

func GetClientConnFromCtx(ctx context.Context, serviceName string, opt ...Option) grpc.ClientConnInterface {
	if ctx == nil {
		return NewClientConn(serviceName, opt...)
	}
	conn := clientcontext.GetClientConn(ctx)
	if conn == nil && WarnMissingConnInContext {
		fmt.Println("Warning, GetClientConnFromCtx could not find conn, will create a new one")
		debug.PrintStack()
	}
	reg := servercontext.GetRegistry(ctx)
	opt = append(opt, WithClientConn(conn))
	opt = append(opt, WithRegistry(reg))
	return NewClientConn(serviceName, opt...)
}

// NewClientConn returns a client attached to the defaults.
func NewClientConn(serviceName string, opt ...Option) grpc.ClientConnInterface {
	opts := new(Options)
	for _, o := range opt {
		o(opts)
	}

	if c, o := mox[strings.TrimPrefix(serviceName, common.ServiceGrpcNamespace_)]; o {
		return c
	}

	if opts.ClientConn == nil || opts.DialOptions != nil {
		if opts.Registry == nil {
			reg, err := registry.OpenRegistry(context.Background(), runtime.RegistryURL())
			if err != nil {
				return nil
			}

			opts.Registry = reg
		}
		conn, err := grpc.Dial("cells:///", DialOptionsForRegistry(opts.Registry, opts.DialOptions...)...)
		if err != nil {
			return nil
		}
		opts.ClientConn = conn
	}

	return &clientConn{
		callTimeout:         opts.CallTimeout,
		ClientConnInterface: opts.ClientConn,
		subConnSelector:     opts.SubConnSelector,
		serviceName:         common.ServiceGrpcNamespace_ + strings.TrimPrefix(serviceName, common.ServiceGrpcNamespace_),
	}
}

type clientConn struct {
	grpc.ClientConnInterface
	serviceName     string
	callTimeout     time.Duration
	subConnSelector subConnInfoFilter
}

// Invoke performs a unary RPC and returns after the response is received
// into reply.
func (cc *clientConn) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	ctx = metadata.AppendToOutgoingContext(ctx, ckeys.TargetServiceName, cc.serviceName)
	var cancel context.CancelFunc
	if cc.callTimeout > 0 {
		ctx, cancel = context.WithTimeout(ctx, cc.callTimeout)
	}
	if cc.subConnSelector != nil {
		ctx = context.WithValue(ctx, ctxSubconnSelectorKey{}, cc.subConnSelector)
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
	ctx = metadata.AppendToOutgoingContext(ctx, ckeys.TargetServiceName, cc.serviceName)
	ctx = metadata.AppendToOutgoingContext(ctx, "SubscriberId", strconv.Itoa(os.Getpid()))
	var cancel context.CancelFunc
	if cc.callTimeout > 0 {
		ctx, cancel = context.WithTimeout(ctx, cc.callTimeout)
	}
	if cc.subConnSelector != nil {
		ctx = context.WithValue(ctx, ctxSubconnSelectorKey{}, cc.subConnSelector)
	}

	s, e := cc.ClientConnInterface.NewStream(ctx, desc, method, opts...)
	if e != nil && cancel != nil {
		cancel()
	}
	if e == nil {
		// Prepare gauges
		key := cc.serviceName + desc.StreamName
		scope := metrics.GetMetrics().Tagged(map[string]string{"target": cc.serviceName, "method": desc.StreamName})
		gauge := scope.Gauge("open_streams")
		pri := true
		if cc.serviceName == "pydio.grpc.broker" || cc.serviceName == "pydio.grpc.log" || cc.serviceName == "pydio.grpc.audit" ||
			cc.serviceName == "pydio.grpc.jobs" || cc.serviceName == "pydio.grpc.registry" {
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

// RegisterMock registers a stubbed ClientConnInterface for a given service
func RegisterMock(serviceName string, mock grpc.ClientConnInterface) {
	mox[serviceName] = mock
}

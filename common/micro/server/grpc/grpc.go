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

// Package grpc provides a grpc server
package grpc

import (
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"net"
	"reflect"
	"runtime/debug"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	log "github.com/micro/go-log"
	"github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/cmd"
	"github.com/micro/go-micro/codec"
	"github.com/micro/go-micro/errors"
	meta "github.com/micro/go-micro/metadata"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/server"
	"github.com/micro/util/go/lib/addr"
	mgrpc "github.com/micro/util/go/lib/grpc"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"google.golang.org/grpc/transport"
)

const (
	defaultMaxMsgSize  = 1024 * 1024 * 4 // use 4MB as the default message size limit
	defaultContentType = "application/grpc"
)

type grpcServer struct {
	rpc  *rServer
	exit chan chan error
	wg   sync.WaitGroup

	sync.RWMutex
	opts        server.Options
	handlers    map[string]server.Handler
	subscribers map[*subscriber][]broker.Subscriber
	// used for first registration
	registered bool
}

func init() {
	cmd.DefaultServers["grpc"] = NewServer
}

func newGRPCServer(opts ...server.Option) server.Server {
	options := newOptions(opts...)

	return &grpcServer{
		opts: options,
		rpc: &rServer{
			serviceMap: make(map[string]*service),
		},
		handlers:    make(map[string]server.Handler),
		subscribers: make(map[*subscriber][]broker.Subscriber),
		exit:        make(chan chan error),
	}
}

func (g *grpcServer) getCredentials() credentials.TransportCredentials {
	if g.opts.Context != nil {
		if v := g.opts.Context.Value(tlsAuth{}); v != nil {
			tls := v.(*tls.Config)
			return credentials.NewTLS(tls)
		}
	}
	return nil
}

func (g *grpcServer) getHttp2TransportConfig() transport.ServerConfig {
	if g.opts.Context != nil {
		if v := g.opts.Context.Value(transportConfig{}); v != nil {
			return *v.(*transport.ServerConfig)
		}
	}
	return transport.ServerConfig{}
}

func (g *grpcServer) serve(l net.Listener) error {
	defer l.Close()

	var tempDelay time.Duration

	for {
		conn, err := l.Accept()
		if err != nil {
			if ne, ok := err.(interface {
				Temporary() bool
			}); ok && ne.Temporary() {
				if tempDelay == 0 {
					tempDelay = 5 * time.Millisecond
				} else {
					tempDelay *= 2
				}
				if max := 1 * time.Second; tempDelay > max {
					tempDelay = max
				}
				select {
				case <-time.After(tempDelay):
				}
				continue
			}
			return err
		}
		tempDelay = 0

		go g.accept(conn)
	}
}

func (g *grpcServer) useTransportAuthenticator(rawConn net.Conn) (net.Conn, credentials.AuthInfo, error) {
	if creds := g.getCredentials(); creds != nil {
		return creds.ServerHandshake(rawConn)
	}
	return rawConn, nil, nil
}

func (g *grpcServer) accept(rawConn net.Conn) {
	conn, authInfo, err := g.useTransportAuthenticator(rawConn)

	if err != nil {
		rawConn.Close()
		return
	}

	serverConfig := g.getHttp2TransportConfig()
	serverConfig.AuthInfo = authInfo

	st, err := transport.NewServerTransport("http2", conn, &serverConfig)
	if err != nil {
		conn.Close()
		return
	}
	defer st.Close()

	var wg sync.WaitGroup
	st.HandleStreams(func(stream *transport.Stream) {
		wg.Add(1)
		g.wg.Add(1)
		go func() {
			defer func() {
				wg.Done()
				g.wg.Done()

				if r := recover(); r != nil {
					log.Log(r, string(debug.Stack()))
				}
			}()

			g.serveStream(st, stream)
		}()
	}, func(ctx context.Context, method string) context.Context {
		return ctx
	})
	wg.Wait()
}

func (g *grpcServer) serveStream(t transport.ServerTransport, stream *transport.Stream) {
	// get Go method from stream method
	serviceName, methodName, err := mgrpc.ServiceMethod(stream.Method())
	if err != nil {
		if gerr := t.WriteStatus(stream, status.New(codes.InvalidArgument, err.Error())); err != nil {
			log.Logf("grpc: Server.serveStream failed to write status: %v", gerr)
		}
		return
	}

	g.rpc.mu.Lock()
	service := g.rpc.serviceMap[serviceName]
	g.rpc.mu.Unlock()
	if service == nil {
		if err := t.WriteStatus(stream, status.New(codes.Unimplemented, fmt.Sprintf("unknown service %v", service))); err != nil {
			log.Logf("grpc: Server.serveStream failed to write status: %v", err)
		}
		return
	}

	mtype := service.method[methodName]
	if mtype == nil {
		if err := t.WriteStatus(stream, status.New(codes.Unimplemented, fmt.Sprintf("unknown service %v", service))); err != nil {
			log.Logf("grpc: Server.serveStream failed to write status: %v", err)
		}
		return
	}

	// get grpc metadata
	gmd, ok := metadata.FromIncomingContext(stream.Context())
	if !ok {
		gmd = metadata.MD{}
	}

	// copy the metadata to go-micro.metadata
	md := meta.Metadata{}
	for k, v := range gmd {
		md[k] = strings.Join(v, ", ")
	}

	// get content type
	ct := defaultContentType
	if ctype, ok := md["x-content-type"]; ok {
		ct = ctype
	}

	// get codec
	codec, err := g.newGRPCCodec(ct)
	if err != nil {
		if errr := t.WriteStatus(stream, status.New(codes.Internal, err.Error())); errr != nil {
			log.Logf("grpc: Server.serveStream failed to write status: %v", errr)
		}
		return
	}

	// timeout for server deadline
	to := md["timeout"]

	delete(md, "x-content-type")
	delete(md, "timeout")

	// create new context
	ctx := meta.NewContext(stream.Context(), md)

	// set the timeout if we have it
	if len(to) > 0 {
		if n, err := strconv.ParseUint(to, 10, 64); err == nil {
			ctx, _ = context.WithTimeout(ctx, time.Duration(n))
		}
	}

	// process unary
	if !mtype.stream {
		g.processRequest(t, stream, service, mtype, codec, ct, ctx)
		return
	}

	// process strea
	g.processStream(t, stream, service, mtype, codec, ct, ctx)
}

func (g *grpcServer) sendResponse(t transport.ServerTransport, stream *transport.Stream, msg interface{}, codec grpc.Codec, opts *transport.Options) error {
	hd, p, err := encode(codec, msg, nil, nil, nil)
	if err != nil {
		log.Fatalf("grpc: Server failed to encode response %v", err)
	}
	return t.Write(stream, hd, p, opts)
}

func (g *grpcServer) processRequest(t transport.ServerTransport, stream *transport.Stream, service *service, mtype *methodType, codec grpc.Codec, ct string, ctx context.Context) (err error) {
	p := &parser{r: stream}
	for {
		pf, req, err := p.recvMsg(defaultMaxMsgSize)
		if err == io.EOF {
			// The entire stream is done (for unary RPC only).
			return err
		}
		if err == io.ErrUnexpectedEOF {
			err = Errorf(codes.Internal, io.ErrUnexpectedEOF.Error())
		}
		if err != nil {
			switch err := err.(type) {
			case *rpcError:
				if err := t.WriteStatus(stream, status.New(err.code, err.desc)); err != nil {
					log.Logf("grpc: Server.processUnaryRPC failed to write status %v", err)
				}
			case transport.ConnectionError:
				// Nothing to do here.
			case transport.StreamError:
				if err := t.WriteStatus(stream, status.New(err.Code, err.Desc)); err != nil {
					log.Logf("grpc: Server.processUnaryRPC failed to write status %v", err)
				}
			default:
				panic(fmt.Sprintf("grpc: Unexpected error (%T) from recvMsg: %v", err, err))
			}
			return err
		}

		if err := checkRecvPayload(pf, stream.RecvCompress(), nil); err != nil {
			switch err := err.(type) {
			case *rpcError:
				if err := t.WriteStatus(stream, status.New(err.code, err.desc)); err != nil {
					log.Logf("grpc: Server.processUnaryRPC failed to write status %v", err)
				}
			default:
				if err := t.WriteStatus(stream, status.New(codes.Internal, err.Error())); err != nil {
					log.Logf("grpc: Server.processUnaryRPC failed to write status %v", err)
				}

			}
			return err
		}

		// status code/desc
		statusCode := codes.OK
		statusDesc := ""

		// exceeds max message size, bail early
		if len(req) > defaultMaxMsgSize {
			statusCode = codes.Internal
			statusDesc = fmt.Sprintf("grpc: server received a message of %d bytes exceeding %d limit", len(req), defaultMaxMsgSize)
			return t.WriteStatus(stream, status.New(statusCode, statusDesc))
		}

		var argv, replyv reflect.Value

		// Decode the argument value.
		argIsValue := false // if true, need to indirect before calling.
		if mtype.ArgType.Kind() == reflect.Ptr {
			argv = reflect.New(mtype.ArgType.Elem())
		} else {
			argv = reflect.New(mtype.ArgType)
			argIsValue = true
		}

		// Unmarshal request
		if err := codec.Unmarshal(req, argv.Interface()); err != nil {
			statusCode = convertCode(err)
			statusDesc = err.Error()
			if err := t.WriteStatus(stream, status.New(statusCode, statusDesc)); err != nil {
				log.Logf("grpc: Server.processUnaryRPC failed to write status: %v", err)
				return err
			}
			return nil
		}

		if argIsValue {
			argv = argv.Elem()
		}

		// reply value
		replyv = reflect.New(mtype.ReplyType.Elem())

		function := mtype.method.Func
		var returnValues []reflect.Value

		// create a client.Request
		r := &rpcRequest{
			service:     g.opts.Name,
			contentType: ct,
			method:      fmt.Sprintf("%s.%s", service.name, mtype.method.Name),
			request:     argv.Interface(),
		}

		// define the handler func
		fn := func(ctx context.Context, req server.Request, rsp interface{}) error {
			returnValues = function.Call([]reflect.Value{service.rcvr, mtype.prepareContext(ctx), reflect.ValueOf(req.Request()), reflect.ValueOf(rsp)})

			// The return value for the method is an error.
			if err := returnValues[0].Interface(); err != nil {
				return err.(error)
			}

			return nil
		}

		// wrap the handler func
		for i := len(g.opts.HdlrWrappers); i > 0; i-- {
			fn = g.opts.HdlrWrappers[i-1](fn)
		}

		// execute the handler
		if appErr := fn(ctx, r, replyv.Interface()); appErr != nil {
			if err, ok := appErr.(*rpcError); ok {
				statusCode = err.code
				statusDesc = err.desc
			} else if err, ok := appErr.(*errors.Error); ok {
				statusCode = microError(err)
				statusDesc = appErr.Error()
			} else {
				statusCode = convertCode(appErr)
				statusDesc = appErr.Error()
			}
			if err := t.WriteStatus(stream, status.New(statusCode, statusDesc)); err != nil {
				log.Logf("grpc: Server.processUnaryRPC failed to write status: %v", err)
				return err
			}
			return nil
		}
		opts := &transport.Options{
			Last:  true,
			Delay: false,
		}
		if err := g.sendResponse(t, stream, replyv.Interface(), codec, opts); err != nil {
			switch err := err.(type) {
			case transport.ConnectionError:
				// Nothing to do here.
			case transport.StreamError:
				statusCode = err.Code
				statusDesc = err.Desc
			default:
				statusCode = codes.Unknown
				statusDesc = err.Error()
			}
			return err
		}
		return t.WriteStatus(stream, status.New(statusCode, statusDesc))
	}
}

func (g *grpcServer) processStream(t transport.ServerTransport, stream *transport.Stream, service *service, mtype *methodType, codec grpc.Codec, ct string, ctx context.Context) (err error) {
	opts := g.opts

	r := &rpcRequest{
		service:     opts.Name,
		contentType: ct,
		method:      fmt.Sprintf("%s.%s", service.name, mtype.method.Name),
		stream:      true,
	}

	ss := &rpcStream{
		request:    r,
		t:          t,
		s:          stream,
		p:          &parser{r: stream},
		codec:      codec,
		maxMsgSize: defaultMaxMsgSize,
	}

	function := mtype.method.Func
	var returnValues []reflect.Value

	// Invoke the method, providing a new value for the reply.
	fn := func(ctx context.Context, req server.Request, stream interface{}) error {
		returnValues = function.Call([]reflect.Value{service.rcvr, mtype.prepareContext(ctx), reflect.ValueOf(stream)})
		if err := returnValues[0].Interface(); err != nil {
			return err.(error)
		}

		return nil
	}

	for i := len(opts.HdlrWrappers); i > 0; i-- {
		fn = opts.HdlrWrappers[i-1](fn)
	}

	appErr := fn(ctx, r, ss)
	if appErr != nil {
		if err, ok := appErr.(*rpcError); ok {
			ss.statusCode = err.code
			ss.statusDesc = err.desc
		} else if err, ok := appErr.(*errors.Error); ok {
			ss.statusCode = microError(err)
			ss.statusDesc = appErr.Error()
		} else if err, ok := appErr.(transport.StreamError); ok {
			ss.statusCode = err.Code
			ss.statusDesc = err.Desc
		} else {
			ss.statusCode = convertCode(appErr)
			ss.statusDesc = appErr.Error()
		}
	}

	return t.WriteStatus(ss.s, status.New(ss.statusCode, ss.statusDesc))
}

func (g *grpcServer) newGRPCCodec(contentType string) (grpc.Codec, error) {
	codecs := make(map[string]grpc.Codec)
	if g.opts.Context != nil {
		if v := g.opts.Context.Value(codecsKey{}); v != nil {
			codecs = v.(map[string]grpc.Codec)
		}
	}
	if c, ok := codecs[contentType]; ok {
		return c, nil
	}
	if c, ok := defaultGRPCCodecs[contentType]; ok {
		return c, nil
	}
	return nil, fmt.Errorf("Unsupported Content-Type: %s", contentType)
}

func (g *grpcServer) newCodec(contentType string) (codec.NewCodec, error) {
	if cf, ok := g.opts.Codecs[contentType]; ok {
		return cf, nil
	}
	if cf, ok := defaultRPCCodecs[contentType]; ok {
		return cf, nil
	}
	return nil, fmt.Errorf("Unsupported Content-Type: %s", contentType)
}

func (g *grpcServer) Options() server.Options {
	opts := g.opts
	return opts
}

func (g *grpcServer) Init(opts ...server.Option) error {
	for _, opt := range opts {
		opt(&g.opts)
	}
	return nil
}

func (g *grpcServer) NewHandler(h interface{}, opts ...server.HandlerOption) server.Handler {
	return newRpcHandler(h, opts...)
}

func (g *grpcServer) Handle(h server.Handler) error {
	if err := g.rpc.register(h.Handler()); err != nil {
		return err
	}

	g.handlers[h.Name()] = h
	return nil
}

func (g *grpcServer) NewSubscriber(topic string, sb interface{}, opts ...server.SubscriberOption) server.Subscriber {
	return newSubscriber(topic, sb, opts...)
}

func (g *grpcServer) Subscribe(sb server.Subscriber) error {
	sub, ok := sb.(*subscriber)
	if !ok {
		return fmt.Errorf("invalid subscriber: expected *subscriber")
	}
	if len(sub.handlers) == 0 {
		return fmt.Errorf("invalid subscriber: no handler functions")
	}

	if err := validateSubscriber(sb); err != nil {
		return err
	}

	g.Lock()

	_, ok = g.subscribers[sub]
	if ok {
		return fmt.Errorf("subscriber %v already exists", sub)
	}
	g.subscribers[sub] = nil
	g.Unlock()
	return nil
}

func (g *grpcServer) Register() error {
	// parse address for host, port
	config := g.opts
	var advt, host string
	var port int

	// check the advertise address first
	// if it exists then use it, otherwise
	// use the address
	if len(config.Advertise) > 0 {
		advt = config.Advertise
	} else {
		advt = config.Address
	}

	parts := strings.Split(advt, ":")
	if len(parts) > 1 {
		host = strings.Join(parts[:len(parts)-1], ":")
		port, _ = strconv.Atoi(parts[len(parts)-1])
	} else {
		host = parts[0]
	}

	addr, err := addr.Extract(host)
	if err != nil {
		return err
	}

	md := make(map[string]string, len(config.Metadata))
	for k, v := range config.Metadata {
		md[k] = v
	}

	// register service
	node := &registry.Node{
		Id:       config.Name + "-" + config.Id,
		Address:  addr,
		Port:     port,
		Metadata: md,
	}

	node.Metadata["broker"] = config.Broker.String()
	node.Metadata["registry"] = config.Registry.String()
	node.Metadata["server"] = g.String()
	node.Metadata["transport"] = g.String()
	// node.Metadata["transport"] = config.Transport.String()

	g.RLock()
	// Maps are ordered randomly, sort the keys for consistency
	var handlerList []string
	for n, e := range g.handlers {
		// Only advertise non internal handlers
		if !e.Options().Internal {
			handlerList = append(handlerList, n)
		}
	}
	sort.Strings(handlerList)

	var subscriberList []*subscriber
	for e := range g.subscribers {
		// Only advertise non internal subscribers
		if !e.Options().Internal {
			subscriberList = append(subscriberList, e)
		}
	}
	sort.Slice(subscriberList, func(i, j int) bool {
		return subscriberList[i].topic > subscriberList[j].topic
	})

	var endpoints []*registry.Endpoint
	for _, n := range handlerList {
		endpoints = append(endpoints, g.handlers[n].Endpoints()...)
	}
	for _, e := range subscriberList {
		endpoints = append(endpoints, e.Endpoints()...)
	}
	g.RUnlock()

	service := &registry.Service{
		Name:      config.Name,
		Version:   config.Version,
		Nodes:     []*registry.Node{node},
		Endpoints: endpoints,
	}

	g.Lock()
	registered := g.registered
	g.Unlock()

	if !registered {
		log.Logf("Registering node: %s", node.Id)
	}

	// create registry options
	rOpts := []registry.RegisterOption{registry.RegisterTTL(config.RegisterTTL)}

	if err := config.Registry.Register(service, rOpts...); err != nil {
		return err
	}

	// already registered? don't need to register subscribers
	if registered {
		return nil
	}

	g.Lock()
	defer g.Unlock()

	g.registered = true

	for sb, _ := range g.subscribers {
		handler := g.createSubHandler(sb, g.opts)
		var opts []broker.SubscribeOption
		if queue := sb.Options().Queue; len(queue) > 0 {
			opts = append(opts, broker.Queue(queue))
		}
		sub, err := config.Broker.Subscribe(sb.Topic(), handler, opts...)
		if err != nil {
			return err
		}
		g.subscribers[sb] = []broker.Subscriber{sub}
	}

	return nil
}

func (g *grpcServer) Deregister() error {
	config := g.opts
	var advt, host string
	var port int

	// check the advertise address first
	// if it exists then use it, otherwise
	// use the address
	if len(config.Advertise) > 0 {
		advt = config.Advertise
	} else {
		advt = config.Address
	}

	parts := strings.Split(advt, ":")
	if len(parts) > 1 {
		host = strings.Join(parts[:len(parts)-1], ":")
		port, _ = strconv.Atoi(parts[len(parts)-1])
	} else {
		host = parts[0]
	}

	addr, err := addr.Extract(host)
	if err != nil {
		return err
	}

	md := make(map[string]string, len(config.Metadata))
	for k, v := range config.Metadata {
		md[k] = v
	}

	node := &registry.Node{
		Id:       config.Name + "-" + config.Id,
		Address:  addr,
		Port:     port,
		Metadata: md,
	}

	service := &registry.Service{
		Name:    config.Name,
		Version: config.Version,
		Nodes:   []*registry.Node{node},
	}

	log.Logf("Deregistering node: %s", node.Id)
	if err := config.Registry.Deregister(service); err != nil {
		return err
	}

	g.Lock()

	if !g.registered {
		g.Unlock()
		return nil
	}

	g.registered = false

	for sb, subs := range g.subscribers {
		for _, sub := range subs {
			log.Logf("Unsubscribing from topic: %s", sub.Topic())
			sub.Unsubscribe()
		}
		g.subscribers[sb] = nil
	}

	g.Unlock()
	return nil
}

func (g *grpcServer) Start() error {
	registerDebugHandler(g)
	config := g.opts

	// micro: config.Transport.Listen(config.Address)
	ts, err := net.Listen("tcp", config.Address)
	if err != nil {
		return err
	}

	log.Logf("Listening on %s", ts.Addr().String())
	g.Lock()
	g.opts.Address = ts.Addr().String()
	g.Unlock()

	// micro: go ts.Accept(s.accept)
	go g.serve(ts)

	go func() {
		// wait for exit
		ch := <-g.exit

		// wait for waitgroup
		if wait(g.opts.Context) {
			g.wg.Wait()
		}

		// close transport
		ch <- ts.Close()

		// disconnect broker
		config.Broker.Disconnect()
	}()

	return config.Broker.Connect()
}

func (g *grpcServer) Stop() error {
	ch := make(chan error)
	g.exit <- ch
	return <-ch
}

func (g *grpcServer) String() string {
	return "grpc"
}

func NewServer(opts ...server.Option) server.Server {
	return newGRPCServer(opts...)
}

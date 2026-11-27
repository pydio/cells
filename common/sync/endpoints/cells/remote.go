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

package cells

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/pkg/errors"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/sync/endpoints/cells/transport"
	"github.com/pydio/cells/v5/common/sync/endpoints/cells/transport/mc"
	"github.com/pydio/cells/v5/common/sync/endpoints/cells/transport/oidc"
	"github.com/pydio/cells/v5/common/sync/model"
	"github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

var (
	// Shared by all remotes, which may connect concurrently (task endpoints, browsing)
	cacheMu           sync.Mutex
	memCerts          = map[string]*x509.CertPool{}
	detectedGrpcPorts = map[string]string{}
)

// RemoteConfig is a dependency-free struct similar to SdkConfig
type RemoteConfig struct {
	// Url stores domain name or IP & port to the server.
	Url string `json:"url"`
	// OIDC GrantPassword Flow
	ClientKey    string `json:"clientKey"`
	ClientSecret string `json:"clientSecret"`
	User         string `json:"user"`
	Password     string `json:"password"`
	// OIDC Code Flow
	IdToken      string `json:"id_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresAt    int    `json:"expires_at"`
	// SkipVerify tells the transport to ignore expired or self-signed TLS certificates
	SkipVerify    bool              `json:"skipVerify"`
	CustomHeaders map[string]string `json:"-"`
}

// Remote connect to a remove Cells server using the GRPC gateway.
type Remote struct {
	Abstract
	config *transport.SdkConfig

	session         *tree.IndexationSession
	sessionsCreates []*tree.CreateNodeRequest
}

// NewRemote creates a new Remote Endpoint
func NewRemote(config RemoteConfig, root string, options Options) *Remote {
	useCache := true
	if config.IdToken != "" {
		useCache = false
	}
	// HTTP requests (S3) carry the client UUID as a header: the server copies it into change events, which lets
	// Watch drop the echoes of our own operations. gRPC calls get it from the context (getContext).
	clientUUID := uuid.New()
	headers := make(map[string]string, len(config.CustomHeaders)+1)
	for k, v := range config.CustomHeaders {
		headers[k] = v
	}
	headers[common.XPydioClientUuid] = clientUUID
	sdkConfig := &transport.SdkConfig{
		Url:        config.Url,
		SkipVerify: config.SkipVerify,
		// Password Flow
		ClientKey:     config.ClientKey,
		ClientSecret:  config.ClientSecret,
		User:          config.User,
		Password:      config.Password,
		UseTokenCache: useCache,
		// Code Flow
		IdToken:        config.IdToken,
		RefreshToken:   config.RefreshToken,
		TokenExpiresAt: config.ExpiresAt,
		CustomHeaders:  headers,
	}

	c := &Remote{
		Abstract: Abstract{
			Root:       strings.TrimLeft(root, "/"),
			Options:    options,
			ClientUUID: clientUUID,
		},
		config: sdkConfig,
	}
	c.Factory = &remoteClientFactory{
		config: sdkConfig,
	}
	c.Source = c
	logCtx := context.Background()
	logCtx = runtime.WithServiceName(logCtx, "endpoint.cells.remote")
	c.GlobalCtx = logCtx
	return c
}

// RefreshRemoteConfig is used to refresh ID Token / Refresh Token from outside
func (c *Remote) RefreshRemoteConfig(config RemoteConfig) {
	f := c.Factory.(*remoteClientFactory)
	f.configMu.Lock()
	defer f.configMu.Unlock()
	f.config.IdToken = config.IdToken
	f.config.RefreshToken = config.RefreshToken
	f.config.TokenExpiresAt = config.ExpiresAt
}

// GetEndpointInfo returns Endpoint information in standard format.
func (c *Remote) GetEndpointInfo() model.EndpointInfo {
	return model.EndpointInfo{
		URI:                   fmt.Sprintf("%s/%s", c.config.Url, c.Root),
		RequiresNormalization: false,
		RequiresFoldersRescan: false,
		IsAsynchronous:        true,
		Ignores:               []string{common.PydioSyncHiddenFile},
	}

}

// remoteClientFactory implements the clientProviderFactory interface
type remoteClientFactory struct {
	// configMu guards the tokens of config, updated by RefreshRemoteConfig while clients read them.
	configMu sync.RWMutex
	config   *transport.SdkConfig

	connMu sync.Mutex
	conn   grpc.ClientConnInterface
}

// currentConfig returns a copy of the config, with the current tokens.
func (f *remoteClientFactory) currentConfig() *transport.SdkConfig {
	f.configMu.RLock()
	defer f.configMu.RUnlock()
	c := *f.config
	return &c
}

func (f *remoteClientFactory) GetNodeProviderClient(ctx context.Context) (context.Context, tree.NodeProviderClient, error) {
	ctx, cli, e := f.getClient(ctx)
	if e != nil {
		return nil, nil, e
	}
	return ctx, tree.NewNodeProviderClient(cli), nil
}

func (f *remoteClientFactory) GetNodeReceiverClient(ctx context.Context) (context.Context, tree.NodeReceiverClient, error) {
	ctx, cli, e := f.getClient(ctx)
	if e != nil {
		return nil, nil, e
	}
	return ctx, tree.NewNodeReceiverClient(cli), nil
}

func (f *remoteClientFactory) GetNodeChangesStreamClient(ctx context.Context) (context.Context, tree.NodeChangesStreamerClient, error) {
	ctx, cli, e := f.getClient(ctx)
	if e != nil {
		return nil, nil, e
	}
	return ctx, tree.NewNodeChangesStreamerClient(cli), nil
}

func (f *remoteClientFactory) GetNodeReceiverStreamClient(ctx context.Context) (context.Context, tree.NodeReceiverStreamClient, error) {
	ctx, cli, e := f.getClient(ctx)
	if e != nil {
		return nil, nil, e
	}
	return ctx, tree.NewNodeReceiverStreamClient(cli), nil
}

func (f *remoteClientFactory) GetNodeProviderStreamClient(ctx context.Context) (context.Context, tree.NodeProviderStreamerClient, error) {
	ctx, cli, e := f.getClient(ctx)
	if e != nil {
		return nil, nil, e
	}
	return ctx, tree.NewNodeProviderStreamerClient(cli), nil
}

func (f *remoteClientFactory) GetObjectsClient(ctx context.Context) (context.Context, ObjectsClient, error) {
	return ctx, mc.NewS3Client(f.currentConfig()), nil

}

func (f *remoteClientFactory) bearerContext(ctx context.Context) (context.Context, error) {
	config := f.currentConfig()
	jwt, err := oidc.RetrieveToken(config)
	if err != nil {
		return ctx, err
	}
	md := metadata.MD{}
	md.Set("x-pydio-bearer", jwt)
	// Forward the client UUID: the server copies it into change events, which lets Watch drop our own echoes
	if pm, ok := propagator.FromContextRead(ctx); ok {
		if cu, o := pm[common.XPydioClientUuid]; o && cu != "" {
			md.Set(strings.ToLower(common.XPydioClientUuid), cu)
		}
	}
	if config.CustomHeaders != nil {
		if ua, ok := config.CustomHeaders["User-Agent"]; ok {
			md.Set("x-pydio-grpc-user-agent", ua)
		}
	}
	return metadata.NewOutgoingContext(ctx, md), nil
}

func (f *remoteClientFactory) getClient(ctx context.Context) (context.Context, grpc.ClientConnInterface, error) {
	// One connection per remote, even when several goroutines ask for it at once
	f.connMu.Lock()
	defer f.connMu.Unlock()
	if f.conn != nil {
		return ctx, f.conn, nil
	}

	var options []grpc.DialOption

	// Detect Port - THIS SHOULD BE IN A RESOLVER
	host, port, useTls, err := f.detectGrpcPort(f.config, true)
	if err != nil {
		return ctx, nil, err
	}

	// Create Connexion
	if useTls {
		tlsConf := &tls.Config{InsecureSkipVerify: f.config.SkipVerify}
		if pool, err := f.serverCerts(); err == nil {
			tlsConf.RootCAs = pool
		} else {
			fmt.Println("Error while reading server certs", err)
		}
		options = append(options, grpc.WithTransportCredentials(credentials.NewTLS(tlsConf)))
	} else {
		options = append(options, grpc.WithInsecure())
	}

	options = append(options, grpc.WithUnaryInterceptor(func(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
		ctx, er := f.bearerContext(ctx)
		if er != nil {
			return er
		}
		return invoker(ctx, method, req, reply, cc, opts...)
	}))

	options = append(options, grpc.WithStreamInterceptor(func(ctx context.Context, desc *grpc.StreamDesc, cc *grpc.ClientConn, method string, streamer grpc.Streamer, opts ...grpc.CallOption) (grpc.ClientStream, error) {
		ctx, er := f.bearerContext(ctx)
		if er != nil {
			return nil, er
		}
		return streamer(ctx, desc, cc, method, opts...)
	}))

	conn, err := grpc.DialContext(ctx, fmt.Sprintf("%s:%s", host, port), options...)
	if err == nil {
		f.conn = conn
	}
	return ctx, conn, err

}

// serverCerts loads certificates from https served server to be set inside the client
func (f *remoteClientFactory) serverCerts() (*x509.CertPool, error) {
	cacheMu.Lock()
	pool, ok := memCerts[f.config.Url]
	cacheMu.Unlock()
	if ok {
		return pool, nil
	}
	u, _ := url.Parse(f.config.Url)
	d := &net.Dialer{
		Timeout: time.Duration(1) * time.Second,
	}
	h := u.Host
	if _, p, _ := net.SplitHostPort(u.Host); p == "" {
		h += ":443"
	}
	conn, err := tls.DialWithDialer(d, "tcp", h, &tls.Config{
		InsecureSkipVerify: f.config.SkipVerify,
	})
	if err != nil {
		return nil, err
	}
	defer conn.Close()
	cert := conn.ConnectionState().PeerCertificates

	if pool, err = x509.SystemCertPool(); err != nil {
		pool = x509.NewCertPool()
	}
	for _, c := range cert {
		pool.AddCert(c)
	}
	cacheMu.Lock()
	memCerts[f.config.Url] = pool
	cacheMu.Unlock()
	return pool, nil
}

// detectGrpcPort contacts the discovery service to find the grpc port
func (f *remoteClientFactory) detectGrpcPort(config *transport.SdkConfig, reload bool) (host string, port string, useTls bool, err error) {

	u, e := url.Parse(config.Url)
	if e != nil {
		err = errors.Wrap(model.NewConfigError(e), "cannot parse url")
		return
	}
	var mainPort string
	if strings.Contains(u.Host, ":") {
		host, mainPort, err = net.SplitHostPort(u.Host)
		if err != nil {
			return "", "", false, errors.Wrap(model.NewConfigError(err), "cannot split host/port")
		}
	} else {
		host = u.Host
	}
	useTls = u.Scheme == "https"

	cacheMu.Lock()
	port, ok := detectedGrpcPorts[host]
	cacheMu.Unlock()
	if !ok || reload {
		httpClient := http.DefaultClient
		if config.SkipVerify {
			httpClient = &http.Client{
				Transport: transport.InsecureTransport,
			}
		}
		resp, e := httpClient.Get(fmt.Sprintf("%s/a/config/discovery", config.Url))
		if e != nil {
			err = errors.Wrap(e, "cannot connect to discovery endpoint")
			return
		}
		defer resp.Body.Close()
		if resp.StatusCode != 200 {
			err = errors.New("cannot connect to discovery endpoint")
			return
		}
		var data map[string]interface{}
		var found bool
		decoder := jsonx.NewDecoder(resp.Body)
		if e := decoder.Decode(&data); e == nil {
			if ep, ok := data["Endpoints"]; ok {
				if endpoints, ok := ep.(map[string]interface{}); ok {
					if p, ok := endpoints["grpc"]; ok {
						port = strings.Split(p.(string), ",")[0]
						found = true
					}
				}
			}
		}
		if !found {
			// If no port is declared, we consider gRPC should be accessible on the main port
			if mainPort == "" {
				port = "443"
			} else {
				port = mainPort
			}
		}
		cacheMu.Lock()
		detectedGrpcPorts[host] = port
		cacheMu.Unlock()
	}
	return

}

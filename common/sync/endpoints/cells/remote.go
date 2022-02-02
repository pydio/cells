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
	"time"

	"github.com/pkg/errors"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/tree"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/sync/endpoints/cells/transport"
	"github.com/pydio/cells/v4/common/sync/endpoints/cells/transport/mc"
	"github.com/pydio/cells/v4/common/sync/endpoints/cells/transport/oidc"
	"github.com/pydio/cells/v4/common/sync/model"
	"github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var (
	memCerts          map[string]*x509.CertPool
	detectedGrpcPorts map[string]string
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
		CustomHeaders:  config.CustomHeaders,
	}

	c := &Remote{
		Abstract: Abstract{
			Root:       strings.TrimLeft(root, "/"),
			Options:    options,
			ClientUUID: uuid.New(),
		},
		config: sdkConfig,
	}
	c.Factory = &remoteClientFactory{
		config: sdkConfig,
		//registry: NewDynamicRegistry(sdkConfig),
	}
	c.Source = c
	logCtx := context.Background()
	logCtx = servicecontext.WithServiceName(logCtx, "endpoint.cells.remote")
	c.GlobalCtx = logCtx
	return c
}

// RefreshRemoteConfig is used to refresh ID Token / Refresh Token from outside
func (c *Remote) RefreshRemoteConfig(config RemoteConfig) {
	c.config.IdToken = config.IdToken
	c.config.RefreshToken = config.RefreshToken
	c.config.TokenExpiresAt = config.ExpiresAt
	c.Factory.(*remoteClientFactory).config = c.config
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
	config *transport.SdkConfig
	conn   grpc.ClientConnInterface
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
	return ctx, mc.NewS3Client(f.config), nil

}

func (f *remoteClientFactory) bearerContext(ctx context.Context) (context.Context, error) {
	jwt, err := oidc.RetrieveToken(f.config)
	if err != nil {
		return ctx, err
	}
	md := metadata.MD{}
	md.Set("x-pydio-bearer", jwt)
	if f.config.CustomHeaders != nil {
		if ua, ok := f.config.CustomHeaders["User-Agent"]; ok {
			md.Set("x-pydio-grpc-user-agent", ua)
		}
	}
	return metadata.NewOutgoingContext(ctx, md), nil
}

func (f *remoteClientFactory) getClient(ctx context.Context) (context.Context, grpc.ClientConnInterface, error) {

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
	if memCerts == nil {
		memCerts = make(map[string]*x509.CertPool)
	}
	if pool, ok := memCerts[f.config.Url]; ok {
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

	var pool *x509.CertPool
	if pool, err = x509.SystemCertPool(); err != nil {
		pool = x509.NewCertPool()
	}
	for _, c := range cert {
		pool.AddCert(c)
	}
	memCerts[f.config.Url] = pool
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

	var ok bool
	if detectedGrpcPorts == nil {
		detectedGrpcPorts = make(map[string]string)
	}
	if port, ok = detectedGrpcPorts[host]; !ok || reload {
		httpClient := http.DefaultClient
		if config.SkipVerify {
			httpClient = &http.Client{
				Transport: &http.Transport{
					TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
				},
			}
		}
		resp, e := httpClient.Get(fmt.Sprintf("%s/a/config/discovery", config.Url))
		if e != nil {
			err = errors.Wrap(e, "cannot connect to discovery endpoint")
			return
		} else if resp.StatusCode != 200 {
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
						detectedGrpcPorts[host] = port
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
			detectedGrpcPorts[host] = port
			return
		}
	}
	return

}

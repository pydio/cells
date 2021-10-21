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
	"net/url"
	"strings"
	"time"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/metadata"
	"github.com/pborman/uuid"

	"github.com/pydio/cells/common"
	microgrpc "github.com/pydio/cells/common/micro/client/grpc"
	"github.com/pydio/cells/common/proto/tree"
	servicecontext "github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/sync/endpoints/cells/transport"
	"github.com/pydio/cells/common/sync/endpoints/cells/transport/mc"
	"github.com/pydio/cells/common/sync/endpoints/cells/transport/oidc"
	"github.com/pydio/cells/common/sync/model"
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
		config:   sdkConfig,
		registry: NewDynamicRegistry(sdkConfig),
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
		URI: fmt.Sprintf("%s/%s", c.config.Url, c.Root),
		RequiresNormalization: false,
		RequiresFoldersRescan: false,
		IsAsynchronous:        true,
		Ignores:               []string{common.PydioSyncHiddenFile},
	}

}

// remoteClientFactory implements the clientProviderFactory interface
type remoteClientFactory struct {
	config   *transport.SdkConfig
	registry *DynamicRegistry
}

func (f *remoteClientFactory) GetNodeProviderClient(ctx context.Context) (context.Context, tree.NodeProviderClient, error) {
	ctx, cli, e := f.getClient(ctx)
	if e != nil {
		return nil, nil, e
	}
	return ctx, tree.NewNodeProviderClient(RemoteCellsServiceName, cli), nil
}

func (f *remoteClientFactory) GetNodeReceiverClient(ctx context.Context) (context.Context, tree.NodeReceiverClient, error) {
	ctx, cli, e := f.getClient(ctx)
	if e != nil {
		return nil, nil, e
	}
	return ctx, tree.NewNodeReceiverClient(RemoteCellsServiceName, cli), nil
}

func (f *remoteClientFactory) GetNodeChangesStreamClient(ctx context.Context) (context.Context, tree.NodeChangesStreamerClient, error) {
	ctx, cli, e := f.getClient(ctx)
	if e != nil {
		return nil, nil, e
	}
	return ctx, tree.NewNodeChangesStreamerClient(RemoteCellsServiceName, cli), nil
}

func (f *remoteClientFactory) GetNodeReceiverStreamClient(ctx context.Context) (context.Context, tree.NodeReceiverStreamClient, error) {
	ctx, cli, e := f.getClient(ctx)
	if e != nil {
		return nil, nil, e
	}
	return ctx, tree.NewNodeReceiverStreamClient(RemoteCellsServiceName, cli), nil
}

func (f *remoteClientFactory) GetNodeProviderStreamClient(ctx context.Context) (context.Context, tree.NodeProviderStreamerClient, error) {
	ctx, cli, e := f.getClient(ctx)
	if e != nil {
		return nil, nil, e
	}
	return ctx, tree.NewNodeProviderStreamerClient(RemoteCellsServiceName, cli), nil
}

func (f *remoteClientFactory) GetObjectsClient(ctx context.Context) (context.Context, ObjectsClient, error) {
	return ctx, mc.NewS3Client(f.config), nil

}

func (f *remoteClientFactory) getClient(ctx context.Context) (context.Context, client.Client, error) {
	jwt, err := oidc.RetrieveToken(f.config)
	if err != nil {
		return nil, nil, err
	}
	opts := []client.Option{
		client.Registry(f.registry.Micro),
		client.Wrap(func(i client.Client) client.Client {
			return &RegistryRefreshClient{w: i, r: f.registry}
		}),
	}
	u, _ := url.Parse(f.config.Url)
	if u.Scheme == "https" {
		if pool, err := f.serverCerts(); err == nil {
			opts = append(opts, microgrpc.AuthTLS(&tls.Config{
				InsecureSkipVerify: f.config.SkipVerify,
				RootCAs:            pool,
			}))
		}
	}

	microClient := microgrpc.NewClient(opts...)
	var md metadata.Metadata
	if m, ok := metadata.FromContext(ctx); ok {
		md = m
	} else {
		md = metadata.Metadata{}
	}
	md["x-pydio-bearer"] = jwt
	if f.config.CustomHeaders != nil {
		if ua, ok := f.config.CustomHeaders["User-Agent"]; ok {
			md["x-pydio-grpc-user-agent"] = ua
		}
	}
	ctx = metadata.NewContext(ctx, md)
	return ctx, microClient, nil

}

var memCerts map[string]*x509.CertPool

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

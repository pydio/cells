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

package mc

import (
	"context"
	"io"
	"net/http"
	"net/url"

	"github.com/pydio/minio-go"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/endpoints/cells/transport"
	"github.com/pydio/cells/common/sync/endpoints/cells/transport/oidc"
	"github.com/pydio/cells/common/views/models"
)

type S3Client struct {
	config   *transport.SdkConfig
	s3config *transport.S3Config
}

func NewS3Client(config *transport.SdkConfig) *S3Client {
	return &S3Client{
		config: config,
		s3config: &transport.S3Config{
			Bucket:                 "data",
			ApiKey:                 "gateway",
			ApiSecret:              "gatewaysecret",
			UsePydioSpecificHeader: false,
			IsDebug:                false,
			Region:                 "us-east-1",
			Endpoint:               config.Url,
		},
	}
}

func (g *S3Client) GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error) {
	jwt, err := oidc.RetrieveToken(g.config)
	if err != nil {
		return nil, err
	}
	u, _ := url.Parse(g.s3config.Endpoint)
	mc, e := minio.NewCore(u.Host, jwt, g.s3config.ApiSecret, u.Scheme == "https")
	if e != nil {
		return nil, e
	}
	t := http.DefaultTransport
	if g.config.SkipVerify {
		t = transport.InsecureTransport
	}
	if g.config.CustomHeaders != nil && len(g.config.CustomHeaders) > 0 {
		t = &customHeaderRoundTripper{rt: t, Headers: g.config.CustomHeaders}
	}
	mc.SetCustomTransport(t)
	r, _, e := mc.GetObject(g.s3config.Bucket, node.Path, minio.GetObjectOptions{})
	return r, e
}

func (g *S3Client) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (int64, error) {

	jwt, err := oidc.RetrieveToken(g.config)
	if err != nil {
		return 0, err
	}
	u, _ := url.Parse(g.s3config.Endpoint)
	mc, e := minio.NewCore(u.Host, jwt, g.s3config.ApiSecret, u.Scheme == "https")
	if e != nil {
		return 0, e
	}
	t := http.DefaultTransport
	if g.config.SkipVerify {
		t = transport.InsecureTransport
	}
	if g.config.CustomHeaders != nil && len(g.config.CustomHeaders) > 0 {
		t = &customHeaderRoundTripper{rt: t, Headers: g.config.CustomHeaders}
	}
	mc.SetCustomTransport(t)
	return mc.PutObjectWithContext(ctx, g.s3config.Bucket, node.Path, reader, requestData.Size, minio.PutObjectOptions{
		UserMetadata: requestData.Metadata,
	})
}

func (g *S3Client) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (int64, error) {
	jwt, err := oidc.RetrieveToken(g.config)
	if err != nil {
		return 0, err
	}
	mc, e := minio.New(g.s3config.Endpoint, g.s3config.ApiKey, jwt, false)
	if e != nil {
		return 0, e
	}
	t := http.DefaultTransport
	if g.config.SkipVerify {
		t = transport.InsecureTransport
	}
	if g.config.CustomHeaders != nil && len(g.config.CustomHeaders) > 0 {
		t = &customHeaderRoundTripper{rt: t, Headers: g.config.CustomHeaders}
	}
	mc.SetCustomTransport(t)
	dst, e := minio.NewDestinationInfo(g.s3config.Bucket, to.Path, nil, requestData.Metadata)
	if e != nil {
		return 0, e
	}
	src := minio.NewSourceInfo(g.s3config.Bucket, from.Path, nil)
	return 0, mc.CopyObject(dst, src)
}

type customHeaderRoundTripper struct {
	rt      http.RoundTripper
	Headers map[string]string
}

func (c customHeaderRoundTripper) RoundTrip(req *http.Request) (*http.Response, error) {
	for k, v := range c.Headers {
		req.Header.Set(k, v)
	}
	return c.rt.RoundTrip(req)
}

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

	"github.com/pydio/cells/v4/common"

	"github.com/minio/minio-go/v7/pkg/credentials"

	minio "github.com/minio/minio-go/v7"

	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/sync/endpoints/cells/transport"
	"github.com/pydio/cells/v4/common/sync/endpoints/cells/transport/oidc"
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
			ApiKey:                 common.S3GatewayRootUser,
			ApiSecret:              common.S3GatewayRootPassword,
			Region:                 common.S3GatewayDefaultRegion,
			UsePydioSpecificHeader: false,
			IsDebug:                false,
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
	t := http.DefaultTransport
	if g.config.SkipVerify {
		t = transport.InsecureTransport
	}
	if g.config.CustomHeaders != nil && len(g.config.CustomHeaders) > 0 {
		t = &customHeaderRoundTripper{rt: t, Headers: g.config.CustomHeaders}
	}
	opts := &minio.Options{
		Creds:     credentials.NewStaticV4(jwt, g.s3config.ApiSecret, ""),
		Secure:    u.Scheme == "https",
		Transport: t,
	}
	mc, e := minio.NewCore(u.Host, opts)
	if e != nil {
		return nil, e
	}
	r, _, _, e := mc.GetObject(ctx, g.s3config.Bucket, node.Path, minio.GetObjectOptions{})
	return r, e
}

func (g *S3Client) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (int64, error) {

	jwt, err := oidc.RetrieveToken(g.config)
	if err != nil {
		return 0, err
	}
	u, _ := url.Parse(g.s3config.Endpoint)
	t := http.DefaultTransport
	if g.config.SkipVerify {
		t = transport.InsecureTransport
	}
	if g.config.CustomHeaders != nil && len(g.config.CustomHeaders) > 0 {
		t = &customHeaderRoundTripper{rt: t, Headers: g.config.CustomHeaders}
	}
	opts := &minio.Options{
		Creds:     credentials.NewStaticV4(jwt, g.s3config.ApiSecret, ""),
		Secure:    u.Scheme == "https",
		Transport: t,
	}
	mc, e := minio.NewCore(u.Host, opts)
	if e != nil {
		return 0, e
	}
	if ui, e := mc.PutObject(ctx, g.s3config.Bucket, node.Path, reader, requestData.Size, "", "", minio.PutObjectOptions{
		UserMetadata: requestData.Metadata,
	}); e == nil {
		return ui.Size, nil
	} else {
		return 0, e
	}

}

func (g *S3Client) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (int64, error) {
	jwt, err := oidc.RetrieveToken(g.config)
	if err != nil {
		return 0, err
	}
	u, _ := url.Parse(g.s3config.Endpoint)
	t := http.DefaultTransport
	if g.config.SkipVerify {
		t = transport.InsecureTransport
	}
	if g.config.CustomHeaders != nil && len(g.config.CustomHeaders) > 0 {
		t = &customHeaderRoundTripper{rt: t, Headers: g.config.CustomHeaders}
	}
	opts := &minio.Options{
		Creds:     credentials.NewStaticV4(jwt, g.s3config.ApiSecret, ""),
		Secure:    u.Scheme == "https",
		Transport: t,
	}
	mc, e := minio.NewCore(u.Host, opts)
	if e != nil {
		return 0, e
	}

	dst := minio.PutObjectOptions{
		UserMetadata: requestData.Metadata,
	}
	src := minio.CopySrcOptions{
		Bucket: g.s3config.Bucket,
		Object: from.Path,
	}
	oi, er := mc.CopyObject(ctx, g.s3config.Bucket, from.Path, g.s3config.Bucket, to.Path, nil, src, dst)
	if er != nil {
		return 0, er
	}
	return oi.Size, nil
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

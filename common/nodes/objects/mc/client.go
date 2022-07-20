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
	"strings"

	"github.com/pydio/cells/v4/common/utils/configx"

	minio "github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/minio/minio-go/v7/pkg/notification"

	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/service/context/metadata"
)

// Client wraps a minio.Core client in the nodes.StorageClient interface
type Client struct {
	mc *minio.Core
}

func init() {
	nodes.RegisterStorageClient("mc", func(cfg configx.Values) (nodes.StorageClient, error) {
		ep := cfg.Val("endpoint").String()
		key := cfg.Val("key").String()
		secret := cfg.Val("secret").String()
		secure := cfg.Val("secure").Bool()
		sig := cfg.Val("signature").String()
		return New(ep, key, secret, secure, sig)
	})
}

// New creates a new minio.Core with the most standard options
func New(endpoint, accessKey, secretKey string, secure bool, sig string, customRegion ...string) (*Client, error) {
	rt, e := customHeadersTransport(secure)
	if e != nil {
		return nil, e
	}

	var signerType credentials.SignatureType
	switch strings.ToLower(sig) {
	case "v2":
		signerType = credentials.SignatureV2
	case "v4":
		signerType = credentials.SignatureV4
	case "anonymous":
		signerType = credentials.SignatureAnonymous
	case "v4streaming":
		signerType = credentials.SignatureV4Streaming
	default:
		signerType = credentials.SignatureDefault
	}
	options := &minio.Options{
		Creds:     credentials.NewStatic(accessKey, secretKey, "", signerType),
		Secure:    secure,
		Transport: rt,
	}
	if len(customRegion) > 0 {
		options.Region = customRegion[0]
	}
	c, err := minio.NewCore(endpoint, options)
	if err != nil {
		return nil, err
	}
	return &Client{
		mc: c,
	}, nil
}

func (c *Client) ListBuckets(ctx context.Context) ([]models.BucketInfo, error) {
	bb, e := c.mc.ListBuckets(ctx)
	if e != nil {
		return nil, e
	}
	buckets := make([]models.BucketInfo, len(bb))
	for i, b := range bb {
		buckets[i] = models.BucketInfo{
			Name:         b.Name,
			CreationDate: b.CreationDate,
		}
	}
	return buckets, nil
}

func (c *Client) MakeBucket(ctx context.Context, bucketName string, location string) (err error) {
	return c.mc.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{Region: location})
}

func (c *Client) RemoveBucket(ctx context.Context, bucketName string) error {
	return c.mc.RemoveBucket(ctx, bucketName)
}

func (c *Client) GetObject(ctx context.Context, bucketName, objectName string, opts models.ReadMeta) (io.ReadCloser, models.ObjectInfo, error) {
	rc, oi, _, e := c.mc.GetObject(ctx, bucketName, objectName, readMetaToMinioOpts(ctx, opts))
	if e != nil {
		return nil, models.ObjectInfo{}, e
	}
	return rc, minioInfoToModelsInfo(oi), nil
}

func (c *Client) StatObject(ctx context.Context, bucketName, objectName string, opts models.ReadMeta) (models.ObjectInfo, error) {

	oi, e := c.mc.StatObject(ctx, bucketName, objectName, readMetaToMinioOpts(ctx, opts))
	return minioInfoToModelsInfo(oi), e
}

func (c *Client) PutObject(ctx context.Context, bucketName, objectName string, reader io.Reader, objectSize int64,
	opts models.PutMeta) (n int64, err error) {
	if objectSize < 0 {
		ui, er := c.mc.Client.PutObject(ctx, bucketName, objectName, reader, objectSize, putMetaToMinioOpts(opts))
		if er != nil {
			return 0, er
		} else {
			return ui.Size, er
		}
	}
	ui, e := c.mc.PutObject(ctx, bucketName, objectName, reader, objectSize, "", "", putMetaToMinioOpts(opts))
	if e != nil {
		return 0, e
	} else {
		return ui.Size, e
	}
}

func (c *Client) RemoveObject(ctx context.Context, bucketName, objectName string) error {
	return c.mc.RemoveObject(ctx, bucketName, objectName, minio.RemoveObjectOptions{})
}

func (c *Client) ListObjects(ctx context.Context, bucket, prefix, marker, delimiter string, max ...int) (result models.ListBucketResult, err error) {
	recursive := true
	if delimiter == "/" {
		recursive = false
	}
	limit := 0
	if len(max) > 0 && max[0] > 0 {
		limit = max[0]
		var can context.CancelFunc
		ctx, can = context.WithCancel(ctx)
		defer can()
	}
	ch := c.mc.Client.ListObjects(ctx, bucket, minio.ListObjectsOptions{
		Prefix:     prefix,
		Recursive:  recursive,
		StartAfter: marker,
	})
	r := models.ListBucketResult{
		Delimiter: delimiter,
		Marker:    marker,
		Name:      bucket,
		Prefix:    prefix,
	}

	i := 0
	for oi := range ch {
		if oi.Err != nil {
			return result, oi.Err
		}
		i++
		if strings.HasSuffix(oi.Key, "/") {
			r.CommonPrefixes = append(r.CommonPrefixes, models.CommonPrefix{Prefix: oi.Key})
		} else {
			r.Contents = append(r.Contents, minioInfoToModelsInfo(oi))
		}
		if limit > 0 && i >= limit {
			break
		}
	}

	return r, nil
}

func (c *Client) NewMultipartUpload(ctx context.Context, bucket, object string, opts models.PutMeta) (uploadID string, err error) {
	return c.mc.NewMultipartUpload(ctx, bucket, object, putMetaToMinioOpts(opts))
}

func (c *Client) ListMultipartUploads(ctx context.Context, bucket, prefix, keyMarker, uploadIDMarker, delimiter string, maxUploads int) (result models.ListMultipartUploadsResult, err error) {
	ml, e := c.mc.ListMultipartUploads(ctx, bucket, prefix, keyMarker, uploadIDMarker, delimiter, maxUploads)
	if e != nil {
		return result, e
	}
	// Convert minio to models
	output := models.ListMultipartUploadsResult{
		Bucket:             ml.Bucket,
		KeyMarker:          ml.KeyMarker,
		UploadIDMarker:     ml.UploadIDMarker,
		NextKeyMarker:      ml.NextKeyMarker,
		NextUploadIDMarker: ml.NextUploadIDMarker,
		EncodingType:       ml.EncodingType,
		MaxUploads:         ml.MaxUploads,
		IsTruncated:        ml.IsTruncated,
		Uploads:            []models.MultipartObjectInfo{},
		Prefix:             ml.Prefix,
		Delimiter:          ml.Delimiter,
		CommonPrefixes:     []models.CommonPrefix{},
	}
	for _, u := range ml.Uploads {
		output.Uploads = append(output.Uploads, models.MultipartObjectInfo{
			Initiated:    u.Initiated,
			Initiator:    u.Initiator,
			Owner:        u.Owner,
			StorageClass: u.StorageClass,
			Key:          u.Key,
			Size:         u.Size,
			UploadID:     u.UploadID,
			Err:          u.Err,
		})
	}
	for _, c := range ml.CommonPrefixes {
		output.CommonPrefixes = append(output.CommonPrefixes, models.CommonPrefix{Prefix: c.Prefix})
	}
	return output, nil
}

func (c *Client) ListObjectParts(ctx context.Context, bucketName, objectName, uploadID string, partNumberMarker, maxParts int) (models.ListObjectPartsResult, error) {
	opp, er := c.mc.ListObjectParts(ctx, bucketName, objectName, uploadID, partNumberMarker, maxParts)
	if er != nil {
		return models.ListObjectPartsResult{}, er
	}
	lpi := models.ListObjectPartsResult{
		Bucket:               opp.Bucket,
		Key:                  opp.Key,
		UploadID:             opp.UploadID,
		Initiator:            opp.Initiator,
		Owner:                opp.Owner,
		StorageClass:         opp.StorageClass,
		PartNumberMarker:     opp.PartNumberMarker,
		NextPartNumberMarker: opp.NextPartNumberMarker,
		MaxParts:             opp.MaxParts,
		IsTruncated:          opp.IsTruncated,
		EncodingType:         opp.EncodingType,
	}
	for _, part := range lpi.ObjectParts {
		lpi.ObjectParts = append(lpi.ObjectParts, models.MultipartObjectPart{
			PartNumber:   part.PartNumber,
			LastModified: part.LastModified,
			ETag:         part.ETag,
			Size:         part.Size,
		})
	}
	return lpi, nil
}

func (c *Client) CompleteMultipartUpload(ctx context.Context, bucket, object, uploadID string, parts []models.MultipartObjectPart) (string, error) {
	cparts := make([]minio.CompletePart, len(parts))
	for i, p := range parts {
		cparts[i] = minio.CompletePart{
			PartNumber: p.PartNumber,
			ETag:       p.ETag,
		}
	}
	return c.mc.CompleteMultipartUpload(ctx, bucket, object, uploadID, cparts, minio.PutObjectOptions{})
}

func (c *Client) PutObjectPart(ctx context.Context, bucket, object, uploadID string, partID int, data io.Reader, size int64, md5Base64, sha256Hex string) (models.MultipartObjectPart, error) {
	pp, e := c.mc.PutObjectPart(ctx, bucket, object, uploadID, partID, data, size, md5Base64, sha256Hex, nil)
	if e != nil {
		return models.MultipartObjectPart{}, e
	}
	return models.MultipartObjectPart{
		PartNumber:   pp.PartNumber,
		LastModified: pp.LastModified,
		ETag:         pp.ETag,
		Size:         pp.Size,
	}, nil
}

func (c *Client) AbortMultipartUpload(ctx context.Context, bucket, object, uploadID string) error {
	return c.mc.AbortMultipartUpload(ctx, bucket, object, uploadID)
}

func (c *Client) CopyObject(ctx context.Context, sourceBucket, sourceObject, destBucket, destObject string, srcMeta, metadata map[string]string, progress io.Reader) (models.ObjectInfo, error) {
	if strings.Contains(sourceObject, "#") {
		sourceObject = strings.ReplaceAll(sourceObject, "#", "%23")
	}
	srcOptions := minio.CopySrcOptions{
		Bucket: sourceBucket,
		Object: sourceObject,
	}
	destOptions := minio.PutObjectOptions{
		Progress:     progress,
		UserMetadata: metadata,
	}

	// Merge dest meta in general headers
	if metadata != nil {
		if srcMeta == nil {
			srcMeta = make(map[string]string, len(metadata))
		}
		for k, v := range metadata {
			srcMeta[k] = v
		}
	}

	if oi, e := c.mc.CopyObject(ctx, sourceBucket, sourceObject, destBucket, destObject, srcMeta, srcOptions, destOptions); e != nil {
		return models.ObjectInfo{}, e
	} else {
		return minioInfoToModelsInfo(oi), nil
	}
}

// ListenBucketNotification hooks to events - Not part of the interface
func (c *Client) ListenBucketNotification(ctx context.Context, bucketName, prefix, suffix string, events []string) <-chan notification.Info {
	return c.mc.ListenBucketNotification(ctx, bucketName, prefix, suffix, events)
}

func readMetaToMinioOpts(ctx context.Context, meta models.ReadMeta) minio.GetObjectOptions {
	opt := minio.GetObjectOptions{}
	if mm, ok := metadata.MinioMetaFromContext(ctx); ok {
		for k, v := range mm {
			opt.Set(k, v)
		}
	}
	for k, v := range meta {
		opt.Set(k, v)
	}
	return opt
}

func putMetaToMinioOpts(meta models.PutMeta) minio.PutObjectOptions {
	opt := minio.PutObjectOptions{
		UserMetadata:            meta.UserMetadata,
		Progress:                meta.Progress,
		ContentType:             meta.ContentType,
		ContentEncoding:         meta.ContentEncoding,
		ContentDisposition:      meta.ContentDisposition,
		ContentLanguage:         meta.ContentLanguage,
		CacheControl:            meta.CacheControl,
		ServerSideEncryption:    nil,
		NumThreads:              meta.NumThreads,
		StorageClass:            meta.StorageClass,
		WebsiteRedirectLocation: meta.WebsiteRedirectLocation,
	}
	return opt
}

func minioInfoToModelsInfo(oi minio.ObjectInfo) models.ObjectInfo {
	return models.ObjectInfo{
		ETag:         oi.ETag,
		Key:          oi.Key,
		LastModified: oi.LastModified,
		Size:         oi.Size,
		ContentType:  oi.ContentType,
		Metadata:     oi.Metadata,
		Owner:        &models.ObjectInfoOwner{DisplayName: oi.Owner.DisplayName, ID: oi.Owner.ID},
		StorageClass: oi.StorageClass,
		Err:          oi.Err,
	}
}

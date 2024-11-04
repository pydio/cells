/*
 * Minio Cloud Storage, (C) 2017 Minio, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package pydio

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/minio/cli"
	minio "github.com/minio/minio/cmd"
	"github.com/minio/minio/pkg/auth"
	"github.com/minio/minio/pkg/bucket/policy"
	"github.com/minio/minio/pkg/bucket/policy/condition"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/telemetry/log"
)

const (
	pydioBackend = "pydio"
)

var (
	PydioGateway *Pydio
)

func init() {
	e := minio.RegisterGatewayCommand(cli.Command{
		Name:               pydioBackend,
		Usage:              "Pydio Gateway",
		Action:             pydioGatewayMain,
		CustomHelpTemplate: "",
		HideHelpCommand:    true,
	})
	if e != nil {
		fmt.Println("[ERROR] Cannot RegisterGatewayCommand " + e.Error())
	}

}

type Pydio struct {
	RuntimeCtx context.Context
}

// s3Objects implements gateway for Minio and S3 compatible object storage servers.
type pydioObjects struct {
	minio.GatewayUnsupported
	Router nodes.Client
}

func (l *pydioObjects) MakeBucketWithLocation(_ context.Context, _ string, _ minio.BucketOptions) error {
	return minio.NotImplemented{}
}

func (l *pydioObjects) DeleteBucket(_ context.Context, _ string, _ bool) error {
	return minio.NotImplemented{}
}

func (l *pydioObjects) DeleteObjects(_ context.Context, _ string, _ []minio.ObjectToDelete, _ minio.ObjectOptions) ([]minio.DeletedObject, []error) {
	return nil, []error{minio.NotImplemented{}}
}

// Name returns the unique name of the gateway.
func (p *Pydio) Name() string {
	return pydioBackend
}

// NewGatewayLayer returns a new  ObjectLayer.
func (p *Pydio) NewGatewayLayer(_ *minio.Globals, _ auth.Credentials) (minio.ObjectLayer, error) {
	o := &pydioObjects{
		Router: compose.PathClient(p.RuntimeCtx, nodes.WithReadEventsLogging(), nodes.WithAuditEventsLogging()),
	}
	return o, nil
}

var _ minio.ObjectLayer = &pydioObjects{}

// Production - s3 gateway is production ready.
func (p *Pydio) Production() bool {
	return true
}

// Handler for 'minio gateway azure' command line.
func pydioGatewayMain(ctx *cli.Context) {
	sd, _ := runtime.ServiceDataDir(common.ServiceGatewayData)
	_ = ctx.Set("config-dir", filepath.Join(sd, "cfg"))
	_ = ctx.Set("certs-dir", filepath.Join(sd, "certs"))
	minio.StartGateway(ctx, PydioGateway)
}

// fromMinioClientObjectInfo converts minio ObjectInfo to gateway ObjectInfo
func fromPydioNodeObjectInfo(bucket string, node *tree.Node) minio.ObjectInfo {

	cType := "application/octet-stream"
	if c := node.GetStringMeta(common.MetaNamespaceMime); c != "" {
		cType = c
	}
	userDefined := map[string]string{
		"Content-Type": cType,
	}
	vId := node.GetStringMeta(common.MetaNamespaceVersionId)

	nodePath := node.Path
	if node.Type == tree.NodeType_COLLECTION {
		nodePath += "/"
	}
	return minio.ObjectInfo{
		Bucket:          bucket,
		Name:            nodePath,
		ModTime:         time.Unix(0, node.MTime*int64(time.Second)),
		Size:            node.Size,
		ETag:            minio.CanonicalizeETag(node.Etag),
		UserDefined:     userDefined,
		ContentType:     cType,
		ContentEncoding: "",
		VersionID:       vId,
	}
}

func pydioToMinioError(err error, bucket, key string) error {
	if errors.Is(err, errors.StatusForbidden) {
		err = minio.PrefixAccessDenied{
			Bucket: bucket,
			Object: key,
		}
	} else if errors.Is(err, errors.StatusNotFound) {
		err = minio.ObjectNotFound{
			Bucket: bucket,
			Object: key,
		}
	} else if errors.Is(err, errors.StatusQuotaReached) {
		err = minio.PydioQuotaExceeded{
			Bucket: bucket,
			Object: key,
		}
	}
	return minio.ErrorRespToObjectError(err, bucket, key)
}

// GetBucketPolicy will get a fake policy that allows anonymous access to buckets (an additional layer is already checking all requests)
func (l *pydioObjects) GetBucketPolicy(ctx context.Context, bucket string) (bucketPolicy *policy.Policy, err error) {
	allowAllStatement := policy.NewStatement(
		policy.Allow,
		policy.NewPrincipal("*"),
		policy.NewActionSet(policy.GetObjectAction, policy.PutObjectAction),
		policy.NewResourceSet(policy.NewResource("*", "*")),
		condition.NewFunctions(),
	)
	return &policy.Policy{Statements: []policy.Statement{allowAllStatement}}, nil
}

func (l *pydioObjects) ListPydioObjects(ctx context.Context, bucket string, prefix string, delimiter string, maxKeys int, versions bool) (objects []minio.ObjectInfo, prefixes []string, err error) {

	// log.Printf("ListPydioObjects With Version? %v", versions)

	treePath := strings.TrimLeft(prefix, "/")
	recursive := false
	if delimiter == "" {
		recursive = true
	}
	var FilterType tree.NodeType
	if maxKeys == 1 {
		// We probably want to get only the very first object here (for folders stats)
		// log.Println("Should get only LEAF nodes")
		FilterType = tree.NodeType_LEAF
		recursive = false
	}
	lNodeClient, err := l.Router.ListNodes(ctx, &tree.ListNodesRequest{
		Node: &tree.Node{
			Path: treePath,
		},
		Recursive:    recursive,
		WithVersions: versions,
		Limit:        int64(maxKeys),
		FilterType:   FilterType,
	})
	if err != nil {
		if errors.Is(err, errors.StatusNotFound) {
			return nil, nil, nil // Ignore and return empty list
		}
		return nil, nil, pydioToMinioError(err, bucket, prefix)
	}
	defer lNodeClient.CloseSend()
	for {
		clientResponse, err := lNodeClient.Recv()
		if err != nil {
			break
		}
		if clientResponse == nil {
			continue
		}
		// log.Println(clientResponse.Node.Path)
		objectInfo := fromPydioNodeObjectInfo(bucket, clientResponse.Node)
		if clientResponse.Node.IsLeaf() {
			objects = append(objects, objectInfo)
		} else {
			prefixes = append(prefixes, objectInfo.Name)
		}

	}
	if len(objects) > 0 && strings.Trim(prefix, "/") != "" {
		prefixes = append(prefixes, strings.TrimLeft(prefix, "/"))
	}

	return objects, prefixes, nil
}

// Shutdown saves any gateway metadata to disk
// if necessary and reload upon next restart.
func (l *pydioObjects) Shutdown(_ context.Context) error {
	// TODO
	return nil
}

// StorageInfo is not relevant to S3 backend.
func (l *pydioObjects) StorageInfo(_ context.Context) (minio.StorageInfo, []error) {
	return minio.StorageInfo{}, nil
}

// GetBucketInfo gets bucket metadata..
func (l *pydioObjects) GetBucketInfo(_ context.Context, bucket string) (bi minio.BucketInfo, e error) {

	if bucket != "io" && bucket != "data" {
		return bi, minio.BucketNotFound{Bucket: bucket}
	}
	return minio.BucketInfo{
		Name:    bucket,
		Created: time.Now(),
	}, nil

}

// ListBuckets lists all S3 buckets
func (l *pydioObjects) ListBuckets(_ context.Context) ([]minio.BucketInfo, error) {

	return []minio.BucketInfo{
		{Name: "io", Created: time.Now()},
		{Name: "data", Created: time.Now()},
	}, nil

}

// ListObjects lists all blobs in S3 bucket filtered by prefix
func (l *pydioObjects) ListObjects(ctx context.Context, bucket string, prefix string, marker string, delimiter string, maxKeys int /*, versions bool*/) (loi minio.ListObjectsInfo, e error) {

	//objects, prefixes, err := l.ListPydioObjects(ctx, bucket, prefix, delimiter, maxKeys, versions)
	objects, prefixes, err := l.ListPydioObjects(ctx, bucket, prefix, delimiter, maxKeys, false)
	if err != nil {
		return loi, pydioToMinioError(err, bucket, prefix)
	}

	// log.Printf("[ListObjects] Returning %d objects and %d prefixes (V1) for prefix %s\n", len(objects), len(prefixes), prefix)

	return minio.ListObjectsInfo{
		IsTruncated: false,
		NextMarker:  "",
		Prefixes:    prefixes,
		Objects:     objects,
	}, nil

}

// ListObjectsV2 lists all blobs in S3 bucket filtered by prefix
func (l *pydioObjects) ListObjectsV2(ctx context.Context, bucket, prefix, continuationToken, delimiter string, maxKeys int, fetchOwner bool, startAfter string) (result minio.ListObjectsV2Info, err error) {

	objects, prefixes, err := l.ListPydioObjects(ctx, bucket, prefix, delimiter, maxKeys, false)
	if err != nil {
		return result, pydioToMinioError(err, bucket, prefix)
	}

	// log.Printf("\n[ListObjectsV2] Returning %d objects and %d prefixes (V2) for prefix %s\n", len(objects), len(prefixes), prefix)

	return minio.ListObjectsV2Info{
		IsTruncated: false,
		Prefixes:    prefixes,
		Objects:     objects,

		ContinuationToken:     "",
		NextContinuationToken: "",
	}, nil

}

// GetObjectInfo reads object info and replies back ObjectInfo
func (l *pydioObjects) GetObjectInfo(ctx context.Context, bucket string, object string, opts minio.ObjectOptions) (objInfo minio.ObjectInfo, err error) {

	//fmt.Println("[Gateway:GetObjectInfo]" + object)

	path := strings.TrimLeft(object, "/")
	node := &tree.Node{
		Path: path,
	}
	if opts.VersionID != "" {
		node.MustSetMeta(common.MetaNamespaceVersionId, opts.VersionID)
	}
	readNodeResponse, err := l.Router.ReadNode(ctx, &tree.ReadNodeRequest{Node: node})
	if err != nil {
		return minio.ObjectInfo{}, pydioToMinioError(err, bucket, object)
	}

	if !readNodeResponse.Node.IsLeaf() {
		return minio.ObjectInfo{}, errors.WithStack(errors.NodeTypeConflict)
	}

	return fromPydioNodeObjectInfo(bucket, readNodeResponse.Node), nil

}

// GetObjectNInfo - returns object info and locked object ReadCloser
func (l *pydioObjects) GetObjectNInfo(ctx context.Context, bucket, object string, rs *minio.HTTPRangeSpec, h http.Header, lockType minio.LockType, opts minio.ObjectOptions) (gr *minio.GetObjectReader, err error) {
	var objInfo minio.ObjectInfo
	objInfo, err = l.GetObjectInfo(ctx, bucket, object, opts)
	if err != nil {
		return nil, err
	}

	var startOffset, length int64
	startOffset, length, err = rs.GetOffsetLength(objInfo.Size)
	if err != nil {
		return nil, err
	}

	pr, pw := io.Pipe()
	go func() {
		err := l.GetObject(ctx, bucket, object, startOffset, length, pw, objInfo.ETag, opts)
		pw.CloseWithError(err)
	}()
	// Setup cleanup function to cause the above go-routine to
	// exit in case of partial read
	pipeCloser := func() { pr.Close() }
	or, e := minio.NewGetObjectReaderFromReader(pr, objInfo, minio.ObjectOptions{}, pipeCloser)
	if e != nil {
		return nil, e
	}
	return or, nil
}

// GetObject reads an object from S3. Supports additional
// parameters like offset and length which are synonymous with
// HTTP Range requests.
//
// startOffset indicates the starting read location of the object.
// length indicates the total length of the object.
func (l *pydioObjects) GetObject(ctx context.Context, bucket string, key string, startOffset int64, length int64, writer io.Writer, tag string, opts minio.ObjectOptions) error {

	// log.Println("[GetObject] From Router", bucket, key, startOffset, length)

	path := strings.TrimLeft(key, "/")
	objectReader, err := l.Router.GetObject(ctx, &tree.Node{
		Path: path,
	}, &models.GetRequestData{
		StartOffset: startOffset,
		Length:      length,
		VersionId:   opts.VersionID,
	})
	if err != nil {
		return pydioToMinioError(err, bucket, key)
	}
	defer objectReader.Close()
	if _, err := io.Copy(writer, objectReader); err != nil {
		return minio.ErrorRespToObjectError(err, bucket, key)
	}
	return nil

}

// PutObject creates a new object with the incoming data,
func (l *pydioObjects) PutObject(ctx context.Context, bucket, object string, data *minio.PutObjReader, opts minio.ObjectOptions) (objInfo minio.ObjectInfo, err error) {

	if opts.UserDefined != nil {
		md5sum := opts.UserDefined["etag"]
		if md5sum != "" {
			delete(opts.UserDefined, "etag")
		}
	}

	oi, err := l.Router.PutObject(ctx, &tree.Node{
		Path: strings.TrimLeft(object, "/"),
	}, data, &models.PutRequestData{
		Size:      data.Size(),
		Sha256Sum: data.SHA256(),
		Md5Sum:    data.MD5(),
		Metadata:  opts.UserDefined,
	})
	if err != nil {
		log.Logger(ctx).Error("Error while putting object:" + err.Error())
		return objInfo, pydioToMinioError(err, bucket, object)
	}
	objInfo = minio.ObjectInfo{
		Bucket:       bucket,
		Name:         object,
		Size:         oi.Size,
		ETag:         oi.ETag,
		StorageClass: oi.StorageClass,
		ModTime:      oi.LastModified,
	}
	return objInfo, nil

}

// CopyObject copies a blob from source container to destination container.
func (l *pydioObjects) CopyObject(ctx context.Context, srcBucket string, srcObject string, destBucket string, destObject string,
	srcInfo minio.ObjectInfo, srcOpts, dstOpts minio.ObjectOptions) (objInfo minio.ObjectInfo, e error) {

	if srcObject == destObject && srcOpts.VersionID == "" {
		// log.Printf("Coping %v to %v, this is a REPLACE meta directive \n", srcObject, destObject)
		// log.Println(requestMetadata)
		return objInfo, (&minio.NotImplemented{})
	}
	oi, err := l.Router.CopyObject(ctx, &tree.Node{
		Path: strings.TrimLeft(srcObject, "/"),
	}, &tree.Node{
		Path: strings.TrimLeft(destObject, "/"),
	}, &models.CopyRequestData{
		SrcVersionId: srcOpts.VersionID,
	})

	if err != nil {
		return objInfo, pydioToMinioError(err, srcBucket, srcObject)
	}
	return minio.ObjectInfo{
		Bucket:       destBucket,
		Name:         destObject,
		Size:         oi.Size,
		ETag:         oi.ETag,
		StorageClass: oi.StorageClass,
		ModTime:      oi.LastModified,
	}, nil

}

// DeleteObject deletes a blob in bucket
func (l *pydioObjects) DeleteObject(ctx context.Context, bucket string, object string, opts minio.ObjectOptions) (minio.ObjectInfo, error) {

	// log.Println("[DeleteObject]", object)
	_, err := l.Router.DeleteNode(ctx, &tree.DeleteNodeRequest{
		Node: &tree.Node{
			Path: strings.TrimLeft(object, "/"),
		},
	})
	if err != nil {
		return minio.ObjectInfo{}, pydioToMinioError(err, bucket, object)
	}
	return minio.ObjectInfo{}, nil

}

// ListMultipartUploads lists all multipart uploads.
func (l *pydioObjects) ListMultipartUploads(ctx context.Context, bucket string, prefix string, keyMarker string, uploadIDMarker string, delimiter string, maxUploads int) (lmi minio.ListMultipartsInfo, e error) {

	result, err := l.Router.MultipartList(ctx, prefix, &models.MultipartRequestData{
		ListKeyMarker:      keyMarker,
		ListUploadIDMarker: uploadIDMarker,
		ListDelimiter:      delimiter,
		ListMaxUploads:     maxUploads,
	})
	if err == nil {
		res := minio.ListMultipartsInfo{
			KeyMarker:          result.KeyMarker,
			UploadIDMarker:     result.UploadIDMarker,
			NextKeyMarker:      result.NextKeyMarker,
			NextUploadIDMarker: result.NextUploadIDMarker,
			MaxUploads:         int(result.MaxUploads),
			IsTruncated:        result.IsTruncated,
			Uploads:            make([]minio.MultipartInfo, len(result.Uploads)),
			Prefix:             result.Prefix,
			Delimiter:          result.Delimiter,
			CommonPrefixes:     make([]string, len(result.CommonPrefixes)),
			EncodingType:       result.EncodingType,
		}
		for i, u := range result.Uploads {
			res.Uploads[i] = minio.MultipartInfo{
				Bucket:    bucket,
				Object:    u.Key,
				UploadID:  u.UploadID,
				Initiated: u.Initiated,
				//StorageClass: u.StorageClass,
			}
		}
		for i, cp := range result.CommonPrefixes {
			res.CommonPrefixes[i] = cp.Prefix
		}
		return res, nil
	} else {
		return lmi, err
	}

}

// NewMultipartUpload upload object in multiple parts
func (l *pydioObjects) NewMultipartUpload(ctx context.Context, bucket string, object string, o minio.ObjectOptions) (uploadID string, err error) {

	uploadID, err = l.Router.MultipartCreate(ctx, &tree.Node{
		Path: object,
	}, &models.MultipartRequestData{
		Metadata: minio.ToMinioClientMetadata(o.UserDefined),
	})
	if err != nil {
		err = pydioToMinioError(err, bucket, object)
	}
	return

}

// GetMultipartInfo returns multipart info of the uploadId of the object
func (l *pydioObjects) GetMultipartInfo(ctx context.Context, bucket, object, uploadID string, opts minio.ObjectOptions) (info minio.MultipartInfo, err error) {
	info.Bucket = bucket
	info.Object = object
	info.UploadID = uploadID
	return info, nil
}

// PutObjectPart puts a part of object in bucket
func (l *pydioObjects) PutObjectPart(ctx context.Context, bucket, object, uploadID string, partID int, data *minio.PutObjReader, opts minio.ObjectOptions) (info minio.PartInfo, err error) {

	//sha256Sum, err := hex.DecodeString(data.sha256Sum)
	//md5Sum, err := hex.DecodeString(data.md5Sum)
	objectPart, err := l.Router.MultipartPutObjectPart(ctx, &tree.Node{Path: object}, uploadID, partID, data, &models.PutRequestData{
		Size:              data.Size(),
		Md5Sum:            data.MD5(),    // md5Sum,
		Sha256Sum:         data.SHA256(), //sha256Sum,
		MultipartPartID:   partID,
		MultipartUploadID: uploadID,
	})
	if err != nil {
		return info, err
	}

	return minio.PartInfo{
		Size:         objectPart.Size,
		ETag:         objectPart.ETag,
		LastModified: objectPart.LastModified,
		PartNumber:   partID,
	}, nil

}

// ListObjectParts returns all object parts for specified object in specified bucket
func (l *pydioObjects) ListObjectParts(ctx context.Context, bucket, object, uploadID string, partNumberMarker int, maxParts int, opts minio.ObjectOptions) (lpi minio.ListPartsInfo, e error) {

	result, err := l.Router.MultipartListObjectParts(ctx, &tree.Node{Path: object}, uploadID, partNumberMarker, maxParts)
	if err != nil {
		return lpi, err
	}

	// Convert minio ObjectPart to PartInfo
	fromMinioClientObjectParts := func(parts []models.MultipartObjectPart) []minio.PartInfo {
		toParts := make([]minio.PartInfo, len(parts))
		for i, part := range parts {
			canonicalETag := strings.TrimPrefix(part.ETag, "\"")
			canonicalETag = strings.TrimSuffix(canonicalETag, "\"")
			toParts[i] = minio.PartInfo{
				Size:         part.Size,
				ETag:         part.ETag,
				LastModified: part.LastModified,
				PartNumber:   part.PartNumber,
			}
		}
		return toParts
	}

	return minio.ListPartsInfo{
		UploadID:             result.UploadID,
		Bucket:               result.Bucket,
		Object:               result.Key,
		StorageClass:         result.StorageClass,
		PartNumberMarker:     result.PartNumberMarker,
		NextPartNumberMarker: result.NextPartNumberMarker,
		MaxParts:             result.MaxParts,
		IsTruncated:          result.IsTruncated,
		Parts:                fromMinioClientObjectParts(result.ObjectParts),
	}, nil

}

// AbortMultipartUpload aborts a ongoing multipart upload
func (l *pydioObjects) AbortMultipartUpload(ctx context.Context, bucket string, object string, uploadID string, opts minio.ObjectOptions) error {

	return l.Router.MultipartAbort(ctx, &tree.Node{Path: object}, uploadID, &models.MultipartRequestData{Metadata: opts.UserDefined})

}

// CompleteMultipartUpload completes ongoing multipart upload and finalizes object
func (l *pydioObjects) CompleteMultipartUpload(ctx context.Context, bucket string, object string, uploadID string, uploadedParts []minio.CompletePart, opts minio.ObjectOptions) (moi minio.ObjectInfo, e error) {
	mParts := make([]models.MultipartObjectPart, len(uploadedParts))
	for i, part := range uploadedParts {
		mParts[i] = models.MultipartObjectPart{
			PartNumber: part.PartNumber,
			ETag:       part.ETag,
		}
	}
	oi, err := l.Router.MultipartComplete(ctx, &tree.Node{Path: object}, uploadID, mParts)
	if err != nil {
		return moi, err
	}

	userDefined := minio.FromMinioClientMetadata(oi.Metadata)
	userDefined["Content-Type"] = oi.ContentType
	canonicalETag := strings.TrimPrefix(oi.ETag, "\"")
	canonicalETag = strings.TrimSuffix(canonicalETag, "\"")
	moi = minio.ObjectInfo{
		Bucket:          bucket,
		Name:            oi.Key,
		ModTime:         oi.LastModified,
		Size:            oi.Size,
		ETag:            canonicalETag,
		UserDefined:     userDefined,
		ContentType:     oi.ContentType,
		ContentEncoding: oi.Metadata.Get("Content-Encoding"),
		StorageClass:    oi.StorageClass,
	}
	return moi, err

}

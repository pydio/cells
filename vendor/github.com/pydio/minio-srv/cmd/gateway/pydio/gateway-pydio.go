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
	"errors"
	"io"
	"net/http"
	"strings"
	"time"

	microerrors "github.com/micro/go-micro/errors"
	miniogo "github.com/pydio/minio-go"
	minio "github.com/pydio/minio-srv/cmd"
	"github.com/pydio/minio-srv/pkg/auth"
	"github.com/pydio/minio-srv/pkg/hash"

	"github.com/minio/cli"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/common/views/models"
)

const (
	pydioBackend = "pydio"
)

func init() {
	minio.RegisterGatewayCommand(cli.Command{
		Name:               pydioBackend,
		Usage:              "Pydio Gateway",
		Action:             pydioGatewayMain,
		CustomHelpTemplate: "",
		HideHelpCommand:    true,
	})

}

// BucketNotFound bucket does not exist.
type ContextNotFound minio.GenericError

func (e ContextNotFound) Error() string {
	return "Context not found. Use WithContext function."
}

type Pydio struct{}

// s3Objects implements gateway for Minio and S3 compatible object storage servers.
type pydioObjects struct {
	minio.GatewayUnsupported
	Router *views.Router
}

// Name returns the unique name of the gateway.
func (p *Pydio) Name() string {
	return pydioBackend
}

// NewGatewayLayer returns a new  ObjectLayer.
func (p *Pydio) NewGatewayLayer(creds auth.Credentials) (minio.ObjectLayer, error) {
	o := &pydioObjects{}
	o.Router = views.NewStandardRouter(views.RouterOptions{WatchRegistry: true, LogReadEvents: true, AuditEvent: true})
	return o, nil
}

// Production - s3 gateway is production ready.
func (p *Pydio) Production() bool {
	return true
}

// Handler for 'minio gateway azure' command line.
func pydioGatewayMain(ctx *cli.Context) {
	minio.StartGateway(ctx, &Pydio{})
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
	vId := node.GetStringMeta("versionId")

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
	mErr := microerrors.Parse(err.Error())
	switch mErr.Code {
	case 403:
		err = minio.PrefixAccessDenied{
			Bucket: bucket,
			Object: key,
		}
	case 404:
		err = minio.ObjectNotFound{
			Bucket: bucket,
			Object: key,
		}
	case 422:
		err = minio.QuotaExceeded{
			Bucket: bucket,
			Object: key,
		}
	default:
		if strings.Contains(err.Error(), "Forbidden") {
			err = minio.PrefixAccessDenied{
				Bucket: bucket,
				Object: key,
			}
		}
	}
	return minio.ErrorRespToObjectError(err, bucket, key)
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
		if microerrors.Parse(err.Error()).Code == 404 {
			return nil, nil, nil // Ignore and return empty list
		}
		return nil, nil, pydioToMinioError(err, bucket, prefix)
	}
	defer lNodeClient.Close()
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
func (l *pydioObjects) Shutdown(ctx context.Context) error {
	// TODO
	return nil
}

// StorageInfo is not relevant to S3 backend.
func (l *pydioObjects) StorageInfo(ctx context.Context) (si minio.StorageInfo) {
	return si
}

// GetBucketInfo gets bucket metadata..
func (l *pydioObjects) GetBucketInfo(ctx context.Context, bucket string) (bi minio.BucketInfo, e error) {

	if bucket != "io" && bucket != "data" {
		return bi, minio.BucketNotFound{Bucket: bucket}
	}
	return minio.BucketInfo{
		Name:    bucket,
		Created: time.Now(),
	}, nil

}

// ListBuckets lists all S3 buckets
func (l *pydioObjects) ListBuckets(ctx context.Context) ([]minio.BucketInfo, error) {

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
		node.SetMeta("versionId", opts.VersionID)
	}
	readNodeResponse, err := l.Router.ReadNode(ctx, &tree.ReadNodeRequest{Node: node})
	if err != nil {
		return minio.ObjectInfo{}, pydioToMinioError(err, bucket, object)
	}

	if !readNodeResponse.Node.IsLeaf() {
		e := errors.New("S3 API Cannot send object info for folder")
		return minio.ObjectInfo{}, e
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
	return minio.NewGetObjectReaderFromReader(pr, objInfo, pipeCloser), nil
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
func (l *pydioObjects) PutObject(ctx context.Context, bucket string, object string, data *hash.Reader, requestMetadata map[string]string, o minio.ObjectOptions) (objInfo minio.ObjectInfo, e error) {

	md5sum := requestMetadata["etag"]
	if md5sum != "" {
		delete(requestMetadata, "etag")
	}

	written, err := l.Router.PutObject(ctx, &tree.Node{
		Path: strings.TrimLeft(object, "/"),
	}, data, &models.PutRequestData{
		Size:      data.Size(),
		Sha256Sum: data.SHA256(),
		Md5Sum:    data.MD5(),
		Metadata: requestMetadata,
	})
	if err != nil {
		log.Logger(ctx).Error("Error while putting object:" + err.Error())
		return objInfo, pydioToMinioError(err, bucket, object)
	}
	// TODO : PutObject should return more info about written node
	objInfo = minio.ObjectInfo{
		Bucket: bucket,
		Name:   object,
		Size:   written,
	}
	return objInfo, nil

}

// CopyObject copies a blob from source container to destination container.
func (l *pydioObjects) CopyObject(ctx context.Context, srcBucket string, srcObject string, destBucket string, destObject string,
	srcInfo minio.ObjectInfo, srcOpts, dstOpts minio.ObjectOptions) (objInfo minio.ObjectInfo, e error) {

	if srcObject == destObject {
		// log.Printf("Coping %v to %v, this is a REPLACE meta directive \n", srcObject, destObject)
		// log.Println(requestMetadata)
		return objInfo, (&minio.NotImplemented{})
	}
	if srcOpts.VersionID != "" {
		srcObject = strings.Replace(srcObject, "?versionId="+srcOpts.VersionID, "", 1)
	}
	written, err := l.Router.CopyObject(ctx, &tree.Node{
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
		Bucket: destBucket,
		Name:   destObject,
		Size:   written,
	}, nil

}

// DeleteObject deletes a blob in bucket
func (l *pydioObjects) DeleteObject(ctx context.Context, bucket string, object string) error {

	// log.Println("[DeleteObject]", object)
	_, err := l.Router.DeleteNode(ctx, &tree.DeleteNodeRequest{
		Node: &tree.Node{
			Path: strings.TrimLeft(object, "/"),
		},
	})
	if err != nil {
		return pydioToMinioError(err, bucket, object)
	}
	return nil

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
		return minio.FromMinioClientListMultipartsInfo(result), nil
	} else {
		return lmi, err
	}

}

// NewMultipartUpload upload object in multiple parts
func (l *pydioObjects) NewMultipartUpload(ctx context.Context, bucket string, object string, reqMetadata map[string]string, o minio.ObjectOptions) (uploadID string, err error) {

	uploadID, err = l.Router.MultipartCreate(ctx, &tree.Node{
		Path: object,
	}, &models.MultipartRequestData{
		Metadata: minio.ToMinioClientMetadata(reqMetadata),
	})
	if err != nil {
		err = pydioToMinioError(err, bucket, object)
	}
	return

}

// PutObjectPart puts a part of object in bucket
func (l *pydioObjects) PutObjectPart(ctx context.Context, bucket string, object string, uploadID string, partID int, data *hash.Reader, o minio.ObjectOptions) (pi minio.PartInfo, e error) {

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
		return pi, err
	}

	return minio.PartInfo{
		Size:         objectPart.Size,
		ETag:         objectPart.ETag,
		LastModified: objectPart.LastModified,
		PartNumber:   partID,
	}, nil

}

// ListObjectParts returns all object parts for specified object in specified bucket
func (l *pydioObjects) ListObjectParts(ctx context.Context, bucket string, object string, uploadID string, partNumberMarker int, maxParts int) (lpi minio.ListPartsInfo, e error) {

	result, err := l.Router.MultipartListObjectParts(ctx, &tree.Node{Path: object}, uploadID, partNumberMarker, maxParts)
	if err != nil {
		return lpi, err
	}
	return minio.FromMinioClientListPartsInfo(result), nil

}

// AbortMultipartUpload aborts a ongoing multipart upload
func (l *pydioObjects) AbortMultipartUpload(ctx context.Context, bucket string, object string, uploadID string) error {

	return l.Router.MultipartAbort(ctx, &tree.Node{Path: object}, uploadID, &models.MultipartRequestData{})

}

// CompleteMultipartUpload completes ongoing multipart upload and finalizes object
func (l *pydioObjects) CompleteMultipartUpload(ctx context.Context, bucket string, object string, uploadID string, uploadedParts []minio.CompletePart) (oi minio.ObjectInfo, e error) {

	out, err := l.Router.MultipartComplete(ctx, &tree.Node{Path: object}, uploadID, minio.ToMinioClientCompleteParts(uploadedParts))
	return minio.FromMinioClientObjectInfo(bucket, out), err

}

//////// NOT IMPLEMENTED ////////

func (l *pydioObjects) DeleteBucket(ctx context.Context, bucket string) error {
	return minio.NotImplemented{}
}

func (l *pydioObjects) MakeBucketWithLocation(ctx context.Context, bucket string, location string) error {
	return minio.NotImplemented{}
}

//////// UTILS ////////

// GetObjectInfo reads object info and replies back ObjectInfo
func (l *pydioObjects) getS3ObjectInfo(client *miniogo.Core, bucket string, object string) (objInfo minio.ObjectInfo, err error) {
	oi, err := client.StatObject(bucket, object, miniogo.StatObjectOptions{})
	if err != nil {
		return minio.ObjectInfo{}, minio.ErrorRespToObjectError(err, bucket, object)
	}

	return minio.FromMinioClientObjectInfo(bucket, oi), nil
}

/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package views

import (
	"context"
	"io"
	"io/ioutil"
	"strings"
	"time"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/pborman/uuid"
	"github.com/pydio/minio-go"
	"go.uber.org/zap"

	"encoding/hex"
	"fmt"

	"github.com/micro/go-micro/metadata"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	context2 "github.com/pydio/cells/common/utils/context"
)

type Executor struct {
	AbstractHandler
}

func (a *Executor) ExecuteWrapped(inputFilter NodeFilter, outputFilter NodeFilter, provider NodesCallback) error {

	return provider(inputFilter, outputFilter)

}

func (e *Executor) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...client.CallOption) (*tree.ReadNodeResponse, error) {

	resp, err := e.clientsPool.GetTreeClient().ReadNode(ctx, in, opts...)
	if err != nil {
		if errors.Parse(err.Error()).Code != 404 {
			log.Logger(ctx).Error("Failed to read node", zap.Any("in", in), zap.Error(err))
		}
	}

	return resp, err
}

func (e *Executor) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...client.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	log.Logger(ctx).Debug("ROUTER LISTING WITH TREE CLIENT", zap.String("path", in.Node.Path))
	return e.clientsPool.GetTreeClient().ListNodes(ctx, in, opts...)
}

func (e *Executor) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...client.CallOption) (*tree.CreateNodeResponse, error) {
	node := in.Node
	if !node.IsLeaf() {
		dsPath := node.GetStringMeta(common.META_NAMESPACE_DATASOURCE_PATH)
		newNode := &tree.Node{
			Path: strings.TrimRight(node.Path, "/") + "/" + common.PYDIO_SYNC_HIDDEN_FILE_META,
		}
		newNode.SetMeta(common.META_NAMESPACE_DATASOURCE_PATH, dsPath+"/"+common.PYDIO_SYNC_HIDDEN_FILE_META)
		meta := make(map[string]string)
		if session := in.IndexationSession; session != "" {
			meta["X-Pydio-Session"] = session
		}
		if !in.UpdateIfExists {
			if read, er := e.GetObject(ctx, newNode, &GetRequestData{StartOffset: 0, Length: 36}); er == nil {
				bytes, _ := ioutil.ReadAll(read)
				read.Close()
				node.Uuid = string(bytes)
				node.MTime = time.Now().Unix()
				node.Size = 36
				log.Logger(ctx).Debug("[handlerExec.CreateNode] Hidden file already created", node.ZapUuid(), zap.Any("in", in))
				return &tree.CreateNodeResponse{Node: node}, nil
			}
		}
		// Create new Node
		nodeUuid := uuid.New()
		_, err := e.PutObject(ctx, newNode, strings.NewReader(nodeUuid), &PutRequestData{Metadata: meta, Size: int64(len(nodeUuid))})
		if err != nil {
			return nil, err
		}
		node.Uuid = nodeUuid
		node.MTime = time.Now().Unix()
		node.Size = 36
		log.Logger(ctx).Debug("[handlerExec.CreateNode] Created A Hidden .pydio for folder", node.Zap())
		return &tree.CreateNodeResponse{Node: node}, nil
	}
	log.Logger(ctx).Debug("Exec.CreateNode", zap.String("p", in.Node.Path))
	return e.clientsPool.GetTreeClientWrite().CreateNode(ctx, in, opts...)
}

func (e *Executor) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...client.CallOption) (*tree.UpdateNodeResponse, error) {
	return e.clientsPool.GetTreeClientWrite().UpdateNode(ctx, in, opts...)
}

func (e *Executor) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...client.CallOption) (*tree.DeleteNodeResponse, error) {
	info, ok := GetBranchInfo(ctx, "in")
	if !ok {
		return nil, errors.BadRequest(VIEWS_LIBRARY_NAME, "Cannot find S3 client, did you insert a resolver middleware?")
	}
	writer := info.Client
	if session := in.IndexationSession; session != "" {
		m := map[string]string{}
		if meta, ok := context2.MinioMetaFromContext(ctx); ok {
			m = meta
		}
		m["X-Pydio-Session"] = session
		ctx = metadata.NewContext(ctx, m)
	}
	log.Logger(ctx).Debug("Exec.DeleteNode", in.Node.Zap(), zap.Any("ctx", ctx))

	s3Path := e.buildS3Path(info, in.Node)
	err := writer.RemoveObjectWithContext(ctx, info.ObjectsBucket, s3Path)
	success := true
	if err != nil {
		log.Logger(ctx).Error("Error while deleting node", zap.Error(err))
		success = false
	}
	return &tree.DeleteNodeResponse{Success: success}, err
}

func (e *Executor) GetObject(ctx context.Context, node *tree.Node, requestData *GetRequestData) (io.ReadCloser, error) {
	info, ok := GetBranchInfo(ctx, "in")
	if !ok {
		return nil, errors.BadRequest(VIEWS_LIBRARY_NAME, "Cannot find S3 client, did you insert a resolver middleware?")
	}
	writer := info.Client

	var reader io.ReadCloser
	var err error

	s3Path := e.buildS3Path(info, node)
	headers := minio.GetObjectOptions{}

	// Make sure the object exists
	var opts = minio.StatObjectOptions{}
	if meta, ok := context2.MinioMetaFromContext(ctx); ok {
		for k, v := range meta {
			opts.Set(k, v)
		}
	}
	if _, sErr := writer.StatObject(info.ObjectsBucket, s3Path, opts); sErr != nil {
		return nil, sErr
	}

	if requestData.EncryptionMaterial != nil {

		var offset = requestData.StartOffset
		var end = offset + requestData.Length - 1

		if requestData.StartOffset >= 0 && requestData.Length >= 0 {
			log.Logger(ctx).Debug("GET RANGE", zap.Int64("From", requestData.StartOffset), zap.Int64("Length", requestData.Length), node.Zap())
			if end >= node.Size-1 {
				end = 0
			}
		}

		//headers.Materials = requestData.EncryptionMaterial
		if offset == 0 && end == 0 {
			log.Logger(ctx).Debug("GET DATA WITH NO RANGE ")
			//FIXME
			//reader, err = writer.GetObject(info.ObjectsBucket, s3Path, requestData.EncryptionMaterial)
		} else {
			log.Logger(ctx).Info("Warning, passing a request Length on encrypted data is not supported yet", zap.Int64("offset", requestData.StartOffset), zap.Int64("end", end))
			if err := headers.SetRange(requestData.StartOffset, end); err != nil {
				return nil, err
			}
			reader, err = writer.GetObjectWithContext(ctx, info.ObjectsBucket, s3Path, headers)
		}
	} else {
		headers := minio.GetObjectOptions{}
		if requestData.StartOffset >= 0 && requestData.Length >= 0 {
			if err := headers.SetRange(requestData.StartOffset, requestData.StartOffset+requestData.Length-1); err != nil {
				return nil, err
			}
		}
		reader, err = writer.GetObjectWithContext(ctx, info.ObjectsBucket, s3Path, headers)
		log.Logger(ctx).Debug("Get Object", zap.String("bucket", info.ObjectsBucket), zap.String("s3path", s3Path), zap.Any("headers", headers.Header()), zap.Any("request", requestData), zap.Any("resultObject", reader))
		if err != nil {
			log.Logger(ctx).Error("Get Object", zap.Error(err))
		}
	}
	return reader, err
}

func (e *Executor) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *PutRequestData) (int64, error) {
	info, ok := GetBranchInfo(ctx, "in")
	if !ok {
		return 0, errors.BadRequest(VIEWS_LIBRARY_NAME, "Cannot find S3 client, did you insert a resolver middleware?")
	}
	writer := info.Client

	s3Path := e.buildS3Path(info, node)
	opts := minio.PutObjectOptions{
		UserMetadata: requestData.Metadata,
	}

	if requestData.EncryptionMaterial != nil {
		//FIXME
		//return writer.PutObjectWithContext(context.Background(), info.ObjectsBucket, s3Path, reader, -1, minio.PutObjectOptions{EncryptMaterials: requestData.EncryptionMaterial, UserMetadata: requestData.Metadata})
		return 0, errors.New("put.encrypt.notImplemented", "Not implemented", 500)

	} else {
		log.Logger(ctx).Debug("handler exec: put object", zap.Any("info", info), zap.String("s3Path", s3Path), zap.Any("requestData", requestData))
		if requestData.Size <= 0 {
			written, err := writer.PutObjectWithContext(ctx, info.ObjectsBucket, s3Path, reader, -1, minio.PutObjectOptions{UserMetadata: requestData.Metadata})
			if err != nil {
				return 0, err
			} else {
				return written, nil
			}
		} else {
			oi, err := writer.PutObjectWithContext(ctx, info.ObjectsBucket, s3Path, reader, requestData.Size, opts)
			if err != nil {
				return 0, err
			} else {
				return oi, nil
			}
		}
	}
}

func (e *Executor) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *CopyRequestData) (int64, error) {

	// If DS's are same datasource, simple S3 Copy operation. Otherwise it must copy from one to another.
	destInfo, ok := GetBranchInfo(ctx, "to")
	srcInfo, ok2 := GetBranchInfo(ctx, "from")
	if !ok || !ok2 {
		return 0, errors.InternalServerError(VIEWS_LIBRARY_NAME, "Cannot find Client for src or dest")
	}
	destClient := destInfo.Client
	srcClient := srcInfo.Client
	destBucket := destInfo.ObjectsBucket
	srcBucket := srcInfo.ObjectsBucket

	// var srcSse, destSse minio.SSEInfo
	// if requestData.srcEncryptionMaterial != nil {
	// 	srcSse = minio.NewSSEInfo([]byte(requestData.srcEncryptionMaterial.GetDecrypted()), "")
	// }
	// if requestData.destEncryptionMaterial != nil {
	// 	destSse = minio.NewSSEInfo([]byte(requestData.destEncryptionMaterial.GetDecrypted()), "")
	// }

	fromPath := e.buildS3Path(srcInfo, from)
	toPath := e.buildS3Path(destInfo, to)

	var opts = minio.StatObjectOptions{}
	if meta, ok := context2.MinioMetaFromContext(ctx); ok {
		for k, v := range meta {
			opts.Set(k, v)
		}
	}

	if destClient == srcClient && requestData.SrcVersionId == "" {

		if meta, ok := context2.MinioMetaFromContext(ctx); ok {
			if requestData.Metadata == nil {
				requestData.Metadata = make(map[string]string)
			}
			for k, v := range meta {
				requestData.Metadata[k] = v
			}
		}

		_, err := destClient.CopyObject(srcBucket, fromPath, destBucket, toPath, requestData.Metadata)
		if err != nil {
			return 0, err
		}
		stat, _ := destClient.StatObject(destBucket, toPath, opts)
		log.Logger(ctx).Debug("CopyObject / Same Clients", zap.Int64("written", stat.Size))
		return stat.Size, nil

	} else {

		var reader io.ReadCloser
		var err error
		srcStat, srcErr := srcClient.StatObject(srcBucket, fromPath, opts)
		if srcErr != nil {
			return 0, srcErr
		}
		if requestData.srcEncryptionMaterial != nil {
			//FIXME
			//reader, err = srcClient.GetEncryptedObject(srcBucket, fromPath, requestData.srcEncryptionMaterial)
		} else {
			reader, err = srcClient.GetObjectWithContext(ctx, srcBucket, fromPath, minio.GetObjectOptions{})
		}
		if err != nil {
			log.Logger(ctx).Error("CopyObject / Different Clients - Read Source Error", zap.Error(err))
			return 0, err
		}

		if requestData.destEncryptionMaterial != nil {
			//FIXME
			//return destClient.PutEncryptedObject(destBucket, toPath, reader, requestData.destEncryptionMaterial)
			return 0, fmt.Errorf("NOT IMPLEMENTED")
		} else {
			oi, err := destClient.PutObjectWithContext(ctx, destBucket, toPath, reader, srcStat.Size, minio.PutObjectOptions{UserMetadata: requestData.Metadata})
			if err != nil {
				log.Logger(ctx).Error("CopyObject / Different Clients",
					zap.Error(err),
					zap.Any("srcStat", srcStat),
					zap.Any("srcInfo", srcInfo),
					zap.Any("destInfo", destInfo),
					zap.Any("to", toPath))
			} else {
				log.Logger(ctx).Debug("CopyObject / Different Clients", zap.Int64("written", oi))
			}
			return oi, err
		}

	}

}

func (e *Executor) MultipartCreate(ctx context.Context, target *tree.Node, requestData *MultipartRequestData) (string, error) {
	info, ok := GetBranchInfo(ctx, "in")
	if !ok {
		return "", errors.InternalServerError(VIEWS_LIBRARY_NAME, "Cannot find client")
	}
	s3Path := e.buildS3Path(info, target)

	putOptions := minio.PutObjectOptions{}
	putOptions.UserMetadata = requestData.Metadata
	id, err := info.Client.NewMultipartUploadWithContext(ctx, info.ObjectsBucket, s3Path, putOptions)
	return id, err
}

func (e *Executor) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *PutRequestData) (minio.ObjectPart, error) {
	info, ok := GetBranchInfo(ctx, "in")
	if !ok {
		return minio.ObjectPart{PartNumber: partNumberMarker}, errors.BadRequest(VIEWS_LIBRARY_NAME, "Cannot find S3 client, did you insert a resolver middleware?")
	}
	writer := info.Client
	s3Path := e.buildS3Path(info, target)

	if requestData.EncryptionMaterial != nil {
		return minio.ObjectPart{PartNumber: partNumberMarker},
			errors.BadRequest(VIEWS_LIBRARY_NAME, "Multipart encrypted upload is not implemented")
	} else {
		log.Logger(ctx).Debug("HANDLER-EXEC: before put", zap.Any("requestData", requestData))

		if requestData.Size <= 0 {
			// This should never happen, double check
			return minio.ObjectPart{PartNumber: partNumberMarker},
				errors.BadRequest(VIEWS_LIBRARY_NAME, "trying to upload a part object that has no data. Double check")
		} else {
			// FIXME FOR ENCRYPTION
			//cp, err := writer.PutObjectPartWithMetadata(info.ObjectsBucket, s3Path, uploadID, partNumberMarker, reader, requestData.Size, requestData.Md5Sum, requestData.Sha256Sum, requestData.Metadata)
			cp, err := writer.PutObjectPartWithContext(ctx, info.ObjectsBucket, s3Path, uploadID, partNumberMarker, reader, requestData.Size, hex.EncodeToString(requestData.Md5Sum), hex.EncodeToString(requestData.Sha256Sum), nil)
			if err != nil {
				log.Logger(ctx).Error("PutObjectPart has failed", zap.Error(err))
				return minio.ObjectPart{PartNumber: partNumberMarker}, err
			} else {
				return cp, nil
			}
		}
	}
}

func (e *Executor) MultipartList(ctx context.Context, prefix string, requestData *MultipartRequestData) (res minio.ListMultipartUploadsResult, err error) {
	info, ok := GetBranchInfo(ctx, "in")
	if !ok {
		return res, errors.InternalServerError(VIEWS_LIBRARY_NAME, "Cannot find client")
	}
	return info.Client.ListMultipartUploadsWithContext(ctx, info.ObjectsBucket, prefix, requestData.ListKeyMarker, requestData.ListUploadIDMarker, requestData.ListDelimiter, requestData.ListMaxUploads)
}

func (e *Executor) MultipartAbort(ctx context.Context, target *tree.Node, uploadID string, requestData *MultipartRequestData) error {
	info, ok := GetBranchInfo(ctx, "in")
	if !ok {
		return errors.InternalServerError(VIEWS_LIBRARY_NAME, "Cannot find client")
	}
	s3Path := e.buildS3Path(info, target)
	return info.Client.AbortMultipartUploadWithContext(ctx, info.ObjectsBucket, s3Path, uploadID)
}

func (e *Executor) MultipartComplete(ctx context.Context, target *tree.Node, uploadID string, uploadedParts []minio.CompletePart) (minio.ObjectInfo, error) {
	info, ok := GetBranchInfo(ctx, "in")
	if !ok {
		return minio.ObjectInfo{}, errors.InternalServerError(VIEWS_LIBRARY_NAME, "Cannot find client")
	}
	s3Path := e.buildS3Path(info, target)

	log.Logger(ctx).Debug("HANDLER-EXEC - before calling minio.CompleteMultipartUpload", zap.Any("Parts", uploadedParts))
	_, err := info.Client.CompleteMultipartUploadWithContext(ctx, info.ObjectsBucket, s3Path, uploadID, uploadedParts)
	if err != nil {
		log.Logger(ctx).Error("fail to complete upload", zap.Error(err))
		return minio.ObjectInfo{}, err
	}
	var opts = minio.StatObjectOptions{}
	if meta, ok := context2.MinioMetaFromContext(ctx); ok {
		for k, v := range meta {
			opts.Set(k, v)
		}
	}
	return info.Client.StatObject(info.ObjectsBucket, target.GetStringMeta(common.META_NAMESPACE_DATASOURCE_PATH), opts)
}

func (e *Executor) MultipartListObjectParts(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, maxParts int) (lpi minio.ListObjectPartsResult, err error) {
	info, ok := GetBranchInfo(ctx, "in")
	if !ok {
		return lpi, errors.InternalServerError(VIEWS_LIBRARY_NAME, "Cannot find client")
	}
	s3Path := e.buildS3Path(info, target)
	return info.Client.ListObjectPartsWithContext(ctx, info.ObjectsBucket, s3Path, uploadID, partNumberMarker, maxParts)
}

func (e *Executor) buildS3Path(branchInfo BranchInfo, node *tree.Node) string {

	path := node.GetStringMeta(common.META_NAMESPACE_DATASOURCE_PATH)
	if branchInfo.ObjectsBaseFolder != "" {
		path = strings.TrimLeft(branchInfo.ObjectsBaseFolder, "/") + path
	}
	return path

}

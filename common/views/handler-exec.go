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

package views

import (
	"context"
	"encoding/hex"
	"io"
	"io/ioutil"
	"path"
	"strings"
	"time"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/micro/go-micro/metadata"
	"github.com/pborman/uuid"
	"github.com/pydio/minio-go"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/sync/endpoints/s3"
	context2 "github.com/pydio/cells/common/utils/context"
	"github.com/pydio/cells/common/views/models"
)

var (
	noSuchKeyString = "The specified key does not exist."
)

// Executor is the final handler: it does not have a "next" handler, but actually performs all requests.
type Executor struct {
	AbstractHandler
}

func (e *Executor) ExecuteWrapped(inputFilter NodeFilter, outputFilter NodeFilter, provider NodesCallback) error {

	return provider(inputFilter, outputFilter)

}

func (e *Executor) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...client.CallOption) (*tree.ReadNodeResponse, error) {

	if in.ObjectStats {
		info, ok := GetBranchInfo(ctx, "in")
		if !ok {
			return nil, errors.BadRequest(VIEWS_LIBRARY_NAME, "Cannot find S3 client, did you insert a resolver middleware?")
		}
		writer := info.Client
		statOpts := minio.StatObjectOptions{}
		m := map[string]string{}
		if meta, ok := context2.MinioMetaFromContext(ctx); ok {
			for k, v := range meta {
				m[k] = v
				statOpts.Set(k, v)
			}
		}
		s3Path := e.buildS3Path(info, in.Node)
		if oi, e := writer.StatObject(info.ObjectsBucket, s3Path, statOpts); e != nil {
			if e.Error() == noSuchKeyString {
				e = errors.NotFound("not.found", "object not found in datasource: %s", s3Path)
			}
			log.Logger(ctx).Info("ReadNodeRequest/ObjectsStats Failed", zap.Any("r", in), zap.Error(e))
			return nil, e
		} else {
			// Build fake node from Stats
			out := in.Node.Clone()
			out.Etag = oi.ETag
			out.Size = oi.Size
			out.MTime = oi.LastModified.Unix()
			resp := &tree.ReadNodeResponse{Node: out}
			return resp, nil
		}
	} else {

		resp, err := e.clientsPool.GetTreeClient().ReadNode(ctx, in, opts...)
		if err != nil {
			if strings.Contains(err.Error(), "context canceled") {
				log.Logger(ctx).Debug("Failed to read node (context canceled)", zap.Error(err))
			} else if errors.Parse(err.Error()).Code != 404 {
				log.Logger(ctx).Error("Failed to read node", zap.Any("in", in), zap.Error(err))
			}
		}

		return resp, err
	}

}

func (e *Executor) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...client.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	log.Logger(ctx).Debug("ROUTER LISTING WITH TREE CLIENT", zap.String("path", in.Node.Path))
	return e.clientsPool.GetTreeClient().ListNodes(ctx, in, opts...)
}

func (e *Executor) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...client.CallOption) (*tree.CreateNodeResponse, error) {
	node := in.Node
	if !node.IsLeaf() {
		dsPath := node.GetStringMeta(common.MetaNamespaceDatasourcePath)
		newNode := &tree.Node{
			Path: strings.TrimRight(node.Path, "/") + "/" + common.PydioSyncHiddenFile,
		}
		newNode.SetMeta(common.MetaNamespaceDatasourcePath, dsPath+"/"+common.PydioSyncHiddenFile)
		meta := make(map[string]string)
		if session := in.IndexationSession; session != "" {
			meta[common.XPydioSessionUuid] = session
		}
		if !in.UpdateIfExists {
			if read, er := e.GetObject(ctx, newNode, &models.GetRequestData{StartOffset: 0, Length: 36}); er == nil {
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
		log.Logger(ctx).Debug("[Exec] Create Folder has no Uuid")
		if node.Uuid != "" {
			log.Logger(ctx).Debug("Creating Folder with Uuid", node.ZapUuid())
			nodeUuid = node.Uuid
		}
		_, err := e.PutObject(ctx, newNode, strings.NewReader(nodeUuid), &models.PutRequestData{Metadata: meta, Size: int64(len(nodeUuid))})
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
	statOpts := minio.StatObjectOptions{}
	m := map[string]string{}
	if meta, ok := context2.MinioMetaFromContext(ctx); ok {
		for k, v := range meta {
			m[k] = v
			statOpts.Set(k, v)
		}
	}
	if session := in.IndexationSession; session != "" {
		m[common.XPydioSessionUuid] = session
	}
	ctx = metadata.NewContext(ctx, m)
	log.Logger(ctx).Debug("Exec.DeleteNode", in.Node.Zap())

	s3Path := e.buildS3Path(info, in.Node)
	success := true
	var err error
	if _, sE := writer.StatObject(info.ObjectsBucket, s3Path, statOpts); sE != nil && sE.Error() == noSuchKeyString && in.Node.IsLeaf() {
		log.Logger(ctx).Info("Exec.DeleteNode : cannot find object in s3! Should it be removed from index?", in.Node.ZapPath())
		return nil, errors.NotFound("node.not.found", sE.Error())
	}
	err = writer.RemoveObjectWithContext(ctx, info.ObjectsBucket, s3Path)
	if err != nil {
		log.Logger(ctx).Error("Error while deleting in s3 "+s3Path, zap.Error(err))
		success = false
	}
	return &tree.DeleteNodeResponse{Success: success}, err
}

func (e *Executor) GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error) {
	// Init logger now
	logger := log.Logger(ctx)
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
	newCtx := ctx
	if meta, ok := context2.MinioMetaFromContext(ctx); ok {
		for k, v := range meta {
			opts.Set(k, v)
		}
		// Store a copy of the meta
		newCtx = context2.WithMetadata(ctx, meta)
	}
	sObject, sErr := writer.StatObject(info.ObjectsBucket, s3Path, opts)
	if sErr != nil {
		return nil, sErr
	}

	if requestData.StartOffset == 0 && requestData.Length == -1 {
		logger.Debug("[Handler exec] Target Object Size is", zap.Any("object", sObject))
		//		requestData.Length = sObject.Size
	}
	if requestData.StartOffset >= 0 && requestData.Length >= 0 {
		if err := headers.SetRange(requestData.StartOffset, requestData.StartOffset+requestData.Length-1); err != nil {
			return nil, err
		}
	}
	reader, err = writer.GetObjectWithContext(newCtx, info.ObjectsBucket, s3Path, headers)
	logger.Debug("[handler exec] Get Object", zap.String("bucket", info.ObjectsBucket), zap.String("s3path", s3Path), zap.Any("headers", headers.Header()), zap.Any("request", requestData), zap.Any("resultObject", reader))
	if err != nil {
		logger.Error("Get Object", zap.Error(err))
	}

	return reader, err
}

func (e *Executor) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (int64, error) {
	info, ok := GetBranchInfo(ctx, "in")
	if !ok {
		return 0, errors.BadRequest(VIEWS_LIBRARY_NAME, "Cannot find S3 client, did you insert a resolver middleware?")
	}
	writer := info.Client

	s3Path := e.buildS3Path(info, node)
	opts := e.putOptionsFromRequestMeta(requestData.Metadata)

	log.Logger(ctx).Debug("[handler exec]: put object", zap.String("s3Path", s3Path), zap.Any("requestData", requestData))
	if requestData.Size <= 0 {
		written, err := writer.PutObjectWithContext(ctx, info.ObjectsBucket, s3Path, reader, -1, opts)
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

func (e *Executor) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (int64, error) {

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

	fromPath := e.buildS3Path(srcInfo, from)
	toPath := e.buildS3Path(destInfo, to)

	var ctxAsOptions = minio.StatObjectOptions{}
	if meta, ok := context2.MinioMetaFromContext(ctx); ok {
		for k, v := range meta {
			ctxAsOptions.Set(k, v)
		}
	}

	if destClient == srcClient && requestData.SrcVersionId == "" {
		// Check object exists and check its size
		src, e := destClient.StatObject(srcBucket, fromPath, ctxAsOptions)
		if e != nil {
			log.Logger(ctx).Error("HandlerExec: Error on CopyObject while first stating source", zap.Error(e))
			if e.Error() == noSuchKeyString {
				e = errors.NotFound("object.not.found", "object was not found, this is not normal: %s", fromPath)
			}
			return 0, e
		}

		if requestData.Metadata == nil {
			requestData.Metadata = make(map[string]string)
		}
		// Copy Pydio specific metadata along
		if cs := src.Metadata.Get(common.XAmzMetaContentMd5); cs != "" {
			requestData.Metadata[common.XAmzMetaContentMd5] = cs
		}
		if cs := src.Metadata.Get(common.XAmzMetaClearSize); cs != "" {
			requestData.Metadata[common.XAmzMetaClearSize] = cs
		}
		directive, dirOk := requestData.Metadata[common.XAmzMetaDirective]
		if dirOk {
			delete(requestData.Metadata, common.XAmzMetaDirective)
		}
		var err error
		if destInfo.StorageType == object.StorageType_S3 && src.Size > s3.MaxCopyObjectSize {
			if dirOk {
				ctx = context2.WithAdditionalMetadata(ctx, map[string]string{common.XAmzMetaDirective: directive})
			}
			err = s3.CopyObjectMultipart(ctx, destClient, src, srcBucket, fromPath, destBucket, toPath, requestData.Metadata, requestData.Progress)
		} else {
			destinationInfo, _ := minio.NewDestinationInfo(destBucket, toPath, nil, requestData.Metadata)
			sourceInfo := minio.NewSourceInfo(srcBucket, fromPath, nil)
			// Add request Headers to SrcInfo (authentication, etc)
			for k, v := range ctxAsOptions.Header() {
				sourceInfo.Headers.Set(k, strings.Join(v, ""))
			}
			if dirOk {
				sourceInfo.Headers.Set(common.XAmzMetaDirective, directive)
			}
			err = destClient.CopyObjectWithProgress(destinationInfo, sourceInfo, requestData.Progress)
		}
		if err != nil {
			log.Logger(ctx).Error("HandlerExec: Error on CopyObject", zap.Error(err))
			return 0, err
		}

		stat, _ := destClient.StatObject(destBucket, toPath, ctxAsOptions)
		log.Logger(ctx).Debug("HandlerExec: CopyObject / Same Clients", zap.Int64("written", stat.Size))
		return stat.Size, nil

	} else {

		var reader io.ReadCloser
		var err error
		srcStat, srcErr := srcClient.StatObject(srcBucket, fromPath, ctxAsOptions)
		if srcErr != nil {
			return 0, srcErr
		}
		reader, err = srcClient.GetObjectWithContext(ctx, srcBucket, fromPath, minio.GetObjectOptions{})
		if err != nil {
			log.Logger(ctx).Error("HandlerExec: CopyObject / Different Clients - Read Source Error", zap.Error(err))
			return 0, err
		}
		defer reader.Close()
		if requestData.Metadata != nil {
			if dir, o := requestData.Metadata[common.XAmzMetaDirective]; o && dir == "COPY" {
				requestData.Metadata[common.XAmzMetaNodeUuid] = from.Uuid
			}
			// append metadata to the context as well, as it may switch to putObjectMultipart
			ctxMeta := make(map[string]string)
			if m, ok := context2.MinioMetaFromContext(ctx); ok {
				ctxMeta = m
			}
			for k, v := range requestData.Metadata {
				if strings.HasPrefix(k, "X-Amz-") {
					continue
				}
				ctxMeta[k] = v
			}
			ctx = context2.WithMetadata(ctx, ctxMeta)
		}
		log.Logger(ctx).Debug("HandlerExec: copy one DS to another", zap.Any("meta", srcStat), zap.Any("requestMeta", requestData.Metadata))
		opts := e.putOptionsFromRequestMeta(requestData.Metadata)
		opts.Progress = requestData.Progress
		oi, err := destClient.PutObjectWithContext(ctx, destBucket, toPath, reader, srcStat.Size, opts)
		if err != nil {
			log.Logger(ctx).Error("HandlerExec: CopyObject / Different Clients",
				zap.Error(err),
				zap.Any("srcStat", srcStat),
				zap.Any("srcInfo", srcInfo),
				zap.Any("destInfo", destInfo),
				zap.Any("to", toPath))
		} else {
			log.Logger(ctx).Debug("HandlerExec: CopyObject / Different Clients", zap.Int64("written", oi))
		}
		return oi, err

	}

}

func (e *Executor) MultipartCreate(ctx context.Context, target *tree.Node, requestData *models.MultipartRequestData) (string, error) {
	info, ok := GetBranchInfo(ctx, "in")
	if !ok {
		return "", errors.InternalServerError(VIEWS_LIBRARY_NAME, "Cannot find client")
	}
	s3Path := e.buildS3Path(info, target)

	putOptions := e.putOptionsFromRequestMeta(requestData.Metadata)
	id, err := info.Client.NewMultipartUploadWithContext(ctx, info.ObjectsBucket, s3Path, putOptions)
	return id, err
}

func (e *Executor) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *models.PutRequestData) (minio.ObjectPart, error) {
	info, ok := GetBranchInfo(ctx, "in")
	if !ok {
		return minio.ObjectPart{PartNumber: partNumberMarker}, errors.BadRequest(VIEWS_LIBRARY_NAME, "Cannot find S3 client, did you insert a resolver middleware?")
	}
	writer := info.Client
	s3Path := e.buildS3Path(info, target)

	log.Logger(ctx).Debug("HANDLER-EXEC: before put", zap.Any("requestData", requestData))

	if requestData.Size <= 0 {
		// This should never happen, double check
		return minio.ObjectPart{PartNumber: partNumberMarker},
			errors.BadRequest(VIEWS_LIBRARY_NAME, "trying to upload a part object that has no data. Double check")
	} else {
		if partNumberMarker == 1 && requestData.ContentTypeUnknown() {
			cl := target.Clone()
			cl.Type = tree.NodeType_LEAF // Force leaf!
			reader = WrapReaderForMime(ctx, cl, reader)
		}
		cp, err := writer.PutObjectPartWithContext(ctx, info.ObjectsBucket, s3Path, uploadID, partNumberMarker, reader, requestData.Size, hex.EncodeToString(requestData.Md5Sum), hex.EncodeToString(requestData.Sha256Sum), nil)
		if err != nil {
			log.Logger(ctx).Error("PutObjectPart has failed", zap.Error(err))
			return minio.ObjectPart{PartNumber: partNumberMarker}, err
		} else {
			return cp, nil
		}
	}
}

func (e *Executor) MultipartList(ctx context.Context, prefix string, requestData *models.MultipartRequestData) (res minio.ListMultipartUploadsResult, err error) {
	info, ok := GetBranchInfo(ctx, "in")
	if !ok {
		return res, errors.InternalServerError(VIEWS_LIBRARY_NAME, "Cannot find client")
	}
	return info.Client.ListMultipartUploadsWithContext(ctx, info.ObjectsBucket, prefix, requestData.ListKeyMarker, requestData.ListUploadIDMarker, requestData.ListDelimiter, requestData.ListMaxUploads)
}

func (e *Executor) MultipartAbort(ctx context.Context, target *tree.Node, uploadID string, requestData *models.MultipartRequestData) error {
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

	log.Logger(ctx).Debug("HANDLER-EXEC - before calling minio.CompleteMultipartUpload", zap.Int("Parts count", len(uploadedParts)))
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
	return info.Client.StatObject(info.ObjectsBucket, s3Path, opts)
}

func (e *Executor) MultipartListObjectParts(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, maxParts int) (lpi minio.ListObjectPartsResult, err error) {
	info, ok := GetBranchInfo(ctx, "in")
	if !ok {
		return lpi, errors.InternalServerError(VIEWS_LIBRARY_NAME, "Cannot find client")
	}
	s3Path := e.buildS3Path(info, target)
	return info.Client.ListObjectPartsWithContext(ctx, info.ObjectsBucket, s3Path, uploadID, partNumberMarker, maxParts)
}

func (e *Executor) StreamChanges(ctx context.Context, in *tree.StreamChangesRequest, opts ...client.CallOption) (tree.NodeChangesStreamer_StreamChangesClient, error) {

	cli := tree.NewNodeChangesStreamerClient(registry.GetClient(common.ServiceTree))
	return cli.StreamChanges(ctx, in, opts...)

}

func (e *Executor) WrappedCanApply(_ context.Context, _ context.Context, _ *tree.NodeChangeEvent) error {
	return nil
}

func (e *Executor) isXSpecialPydioHeader(hname string) bool {
	for _, hh := range common.XSpecialPydioHeaders {
		if hh == hname {
			return true
		}
	}
	return false
}

func (e *Executor) putOptionsFromRequestMeta(metadata map[string]string) minio.PutObjectOptions {
	opts := minio.PutObjectOptions{UserMetadata: make(map[string]string)}
	for k, v := range metadata {
		if k == "content-type" {
			opts.ContentType = v
		} else if k == "content-encoding" {
			opts.ContentEncoding = v
		} else if k == "X-Amz-Storage-Class" || k == "x-amz-storage-class" {
			opts.StorageClass = v
		} else if strings.HasPrefix(k, "X-Amz-Meta-") || e.isXSpecialPydioHeader(k) {
			opts.UserMetadata[k] = v
		}
	}
	return opts
}

func (e *Executor) buildS3Path(branchInfo BranchInfo, node *tree.Node) string {

	if branchInfo.FlatStorage && !branchInfo.Binary {
		nodeId := node.GetUuid()
		if branchInfo.ObjectsBaseFolder != "" {
			return path.Join(branchInfo.ObjectsBaseFolder, nodeId)
		} else {
			return nodeId
		}
	}

	p := node.GetStringMeta(common.MetaNamespaceDatasourcePath)
	if branchInfo.ObjectsBaseFolder != "" {
		p = path.Join(strings.TrimLeft(branchInfo.ObjectsBaseFolder, "/"), p)
	}
	return p

}

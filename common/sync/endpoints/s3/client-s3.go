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

// Package s3 provides an endpoint for connecting to Amazon S3 or an S3-compatible storage
package s3

import (
	"context"
	"crypto/md5"
	"crypto/sha1"
	"errors"
	"fmt"
	"io"
	"net/url"
	"os"
	"path"
	"strconv"
	"strings"
	"time"

	minio "github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/notification"
	"go.uber.org/zap"
	"golang.org/x/text/unicode/norm"

	servicescommon "github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"
	errors2 "github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/sync/model"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

const (
	UserAgentAppName = "pydio.sync.client.s3"
	UserAgentVersion = "1.0"
)

// Client wraps a Minio Client to speak with an S3-compatible backend
type Client struct {
	Oc                          nodes.StorageClient
	Bucket                      string
	RootPath                    string
	Host                        string
	ServerRequiresNormalization bool
	skipRecomputeEtagByCopy     bool
	options                     model.EndpointOptions
	globalContext               context.Context
	plainSizeComputer           func(nodeUUID string) (int64, error)

	checksumMapper       ChecksumMapper
	purgeMapperAfterWalk bool
}

func NewObjectClient(ctx context.Context, oc nodes.StorageClient, host, bucket, rootPath string, options model.EndpointOptions) *Client {
	return &Client{
		Oc:            oc,
		Bucket:        bucket,
		Host:          host,
		RootPath:      strings.TrimRight(rootPath, "/"),
		options:       options,
		globalContext: ctx,
	}
}

func (c *Client) GetEndpointInfo() model.EndpointInfo {

	return model.EndpointInfo{
		URI:                   "s3://" + c.Host + "/" + path.Join(c.Bucket, c.RootPath),
		RequiresFoldersRescan: false,
		RequiresNormalization: c.ServerRequiresNormalization,
	}

}

// SetPlainSizeComputer passes a computer function to extract plain size
// from an encrypted node
func (c *Client) SetPlainSizeComputer(computer func(nodeUUID string) (int64, error)) {
	c.plainSizeComputer = computer
}

// SetServerRequiresNormalization is used on MacOS to normalize UTF-8 chars to/from NFC/NFD
func (c *Client) SetServerRequiresNormalization() {
	c.ServerRequiresNormalization = true
}

// SkipRecomputeEtagByCopy sets a special behavior to avoir recomputing etags by in-place copying
// objects on storages that do not support this feature
func (c *Client) SkipRecomputeEtagByCopy() {
	c.skipRecomputeEtagByCopy = true
}

// SetChecksumMapper passes a ChecksumMapper storage that will prevent in-place copy of objects or
// metadata modification and store md5 for a given eTag locally instead.
func (c *Client) SetChecksumMapper(mapper ChecksumMapper, purgeAfterWalk bool) {
	c.checksumMapper = mapper
	c.purgeMapperAfterWalk = purgeAfterWalk
}

func (c *Client) normalize(path string) string {
	if c.ServerRequiresNormalization {
		return string(norm.NFC.Bytes([]byte(path)))
	}
	return path
}

func (c *Client) denormalize(path string) string {
	if c.ServerRequiresNormalization {
		return string(norm.NFD.Bytes([]byte(path)))
	}
	return path
}

func (c *Client) getLocalPath(eventPath string) string {
	return strings.TrimPrefix(c.normalize(eventPath), c.normalize(c.RootPath))
}

func (c *Client) getFullPath(path string) string {
	path = c.denormalize(path)
	if c.RootPath == "" {
		return strings.TrimLeft(path, "/")
	} else {
		return strings.TrimLeft(c.RootPath+"/"+strings.TrimLeft(path, "/"), "/")
	}
}

func (c *Client) Stat(ctx context.Context, pa string) (i os.FileInfo, err error) {
	fullPath := c.getFullPath(pa)
	if fullPath == "" || fullPath == "/" {
		buckets, err := c.Oc.ListBuckets(ctx)
		if err != nil {
			return nil, err
		}
		for _, b := range buckets {
			if b.Name == c.Bucket {
				return newFolderInfo(models.ObjectInfo{
					Key:          "/",
					LastModified: b.CreationDate,
				}), nil
			}
		}
		return nil, errors2.NotFound("bucket.not.found", "cannot find bucket %s", c.Bucket)
	}
	objectInfo, e := c.Oc.StatObject(ctx, c.Bucket, fullPath, models.ReadMeta{})
	if e != nil {
		// Try folder
		folderInfo, e2 := c.Oc.StatObject(ctx, c.Bucket, path.Join(fullPath, servicescommon.PydioSyncHiddenFile), models.ReadMeta{})
		if e2 != nil {
			return nil, e
		}
		return newFolderInfo(folderInfo), nil
	}
	return newFileInfo(objectInfo), nil
}

func (c *Client) CreateNode(ctx context.Context, node tree.N, updateIfExists bool) (err error) {
	if node.IsLeaf() {
		return errors.New("this is a DataSyncTarget, use PutNode for leafs instead of CreateNode")
	}
	hiddenPath := fmt.Sprintf("%v/%s", c.getFullPath(node.GetPath()), servicescommon.PydioSyncHiddenFile)
	_, err = c.Oc.PutObject(ctx, c.Bucket, hiddenPath, strings.NewReader(node.GetUuid()), int64(len(node.GetUuid())), models.PutMeta{ContentType: "text/plain"})
	return err
}

func (c *Client) DeleteNode(ctx context.Context, path string) (err error) {
	path = c.getFullPath(path)

	ctx2, cancel := context.WithCancel(ctx)
	defer cancel()
	for object := range c.listAllObjects(ctx2, c.Bucket, path, true) {
		if err = c.Oc.RemoveObject(ctx, c.Bucket, object.Key); err != nil {
			log.Logger(c.globalContext).Error("Error while deleting object", zap.String("key", object.Key), zap.Error(err))
			return err
		}
	}
	return err
}

func (c *Client) MoveNode(ctx context.Context, oldPath string, newPath string) (err error) {

	doneChan := make(chan struct{})
	defer close(doneChan)
	oldPath = c.getFullPath(oldPath)
	newPath = c.getFullPath(newPath)

	ctx2, cancel := context.WithCancel(ctx)
	defer cancel()
	for object := range c.listAllObjects(ctx2, c.Bucket, oldPath, true) {
		targetKey := newPath + strings.TrimPrefix(object.Key, oldPath)
		// Switch to multipart for copy
		if object.Size > c.Oc.CopyObjectMultipartThreshold() {
			if er := c.Oc.CopyObjectMultipart(context.Background(), object, c.Bucket, object.Key, c.Bucket, targetKey, nil, nil); er != nil {
				return er
			}
		} else {
			if _, e := c.Oc.CopyObject(ctx, c.Bucket, object.Key, c.Bucket, targetKey, map[string]string{}, map[string]string{}, nil); e != nil {
				return e
			}
		}
		if e := c.Oc.RemoveObject(ctx, c.Bucket, object.Key); e != nil {
			// do something
		}
	}
	return nil

}

func (c *Client) GetWriterOn(cancel context.Context, path string, targetSize int64) (out io.WriteCloser, writeDone chan bool, writeErr chan error, err error) {

	writeErr = make(chan error, 1)
	writeDone = make(chan bool, 1)
	path = c.getFullPath(path)
	reader, out := io.Pipe()
	go func() {
		defer func() {
			_ = reader.Close()
			close(writeDone)
			close(writeErr)
		}()
		if _, e := c.Oc.PutObject(cancel, c.Bucket, path, reader, targetSize, models.PutMeta{ContentType: "application/octet-stream"}); e != nil {
			writeErr <- e
		}
	}()
	return out, writeDone, writeErr, nil

}

func (c *Client) GetReaderOn(ctx context.Context, path string) (out io.ReadCloser, err error) {

	out, _, err = c.Oc.GetObject(ctx, c.Bucket, c.getFullPath(path), models.ReadMeta{})
	return

}

func (c *Client) ComputeChecksum(ctx context.Context, node tree.N) error {
	if c.skipRecomputeEtagByCopy {
		log.Logger(c.globalContext).Debug("skipping recompute ETag by copy, storage does not support it, keep original value", node.Zap())
		return nil
	}
	if c.options.BrowseOnly {
		log.Logger(c.globalContext).Debug("skipping recompute ETag by copy, storage is readonly, keep original value", node.Zap())
		return nil
	}
	if newInfo, err := c.s3forceComputeEtag(ctx, node); err == nil {
		node.SetEtag(strings.Trim(newInfo.ETag, "\""))
	} else {
		return err
	}
	return nil
}

func (c *Client) Walk(ctx context.Context, walkFunc model.WalkNodesFunc, root string, recursive bool) (err error) {

	t := time.Now()
	defer func() {
		log.Logger(c.globalContext).Info("S3 Walk Operation + Stats took", zap.Duration("d", time.Since(t)))
	}()
	var eTags []string
	collect := (root == "" || root == "/") && recursive && c.checksumMapper != nil && c.purgeMapperAfterWalk

	wrapper := func(path string, info *fileInfo, node tree.N) error {
		node.SetMTime(info.ModTime().Unix())
		node.SetSize(info.Size())
		node.SetMode(int32(info.Mode()))
		if !info.IsDir() {
			node.SetEtag(strings.Trim(info.Object.ETag, "\""))
		} else {
			node.SetUuid(strings.Trim(info.Object.ETag, "\""))
		}
		if collect && node.IsLeaf() {
			eTags = append(eTags, node.GetEtag())
		}
		return walkFunc(path, tree.LightNodeFromProto(node), nil)
	}

	batcher := &statBatcher{
		batchCtx: ctx,
		size:     50,
		walker:   wrapper,
		c:        c,
	}

	wrappingFunc := func(path string, info *fileInfo, err error) error {
		path = c.getLocalPath(path)
		return batcher.push(&input{path: path, info: info})
	}
	if err = c.actualLsRecursive(ctx, recursive, c.getFullPath(root), wrappingFunc); err != nil {
		return err
	}
	if err = batcher.flush(); err != nil {
		return err
	}
	if collect {
		go func() {
			// We know all eTags, purge other from mapper
			if deleted := c.checksumMapper.Purge(eTags); deleted > 0 {
				log.Logger(c.globalContext).Info(fmt.Sprintf("Purged %d eTag(s) from ChecksumMapper", deleted))
			}
		}()
	}
	return nil
}

func (c *Client) actualLsRecursive(ctx context.Context, recursive bool, recursivePath string, walknFc func(path string, info *fileInfo, err error) error) (err error) {

	createdDirs := make(map[string]bool)
	log.Logger(c.globalContext).Info("Listing all S3 objects for path", zap.String("bucket", c.Bucket), zap.String("path", recursivePath))
	for objectInfo := range c.listAllObjects(ctx, c.Bucket, recursivePath, recursive) {
		if objectInfo.Err != nil {
			log.Logger(c.globalContext).Error("Error while listing", zap.Error(objectInfo.Err))
			return objectInfo.Err
		}
		folderKey := path.Dir(objectInfo.Key)
		if strings.HasSuffix(objectInfo.Key, "/") {
			c.createFolderIdsWhileWalking(ctx, createdDirs, walknFc, folderKey, objectInfo.LastModified, false)
			continue
		}
		if strings.HasSuffix(objectInfo.Key, servicescommon.PydioSyncHiddenFile) {
			// Create Fake Folder
			// log.Print("Folder Key is " , folderKey)
			if folderKey == "" || folderKey == "." {
				continue
			}
			if _, exists := createdDirs[folderKey]; exists {
				if !c.isIgnoredFile(objectInfo.Key) {
					// Walk the .pydio before continuing, otherwise this creates an issue if another hidden file like ".aaa"
					// is appearing in the folder before arriving to the ".pydio" file
					s3FileInfo := newFileInfo(objectInfo)
					_ = walknFc(c.normalize(objectInfo.Key), s3FileInfo, nil)
				}
				continue
			}
			folderObjectInfo := objectInfo
			//This will be called again inside the walknFc
			c.createFolderIdsWhileWalking(ctx, createdDirs, walknFc, folderKey, objectInfo.LastModified, true)
			folderObjectInfo.ETag, _, _ = c.readOrCreateFolderId(ctx, folderKey)
			s3FileInfo := newFolderInfo(folderObjectInfo)
			_ = walknFc(c.normalize(folderKey), s3FileInfo, nil)
			createdDirs[folderKey] = true
		}
		if c.isIgnoredFile(objectInfo.Key) {
			continue
		}
		if folderKey != "" && folderKey != "." {
			c.createFolderIdsWhileWalking(ctx, createdDirs, walknFc, folderKey, objectInfo.LastModified, false)
		}
		s3FileInfo := newFileInfo(objectInfo)
		_ = walknFc(c.normalize(objectInfo.Key), s3FileInfo, nil)
	}
	return nil
}

func (c *Client) listAllObjects(ctx context.Context, bucketName string, prefix string, recursive bool) <-chan models.ObjectInfo {

	// Allocate new list objects channel.
	objectStatCh := make(chan models.ObjectInfo, 1)
	delimiter := "/"
	if recursive {
		delimiter = ""
	}

	// Initiate list objects goroutine here.
	go func(objectStatCh chan<- models.ObjectInfo) {
		defer close(objectStatCh)
		// Save continuationToken for next request.
		var continuationToken string
		for {
			// Get list of objects a maximum of 1000 per request.
			result, err := c.Oc.ListObjects(ctx, bucketName, prefix, continuationToken, delimiter)
			if err != nil {
				objectStatCh <- models.ObjectInfo{Err: err}
				return
			}

			// If contents are available loop through and send over channel.
			for _, object := range result.Contents {
				object.ETag = strings.TrimSuffix(strings.TrimPrefix(object.ETag, "\""), "\"")
				continuationToken = object.Key
				select {
				// Send object content.
				case objectStatCh <- object:
				// If receives done from the caller, return here.
				case <-ctx.Done():
					objectStatCh <- models.ObjectInfo{Err: ctx.Err()}
					return
				}
			}

			// Send all common prefixes if any.
			// NOTE: prefixes are only present if the request is delimited.
			for _, obj := range result.CommonPrefixes {
				select {
				// Send object prefixes.
				case objectStatCh <- models.ObjectInfo{Key: obj.Prefix}:
				// If receives done from the caller, return here.
				case <-ctx.Done():
					objectStatCh <- models.ObjectInfo{Err: ctx.Err()}
					return
				}
			}

			// If NextMarker is present, save it as continuation token for next request.
			// If result 'IsTruncated' but NextMarker is not set, continuationToken will be last object Key (see above)
			if result.NextMarker != "" {
				continuationToken = result.NextMarker
			}

			// If result is not truncated, return right here.
			if !result.IsTruncated {
				return
			}
		}
	}(objectStatCh)

	return objectStatCh
}

// Will try to create PydioSyncHiddenFile to avoid missing empty folders
func (c *Client) createFolderIdsWhileWalking(ctx context.Context, createdDirs map[string]bool, walknFc func(path string, info *fileInfo, err error) error, currentDir string, lastModified time.Time, skipLast bool) {

	parts := strings.Split(currentDir, "/")
	max := len(parts)
	if skipLast {
		max = len(parts) - 1
		if max == 0 {
			return
		}
	}
	for i := 0; i < max; i++ {
		testDir := strings.Join(parts[0:i+1], "/")
		if _, exists := createdDirs[testDir]; exists {
			continue
		}
		uid, created, _ := c.readOrCreateFolderId(ctx, testDir)
		dirObjectInfo := models.ObjectInfo{
			ETag:         uid,
			Key:          testDir,
			LastModified: lastModified,
			Size:         0,
		}
		s3FolderInfo := newFolderInfo(dirObjectInfo)
		_ = walknFc(c.normalize(testDir), s3FolderInfo, nil)
		if created.Key != "" {
			_ = walknFc(c.normalize(created.Key), newFileInfo(created), nil)
		}

		createdDirs[testDir] = true
	}

}

func (c *Client) s3forceComputeEtag(ctx context.Context, node tree.N) (models.ObjectInfo, error) {

	objectInfo := models.ObjectInfo{
		Key:  c.getFullPath(node.GetPath()),
		Size: node.GetSize(),
	}
	oi, e := c.Oc.StatObject(ctx, c.Bucket, objectInfo.Key, models.ReadMeta{})
	if e != nil {
		return objectInfo, e
	}
	if c.checksumMapper != nil {
		// We use a checksum mapper : do not copy object in-place!
		eTag := strings.Trim(oi.ETag, "\"")
		if cs, ok := c.checksumMapper.Get(eTag); ok {
			log.Logger(c.globalContext).Debug("Read eTag from ChecksumMapper " + cs)
			objectInfo.ETag = cs
		} else {
			log.Logger(c.globalContext).Debug("Storing eTag inside ChecksumMapper for " + eTag)
			reader, e := c.GetReaderOn(ctx, node.GetPath())
			if e != nil {
				return objectInfo, e
			}
			defer reader.Close()
			h := md5.New()
			if _, err := io.Copy(h, reader); err != nil {
				return objectInfo, err
			}
			checksum := fmt.Sprintf("%x", h.Sum(nil))
			log.Logger(c.globalContext).Debug("Stored inside ChecksumMapper " + checksum)
			c.checksumMapper.Set(eTag, checksum)
			objectInfo.ETag = checksum
		}
		return objectInfo, nil
	}
	existingMeta := make(map[string]string, len(oi.Metadata))
	for k, v := range oi.Metadata {
		existingMeta[k] = strings.Join(v, "")
	}
	// Cannot CopyObject on itself for files bigger than 5GB - compute Md5 and store it as metadata instead
	// TODO : SHOULD NOT BE NECESSARY FOR REAL MINIO ON FS (but required for Minio as S3 gateway or real S3)
	if objectInfo.Size > c.Oc.CopyObjectMultipartThreshold() {
		if checksum := oi.Metadata.Get(servicescommon.XAmzMetaContentMd5); checksum != "" {
			objectInfo.ETag = checksum
			return objectInfo, nil
		}
		reader, e := c.GetReaderOn(ctx, node.GetPath())
		if e != nil {
			return objectInfo, e
		}
		defer reader.Close()
		h := md5.New()
		if _, err := io.Copy(h, reader); err != nil {
			return objectInfo, err
		}
		checksum := fmt.Sprintf("%x", h.Sum(nil))
		existingMeta[servicescommon.XAmzMetaDirective] = "REPLACE"
		existingMeta[servicescommon.XAmzMetaContentMd5] = checksum
		err := c.Oc.CopyObjectMultipart(ctx, objectInfo, c.Bucket, objectInfo.Key, c.Bucket, objectInfo.Key, existingMeta, nil)
		objectInfo.ETag = checksum
		return objectInfo, err

	} else {

		_, copyErr := c.Oc.CopyObject(ctx, c.Bucket, objectInfo.Key, c.Bucket, objectInfo.Key, map[string]string{servicescommon.XAmzMetaDirective: "REPLACE"}, existingMeta, nil)
		if copyErr != nil {
			log.Logger(c.globalContext).Error("Compute Etag Copy", zap.Error(copyErr))
			return objectInfo, copyErr
		}
		newInfo, e := c.Oc.StatObject(ctx, c.Bucket, objectInfo.Key, models.ReadMeta{})
		if e != nil {
			return objectInfo, e
		}
		return newInfo, nil
	}

}

func (c *Client) LoadNode(ctx context.Context, path string, extendedStats ...bool) (node tree.N, err error) {
	if n, er := c.loadNode(ctx, path); er != nil {
		return nil, er
	} else {
		return tree.LightNodeFromProto(n), nil
	}
}

func (c *Client) loadNode(ctx context.Context, path string, leaf ...bool) (node *tree.Node, err error) {
	var hash, uid string
	var isLeaf bool
	var metaSize int64
	var stat os.FileInfo
	var eStat error
	if len(leaf) > 0 {
		isLeaf = leaf[0]
	} else {
		stat, eStat = c.Stat(ctx, path)
		if eStat != nil {
			return nil, eStat
		} else {
			isLeaf = !stat.IsDir()
		}
	}
	uid, hash, metaSize, err = c.getNodeIdentifier(ctx, path, isLeaf)
	if err != nil {
		return nil, err
	}
	nodeType := tree.NodeType_LEAF
	if !isLeaf {
		nodeType = tree.NodeType_COLLECTION
	}
	node = &tree.Node{
		Path: path,
		Type: nodeType,
		Uuid: uid,
		Etag: hash,
	}
	if stat != nil {
		node.MTime = stat.ModTime().Unix()
		node.Size = stat.Size()
		node.Mode = int32(stat.Mode())
		if oi, ok := stat.Sys().(models.ObjectInfo); ok && oi.ContentType != "" && oi.ContentType != "application/octet-stream" {
			node.MustSetMeta(servicescommon.MetaNamespaceMime, oi.ContentType)
		}
	} else {
		node.MTime = time.Now().Unix()
	}
	if metaSize > -1 {
		node.Size = metaSize
	}
	return node, nil
}

// UpdateNodeUuid makes this endpoint an UuidReceiver
func (c *Client) UpdateNodeUuid(ctx context.Context, node tree.N) (tree.N, error) {

	var uid string
	if node.GetUuid() != "" {
		uid = node.GetUuid()
	} else {
		uid = uuid.New()
		node.SetUuid(uid)
	}

	if node.IsLeaf() {
		_, err := c.Oc.CopyObject(
			context.Background(),
			c.Bucket,
			c.getFullPath(node.GetPath()),
			c.Bucket,
			c.getFullPath(node.GetPath()),
			map[string]string{},
			map[string]string{
				servicescommon.XAmzMetaNodeUuid:  node.GetUuid(),
				servicescommon.XAmzMetaDirective: "REPLACE",
			},
			nil)
		return node, err
	} else {
		hiddenPath := fmt.Sprintf("%v/%s", c.getFullPath(node.GetPath()), servicescommon.PydioSyncHiddenFile)
		_, err := c.Oc.PutObject(context.Background(), c.Bucket, hiddenPath, strings.NewReader(uid), int64(len(uid)), models.PutMeta{ContentType: "text/plain"})
		return node, err
	}

}

func (c *Client) getNodeIdentifier(ctx context.Context, path string, leaf bool) (uid string, eTag string, metaSize int64, e error) {
	if leaf {
		return c.getFileHash(ctx, c.getFullPath(path))
	} else {
		uid, _, e = c.readOrCreateFolderId(ctx, c.getFullPath(path))
		return uid, "", -1, e
	}
}

func (c *Client) readOrCreateFolderId(ctx context.Context, folderPath string) (uid string, created models.ObjectInfo, e error) {

	// Find existing .pydio
	hiddenPath := path.Join(folderPath, servicescommon.PydioSyncHiddenFile)
	hiddenPath = strings.TrimLeft(hiddenPath, "/")
	object, _, err := c.Oc.GetObject(ctx, c.Bucket, hiddenPath, models.ReadMeta{})
	if err == nil {
		defer object.Close()
		bb, er := io.ReadAll(object)
		if er == nil {
			uid = string(bb)
			if len(strings.TrimSpace(uid)) > 0 {
				log.Logger(c.globalContext).Debug("Read Uuid for folderPath", zap.String("path", folderPath), zap.String("uuid", uid))
				return
			}
		}
	}

	// Readonly mode, return a stable UUID based on folderPath
	if c.options.BrowseOnly {
		stablePath := folderPath
		if c.options.Properties != nil {
			if p, o := c.options.Properties["stableUuidPrefix"]; o {
				stablePath = path.Join(p, stablePath)
			}
		}
		hasher := sha1.New()
		hasher.Write([]byte(stablePath))
		uid = fmt.Sprintf("%x", hasher.Sum(nil))
		return
	}

	// Does not exist - create dir uuid and .pydio now
	uid = uuid.New()
	eTag := model.StringContentToETag(uid)
	log.Logger(c.globalContext).Info("Create Hidden File for folder", zap.String("path", hiddenPath))
	ui, e := c.Oc.PutObject(context.Background(), c.Bucket, hiddenPath, strings.NewReader(uid), int64(len(uid)), models.PutMeta{ContentType: "text/plain"})
	if e != nil {
		return "", models.ObjectInfo{}, e
	}
	created = models.ObjectInfo{
		ETag:         eTag,
		Key:          hiddenPath,
		LastModified: time.Now(),
		Size:         ui.Size,
		ContentType:  "text/plain",
	}
	return

}

func (c *Client) getFileHash(ctx context.Context, path string) (uid string, hash string, metaSize int64, e error) {
	metaSize = -1
	objectInfo, e := c.Oc.StatObject(ctx, c.Bucket, path, models.ReadMeta{})
	if e != nil {
		return "", "", metaSize, e
	}
	uid = objectInfo.Metadata.Get(servicescommon.XAmzMetaNodeUuid)
	if size := objectInfo.Metadata.Get(servicescommon.XAmzMetaClearSize); size != "" {
		if size == servicescommon.XAmzMetaClearSizeUnknown {
			if c.plainSizeComputer != nil {
				if plain, er := c.plainSizeComputer(uid); er == nil {
					metaSize = plain
					// TODO: Refresh metadata inside object now?
				} else {
					log.Logger(c.globalContext).Info("Cannot compute plain size", zap.Error(er))
				}
			}
		} else {
			metaSize, _ = strconv.ParseInt(size, 10, 64)
		}
	}
	etag := strings.Trim(objectInfo.ETag, "\"")
	return uid, etag, metaSize, nil
}

func (c *Client) Watch(recursivePath string) (*model.WatchObject, error) {

	eventChan := make(chan model.EventInfo)
	errorChan := make(chan error)
	doneChan := make(chan bool)

	log.Logger(c.globalContext).Debug("Watching Bucket", zap.String("bucket", c.Bucket))

	// Flag set to set the notification.
	var events []string
	events = append(events, string(notification.ObjectCreatedAll))
	events = append(events, string(notification.ObjectRemovedAll))

	ctx, cancel := context.WithCancel(context.Background())
	wConn := make(chan model.WatchConnectionInfo)

	// Start listening on all bucket events.
	eventsCh, e := c.Oc.BucketNotifications(ctx, c.Bucket, c.getFullPath(recursivePath), events)
	if e != nil {
		cancel()
		return nil, e
	}

	wo := &model.WatchObject{
		EventInfoChan:  eventChan,
		ErrorChan:      errorChan,
		DoneChan:       doneChan,
		ConnectionInfo: wConn,
	}

	// wait for events to occur and sent them through the eventChan and errorChan
	go func() {
		defer func() {
			cancel()
			close(eventChan)
			close(errorChan)
			close(wConn)
		}()

		for {
			select {
			case <-doneChan:
				return
			case ni, closed := <-eventsCh:
				notificationInfo := ni.(notification.Info)
				if notificationInfo.Err != nil {
					if nErr, ok := notificationInfo.Err.(minio.ErrorResponse); ok && nErr.Code == "APINotSupported" {
						errorChan <- errors.New("API Not Supported")
						return
					}
					errorChan <- notificationInfo.Err
					wConn <- model.WatchDisconnected
					if closed {
						return
					}
				}
				for _, record := range notificationInfo.Records {
					//bucketName := record.S3.Bucket.Name
					key, e := url.QueryUnescape(record.S3.Object.Key)
					if e != nil {
						errorChan <- e
						continue
					}
					objectPath := key
					folder := false
					var additionalCreate string
					if strings.HasSuffix(key, servicescommon.PydioSyncHiddenFile) {
						additionalCreate = objectPath
						additionalCreate = c.getLocalPath(additionalCreate)
						objectPath = path.Dir(key)
						folder = true
					}
					if c.isIgnoredFile(objectPath, record) {
						continue
					}
					objectPath = c.getLocalPath(objectPath)

					if strings.HasPrefix(record.EventName, "s3:ObjectCreated:") {
						log.Logger(c.globalContext).Debug("S3 Event", zap.String("event", "ObjectCreated"), zap.Any("event", record))
						eventChan <- model.EventInfo{
							Time:      record.EventTime,
							Size:      record.S3.Object.Size,
							Etag:      record.S3.Object.ETag,
							Path:      objectPath,
							Folder:    folder,
							Source:    c,
							Type:      model.EventCreate,
							Host:      record.Source.Host,
							Port:      record.Source.Port,
							UserAgent: record.Source.UserAgent,
							Metadata:  stripCloseParameters(additionalCreate != "", record.RequestParameters),
						}
						if additionalCreate != "" {
							// Send also the PydioSyncHiddenFile event
							log.Logger(c.globalContext).Debug("S3 Event", zap.String("event", "ObjectCreated"), zap.String("path", additionalCreate))
							eventChan <- model.EventInfo{
								Time:      record.EventTime,
								Size:      record.S3.Object.Size,
								Etag:      record.S3.Object.ETag,
								Path:      additionalCreate,
								Folder:    false,
								Source:    c,
								Type:      model.EventCreate,
								Host:      record.Source.Host,
								Port:      record.Source.Port,
								UserAgent: record.Source.UserAgent,
								Metadata:  record.RequestParameters,
							}
						}

					} else if strings.HasPrefix(record.EventName, "s3:ObjectRemoved:") {
						log.Logger(c.globalContext).Debug("S3 Event", zap.String("event", "ObjectRemoved"), zap.String("path", objectPath))
						eventChan <- model.EventInfo{
							Time:      record.EventTime,
							Path:      objectPath,
							Folder:    folder,
							Source:    c,
							Type:      model.EventRemove,
							Host:      record.Source.Host,
							Port:      record.Source.Port,
							UserAgent: record.Source.UserAgent,
							Metadata:  stripCloseParameters(additionalCreate != "", record.RequestParameters),
						}
						if additionalCreate != "" {
							log.Logger(c.globalContext).Debug("S3 Event", zap.String("event", "ObjectRemoved"), zap.String("path", additionalCreate))
							eventChan <- model.EventInfo{
								Time:      record.EventTime,
								Path:      additionalCreate,
								Folder:    false,
								Source:    c,
								Type:      model.EventRemove,
								Host:      record.Source.Host,
								Port:      record.Source.Port,
								UserAgent: record.Source.UserAgent,
								Metadata:  record.RequestParameters,
							}
						}
					} else if record.EventName == string(notification.ObjectAccessedGet) {
						eventChan <- model.EventInfo{
							Time:      record.EventTime,
							Size:      record.S3.Object.Size,
							Etag:      record.S3.Object.ETag,
							Path:      objectPath,
							Source:    c,
							Type:      model.EventAccessedRead,
							Host:      record.Source.Host,
							Port:      record.Source.Port,
							UserAgent: record.Source.UserAgent,
							Metadata:  record.RequestParameters,
						}
					} else if record.EventName == string(notification.ObjectAccessedHead) {
						eventChan <- model.EventInfo{
							Time:      record.EventTime,
							Size:      record.S3.Object.Size,
							Etag:      record.S3.Object.ETag,
							Path:      objectPath,
							Source:    c,
							Type:      model.EventAccessedStat,
							Host:      record.Source.Host,
							Port:      record.Source.Port,
							UserAgent: record.Source.UserAgent,
							Metadata:  record.RequestParameters,
						}
					}
				}
			}
		}
	}()

	return wo, nil

}

func stripCloseParameters(do bool, params map[string]string) map[string]string {
	if !do {
		return params
	}
	newParams := make(map[string]string, len(params))
	for k, v := range params {
		if k == servicescommon.XPydioSessionUuid && strings.HasPrefix(v, servicescommon.SyncSessionClose_) {
			newParams[k] = strings.TrimPrefix(v, servicescommon.SyncSessionClose_)
		} else {
			newParams[k] = v
		}
	}
	return newParams
}

func (c *Client) isIgnoredFile(path string, record ...notification.Event) bool {
	if len(record) > 0 && strings.Contains(record[0].Source.UserAgent, UserAgentAppName) {
		return true
	}
	return false
}

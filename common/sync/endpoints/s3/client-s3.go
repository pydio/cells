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
	"bytes"
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
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/minio/minio-go/v7/pkg/notification"
	"go.uber.org/zap"
	"golang.org/x/text/unicode/norm"

	servicescommon "github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/tree"
	errors2 "github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/sync/model"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var (
	UserAgentAppName = "pydio.sync.client.s3"
	UserAgentVersion = "1.0"
)

// Client wraps a Minio Client to speak with an S3-compatible backend
type Client struct {
	Mc                          MockableMinio
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

func NewClient(ctx context.Context, host string, key string, secret string, bucket string, rootPath string, secure bool, options model.EndpointOptions) (*Client, error) {
	mc, e := minio.New(host, &minio.Options{
		Creds:  credentials.NewStaticV4(key, secret, ""),
		Secure: secure,
	})
	if e != nil {
		return nil, e
	}
	mc.SetAppInfo(UserAgentAppName, UserAgentVersion)
	return &Client{
		Mc:            mc,
		Bucket:        bucket,
		Host:          host,
		RootPath:      strings.TrimRight(rootPath, "/"),
		options:       options,
		globalContext: ctx,
	}, e
}

func (c *Client) GetEndpointInfo() model.EndpointInfo {

	return model.EndpointInfo{
		URI:                   "s3://" + c.Host + "/" + path.Join(c.Bucket, c.RootPath),
		RequiresFoldersRescan: false,
		RequiresNormalization: c.ServerRequiresNormalization,
	}

}

// SetPlainSizeComputer passes a computer function to extract plain size
//from an encrypted node
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

func (c *Client) Stat(pa string) (i os.FileInfo, err error) {
	ctx := context.Background()
	fullPath := c.getFullPath(pa)
	if fullPath == "" || fullPath == "/" {
		buckets, err := c.Mc.ListBuckets(ctx)
		if err != nil {
			return nil, err
		}
		for _, b := range buckets {
			if b.Name == c.Bucket {
				return NewS3FolderInfo(minio.ObjectInfo{
					Key:          "/",
					LastModified: b.CreationDate,
				}), nil
			}
		}
		return nil, errors2.NotFound("bucket.not.found", "cannot find bucket %s", c.Bucket)
	}
	objectInfo, e := c.Mc.StatObject(ctx, c.Bucket, fullPath, minio.StatObjectOptions{})
	if e != nil {
		// Try folder
		folderInfo, e2 := c.Mc.StatObject(ctx, c.Bucket, path.Join(fullPath, servicescommon.PydioSyncHiddenFile), minio.StatObjectOptions{})
		if e2 != nil {
			return nil, e
		}
		return NewS3FolderInfo(folderInfo), nil
	}
	return NewS3FileInfo(objectInfo), nil
}

func (c *Client) CreateNode(ctx context.Context, node *tree.Node, updateIfExists bool) (err error) {
	if node.IsLeaf() {
		return errors.New("This is a DataSyncTarget, use PutNode for leafs instead of CreateNode")
	}
	hiddenPath := fmt.Sprintf("%v/%s", c.getFullPath(node.Path), servicescommon.PydioSyncHiddenFile)
	_, err = c.Mc.PutObject(ctx, c.Bucket, hiddenPath, strings.NewReader(node.Uuid), int64(len(node.Uuid)), minio.PutObjectOptions{ContentType: "text/plain"})
	return err
}

func (c *Client) DeleteNode(ctx context.Context, path string) (err error) {
	path = c.getFullPath(path)

	ctx2, cancel := context.WithCancel(ctx)
	defer cancel()
	for object := range c.Mc.ListObjects(ctx2, c.Bucket, minio.ListObjectsOptions{Prefix: path, Recursive: true}) {
		err = c.Mc.RemoveObject(ctx, c.Bucket, object.Key, minio.RemoveObjectOptions{})
		if err != nil {
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
	for object := range c.Mc.ListObjects(ctx2, c.Bucket, minio.ListObjectsOptions{Prefix: oldPath, Recursive: true}) {
		targetKey := newPath + strings.TrimPrefix(object.Key, oldPath)
		// Switch to multipart for copy
		if object.Size > MaxCopyObjectSize {
			cl, ok := c.Mc.(*minio.Client)
			if !ok {
				return fmt.Errorf("cannot convert MockableMinio to minio.Client")
			}
			coreCopier := &minio.Core{Client: cl}
			er := CopyObjectMultipart(context.Background(), coreCopier, object, c.Bucket, object.Key, c.Bucket, targetKey, nil, nil)
			if er != nil {
				return er
			}
		} else {
			_, e := c.Mc.CopyObject(ctx, minio.CopyDestOptions{
				Bucket: c.Bucket,
				Object: targetKey,
			}, minio.CopySrcOptions{
				Bucket: c.Bucket,
				Object: object.Key,
			})
			if e != nil {
				return e
			}
		}
		if e := c.Mc.RemoveObject(ctx, c.Bucket, object.Key, minio.RemoveObjectOptions{}); e != nil {
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
			reader.Close()
			close(writeDone)
			close(writeErr)
		}()
		_, e := c.Mc.PutObject(cancel, c.Bucket, path, reader, targetSize, minio.PutObjectOptions{ContentType: "application/octet-stream"})
		if e != nil {
			writeErr <- e
		}
	}()
	return out, writeDone, writeErr, nil

}

func (c *Client) GetReaderOn(path string) (out io.ReadCloser, err error) {

	return c.Mc.GetObject(context.Background(), c.Bucket, c.getFullPath(path), minio.GetObjectOptions{})

}

func (c *Client) ComputeChecksum(node *tree.Node) error {
	if c.skipRecomputeEtagByCopy {
		log.Logger(c.globalContext).Debug("skipping recompute ETag by copy, storage does not support it, keep original value", node.Zap())
		return nil
	}
	if c.options.BrowseOnly {
		log.Logger(c.globalContext).Debug("skipping recompute ETag by copy, storage is readonly, keep original value", node.Zap())
		return nil
	}
	p := c.getFullPath(node.GetPath())
	if newInfo, err := c.s3forceComputeEtag(minio.ObjectInfo{Key: p, Size: node.Size}); err == nil {
		node.Etag = strings.Trim(newInfo.ETag, "\"")
	} else {
		return err
	}
	return nil
}

func (c *Client) Walk(walknFc model.WalkNodesFunc, root string, recursive bool) (err error) {

	t := time.Now()
	defer func() {
		log.Logger(c.globalContext).Info("S3 Walk Operation + Stats took", zap.Duration("d", time.Since(t)))
	}()
	var eTags []string
	collect := (root == "" || root == "/") && recursive && c.checksumMapper != nil && c.purgeMapperAfterWalk

	batchWrapper := func(path string, info *S3FileInfo, node *tree.Node) {
		node.MTime = info.ModTime().Unix()
		node.Size = info.Size()
		node.Mode = int32(info.Mode())
		if !info.IsDir() {
			node.Etag = strings.Trim(info.Object.ETag, "\"")
		} else {
			node.Uuid = strings.Trim(info.Object.ETag, "\"")
		}
		if collect && node.IsLeaf() {
			eTags = append(eTags, node.Etag)
		}
		walknFc(path, node, nil)
	}
	batcher := &statBatcher{
		size:   50,
		walker: batchWrapper,
		c:      c,
	}

	wrappingFunc := func(path string, info *S3FileInfo, err error) error {
		path = c.getLocalPath(path)
		batcher.push(&input{path: path, info: info})
		/*
			node, test := c.loadNode(ctx, path, !info.IsDir())
			if test != nil || node == nil {
				// Ignoring node not found
				return nil
			}

			node.MTime = info.ModTime().Unix()
			node.Size = info.Size()
			node.Mode = int32(info.Mode())
			if !info.IsDir() {
				node.Etag = strings.Trim(info.Object.ETag, "\"")
			} else {
				node.Uuid = strings.Trim(info.Object.ETag, "\"")
			}
			if collect && node.IsLeaf() {
				eTags = append(eTags, node.Etag)
			}
			walknFc(path, node, nil)
		*/
		return nil
	}
	if err = c.actualLsRecursive(recursive, c.getFullPath(root), wrappingFunc); err != nil {
		return err
	}
	batcher.flush()
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

func (c *Client) actualLsRecursive(recursive bool, recursivePath string, walknFc func(path string, info *S3FileInfo, err error) error) (err error) {

	ctx2, cancel := context.WithCancel(context.Background())
	defer cancel()

	createdDirs := make(map[string]bool)
	log.Logger(c.globalContext).Info("Listing all S3 objects for path", zap.String("bucket", c.Bucket), zap.String("path", recursivePath))
	for objectInfo := range c.Mc.ListObjects(ctx2, c.Bucket, minio.ListObjectsOptions{Prefix: recursivePath, Recursive: recursive}) {
		if objectInfo.Err != nil {
			log.Logger(c.globalContext).Error("Error while listing", zap.Error(objectInfo.Err))
			return objectInfo.Err
		}
		folderKey := path.Dir(objectInfo.Key)
		if strings.HasSuffix(objectInfo.Key, "/") {
			c.createFolderIdsWhileWalking(createdDirs, walknFc, folderKey, objectInfo.LastModified, false)
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
					s3FileInfo := NewS3FileInfo(objectInfo)
					walknFc(c.normalize(objectInfo.Key), s3FileInfo, nil)
				}
				continue
			}
			folderObjectInfo := objectInfo
			//This will be called again inside the walknFc
			c.createFolderIdsWhileWalking(createdDirs, walknFc, folderKey, objectInfo.LastModified, true)
			folderObjectInfo.ETag, _, _ = c.readOrCreateFolderId(folderKey)
			s3FileInfo := NewS3FolderInfo(folderObjectInfo)
			walknFc(c.normalize(folderKey), s3FileInfo, nil)
			createdDirs[folderKey] = true
		}
		if c.isIgnoredFile(objectInfo.Key) {
			continue
		}
		if folderKey != "" && folderKey != "." {
			c.createFolderIdsWhileWalking(createdDirs, walknFc, folderKey, objectInfo.LastModified, false)
		}
		s3FileInfo := NewS3FileInfo(objectInfo)
		walknFc(c.normalize(objectInfo.Key), s3FileInfo, nil)
	}
	return nil
}

// Will try to create PydioSyncHiddenFile to avoid missing empty folders
func (c *Client) createFolderIdsWhileWalking(createdDirs map[string]bool, walknFc func(path string, info *S3FileInfo, err error) error, currentDir string, lastModified time.Time, skipLast bool) {

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
		uid, created, _ := c.readOrCreateFolderId(testDir)
		dirObjectInfo := minio.ObjectInfo{
			ETag:         uid,
			Key:          testDir,
			LastModified: lastModified,
			Size:         0,
		}
		s3FolderInfo := NewS3FolderInfo(dirObjectInfo)
		walknFc(c.normalize(testDir), s3FolderInfo, nil)
		if created.Key != "" {
			walknFc(c.normalize(created.Key), NewS3FileInfo(created), nil)
		}

		createdDirs[testDir] = true
	}

}

func (c *Client) s3forceComputeEtag(objectInfo minio.ObjectInfo) (minio.ObjectInfo, error) {

	oi, e := c.Mc.StatObject(context.Background(), c.Bucket, objectInfo.Key, minio.StatObjectOptions{})
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
			reader, e := c.GetReaderOn(objectInfo.Key)
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
	if objectInfo.Size > MaxCopyObjectSize {
		if checksum := oi.Metadata.Get(servicescommon.XAmzMetaContentMd5); checksum != "" {
			objectInfo.ETag = checksum
			return objectInfo, nil
		}
		reader, e := c.GetReaderOn(objectInfo.Key)
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
		cl, ok := c.Mc.(*minio.Client)
		if !ok {
			return objectInfo, fmt.Errorf("cannot convert MockableMinio to minio.Client")
		}
		coreCopier := &minio.Core{Client: cl}
		err := CopyObjectMultipart(context.Background(), coreCopier, objectInfo, c.Bucket, objectInfo.Key, c.Bucket, objectInfo.Key, existingMeta, nil)
		objectInfo.ETag = checksum
		return objectInfo, err

	} else {

		//destinationInfo, _ = minio.NewDestinationInfo(c.Bucket, objectInfo.Key, nil, existingMeta)
		//sourceInfo = minio.NewSourceInfo(c.Bucket, objectInfo.Key, nil)
		//sourceInfo.Headers.Set(servicescommon.XAmzMetaDirective, "REPLACE")
		_, copyErr := c.Mc.CopyObject(context.Background(), minio.CopyDestOptions{
			Bucket:          c.Bucket,
			Object:          objectInfo.Key,
			UserMetadata:    existingMeta,
			ReplaceMetadata: true, // sourceInfo.Headers.Set(servicescommon.XAmzMetaDirective, "REPLACE") ?
		}, minio.CopySrcOptions{
			Bucket: c.Bucket,
			Object: objectInfo.Key,
		})
		if copyErr != nil {
			log.Logger(c.globalContext).Error("Compute Etag Copy", zap.Error(copyErr))
			return objectInfo, copyErr
		}
		newInfo, e := c.Mc.StatObject(context.Background(), c.Bucket, objectInfo.Key, minio.StatObjectOptions{})
		if e != nil {
			return objectInfo, e
		}
		return newInfo, nil
	}

}

func (c *Client) LoadNode(ctx context.Context, path string, extendedStats ...bool) (node *tree.Node, err error) {
	return c.loadNode(ctx, path)
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
		stat, eStat = c.Stat(path)
		if eStat != nil {
			return nil, eStat
		} else {
			isLeaf = !stat.IsDir()
		}
	}
	uid, hash, metaSize, err = c.getNodeIdentifier(path, isLeaf)
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
	} else {
		node.MTime = time.Now().Unix()
	}
	if metaSize > -1 {
		node.Size = metaSize
	}
	return node, nil
}

// UpdateNodeUuid makes this endpoint an UuidReceiver
func (c *Client) UpdateNodeUuid(ctx context.Context, node *tree.Node) (*tree.Node, error) {

	var uid string
	if node.Uuid != "" {
		uid = node.Uuid
	} else {
		uid = uuid.New()
		node.Uuid = uid
	}

	if node.IsLeaf() {
		/*
			d, e := minio.NewDestinationInfo(c.Bucket, c.getFullPath(node.Path), nil, map[string]string{
				servicescommon.XAmzMetaDirective: "REPLACE",
				servicescommon.XAmzMetaNodeUuid:  node.Uuid,
			})
			if e != nil {
				return nil, e
			}
			s := minio.NewSourceInfo(c.Bucket, c.getFullPath(node.Path), nil)
		*/
		_, err := c.Mc.CopyObject(context.Background(), minio.CopyDestOptions{
			Bucket: c.Bucket,
			Object: c.getFullPath(node.Path),
			UserMetadata: map[string]string{
				servicescommon.XAmzMetaNodeUuid: node.Uuid,
			},
			ReplaceMetadata: true, // sourceInfo.Headers.Set(servicescommon.XAmzMetaDirective, "REPLACE") ?
		}, minio.CopySrcOptions{
			Bucket: c.Bucket,
			Object: c.getFullPath(node.Path),
		})
		return node, err
	} else {
		hiddenPath := fmt.Sprintf("%v/%s", c.getFullPath(node.Path), servicescommon.PydioSyncHiddenFile)
		_, err := c.Mc.PutObject(context.Background(), c.Bucket, hiddenPath, strings.NewReader(uid), int64(len(uid)), minio.PutObjectOptions{ContentType: "text/plain"})
		return node, err
	}

}

func (c *Client) getNodeIdentifier(path string, leaf bool) (uid string, eTag string, metaSize int64, e error) {
	if leaf {
		return c.getFileHash(c.getFullPath(path))
	} else {
		uid, _, e = c.readOrCreateFolderId(c.getFullPath(path))
		return uid, "", -1, e
	}
}

func (c *Client) readOrCreateFolderId(folderPath string) (uid string, created minio.ObjectInfo, e error) {

	// Find existing .pydio
	hiddenPath := fmt.Sprintf("%v/%s", folderPath, servicescommon.PydioSyncHiddenFile)
	hiddenPath = strings.TrimLeft(hiddenPath, "/")
	object, err := c.Mc.GetObject(context.Background(), c.Bucket, hiddenPath, minio.GetObjectOptions{})
	if err == nil {
		defer object.Close()
		buf := new(bytes.Buffer)
		buf.ReadFrom(object)
		uid = buf.String()
		if len(strings.TrimSpace(uid)) > 0 {
			log.Logger(c.globalContext).Debug("Read Uuid for folderPath", zap.String("path", folderPath), zap.String("uuid", uid))
			return
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

	// Does not exists - create dir uuid and .pydio now
	uid = uuid.New()
	eTag := model.StringContentToETag(uid)
	log.Logger(c.globalContext).Info("Create Hidden File for folder", zap.String("path", hiddenPath))
	ui, e := c.Mc.PutObject(context.Background(), c.Bucket, hiddenPath, strings.NewReader(uid), int64(len(uid)), minio.PutObjectOptions{ContentType: "text/plain"})
	if e != nil {
		return "", minio.ObjectInfo{}, e
	}
	created = minio.ObjectInfo{
		ETag:         eTag,
		Key:          hiddenPath,
		LastModified: time.Now(),
		Size:         ui.Size,
		ContentType:  "text/plain",
	}
	return

}

func (c *Client) getFileHash(path string) (uid string, hash string, metaSize int64, e error) {
	metaSize = -1
	objectInfo, e := c.Mc.StatObject(context.Background(), c.Bucket, path, minio.StatObjectOptions{})
	if e != nil {
		return "", "", metaSize, e
	}
	uid = objectInfo.Metadata.Get(servicescommon.XAmzMetaNodeUuid)
	if size := objectInfo.Metadata.Get(servicescommon.XAmzMetaClearSize); size != "" {
		if size == servicescommon.XAmzMetaClearSizeUnkown {
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
	eventsCh := c.Mc.ListenBucketNotification(ctx, c.Bucket, c.getFullPath(recursivePath), "", events)

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
			case notificationInfo := <-eventsCh:
				if notificationInfo.Err != nil {
					if nErr, ok := notificationInfo.Err.(minio.ErrorResponse); ok && nErr.Code == "APINotSupported" {
						errorChan <- errors.New("API Not Supported")
						return
					}
					errorChan <- notificationInfo.Err
					wConn <- model.WatchDisconnected
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
					} else if record.EventName == notification.ObjectAccessedGet {
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
					} else if record.EventName == notification.ObjectAccessedHead {
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

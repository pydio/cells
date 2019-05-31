/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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
	"errors"
	"fmt"
	"io"
	"net/url"
	"os"
	"path"
	"strconv"
	"strings"
	"time"

	errors2 "github.com/micro/go-micro/errors"

	"github.com/pborman/uuid"
	"github.com/pydio/minio-go"
	"go.uber.org/zap"
	"golang.org/x/text/unicode/norm"

	servicescommon "github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

var (
	UserAgentAppName = "pydio.sync.client.s3"
	UserAgentVersion = "1.0"
)

// TODO
// For Minio, add an initialization for detecting empty
// folders and creating PYDIO_SYNC_HIDDEN_FILE_META
type Client struct {
	Mc                          MockableMinio
	Bucket                      string
	RootPath                    string
	ServerRequiresNormalization bool
	options                     model.EndpointOptions
	globalContext               context.Context
}

func NewClient(ctx context.Context, url string, key string, secret string, bucket string, rootPath string, options model.EndpointOptions) (*Client, error) {
	mc, e := minio.New(url, key, secret, false)
	if e != nil {
		return nil, e
	}
	mc.SetAppInfo(UserAgentAppName, UserAgentVersion)
	return &Client{
		Mc:            mc,
		Bucket:        bucket,
		RootPath:      strings.TrimRight(rootPath, "/"),
		options:       options,
		globalContext: ctx,
	}, e
}

func (c *Client) GetEndpointInfo() model.EndpointInfo {

	return model.EndpointInfo{
		URI: "s3:///" + path.Join(c.Bucket, c.RootPath),
		RequiresFoldersRescan: false,
		RequiresNormalization: c.ServerRequiresNormalization,
	}

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

func (c *Client) Stat(path string) (i os.FileInfo, err error) {
	if path == "" || path == "/" {
		buckets, err := c.Mc.ListBuckets()
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
	objectInfo, e := c.Mc.StatObject(c.Bucket, c.getFullPath(path), minio.StatObjectOptions{})
	if e != nil {
		// Try folder
		folderInfo, e2 := c.Mc.StatObject(c.Bucket, c.getFullPath(path)+"/"+servicescommon.PYDIO_SYNC_HIDDEN_FILE_META, minio.StatObjectOptions{})
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
	hiddenPath := fmt.Sprintf("%v/%s", c.getFullPath(node.Path), servicescommon.PYDIO_SYNC_HIDDEN_FILE_META)
	_, err = c.Mc.PutObject(c.Bucket, hiddenPath, strings.NewReader(node.Uuid), int64(len(node.Uuid)), minio.PutObjectOptions{ContentType: "text/plain"})
	return err
}

func (c *Client) DeleteNode(ctx context.Context, path string) (err error) {
	path = c.getFullPath(path)

	doneChan := make(chan struct{})
	defer close(doneChan)
	for object := range c.Mc.ListObjectsV2(c.Bucket, path, true, doneChan) {
		err = c.Mc.RemoveObject(c.Bucket, object.Key)
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
	for object := range c.Mc.ListObjectsV2(c.Bucket, oldPath, true, doneChan) {
		targetKey := newPath + strings.TrimPrefix(object.Key, oldPath)
		destinationInfo, _ := minio.NewDestinationInfo(c.Bucket, targetKey, nil, nil)
		sourceInfo := minio.NewSourceInfo(c.Bucket, object.Key, nil)
		copyResult := c.Mc.CopyObject(destinationInfo, sourceInfo)
		if copyResult == nil {
			c.Mc.RemoveObject(c.Bucket, object.Key)
		} else {
			return copyResult
		}
	}
	return nil

}

func (c *Client) GetWriterOn(path string, targetSize int64) (out io.WriteCloser, writeDone chan bool, writeErr chan error, err error) {

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
		_, e := c.Mc.PutObject(c.Bucket, path, reader, targetSize, minio.PutObjectOptions{ContentType: "application/octet-stream"})
		if e != nil {
			writeErr <- e
		}
	}()
	return out, writeDone, writeErr, nil

}

func (c *Client) GetReaderOn(path string) (out io.ReadCloser, err error) {

	return c.Mc.GetObject(c.Bucket, c.getFullPath(path), minio.GetObjectOptions{})

}

func (c *Client) ComputeChecksum(node *tree.Node) error {
	p := c.getFullPath(node.GetPath())
	if newInfo, err := c.s3forceComputeEtag(minio.ObjectInfo{Key: p}); err == nil {
		node.Etag = strings.Trim(newInfo.ETag, "\"")
	} else {
		return err
	}
	return nil
}

func (c *Client) Walk(walknFc model.WalkNodesFunc, root string, recursive bool) (err error) {

	ctx := context.Background()
	wrappingFunc := func(path string, info *S3FileInfo, err error) error {
		path = c.getLocalPath(path)
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

		walknFc(path, node, nil)
		return nil
	}
	return c.actualLsRecursive(recursive, c.getFullPath(root), wrappingFunc)
}

func (c *Client) actualLsRecursive(recursive bool, recursivePath string, walknFc func(path string, info *S3FileInfo, err error) error) (err error) {
	doneChan := make(chan struct{})
	defer close(doneChan)
	createdDirs := make(map[string]bool)
	log.Logger(c.globalContext).Info("Listing all S3 objects for path", zap.String("bucket", c.Bucket), zap.String("path", recursivePath))
	for objectInfo := range c.Mc.ListObjectsV2(c.Bucket, recursivePath, recursive, doneChan) {
		if objectInfo.Err != nil {
			log.Logger(c.globalContext).Error("Error while listing", zap.Error(objectInfo.Err))
			return objectInfo.Err
		}
		folderKey := model.DirWithInternalSeparator(objectInfo.Key)
		if strings.HasSuffix(objectInfo.Key, servicescommon.PYDIO_SYNC_HIDDEN_FILE_META) {
			// Create Fake Folder
			// log.Print("Folder Key is " , folderKey)
			if folderKey == "" || folderKey == "." {
				continue
			}
			if _, exists := createdDirs[folderKey]; exists {
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

// Will try to create PYDIO_SYNC_HIDDEN_FILE_META to avoid missing empty folders
func (c *Client) createFolderIdsWhileWalking(createdDirs map[string]bool, walknFc func(path string, info *S3FileInfo, err error) error, currentDir string, lastModified time.Time, skipLast bool) {

	// Do not create hidden files in BrowseOnly mode
	if c.options.BrowseOnly {
		return
	}
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

	var destinationInfo minio.DestinationInfo
	var sourceInfo minio.SourceInfo

	destinationInfo, _ = minio.NewDestinationInfo(c.Bucket, objectInfo.Key, nil, nil)
	sourceInfo = minio.NewSourceInfo(c.Bucket, objectInfo.Key, nil)
	sourceInfo.Headers.Set(servicescommon.X_AMZ_META_DIRECTIVE, "REPLACE")
	copyErr := c.Mc.CopyObject(destinationInfo, sourceInfo)
	if copyErr != nil {
		log.Logger(c.globalContext).Error("Compute Etag Copy", zap.Error(copyErr))
		return objectInfo, copyErr
	}
	newInfo, e := c.Mc.StatObject(c.Bucket, objectInfo.Key, minio.StatObjectOptions{})
	if e != nil {
		return objectInfo, e
	}
	return newInfo, nil

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
		d, e := minio.NewDestinationInfo(c.Bucket, c.getFullPath(node.Path), nil, map[string]string{
			servicescommon.X_AMZ_META_DIRECTIVE: "REPLACE",
			servicescommon.X_AMZ_META_NODE_UUID: node.Uuid,
		})
		if e != nil {
			return nil, e
		}
		s := minio.NewSourceInfo(c.Bucket, c.getFullPath(node.Path), nil)
		err := c.Mc.CopyObject(d, s)
		return node, err
	} else {
		hiddenPath := fmt.Sprintf("%v/%s", c.getFullPath(node.Path), servicescommon.PYDIO_SYNC_HIDDEN_FILE_META)
		_, err := c.Mc.PutObject(c.Bucket, hiddenPath, strings.NewReader(uid), int64(len(uid)), minio.PutObjectOptions{ContentType: "text/plain"})
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

	hiddenPath := fmt.Sprintf("%v/%s", folderPath, servicescommon.PYDIO_SYNC_HIDDEN_FILE_META)
	object, err := c.Mc.GetObject(c.Bucket, hiddenPath, minio.GetObjectOptions{})
	if err == nil {
		defer object.Close()
		buf := new(bytes.Buffer)
		buf.ReadFrom(object)
		uid = buf.String()
		if len(strings.TrimSpace(uid)) > 0 {
			log.Logger(c.globalContext).Debug("Read Uuid for folderPath", zap.String("path", folderPath), zap.String("uuid", uid))
			return uid, minio.ObjectInfo{}, nil
		}
	}
	// Does not exists
	// Create dir uuid now
	uid = uuid.New()
	eTag := model.StringContentToETag(uid)

	if c.options.BrowseOnly {
		// Return fake file without actually creating it
		return uid, minio.ObjectInfo{
			ETag:         eTag,
			Key:          hiddenPath,
			LastModified: time.Now(),
			Size:         36,
			ContentType:  "text/plain",
		}, nil
	}
	log.Logger(c.globalContext).Info("Create Hidden File for folder", zap.String("path", hiddenPath))
	size, _ := c.Mc.PutObject(c.Bucket, hiddenPath, strings.NewReader(uid), int64(len(uid)), minio.PutObjectOptions{ContentType: "text/plain"})
	created = minio.ObjectInfo{
		ETag:         eTag,
		Key:          hiddenPath,
		LastModified: time.Now(),
		Size:         size,
		ContentType:  "text/plain",
	}
	return uid, created, nil

}

func (c *Client) getFileHash(path string) (uid string, hash string, metaSize int64, e error) {
	metaSize = -1
	objectInfo, e := c.Mc.StatObject(c.Bucket, path, minio.StatObjectOptions{})
	if e != nil {
		return "", "", metaSize, e
	}
	uid = objectInfo.Metadata.Get(servicescommon.X_AMZ_META_NODE_UUID)
	if size := objectInfo.Metadata.Get(servicescommon.X_AMZ_META_CLEAR_SIZE); size != "" {
		metaSize, _ = strconv.ParseInt(size, 10, 64)
	}
	etag := strings.Trim(objectInfo.ETag, "\"")
	/*
		if len(etag) == 0 || etag == common.DefaultEtag {
			fmt.Println("getFileHash - Recompute ETAG")
			var etagE error
			objectInfo, etagE = c.s3forceComputeEtag(objectInfo)
			if etagE != nil {
				return uid, "", metaSize, etagE
			}
			etag = strings.Trim(objectInfo.ETag, "\"")
		}
	*/
	return uid, etag, metaSize, nil
}

func (c *Client) Watch(recursivePath string) (*model.WatchObject, error) {

	eventChan := make(chan model.EventInfo)
	errorChan := make(chan error)
	doneChan := make(chan bool)

	log.Logger(c.globalContext).Debug("Watching Bucket", zap.String("bucket", c.Bucket))
	// Extract bucket and object.
	//if err := isValidBucketName(bucket); err != nil {
	//	return nil, err
	//}

	// Flag set to set the notification.
	var events []string
	events = append(events, string(minio.ObjectCreatedAll))
	events = append(events, string(minio.ObjectRemovedAll))

	doneCh := make(chan struct{})

	// wait for doneChan to close the other channels
	go func() {
		<-doneChan

		close(doneCh)
		close(eventChan)
		close(errorChan)
	}()

	// Start listening on all bucket events.
	eventsCh := c.Mc.ListenBucketNotification(c.Bucket, c.getFullPath(recursivePath), "", events, doneCh)

	wo := &model.WatchObject{
		EventInfoChan: eventChan,
		ErrorChan:     errorChan,
		DoneChan:      doneChan,
	}

	// wait for events to occur and sent them through the eventChan and errorChan
	go func() {
		defer wo.Close()
		for notificationInfo := range eventsCh {
			if notificationInfo.Err != nil {
				if nErr, ok := notificationInfo.Err.(minio.ErrorResponse); ok && nErr.Code == "APINotSupported" {
					errorChan <- errors.New("API Not Supported")
					return
				}
				errorChan <- notificationInfo.Err
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
				if strings.HasSuffix(key, servicescommon.PYDIO_SYNC_HIDDEN_FILE_META) {
					additionalCreate = objectPath
					objectPath = model.DirWithInternalSeparator(key)
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
						// Send also the PYDIO_SYNC_HIDDEN_FILE_META event
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
				} else if record.EventName == minio.ObjectAccessedGet {
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
				} else if record.EventName == minio.ObjectAccessedHead {
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
	}()

	return wo, nil

}

func stripCloseParameters(do bool, params map[string]string) map[string]string {
	if !do {
		return params
	}
	newParams := make(map[string]string, len(params))
	for k, v := range params {
		if k == servicescommon.XPydioSessionUuid && strings.HasPrefix(v, "close-") {
			newParams[k] = strings.TrimPrefix(v, "close-")
		} else {
			newParams[k] = v
		}
	}
	return newParams
}

func (c *Client) isIgnoredFile(path string, record ...minio.NotificationEvent) bool {
	if len(record) > 0 && strings.Contains(record[0].Source.UserAgent, UserAgentAppName) {
		return true
	}
	if model.IsIgnoredFile(path) {
		return true
	}
	return false
}

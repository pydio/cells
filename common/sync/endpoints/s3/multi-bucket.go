package s3

import (
	"context"
	"io"
	"path"
	"regexp"
	"strings"

	"github.com/pydio/cells/common"

	"github.com/pydio/cells/common/log"
	"go.uber.org/zap"

	"github.com/micro/go-micro/errors"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

type MultiBucketClient struct {
	// Global context
	globalContext context.Context
	bucketRegexp  *regexp.Regexp

	// Connection options
	host    string
	key     string
	secret  string
	secure  bool
	options model.EndpointOptions

	// Clients implementations
	mainClient    *Client
	bucketClients map[string]*Client

	// To be passed to clients
	plainSizeComputer     func(nodeUUID string) (int64, error)
	requiresNormalization bool
}

func NewMultiBucketClient(ctx context.Context, host string, key string, secret string, secure bool, options model.EndpointOptions, bucketsFilter string) (*MultiBucketClient, error) {
	c, e := NewClient(ctx, host, key, secret, "", "", secure, options)
	if e != nil {
		return nil, e
	}
	m := &MultiBucketClient{
		host:          host,
		key:           key,
		secret:        secret,
		secure:        secure,
		options:       options,
		mainClient:    c,
		bucketClients: make(map[string]*Client),
	}
	if len(bucketsFilter) > 0 {
		if r, e := regexp.Compile(bucketsFilter); e == nil {
			m.bucketRegexp = r
		} else {
			return nil, e
		}
	}
	return m, nil
}

func (m *MultiBucketClient) LoadNode(ctx context.Context, p string, extendedStats ...bool) (node *tree.Node, err error) {
	c, b, i, e := m.getClient(p)
	if e != nil {
		return nil, e
	}
	if b == "" {
		// Return a fake root
		return &tree.Node{
			Uuid: "ROOT",
			Path: "",
			Type: tree.NodeType_COLLECTION,
		}, nil
	} else {
		n, e := c.LoadNode(ctx, i, extendedStats...)
		m.patchPath(b, n)
		return n, e
	}
}

func (m *MultiBucketClient) GetEndpointInfo() model.EndpointInfo {
	return m.mainClient.GetEndpointInfo()
}

func (m *MultiBucketClient) Walk(walknFc model.WalkNodesFunc, root string, recursive bool) (err error) {
	c, b, i, e := m.getClient(root)
	if e != nil {
		return e
	}
	if b == "" {
		// List buckets first
		bb, er := c.Mc.ListBucketsWithContext(context.Background())
		if er != nil {
			return er
		}
		for _, bucket := range bb {
			if m.bucketRegexp != nil && !m.bucketRegexp.MatchString(bucket.Name) {
				continue
			}
			bC, _, _, _ := m.getClient(bucket.Name)
			uid, _, _ := bC.readOrCreateFolderId("")
			// Walk bucket as a folder
			walknFc(bucket.Name, &tree.Node{Uuid: uid, Path: bucket.Name, Type: tree.NodeType_COLLECTION, MTime: bucket.CreationDate.Unix()}, nil)
			// Walk associated .pydio file
			metaId, metaHash, metaSize, er := bC.getFileHash(common.PYDIO_SYNC_HIDDEN_FILE_META)
			if er != nil {
				log.Logger(context.Background()).Error("cannot get filehash for bucket hidden file", zap.Error(er))
			}
			metaFilePath := path.Join(bucket.Name, common.PYDIO_SYNC_HIDDEN_FILE_META)
			walknFc(metaFilePath, &tree.Node{Uuid: metaId, Etag: metaHash, Size: metaSize, Path: metaFilePath, Type: tree.NodeType_LEAF, MTime: bucket.CreationDate.Unix()}, nil)
			// Walk children
			if recursive {
				e := bC.Walk(func(iPath string, node *tree.Node, err error) {
					wrapped := m.patchPath(bucket.Name, node, iPath)
					walknFc(wrapped, node, err)
				}, "", recursive)
				if e != nil {
					return e
				}
			}
		}
		return nil
	} else {
		return c.Walk(walknFc, i, recursive)
	}
}

func (m *MultiBucketClient) Watch(recursivePath string) (*model.WatchObject, error) {

	// We handle only recursivePath = "" case here

	bb, e := m.mainClient.Mc.ListBuckets()
	if e != nil {
		return nil, e
	}
	eventChan := make(chan model.EventInfo)
	errorChan := make(chan error)
	doneChan := make(chan bool)
	watchObject := &model.WatchObject{
		EventInfoChan: eventChan,
		ErrorChan:     errorChan,
		DoneChan:      doneChan,
	}
	// Setup a watcher on each bucket : init clients
	for _, b := range bb {
		if m.bucketRegexp != nil && !m.bucketRegexp.MatchString(b.Name) {
			continue
		}
		bClient, _, _, e := m.getClient(b.Name)
		if e != nil {
			continue
		}
		bWatcher, e := bClient.Watch("")
		if e != nil {
			continue
		}
		log.Logger(context.Background()).Info("Started watcher for bucket", zap.String("bucket", b.Name))
		go func(bName string) {
			defer func() {
				log.Logger(context.Background()).Info("Closing watcher for bucket", zap.String("bucket", bName))
				bWatcher.DoneChan <- true
			}()
			for {
				select {
				case event := <-bWatcher.Events():
					// Patch Event data for output
					event.Path = m.patchPath(bName, nil, event.Path)
					event.Source = m
					eventChan <- event
				case evErr := <-bWatcher.Errors():
					errorChan <- evErr
				case <-doneChan:
					return
				}
			}
		}(b.Name)
	}
	return watchObject, nil
}

func (m *MultiBucketClient) GetWriterOn(cancel context.Context, path string, targetSize int64) (out io.WriteCloser, writeDone chan bool, writeErr chan error, err error) {
	c, b, i, e := m.getClient(path)
	if e != nil {
		err = e
		return
	}
	if b == "" {
		err = errors.Unauthorized("level.unauthorized", "cannot write file at the buckets level")
		return
	}
	return c.GetWriterOn(cancel, i, targetSize)
}

func (m *MultiBucketClient) GetReaderOn(path string) (out io.ReadCloser, err error) {
	c, b, i, e := m.getClient(path)
	if e != nil {
		err = e
		return
	}
	if b == "" {
		err = errors.Unauthorized("level.unauthorized", "cannot read objects at the buckets level")
		return
	}
	return c.GetReaderOn(i)
}

func (m *MultiBucketClient) CreateNode(ctx context.Context, node *tree.Node, updateIfExists bool) (err error) {
	c, b, i, e := m.getClient(node.Path)
	if e != nil {
		err = e
		return
	}
	if b == "" {
		err = errors.Unauthorized("level.unauthorized", "cannot create objects at the buckets level")
		return
	}
	patched := node.Clone()
	patched.Path = i
	return c.CreateNode(ctx, patched, updateIfExists)
}

func (m *MultiBucketClient) DeleteNode(ctx context.Context, path string) (err error) {
	c, b, i, e := m.getClient(path)
	if e != nil {
		err = e
		return
	}
	if b == "" {
		err = errors.Unauthorized("level.unauthorized", "cannot create objects at the buckets level")
		return
	}
	return c.DeleteNode(ctx, i)
}

func (m *MultiBucketClient) MoveNode(ctx context.Context, oldPath string, newPath string) (err error) {
	c, b, i, e := m.getClient(oldPath)
	if e != nil {
		err = e
		return
	}
	if b == "" {
		err = errors.Unauthorized("level.unauthorized", "cannot move objects at the buckets level")
		return
	}
	_, b2, i2, _ := m.getClient(newPath)
	if b2 != b {
		err = errors.BadRequest("not.implemented", "cannot move objects accross buckets for the moment")
	}
	return c.MoveNode(ctx, i, i2)
}

func (m *MultiBucketClient) ComputeChecksum(node *tree.Node) (err error) {
	c, b, i, e := m.getClient(node.Path)
	if e != nil {
		err = e
		return
	}
	if b == "" {
		err = errors.Unauthorized("level.unauthorized", "cannot compute checksum at the buckets level")
		return
	}
	patched := node.Clone()
	patched.Path = i
	if e := c.ComputeChecksum(patched); e != nil {
		return e
	} else {
		node.Etag = patched.Etag
		return nil
	}
}

func (m *MultiBucketClient) UpdateNodeUuid(ctx context.Context, node *tree.Node) (n *tree.Node, err error) {
	c, b, i, e := m.getClient(node.Path)
	if e != nil {
		err = e
		return
	}
	if b == "" {
		err = errors.Unauthorized("level.unauthorized", "cannot update node Uuid at the buckets level")
		return
	}
	patched := node.Clone()
	patched.Path = i
	out, e := c.UpdateNodeUuid(ctx, patched)
	m.patchPath(b, out)
	return out, e
}

func (m *MultiBucketClient) SetPlainSizeComputer(computer func(nodeUUID string) (int64, error)) {
	m.plainSizeComputer = computer
	m.mainClient.SetPlainSizeComputer(computer)
}

func (m *MultiBucketClient) SetServerRequiresNormalization() {
	m.requiresNormalization = true
	m.mainClient.SetServerRequiresNormalization()
}

func (m *MultiBucketClient) getClient(p string) (c *Client, bucket string, internal string, e error) {
	p = strings.Trim(p, "/")
	parts := strings.Split(p, "/")
	if len(parts) >= 1 && parts[0] != "" {
		bucket = parts[0]
		internal = strings.Join(parts[1:], "/")
		if cl, ok := m.bucketClients[bucket]; ok {
			c = cl
		} else {
			c, e = NewClient(m.globalContext, m.host, m.key, m.secret, bucket, "", m.secure, m.options)
			if e != nil {
				return
			}
			if m.plainSizeComputer != nil {
				c.SetPlainSizeComputer(m.plainSizeComputer)
			}
			if m.requiresNormalization {
				c.SetServerRequiresNormalization()
			}
			m.bucketClients[bucket] = c
		}
	} else {
		c = m.mainClient
	}
	return
}

func (m *MultiBucketClient) patchPath(bucketName string, node *tree.Node, p ...string) (patched string) {
	if len(p) > 0 {
		patched = path.Join(bucketName, p[0])
	}
	if node != nil {
		node.Path = path.Join(bucketName, node.Path)
	}
	return
}

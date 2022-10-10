package put

import (
	"context"
	"encoding/hex"
	"fmt"
	"google.golang.org/grpc"
	"hash"
	"io"
	"strconv"
	"strings"
	"sync"

	errors2 "github.com/pkg/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/cache"
	"github.com/pydio/cells/v4/common/utils/hasher"
	"github.com/pydio/cells/v4/common/utils/hasher/simd"
)

func WithHashInterceptor() nodes.Option {
	return func(options *nodes.RouterOptions) {
		options.Wrappers = append(options.Wrappers, &HashHandler{
			hashesAsETags: options.HashesAsETags,
		})
	}
}

var HashFunc = func() hash.Hash {
	return hasher.NewBlockHash(simd.MD5(), hasher.DefaultBlockSize)
}

// HashHandler wraps input readers to compute custom Hash on the fly
type HashHandler struct {
	abstract.Handler
	hashesAsETags  bool
	partsCache     cache.Cache
	partsCacheOnce sync.Once
}

func (m *HashHandler) Adapt(c nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	m.AdaptOptions(c, options)
	return m
}

// PutObject intercepts PutObject to compute custom hash on-the-fly
func (m *HashHandler) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (models.ObjectInfo, error) {

	// We assume we always have a node.Uuid here
	var completeFunc func(s string, hashes [][]byte)
	if !nodes.IsFlatStorage(ctx, "in") {
		completeFunc = func(s string, hashes [][]byte) {
			nodes.MustCoreMetaSet(ctx, node.Uuid, common.MetaNamespaceHash, s)
		}
	}
	// Wrap reader in a block hasher computation.
	// Flat storages will extract reader final result later in the chain,
	// while Struct storages will use completeFunc to trigger meta update
	reader = hasher.Tee(reader, HashFunc, common.MetaNamespaceHash, completeFunc)
	return m.Next.PutObject(ctx, node, reader, requestData)

}

// MultipartPutObjectPart intercepts PutObjectPart to compute custom hash on-the-fly and store this parts hash in cache
func (m *HashHandler) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *models.PutRequestData) (models.MultipartObjectPart, error) {

	partID := strconv.Itoa(partNumberMarker)
	c, e := m.getPartsCache()
	if e != nil {
		return models.MultipartObjectPart{}, e
	}
	reader = hasher.Tee(reader, HashFunc, common.MetaNamespaceHash, func(s string, hashes [][]byte) {
		var keys []string
		for _, ha := range hashes {
			keys = append(keys, hex.EncodeToString(ha))
		}
		if er := c.Set("multipart:"+uploadID+":"+partID, []byte(strings.Join(keys, ":"))); er != nil {
			log.Logger(ctx).Error("Error while caching part hash to cache: "+er.Error(), zap.Error(er))
		}
	})

	return m.Next.MultipartPutObjectPart(ctx, target, uploadID, partNumberMarker, reader, requestData)
}

// MultipartComplete reconstructs final hash from the parts hashes stored in cache
func (m *HashHandler) MultipartComplete(ctx context.Context, target *tree.Node, uploadID string, uploadedParts []models.MultipartObjectPart) (models.ObjectInfo, error) {
	f, e := m.computeMultipartFinalHash(uploadID, len(uploadedParts))
	if e != nil {
		return models.ObjectInfo{}, errors2.Wrap(e, "cannot initialize cache")
	}
	if !nodes.IsFlatStorage(ctx, "in") {
		nodes.MustCoreMetaSet(ctx, target.Uuid, common.MetaNamespaceHash, f)
	} else {
		target.MustSetMeta(common.MetaNamespaceHash, f)
	}
	return m.Next.MultipartComplete(ctx, target, uploadID, uploadedParts)
}

// MultipartAbort clears parts stored in cache on multipart cancellation
func (m *HashHandler) MultipartAbort(ctx context.Context, target *tree.Node, uploadID string, requestData *models.MultipartRequestData) error {
	go m.clearMultipartCachedHashes(uploadID)
	return m.Next.MultipartAbort(ctx, target, uploadID, requestData)
}

// CopyObject propagates x-cells-hash metadata when copying or moving files
func (m *HashHandler) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (models.ObjectInfo, error) {

	// TODO Move that in the "previous" layer?
	move := requestData.IsMove()
	if !move && !nodes.IsFlatStorage(ctx, "to") {
		// Ensure target UUID is set
		to.RenewUuidIfEmpty(false)
		requestData.SetMeta(common.XAmzMetaNodeUuid, to.Uuid)
	}

	srcHash := from.GetStringMeta(common.MetaNamespaceHash)
	if srcHash != "" {
		requestData.SetMeta(common.MetaNamespaceHash, srcHash)
	}
	i, e := m.Next.CopyObject(ctx, from, to, requestData)
	if e != nil {
		return i, e
	}

	// For struct, update now. For Flat, it should be handled below
	if srcHash != "" {
		if move {
			// Move: update initial node meta
			nodes.MustCoreMetaSet(ctx, from.Uuid, common.MetaNamespaceHash, srcHash)
		} else {
			// Copy: update new node meta - Get uuid from node or from request.Metadata
			tu := to.Uuid
			if mm, ok := requestData.Metadata[common.XAmzMetaNodeUuid]; ok && mm != "" {
				tu = mm
			}
			nodes.MustCoreMetaSet(ctx, tu, common.MetaNamespaceHash, srcHash)
		}
	}

	return i, e
}

// CreateNode optionally replaces ETag value with the custom x-cells-hash metadata
func (m *HashHandler) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...grpc.CallOption) (*tree.CreateNodeResponse, error) {
	resp, e := m.Next.CreateNode(ctx, in, opts...)
	if m.hashesAsETags && e == nil && resp != nil {
		m.hashAsETag(resp.Node)
	}
	return resp, e
}

// ReadNode optionally replaces ETag value with the custom x-cells-hash metadata
func (m *HashHandler) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...grpc.CallOption) (*tree.ReadNodeResponse, error) {
	r, e := m.Next.ReadNode(ctx, in, opts...)
	if m.hashesAsETags && e == nil && r != nil {
		m.hashAsETag(r.Node)
	}
	return r, e
}

// UpdateNode optionally replaces ETag value with the custom x-cells-hash metadata
func (m *HashHandler) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...grpc.CallOption) (*tree.UpdateNodeResponse, error) {
	r, e := m.Next.UpdateNode(ctx, in, opts...)
	if m.hashesAsETags && e == nil && r != nil {
		m.hashAsETag(r.Node)
	}
	return r, e
}

// ListNodes optionally replaces ETag value with the custom x-cells-hash metadata
func (m *HashHandler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...grpc.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	stream, e := m.Next.ListNodes(ctx, in, opts...)
	if !m.hashesAsETags || e != nil {
		return stream, e
	}
	s := nodes.NewWrappingStreamer(stream.Context())
	go func() {
		defer s.CloseSend()
		for {
			resp, err := stream.Recv()
			if err != nil {
				if err != io.EOF && err != io.ErrUnexpectedEOF {
					_ = s.SendError(err)
				}
				break
			}
			if resp == nil {
				continue
			}
			m.hashAsETag(resp.Node)
			_ = s.Send(resp)
		}
	}()
	return s, nil

}

// StreamChanges optionally replaces ETag value with the custom x-cells-hash metadata
func (m *HashHandler) StreamChanges(ctx context.Context, in *tree.StreamChangesRequest, opts ...grpc.CallOption) (tree.NodeChangesStreamer_StreamChangesClient, error) {
	stream, e := m.Next.StreamChanges(ctx, in, opts...)
	if !m.hashesAsETags || e != nil {
		return stream, e
	}
	s := nodes.NewChangesWrappingStreamer(stream.Context())
	go func() {
		defer s.CloseSend()
		for {
			resp, err := stream.Recv()
			if err != nil {
				if err != io.EOF && err != io.ErrUnexpectedEOF {
					_ = s.SendError(err)
				}
				break
			}
			if resp == nil {
				continue
			}
			m.hashAsETag(resp.Target)
			m.hashAsETag(resp.Source)
			_ = s.Send(resp)
		}
	}()
	return s, nil
}

// getPartsCache initializes a cache for multipart hashes
func (m *HashHandler) getPartsCache() (c cache.Cache, e error) {
	m.partsCacheOnce.Do(func() {
		if c, e = cache.OpenCache(context.Background(), runtime.CacheURL("partshasher", "evictionTime", "24h", "cleanWindow", "24h")); e == nil {
			m.partsCache = c
		}
	})
	return m.partsCache, e
}

// clearMultipartCachedHashes removes any stored parts from the cache
func (m *HashHandler) clearMultipartCachedHashes(uploadID string) {
	c, e := m.getPartsCache()
	if e != nil {
		return
	}
	prefix := "multipart:" + uploadID + ":"
	if kk, e := c.KeysByPrefix(prefix); e == nil {
		for _, k := range kk {
			_ = c.Delete(k)
		}
	}
}

// computeMultipartFinalHash retrieves all parts from the cache and compute the final value.
// Todo : it could be used to also verify that parts have the correct size
func (m *HashHandler) computeMultipartFinalHash(uploadID string, partsNumber int) (string, error) {

	c, e := m.getPartsCache()
	if e != nil {
		return "", errors2.Wrap(e, "cannot initialize cache")
	}
	prefix := "multipart:" + uploadID + ":"
	kk, e := c.KeysByPrefix(prefix)
	if e != nil {
		return "", errors2.Wrap(e, "cannot read keys from cache")
	}
	parts := map[int][]string{}
	for _, k := range kk {
		var hh []byte
		if c.Get(k, &hh) {
			// Read key
			partName, _ := strconv.Atoi(strings.TrimPrefix(k, prefix))
			parts[partName-1] = strings.Split(string(hh), ":")
			// Clear key now
			_ = c.Delete(k)
		}
	}
	if len(parts) != partsNumber {
		return "", errors2.Wrap(e, "cache does not contain the correct number of parts")
	}
	summer := simd.MD5()
	for i := 0; i < partsNumber; i++ {
		ha, ok := parts[i]
		if !ok {
			return "", fmt.Errorf("missing hash for part %d", i)
		}
		for _, h := range ha {
			bb, _ := hex.DecodeString(h)
			summer.Write(bb)
		}
	}
	return hex.EncodeToString(summer.Sum(nil)), nil
}

// hashAsETag replaces node.ETag with node.MetaStore["x-cells-hash"] value if it is found
func (m *HashHandler) hashAsETag(n *tree.Node) {
	if n == nil {
		return
	}
	if h := n.GetStringMeta(common.MetaNamespaceHash); h != "" {
		n.MustSetMeta("StorageETag", n.Etag)
		n.Etag = h
	}
}

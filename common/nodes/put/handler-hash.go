package put

import (
	"context"
	"encoding/hex"
	"fmt"
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
		options.Wrappers = append(options.Wrappers, &HashHandler{})
	}
}

var HashFunc = func() hash.Hash {
	return hasher.NewBlockHash(simd.MD5(), hasher.DefaultBlockSize)
}

// HashHandler wraps input readers to compute custom Hash on the fly
type HashHandler struct {
	abstract.Handler
	partsCache     cache.Cache
	partsCacheOnce sync.Once
}

func (m *HashHandler) Adapt(c nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	m.AdaptOptions(c, options)
	return m
}

// getPartsCache initializes a cache for multipart hashes
func (m *HashHandler) getPartsCache() (c cache.Cache, e error) {
	m.partsCacheOnce.Do(func() {
		if c, e = cache.OpenCache(context.Background(), runtime.CacheURL()+"/partshasher?evictionTime=24h&cleanWindow=24h"); e == nil {
			m.partsCache = c
		}
	})
	return m.partsCache, e
}

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
	reader = hasher.Tee(reader, HashFunc, completeFunc)
	return m.Next.PutObject(ctx, node, reader, requestData)

}

func (m *HashHandler) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *models.PutRequestData) (models.MultipartObjectPart, error) {

	partID := strconv.Itoa(partNumberMarker)
	c, e := m.getPartsCache()
	if e != nil {
		return models.MultipartObjectPart{}, e
	}
	reader = hasher.Tee(reader, HashFunc, func(s string, hashes [][]byte) {
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

func (m *HashHandler) MultipartAbort(ctx context.Context, target *tree.Node, uploadID string, requestData *models.MultipartRequestData) error {
	go m.clearMultipartCachedHashes(uploadID)
	return m.Next.MultipartAbort(ctx, target, uploadID, requestData)
}

func (m *HashHandler) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (models.ObjectInfo, error) {

	// TODO Move that in the "previous" layer?
	if !requestData.IsMove() && !nodes.IsFlatStorage(ctx, "to") {
		// Ensure target UUID is set
		to.RenewUuidIfEmpty(false)
		requestData.SetMeta(common.XAmzMetaNodeUuid, to.Uuid)
		fmt.Println("--- RenewUUID", to.Uuid)
	}

	var srcHash string
	if nodes.IsFlatStorage(ctx, "from") {
		srcHash = from.Etag
	} else {
		srcHash = from.GetStringMeta(common.MetaNamespaceHash)
	}
	if srcHash != "" {
		fmt.Println("--- Adding Hash to requestMeta", srcHash)
		requestData.SetMeta(common.MetaNamespaceHash, srcHash)
	}
	i, e := m.Next.CopyObject(ctx, from, to, requestData)
	if e != nil {
		return i, e
	}

	// For struct, update now. For Flat, it should be handled below
	if srcHash != "" && !nodes.IsFlatStorage(ctx, "to") {
		if requestData.IsMove() {
			// Move: update initial node meta
			nodes.MustCoreMetaSet(ctx, from.Uuid, common.MetaNamespaceHash, srcHash)
		} else {
			// Copy: update new node meta
			nodes.MustCoreMetaSet(ctx, to.Uuid, common.MetaNamespaceHash, srcHash)
		}
	}

	return i, e
}

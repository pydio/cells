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

package bleve

import (
	"context"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	bleve "github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/index/scorch"
	"github.com/blevesearch/bleve/v2/index/upsidedown/store/boltdb"
	"github.com/blevesearch/bleve/v2/mapping"
	"github.com/blevesearch/bleve/v2/search/query"
	index "github.com/blevesearch/bleve_index_api"
	"github.com/rs/xid"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/storage/indexer"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/filesystem"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

const (
	BufferedChanSize = 10000
	MinRotationSize  = 68 * 1024
)

// Indexer is the syslog specific implementation of the Log server
type Indexer struct {
	conf *BleveConfig

	indexes []bleve.Index

	codec          indexer.IndexCodex
	serviceConfigs config.Store

	closed bool

	statusInput chan map[string]interface{}
	debouncer   func(func())
	metricsName string
}

// NewIndexer creates and configures a default Bleve instance to store technical logs
// Setting rotationSize to -1 fully disables rotation
func newBleveIndexer(conf *BleveConfig) (*Indexer, error) {
	if conf.RotationSize > -1 && conf.RotationSize < MinRotationSize {
		return nil, errors.WithMessagef(errors.DAO, "use a rotation size bigger than %d", MinRotationSize)
	}

	idx := &Indexer{
		conf: conf,
	}

	dir, prefix := filepath.Split(conf.BlevePath)
	indexes, err := idx.openAllIndexes(dir, prefix, conf.MappingName)
	if err != nil {
		return nil, err
	}

	idx.indexes = indexes

	return idx, nil
}

func (s *Indexer) Init(ctx context.Context, conf configx.Values) error {
	return nil
}

func (s *Indexer) Name() string {
	return "bleve"
}

func (s *Indexer) ID() string {
	return uuid.New()
}

func (s *Indexer) Metadata() map[string]string {
	return map[string]string{}
}

func (s *Indexer) MustBleveConfig(ctx context.Context) *BleveConfig {
	return s.conf
}

func (s *Indexer) As(i interface{}) bool {
	//if sw, ok := i.(*registry.StatusReporter); ok {
	//	*sw = s
	//	return true
	//}
	return false
}

//func (s *Indexer) WatchStatus() (registry.StatusWatcher, error) {
//	if s.debouncer == nil {
//		s.debouncer = debounce.New(5 * time.Second)
//		s.statusInput = make(chan map[string]interface{})
//	}
//	w := util.NewChanStatusWatcher(s, s.statusInput)
//	tick := time.NewTicker(time.Duration(10+rand.Intn(11)) * time.Second)
//	go func() {
//		s.sendStatus()
//		for range tick.C {
//			s.updateStatus()
//		}
//	}()
//	return w, nil
//}
//
//func (s *Indexer) sendStatus() {
//	m := map[string]interface{}{
//		"Indexes": s.listIndexes(),
//	}
//	if u, e := indexDiskUsage(filepath.Dir(s.MustBleveConfig(context.Background()).BlevePath)); e == nil {
//		metrics.GetMetrics().Tagged(map[string]string{"dsn": s.conf.BlevePath}).Gauge("bleve_usage").Update(float64(u))
//		m["Usage"] = u
//	}
//	s.statusInput <- m
//}
//
//func (s *Indexer) updateStatus() {
//	if s.debouncer == nil {
//		return
//	}
//	go s.debouncer(func() {
//		if s != nil {
//			s.sendStatus()
//		}
//	})
//}

// Stats implements DAO method by listing closed indexes and documents counts
func (s *Indexer) Stats(ctx context.Context) map[string]interface{} {
	m := map[string]interface{}{
		"indexes": s.listIndexes(s.getPath(ctx), s.getPrefix(ctx)),
	}
	if si, e := s.getSearchIndex(ctx); e == nil {
		if count, e := si.DocCount(); e == nil {
			m["docsCount"] = count
		}
	}
	return m
}

// Open lists all existing indexes and creates a writeable index on the active one
// and a composed index for searching. It calls watchInserts() to start watching for
// new logs
//func (s *Indexer) Open(ctx context.Context) error {
//
//	conf := s.MustBleveConfig(ctx)
//
//	mappingName := conf.MappingName
//
//	if cfg := servercontext.GetConfig(ctx); cfg != nil {
//		s.serviceConfigs = servercontext.GetConfig(ctx).Val()
//	}
//
//	found := false
//	for _, existingPath := range s.listIndexes(ctx) {
//		if existingPath == prefix {
//			found = true
//		}
//	}
//
//	if !found {
//		index, err := s.openOneIndex(path, mappingName)
//		if err != nil {
//			return err
//		}
//
//		s.searchIndex.Add(index)
//	}
//
//	s.closed = true
//
//	return nil
//}

func (s *Indexer) getFullPath(path string, prefix string, rotationID string) string {
	fp := filepath.Join(path, prefix)
	if rotationID != "" {
		fp += "." + rotationID
	}
	return fp
}

func (s *Indexer) getPrefix(ctx context.Context) string {
	return filepath.Base(s.conf.BlevePath)
}

func (s *Indexer) getPath(ctx context.Context) string {
	return filepath.Dir(s.conf.BlevePath)
}

func (s *Indexer) Close(ctx context.Context) error {
	if s.closed {
		return nil
	}
	s.closed = true
	var errs []error
	for _, id := range s.indexes {
		if er := id.Close(); er != nil {
			errs = append(errs, er)
		} else {
			//fmt.Println("Closed " + id.Name())
		}
	}
	return errors.Join(errs...)
}

// CloseAndDrop implements storage.Dropper
func (s *Indexer) CloseAndDrop(ctx context.Context) error {
	if s.closed {
		return nil
	}
	s.closed = true
	var errs []error
	// Copy indexes refs and close everything
	var indexesPaths []string
	for _, i := range s.indexes {
		indexesPaths = append(indexesPaths, i.Name())
	}
	if er := s.Close(ctx); er != nil {
		return er
	}
	for _, ip := range indexesPaths {
		fmt.Println("Removing Bleve Index", ip)
		if err := os.RemoveAll(ip); err != nil {
			errs = append(errs, err)
		}
	}
	return errors.Join(errs...)
}

func (s *Indexer) InsertOne(ctx context.Context, data any) error {
	var msg any
	if s.codec != nil {
		if m, err := s.codec.Marshal(data); err != nil {
			return err
		} else {
			msg = m
		}
	} else {
		msg = data
	}

	writeIndex, err := s.getWriteIndex(ctx)
	if err != nil {
		return err
	}
	var id string
	if provider, ok := data.(indexer.IndexIDProvider); ok {
		id = provider.IndexID()
	} else {
		id = xid.New().String()
	}
	return writeIndex.Index(id, msg)
}

func (s *Indexer) DeleteOne(ctx context.Context, data interface{}) error {
	writeIndex, err := s.getWriteIndex(ctx)
	if err != nil {
		return err
	}

	id, ok := data.(string)
	if !ok {
		return errors.WithMessage(errors.InvalidParameters, "id is missing")
	}

	return writeIndex.Delete(id)
}

func (s *Indexer) checkRotate(ctx context.Context) bool {
	if s.conf.RotationSize == -1 {
		return false
	}

	writeIndex, err := s.getWriteIndex(ctx)
	if err != nil {
		return false
	}

	du, err := filesystem.RecursiveDiskUsage(writeIndex.Name())
	if err != nil {
		return false
	}

	return du > s.conf.RotationSize
}

func (s *Indexer) DeleteMany(ctx context.Context, qu interface{}) (int32, error) {
	var q query.Query
	var str string
	var ok bool
	if str, ok = qu.(string); !ok {
		return 0, errors.WithMessage(errors.DAO, "DeleteMany expects a query string")
	} else if str == "" {
		return 0, errors.WithMessage(errors.DAO, "cannot pass an empty query for deletion")
	}
	q = bleve.NewQueryStringQuery(str)
	req := bleve.NewSearchRequest(q)
	req.Size = 10000
	var count int32

	idx, err := s.getWriteIndex(ctx)
	if err != nil {
		return 0, err
	}
	for {
		sr, err := idx.SearchInContext(ctx, req)
		if err != nil {
			return 0, err
		}
		b := idx.NewBatch()
		for _, hit := range sr.Hits {
			b.Delete(hit.ID)
			count++
		}
		if err := idx.Batch(b); err != nil {
			return count, err
		}
		if sr.Total <= uint64(req.Size) {
			break
		}
	}

	return count, nil
}

func (s *Indexer) Count(ctx context.Context, qu interface{}) (int, error) {

	r, ok := qu.(*bleve.SearchRequest)
	if !ok {
		return 0, errors.WithMessage(errors.InvalidParameters, "count expects a search request")
	}

	si, err := s.getSearchIndex(ctx)
	if err != nil {
		return 0, err
	}

	sr, err := si.SearchInContext(ctx, r)
	if err != nil {
		return 0, err
	}

	return int(sr.Total), nil
}

func (s *Indexer) Search(ctx context.Context, qu *bleve.SearchRequest, res *[]index.Document) error {
	if s.conf.RotationSize > -1 {
		return errors.WithMessage(errors.DAO, "Indexer.Search cannot be used on auto-rotating indexes, use FindMany instead")
	}

	si, err := s.getSearchIndex(ctx)
	if err != nil {
		return err
	}

	sr, err := si.SearchInContext(ctx, qu)
	if err != nil {
		return err
	}

	for _, hit := range sr.Hits {
		doc, err := si.Document(hit.ID)
		if err != nil {
			return err
		}

		*res = append(*res, doc)
	}

	return nil
}

func (s *Indexer) FindMany(ctx context.Context, qu interface{}, offset, limit int32, sortFields string, sortDesc bool, customCodec indexer.IndexCodex) (chan interface{}, error) {
	codec := s.GetCodex()
	if customCodec != nil {
		codec = customCodec
	}
	var request *bleve.SearchRequest
	if codec == nil {
		var q query.Query
		var str string
		var ok bool
		if bq, o1 := qu.(query.Query); o1 {
			q = bq
		} else if str, ok = qu.(string); !ok {
			return nil, errors.WithMessage(errors.DAO, "FindMany expects a query string")
		} else if str == "" {
			return nil, errors.WithMessage(errors.DAO, "cannot pass an empty query for deletion")
		} else {
			q = bleve.NewQueryStringQuery(str)
		}
		request = bleve.NewSearchRequest(q)
		request.From = int(offset)
		request.Size = int(limit)
		if sortFields != "" {
			if sortDesc {
				request.SortBy([]string{"-" + sortFields})
			} else {
				request.SortBy([]string{sortFields})
			}
		}
	} else {
		if r, _, err := codec.BuildQuery(qu, offset, limit, sortFields, sortDesc); err != nil {
			return nil, err
		} else {
			if req, ok := r.(*bleve.SearchRequest); !ok {
				return nil, errors.WithMessage(errors.DAO, "Unrecognized searchRequest type")
			} else {
				request = req
			}
		}
	}

	si, err := s.getSearchIndex(ctx)
	if err != nil {
		return nil, err
	}
	sr, er := si.SearchInContext(ctx, request)
	if er != nil {
		return nil, er
	}
	cRes := make(chan interface{})

	go func() {
		defer close(cRes)
		// Send hits
		for _, hit := range sr.Hits {
			if codec != nil {
				if result, err := codec.Unmarshal(hit); err == nil {
					cRes <- result
				}
			} else {
				cRes <- hit
			}
		}
		//Parse & send facets
		if fParser, ok := codec.(indexer.FacetParser); ok {
			for _, facet := range sr.Facets {
				fParser.UnmarshalFacet(facet, cRes)
			}
		}
	}()
	return cRes, nil
}

func (s *Indexer) rotate(ctx context.Context) error {
	path := s.getPath(ctx)
	prefix := s.getPrefix(ctx)
	rotationID := s.getNextRotationID(filepath.Join(path, prefix))
	currentPath := s.getFullPath(path, prefix, rotationID)

	idx, err := s.openOneIndex(currentPath, s.conf.MappingName)
	if err != nil {
		return err
	}

	s.indexes = append(s.indexes, idx)

	return nil
}

func (s *Indexer) GetCodex() indexer.IndexCodex {
	return s.codec
}

func (s *Indexer) SetCodex(c indexer.IndexCodex) {
	s.codec = c
}

//func (s *Indexer) getWriteIndex() bleve.Index {
//
//	if s.cursor == -1 || len(s.indexes) < s.cursor-1 {
//		// Use a no-op, in-memory index to avoid crashes
//		fmt.Println("[ERROR] Cannot find an available index for writing, entries will be logged in memory")
//		fmt.Println("[ERROR] This should not happen and may indicate a missing MaxConcurrency=1 on the Truncate Logs flow.")
//		fmt.Println("[ERROR] Make sure to fix it and restart if necessary.")
//		idx, _ := s.openOneIndex("", s.MustBleveConfig(context.Background()).MappingName)
//		return idx
//	}
//
//	return s.indexes[s.cursor]
//}

func (s *Indexer) getWriteIndex(ctx context.Context) (bleve.Index, error) {
	path := s.getPath(ctx)
	prefix := s.getPrefix(ctx)
	//rotationID := s.getRotationID(filepath.Join(path, prefix))
	fullPath := filepath.Join(path, prefix) // s.getFullPath(path, prefix, rotationID)

	var indexes []bleve.Index
	for _, idx := range s.indexes {
		if strings.HasPrefix(idx.Name(), fullPath) {
			indexes = append(indexes, idx)
		}
	}

	if len(indexes) < 1 {
		idx, err := s.openOneIndex(fullPath, s.conf.MappingName)
		if err != nil {
			return nil, err
		}
		s.indexes = append(s.indexes, idx)
		return idx, err
	}

	return indexes[len(indexes)-1], nil
}

func (s *Indexer) getSearchIndex(ctx context.Context) (bleve.Index, error) {
	path := s.getPath(ctx)
	prefix := s.getPrefix(ctx)
	fullPath := s.getFullPath(path, prefix, "")

	var indexes []bleve.Index
	for _, idx := range s.indexes {
		if strings.HasPrefix(idx.Name(), fullPath) {
			indexes = append(indexes, idx)
		}
	}

	if len(indexes) == 0 {
		if s.conf.RotationSize > 0 {
			if s.checkRotate(ctx) {
				if err := s.rotate(ctx); err != nil {
					return nil, err
				}
			}
		} else {
			ix, e := s.openOneIndex(fullPath, s.conf.MappingName)
			if e != nil {
				return nil, e
			}
			s.indexes = append(s.indexes, ix)
			return ix, e
		}

		return s.getSearchIndex(ctx)
	}

	return bleve.NewIndexAlias(indexes...), nil
}

func (s *Indexer) getNextRotationID(prefix string) string {
	count := 0
	for _, idx := range s.indexes {
		if strings.HasPrefix(idx.Name(), prefix) {
			count += 1
		}
	}

	return fmt.Sprintf("%04d", count)
}

func (s *Indexer) getRotationID(prefix string) string {
	count := 0
	for _, idx := range s.indexes {
		if strings.HasPrefix(idx.Name(), prefix) {
			count += 1
		}
	}

	return fmt.Sprintf("%04d", int(math.Max(float64(count-1), 0)))
}

// Resync creates a copy of current index. It has been originally used for switching analyze format from bleve to scorch.
func (s *Indexer) Resync(ctx context.Context, logger func(string)) error {

	//path := s.getPath(ctx)
	//prefix := s.getPrefix(ctx)
	// fullPath := s.getFullPath(path, prefix, "")

	copyDir := filepath.Join(s.getPath(ctx), uuid.New())
	e := os.Mkdir(copyDir, 0777)
	if e != nil {
		return e
	}
	defer func() {
		_ = os.RemoveAll(copyDir)
	}()
	copyPath := filepath.Join(copyDir, s.getPrefix(ctx))

	conf := &BleveConfig{
		BlevePath:    copyPath,
		MappingName:  s.conf.MappingName,
		RotationSize: s.conf.RotationSize,
		BatchSize:    s.conf.BatchSize,
	}

	dup := &Indexer{
		conf: conf,
	}
	dup.SetCodex(s.codec)

	logger("Listing Index inside new one")

	q := bleve.NewMatchAllQuery()
	req := bleve.NewSearchRequest(q)
	req.Size = 5000
	page := 0

	b, err := dup.NewBatch(ctx, indexer.WithErrorHandler(func(err error) {
		logger("Batch error during index replication: " + err.Error())
	}))
	if err != nil {
		return err
	}

	for {

		logger(fmt.Sprintf("Reindexing logs from page %d", page))
		req.From = page * req.Size
		req.Fields = []string{"*"}
		idx, err := s.getSearchIndex(ctx)
		if err != nil {
			return err
		}
		sr, err := idx.SearchInContext(ctx, req)
		if err != nil {
			return err
		}
		for _, hit := range sr.Hits {
			um, e := s.codec.Unmarshal(hit)
			if e != nil {
				continue
			}
			mu, e := s.codec.Marshal(um)
			if e != nil {
				continue
			}
			_ = b.Insert(mu)
		}
		if sr.Total <= uint64((page+1)*req.Size) {
			break
		}
		page++

	}
	if er := b.Flush(); er != nil {
		return er
	}
	if er := s.Close(ctx); er != nil {
		return er
	}
	if er := dup.Close(ctx); er != nil {
		return er
	}
	<-time.After(5 * time.Second) // Make sure original is closed

	logger("Removing old indexes")
	// Copy indexes refs and close everything
	var indexesPaths []string
	for _, i := range s.indexes {
		indexesPaths = append(indexesPaths, i.Name())
	}
	if er := s.Close(ctx); er != nil {
		return er
	}
	for _, ip := range indexesPaths {
		if err = os.RemoveAll(ip); err != nil {
			return err
		} else {
			logger(" - Removed " + ip)
		}
	}
	logger("Moving new indexes") // temp folder is removed at defer
	dupIdx := dup.listIndexes(dup.getPath(ctx), dup.getPrefix(ctx))
	if er := dup.Close(ctx); er != nil {
		return er
	}
	for _, ip := range dupIdx {
		src := filepath.Join(dup.getPath(ctx), ip)
		target := filepath.Join(s.getPath(ctx), ip)
		if err := os.Rename(src, target); err != nil {
			return err
		} else {
			logger(" - Moved " + src + " to " + target)
		}
	}

	// Replace to original bleve path
	logger("Resync operation done, replacing current receiver with dup")
	reopen, er := newBleveIndexer(s.conf)
	if er != nil {
		return er
	}
	*s = *reopen

	return nil

}

// Truncate gathers size of existing indexes, starting from last. When max is reached
// it starts deleting all previous indexes.
func (s *Indexer) Truncate(ctx context.Context, max int64, logger func(string)) error {
	if max == 0 {
		path := s.getPath(ctx)
		prefix := s.getPrefix(ctx)
		fullPath := s.getFullPath(path, prefix, "")

		for _, idx := range s.indexes {
			if strings.HasPrefix(idx.Name(), fullPath) {
				if er := s.Close(ctx); er != nil {
					return er
				}
				logger(" - Remove " + idx.Name())
				if er := os.RemoveAll(idx.Name()); er != nil {
					return er
				}
			}
		}
		s.indexes = []bleve.Index{}

		return nil
	}

	path := s.getPath(ctx)
	prefix := s.getPrefix(ctx)
	fullPath := s.getFullPath(path, prefix, "")

	var total int64
	var remove bool

	logger("Start purging old files")
	for _, idx := range s.indexes {
		if strings.HasPrefix(idx.Name(), fullPath) {
			if remove {
				e := os.RemoveAll(idx.Name())
				if e != nil {
					logger(fmt.Sprintf("cannot remove index %s", idx.Name()))
				}
			} else if u, e := filesystem.RecursiveDiskUsage(idx.Name()); e == nil {
				total += u
				remove = total > max
			}
		}
	}

	// Now restart - it will renumber files
	return s.rotate(ctx)

	//logger("Re-opening log server")
	//if er := s.Open(ctx); er != nil {
	//	return er
	//}
	//logger("Truncate operation done")

	//s.updateStatus()
}

func (s *Indexer) listIndexes(path string, prefix string) (paths []string) {
	files, err := os.ReadDir(path)
	if err != nil {
		return
	}
	for _, file := range files {
		if file.IsDir() && strings.HasPrefix(file.Name(), prefix) {
			paths = append(paths, file.Name())
		}
	}
	sort.Strings(paths)
	return
}

func (s *Indexer) openAllIndexes(dir, prefix, mappingName string) ([]bleve.Index, error) {
	var indexes []bleve.Index

	for _, fName := range s.listIndexes(dir, prefix) {
		idx, err := s.openOneIndex(filepath.Join(dir, fName), mappingName)
		if err != nil {
			return nil, err
		}

		indexes = append(indexes, idx)
	}

	return indexes, nil
}

// openOneIndex tries to open an existing index at a given path, or creates a new one
func (s *Indexer) openOneIndex(fullPath string, mappingName string) (bleve.Index, error) {

	idx, err := bleve.Open(fullPath)
	if err != nil {
		indexMapping := bleve.NewIndexMapping()
		if s.codec != nil {
			var val configx.Values
			if s.serviceConfigs != nil {
				val = s.serviceConfigs.Val()
			}
			if model, ok := s.codec.GetModel(val); ok {
				if docMapping, ok := model.(*mapping.DocumentMapping); ok {
					indexMapping.AddDocumentMapping(mappingName, docMapping)
				}
			}
		}

		// Creates the new index and initializes the server
		if fullPath == "" {
			idx, err = bleve.NewMemOnly(indexMapping)
		} else {
			//			fmt.Println("*** Opening New Index", fullPath)
			idx, err = bleve.NewUsing(fullPath, indexMapping, scorch.Name, boltdb.Name, nil)
		}
		if err != nil {
			log.Logger(runtime.AsCoreContext(context.Background())).Error("Cannot open index on " + fullPath)
			return nil, err
		}
	}

	return idx, nil
}

func (s *Indexer) NewBatch(ctx context.Context, opts ...indexer.BatchOption) (indexer.Batch, error) {
	index, err := s.getWriteIndex(ctx)
	if err != nil {
		return nil, err
	}

	indexAlias := bleve.NewIndexAlias(index)
	batch := indexAlias.NewBatch()

	// Check if the index need to be rotated once we flushed the operations
	opts = append(opts,
		indexer.WithFlushCondition(func() bool {
			return batch.Size() > int(s.conf.BatchSize)
		}),
		indexer.WithInsertCallback(func(data any) error {
			var id string
			if provider, ok := data.(indexer.IndexIDProvider); ok {
				id = provider.IndexID()
			} else {
				id = xid.New().String()
			}
			var msg any
			if s.codec != nil {
				if m, err := s.codec.Marshal(data); err != nil {
					return err
				} else {
					msg = m
				}
			} else {
				msg = data
			}
			if err := batch.Index(id, msg); err != nil {
				return err
			}

			return nil
		}),
		indexer.WithDeleteCallback(func(msg any) error {
			id, ok := msg.(string)
			if !ok {
				return errors.WithStack(errors.InvalidParameters)
			}

			batch.Delete(id)

			return nil
		}),
		indexer.WithFlushCallback(func() error {
			if err := index.Batch(batch); err != nil {
				return err
			}

			batch.Reset()

			if s.checkRotate(ctx) {
				_ = s.rotate(ctx)

				newIndex, err := s.getWriteIndex(ctx)
				if err != nil {
					return err
				}

				indexAlias.Swap([]bleve.Index{newIndex}, []bleve.Index{index})
				index = newIndex
			}

			return nil
		}))

	o := &indexer.BatchOptions{}
	for _, opt := range opts {
		opt(o)
	}

	return indexer.NewBatch(ctx, opts...), nil
}

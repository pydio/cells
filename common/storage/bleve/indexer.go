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
	"errors"
	"fmt"
	"math"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"
	"sync"

	bleve "github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/index/scorch"
	"github.com/blevesearch/bleve/v2/index/upsidedown/store/boltdb"
	"github.com/blevesearch/bleve/v2/mapping"
	"github.com/blevesearch/bleve/v2/search/query"
	"github.com/rs/xid"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/storage/indexer"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

const (
	BufferedChanSize = 10000
	MinRotationSize  = 68 * 1024
)

// Indexer is the syslog specific implementation of the Log server
type Indexer struct {
	conf *BleveConfig

	indexes []bleve.Index

	crtBatch    *bleve.Batch
	flushLock   *sync.Mutex
	inserts     chan interface{}
	deletes     chan interface{}
	forceFlush  chan bool
	insertsDone chan bool

	codec          indexer.IndexCodex
	serviceConfigs config.Store

	opened bool

	statusInput chan map[string]interface{}
	debouncer   func(func())
	metricsName string
}

func (s *Indexer) Open(ctx context.Context) error {
	//TODO implement me
	panic("implement me")
}

// NewIndexer creates and configures a default Bleve instance to store technical logs
// Setting rotationSize to -1 fully disables rotation
func newBleveIndexer(conf *BleveConfig) (*Indexer, error) {
	if conf.RotationSize > -1 && conf.RotationSize < MinRotationSize {
		return nil, fmt.Errorf("use a rotation size bigger than %d", MinRotationSize)
	}

	indexer := &Indexer{
		conf:        conf,
		inserts:     make(chan interface{}, BufferedChanSize),
		deletes:     make(chan interface{}, BufferedChanSize),
		insertsDone: make(chan bool),
		flushLock:   &sync.Mutex{},
		forceFlush:  make(chan bool, 1),
	}

	indexes, err := indexer.openAllIndex(conf.BlevePath, conf.MappingName)
	if err != nil {
		return nil, err
	}

	indexer.indexes = indexes

	return indexer, nil
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

// Stats implements DAO method by listing opened indexes and documents counts
//func (s *Indexer) Stats() map[string]interface{} {
//	m := map[string]interface{}{
//		"indexes": s.listIndexes(),
//	}
//	if count, e := s.searchIndex.DocCount(); e == nil {
//		m["docsCount"] = count
//	}
//	return m
//}

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
//	s.opened = true
//
//	return nil
//}

func (s *Indexer) getFullPath(path string, prefix string, rotationID string) string {
	builder := strings.Builder{}

	builder.WriteString(path)
	builder.WriteString("/")
	builder.WriteString(prefix)

	if rotationID != "" {
		builder.WriteString(".")
		builder.WriteString(rotationID)
	}

	return builder.String()
}

func (s *Indexer) getPrefix(ctx context.Context) string {
	return path.Base(s.conf.BlevePath)
	//prefix := ctx.Value("prefix").(*template.Template)
	//
	//prefixBuilder := &strings.Builder{}
	//if err := prefix.Execute(prefixBuilder, struct {
	//	Ctx context.Context
	//}{
	//	Ctx: ctx,
	//}); err != nil {
	//	return ""
	//}
	//
	//if prefixBuilder.Len() == 0 {
	//	return ""
	//}
	//
	//return prefixBuilder.String()
}

func (s *Indexer) getPath(ctx context.Context) string {
	return s.conf.BlevePath
}

func (s *Indexer) Close(ctx context.Context) error {
	if !s.opened {
		return nil
	}
	s.opened = false
	close(s.insertsDone)
	close(s.inserts)
	close(s.deletes)
	close(s.forceFlush)
	return nil
}

func (s *Indexer) InsertOne(ctx context.Context, data interface{}) error {
	msg, er := s.codec.Marshal(data)
	if er != nil {
		return er
	}
	index, err := s.getWriteIndex(ctx)
	if err != nil {
		return err
	}
	var id string
	if provider, ok := data.(indexer.IndexIDProvider); ok {
		id = provider.IndexID()
	} else {
		id = xid.New().String()
	}
	return index.Index(id, msg)
}

func (s *Indexer) DeleteOne(ctx context.Context, data interface{}) error {
	index, err := s.getWriteIndex(ctx)
	if err != nil {
		return err
	}

	id, ok := data.(string)
	if ok {
		return errors.New("id is missing")
	}

	return index.Delete(id)
}

func (s *Indexer) checkRotate(ctx context.Context) bool {
	if s.conf.RotationSize == -1 {
		return false
	}

	index, err := s.getWriteIndex(ctx)
	if err != nil {
		return false
	}

	du, err := indexDiskUsage(index.Name())
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
		return 0, fmt.Errorf("DeleteMany expects a query string")
	} else if str == "" {
		return 0, fmt.Errorf("cannot pass an empty query for deletion")
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
			fmt.Println(err)
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
		if str, ok = qu.(string); !ok {
			return nil, fmt.Errorf("FindMany expects a query string")
		} else if str == "" {
			return nil, fmt.Errorf("cannot pass an empty query for deletion")
		}
		q = bleve.NewQueryStringQuery(str)
		request = bleve.NewSearchRequest(q)
	} else {

		if r, _, err := codec.BuildQuery(qu, offset, limit, sortFields, sortDesc); err != nil {
			return nil, err
		} else {
			if req, ok := r.(*bleve.SearchRequest); !ok {
				return nil, fmt.Errorf("Unrecognized searchRequest type")
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
		// Parse & send facets
		//if fParser, ok := codec.(FacetParser); ok {
		//	for _, facet := range sr.Facets {
		//		fParser.UnmarshalFacet(facet, cRes)
		//	}
		//}
	}()
	return cRes, nil
}

func (s *Indexer) rotate(ctx context.Context) error {
	path := s.getPath(ctx)
	prefix := s.getPrefix(ctx)
	rotationID := s.getNextRotationID(path + "/" + prefix)
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
	rotationID := s.getRotationID(path + "/" + prefix)
	fullPath := s.getFullPath(path, prefix, rotationID)
	fmt.Println("Write", fullPath)

	var indexes []bleve.Index
	for _, index := range s.indexes {
		if strings.HasPrefix(index.Name(), fullPath) {
			indexes = append(indexes, index)
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
	fmt.Println("Search", fullPath)

	var indexes []bleve.Index
	for _, index := range s.indexes {
		if strings.HasPrefix(index.Name(), fullPath) {
			indexes = append(indexes, index)
		}
	}

	if len(indexes) == 0 {
		if err := s.rotate(ctx); err != nil {
			return nil, err
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

	copyDir := filepath.Join(filepath.Dir(s.conf.BlevePath), uuid.New())
	e := os.Mkdir(copyDir, 0777)
	if e != nil {
		return e
	}
	defer func() {
		os.RemoveAll(copyDir)
	}()
	copyPath := filepath.Join(copyDir, filepath.Base(s.conf.BlevePath))

	var conf *BleveConfig
	*conf = *s.conf

	conf.BlevePath = copyPath

	dup := &Indexer{
		conf: conf,
	}
	dup.SetCodex(s.codec)
	dup.inserts = make(chan interface{}, BufferedChanSize)

	//er := dup.Open(ctx)
	//if er != nil {
	//	return er
	//}
	logger("Listing Index inside new one")

	q := bleve.NewMatchAllQuery()
	req := bleve.NewSearchRequest(q)
	req.Size = 5000
	page := 0

	b, err := dup.NewBatch(ctx)
	if err != nil {
		return err
	}

	for {

		logger(fmt.Sprintf("Reindexing logs from page %d\n", page))
		req.From = page * req.Size
		req.Fields = []string{"*"}
		idx, err := s.getSearchIndex(ctx)
		if err != nil {
			return err
		}
		sr, err := idx.SearchInContext(ctx, req)
		if err != nil {
			fmt.Println(err)
			return err
		}
		for _, hit := range sr.Hits {
			um, e := s.codec.Unmarshal(hit)
			if e != nil {
				fmt.Println(e)
				continue
			}
			mu, e := s.codec.Marshal(um)
			if e != nil {
				fmt.Println(e)
				continue
			}
			b.Insert(mu)
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
	// <-time.After(5 * time.Second) // Make sure original is closed

	//logger("Removing old indexes")
	//for _, ip := range s.listIndexes() {
	//	if err := os.RemoveAll(filepath.Join(filepath.Dir(s.indexPath), ip)); err != nil {
	//		return err
	//	}
	//}
	//logger("Moving new indexes")
	//for _, ip := range dup.listIndexes() {
	//	src := filepath.Join(copyDir, ip)
	//	target := filepath.Join(filepath.Join(filepath.Dir(s.indexPath), ip))
	//	if err := os.Rename(src, target); err != nil {
	//		return err
	//	}
	//}

	//logger("Restarting new mr")
	//if err := s.Open(ctx); err != nil {
	//	return err
	//}
	//logger("Resync operation done")

	//s.updateStatus()

	return nil

}

// Truncate gathers size of existing indexes, starting from last. When max is reached
// it starts deleting all previous indexes.
func (s *Indexer) Truncate(ctx context.Context, max int64, logger func(string)) error {
	if max == 0 {
		path := s.getPath(ctx)
		prefix := s.getPrefix(ctx)
		fullPath := s.getFullPath(path, prefix, "")

		for _, index := range s.indexes {
			if strings.HasPrefix(index.Name(), fullPath) {
				logger(" - Remove " + index.Name())
				if er := os.RemoveAll(index.Name()); er != nil {
					return er
				}
			}
		}

		return nil
	}

	path := s.getPath(ctx)
	prefix := s.getPrefix(ctx)
	fullPath := s.getFullPath(path, prefix, "")

	var total int64
	var remove bool

	logger("Start purging old files")
	for _, index := range s.indexes {
		if strings.HasPrefix(index.Name(), fullPath) {
			if remove {
				e := os.RemoveAll(index.Name())
				if e != nil {
					logger(fmt.Sprintf("cannot remove index %s", index.Name()))
				}
			} else if u, e := indexDiskUsage(index.Name()); e == nil {
				total += u
				remove = total > max
			}
		}
	}

	// Now restart - it will renumber files
	s.rotate(ctx)

	//logger("Re-opening log server")
	//if er := s.Open(ctx); er != nil {
	//	return er
	//}
	//logger("Truncate operation done")

	//s.updateStatus()

	return nil
}

func (s *Indexer) listIndexes(path string) (paths []string) {
	files, err := os.ReadDir(path)
	if err != nil {
		return
	}

	for _, file := range files {
		if !file.IsDir() {
			continue
		}

		paths = append(paths, file.Name())
	}

	sort.Strings(paths)

	return
}

func (s *Indexer) openAllIndex(blevePath string, mappingName string) ([]bleve.Index, error) {
	var indexes []bleve.Index

	for _, path := range s.listIndexes(blevePath) {
		idx, err := s.openOneIndex(blevePath+"/"+path, mappingName)
		if err != nil {
			return nil, err
		}

		indexes = append(indexes, idx)
	}

	return indexes, nil
}

// openOneIndex tries to open an existing index at a given path, or creates a new one
func (s *Indexer) openOneIndex(bleveIndexPath string, mappingName string) (bleve.Index, error) {

	index, err := bleve.Open(bleveIndexPath)
	if err != nil {
		indexMapping := bleve.NewIndexMapping()
		if s.codec != nil {
			if s.serviceConfigs != nil {
				if model, ok := s.codec.GetModel(s.serviceConfigs.Val()); ok {
					if docMapping, ok := model.(*mapping.DocumentMapping); ok {
						indexMapping.AddDocumentMapping(mappingName, docMapping)
					}
				}
			}
		}

		// Creates the new index and initializes the server
		if bleveIndexPath == "" {
			index, err = bleve.NewMemOnly(indexMapping)
		} else {
			index, err = bleve.NewUsing(bleveIndexPath, indexMapping, scorch.Name, boltdb.Name, nil)
		}
		if err != nil {
			return nil, err
		}
	}

	return index, nil
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
		indexer.WithInsertCallback(func(msg any) error {
			var id string
			if provider, ok := msg.(indexer.IndexIDProvider); ok {
				id = provider.IndexID()
			} else {
				id = xid.New().String()
			}

			if err := batch.Index(id, msg); err != nil {
				return err
			}

			return nil
		}),
		indexer.WithDeleteCallback(func(msg any) error {
			id, ok := msg.(string)
			if !ok {
				return errors.New("not a string")
			}

			batch.Delete(id)

			return nil
		}),
		indexer.WithFlushCallback(func() error {

			fmt.Println("Dowing batch")
			if err := index.Batch(batch); err != nil {
				return err
			}

			batch.Reset()

			if s.checkRotate(ctx) {
				s.rotate(ctx)

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

// indexDiskUsage is a simple implementation for computing directory size
func indexDiskUsage(currPath string) (int64, error) {
	var size int64

	files, err := os.ReadDir(currPath)
	if err != nil {
		return 0, err
	}

	for _, file := range files {
		if file.IsDir() {
			s, e := indexDiskUsage(filepath.Join(currPath, file.Name()))
			if e != nil {
				return 0, e
			}
			size += s
		} else {
			info, err := file.Info()
			if err != nil {
				continue
			}

			size += info.Size()
		}
	}

	return size, nil
}

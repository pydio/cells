/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package mongodb

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/storage/indexer"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/configx"
)

type IndexDAO interface {
	storage.IndexDAO
	SetCollection(string)
}

type Indexer struct {
	*Database
	collection      string
	collectionModel Collection
	codec           storage.IndexCodex
	inserts         []interface{}
	deletes         []string
	tick            chan bool
	flush           chan bool
	done            chan bool
	bufferSize      int
	runtime         context.Context
}

func (i *Indexer) GetCodex() indexer.IndexCodex {
	return i.codec
}

func newIndexer(db *Database, mainCollection string) *Indexer {
	i := &Indexer{
		Database:   db,
		bufferSize: 2000,
		tick:       make(chan bool),
		flush:      make(chan bool, 1),
		done:       make(chan bool, 1),
		collection: mainCollection,
	}
	go i.watch()
	return i
}

func (i *Indexer) watch() {
	defer close(i.tick)
	defer close(i.flush)
	for {
		select {
		case <-i.tick:
			if len(i.inserts) > i.bufferSize || len(i.deletes) > i.bufferSize {
				i.Flush(i.runtime)
			}
		case <-time.After(3 * time.Second):
			i.Flush(i.runtime)
		case <-i.flush:
			i.Flush(i.runtime)
		case <-i.done:
			return
		}
	}
}

func (i *Indexer) mustTick() {
	// avoid send on closed panic
	defer func() {
		recover()
	}()
	i.tick <- true
}

func (i *Indexer) SetCollection(c string) {
	i.collection = c
}

func (i *Indexer) Init(ctx context.Context, cfg configx.Values) error {
	if i.collection == "" {
		return fmt.Errorf("indexer must provide a collection name")
	}
	if i.codec != nil {
		if mo, ok := i.codec.GetModel(cfg); ok {
			model := mo.(Model)
			if er := model.Init(ctx, i.Database); er != nil {
				return er
			}
			for _, coll := range model.Collections {
				if coll.Name == i.collection {
					i.collectionModel = coll
				}
			}
		}
	}

	return nil
}

func (i *Indexer) InsertOne(ctx context.Context, data interface{}) error {
	if m, e := i.codec.Marshal(data); e == nil {
		i.inserts = append(i.inserts, m)
		i.mustTick()
		return nil
	} else {
		return e
	}
}

func (i *Indexer) DeleteOne(ctx context.Context, data interface{}) error {
	var indexId string
	if id, ok := data.(string); ok {
		indexId = id
	} else if p, o := data.(storage.IndexIDProvider); o {
		indexId = p.IndexID()
	}
	if indexId == "" {
		return fmt.Errorf("data must be a string or an IndexIDProvider")
	}
	i.deletes = append(i.deletes, indexId)
	i.mustTick()
	return nil
}

func (i *Indexer) DeleteMany(ctx context.Context, query interface{}) (int32, error) {
	request, _, err := i.codec.BuildQuery(query, 0, 0, "", false)
	if err != nil {
		return 0, err
	}
	filters, ok := request.([]bson.E)
	if !ok {
		return 0, fmt.Errorf("cannot cast filter")
	}
	filter := bson.D{}
	filter = append(filter, filters...)
	res, e := i.Collection(i.collection).DeleteMany(ctx, filter)
	if e != nil {
		return 0, e
	} else {
		return int32(res.DeletedCount), nil
	}
}

func (i *Indexer) Count(ctx context.Context, query interface{}) (int, error) {
	// TODO
	return 0, nil
}

func (i *Indexer) Search(ctx context.Context, query interface{}, out any) error {
	// TODO
	return nil
}

func (i *Indexer) FindMany(ctx context.Context, query interface{}, offset, limit int32, sortFields string, sortDesc bool, customCodec indexer.IndexCodex) (chan interface{}, error) {
	codec := i.codec
	if customCodec != nil {
		codec = customCodec
	}
	opts := &options.FindOptions{}
	if limit > 0 {
		l64 := int64(limit)
		opts.Limit = &l64
	}
	if offset > 0 {
		o64 := int64(offset)
		opts.Skip = &o64
	}
	// Eventually override options
	if op, ok := i.codec.(storage.QueryOptionsProvider); ok {
		if oo, e := op.BuildQueryOptions(query, offset, limit, sortFields, sortDesc); e == nil {
			opts = oo.(*options.FindOptions)
		}
	}
	// Build Query
	request, aggregation, err := codec.BuildQuery(query, offset, limit, sortFields, sortDesc)
	if err != nil {
		return nil, err
	}
	var searchCursor *mongo.Cursor
	var aggregationCursor *mongo.Cursor
	if request != nil {
		filters, ok := request.([]bson.E)
		if !ok {
			return nil, fmt.Errorf("cannot cast filter")
		}
		filter := bson.D{}
		filter = append(filter, filters...)
		// Perform Query
		//jsonLog, _ := bson.MarshalExtJSON(filter, false, false)
		//fmt.Println(string(jsonLog))
		cursor, err := i.Collection(i.collection).Find(ctx, filter, opts)
		if err != nil {
			return nil, err
		}
		searchCursor = cursor
	}
	if aggregation != nil {
		if c, e := i.Collection(i.collection).Aggregate(ctx, aggregation); e != nil {
			log.Logger(ctx).Error("Cannot perform aggregation:"+e.Error(), zap.Error(e))
			return nil, e
		} else {
			aggregationCursor = c
		}
	}

	res := make(chan interface{})
	fp, _ := codec.(storage.FacetParser)
	go func() {
		defer close(res)
		if searchCursor != nil {
			for searchCursor.Next(ctx) {
				if data, er := codec.Unmarshal(searchCursor); er == nil {
					res <- data
				} else {
					log.Logger(ctx).Warn("Cannot decode cursor data: "+err.Error(), zap.Error(err))
				}
			}
		}
		if aggregationCursor != nil {
			for aggregationCursor.Next(ctx) {
				if fp != nil {
					fp.UnmarshalFacet(aggregationCursor, res)
				} else if data, er := codec.Unmarshal(aggregationCursor); er == nil {
					res <- data
				} else {
					log.Logger(ctx).Warn("Cannot decode aggregation cursor data: "+err.Error(), zap.Error(err))
				}
			}
		}
	}()
	return res, nil

}

func (i *Indexer) Resync(ctx context.Context, logger func(string)) error {
	return fmt.Errorf("resync is not implemented on the mongo indexer")
}

type CollStats struct {
	Count       int64
	AvgObjSize  int64
	StorageSize int64
}

func (i *Indexer) collectionStats(ctx context.Context) (*CollStats, error) {
	directName := i.Collection(i.collection).Name()
	res := i.RunCommand(ctx, bson.M{"collStats": directName})
	if er := res.Err(); er != nil {
		return nil, er
	}
	exp := &CollStats{}
	if e := res.Decode(exp); e != nil {
		return nil, fmt.Errorf("cannot read collection statistics to truncate based on size")
	}
	return exp, nil
}

// Truncate removes records from collection. If max is set, we find the starting index for deletion based on the collection
// average object size (using collStats command)
func (i *Indexer) Truncate(ctx context.Context, max int64, logger func(string)) error {
	var filter interface{}
	var opts []*options.DeleteOptions
	filter = bson.D{}
	var startCount int64

	if max > 0 {
		if i.collectionModel.TruncateSorterDesc == "" {
			return fmt.Errorf("collection model must declare a TruncateSorterDesc field to support this operation")
		}
		exp, er := i.collectionStats(ctx)
		if er != nil {
			return er
		}
		startCount = exp.Count
		if exp.Count == 0 {
			log.TasksLogger(ctx).Info("No row in collection, nothing to do")
			return nil
		}
		if exp.AvgObjSize == 0 {
			return fmt.Errorf("cannot read record average size to truncate based on size")
		}

		targetCount := int64(float64(max) / float64(exp.AvgObjSize))
		if targetCount >= exp.Count {
			log.TasksLogger(ctx).Info("Target size bigger than current size, nothing to do")
			return nil
		}

		log.TasksLogger(ctx).Info(fmt.Sprintf("Should truncate table at row %d on a total of %d", targetCount, exp.Count))
		limit := int64(1)
		cur, er := i.Collection(i.collection).Find(ctx, bson.D{}, &options.FindOptions{Sort: bson.M{i.collectionModel.TruncateSorterDesc: -1}, Skip: &targetCount, Limit: &limit})
		if er != nil {
			return fmt.Errorf("cannot find fist row for starting deletion: %v", er)
		}
		cur.Next(ctx)
		var record map[string]interface{}
		if er := cur.Decode(&record); er != nil {
			return fmt.Errorf("cannot decode first referecence record")
		}
		ref, ok := record[i.collectionModel.TruncateSorterDesc]
		if !ok {
			return fmt.Errorf("cannot locate correct record for deletion")
		}

		log.TasksLogger(ctx).Info(fmt.Sprintf("Will truncate table based on the following condition %s<%v", i.collectionModel.TruncateSorterDesc, ref))
		filter = bson.M{i.collectionModel.TruncateSorterDesc: bson.M{"$lte": ref}}
	}
	res, e := i.Collection(i.collection).DeleteMany(context.Background(), filter, opts...)
	if e != nil {
		return e
	}
	if max > 0 && startCount > 0 {
		if exp, er := i.collectionStats(ctx); er == nil {
			msg := fmt.Sprintf("Collection storage size reduced from %d records to %d", startCount, exp.Count)
			log.Logger(ctx).Info(msg)
			log.TasksLogger(ctx).Info(msg)
			return nil
		}
	}
	log.Logger(ctx).Info(fmt.Sprintf("Flushed Mongo index from %d records", res.DeletedCount))
	log.TasksLogger(ctx).Info(fmt.Sprintf("Flushed Mongo index from %d records", res.DeletedCount))
	return nil
}

// CloseAndDrop implements storage.Closer interface
func (i *Indexer) Close(ctx context.Context) error {
	close(i.done)
	return i.Client().Disconnect(ctx)
}

// CloseAndDrop implements storage.Dropper interface
func (i *Indexer) CloseAndDrop(ctx context.Context) error {
	// TODO
	close(i.done)
	return i.Client().Disconnect(ctx)
}

func (i *Indexer) Flush(ctx context.Context) error {
	conn := i.Collection(i.collection)

	if len(i.inserts) > 0 {
		if i.collectionModel.IDName != "" {
			// First remove all entries with given ID
			var ors bson.A
			for _, insert := range i.inserts {
				if p, o := insert.(storage.IndexIDProvider); o {
					ors = append(ors, bson.M{i.collectionModel.IDName: p.IndexID()})
				}
			}
			if _, e := conn.DeleteMany(ctx, bson.M{"$or": ors}); e != nil {
				log.Logger(ctx).Error("error while flushing pre-deletes:" + e.Error())
				return e
			}
		}
		if _, e := conn.InsertMany(ctx, i.inserts); e != nil {
			log.Logger(ctx).Error("error while flushing index to db" + e.Error())
			return e
		} else {
			//fmt.Println("flushed index to db", len(res.InsertedIDs))
		}
		i.inserts = []interface{}{}
	}

	if len(i.deletes) > 0 && i.collectionModel.IDName != "" {
		var ors bson.A
		for _, d := range i.deletes {
			ors = append(ors, bson.M{i.collectionModel.IDName: d})
		}
		if _, e := conn.DeleteMany(context.Background(), bson.M{"$or": ors}); e != nil {
			log.Logger(ctx).Error("error while flushing deletes to index" + e.Error())
			return e
		} else {
			//fmt.Println("flushed index, deleted", res.DeletedCount)
		}
		i.deletes = []string{}
	}
	return nil
}

func (i *Indexer) NewBatch(ctx context.Context, opts ...indexer.BatchOption) (indexer.Batch, error) {
	var (
		inserts []interface{}
		deletes []string
	)

	// Check if the index need to be rotated once we flushed the operations
	opts = append(opts,
		indexer.WithFlushCondition(func() bool {
			return len(inserts) > i.bufferSize || len(deletes) > i.bufferSize
		}),
		indexer.WithInsertCallback(func(msg any) error {
			if m, e := i.codec.Marshal(msg); e == nil {
				inserts = append(inserts, m)
				i.mustTick()
				return nil
			} else {
				return e
			}

			return nil
		}),
		indexer.WithDeleteCallback(func(msg any) error {
			var indexId string
			if id, ok := msg.(string); ok {
				indexId = id
			} else if p, o := msg.(storage.IndexIDProvider); o {
				indexId = p.IndexID()
			}
			if indexId == "" {
				return fmt.Errorf("data must be a string or an IndexIDProvider")
			}
			deletes = append(deletes, indexId)
			i.mustTick()

			return nil
		}),
		indexer.WithFlushCallback(func() error {
			conn := i.Collection(i.collection)

			if len(inserts) > 0 {
				if i.collectionModel.IDName != "" {
					// First remove all entries with given ID
					var ors bson.A
					for _, insert := range inserts {
						if p, o := insert.(storage.IndexIDProvider); o {
							ors = append(ors, bson.M{i.collectionModel.IDName: p.IndexID()})
						}
					}
					if _, e := conn.DeleteMany(ctx, bson.M{"$or": ors}); e != nil {
						log.Logger(ctx).Error("error while flushing pre-deletes:" + e.Error())
						return e
					}
				}
				if _, e := conn.InsertMany(ctx, inserts); e != nil {
					log.Logger(ctx).Error("error while flushing index to db" + e.Error())
					return e
				} else {
					//fmt.Println("flushed index to db", len(res.InsertedIDs))
				}
				inserts = []interface{}{}
			}

			if len(deletes) > 0 && i.collectionModel.IDName != "" {
				var ors bson.A
				for _, d := range deletes {
					ors = append(ors, bson.M{i.collectionModel.IDName: d})
				}
				if _, e := conn.DeleteMany(context.Background(), bson.M{"$or": ors}); e != nil {
					log.Logger(ctx).Error("error while flushing deletes to index" + e.Error())
					return e
				} else {
					//fmt.Println("flushed index, deleted", res.DeletedCount)
				}
				deletes = []string{}
			}
			return nil
		}))

	o := &indexer.BatchOptions{}
	for _, opt := range opts {
		opt(o)
	}

	return indexer.NewBatch(ctx, opts...), nil
}

func (i *Indexer) SetCodex(c indexer.IndexCodex) {
	i.codec = c

	if mo, ok := i.codec.GetModel(nil); ok {
		if model, ok := mo.(Model); ok {
			for _, coll := range model.Collections {
				if coll.Name == i.collection {
					i.collectionModel = coll
				}
			}
		}
	}
}

// Stats method - TODO
func (i *Indexer) Stats(ctx context.Context) map[string]interface{} {
	return make(map[string]interface{})
}

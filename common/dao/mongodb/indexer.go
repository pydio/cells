package mongodb

import (
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/mongo"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/utils/configx"
)

type IndexDAO interface {
	DAO
	dao.IndexDAO
	SetCollection(string)
}

type Indexer struct {
	DAO
	collection      string
	collectionModel Collection
	codec           dao.IndexCodex
	inserts         []interface{}
	deletes         []string
	tick            chan bool
	flush           chan bool
	done            chan bool
	bufferSize      int
}

func NewIndexer(dao DAO) (IndexDAO, error) {
	i := &Indexer{
		DAO:        dao,
		bufferSize: 50,
		tick:       make(chan bool),
		flush:      make(chan bool, 1),
		done:       make(chan bool, 1),
	}
	go i.watch()
	return i, nil
}

func (i *Indexer) watch() {
	defer close(i.tick)
	defer close(i.flush)
	for {
		select {
		case <-i.tick:
			if len(i.inserts) > i.bufferSize || len(i.deletes) > i.bufferSize {
				i.Flush()
			}
		case <-time.After(3 * time.Second):
			i.Flush()
		case <-i.flush:
			i.Flush()
		case <-i.done:
			return
		}
	}
}

func (i *Indexer) SetCollection(c string) {
	i.collection = c
}

func (i *Indexer) Init(cfg configx.Values) error {
	if i.collection == "" {
		return fmt.Errorf("indexer must provide a collection name")
	}
	if i.codec != nil {
		if mo, ok := i.codec.GetModel(cfg); ok {
			model := mo.(Model)
			if er := model.Init(context.Background(), i.DB()); er != nil {
				return er
			}
			for _, coll := range model.Collections {
				if coll.Name == i.collection {
					i.collectionModel = coll
				}
			}
		}
	}
	return i.DAO.Init(cfg)
}

func (i *Indexer) InsertOne(ctx context.Context, data interface{}) error {
	if m, e := i.codec.Marshal(data); e == nil {
		i.inserts = append(i.inserts, m)
		i.tick <- true
		return nil
	} else {
		return e
	}
}

func (i *Indexer) DeleteOne(ctx context.Context, data interface{}) error {
	var indexId string
	if id, ok := data.(string); ok {
		indexId = id
	} else if p, o := data.(dao.IndexIDProvider); o {
		indexId = p.IndexID()
	}
	if indexId == "" {
		return fmt.Errorf("data must be a string or an IndexIDProvider")
	}
	i.deletes = append(i.deletes, indexId)
	i.tick <- true
	return nil
}

func (i *Indexer) DeleteMany(ctx context.Context, query interface{}) (int32, error) {
	request, _, err := i.codec.BuildQuery(query, 0, 0)
	if err != nil {
		return 0, err
	}
	filters, ok := request.([]bson.E)
	if !ok {
		return 0, fmt.Errorf("cannot cast filter")
	}
	filter := bson.D{}
	filter = append(filter, filters...)
	res, e := i.DB().Collection(i.collection).DeleteMany(context.Background(), filter)
	if e != nil {
		return 0, e
	} else {
		return int32(res.DeletedCount), nil
	}
}

func (i *Indexer) FindMany(ctx context.Context, query interface{}, offset, limit int32, customCodec dao.IndexCodex) (chan interface{}, error) {
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
	if op, ok := i.codec.(dao.QueryOptionsProvider); ok {
		if oo, e := op.BuildQueryOptions(query, offset, limit); e == nil {
			opts = oo.(*options.FindOptions)
		}
	}
	// Build Query
	request, aggregation, err := codec.BuildQuery(query, offset, limit)
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
		cursor, err := i.DB().Collection(i.collection).Find(ctx, filter, opts)
		if err != nil {
			return nil, err
		}
		searchCursor = cursor
	}
	if aggregation != nil {
		if c, e := i.DB().Collection(i.collection).Aggregate(ctx, aggregation); e != nil {
			fmt.Println("Cannot perform aggregation", e)
			return nil, e
		} else {
			aggregationCursor = c
		}
	}

	res := make(chan interface{})
	fp, _ := codec.(dao.FacetParser)
	go func() {
		defer close(res)
		if searchCursor != nil {
			for searchCursor.Next(context.Background()) {
				if data, er := codec.Unmarshal(searchCursor); er == nil {
					res <- data
				} else {
					fmt.Println("Cannot decode cursor data", err)
				}
			}
		}
		if aggregationCursor != nil {
			for aggregationCursor.Next(context.Background()) {
				if fp != nil {
					fp.UnmarshalFacet(aggregationCursor, res)
				} else if data, er := codec.Unmarshal(aggregationCursor); er == nil {
					res <- data
				} else {
					fmt.Println("Cannot decode aggregation cursor data", err)
				}
			}
		}
	}()
	return res, nil

}

func (i *Indexer) Resync(logger func(string)) error {
	return fmt.Errorf("resync is not implemented on the mongo indexer")
}
func (i *Indexer) Truncate(max int64, logger func(string)) error {
	return fmt.Errorf("truncate is not implemented on the mongo indexer")
}
func (i *Indexer) Close() error {
	close(i.done)
	return i.CloseConn()
}
func (i *Indexer) Flush() {
	ctx := context.Background()
	conn := i.DB().Collection(i.collection)
	if len(i.inserts) > 0 {
		if i.collectionModel.IDName != "" {
			// Upserts instead of inserts
			upsert := true
			for _, insert := range i.inserts {
				if p, o := insert.(dao.IndexIDProvider); o {
					if _, e := conn.ReplaceOne(ctx, bson.D{{i.collectionModel.IDName, p.IndexID()}}, insert, &options.ReplaceOptions{Upsert: &upsert}); e != nil {
						fmt.Println("Error while replaceOne", e)
					}
				} else {
					fmt.Println("insert is not an IndexIDProvider!")
				}
			}
		} else {
			if _, e := conn.InsertMany(ctx, i.inserts); e != nil {
				fmt.Println("error while flushing index to db", e)
			} else {
				//fmt.Println("flushed index to db", len(res.InsertedIDs))
			}
		}
		i.inserts = []interface{}{}
	}
	if len(i.deletes) > 0 && i.collectionModel.IDName != "" {
		var ors bson.A
		for _, d := range i.deletes {
			ors = append(ors, bson.M{i.collectionModel.IDName: d})
		}
		if res, e := conn.DeleteMany(context.Background(), bson.M{"$or": ors}); e != nil {
			fmt.Println("error while flushing deletes to index", e)
		} else {
			fmt.Println("flushed index, deleted", res.DeletedCount)
		}
		i.deletes = []string{}
	}
}
func (i *Indexer) SetCodex(c dao.IndexCodex) {
	i.codec = c
}

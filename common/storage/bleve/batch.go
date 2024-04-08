package bleve

import (
	"fmt"
	"sync"
	"time"

	bleve "github.com/blevesearch/bleve/v2"
	"github.com/rs/xid"

	"github.com/pydio/cells/v4/common/storage/indexer"
)

type bleveBatch struct {
	index         bleve.Index
	indexAlias    bleve.IndexAlias
	batch         *bleve.Batch
	batchSize     int64
	flushLock     *sync.Mutex
	inserts       chan interface{}
	deletes       chan interface{}
	forceFlush    chan bool
	done          chan bool
	flushCallback func() error

	opened bool
}

func (b *bleveBatch) watchInserts() {
	batchSize := int(b.batchSize)
	for {
		select {
		case msg := <-b.inserts:
			//if s.codec != nil {
			//	if m, err := s.codec.Marshal(msg); err != nil {
			//		break
			//	} else {
			//		msg = m
			//	}
			//}

			b.flushLock.Lock()

			var id string
			if provider, ok := msg.(indexer.IndexIDProvider); ok {
				id = provider.IndexID()
			} else {
				id = xid.New().String()
			}

			if err := b.batch.Index(id, msg); err != nil {
				fmt.Println(err)
			}

			if b.batch.Size() >= batchSize {
				b.flush()
			}
			b.flushLock.Unlock()
		case del := <-b.deletes:
			if id, o := del.(string); o {
				b.flushLock.Lock()
				b.batch.Delete(id)
				if b.batch.Size() >= batchSize {
					b.flush()
				}
				b.flushLock.Unlock()
			}
		case <-b.forceFlush:
			b.flushLock.Lock()
			b.flush()
			b.flushLock.Unlock()
		case <-time.After(3 * time.Second):
			b.flushLock.Lock()
			b.flush()
			b.flushLock.Unlock()
		case <-b.done:
			b.flushLock.Lock()
			b.flush()
			b.flushLock.Unlock()

			return
		}
	}
}

func (b *bleveBatch) flush() {
	b.flushCallback()
	b.indexAlias.Batch(b.batch)
	b.batch.Reset()
}

func (b *bleveBatch) Insert(data interface{}) error {
	b.inserts <- data
	return nil
}

func (b *bleveBatch) Delete(data interface{}) error {
	b.deletes <- data
	return nil
}

func (b *bleveBatch) Flush() error {
	b.forceFlush <- true

	return nil
}

func (b *bleveBatch) Close() error {
	b.flushLock.Lock()
	close(b.inserts)
	close(b.deletes)
	close(b.forceFlush)
	close(b.done)
	b.flushLock.Unlock()

	return nil
}

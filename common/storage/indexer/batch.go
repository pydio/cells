package indexer

import (
	"context"
	"sync"
	"time"
)

type Batch interface {
	Insert(data any) error
	Delete(data any) error
	Flush() error
	Close() error
}

type BatchOptions struct {
	Context context.Context
	Cancel  context.CancelFunc

	FlushCondition func() bool
	InsertCallback []func(any) error
	DeleteCallback []func(any) error
	FlushCallback  []func() error
}

type BatchOption func(*BatchOptions)

func WithFlushCondition(fn func() bool) BatchOption {
	return func(o *BatchOptions) {
		o.FlushCondition = fn
	}
}

func WithInsertCallback(fn func(any) error) BatchOption {
	return func(o *BatchOptions) {
		o.InsertCallback = append(o.InsertCallback, fn)
	}
}

func WithDeleteCallback(fn func(any) error) BatchOption {
	return func(o *BatchOptions) {
		o.DeleteCallback = append(o.DeleteCallback, fn)
	}
}

func WithFlushCallback(fn func() error) BatchOption {
	return func(o *BatchOptions) {
		o.FlushCallback = append(o.FlushCallback, fn)
	}
}

func NewBatch(ctx context.Context, opts ...BatchOption) Batch {
	o := BatchOptions{}

	for _, opt := range opts {
		opt(&o)
	}

	o.Context, o.Cancel = context.WithCancel(ctx)

	b := &batch{
		flushLock:  &sync.Mutex{},
		inserts:    make(chan interface{}),
		deletes:    make(chan interface{}),
		forceFlush: make(chan bool),
		opts:       o,
	}

	go b.watchInserts()

	return b
}

type batch struct {
	inserts    chan interface{}
	deletes    chan interface{}
	forceFlush chan bool
	flushLock  *sync.Mutex

	opts BatchOptions

	opened bool
}

func (b *batch) watchInserts() {
	for {
		select {
		case msg := <-b.inserts:
			b.flushLock.Lock()
			for _, f := range b.opts.InsertCallback {
				if err := f(msg); err != nil {
					continue
				}
			}

			if b.opts.FlushCondition != nil && b.opts.FlushCondition() {
				b.flush()
			}

			b.flushLock.Unlock()

		case msg := <-b.deletes:
			b.flushLock.Lock()
			for _, f := range b.opts.DeleteCallback {
				if err := f(msg); err != nil {
					continue
				}
			}

			if b.opts.FlushCondition != nil && b.opts.FlushCondition() {
				b.flush()
			}

			b.flushLock.Unlock()
		case <-b.forceFlush:
			b.flushLock.Lock()
			b.flush()
			b.flushLock.Unlock()
		case <-time.After(3 * time.Second):
			b.flushLock.Lock()
			b.flush()
			b.flushLock.Unlock()
		case <-b.opts.Context.Done():
			b.flushLock.Lock()
			b.flush()
			b.flushLock.Unlock()

			return
		}
	}
}

func (b *batch) flush() {
	for _, f := range b.opts.FlushCallback {
		f()
	}
}

func (b *batch) Insert(data interface{}) error {
	b.inserts <- data
	return nil
}

func (b *batch) Delete(data interface{}) error {
	b.deletes <- data
	return nil
}

func (b *batch) Flush() error {
	b.forceFlush <- true

	return nil
}

func (b *batch) Close() error {
	b.flushLock.Lock()
	close(b.inserts)
	close(b.deletes)
	close(b.forceFlush)

	b.opts.Cancel()

	b.flushLock.Unlock()

	return nil
}

package jsm

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"sync"
	"time"

	"github.com/nats-io/nats.go"

	"github.com/nats-io/jsm.go/api"
)

type StreamPager struct {
	mgr      *Manager
	sub      *nats.Subscription
	consumer *Consumer

	q          chan *nats.Msg
	stream     string
	startSeq   int
	startDelta time.Duration
	pageSize   int
	started    bool
	timeout    time.Duration
	seen       int

	mu sync.Mutex
}

// PagerOption configures the stream pager
type PagerOption func(p *StreamPager)

// PagerStartId sets a starting stream sequence for the pager
func PagerStartId(id int) PagerOption {
	return func(p *StreamPager) {
		p.startSeq = id
	}
}

// PagerStartDelta sets a starting time delta for the pager
func PagerStartDelta(d time.Duration) PagerOption {
	return func(p *StreamPager) {
		p.startDelta = d
	}
}

// PagerSize is the size of pages to walk
func PagerSize(sz int) PagerOption {
	return func(p *StreamPager) {
		p.pageSize = sz
	}
}

// PagerTimeout is the time to wait for messages before it's assumed the end of the stream was reached
func PagerTimeout(d time.Duration) PagerOption {
	return func(p *StreamPager) {
		p.timeout = d
	}
}

func (p *StreamPager) start(stream string, mgr *Manager, opts ...PagerOption) error {
	p.mu.Lock()
	defer p.mu.Unlock()

	if p.started {
		return fmt.Errorf("already started")
	}

	p.stream = stream
	p.mgr = mgr
	p.startDelta = 0
	p.startSeq = -1
	p.seen = -1

	for _, o := range opts {
		o(p)
	}

	if p.timeout == 0 {
		p.timeout = 5 * time.Second
	}

	if p.pageSize == 0 {
		p.pageSize = 25
	}

	var err error
	p.q = make(chan *nats.Msg, p.pageSize)
	p.sub, err = mgr.nc.ChanSubscribe(nats.NewInbox(), p.q)
	if err != nil {
		p.close()
		return err
	}

	err = p.createConsumer()
	if err != nil {
		p.close()
		return err
	}

	p.started = true

	return nil
}

// NextMsg retrieves the next message from the pager interrupted by ctx.
//
// last indicates if the message is the last in the current page, the next call
// to NextMsg will first request the next page, if the client is prompting users
// to continue to the next page it should be done when last is true
//
// When the end of the stream is reached err will be non nil and last will be true
// otherwise err being non nil while last is false indicate a failed state. End is indicated
// by no new messages arriving after ctx timeout or the time set using PagerTimes() is reached
func (p *StreamPager) NextMsg(ctx context.Context) (msg *nats.Msg, last bool, err error) {
	p.mu.Lock()
	defer p.mu.Unlock()

	if p.seen == p.pageSize || p.seen == -1 {
		p.seen = 0

		req := api.JSApiConsumerGetNextRequest{Batch: p.pageSize, NoWait: true}
		rj, err := json.Marshal(req)
		if err != nil {
			return nil, false, err
		}

		err = p.mgr.nc.PublishRequest(p.consumer.NextSubject(), p.sub.Subject, rj)
		if err != nil {
			return nil, false, err
		}
	}

	timeout, cancel := context.WithTimeout(ctx, p.timeout)
	defer cancel()

	select {
	case msg := <-p.q:
		p.seen++

		if msg.Header.Get("Status") == "404" {
			return nil, true, fmt.Errorf("last message reached")
		}

		msg.Ack()

		return msg, p.seen == p.pageSize, nil

	case <-timeout.Done():
		return nil, true, fmt.Errorf("timeout waiting for new messages")
	}
}

func (p *StreamPager) createConsumer() error {
	cops := []ConsumerOption{
		DurableName(fmt.Sprintf("jsm_stream_pager_%d%d", os.Getpid(), time.Now().UnixNano())),
	}

	switch {
	case p.startDelta > 0:
		cops = append(cops, StartAtTimeDelta(p.startDelta))
	case p.startSeq > -1:
		cops = append(cops, StartAtSequence(uint64(p.startSeq)))
	case p.startDelta == 0 && p.startSeq == -1:
		cops = append(cops, DeliverAllAvailable())
	default:
		return fmt.Errorf("no valid start options specified")
	}

	var err error
	p.consumer, err = p.mgr.NewConsumer(p.stream, cops...)

	return err
}

func (p *StreamPager) close() error {
	if p.sub != nil {
		p.sub.Unsubscribe()
	}

	if p.consumer != nil {
		err := p.consumer.Delete()
		if err != nil {
			return err
		}
	}

	close(p.q)

	p.started = false

	return nil
}

// Close dispose of the resources used by the pager and should be called when done
func (p *StreamPager) Close() error {
	p.mu.Lock()
	defer p.mu.Unlock()

	return p.close()
}

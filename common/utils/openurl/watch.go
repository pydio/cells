package openurl

import (
	"sync"
	"time"

	"github.com/pydio/cells/v5/common/utils/watch"
)

type poolWatcher struct {
	events map[string]any

	receiversLocker *sync.RWMutex
	receivers       []*receiver

	reset   chan bool
	timer   *time.Timer
	timeout time.Duration
}

func NewPoolWatcher[W watch.Watcher](p *Pool[W]) watch.Watcher {
	pw := &poolWatcher{
		events:          make(map[string]any),
		reset:           make(chan bool),
		receiversLocker: new(sync.RWMutex),
		timeout:         100 * time.Millisecond,
	}

	p.On(ADD, func(k string, w W) {
		it, _ := w.Watch()
		go func() {
			for {
				res, _ := it.Next()

				pw.events[k] = res

				pw.Reset()
			}
		}()
	})

	go pw.Flush()

	return pw
}

func (w *poolWatcher) Reset() {
	w.reset <- true
}

func (w *poolWatcher) Flush() {
	// Waiting for first call to start the timeout
	select {
	case <-w.reset:
		w.timer = time.NewTimer(w.timeout)
	}

	// Now looping the timer
	for {
		select {
		case <-w.reset:
			w.timer.Reset(w.timeout)
		case <-w.timer.C:
			for _, ev := range w.events {
				var updated []*receiver

				w.receiversLocker.RLock()
				for _, r := range w.receivers {
					if err := r.call(ev); err == nil {
						updated = append(updated, r)
					}
				}
				w.receiversLocker.RUnlock()

				w.receiversLocker.Lock()
				w.receivers = updated
				w.receiversLocker.Unlock()
			}

			w.events = make(map[string]any)
		}
	}
}

func (w *poolWatcher) Watch(option ...watch.WatchOption) (watch.Receiver, error) {
	r, err := newReceiver("watcher ")
	if err != nil {
		return nil, err
	}

	w.receiversLocker.Lock()
	w.receivers = append(w.receivers, r)
	w.receiversLocker.Unlock()

	return r, nil
}

type receiver struct {
	ev chan any
}

func newReceiver(name string, opts ...watch.WatchOption) (*receiver, error) {
	o := &watch.WatchOptions{}
	for _, opt := range opts {
		opt(o)
	}

	return &receiver{
		ev: make(chan any),
	}, nil
}

func (r receiver) call(ev any) error {
	r.ev <- ev

	return nil
}

func (r receiver) Next() (any, error) {
	return <-r.ev, nil
}

func (r receiver) Stop() {
}

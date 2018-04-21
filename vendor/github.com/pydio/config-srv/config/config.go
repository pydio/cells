package config

import (
	"errors"
	"sync"
	"time"

	"github.com/micro/go-micro/client"
	"github.com/pydio/go-os/config"

	proto "github.com/pydio/config-srv/proto/config"
	"golang.org/x/net/context"
)

var (
	// We need a path splitter since its structured in go-os
	PathSplitter = "/"
	WatchTopic   = "micro.config.watch"

	reader   config.Reader
	mtx      sync.RWMutex
	watchers = make(map[string][]*watcher)
)

type watcher struct {
	id   string
	exit chan bool
	next chan *proto.WatchResponse
}

func (w *watcher) Next() (*proto.WatchResponse, error) {
	select {
	case c := <-w.next:
		return c, nil
	case <-w.exit:
		return nil, errors.New("watcher stopped")
	}
}

func (w *watcher) Stop() error {
	select {
	case <-w.exit:
		return errors.New("already stopped")
	default:
		close(w.exit)
	}

	mtx.Lock()
	var wslice []*watcher

	for _, watch := range watchers[w.id] {
		if watch != w {
			wslice = append(wslice, watch)
		}
	}

	watchers[w.id] = wslice
	mtx.Unlock()

	return nil
}

func Init() error {
	reader = config.NewReader()
	return nil
}

func Parse(ch ...*config.ChangeSet) (*config.ChangeSet, error) {
	return reader.Parse(ch...)
}

func Values(ch *config.ChangeSet) (config.Values, error) {
	return reader.Values(ch)
}

// Watch created by a client RPC request
func Watch(id string) (*watcher, error) {
	mtx.Lock()
	w := &watcher{
		id:   id,
		exit: make(chan bool),
		next: make(chan *proto.WatchResponse),
	}
	watchers[id] = append(watchers[id], w)
	mtx.Unlock()
	return w, nil

}

// Used as a subscriber between config services for events
func Watcher(ctx context.Context, ch *proto.WatchResponse) error {
	mtx.RLock()
	for _, sub := range watchers[ch.Id] {
		select {
		case sub.next <- ch:
		case <-time.After(time.Millisecond * 100):
		}
	}
	mtx.RUnlock()
	return nil
}

// Publish a change
func Publish(ctx context.Context, ch *proto.WatchResponse) error {
	req := client.NewPublication(WatchTopic, ch)
	return client.Publish(ctx, req)
}

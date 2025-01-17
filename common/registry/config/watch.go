package configregistry

import (
	"context"
	"errors"
	"strings"

	diff "github.com/r3labs/diff/v3"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/kv"
	"github.com/pydio/cells/v5/common/utils/watch"
)

type storeWithWatcher struct {
	config.Store
	w watch.Watcher
}

func newStoreWithWatcher(store config.Store, watcher watch.Watcher) config.Store {
	s := storeWithWatcher{
		Store: store,
		w:     watcher,
	}

	return s
}

func (m storeWithWatcher) Context(ctx context.Context) configx.Values {
	return storeWithWatcherValues{
		Values: m.Store.Context(ctx),
		w:      m.w,
	}
}

func (m storeWithWatcher) Default(d any) configx.Values {
	return storeWithWatcherValues{
		Values: m.Store.Default(d),
		w:      m.w,
	}
}

func (m storeWithWatcher) Val(path ...string) configx.Values {
	return storeWithWatcherValues{
		Values: m.Store.Val(path...),
		w:      m.w,
	}
}

func (m storeWithWatcher) Watch(opts ...watch.WatchOption) (watch.Receiver, error) {
	wo := &watch.WatchOptions{}
	for _, o := range opts {
		o(wo)
	}

	r, err := m.w.Watch(opts...)
	if err != nil {
		return nil, err
	}

	if wo.ChangesOnly {
		return &receiverWithStoreChangesOnly{
			Receiver: r,
			Values:   kv.NewStore().Val(),
			level:    len(wo.Path),
		}, nil
	} else {
		return &receiverWithStore{
			Receiver: r,
			Values:   kv.NewStore().Val(),
		}, nil
	}
}

type storeWithWatcherValues struct {
	configx.Values
	w watch.Watcher
}

func (m storeWithWatcherValues) Context(ctx context.Context) configx.Values {
	return storeWithWatcherValues{
		Values: m.Values.Context(ctx),
		w:      m.w,
	}
}

func (m storeWithWatcherValues) Default(d any) configx.Values {
	return storeWithWatcherValues{
		Values: m.Values.Default(d),
		w:      m.w,
	}
}

func (m storeWithWatcherValues) Val(path ...string) configx.Values {
	return storeWithWatcherValues{
		Values: m.Values.Val(path...),
		w:      m.w,
	}
}

func (m storeWithWatcherValues) Set(value any) error {
	if err := m.Values.Set(value); err != nil {
		return err
	}

	m.w.Reset()

	return nil
}

func (m storeWithWatcherValues) Del() error {
	if err := m.Values.Del(); err != nil {
		return err
	}

	m.w.Reset()

	return nil
}

type receiverWithStore struct {
	watch.Receiver
	configx.Values
}

func (r *receiverWithStore) Next() (any, error) {
	a, err := r.Receiver.Next()
	if err != nil {
		return nil, err
	}

	changes, ok := a.([]diff.Change)
	if !ok {
		return nil, errors.New("expected a diff change")
	}

	for _, op := range changes {
		if err := r.Values.Val(op.Path...).Set(op.To); err != nil {
			return nil, err
		}
	}

	return r.Values.Val(), nil
}

type receiverWithStoreChangesOnly struct {
	level int
	watch.Receiver
	configx.Values
}

func (r *receiverWithStoreChangesOnly) Next() (any, error) {

	a, err := r.Receiver.Next()
	if err != nil {
		return nil, err
	}

	res := kv.NewStore().Val()

	changes, ok := a.([]diff.Change)
	if !ok {
		return nil, errors.New("expected a diff change")
	}

	for _, op := range changes {
		//fmt.Println("On", op.Path)
		switch op.Type {
		case diff.CREATE:
			if len(op.Path) > r.level {
				if err := res.Val(diff.UPDATE).Val(op.Path...).Set(op.To); err != nil {
					return nil, err
				}
			} else {
				if err := res.Val(diff.CREATE).Val(op.Path...).Set(op.To); err != nil {
					return nil, err
				}
			}
		case diff.DELETE:
			if len(op.Path) > r.level {
				if err := res.Val(diff.UPDATE).Val(op.Path...).Set(nil); err != nil {
					return nil, err
				}
			} else {
				if err := res.Val(diff.DELETE).Val(op.Path...).Set(op.From); err != nil {
					return nil, err
				}
			}
		case diff.UPDATE:
			if err := res.Val(diff.UPDATE).Val(op.Path...).Set(op.To); err != nil {
				return nil, err
			}
		}
	}

	return res.Val(), nil
}

type receiverWithPathSwitch struct {
	watch.Receiver

	pathFrom string
	pathTo   string
}

func (r *receiverWithPathSwitch) Next() (any, error) {
	a, err := r.Receiver.Next()
	if err != nil {
		return nil, err
	}

	changes, ok := a.([]diff.Change)
	if !ok {
		return nil, errors.New("expected a diff change")
	}

	var res []diff.Change
	for _, change := range changes {
		res = append(res, diff.Change{
			Type: change.Type,
			Path: strings.Split(strings.Replace(strings.Join(change.Path, "/"), r.pathFrom, r.pathTo, 1), "/"),
			From: change.From,
			To:   change.To,
		})
	}

	return res, nil
}

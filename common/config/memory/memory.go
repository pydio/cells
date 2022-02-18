package memory

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"sync"
	"time"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	scheme           = "mem"
	errClosedChannel = errors.New("channel is closed")
)

type URLOpener struct{}

func init() {
	o := &URLOpener{}
	config.DefaultURLMux().Register(scheme, o)
}

func (o *URLOpener) OpenURL(ctx context.Context, u *url.URL) (config.Store, error) {

	var opts []configx.Option

	encode := u.Query().Get("encode")
	switch encode {
	case "string":
		opts = append(opts, configx.WithString())
	case "yaml":
		opts = append(opts, configx.WithYAML())
	case "json":
		opts = append(opts, configx.WithJSON())
	}

	store := New(opts...)

	return store, nil
}

type memory struct {
	v         configx.Values
	opts      []configx.Option
	receivers []*receiver

	reset chan bool
	timer *time.Timer

	*sync.RWMutex
}

func New(opts ...configx.Option) config.Store {
	// opts = append([]configx.Option{configx.WithJSON()}, opts...)

	m := &memory{
		v:       configx.New(opts...),
		opts:    opts,
		RWMutex: &sync.RWMutex{},
		reset:   make(chan bool),
		timer:   time.NewTimer(100 * time.Millisecond),
	}

	go m.flush()

	return m
}

func (m *memory) flush() {
	for {
		select {
		case <-m.reset:
			m.timer.Reset(100 * time.Millisecond)
		case <-m.timer.C:
			var updated []*receiver

			for _, r := range m.receivers {
				if err := r.call(); err == nil {
					updated = append(updated, r)
				}
			}

			m.receivers = updated
		}
	}
}

func (m *memory) update() {
	select {
	case m.reset <- true:
	default:
	}
}

func (m *memory) Get() configx.Value {
	return m.v
}

func (m *memory) Set(data interface{}) error {
	if err := m.v.Set(data); err != nil {
		return err
	}

	m.update()

	return nil
}

func (m *memory) Val(path ...string) configx.Values {
	return &values{Values: m.v.Val(path...), m: m}
}

func (m *memory) Del() error {
	return fmt.Errorf("not implemented")
}

func (m *memory) Save(string, string) error {
	// do nothing
	return nil
}

func (m *memory) Watch(path ...string) (configx.Receiver, error) {
	r := &receiver{
		closed: false,
		ch:     make(chan struct{}),
		v:      m.Val(path...),
		m:      m,
	}

	m.receivers = append(m.receivers, r)

	return r, nil
}

type receiver struct {
	closed bool
	ch     chan struct{}
	v      configx.Values

	m *memory
}

func (r *receiver) call() error {
	if r.closed {
		return errClosedChannel
	}
	r.ch <- struct{}{}
	return nil
}

func (r *receiver) Next() (configx.Values, error) {
	select {
	case <-r.ch:
		r.m.RLock()
		defer r.m.RUnlock()
		cp := configx.New(r.m.opts...)
		if err := cp.Set(r.v.Val().Get()); err != nil {
			return nil, err
		}

		return cp, nil
	}

	return r.Next()
}

func (r *receiver) Stop() {
	r.closed = true
	close(r.ch)
}

type values struct {
	configx.Values

	m *memory
}

func (v *values) Set(data interface{}) error {
	if err := v.Values.Set(data); err != nil {
		return err
	}

	v.m.update()

	return nil
}

func (v *values) Del() error {
	if err := v.Values.Del(); err != nil {
		return err
	}

	v.m.update()

	return nil
}

func (v *values) Val(path ...string) configx.Values {
	return &values{Values: v.Values.Val(path...), m: v.m}
}

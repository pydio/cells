package memory

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"sync"

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
	receivers []*receiver

	*sync.RWMutex
}

func New(opts ...configx.Option) config.Store {
	// opts = append([]configx.Option{configx.WithJSON()}, opts...)

	return &memory{
		v:       configx.New(opts...),
		RWMutex: &sync.RWMutex{},
	}
}

func (m *memory) update() {
	var updated []*receiver
	for _, r := range m.receivers {
		if err := r.call(); err == nil {
			updated = append(updated, r)
		}
	}

	m.receivers = updated
}

func (m *memory) Get() configx.Value {
	return m.v
}

func (m *memory) Set(data interface{}) error {
	if err := m.v.Set(data); err != nil {
		return err
	}

	go m.update()

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
	}

	m.receivers = append(m.receivers, r)

	return r, nil
}

type receiver struct {
	closed bool
	ch     chan struct{}
	v      configx.Values
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
		return r.v.Val(), nil
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

	go v.m.update()

	return nil
}

func (v *values) Val(path ...string) configx.Values {
	return &values{Values: v.Values.Val(path...), m: v.m}
}

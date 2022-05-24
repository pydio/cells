package file

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"net/url"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/crypto"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/filex"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

var (
	scheme = "file"

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
	if encode == "" { // Detect from file name
		encode = strings.ToLower(strings.TrimLeft(filepath.Ext(u.Path), "."))
	}
	switch encode {
	case "string":
		opts = append(opts, configx.WithString())
	case "yaml":
		opts = append(opts, configx.WithYAML())
	case "json":
		opts = append(opts, configx.WithJSON(), configx.WithMarshaller(jsonIndent{}))
	}

	if master := u.Query().Get("masterKey"); master != "" {
		enc, err := crypto.NewVaultCipher(master)
		if err != nil {
			return nil, err
		}
		opts = append(opts, configx.WithEncrypt(enc), configx.WithDecrypt(enc))
	}

	store, err := New(u.Path, opts...)
	if err != nil {
		return nil, err
	}

	return store, nil
}

type file struct {
	v    configx.Values
	path string

	mainMtx *sync.Mutex
	mtx     *sync.RWMutex

	reset chan bool
	timer *time.Timer

	receivers []*receiver
}

func New(path string, opts ...configx.Option) (config.Store, error) {
	data, err := filex.Read(path)
	if err != nil {
		return nil, err
	}

	opts = append([]configx.Option{configx.WithJSON()}, opts...)

	mtx := &sync.RWMutex{}
	v := configx.New(
		opts...,
	)

	if err := v.Set(data); err != nil {
		return nil, err
	}

	f := &file{
		v:       v,
		path:    path,
		mainMtx: &sync.Mutex{},
		mtx:     mtx,
		reset:   make(chan bool),
		timer:   time.NewTimer(100 * time.Millisecond),
	}

	go f.flush()

	return f, nil
}

func (f *file) flush() {
	for {
		select {
		case <-f.reset:
			f.timer.Reset(100 * time.Millisecond)
		case <-f.timer.C:
			var updated []*receiver

			for _, r := range f.receivers {
				if err := r.call(); err == nil {
					updated = append(updated, r)
				}
			}

			f.receivers = updated
		}
	}
}

func (f *file) update() {
	select {
	case f.reset <- true:
	default:
	}
}

func (f *file) Get() configx.Value {
	f.mtx.RLock()
	defer f.mtx.RUnlock()

	return f.v.Get()
}

func (f *file) Set(data interface{}) error {
	f.mtx.RLock()
	defer f.mtx.RUnlock()

	if err := f.v.Set(data); err != nil {
		return err
	}

	f.update()

	return nil
}

func (f *file) Val(path ...string) configx.Values {
	f.mtx.RLock()
	defer f.mtx.RUnlock()

	return &values{Values: f.v.Val(path...), lock: f.mainMtx, f: f}
}

func (f *file) Del() error {
	f.mtx.RLock()
	defer f.mtx.RUnlock()

	return fmt.Errorf("not implemented")
}

func (f *file) Save(ctxUser string, ctxMessage string) error {
	f.mtx.RLock()
	defer f.mtx.RUnlock()

	return filex.Save(f.path, f.v.Bytes())
}

func (f *file) Lock() {
	f.mainMtx.Lock()
}

func (f *file) Unlock() {
	f.mainMtx.Unlock()
}

func (f *file) Watch(opts ...configx.WatchOption) (configx.Receiver, error) {
	o := &configx.WatchOptions{}
	for _, opt := range opts {
		opt(o)
	}

	path := o.Path

	r := &receiver{
		closed:  false,
		ch:      make(chan struct{}),
		p:       path,
		v:       f.v,
		current: f.v.Val(path...).Bytes(),
	}

	f.receivers = append(f.receivers, r)

	// For the moment do nothing
	return r, nil
}

type receiver struct {
	closed  bool
	ch      chan struct{}
	p       []string
	v       configx.Values
	current []byte
}

func (r *receiver) call() error {
	if r.closed {
		return errClosedChannel
	}
	r.ch <- struct{}{}
	return nil
}

func (r *receiver) Next() (interface{}, error) {
	select {
	case <-r.ch:
		neu := r.v.Val(r.p...)
		neuB := neu.Bytes()
		if bytes.Compare(r.current, neuB) != 0 {
			r.current = neuB
			return neu, nil
		}
	}

	return r.Next()
}

func (r *receiver) Stop() {
	r.closed = true
	close(r.ch)
}

type values struct {
	configx.Values
	lock sync.Locker

	f *file
}

func (v *values) Set(data interface{}) error {
	v.lock.Lock()
	defer v.lock.Unlock()

	if err := v.Values.Set(data); err != nil {
		return err
	}

	v.f.update()

	return nil
}

func (v *values) Del() error {
	v.lock.Lock()
	defer v.lock.Unlock()

	if err := v.Values.Del(); err != nil {
		return err
	}

	v.f.update()

	return nil
}

type jsonIndent struct {
}

func (j jsonIndent) Marshal(v interface{}) ([]byte, error) {
	return json.MarshalIndent(v, "", "  ")
}

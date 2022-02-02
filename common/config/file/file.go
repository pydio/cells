package file

import (
	"bytes"
	"errors"
	"fmt"
	"os"
	"sync"

	"github.com/fsnotify/fsnotify"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/filex"
)

var errClosedChannel = errors.New("channel is closed")

type file struct {
	v       configx.Values
	path    string
	watcher *fsnotify.Watcher
	mtx     *sync.RWMutex

	dirty bool

	receivers []*receiver
}

func New(path string, autoUpdate bool, opts ...configx.Option) (config.Store, error) {
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
		v:     v,
		path:  path,
		dirty: false,
		mtx:   mtx,
	}

	if autoUpdate {
		watcher, err := fsnotify.NewWatcher()
		if err != nil {
			return nil, err
		}

		if err := watcher.Add(path); err != nil {
			return nil, err
		}

		f.watcher = watcher

		go f.watch()
	}

	return f, nil
}

// TODO - error handling
func (f *file) watch() {
	for {
		select {
		case event, ok := <-f.watcher.Events:
			if !ok {
				return
			}

			// Do something ?
			if event.Op == fsnotify.Remove {
				return
			}

			if event.Op&fsnotify.Rename == fsnotify.Rename {
				// check existence of file, and add watch again
				_, err := os.Stat(event.Name)
				if err == nil || os.IsExist(err) {
					f.watcher.Add(event.Name)
				}
			}

			if event.Op&fsnotify.Write == fsnotify.Write || event.Op&fsnotify.Rename == fsnotify.Rename {
				f.mtx.Lock()
				data, err := filex.Read(event.Name)
				if err != nil {
					continue
				}

				if err := f.v.Set(data); err != nil {
					continue
				}

				f.mtx.Unlock()

				f.dirty = false

				updated := f.receivers[:0]
				for _, r := range f.receivers {
					if err := r.call(); err == nil {
						updated = append(updated, r)
					}
				}

				f.receivers = updated
			}
		case err := <-f.watcher.Errors:
			fmt.Println(err)
		}

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

	return f.v.Set(data)
}

func (f *file) Val(path ...string) configx.Values {
	f.mtx.RLock()
	defer f.mtx.RUnlock()

	return &values{f.v.Val(path...), f.mtx}
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

func (f *file) Watch(path ...string) (configx.Receiver, error) {

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

func (r *receiver) Next() (configx.Values, error) {
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
}

func (v *values) Set(data interface{}) error {
	v.lock.Lock()
	defer v.lock.Unlock()

	if err := v.Values.Set(data); err != nil {
		return err
	}

	return nil
}

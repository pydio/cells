package file

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	osruntime "runtime"
	"strings"
	"sync"
	"time"

	diff "github.com/r3labs/diff/v3"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/config/memory"
	"github.com/pydio/cells/v4/common/crypto"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/controller"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/filex"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

var (
	scheme = "file"

	errClosedChannel = errors.New("channel is closed")
)

type URLOpener struct{}

func init() {
	o := &URLOpener{}
	config.DefaultURLMux().Register(scheme, o)

	runtime.Register("system", func(ctx context.Context) {
		var mgr manager.Manager
		if !propagator.Get(ctx, manager.ContextKey, &mgr) {
			return
		}

		o := &URLOpener{}

		mgr.RegisterConfig(scheme, controller.WithCustomOpener(func(ctx context.Context, urlstr string) (*openurl.Pool[config.Store], error) {
			p, err := openurl.OpenPool(ctx, []string{urlstr}, o.Open)
			if err != nil {
				return nil, err
			}

			return p, nil
		}))
	})
}

func (o *URLOpener) Open(ctx context.Context, urlstr string) (config.Store, error) {

	u, err := url.Parse(urlstr)
	if err != nil {
		return nil, err
	}

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

	if ro := u.Query().Get("readOnly"); ro == "true" {
		opts = append(opts, configx.WithReadOnly())
	}

	// opts = append(opts, config.ReferencePoolOptionsFromURL(ctx, u)...)

	store, err := New(u.Path, opts...)
	if err != nil {
		// Try to upgrade legacy keyring
		if u.Query().Get("keyring") != "true" {
			return nil, err
		}
		if osruntime.GOOS == "windows" {
			_ = os.Chmod(u.Path, 0600)
		}
		b, err := filex.Read(u.Path)
		if err != nil {
			return nil, fmt.Errorf("could not read keyring store %v", err)
		}
		fmt.Println("[INFO] Upgrading Legacy Keyring Format")
		mem := memory.New(configx.WithJSON())
		keyring := crypto.NewConfigKeyring(mem)
		data := base64.StdEncoding.EncodeToString(b)
		if err := keyring.Set(common.ServiceGrpcNamespace_+common.ServiceUserKey, common.KeyringMasterKey, data); err != nil {
			return nil, fmt.Errorf("could not set keyring store %v", err)
		}

		// Keyring Config is likely the old style - switching it
		if err := os.Chmod(u.Path, 0600); err != nil {
			return nil, fmt.Errorf("could not chmod keyring path to 0600 %v", err)
		}

		if err := filex.Save(u.Path, mem.Val().Bytes()); err != nil {
			return nil, fmt.Errorf("could not save keyring store %v", err)
		}

		// Keyring Config is likely the old style - switching it
		if osruntime.GOOS != "windows" {
			if err := os.Chmod(u.Path, 0400); err != nil {
				return nil, fmt.Errorf("could not chmod keyring path to 0400 %v", err)
			}
		}
		return New(u.Path, opts...)
	}

	store = config.NewStoreWithReferencePool(store, config.ReferencePoolFromURL(ctx, u))

	return store, nil
}

type file struct {
	v      configx.Values
	snap   configx.Values
	path   string
	locker *sync.RWMutex

	opts []configx.Option

	mainMtx *sync.Mutex
	mtx     *sync.RWMutex

	reset chan bool
	timer *time.Timer

	receivers    []*receiver
	receiversMtx *sync.Mutex
}

func New(path string, opts ...configx.Option) (config.Store, error) {
	op := &configx.Options{}
	for _, o := range opts {
		o(op)
	}
	var data []byte
	var err error
	if op.ReadOnly {
		data, err = filex.Read(path, true)
	} else {
		data, err = filex.Read(path)
	}
	if err != nil {
		return nil, err
	}

	opts = append([]configx.Option{configx.WithJSON()}, opts...)

	mtx := &sync.RWMutex{}
	v := configx.New(
		opts...,
	)

	if len(data) > 0 {
		if err := v.Set(data); err != nil {
			return nil, err
		}
	}

	f := &file{
		v:            v,
		path:         path,
		locker:       &sync.RWMutex{},
		opts:         opts,
		mainMtx:      &sync.Mutex{},
		mtx:          mtx,
		receiversMtx: &sync.Mutex{},
		reset:        make(chan bool),
		timer:        time.NewTimer(100 * time.Millisecond),
	}

	go f.flush()

	return f, nil
}

func (f *file) flush() {
	for {
		select {
		case <-f.reset:
			f.timer.Stop()
			f.timer = time.NewTimer(100 * time.Millisecond)
		case <-f.timer.C:
			if f.snap != nil {
				patch, err := diff.Diff(f.snap.Interface(), f.v.Interface(), diff.AllowTypeMismatch(true))
				if err != nil {
					continue
				}

				for _, op := range patch {
					var updated []*receiver

					f.receiversMtx.Lock()
					for _, r := range f.receivers {
						if err := r.call(op); err == nil {
							updated = append(updated, r)
						}
					}
					f.receivers = updated
					f.receiversMtx.Unlock()
				}
			}

			snap := configx.New(f.opts...)
			if err := snap.Set(f.v.Val().Get()); err != nil {
				continue
			}

			f.snap = snap
		}
	}
}

func (f *file) update() {
	select {
	case f.reset <- true:
	default:
	}
}

func (f *file) Key() []string {
	return f.v.Key()
}

func (f *file) Context(ctx context.Context) configx.Values {
	return f.v.Context(ctx)
}

func (f *file) Options() *configx.Options {
	return f.v.Options()
}

func (f *file) Default(def any) configx.Values {
	return f.v.Default(def)
}

func (f *file) Get(wo ...configx.WalkOption) any {
	f.mtx.RLock()
	defer f.mtx.RUnlock()

	return f.v.Get(wo...)
}

func (f *file) Clone() configx.Values {
	f.mtx.RLock()
	defer f.mtx.RUnlock()

	return f.v.Val()
}

func (f *file) Set(value interface{}) error {
	f.mtx.RLock()
	defer f.mtx.RUnlock()

	if err := f.v.Set(value); err != nil {
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

func (f *file) As(out any) bool { return false }

func (f *file) Close(_ context.Context) error {
	return nil
}

func (f *file) Done() <-chan struct{} {
	// Never returns
	return nil
}

func (f *file) Save(ctxUser string, ctxMessage string) error {
	f.mtx.RLock()
	defer f.mtx.RUnlock()

	f.update()

	return filex.Save(f.path, f.v.Bytes())
}

func (f *file) Lock() {
	f.locker.Lock()
}

func (f *file) Unlock() {
	f.locker.Unlock()
}

func (f *file) Watch(opts ...configx.WatchOption) (configx.Receiver, error) {
	o := &configx.WatchOptions{}
	for _, opt := range opts {
		opt(o)
	}

	r := &receiver{
		closed:      false,
		exit:        make(chan struct{}),
		ch:          make(chan diff.Change),
		path:        o.Path,
		f:           f,
		timer:       time.NewTimer(2 * time.Second),
		changesOnly: o.ChangesOnly,
	}

	f.receiversMtx.Lock()
	f.receivers = append(f.receivers, r)
	f.receiversMtx.Unlock()

	return r, nil
}

type receiver struct {
	closed bool
	exit   chan struct{}
	ch     chan diff.Change

	path        []string
	changesOnly bool

	timer *time.Timer

	f *file
}

func (r *receiver) call(op diff.Change) error {
	if r.closed {
		return errClosedChannel
	}

	if len(r.path) == 0 {
		r.ch <- op
	}

	if strings.HasPrefix(strings.Join(op.Path, "/"), strings.Join(r.path, "/")) {
		r.ch <- op
	}
	return nil
}

func (r *receiver) Next() (interface{}, error) {
	changes := []diff.Change{}

	for {
		select {
		case op := <-r.ch:
			changes = append(changes, op)

			r.timer.Stop()
			r.timer = time.NewTimer(2 * time.Second)
		case <-r.timer.C:
			if len(changes) == 0 {
				continue
			}

			if r.changesOnly {
				c := configx.New()

				for _, op := range changes {
					if err := c.Val(op.Type).Val(op.Path...).Set(op.To); err != nil {
						return nil, err
					}
				}

				return c, nil
			}

			return r.f.v.Val(r.path...), nil
		case <-r.exit:
			return nil, errors.New("channel is now closed")
		}
	}

	return r.Next()
}

func (r *receiver) Stop() {
	r.closed = true
	close(r.exit)
	close(r.ch)
}

type values struct {
	configx.Values
	lock sync.Locker

	f *file
}

func (v *values) Context(ctx context.Context) configx.Values {
	return &values{Values: v.Values.Context(ctx), lock: v.lock, f: v.f}
}

func (v *values) Default(def any) configx.Values {
	return &values{Values: v.Values.Default(def), lock: v.lock, f: v.f}
}

func (v *values) Val(path ...string) configx.Values {
	return &values{Values: v.Values.Val(path...), lock: v.lock, f: v.f}
}

func (v *values) Set(value interface{}) error {
	v.lock.Lock()
	defer v.lock.Unlock()

	if err := v.Values.Set(value); err != nil {
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

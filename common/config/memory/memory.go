package memory

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"reflect"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/r3labs/diff/v3"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/std"
)

var (
	scheme           = "mem"
	errClosedChannel = errors.New("channel is closed")
)

type URLOpener struct{}

const timeout = 500 * time.Millisecond

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
	default:
		opts = append(opts, configx.WithJSON())
	}

	store := New(opts...)

	return store, nil
}

type memory struct {
	v configx.Values

	opts            []configx.Option
	receiversLocker *sync.RWMutex
	receivers       []*receiver

	reset chan bool
	timer *time.Timer

	externalLocker *sync.RWMutex
}

func New(opt ...configx.Option) config.Store {
	opts := configx.Options{}
	for _, o := range opt {
		o(&opts)
	}

	m := &memory{
		v:               configx.New(opt...),
		opts:            opt,
		externalLocker:  &sync.RWMutex{},
		receiversLocker: &sync.RWMutex{},
		reset:           make(chan bool),
		timer:           time.NewTimer(timeout),
	}

	go m.flush()

	return m
}

type noopDiffer struct{}

func (*noopDiffer) Match(a, b reflect.Value) bool {
	return a.Kind() == reflect.Func || b.Kind() == reflect.Func
}

func (*noopDiffer) Diff(dt diff.DiffType, df diff.DiffFunc, cl *diff.Changelog, path []string, a, b reflect.Value, parent interface{}) error {
	return nil
}

func (*noopDiffer) InsertParentDiffer(dfunc func(path []string, a, b reflect.Value, p interface{}) error) {
}

type syncMapDiffer struct{}

func (*syncMapDiffer) Match(a, b reflect.Value) bool {
	st := reflect.TypeOf(&sync.Map{})

	if !a.IsValid() || !b.IsValid() {
		return false
	}
	if !a.CanInterface() || !b.CanInterface() {
		return false
	}
	return reflect.TypeOf(a.Interface()) == st && reflect.TypeOf(b.Interface()) == st
}

func (*syncMapDiffer) Diff(dt diff.DiffType, df diff.DiffFunc, cl *diff.Changelog, path []string, a, b reflect.Value, parent interface{}) error {
	// Checking what's been added
	sma := a.Interface().(*sync.Map)
	smb := b.Interface().(*sync.Map)

	sma.Range(func(ka any, va any) bool {
		found := false
		smb.Range(func(kb any, vb any) bool {
			if ka == kb {
				// Must diff ka && kb
				patch, err := diff.Diff(va, vb, diff.AllowTypeMismatch(true), diff.CustomValueDiffers(&syncMapDiffer{}, &noopDiffer{}))
				if err != nil {
					fmt.Println(err)
					return false
				}
				for _, op := range patch {
					cl.Add(op.Type, append(path, append([]string{ka.(string)}, op.Path...)...), op.From, op.To)
				}

				found = true
				return false
			}

			return true
		})

		// Has been added
		if !found {
			cl.Add(diff.DELETE, append(path, ka.(string)), va, nil)
		}

		return true
	})

	smb.Range(func(kb any, vb any) bool {
		found := false
		sma.Range(func(ka any, _ any) bool {
			if ka == kb {
				// Must diff ka && kb
				found = true
				return false
			}

			return true
		})

		// Has been added
		if !found {
			cl.Add(diff.CREATE, append(path, kb.(string)), nil, vb)
		}

		return true
	})

	return nil
}

func (*syncMapDiffer) InsertParentDiffer(dfunc func(path []string, a, b reflect.Value, p interface{}) error) {
}

func (m *memory) flush() {
	snap := configx.New()
	snap.Set(std.DeepClone(m.v.Interface()))
	for {
		select {
		case <-m.reset:
			m.timer.Stop()
			m.timer = time.NewTimer(timeout)
		case <-m.timer.C:
			clone := std.DeepClone(m.v.Interface())

			patch, err := diff.Diff(snap.Interface(), clone, diff.AllowTypeMismatch(true), diff.CustomValueDiffers(&syncMapDiffer{}, &noopDiffer{}))
			if err != nil {
				continue
			}

			if err := snap.Set(clone); err != nil {
				continue
			}

			for _, op := range patch {
				var updated []*receiver

				m.receiversLocker.RLock()
				for _, r := range m.receivers {
					if err := r.call(op); err == nil {
						updated = append(updated, r)
					}
				}
				m.receiversLocker.RUnlock()

				m.receiversLocker.Lock()
				m.receivers = updated
				m.receiversLocker.Unlock()
			}

		}
	}
}

func (m *memory) update() {
	m.reset <- true
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

func (m *memory) Close() error {
	return nil
}

func (m *memory) Done() <-chan struct{} {
	// Never returns
	return nil
}

func (m *memory) Save(string, string) error {
	// do nothing
	return nil
}

func (m *memory) Lock() {
	m.externalLocker.Lock()
}

func (m *memory) Unlock() {
	m.externalLocker.Unlock()
}

func (m *memory) Watch(opts ...configx.WatchOption) (configx.Receiver, error) {
	o := &configx.WatchOptions{}
	for _, opt := range opts {
		opt(o)
	}

	regPath, err := regexp.Compile("^" + strings.Join(o.Path, "/"))
	if err != nil {
		return nil, err
	}

	r := &receiver{
		closed:      false,
		ch:          make(chan diff.Change),
		regPath:     regPath,
		level:       len(o.Path),
		m:           m,
		timer:       time.NewTimer(timeout),
		changesOnly: o.ChangesOnly,
	}

	m.receiversLocker.Lock()
	m.receivers = append(m.receivers, r)
	m.receiversLocker.Unlock()

	return r, nil
}

type receiver struct {
	closed bool
	ch     chan diff.Change

	regPath     *regexp.Regexp
	level       int
	changesOnly bool

	timer *time.Timer

	m *memory
}

func (r *receiver) call(op diff.Change) error {
	if r.closed {
		return errClosedChannel
	}

	if r.level == 0 {
		r.ch <- op
	}

	if r.level > len(op.Path) {
		return nil
	}

	if r.regPath.MatchString(strings.Join(op.Path, "/")) {
		r.ch <- op
	}
	return nil
}

func (r *receiver) Next() (interface{}, error) {
	changes := []diff.Change{}

	for {
		select {
		case op := <-r.ch:
			if r.closed {
				return nil, errClosedChannel
			}

			changes = append(changes, op)

			r.timer.Stop()
			r.timer = time.NewTimer(timeout)

		case <-r.timer.C:
			c := configx.New()
			if r.changesOnly {
				for _, op := range changes {
					switch op.Type {
					case diff.CREATE:
						if len(op.Path) > r.level {
							if err := c.Val(diff.UPDATE).Val(op.Path...).Set(op.To); err != nil {
								return nil, err
							}
						} else {
							if err := c.Val(diff.CREATE).Val(op.Path...).Set(op.To); err != nil {
								return nil, err
							}
						}
					case diff.DELETE:
						if len(op.Path) > r.level {
							if err := c.Val(diff.UPDATE).Val(op.Path...).Set(nil); err != nil {
								return nil, err
							}
						} else {
							if err := c.Val(diff.DELETE).Val(op.Path...).Set(op.From); err != nil {
								return nil, err
							}
						}
					case diff.UPDATE:
						if err := c.Val(diff.UPDATE).Val(op.Path...).Set(op.To); err != nil {
							return nil, err
						}
					}
				}

				return c, nil
			}

			for _, op := range changes {
				if err := c.Val(op.Path...).Set(op.To); err != nil {
					return nil, err
				}
			}

			return c, nil
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

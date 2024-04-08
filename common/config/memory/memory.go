package memory

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	diff "github.com/r3labs/diff/v3"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/utils/configx"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
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

	if data := u.Query().Get("data"); data != "" {
		//unescapedData, err := url.QueryUnescape(data)
		//if err != nil {
		//	return nil, err
		//}
		opts = append(opts, configx.WithInitData([]byte(data)))
	}

	store := New(opts...)

	envPrefix := u.Query().Get("env")
	if envPrefix != "" {
		env := os.Environ()
		for _, v := range env {
			if strings.HasPrefix(v, envPrefix) {
				vv := strings.SplitN(v, "=", 2)
				if len(vv) == 2 {
					k := strings.TrimPrefix(vv[0], envPrefix)
					k = strings.ReplaceAll(k, "_", "/")
					k = strings.ToLower(k)

					var m map[string]interface{}
					msg, err := strconv.Unquote(vv[1])
					if err != nil {
						msg = vv[1]
					}

					json.Unmarshal([]byte(msg), &m)
					store.Val(k).Set(m)
				}
			}
		}
	}

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

func (m *memory) flush() {
	snap := configx.New()
	snap.Set(std.DeepClone(m.v.Interface()))
	for {
		select {
		case <-m.reset:
			m.timer.Stop()
			select {
			case <-m.timer.C:
			default:
			}
			m.timer = time.NewTimer(timeout)
		case <-m.timer.C:
			clone := std.DeepClone(m.v.Interface())
			if clone == nil {
				continue
			}

			if iSnap := snap.Interface(); iSnap != nil || clone != nil {
				patch, err := diff.Diff(iSnap, clone, diff.DisableStructValues(), diff.AllowTypeMismatch(true), diff.CustomValueDiffers(config.CustomValueDiffers...))
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
}

func (m *memory) update() {
	m.reset <- true
}

func (m *memory) Get() configx.Value {
	return m.v
}

func (m *memory) Set(value interface{}) error {
	if err := m.v.Set(value); err != nil {
		return err
	}

	m.update()

	return nil
}

func (m *memory) Val(path ...string) configx.Values {
	return &values{Values: m.v.Val(path...), m: m, path: path}
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
		sendLock:    &sync.Mutex{},
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
	closed   bool
	sendLock *sync.Mutex

	ch chan diff.Change

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
		childPatch, err := diff.Diff(op.From, op.To)
		if err != nil {
			return nil
		}

		for _, childOp := range childPatch {
			if len(childOp.Path) > 0 {
				childOp.Path = append(op.Path, childOp.Path...)
				r.call(childOp)
			}
		}
		return nil
	}

	r.sendLock.Lock()

	if r.closed {
		return errClosedChannel
	}

	if r.regPath.MatchString(strings.Join(op.Path, "/")) {
		r.ch <- op
	}

	r.sendLock.Unlock()
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
	r.sendLock.Lock()
	r.closed = true
	close(r.ch)
	r.sendLock.Unlock()
}

type values struct {
	configx.Values

	m    *memory
	path []string
}

func (v *values) Set(value interface{}) error {
	if err := v.Values.Set(value); err != nil {
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

package etcd

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"sync"
	"time"

	clientv3 "go.etcd.io/etcd/client/v3"
	"go.etcd.io/etcd/client/v3/concurrency"

	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/std"
	"github.com/pydio/cells/v5/common/utils/watch"
)

type Store struct {
	ctx          context.Context
	values       configx.Values
	valuesLocker *sync.RWMutex
	ops          chan clientv3.Op

	prefix   string
	withKeys bool
	cli      *clientv3.Client
	session  *concurrency.Session
	leaseID  clientv3.LeaseID

	locker    *sync.RWMutex
	locks     map[string]*concurrency.Mutex
	receivers []*receiver
	reset     chan bool
	opts      []configx.Option

	saveCh    chan bool
	saveTimer *time.Timer
}

var (
	errClosedChannel = errors.New("channel is closed")
)

func NewStore(ctx context.Context, values configx.Values, cli *clientv3.Client, prefix string, ttl int) (*Store, error) {
	var session *concurrency.Session
	var leaseID clientv3.LeaseID

	if ttl > -1 {
		if s, err := concurrency.NewSession(cli, concurrency.WithTTL(ttl)); err != nil {
			return &Store{}, err
		} else {
			session = s
			leaseID = s.Lease()
		}
	}

	m := &Store{
		ctx:          ctx,
		values:       values,
		valuesLocker: &sync.RWMutex{},
		cli:          cli,
		ops:          make(chan clientv3.Op, 3000),
		session:      session,
		leaseID:      leaseID,
		prefix:       prefix,
		locker:       &sync.RWMutex{},
		locks:        make(map[string]*concurrency.Mutex),
		reset:        make(chan bool),
		//opts:         opts,
		saveCh:    make(chan bool),
		saveTimer: time.NewTimer(100 * time.Millisecond),
	}

	m.get(ctx)

	go m.watch(ctx)
	go m.save(ctx)

	return m, nil
}

func (m *Store) Context(ctx context.Context) configx.Values {
	return values{Values: m.values.Context(ctx), valuesLocker: m.valuesLocker, withKeys: m.withKeys, ops: m.ops, prefix: m.prefix, leaseID: m.leaseID}
}

func (m *Store) Options() *configx.Options {
	return m.values.Options()
}

func (m *Store) Key() []string {
	return m.values.Key()
}

func (m *Store) Default(def any) configx.Values {
	return values{Values: m.values.Default(def), valuesLocker: m.valuesLocker, withKeys: m.withKeys, ops: m.ops, prefix: m.prefix, leaseID: m.leaseID}
}

func (m *Store) Reset() {
}

func (m *Store) Flush() {
}

func (m *Store) As(out any) bool {
	return false
}

func (m *Store) get(ctx context.Context) {
	res, err := m.cli.Get(ctx, m.prefix, clientv3.WithPrefix())
	if err != nil {
		return
	}

	for _, op := range res.Kvs {
		key := strings.TrimPrefix(string(op.Key), m.prefix)
		key = strings.TrimPrefix(key, "/")
		if op.Value == nil {
			continue
		}
		if err := m.values.Val(key).Set(op.Value); err != nil {
			fmt.Println("Error in etcd watch setting value for key ", op.Key)
		}
	}
}

func (m *Store) watch(ctx context.Context) {
	watcher := m.cli.Watch(ctx, m.prefix, clientv3.WithPrefix(), clientv3.WithPrevKV())
	for {
		select {
		case res, ok := <-watcher:
			if !ok {
				return
			}

			for _, op := range res.Events {
				key := strings.TrimPrefix(string(op.Kv.Key), m.prefix)
				key = strings.TrimPrefix(key, "/")

				if op.IsModify() || op.IsCreate() {
					if err := m.values.Val(key).Set(op.Kv.Value); err != nil {
						fmt.Println("Error in etcd watch setting value for key ", op.Kv.Key)
					}
				} else {
					if err := m.values.Val(key).Del(); err != nil {
						fmt.Println("Error in etcd deleting key ", op.Kv.Key)
					}
				}

				var ops []*clientv3.Event
				/*if !m.withKeys {
					if op.PrevKv == nil {
						continue
					}

					prev := kv.NewStore()
					neu := kv.NewStore()

					prev.Set(op.PrevKv.Value)
					neu.Set(op.Kv.Value)

					patch, err := diff.Diff(prev.Get(), neu.Get())
					if err != nil {
						continue
					}

					// Sending all patches diff as events
					for _, p := range patch {
						typ := clientv3.EventTypePut
						if p.Type == diff.DELETE {
							typ = clientv3.EventTypeDelete
						}

						path := append([]string{m.prefix}, p.Path...)

						ops = append(ops, &clientv3.Event{
							Type: typ,
							Kv: &mvccpb.KeyValue{
								Key:            []byte(strings.Join(path, "/")),
								Value:          neu.Val(p.Path...).Bytes(),
								CreateRevision: op.Kv.CreateRevision,
								ModRevision:    op.Kv.ModRevision,
							},
							PrevKv: &mvccpb.KeyValue{
								Key:            []byte(strings.Join(path, "/")),
								Value:          prev.Val(p.Path...).Bytes(),
								CreateRevision: op.PrevKv.CreateRevision,
								ModRevision:    op.PrevKv.ModRevision,
							},
						})
					}
				} else {*/
				ops = append(ops, op)
				//}

				for _, op := range ops {
					updated := m.receivers[:0]
					for _, r := range m.receivers {
						if err := r.call(op); err == nil {
							updated = append(updated, r)
						}
					}

					m.receivers = updated
				}
			}
		}
	}
}

func (m *Store) Get() any {
	m.valuesLocker.RLock()
	defer m.valuesLocker.RUnlock()

	return m.values.Get()
}

func (m *Store) Val(path ...string) configx.Values {
	return values{Values: m.values.Val(path...), valuesLocker: m.valuesLocker, withKeys: m.withKeys, ops: m.ops, prefix: m.prefix, leaseID: m.leaseID}
}

func (m *Store) Set(data interface{}) error {
	m.valuesLocker.Lock()
	defer m.valuesLocker.Unlock()

	if err := m.values.Set(data); err != nil {
		return err
	}

	m.ops <- clientv3.OpPut(m.prefix, string(m.values.Bytes()), clientv3.WithLease(m.leaseID))

	return nil
}

func (m *Store) Del() error {
	return errors.New("not implemented")
}

func (m *Store) save(ctx context.Context) {
	var ops []clientv3.Op

	batch := 20
	for {
		select {
		case op := <-m.ops:
			ops = append(ops, op)
		case <-m.saveCh:
			m.saveTimer.Reset(100 * time.Millisecond)
		case <-m.saveTimer.C:
			var opsWithoutDuplicates []clientv3.Op

			// First we remove all duplicate keys for transactions
			var keys []string
			var allKeys []string
			for i := len(ops) - 1; i >= 0; i-- {
				found := false

				k := string(ops[i].KeyBytes())

				allKeys = append(allKeys, k)
				for _, key := range keys {
					if k == key {
						found = true
					}
				}

				if !found {
					keys = append(keys, k)
					opsWithoutDuplicates = append(opsWithoutDuplicates, ops[i])
				} else {
				}
			}

			for i := 0; i < len(opsWithoutDuplicates); i += batch {
				j := i + batch
				if j >= len(opsWithoutDuplicates) {
					j = len(opsWithoutDuplicates)
				}

				_, err := m.cli.Txn(ctx).Then(opsWithoutDuplicates[i:j]...).Commit()
				if err != nil {
					fmt.Println("Error in etcd save committing ops", err)
				}
			}

			ops = nil
		case <-ctx.Done():
			return
		}
	}
}

func (m *Store) Close(ctx context.Context) error {
	if m.session != nil {
		return m.session.Close()
	}

	return nil
}

func (m *Store) Done() <-chan struct{} {
	if m.session != nil {
		return m.session.Done()
	}

	return nil
}

func (m *Store) Save(ctxUser string, ctxMessage string) error {
	select {
	case m.saveCh <- true:
	case <-m.ctx.Done():
	}

	return nil
}

func (m *Store) Lock() {
	m.locker.Lock()
}

func (m *Store) Unlock() {
	m.locker.Unlock()
}

func (m *Store) NewLocker(name string) sync.Locker {
	select {
	case <-m.ctx.Done():
		return nil
	case <-m.session.Done():
		return nil
	default:
	}

	return NewLocker(m.session, name)
}

func (m *Store) Watch(opts ...watch.WatchOption) (watch.Receiver, error) {

	o := &watch.WatchOptions{}
	for _, opt := range opts {
		opt(o)
	}

	regPath, err := regexp.Compile("^" + strings.Join(o.Path, "/"))
	if err != nil {
		return nil, err
	}

	r := &receiver{
		closed:      false,
		prefix:      m.prefix,
		ch:          make(chan *clientv3.Event),
		path:        o.Path,
		regPath:     regPath,
		level:       len(o.Path),
		changesOnly: o.ChangesOnly,
		opts:        m.opts,
		v:           m.values,
		timer:       time.NewTimer(2 * time.Second),
	}

	m.receivers = append(m.receivers, r)

	return r, nil
}

type receiver struct {
	closed      bool
	prefix      string
	path        []string
	regPath     *regexp.Regexp
	level       int
	ch          chan *clientv3.Event
	v           configx.Values
	timer       *time.Timer
	opts        []configx.Option
	changesOnly bool
}

func (r receiver) call(ev *clientv3.Event) error {
	if r.closed {
		return errClosedChannel
	}

	if r.level == 0 {
		r.ch <- ev
	}

	key := string(ev.Kv.Key)[len(r.prefix):]
	key = strings.TrimPrefix(key, "/")

	if r.level > len(strings.Split(key, "/")) {
		return nil
	}

	if r.regPath.MatchString(key) {
		r.ch <- ev
	}

	return nil
}

func (r receiver) Next() (interface{}, error) {
	changes := []*clientv3.Event{}

	for {
		select {
		case ev := <-r.ch:
			if r.closed {
				return nil, errClosedChannel
			}

			changes = append(changes, ev)

			r.timer.Stop()
			r.timer = time.NewTimer(2 * time.Second)
		case <-r.timer.C:
			// Initial timer will trigger so checking we have changes
			if len(changes) == 0 {
				continue
			}
			if r.changesOnly {

				c := std.DeepClone(r.v)

				for _, op := range changes {
					if op.IsCreate() {
						if err := c.Val("create").Val(strings.TrimPrefix(string(op.Kv.Key), r.prefix+"/")).Set(op.Kv.Value); err != nil {
							return nil, err
						}
					} else if op.IsModify() {
						if err := c.Val("update").Val(strings.TrimPrefix(string(op.Kv.Key), r.prefix+"/")).Set(op.Kv.Value); err != nil {
							return nil, err
						}
					} else {
						if err := c.Val("delete").Val(strings.TrimPrefix(string(op.Kv.Key), r.prefix+"/")).Set(op.PrevKv.Value); err != nil {
							return nil, err
						}
					}
				}
				return c, nil
			}

			return r.v.Val(r.path...), nil
		}
	}
}

func (r receiver) Stop() {
	r.closed = true
	close(r.ch)
}

type values struct {
	configx.Values
	valuesLocker *sync.RWMutex
	ops          chan clientv3.Op
	leaseID      clientv3.LeaseID
	withKeys     bool

	prefix string
}

func (v values) Context(ctx context.Context) configx.Values {
	return values{Values: v.Values.Context(ctx), valuesLocker: v.valuesLocker, withKeys: v.withKeys, ops: v.ops, prefix: v.prefix, leaseID: v.leaseID}
}

func (v values) Default(def any) configx.Values {
	return values{Values: v.Values.Default(def), valuesLocker: v.valuesLocker, withKeys: v.withKeys, ops: v.ops, prefix: v.prefix, leaseID: v.leaseID}
}

func (v values) Set(value interface{}) error {
	v.valuesLocker.Lock()
	defer v.valuesLocker.Unlock()

	if err := v.Values.Set(value); err != nil {
		return err
	}

	v.ops <- clientv3.OpPut(strings.Join(append([]string{v.prefix}, v.Key()...), "/"), string(v.Values.Bytes()), clientv3.WithLease(v.leaseID))

	return nil
}

func (v values) Get() any {
	v.valuesLocker.RLock()
	defer v.valuesLocker.RUnlock()

	return v.Values.Get()
}

func (v values) Del() error {
	v.valuesLocker.Lock()
	defer v.valuesLocker.Unlock()

	if err := v.Values.Del(); err != nil {
		return err
	}

	v.ops <- clientv3.OpDelete(strings.Join(append([]string{v.prefix}, v.Key()...), "/"), clientv3.WithLease(v.leaseID))

	return nil
}

func (v values) Val(path ...string) configx.Values {
	return values{Values: v.Values.Val(path...), valuesLocker: v.valuesLocker, withKeys: v.withKeys, ops: v.ops, prefix: v.prefix, leaseID: v.leaseID}
}

type lockerMutex struct {
	s   *concurrency.Session
	pfx string
	*concurrency.Mutex
}

func (lm *lockerMutex) Lock() {
	client := lm.s.Client()
	for {
		if err := lm.Mutex.Lock(client.Ctx()); err != nil {
			fmt.Println("Error locking, retrying... ", lm.pfx, err)
			<-time.After(100 * time.Millisecond)
			continue
		}

		return
	}
}

func (lm *lockerMutex) Unlock() {
	client := lm.s.Client()
	lm.Mutex.Unlock(client.Ctx())
}

// NewLocker creates a sync.Locker backed by an etcd mutex.
func NewLocker(s *concurrency.Session, pfx string) sync.Locker {
	return &lockerMutex{s: s, pfx: pfx, Mutex: concurrency.NewMutex(s, strings.Trim(pfx, "/"))}
}

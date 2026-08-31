package etcd

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"os"
	"path"
	"strconv"
	"strings"
	"sync"

	clientv3 "go.etcd.io/etcd/client/v3"
	"go.etcd.io/etcd/client/v3/concurrency"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/utils/kv"
)

const etcdScheme = "etcd"

func init() {
	config.DefaultURLMux().Register(etcdScheme, &EtcdOpener{})
}

type EtcdOpener struct{}

func (o *EtcdOpener) Open(ctx context.Context, urlstr string, base config.Store) (config.Store, error) {
	urlstr = os.ExpandEnv(urlstr)

	u, err := url.Parse(urlstr)
	if err != nil {
		return nil, err
	}

	clientConfig := clientv3.Config{Endpoints: []string{u.Host}}
	if u.User != nil {
		clientConfig.Username = u.User.Username()
		if pwd, ok := u.User.Password(); ok {
			clientConfig.Password = pwd
		}
	}

	cli, err := clientv3.New(clientConfig)
	if err != nil {
		return nil, err
	}

	key := etcdKey(u)
	if key == "" {
		_ = cli.Close()
		return nil, errors.New("etcd config URL must contain a key")
	}

	var session *concurrency.Session
	leaseID := clientv3.NoLease
	if u.Query().Has("ttl") {
		ttl, parseErr := strconv.Atoi(u.Query().Get("ttl"))
		if parseErr != nil {
			_ = cli.Close()
			return nil, errors.New("not a valid time to live")
		}
		session, err = concurrency.NewSession(cli, concurrency.WithTTL(ttl))
		if err != nil {
			_ = cli.Close()
			return nil, err
		}
		leaseID = session.Lease()
	}

	response, err := cli.Get(ctx, key)
	if err != nil {
		if session != nil {
			_ = session.Close()
		}
		_ = cli.Close()
		return nil, err
	}

	baseModRevision := int64(0)
	if len(response.Kvs) > 0 {
		entry := response.Kvs[0]
		if err := config.Replace(base, entry.Value); err != nil {
			if session != nil {
				_ = session.Close()
			}
			_ = cli.Close()
			return nil, fmt.Errorf("could not load etcd config key %q: %w", key, err)
		}
		baseModRevision = entry.ModRevision
	}

	storeCtx, cancel := context.WithCancel(ctx)
	store := &etcdStore{
		working:          base,
		cli:              cli,
		key:              key,
		leaseID:          leaseID,
		session:          session,
		ctx:              storeCtx,
		cancel:           cancel,
		baseModRevision:  baseModRevision,
		lastSeenRevision: response.Header.Revision,
	}
	store.Store = &trackedStore{Store: base, owner: store}

	go store.watch(response.Header.Revision + 1)

	return store, nil
}

func etcdKey(u *url.URL) string {
	key := strings.TrimLeft(u.Path, "/")
	if namespace := strings.Trim(u.Query().Get("namespace"), "/"); namespace != "" {
		key = strings.TrimLeft(path.Join(path.Dir("/"+key), namespace), "/")
	}
	return key
}

type remoteSnapshot struct {
	value       []byte
	modRevision int64
	deleted     bool
}

type etcdStore struct {
	config.Store

	mu      sync.Mutex
	working config.Store
	cli     *clientv3.Client
	key     string
	leaseID clientv3.LeaseID
	session *concurrency.Session
	ctx     context.Context
	cancel  context.CancelFunc

	baseModRevision     int64
	lastSeenRevision    int64
	localGeneration     uint64
	committedGeneration uint64
	pendingRemote       *remoteSnapshot
}

func (e *etcdStore) mutate(fn func() error) error {
	e.mu.Lock()
	defer e.mu.Unlock()

	if err := fn(); err != nil {
		return err
	}
	e.localGeneration++
	return nil
}

func (e *etcdStore) Save(string, string) error {
	e.mu.Lock()
	defer e.mu.Unlock()

	data, err := json.Marshal(e.working.Get())
	if err != nil {
		return err
	}

	transaction := e.cli.Txn(e.ctx).
		If(clientv3.Compare(clientv3.ModRevision(e.key), "=", e.baseModRevision)).
		Then(clientv3.OpPut(e.key, string(data), clientv3.WithLease(e.leaseID))).
		Else(clientv3.OpGet(e.key))
	response, err := transaction.Commit()
	if err != nil {
		return err
	}
	if !response.Succeeded {
		actualRevision := int64(0)
		if len(response.Responses) > 0 {
			entries := response.Responses[0].GetResponseRange().Kvs
			if len(entries) > 0 {
				actualRevision = entries[0].ModRevision
			}
		}
		return fmt.Errorf("%w: etcd key %q expected revision %d, found %d", config.ErrConfigConflict, e.key, e.baseModRevision, actualRevision)
	}

	e.baseModRevision = response.Header.Revision
	e.lastSeenRevision = response.Header.Revision
	e.committedGeneration = e.localGeneration
	e.pendingRemote = nil
	return nil
}

func (e *etcdStore) watch(revision int64) {
	watcher := e.cli.Watch(e.ctx, e.key, clientv3.WithRev(revision))
	for response := range watcher {
		if err := response.Err(); err != nil {
			if e.ctx.Err() == nil {
				fmt.Printf("Error watching etcd config key %q: %v\n", e.key, err)
			}
			continue
		}
		for _, event := range response.Events {
			if err := e.applyRemote(event); err != nil {
				fmt.Printf("Error applying etcd config key %q: %v\n", e.key, err)
			}
		}
	}
}

func (e *etcdStore) applyRemote(event *clientv3.Event) error {
	e.mu.Lock()
	defer e.mu.Unlock()

	revision := event.Kv.ModRevision
	if revision <= e.lastSeenRevision {
		return nil
	}

	snapshot := &remoteSnapshot{modRevision: revision, deleted: event.Type == clientv3.EventTypeDelete}
	if !snapshot.deleted {
		snapshot.value = append([]byte(nil), event.Kv.Value...)
	}

	if e.localGeneration != e.committedGeneration {
		if e.pendingRemote == nil || revision > e.pendingRemote.modRevision {
			e.pendingRemote = snapshot
		}
		return nil
	}

	if snapshot.deleted {
		if err := config.Replace(e.working, map[string]any{}); err != nil {
			return err
		}
		e.baseModRevision = 0
	} else {
		if err := config.Replace(e.working, snapshot.value); err != nil {
			return err
		}
		e.baseModRevision = revision
	}
	e.lastSeenRevision = revision
	return nil
}

func (e *etcdStore) Close(ctx context.Context) error {
	e.cancel()

	var firstErr error
	if err := e.working.Close(ctx); err != nil {
		firstErr = err
	}
	if e.session != nil {
		if err := e.session.Close(); err != nil && firstErr == nil {
			firstErr = err
		}
	}
	if err := e.cli.Close(); err != nil && firstErr == nil {
		firstErr = err
	}
	return firstErr
}

func (e *etcdStore) Done() <-chan struct{} {
	return e.ctx.Done()
}

type trackedStore struct {
	config.Store
	owner *etcdStore
}

func (s *trackedStore) Context(ctx context.Context) kv.Values {
	return &trackedValues{Values: s.Store.Context(ctx), owner: s.owner}
}

func (s *trackedStore) Default(value any) kv.Values {
	return &trackedValues{Values: s.Store.Default(value), owner: s.owner}
}

func (s *trackedStore) Val(path ...string) kv.Values {
	return &trackedValues{Values: s.Store.Val(path...), owner: s.owner}
}

func (s *trackedStore) Set(value any) error {
	return s.owner.mutate(func() error { return s.Store.Set(value) })
}

func (s *trackedStore) Del() error {
	return s.owner.mutate(s.Store.Del)
}

type trackedValues struct {
	kv.Values
	owner *etcdStore
}

func (v *trackedValues) Context(ctx context.Context) kv.Values {
	return &trackedValues{Values: v.Values.Context(ctx), owner: v.owner}
}

func (v *trackedValues) Default(value any) kv.Values {
	return &trackedValues{Values: v.Values.Default(value), owner: v.owner}
}

func (v *trackedValues) Val(path ...string) kv.Values {
	return &trackedValues{Values: v.Values.Val(path...), owner: v.owner}
}

func (v *trackedValues) Set(value any) error {
	return v.owner.mutate(func() error { return v.Values.Set(value) })
}

func (v *trackedValues) Del() error {
	return v.owner.mutate(v.Values.Del)
}

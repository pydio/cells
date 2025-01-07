package config

import (
	"context"
	"strconv"
	"strings"
	"time"

	diff "github.com/r3labs/diff/v3"
	"github.com/spf13/cast"

	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/openurl"
	"github.com/pydio/cells/v5/common/utils/watch"
)

// storeWithRefPool embeds Viper to extend its behavior
type storeWithRefPool struct {
	Store

	ctx     context.Context
	refPool map[string]*openurl.Pool[Store]

	watchers []watch.Watcher

	onClose []func()
}

// newStoreWithRefPool creates a new instance of storeWithRefPool
func newStoreWithRefPool(v Store, rp map[string]*openurl.Pool[Store]) Store {
	var watchers []watch.Watcher

	// Adding pool watchers
	for _, p := range rp {
		watchers = append(watchers, openurl.NewPoolWatcher(p))
	}

	// Adding wrapper to have a watcher for each pool of stores
	return &storeWithRefPool{
		Store:    v,
		refPool:  rp,
		watchers: watchers,
	}
}

// resolveRef resolves a $ref value and returns the referenced data.
func (ev *storeWithRefPool) resolveRef(ref any) (Store, string, bool) {
	refStr, err := strconv.Unquote(cast.ToString(ref))
	if err != nil {
		refStr = cast.ToString(ref)
	}

	refParts := strings.SplitN(refStr, "#", 2)
	refTarget, refValue := refParts[0], refParts[1]
	if refTarget == "" {
		return ev, refValue, true
	}

	if refPool, ok := ev.refPool[refTarget]; ok {
		if store, err := refPool.Get(ev.Options().Context); err == nil {
			return store, refValue, true
		}
	}
	return nil, "", false
}

func (ev *storeWithRefPool) Watch(opts ...watch.WatchOption) (watch.Receiver, error) {
	wo := &watch.WatchOptions{}
	for _, o := range opts {
		o(wo)
	}

	// First scenario, the watch is set inside a ref, we need to wrap the lower watch so that the path is correctly set
	current := ev.Store.Val("#").Get() // Start from the root configuration

	for i, part := range wo.Path {
		part = strings.ToLower(part)
		switch value := current.(type) {
		case map[string]any:
			if refV, ok := value["$ref"]; ok {
				store, key, ok := ev.resolveRef(refV)
				if ok {
					rcvr, err := store.Watch(watch.WithPath(strings.Join(append([]string{key}, wo.Path[i+1:]...), delimiter)))
					if err != nil {
						return nil, err
					}

					return &receiverWithPathSwitch{
						Receiver: rcvr,
						pathFrom: key,
						pathTo:   strings.Join(wo.Path[:i], "/"),
					}, nil
				}
			}

			// If the current level is a map, get the next key
			current = value[part]
		case []string:
			// If the current level is a slice, parse the index
			index, err := strconv.Atoi(part)
			if err != nil || index < 0 || index >= len(value) {
				return nil, err // Invalid index
			}
			current = value[index]
		case []any:
			// If the current level is a slice, parse the index
			index, err := strconv.Atoi(part)
			if err != nil || index < 0 || index >= len(value) {
				return nil, err // Invalid index
			}
			current = value[index]
		default:
			return ev.Store.Watch(opts...) // Unexpected structure or key does not exist
		}
	}

	if value, ok := current.(map[string]any); ok {
		if refV, ok := value["$ref"]; ok {
			store, key, ok := ev.resolveRef(refV)
			if ok {
				rcvr, err := store.Watch(watch.WithPath(key))
				if err != nil {
					return nil, err
				}

				return &receiverWithPathSwitch{
					Receiver: rcvr,
					pathFrom: key,
					pathTo:   strings.Join(wo.Path, "/"),
				}, nil
			}

		}
	}

	var receivers []watch.Receiver

	// Second scenario, we are watching a config that contains a ref pool somewhere
	// In this case, we are combining the watchers of all those ref pools and on event send back
	// the totality of the object since we don't know where the change occurred
	var poolReceivers []watch.Receiver
	for _, w := range ev.watchers {
		r, _ := w.Watch(opts...)
		poolReceivers = append(poolReceivers, r)
	}

	receivers = append(receivers, &receiverWithRefPool{Store: ev.Store, Receiver: watch.NewCombinedReceiver(poolReceivers)})

	// Finally adds the standard receiver
	if r, err := ev.Store.Watch(opts...); err != nil {
		return nil, err
	} else {
		receivers = append(receivers, r)
	}

	// And combine them
	return watch.NewCombinedReceiver(receivers), nil
}

func (ev *storeWithRefPool) Close(ctx context.Context) error {
	for _, onClose := range ev.onClose {
		onClose()
	}

	return ev.Store.Close(ctx)
}

func (ev *storeWithRefPool) Context(ctx context.Context) configx.Values {
	return &storeWithRefPoolValues{
		Values:  ev.Store.Context(ctx),
		refPool: ev.refPool,
	}
}

func (ev *storeWithRefPool) Default(d any) configx.Values {
	return &storeWithRefPoolValues{
		Values:  ev.Store.Default(d),
		refPool: ev.refPool,
	}
}

func (ev *storeWithRefPool) Val(path ...string) configx.Values {
	return &storeWithRefPoolValues{
		Values:  ev.Store.Val(path...),
		refPool: ev.refPool,
	}
}

type storeWithRefPoolValues struct {
	configx.Values
	refPool map[string]*openurl.Pool[Store]
}

// resolveRef resolves a $ref value and returns the referenced data.
func (ev *storeWithRefPoolValues) resolveRef(ref any) (configx.Values, string, bool) {
	refStr, err := strconv.Unquote(cast.ToString(ref))
	if err != nil {
		refStr = cast.ToString(ref)
	}

	refParts := strings.SplitN(refStr, "#", 2)
	refTarget, refValue := refParts[0], refParts[1]
	if refTarget == "" {
		return ev.Val("#"), refValue, true
	}

	if refPool, ok := ev.refPool[refTarget]; ok {
		if store, err := refPool.Get(ev.Options().Context); err == nil {
			return store.Val("#"), refValue, true
		}
	}

	return nil, "", false
}

func (ev *storeWithRefPoolValues) Context(ctx context.Context) configx.Values {
	return &storeWithRefPoolValues{
		Values:  ev.Values.Context(ctx),
		refPool: ev.refPool,
	}
}

func (ev *storeWithRefPoolValues) Default(d any) configx.Values {
	return &storeWithRefPoolValues{
		Values:  ev.Values.Default(d),
		refPool: ev.refPool,
	}
}

func (ev *storeWithRefPoolValues) Val(path ...string) configx.Values {
	return &storeWithRefPoolValues{
		Values:  ev.Values.Val(path...),
		refPool: ev.refPool,
	}
}

// Get overrides the Viper Get method to support slice indexing
func (ev *storeWithRefPoolValues) get() configx.Values {
	parts := ev.Key()

	var current any = ev.Values.Val("#").Get() // Start from the root configuration

	for i, part := range parts {
		part = strings.ToLower(part)
		switch value := current.(type) {
		case map[string]any:
			if refV, ok := value["$ref"]; ok {
				store, key, ok := ev.resolveRef(refV)
				if ok {
					return store.Val(strings.Join(append([]string{key}, parts[i:]...), delimiter))
				}
			}

			// If the current level is a map, get the next key
			current = value[part]
		case []string:
			// If the current level is a slice, parse the index
			index, err := strconv.Atoi(part)
			if err != nil || index < 0 || index >= len(value) {
				return nil // Invalid index
			}
			current = value[index]
		case []any:
			// If the current level is a slice, parse the index
			index, err := strconv.Atoi(part)
			if err != nil || index < 0 || index >= len(value) {
				return nil // Invalid index
			}
			current = value[index]
		default:
			return ev.Values // Unexpected structure or key does not exist
		}
	}

	if value, ok := current.(map[string]any); ok {
		if refV, ok := value["$ref"]; ok {
			store, key, ok := ev.resolveRef(refV)
			if ok {
				return store.Val(key)
			}
		}
	}

	// If we arrive there, it means we haven't found anything in the structure that indicates we have a ref
	return nil
}

// Set overrides the Viper Set method to support slice indexing
func (ev *storeWithRefPoolValues) Set(data any) error {
	parts := ev.Key()

	// Start with the root settings
	root := ev.Values.Val("#").Get()

	var current any
	current = root

	// Traverse all parts except the last
	for i, part := range parts {
		switch value := current.(type) {

		case map[string]any:
			if refV, ok := value["$ref"]; ok {
				store, key, ok := ev.resolveRef(refV)

				if ok {
					return store.Val(key).Val(parts[i:]...).Set(data)
				}
			}

			// If the current level is a map, get the next key
			current = value[part]
		case []string:
			// If the current level is a slice, parse the index
			index, err := strconv.Atoi(part)
			if err != nil || index < 0 || index >= len(value) {
				return err // Invalid index
			}
			current = value[index]
		case []any:
			// If the current level is a slice, parse the index
			index, err := strconv.Atoi(part)
			if err != nil || index < 0 || index >= len(value) {
				return err // Invalid index
			}
			current = value[index]

		default:
			// Update Store's internal configuration
			return ev.Values.Set(data)
		}
	}

	if value, ok := current.(map[string]any); ok {
		if refV, ok := value["$ref"]; ok {
			store, key, ok := ev.resolveRef(refV)
			if ok {
				return store.Val(key).Set(data)
			}
		}
	}

	// Update Store's internal configuration
	return ev.Values.Set(data)
}

func (ev *storeWithRefPoolValues) Get(opts ...configx.WalkOption) any {
	if vv := ev.get(); vv != nil {
		return vv.Get(opts...)
	}

	return ev.Values.Get(opts...)
}

func (ev *storeWithRefPoolValues) Bool() bool {
	if vv := ev.get(); vv != nil {
		return vv.Bool()
	}

	return ev.Values.Bool()
}

func (ev *storeWithRefPoolValues) Bytes() []byte {
	if vv := ev.get(); vv != nil {
		return vv.Bytes()
	}

	return ev.Values.Bytes()
}

func (ev *storeWithRefPoolValues) Interface() interface{} {
	if vv := ev.get(); vv != nil {
		return vv.Interface()
	}

	return ev.Values.Interface()
}

func (ev *storeWithRefPoolValues) Int() int {
	if vv := ev.get(); vv != nil {
		return vv.Int()
	}

	return ev.Values.Int()
}

func (ev *storeWithRefPoolValues) Int64() int64 {
	if vv := ev.get(); vv != nil {
		return vv.Int64()
	}

	return ev.Values.Int64()
}

func (ev *storeWithRefPoolValues) Duration() time.Duration {
	if vv := ev.get(); vv != nil {
		return vv.Duration()
	}

	return ev.Values.Duration()
}

func (ev *storeWithRefPoolValues) StringMap() map[string]string {
	if vv := ev.get(); vv != nil {
		return vv.StringMap()
	}

	return ev.Values.StringMap()
}

func (ev *storeWithRefPoolValues) StringArray() []string {
	if vv := ev.get(); vv != nil {
		return vv.StringArray()
	}

	return ev.Values.StringArray()
}

func (ev *storeWithRefPoolValues) Slice() []interface{} {
	if vv := ev.get(); vv != nil {
		return vv.Slice()
	}

	return ev.Values.Slice()
}

func (ev *storeWithRefPoolValues) Map() map[string]interface{} {
	if vv := ev.get(); vv != nil {
		return vv.Map()
	}

	return ev.Values.Map()
}

func (ev *storeWithRefPoolValues) Scan(out any, options ...configx.Option) error {
	if vv := ev.get(); vv != nil {
		return vv.Scan(out, options...)
	}

	return ev.Values.Scan(out, options...)
}

func (ev *storeWithRefPoolValues) String() string {
	if vv := ev.get(); vv != nil {
		return vv.String()
	}

	return ev.Values.String()
}

type Getter interface {
	Get() any
}

type receiverWithRefPool struct {
	Store
	watch.Receiver
}

func (r *receiverWithRefPool) Next() (any, error) {
	_, err := r.Receiver.Next()
	if err != nil {
		return nil, err
	}

	return []diff.Change{{
		Type: diff.UPDATE,
		Path: []string{},
		//From: r.Store.Val().Get(),
		To: r.Store.Val().Get(),
	}}, nil
}

func (r *receiverWithRefPool) Stop() {
	r.Receiver.Stop()
}

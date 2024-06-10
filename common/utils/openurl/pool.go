package openurl

import (
	"context"
	"errors"
	"fmt"
	"math"
	"strings"
	"sync"
	"time"
)

type ResourceClosable interface {
	Close(context.Context) error
}

type namedT[T any] struct {
	t      T
	name   string
	active time.Time
}

type Provider[T any] interface {
	Open(ctx context.Context, url string) (T, error)
	Get(ctx context.Context, url string) (T, error)
}

type Resolver[T any] interface {
	Get(ctx context.Context, data ...map[string]string) (T, error)
}

type Opener[T any] func(ctx context.Context, url string) (T, error)

type Pool[T any] struct {
	resolvers []Template
	provider  Provider[T]
	pool      map[string]*namedT[T]
	lock      *sync.RWMutex

	options *PoolOptions[T]

	stopJanitor context.CancelFunc
}

type PoolOption[T any] func(*PoolOptions[T])

type PoolOptions[T any] struct {
	CleanTicker time.Duration
	MaxIdleTime time.Duration
	Opener[T]
}

func WithCleanTicker[T any](duration time.Duration) PoolOption[T] {
	return func(o *PoolOptions[T]) {
		o.CleanTicker = duration
	}
}

func WithMaxIdleTime[T any](duration time.Duration) PoolOption[T] {
	return func(o *PoolOptions[T]) {
		o.CleanTicker = duration
	}
}

func WithProvider[T any](provider Provider[T]) PoolOption[T] {
	return func(o *PoolOptions[T]) {
		o.Opener = provider.Open
	}
}

func WithOpener[T any](opener Opener[T]) PoolOption[T] {
	return func(o *PoolOptions[T]) {
		o.Opener = opener
	}
}

// OpenPool creates a pool of resources that are resolved at Get() time.
// If PoolOption is passed, it will monitor idle resources and close them regulary to free memory
// Maybe PoolOptions could also be passed by the URL
func OpenPool[T any](ctx context.Context, uu []string, opener Opener[T], opt ...PoolOption[T]) (*Pool[T], error) {
	opts := &PoolOptions[T]{
		Opener: opener,
	}

	for _, o := range opt {
		o(opts)
	}

	var rs []Template
	for _, u := range uu {
		if r, e := URLTemplate(u); e != nil {
			panic(e)
		} else {
			rs = append(rs, r)
		}
	}

	pool := &Pool[T]{
		resolvers: rs,
		pool:      make(map[string]*namedT[T]),
		lock:      &sync.RWMutex{},

		options: opts,
	}

	if len(opt) > 0 && opts.CleanTicker > 0 && opts.MaxIdleTime > 0 {
		stopCtx, can := context.WithCancel(ctx)
		pool.stopJanitor = can
		go pool.janitor(stopCtx, opts.CleanTicker, opts.MaxIdleTime)
	}

	return pool, nil
}

//func (m Pool[T]) Resolve(ctx context.Context, resolutionData ...map[string]interface{}) (string, error) {
//
//}

func (m Pool[T]) Get(ctx context.Context, resolutionData ...map[string]interface{}) (T, error) {
	last := len(m.resolvers) - 1
	for i, resolver := range m.resolvers {
		// RESOLVE URL
		realURL, er := resolver.Resolve(ctx, resolutionData...)
		if er != nil {
			if i < last {
				continue // Try next one provided as fallback
			}
			var q T
			return q, er
		}

		// Lookup
		m.lock.RLock()
		if nq, ok := m.pool[realURL]; ok {
			nq.active = time.Now()
			m.lock.RUnlock()

			return nq.t, nil
		}
		m.lock.RUnlock()

		if m.options.Opener == nil {
			var q T
			return q, errors.New("no opener available")
		}

		q, err := m.options.Opener(ctx, realURL)
		if err != nil {
			if i < last {
				continue // Try next one provided as fallback
			}
			return q, err
		}

		// Set
		m.lock.Lock()
		m.pool[realURL] = &namedT[T]{
			t:      q,
			name:   realURL,
			active: time.Now(),
		}
		m.lock.Unlock()

		return q, err
	}
	var res T
	return res, fmt.Errorf("cannot resolve")
}

// Close closes all underlying resources
// TODO - options with close callback
func (m *Pool[T]) Close(ctx context.Context, iterate ...func(key string, res T) error) error {
	//func (m Pool[T]) Close(ctx context.Context) error {
	//if m.stopJanitor != nil {
	//	m.stopJanitor()
	//}
	//var errString []string
	//m.lock.Lock()
	//defer m.lock.Unlock()
	//for key, res := range m.pool {
	//	if er := res.t.Close(ctx); er != nil {
	//		errString = append(errString, er.Error())
	//	}
	//	for _, it := range iterate {
	//		if er := it(key, res.t); er != nil {
	//			errString = append(errString, er.Error())
	//		}
	//	}
	//	delete(m.pool, key)
	//}
	//if len(errString) > 0 {
	//	maxS := int64(math.Min(float64(len(errString)-1), 5))
	//	return fmt.Errorf("closing pool returned %d errors, first errors are: %s", len(errString), strings.Join(errString[0:maxS], ","))
	//}
	return nil
}

func (m Pool[T]) janitor(ctx context.Context, tickerTime, maxIdleTime time.Duration) {
	ticker := time.NewTicker(tickerTime)
	for {
		select {
		case <-ticker.C:
			m.cleanIdle(ctx, maxIdleTime)
		case <-ctx.Done():
			ticker.Stop()
			return
		}
	}
}

func (m Pool[T]) cleanIdle(ctx context.Context, idleTime time.Duration) {
	var keys []string
	check := time.Now().Add(-idleTime)
	m.lock.RLock()
	for k, v := range m.pool {
		if !check.Before(v.active) {
			keys = append(keys, k)
		}
	}
	m.lock.RUnlock()
	if len(keys) > 0 {
		fmt.Printf("[POOL] Deleting %d idle resources\n", len(keys))
		var errString []string
		m.lock.Lock()
		//for _, k := range keys {
		//	if er := m.pool[k].t.Close(ctx); er != nil {
		//		errString = append(errString, er.Error())
		//	}
		//	delete(m.pool, k)
		//}
		m.lock.Unlock()
		if len(errString) > 0 {
			maxS := int64(math.Min(float64(len(errString)-1), 5))
			fmt.Printf("[POOL] closing pool returned %d errors, first errors are: %s", len(errString), strings.Join(errString[0:maxS], ","))
		}
	}
}

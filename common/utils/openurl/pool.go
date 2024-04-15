package openurl

import (
	"context"
	"fmt"
)

type namedT[T any] struct {
	t    T
	name string
}

type Opener[T any] func(ctx context.Context, url string) (T, error)

type Pool[T any] struct {
	resolvers []Template
	opener    func(ctx context.Context, url string) (T, error)
	pool      []*namedT[T]
}

func OpenPool[T any](uu []string, opener Opener[T]) (*Pool[T], error) {
	rs := make([]Template, len(uu))
	for _, u := range uu {
		if r, e := URLTemplate(u); e != nil {
			panic(e)
		} else {
			rs = append(rs, r)
		}
	}

	return &Pool[T]{
		resolvers: rs,
		opener:    opener,
	}, nil
}

func (m *Pool[T]) Get(ctx context.Context, resolutionData ...map[string]interface{}) (T, error) {
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
		for _, nq := range m.pool {
			if nq.name == realURL {
				return nq.t, nil
			}
		}
		q, er := m.opener(ctx, realURL)
		if er != nil {
			if i < last {
				continue // Try next one provided as fallback
			}
			return q, er
		}
		m.pool = append(m.pool, &namedT[T]{t: q, name: realURL})
		return q, er
	}
	var res T
	return res, fmt.Errorf("cannot resolve")
}

// TODO - Close all underlying resources
func (m *Pool[T]) Close(ctx context.Context) error {
	return nil
}

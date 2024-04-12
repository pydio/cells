package broker

import (
	"context"
	"fmt"
)

type namedT[T any] struct {
	t    T
	name string
}

type Opener[T any] func(ctx context.Context, url string) (T, error)

type MuxPool[T any] struct {
	urls     []string
	resolver func(string) string
	opener   func(ctx context.Context, url string) (T, error)
	pool     []*namedT[T]
}

func NewMuxPool[T any](uu []string, resolver func(string) string, opener Opener[T]) *MuxPool[T] {
	return &MuxPool[T]{
		urls:     uu,
		resolver: resolver,
		opener:   opener,
	}
}

func (m *MuxPool[T]) Get(ctx context.Context) (T, error) {
	last := len(m.urls) - 1
	for i, u := range m.urls {
		// RESOLVE URL
		realURL := m.resolver(u)
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

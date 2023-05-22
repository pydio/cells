package service

import (
	"context"
)

type AbstractHandler[T any] struct {
	svc Service
}

func NewAbstractHandler[T any](svc Service) *AbstractHandler[T] {
	return &AbstractHandler[T]{
		svc: svc,
	}
}

func (a *AbstractHandler[T]) Name() string {
	return a.svc.Options().Name
}

func (a *AbstractHandler[T]) DAO(ctx context.Context) T {
	return DAOFromContext[T](a.svc)(ctx)
}

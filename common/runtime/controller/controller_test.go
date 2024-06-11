package controller

import (
	"context"
	"testing"
)

type TestStorage interface {
	//Register(string, interface{}) error
	//Open(ctx context.Context, url string) (Resolver[TestStorage], error)
}

type testStorage struct{}

func (*testStorage) Register(string, interface{}) error {
	return nil
}

func (*testStorage) Open(context.Context, string) (Resolver[TestStorage], error) {
	return &testResolver{}, nil
}

type testResolver struct{}

func (*testResolver) Get(ctx context.Context, data ...map[string]interface{}) (TestStorage, error) {
	return &testDB{}, nil
}

type testDB struct{}

type t Controller[TestStorage]

func TestController(t *testing.T) {

}

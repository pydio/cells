package openurl

import (
	"context"
	"fmt"
	"maps"
	"sync"
	"testing"
	"time"

	"github.com/pydio/cells/v5/common/utils/watch"
)

type mockMap map[string]string

func (m mockMap) Clone() mockMap {
	return maps.Clone(m)
}

func (m mockMap) Get() any {
	return m
}

func (m mockMap) Set(k string, v string) {
	m[k] = v
}

func (m mockMap) Empty() {
	m = map[string]string{}
}

type mock struct {
	mockMap

	watch.Watcher
}

func (m mock) Set(k string, v string) {
	m.mockMap.Set(k, v)
	m.Reset()
}

func newMock() mock {
	m := mockMap{}

	return mock{mockMap: m, Watcher: watch.NewWatcher(m)}
}

func TestWatch(t *testing.T) {

	m := mock{}

	w := watch.NewWatcher(m)
	it, err := w.Watch()
	if err != nil {
		t.Fatal(err)
	}

	wg := &sync.WaitGroup{}
	wg.Add(1)

	go func() {
		res, _ := it.Next()

		fmt.Println(res)

		wg.Done()
	}()

	m.Set("whatever", "whatever")

	wg.Wait()
}

func TestPoolWatch(t *testing.T) {

	p, err := OpenPool[mock](context.TODO(), []string{"{{.UUID}}"}, func(ctx context.Context, urlstr string) (mock, error) {
		return newMock(), nil
	})
	if err != nil {
		return
	}

	w := NewPoolWatcher(p)

	it, err := w.Watch()
	if err != nil {
		t.Fatal(err)
	}

	wg := &sync.WaitGroup{}
	wg.Add(2)

	go func() {
		for {
			res, _ := it.Next()

			fmt.Println(res)

			wg.Done()
		}
	}()

	m1, _ := p.Get(context.Background(), map[string]any{"UUID": "m1"})
	m2, _ := p.Get(context.Background(), map[string]any{"UUID": "m2"})

	m1.Set("whatever2", "whatever")
	m2.Set("test1", "test2")

	<-time.After(1 * time.Second)

	wg.Wait()

}

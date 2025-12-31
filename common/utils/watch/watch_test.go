package watch

import (
	"context"
	"fmt"
	"maps"
	"reflect"
	"testing"
	"time"

	diff "github.com/r3labs/diff/v3"
	"github.com/spf13/viper"

	"github.com/pydio/cells/v5/common/utils/std"
)

type mockWatchTypeDiffer struct {
}

func (*mockWatchTypeDiffer) Match(a, b reflect.Value) bool {
	return a.Kind() == reflect.ValueOf(&mockWatchType{}).Kind() && b.Kind() == reflect.ValueOf(&mockWatchType{}).Kind()
}

func (*mockWatchTypeDiffer) Diff(dt diff.DiffType, df diff.DiffFunc, cl *diff.Changelog, path []string, a, b reflect.Value, parent interface{}) error {
	// Checking what's been added
	am := a.Interface().(*struct{ Test string })
	bm := b.Interface().(*struct{ Test string })

	if am.Test != bm.Test {
		cl.Add(diff.UPDATE, append(path, "test"), am.Test, bm.Test)
	}

	return nil
}

func (*mockWatchTypeDiffer) InsertParentDiffer(dfunc func(path []string, a, b reflect.Value, p interface{}) error) {
}

func init() {
	RegisterCustomValueDiffer(&mockWatchTypeDiffer{})
}

type mockWatchType struct {
	viper *viper.Viper
}

func (m *mockWatchType) Clone() *mockWatchType {
	settings := std.DeepClone(m.viper.AllSettings())

	v := viper.New()
	v.MergeConfigMap(settings)

	return &mockWatchType{viper: v}
}

func (m *mockWatchType) Get() any {
	return m.viper.AllSettings()
}

func (m *mockWatchType) Empty() {
	m.viper = viper.New()
}

func TestWatch(t *testing.T) {
	v := viper.New()

	w := NewWatcher(&mockWatchType{v})

	w.Reset()
	go w.Flush()

	r, _ := w.Watch()

	res := make(chan any)
	defer close(res)

	go func() {
		for {
			val, err := r.Next()
			if err != nil {
				t.Error(err)
			}

			res <- val
		}
	}()

	d := &struct{ Test string }{Test: fmt.Sprintf("Test %d", 0)}

	for i := 0; i < 10; i++ {
		d.Test = fmt.Sprintf("Test %d", i+1)

		v.Set("test", d)
		w.Reset()

		select {
		case <-res:
		case <-time.After(1 * time.Second):
			t.Fatal("timeout waiting for event")
		}
	}
}

type mockSimpleWatchType struct {
	m map[string]any
}

func (m *mockSimpleWatchType) Clone() *mockSimpleWatchType {
	return &mockSimpleWatchType{m: maps.Clone(m.m)}
}

func (m *mockSimpleWatchType) Set(key string, value any) {
	m.m[key] = value
}

func (m *mockSimpleWatchType) Get() any {
	return m.m
}

func (m *mockSimpleWatchType) Empty() {
	m.m = map[string]any{}
}

func TestWatchSimple(t *testing.T) {
	sources := []string{"test1"}

	m := map[string]any{"sources": sources}

	w := NewWatcher(&mockSimpleWatchType{m: m})

	go w.Flush()

	r, _ := w.Watch(WithPath("sources"))

	finish, can := context.WithTimeout(context.Background(), time.Second)
	go func() {
		val, err := r.Next()
		if ch, ok := val.([]diff.Change); ok && len(ch) == 3 {
			fmt.Println("val", val, err)
			t.Log("Received 3 changes in diff")
			can()
		}
	}()

	sources = append(sources, "test2", "test3", "test4")
	m["sources"] = sources
	w.Reset()

	select {
	case <-finish.Done():
		break
	case <-time.After(5 * time.Minute):
		break
	}
}

package watch

import (
	"context"
	"fmt"
	"maps"
	"testing"
	"time"

	diff "github.com/r3labs/diff/v3"
	"github.com/spf13/viper"

	"github.com/pydio/cells/v5/common/utils/std"
)

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

	go func() {
		val, err := r.Next()
		fmt.Println("val", val, err)

		val2, err2 := r.Next()

		fmt.Println("val2", val2, err2)
	}()

	d := &struct{ test string }{test: "yo"}

	v.Set("test", d)
	w.Reset()
	w.Reset()
	w.Reset()
	<-time.After(3 * time.Second)

	d.test = "yo2"
	v.Set("test", d)
	w.Reset()

	<-time.After(3 * time.Second)
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

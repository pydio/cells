package watch

import (
	"fmt"
	"testing"
	"time"

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
	<-time.After(3 * time.Second)

	d.test = "yo2"
	v.Set("test", d)
	w.Reset()

	<-time.After(3 * time.Second)

}

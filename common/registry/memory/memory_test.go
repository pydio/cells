// +build ignore

package memory

import (
	"fmt"
	"runtime"
	"testing"

	"github.com/pydio/cells/v4/common/registry"
)

func TestMemory(t *testing.T) {
	m := &memory{}
	s := registry.NewService("test", "0.0.0", map[string]string{})

	m.RegisterService(s)

	fmt.Println(m.services[0])

	s = nil

	runtime.GC()

	fmt.Println(m.services[0].Name())
}

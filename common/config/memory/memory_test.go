package memory

import (
	"fmt"
	"testing"

	"github.com/davecgh/go-spew/spew"

	"github.com/pydio/cells/v4/common/utils/configx"
)

func TestMemory(t *testing.T) {
	mem := New(configx.WithJSON())

	w, err := mem.Watch()
	if err != nil {
		t.Fatal(err)
	}
	defer w.Stop()

	mem.Val("hello").Set("world")

	for {
		res, err := w.Next()
		if err != nil {
			t.Fatal(err)
		}

		spew.Dump(res.(configx.Values).Get())
		fmt.Println(res, mem.Val("hello"))

		break
	}

}

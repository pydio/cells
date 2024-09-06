package memory

import (
	"testing"

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

		if res.(configx.Values).Val("hello").String() != "world" {
			t.Fail()
		}

		break
	}

}

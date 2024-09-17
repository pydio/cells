package file

import (
	"fmt"
	"os"
	"testing"

	"github.com/pydio/cells/v4/common/utils/filex"
)

func TestFile(t *testing.T) {

	fp := os.TempDir() + "/config.tmp"
	c, err := New(fp)
	if err != nil {
		t.Fail()
	}

	c.Val("whatever").Set("whatever")
	c.Save("doing it", "because I want it")

	b, err := filex.Read(fp)
	fmt.Println(string(b))

	t.Log("Result ", c.Val("whatever").String())

	c2, err := New(fp)
	if err != nil {
		t.Fail()
	}

	t.Log("Result ", c2.Val("whatever").String())

	os.Remove(os.TempDir() + "/config.tmp")
}

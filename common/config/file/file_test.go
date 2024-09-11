package file

import (
	"os"
	"testing"
)

func TestFile(t *testing.T) {
	c, err := New(os.TempDir() + "/config.tmp")
	if err != nil {
		t.Fail()
	}

	c.Val("whatever").Set("whatever")
	c.Save("doing it", "because I want it")

	t.Log("Result ", c.Val("whatever").String())

	c2, err := New(os.TempDir() + "/config.tmp")
	if err != nil {
		t.Fail()
	}

	t.Log("Result ", c2.Val("whatever").String())

	os.Remove(os.TempDir() + "/config.tmp")
}

package configx

import (
	"fmt"
	"strings"
	"testing"

	"github.com/pydio/cells/v5/common/utils/kv"
)

type mockEncDec struct {
}

func (*mockEncDec) Encrypt(data []byte) (string, error) {
	return fmt.Sprintf("encrypted: %s", data), nil
}

func (*mockEncDec) Decrypt(data string) ([]byte, error) {
	return []byte(strings.TrimPrefix(data, "encrypted: ")), nil
}

func TestWithEncrypt(t *testing.T) {
	m := &mockEncDec{}
	e := New(
		kv.WithJSON(),
		kv.WithEncrypt(m),
		kv.WithDecrypt(m),
	)

	if err := e.Set([]byte(`{
		"key": "val"
	}`)); err != nil {
		t.Error(err)
	}

	fmt.Println(e.Get())
	fmt.Println(e.Val("key").String())
}

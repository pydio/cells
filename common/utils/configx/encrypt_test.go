package configx

import (
	"fmt"
	"strings"
	"testing"
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
	jr := &jsonReader{}
	jw := &jsonWriter{}
	e := &marshaller{
		Values: &encrypter{
			Values:    New(),
			Encrypter: m,
			Decrypter: m,
		},
		Marshaller:  jw,
		Unmarshaler: jr,
	}

	if err := e.Set([]byte(`{
		"key": "val"
	}`)); err != nil {
		t.Error(err)
	}

	fmt.Println(e.Get())
	fmt.Println(e.Val("key").String())
}

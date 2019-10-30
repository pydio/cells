package models

import (
	"encoding/json"
	"fmt"

	"github.com/yvasiyarov/php_session_decoder/php_serialize"
)

type phpMeta map[string]interface{}
type phpUsers map[string]phpMeta
type phpNodes map[string]phpUsers
type phpLocalMeta map[string]phpNodes

type PhpUserMeta struct {
	NodeName string
	UserName string
	Meta     map[string]interface{}
}

func UserMetasFromPhpData(serializedData []byte) (metas []*PhpUserMeta, outErr error) {

	defer func() {
		if e := recover(); e != nil {
			outErr = e.(error)
		}
	}()

	decoder := php_serialize.NewUnSerializer(string(serializedData))

	if phpValue, err := decoder.Decode(); err == nil {
		m := phpValueToMapString(phpValue)
		if ms, ok := m.(map[string]interface{}); ok {
			metas, outErr = Map2LocalMeta(ms)
		} else {
			outErr = fmt.Errorf("cannot cast phpValue")
		}
	} else {
		outErr = err
	}

	return
}

func Map2LocalMeta(m map[string]interface{}) (out []*PhpUserMeta, e error) {

	j, e := json.Marshal(m)
	if e != nil {
		return nil, e
	}

	var localMeta phpLocalMeta
	e = json.Unmarshal(j, &localMeta)
	if e != nil {
		return nil, e
	}

	for path, nodes := range localMeta {
		for _, users := range nodes {
			for plugin, metas := range users {
				if plugin == "users_meta" {
					out = append(out, &PhpUserMeta{
						NodeName: path,
						Meta:     metas,
					})
				}
			}
		}
	}

	return
}

func phpValueToMapString(obj interface{}) interface{} {
	out := make(map[string]interface{})
	if arr, ok := obj.(php_serialize.PhpArray); ok {
		for k, v := range arr {
			key := k.(string)
			out[key] = phpValueToMapString(v)
		}
		return out
	} else {
		return obj
	}
}

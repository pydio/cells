package routing

import (
	"fmt"
	"reflect"
	"strings"
	"testing"

	mapstructure "github.com/go-viper/mapstructure/v2"
	"github.com/golang/protobuf/jsonpb"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common/proto/install"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

func TestDecode(t *testing.T) {
	data := `{"Binds":["0.0.0.0:8080"],"Routing":[{"Effect":1,"Matcher":"*"},{"Effect":0,"Matcher":"io"},{"Effect":0,"Matcher":"data"}],"TLSConfig":{"selfsigned":{}}}`

	var m map[string]any
	json.Unmarshal([]byte(data), &m)

	var tls install.ProxyConfig

	//var m any
	if err := json.Unmarshal([]byte(data), &tls); err != nil {
		t.Fatal(err)
	}
	fmt.Println(tls)

	if err := jsonpb.Unmarshal(strings.NewReader(data), &tls); err != nil {
		t.Fatal(err)
	}

	dec, err := mapstructure.NewDecoder(&mapstructure.DecoderConfig{
		TagName: "json",
		Result:  &tls,
		DecodeHook: func(a reflect.Type, b reflect.Type, in interface{}) (out interface{}, err error) {
			_, ok := in.(proto.Message)
			fmt.Println(a, b, in, ok)
			return in, nil
		},
		MatchName: func(mapKey string, fieldName string) bool {
			return strings.ToLower(mapKey) == strings.ToLower(fieldName)
		},
	})
	if err != nil {
		t.Fatal(err)
	}

	if err := dec.Decode(m); err != nil {
		t.Fatal(err)
	}
}

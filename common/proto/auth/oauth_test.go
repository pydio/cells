package auth

import (
	"encoding/json"
	fmt "fmt"
	"testing"

	"github.com/golang/protobuf/jsonpb"
	. "github.com/smartystreets/goconvey/convey"
)

func TestOAuth(t *testing.T) {

	Convey("Marshal To String", t, func() {
		var d = &OAuth2ConnectorPydioConfig_Connector{
			Id:   1,
			Type: "pydioapi",
			Name: "pydio",
		}

		str, err := (&jsonpb.Marshaler{}).MarshalToString(d)
		fmt.Println(str, err)

		str2, err2 := json.Marshal(d)
		fmt.Println(string(str2), err2)

	})
	Convey("Unmarshal json", t, func() {
		b := `
		{
			"client_id": "cells-sync",
			"client_name": "cells-sync",
			"grant_types": [
			"authorization_code",
			"refresh_token"
			],
			"redirect_uris": [
			"http://localhost:3000/servers/callback"
			],
			"response_types": [
			"code",
			"token",
			"id_token"
			],
			"scope": "openid email profile pydio offline"
		}
		`

		var d OAuth2ClientConfig

		err := jsonpb.UnmarshalString(b, &d)
		So(err, ShouldBeNil)

		fmt.Println(d)
		So(d.ClientID, ShouldEqual, "cells-sync")
	})

	Convey("Testing unmarshalling json", t, func() {
		str := `
		{
			"type": "pydio",
			"id"  : "pydio",
			"name": "Pydio Aggregation Connector",
			"config": {
				"pydioconnectors": [
					{
						"type": "pydio-api",
						"name": "pydioapi",
						"id"  : 1
					}
				]
			}
		}
		`

		var m map[string]interface{}
		err := json.Unmarshal([]byte(str), &m)
		So(err, ShouldBeNil)

		m["config"+m["type"].(string)] = m["config"]
		delete(m, "config")

		jsonStr, err := json.Marshal(m)
		So(err, ShouldBeNil)

		var d OAuth2ConnectorConfig

		err = jsonpb.UnmarshalString(string(jsonStr), &d)
		So(err, ShouldBeNil)
		So(d.Type, ShouldEqual, "pydio")
	})
}

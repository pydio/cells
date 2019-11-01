package main

import (
	"fmt"
	"os"
	"strings"

	"github.com/golang/protobuf/jsonpb"
	"gopkg.in/yaml.v2"

	"github.com/pydio/cells/common/proto/install"
)

var (
	sampleJson = `
	{
		"ProxyConfig": {
			"BindURL": "https://localhost:8080",
			"ExternalURL": "https://localhost:8080",
				"SelfSigned": {
					"Hostnames": [
						"localhost"
					]
				}
			
		}
	}
`

	sampleYaml = `
installconfig:
	proxyconfig:
   		bindurl: "https://localhost:8080"
		externalurl": "https://localhost:8080",
		selfsigned: 

`
)

type test struct {
	Field_One string
	Field_Two string
}

func main() {

	myTest := &test{
		Field_One: "one",
		Field_Two: "two",
	}

	out, err := yaml.Marshal(myTest)
	fmt.Println(string(out))
	os.Exit(0)

	// m := jsonpb.Marshaler{}
	// js, err := m.MarshalToString(msg)
	// if err != nil {
	// 	fmt.Println(err)
	// 	return
	// }
	// fmt.Printf("json output ==> %v\n", js)

	// err2 := yaml.Unmarshal([]byte(sampleJson), &iconf2)
	// if err2 != nil {
	// 	fmt.Println("Could not unmarshall YAML file, cause:", err2.Error())
	// }

	iconf := &install.InstallConfig{}
	err = jsonpb.Unmarshal(strings.NewReader(sampleJson), iconf)
	if err != nil {
		fmt.Println(err.Error())
	}

	fmt.Println(iconf.GetProxyConfig().GetTLSConfig())

	// iconf := &install.InstallConfig{}
	// err := json.Unmarshal([]byte(sampleJson), iconf)
	// if err != nil {
	// 	fmt.Println("Could not unmarshall, cause:", err.Error())
	// }

	// fmt.Println(iconf.GetProxyConfig().GetTLSConfig())

	// iconf2 := &install.InstallConfig{}
	// err2 := yaml.Unmarshal([]byte(sampleJson), &iconf2)
	// if err2 != nil {
	// 	fmt.Println("Could not unmarshall YAML file, cause:", err2.Error())
	// }

	// fmt.Println(iconf2.GetProxyConfig().GetTLSConfig())

}

package vars

import (
	hversion "github.com/hashicorp/go-version"
	"log"
)

var (
	version       string
	BuildStamp    string
	BuildRevision string
)

func Version() *hversion.Version {
	log.Println(version, BuildRevision, BuildStamp)
	v, _ := hversion.NewVersion(version)
	return v
}

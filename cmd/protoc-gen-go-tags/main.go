package main

import (
	pgs "github.com/lyft/protoc-gen-star/v2"
	pgsgo "github.com/lyft/protoc-gen-star/v2/lang/go"

	"github.com/pydio/cells/v4/cmd/protoc-gen-go-tags/module"
)

func main() {
	pgs.Init(pgs.DebugEnv("GOTAG_DEBUG")).
		RegisterModule(module.New()).
		RegisterPostProcessor(pgsgo.GoFmt()).
		Render()
}

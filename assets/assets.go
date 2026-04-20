package assets

import (
	_ "embed"
)

var (
	//go:embed start.yaml
	BootstrapYAML string
)

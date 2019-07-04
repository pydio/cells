package model

import "github.com/pydio/cells/common/proto/tree"

// ProcessStatus informs about the status of an operation
type ProcessStatus struct {
	StatusString     string
	IsError          bool
	Error            error `json:"-"` // ignore for marshalling
	Progress         float32
	IsProgressAtomic bool

	EndpointURI string
	Node        *tree.Node
}

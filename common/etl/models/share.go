package models

import (
	"context"

	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
)

type SyncShare struct {
	OwnerUser    *idm.User
	OwnerContext context.Context

	Cell           *rest.Cell
	Link           *rest.ShareLink
	LinkPassword   string
	PasswordHashed bool

	InternalData interface{}
}

func (s *SyncShare) Equals(o Differ) bool {
	return false
}

func (s *SyncShare) IsDeletable(m map[string]string) bool {
	return false
}

func (s *SyncShare) IsMergeable(o Differ) bool {
	return false
}

func (s *SyncShare) GetUniqueId() string {
	if s.Link != nil {
		return "LINK:" + s.Link.LinkHash
	} else if s.Cell != nil {
		return "CELL:" + s.Cell.Label
	} else {
		return "EMPTY"
	}
}

func (s *SyncShare) Merge(o Differ, options map[string]string) (Differ, error) {
	return s, nil
}

func (s *SyncShare) GetInternalData() interface{} {
	return s.InternalData
}

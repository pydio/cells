package storage

import "github.com/pydio/cells/v4/common/utils/configx"

type DAO struct {
	config configx.Values
	store  any
}

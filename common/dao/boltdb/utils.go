package boltdb

import (
	"github.com/pydio/cells/v4/common/utils/configx"
)

func DSNToConfig(dsn string) (configx.Values, error) {
	c := configx.New()

	c.Val("file").Set(dsn)

	return c, nil
}

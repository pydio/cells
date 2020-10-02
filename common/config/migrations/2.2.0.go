package migrations

import (
	"github.com/hashicorp/go-version"
	"github.com/pydio/cells/x/configx"
)

func init() {
	v, _ := version.NewVersion("2.2.0")
	add(v, getMigration(updateDatabaseDefault))
}

func updateDatabaseDefault(config configx.Values) (bool, error) {
	def := config.Val("defaults/database")

	if v := def.String(); v != "" {
		err := def.Set(configx.Reference("databases/" + v))
		return true, err
	}

	return false, nil
}

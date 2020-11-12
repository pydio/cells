package migrations

import (
	"context"
	"fmt"
	"path"

	"github.com/hashicorp/go-version"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/utils/migrations"
	"github.com/pydio/cells/x/configx"
)

type migrationConfig struct {
	target *version.Version
	up     migrationConfigFunc
}

type migrationConfigFunc func(configx.Values) func(context.Context) error
type migrationFunc func(configx.Values) error

var (
	configMigrations []*migrationConfig

	configKeysDeletes = []string{
		"services/pydio.grpc.auth/dex",
	}
)

func add(target *version.Version, m migrationConfigFunc) {
	configMigrations = append(configMigrations, &migrationConfig{target, m})
}

func getMigration(f migrationFunc) migrationConfigFunc {
	return func(c configx.Values) func(context.Context) error {
		return func(context.Context) error {
			return f(c)
		}
	}
}

// UpgradeConfigsIfRequired applies all registered configMigration functions
// Returns true if there was a change and save is required, error if something nasty happened
func UpgradeConfigsIfRequired(config configx.Values) (bool, error) {

	v := config.Val("version")

	lastVersion, err := version.NewVersion(v.Default("0.0.0").String())
	if err != nil {
		return false, err
	}

	if !lastVersion.LessThan(common.Version()) {
		return false, nil
	}

	var mm []*migrations.Migration
	for _, m := range configMigrations {
		mm = append(mm, &migrations.Migration{
			TargetVersion: m.target,
			Up:            m.up(config),
		})
	}

	appliedVersion, err := migrations.Apply(context.Background(), lastVersion, common.Version(), mm)
	if err != nil {
		return false, err
	}

	if !appliedVersion.GreaterThan(lastVersion) {
		return false, nil
	}

	if err := v.Set(appliedVersion.String()); err != nil {
		return false, err
	}

	return true, nil
}

// UpdateKeys replace a key with a new one
func UpdateKeys(config configx.Values, m map[string]string) error {
	for oldPath, newPath := range m {
		oldVal := config.Val(oldPath)
		newVal := config.Val(newPath)
		if oldVal.Get() != nil && newVal.Get() == nil {
			fmt.Printf("[Configs] Upgrading: renaming key %s to %s\n", oldPath, newPath)
			newVal.Set(oldVal)
			oldVal.Del()
		}
	}
	return nil
}

// UpdateVals replace a val with a new one
func UpdateVals(config configx.Values, m map[string]string) (bool, error) {

	var all interface{}
	err := config.Scan(&all)
	if err != nil {
		return false, err
	}

	var save bool
	all = parseAndReplace(all, func(a map[string]interface{}) map[string]interface{} {
		for oldV, newV := range m {
			for k, v := range a {
				if vv, ok := v.(string); ok && vv == oldV {
					fmt.Printf("[Configs] Upgrading: renaming val %s to %s\n", oldV, newV)
					a[k] = newV
					save = true
				}
			}
		}

		return a
	})

	if !save {
		return save, nil
	}

	config.Set(all)

	return true, nil
}

func deleteConfigKeys(config common.ConfigValues) (bool, error) {
	var save bool
	for _, oldPath := range configKeysDeletes {
		val := config.Values(oldPath)
		var data interface{}
		if e := val.Scan(&data); e == nil && data != nil {
			fmt.Printf("[Configs] Upgrading: deleting key %s\n", oldPath)
			od, of := path.Split(oldPath)
			config.Values(od).Del(of)
			save = true
		}
	}
	return save, nil
}

func stringSliceEqual(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i, v := range a {
		if v != b[i] {
			return false
		}
	}
	return true
}

type ReplacerFunc func(map[string]interface{}) map[string]interface{}

func parseAndReplace(i interface{}, replacer ReplacerFunc) interface{} {

	switch m := i.(type) {
	case []map[string]interface{}:
		var new []map[string]interface{}
		for _, mm := range m {
			new = append(new, parseAndReplace(mm, replacer).(map[string]interface{}))
		}

		return new
	case map[string]interface{}:
		new := replacer(m)
		for k, v := range new {
			new[k] = parseAndReplace(v, replacer)
		}
		return new
	case []interface{}:
		var new []interface{}
		for _, mm := range m {
			new = append(new, parseAndReplace(mm, replacer))
		}

		return new

	}

	return i
}

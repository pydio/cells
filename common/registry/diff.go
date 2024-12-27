package registry

import (
	"reflect"

	diff "github.com/r3labs/diff/v3"

	"github.com/pydio/cells/v5/common/config"
)

func init() {
	config.RegisterCustomValueDiffer(&customValueDiffer{})
}

type customValueDiffer struct {
	DiffFunc func(path []string, a, b reflect.Value, p interface{}) error
}

func (c *customValueDiffer) Match(a, b reflect.Value) bool {
	if a.IsValid() && a.CanInterface() && b.IsValid() && b.CanInterface() {
		_, okA := a.Interface().(Item)
		_, okB := b.Interface().(Item)
		return okA && okB
	}

	return false
}

func (c *customValueDiffer) Diff(dt diff.DiffType, df diff.DiffFunc, cl *diff.Changelog, path []string, a, b reflect.Value, parent interface{}) error {
	sa := a.Interface().(Item)
	sb := b.Interface().(Item)

	if err := c.DiffFunc(append(path, "id"), reflect.ValueOf(sa.ID()), reflect.ValueOf(sb.ID()), parent); err != nil {
		return err
	}
	if err := c.DiffFunc(append(path, "name"), reflect.ValueOf(sa.Name()), reflect.ValueOf(sb.Name()), parent); err != nil {
		return err
	}
	if err := c.DiffFunc(append(path, "metadata"), reflect.ValueOf(sa.Metadata()), reflect.ValueOf(sb.Metadata()), parent); err != nil {
		return err
	}

	return nil
}

func (c *customValueDiffer) InsertParentDiffer(dfunc func(path []string, a, b reflect.Value, p interface{}) error) {
	c.DiffFunc = dfunc
}

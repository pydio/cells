package config

import (
	"reflect"
	"sync"

	diff "github.com/r3labs/diff/v3"
)

var CustomValueDiffers []diff.ValueDiffer

func init() {
	RegisterCustomValueDiffer(&noopDiffer{})
	RegisterCustomValueDiffer(&syncMapDiffer{})
}

func RegisterCustomValueDiffer(differ diff.ValueDiffer) {
	CustomValueDiffers = append(CustomValueDiffers, differ)
}

type noopDiffer struct{}

func (*noopDiffer) Match(a, b reflect.Value) bool {
	return a.Kind() == reflect.Func || b.Kind() == reflect.Func
}

func (*noopDiffer) Diff(dt diff.DiffType, df diff.DiffFunc, cl *diff.Changelog, path []string, a, b reflect.Value, parent interface{}) error {
	return nil
}

func (*noopDiffer) InsertParentDiffer(dfunc func(path []string, a, b reflect.Value, p interface{}) error) {
}

type syncMapDiffer struct {
	DiffFunc func(path []string, a, b reflect.Value, p interface{}) error
}

func (s *syncMapDiffer) Match(a, b reflect.Value) bool {
	st := reflect.TypeOf(&sync.Map{})

	if !a.IsValid() || !b.IsValid() {
		return false
	}
	if !a.CanInterface() || !b.CanInterface() {
		return false
	}
	return reflect.TypeOf(a.Interface()) == st && reflect.TypeOf(b.Interface()) == st
}

func (s *syncMapDiffer) Diff(dt diff.DiffType, df diff.DiffFunc, cl *diff.Changelog, path []string, a, b reflect.Value, parent interface{}) error {
	// Checking what's been added
	sma := a.Interface().(*sync.Map)
	smb := b.Interface().(*sync.Map)

	sma.Range(func(ka any, va any) bool {
		found := false
		smb.Range(func(kb any, vb any) bool {
			if ka == kb {
				// Must diff ka && kb
				found = true
				s.DiffFunc(append(path, ka.(string)), reflect.ValueOf(va), reflect.ValueOf(vb), nil)
			}

			return true
		})

		// Has been added
		if !found {
			cl.Add(diff.DELETE, append(path, ka.(string)), va, nil)
		}

		return true
	})

	smb.Range(func(kb any, vb any) bool {
		found := false
		sma.Range(func(ka any, _ any) bool {
			if ka == kb {
				// Must diff ka && kb
				found = true
				return false
			}

			return true
		})

		// Has been added
		if !found {
			cl.Add(diff.CREATE, append(path, kb.(string)), nil, vb)
		}

		return true
	})

	return nil
}

func (s *syncMapDiffer) InsertParentDiffer(dfunc func(path []string, a, b reflect.Value, p interface{}) error) {
	s.DiffFunc = dfunc
}

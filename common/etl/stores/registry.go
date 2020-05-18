package stores

import (
	"context"
	"fmt"

	"github.com/pydio/cells/common/etl/models"
	"github.com/pydio/cells/common/proto/jobs"
)

// Options passes params and merge options when initializing stores
type Options struct {
	Params       map[string]string
	MergeOptions *models.MergeOptions
	ActionInput  jobs.ActionMessage
	Context      context.Context
}

// CreateOptions initialize an empty Options object
func CreateOptions(ctx context.Context, param map[string]string, input jobs.ActionMessage) *Options {
	m := &Options{
		Context:      ctx,
		Params:       param,
		ActionInput:  input,
		MergeOptions: &models.MergeOptions{},
	}
	return m
}

// StoreLoader must return an initialized store
type StoreLoader func(options *Options) (interface{}, error)

var (
	r map[string]StoreLoader
)

func init() {
	r = make(map[string]StoreLoader)
}

// RegisterStore registers an available store
func RegisterStore(name string, store StoreLoader) {
	r[name] = store
}

// LoadReadableStore finds an available readable store by name
func LoadReadableStore(name string, options *Options) (models.ReadableStore, error) {
	if loader, ok := r[name]; ok {
		i, e := loader(options)
		if e != nil {
			return nil, e
		}
		if readableStore, o := i.(models.ReadableStore); o {
			return readableStore, nil
		}
	}
	return nil, fmt.Errorf("cannot find readable store " + name)
}

// GetWritableStore finds a writable store by its name
func LoadWritableStore(name string, options *Options) (models.WritableStore, error) {
	if loader, ok := r[name]; ok {
		i, e := loader(options)
		if e != nil {
			return nil, e
		}
		if writableStore, o := i.(models.WritableStore); o {
			return writableStore, nil
		}
	}
	return nil, fmt.Errorf("cannot find writeable store " + name)
}

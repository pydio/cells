/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package stores

import (
	"context"
	"fmt"

	"github.com/pydio/cells/v4/common/etl/models"
	"github.com/pydio/cells/v4/common/proto/jobs"
)

// Options passes params and merge options when initializing stores
type Options struct {
	Runtime      context.Context
	Params       map[string]string
	MergeOptions *models.MergeOptions
	ActionInput  jobs.ActionMessage
	Context      context.Context
}

// CreateOptions initialize an empty Options object
func CreateOptions(runtime, ctx context.Context, param map[string]string, input jobs.ActionMessage) *Options {
	m := &Options{
		Runtime:      runtime,
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

// LoadWritableStore finds a writable store by its name
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

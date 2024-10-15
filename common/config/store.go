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

package config

import (
	"context"
	"github.com/spf13/cast"
	"strconv"
	"strings"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

// Config holds the main structure of a configuration
type storeWithReferencePool struct {
	Store
	values        configx.Values
	ReferencePool map[string]*openurl.Pool[Store]
}

type Options struct {
	ReferencePool map[string]*openurl.Pool[Store]
}

// NewStoreWithReferencePool creates a new store
func NewStoreWithReferencePool(st Store, rp map[string]*openurl.Pool[Store]) Store {
	return &storeWithReferencePool{
		Store:         st,
		values:        configx.New(configx.WithStorer(&storeWithReferencePoolValues{Values: st.Val(), ReferencePool: rp})),
		ReferencePool: rp,
	}
}

func (v *storeWithReferencePool) Context(ctx context.Context) configx.Values {
	return v.values.Context(ctx)
}

// Val of the path
func (v *storeWithReferencePool) Val(s ...string) configx.Values {
	return v.values.Val(s...)
}

// Default value
func (v *storeWithReferencePool) Default(def any) configx.Values {
	return v.values.Default(def)
}

// Save the config in the underlying storage
func (v *storeWithReferencePool) Save(ctxUser string, ctxMessage string) error {
	for _, vv := range v.ReferencePool {
		store, err := vv.Get(v.Options().Context)
		if err != nil {
			return err
		}

		if err := store.Save(ctxUser, ctxMessage); err != nil {
			return err
		}
	}
	return v.Store.Save(ctxUser, ctxMessage)
}

type storeWithReferencePoolValues struct {
	configx.Values
	ctx           context.Context
	ReferencePool map[string]*openurl.Pool[Store]
}

func (v *storeWithReferencePoolValues) Context(ctx context.Context) configx.Values {
	return configx.New(configx.WithStorer(&storeWithReferencePoolValues{ctx: ctx, Values: v.Values.Context(ctx), ReferencePool: v.ReferencePool}))
}

// Val of the path
func (v *storeWithReferencePoolValues) Val(s ...string) configx.Values {
	return configx.New(configx.WithStorer(&storeWithReferencePoolValues{ctx: v.ctx, Values: v.Values.Val(strings.Join(s, "/")), ReferencePool: v.ReferencePool}))
}

// Val of the path
func (v *storeWithReferencePoolValues) Default(def any) configx.Values {
	return configx.New(configx.WithStorer(&storeWithReferencePoolValues{ctx: v.ctx, Values: v.Values.Default(def), ReferencePool: v.ReferencePool}))
}

func (v *storeWithReferencePoolValues) Get(wo ...configx.WalkOption) any {
	keys := v.Values.Key()
	return v.Values.Get(configx.WithInterceptor(func(i int, current any) (bool, any) {
		switch c := current.(type) {
		case map[any]any:
			if refV, ok := c["$ref"]; ok {
				refVStr, err := strconv.Unquote(cast.ToString(refV))
				if err != nil {
					refVStr = cast.ToString(refV)
				}
				ref := strings.SplitN(refVStr, "#", 2)
				refTarget, refValue := ref[0], ref[1]

				var configRef configx.Values
				if refTarget == "" {
					configRef = v.Val("#")
				} else {
					if rp := v.ReferencePool; rp != nil {
						if refTargetPool, ok := rp[refTarget]; ok {
							var err error

							store, err := refTargetPool.Get(v.ctx)
							if err != nil {
								return false, err
							}

							configRef = store.Val("#")
						}
					}
				}

				if configRef == nil {
					return false, errors.New("missing ref")
				}

				return true, configRef.Val(refValue).Val(keys[i+1:]...).Get()
			}
		case map[string]any:
			if refV, ok := c["$ref"]; ok {
				refVStr, err := strconv.Unquote(cast.ToString(refV))
				if err != nil {
					refVStr = cast.ToString(refV)
				}
				ref := strings.SplitN(refVStr, "#", 2)
				refTarget, refValue := ref[0], ref[1]

				var configRef configx.Values
				if refTarget == "" {
					configRef = v.Val("#")
				} else {
					if rp := v.ReferencePool; rp != nil {
						if refTargetPool, ok := rp[refTarget]; ok {
							var err error

							store, err := refTargetPool.Get(v.ctx)
							if err != nil {
								return false, err
							}

							configRef = store.Val("#")
						}
					}
				}

				if configRef == nil {
					return false, errors.New("missing ref")
				}

				return true, configRef.Val(refValue).Val(keys[i+1:]...).Get()
			}
		}

		return false, nil
	}))
}

// Set ensures that the keys that have been target are saved encrypted in the vault
func (v *storeWithReferencePoolValues) Set(data interface{}) error {

	refFound := false

	// Checking if we don't have a reference in the parent keys
	configx.Walk(v.Values.Key(), v.Values.Val("#").Get(), func(i int, current any) (bool, error) {
		switch vv := current.(type) {
		case map[any]any:
			if refV, ok := vv["$ref"]; ok {
				refVStr, err := strconv.Unquote(cast.ToString(refV))
				if err != nil {
					refVStr = cast.ToString(refV)
				}
				ref := strings.SplitN(refVStr, "#", 2)
				refTarget, refValue := ref[0], ref[1]

				var configRef Store
				if refTarget != "" {
					if rp := v.ReferencePool; rp != nil {
						if refTargetPool, ok := rp[refTarget]; ok {
							var err error

							configRef, err = refTargetPool.Get(v.ctx)
							if err != nil {
								return false, errors.StatusNotFound
							}
						}
					}
				}

				if configRef != nil {
					refFound = true
					keys := v.Values.Key()[i+1:]
					return false, configRef.Val(refValue).Val(keys...).Set(data)
				}
			}
		case map[string]any:
			if refV, ok := vv["$ref"]; ok {
				refVStr, err := strconv.Unquote(cast.ToString(refV))
				if err != nil {
					refVStr = cast.ToString(refV)
				}
				ref := strings.SplitN(refVStr, "#", 2)
				refTarget, refValue := ref[0], ref[1]

				var configRef Store
				if refTarget != "" {
					if rp := v.ReferencePool; rp != nil {
						if refTargetPool, ok := rp[refTarget]; ok {
							var err error

							configRef, err = refTargetPool.Get(v.ctx)
							if err != nil {
								return false, errors.StatusNotFound
							}
						}
					}
				}

				if configRef != nil {
					refFound = true
					keys := v.Values.Key()[i+1:]
					return false, configRef.Val(refValue).Val(keys...).Set(data)
				}
			}
		}

		return true, nil
	})

	if !refFound {
		return v.Values.Set(data)
	}

	return nil
}

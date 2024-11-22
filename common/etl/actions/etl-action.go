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

package actions

import (
	"context"
	"fmt"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/etl"
	"github.com/pydio/cells/v5/common/etl/stores"
	"github.com/pydio/cells/v5/common/proto/jobs"
)

type etlAction struct {
	common.RuntimeHolder
	params    map[string]string
	leftType  string
	rightType string
}

// ProvidesProgress implements ProgressProvider interface
func (c *etlAction) ProvidesProgress() bool {
	return true
}

// ParseStores interpret parameters as sync stores
func (c *etlAction) ParseStores(params map[string]string) error {
	c.params = params
	if r, o := params["left"]; o {
		c.leftType = r
	} else if t, o2 := params["type"]; o2 {
		c.leftType = t
	} else {
		return fmt.Errorf("task sync user must take a left or type parameter")
	}
	if r, o := params["right"]; o {
		c.rightType = r
	} else {
		// Use local as default target
		c.rightType = "cells-local"
	}

	return nil
}

func (c *etlAction) initMerger(ctx context.Context, input *jobs.ActionMessage) (*etl.Merger, error) {
	options := stores.CreateOptions(c.GetRuntimeContext(), ctx, c.params, input)
	left, err := stores.LoadReadableStore(c.leftType, options)
	if err != nil {
		return nil, err
	}

	right, err := stores.LoadWritableStore(c.rightType, options)
	if err != nil {
		return nil, err
	}

	return etl.NewMerger(left, right, options.MergeOptions), nil
}

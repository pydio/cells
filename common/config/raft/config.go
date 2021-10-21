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

package raft

import (
	"context"
	"encoding/json"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/storage"
	"github.com/pydio/cells/x/configx"
)

type conf struct {
	cli   storage.StorageEndpointClient
	cache configx.Values
}

var (
	_ configx.Entrypoint = (*conf)(nil)
)

func (c *conf) Get() configx.Value {
	c.cache = configx.New()

	resp, err := c.cli.Lookup(context.TODO(), &storage.LookupRequest{})
	if err != nil {
		return c.cache
	}

	if err := c.cache.Set(resp.GetValue()); err != nil {
		return c.cache
	}

	return c.cache
}

func (c *conf) Set(value interface{}) error {
	b, err := json.Marshal(value)
	if err != nil {
		return err
	}
	if _, err := c.cli.Propose(context.TODO(), &storage.ProposeRequest{Value: b}); err != nil {
		return err
	}
	return nil
}

func (c *conf) Del() error {
	return c.Set(nil)
}

func (c *conf) Val(path ...string) configx.Values {
	c.Get()
	return c.cache.Val(path...)
}

func NewConfig() configx.Entrypoint {
	cli := storage.NewStorageEndpointClient(common.ServiceStorageNamespace_+common.ServiceConfig, defaults.NewClient())
	return &conf{
		cli: cli,
	}
}

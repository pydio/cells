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

// Package versions provides a versioning mechanism for files modifications
package versions

import (
	"context"

	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/service"
)

var Drivers = service.StorageDrivers{}

type DAO interface {
	GetLastVersion(ctx context.Context, nodeUuid string) (*tree.ChangeLog, error)
	GetVersions(ctx context.Context, nodeUuid string) (chan *tree.ChangeLog, error)
	GetVersion(ctx context.Context, nodeUuid string, versionId string) (*tree.ChangeLog, error)
	StoreVersion(ctx context.Context, nodeUuid string, log *tree.ChangeLog) error
	DeleteVersionsForNode(ctx context.Context, nodeUuid string, versions ...*tree.ChangeLog) error
	DeleteVersionsForNodes(ctx context.Context, nodeUuid []string) error
	ListAllVersionedNodesUuids(ctx context.Context) (chan string, chan bool, chan error)
}

func Migrate(main, fromCtx, toCtx context.Context, dryRun bool, status chan service.MigratorStatus) (map[string]int, error) {
	out := map[string]int{
		"Versions": 0,
	}
	from, er := manager.Resolve[DAO](fromCtx)
	if er != nil {
		return nil, er
	}
	to, er := manager.Resolve[DAO](toCtx)
	if er != nil {
		return nil, er
	}
	uuids, done, errs := from.ListAllVersionedNodesUuids(fromCtx)
	var e error
loop1:
	for {
		select {
		case id := <-uuids:
			versions, _ := from.GetVersions(fromCtx, id)
			for version := range versions {
				if dryRun {
					out["Versions"]++
				} else if er := to.StoreVersion(toCtx, id, version); er == nil {
					out["Versions"]++
				} else {
					continue
				}
			}
			break loop1
		case e = <-errs:
			break loop1
		case <-done:
			break loop1
		}
	}
	return out, e
}

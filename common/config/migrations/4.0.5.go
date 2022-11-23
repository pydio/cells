/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package migrations

import (
	"fmt"

	"github.com/hashicorp/go-version"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/utils/configx"
)

func init() {
	v, _ := version.NewVersion("4.0.5")
	add(v, getMigration(cleanOverlappingObjects))
}

func cleanOverlappingObjects(conf configx.Values) error {

	core := conf.Val(configx.FormatPath("services", common.ServiceGrpcNamespace_+common.ServiceDataObjects))
	sources := config.SourceNamesFiltered(core.Val("sources").StringArray())

	var res []*object.MinioConfig

	for _, src := range sources {
		var obj *object.MinioConfig
		if e := conf.Val(configx.FormatPath("services", common.ServiceGrpcNamespace_+common.ServiceDataObjects_+src)).Scan(&obj); e == nil && obj != nil {
			if obj.StorageType == object.StorageType_LOCAL {
				res = append(res, obj)
			}
		}
	}

	if len(res) == 1 {
		// Nothing to do
		return nil
	}

	fmt.Println("We have", len(res), "objects loaded")
	var toRemove []*object.MinioConfig

	// Now check duplicates
	for k := len(res) - 1; k >= 0; k-- {
		o1 := res[k]
		for i := len(res) - 1; i >= 0; i-- {
			o2 := res[i]
			if o1 == o2 {
				continue
			}
			if o1.LocalFolder == o2.LocalFolder && o1.PeerAddress == "" {
				// This is a duplicate, remove it
				toRemove = append(toRemove, o2)
				res = append(res[:i], res[i+1:]...)
				break
			}
		}
	}

	fmt.Println("We now have", len(toRemove), "objects to remove")
	var newSources []string
	for _, s := range core.Val("sources").StringArray() {
		rem := false
		for _, o := range toRemove {
			if s == o.Name {
				rem = true
				break
			}
		}
		if !rem {
			newSources = append(newSources, s)
		}
	}
	_ = core.Val("sources").Set(newSources)

	for _, o := range toRemove {
		_ = conf.Val(configx.FormatPath("services", common.ServiceGrpcNamespace_+common.ServiceDataObjects_+o.Name)).Del()
	}

	return nil
}

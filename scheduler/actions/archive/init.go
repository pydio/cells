/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

// Package archive provides implementation of actions to work with archive files.
package archive

import (
	"context"
	"fmt"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/scheduler/actions"
)

func init() {

	manager := actions.GetActionsManager()

	manager.Register(compressActionName, func() actions.ConcreteAction {
		return &CompressAction{}
	})

	manager.Register(extractActionName, func() actions.ConcreteAction {
		return &ExtractAction{}
	})

}

func computeTargetName(ctx context.Context, handler views.Handler, dirPath string, base string, extension ...string) string {
	ext := ""
	if len(extension) > 0 {
		ext = "." + extension[0]
	}
	index := 0
	for {
		suffix := ""
		if index > 0 {
			suffix = fmt.Sprintf("-%d", index)
		}
		testPath := dirPath + "/" + base + suffix + ext
		if resp, err := handler.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: testPath}}); err == nil && resp.Node != nil {
			// node exists, try next one
			index++
		} else {
			return testPath
		}
	}
}

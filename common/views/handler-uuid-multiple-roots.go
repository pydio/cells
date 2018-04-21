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

package views

import (
	"context"
	"strings"

	"github.com/micro/go-micro/errors"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
)

type UuidRootsHandler struct {
	AbstractBranchFilter
}

func NewUuidRootsHandler() *UuidRootsHandler {
	u := &UuidRootsHandler{}
	u.inputMethod = u.updateInputBranch
	u.outputMethod = u.updateOutputBranch
	return u
}

func (h *UuidRootsHandler) updateInputBranch(ctx context.Context, identifier string, node *tree.Node) (context.Context, error) {

	return ctx, nil

}

func (h *UuidRootsHandler) updateOutputBranch(ctx context.Context, identifier string, node *tree.Node) (context.Context, error) {

	// Rebuild the path now
	branch, set := GetBranchInfo(ctx, identifier)
	if !set || branch.UUID == "ROOT" {
		return ctx, nil
	}
	if len(branch.RootNodes) == 0 {
		return ctx, errors.InternalServerError(VIEWS_LIBRARY_NAME, "Cannot find roots for workspace")
	}

	multiRootKey := ""
	var detectedRoot *tree.Node
	if len(branch.RootNodes) > 1 {
		// Root is not set, find it now
		wsRoots, err := h.rootKeysMap(branch.RootNodes)
		if err != nil {
			return ctx, err
		}
		for _, rNode := range wsRoots {
			if strings.HasPrefix(node.Path, rNode.Path) {
				detectedRoot = rNode
				break
			}
		}
		if detectedRoot == nil {
			return ctx, errors.InternalServerError(VIEWS_LIBRARY_NAME, "Cannot find root node in workspace, this should not happen")
		}
		multiRootKey = h.makeRootKey(detectedRoot) + "/"
	} else {
		var err error
		detectedRoot, err = h.getRoot(branch.RootNodes[0])
		if err != nil {
			return ctx, err
		}
	}

	log.Logger(ctx).Debug(multiRootKey)
	//node.Path = branch.Slug + "/" + multiRootKey + strings.TrimLeft(strings.TrimPrefix(node.Path, detectedRoot.Path), "/")

	return ctx, nil

}

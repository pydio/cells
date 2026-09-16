/*
 * Copyright (c) 2026. Abstrium SAS <team (at) pydio.com>
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

package wopi

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/proto/tree"
)

type FileInfoResponseBuilder interface {
	Build(ctx context.Context, n *tree.Node, r *http.Request) (*FileInfo, error)
}

var (
	responseBuilder FileInfoResponseBuilder = &BaseFileInfoResponseBuilder{OwnerID: "pydio"}
)

// SetFileInfoResponseBuilder is a hook for replace the default info response builder
func SetFileInfoResponseBuilder(b FileInfoResponseBuilder) {
	responseBuilder = b
}

func GetFileInfoResponseBuilder() FileInfoResponseBuilder {
	return responseBuilder
}

type BaseFileInfoResponseBuilder struct {
	OwnerID string
}

// Build builds a FileInfo response from a tree.Node and an http.Request
func (dfi *BaseFileInfoResponseBuilder) Build(ctx context.Context, n *tree.Node, _ *http.Request) (*FileInfo, error) {
	f := &FileInfo{
		BaseFileName:     n.GetStringMeta(common.MetaNamespaceNodeName),
		OwnerId:          dfi.OwnerID,
		Size:             n.GetSize(),
		Version:          fmt.Sprintf("%d", n.GetModTime().Unix()), // Todo - shall we switch to Etag?
		LastModifiedTime: n.GetModTime().Format(time.RFC3339),
		PydioPath:        n.Path,
	}

	// Find user info in claims, if any
	claims, ok := claim.FromContext(ctx)
	if !ok {
		return nil, fmt.Errorf("could not get claims from context")
	}

	f.UserId = claims.Name
	if claims.DisplayName == "" {
		f.UserFriendlyName = claims.Name
	} else {
		f.UserFriendlyName = claims.DisplayName
	}
	conf := config.Get(ctx, "frontend/plugin/editor.libreoffice")

	if conf.Val("COLLABORA_DISABLE_PRINT").Default(false).Bool() {
		f.HidePrintOption = true
		f.DisablePrint = true
	}
	if conf.Val("COLLABORA_DISABLE_EXPORT").Default(false).Bool() {
		f.HideExportOption = true
		f.DisableExport = true
	}
	if conf.Val("COLLABORA_DISABLE_SAVE").Default(false).Bool() {
		f.HideSaveOption = true
		f.UserCanNotWriteRelative = true
	}
	if conf.Val("COLLABORA_DISABLE_COPY").Default(false).Bool() {
		f.DisableCopy = true
	}

	// Access mode: downgrade only; most restrictive between node flag and config wins.
	f.UserCanWrite = n.GetStringMeta(common.MetaFlagReadonly) != "true"
	switch conf.Val("COLLABORA_DISABLE_MODE").Default("edit").String() {
	case "readonly":
		f.UserCanWrite = false
	case "comment":
		if f.UserCanWrite {
			f.UserCanOnlyComment = true
		}
	}

	f.EnableOwnerTermination = conf.Val("COLLABORA_DISABLE_OWNER_TERMINATION").Default(false).Bool()
	f.HideRepairOption = conf.Val("COLLABORA_DISABLE_REPAIR").Default(false).Bool()

	return f, nil
}

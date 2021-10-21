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

package views

import (
	"context"
	"fmt"
	"io"
	"path"
	"strconv"
	"strings"

	"github.com/micro/go-micro/errors"
	"github.com/pydio/minio-go"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/cells/common/views/models"
)

// UploadLimitFilter restricts atomic uploads by extension and maximum size, based on the front plugins configuration.
type UploadLimitFilter struct {
	AbstractHandler
}

// PutObject checks Upload Limits (size, extension) defined in the frontend on PutObject operation
func (a *UploadLimitFilter) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (int64, error) {

	size, exts, err := a.getUploadLimits(ctx)
	if err != nil {
		return 0, err
	}
	if size > 0 && requestData.Size > size {
		return 0, errors.Forbidden("max.upload.limit", fmt.Sprintf("Upload limit is %d", size))
	}
	if len(exts) > 0 {
		// Beware, Ext function includes the leading dot
		nodeExt := path.Ext(node.GetPath())
		allowed := false
		for _, e := range exts {
			if "."+strings.ToLower(e) == strings.ToLower(nodeExt) {
				allowed = true
				break
			}
		}
		if !allowed {
			return 0, errors.Forbidden("forbidden.upload.extensions", fmt.Sprintf("Extension %s is not allowed!", nodeExt))
		}
	}

	return a.next.PutObject(ctx, node, reader, requestData)
}

// MultipartPutObjectPart checks Upload Limits (size, extension) defined in the frontend on MultipartPutObjectPart
func (a *UploadLimitFilter) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *models.PutRequestData) (minio.ObjectPart, error) {

	size, exts, err := a.getUploadLimits(ctx)
	if err != nil {
		return minio.ObjectPart{}, err
	}
	if size > 0 && requestData.Size > size {
		return minio.ObjectPart{}, errors.Forbidden("max.upload.limit", fmt.Sprintf("Upload limit is %d", size))
	}
	if len(exts) > 0 {
		nodeExt := path.Ext(target.GetPath())
		allowed := false
		for _, e := range exts {
			if strings.EqualFold(e, nodeExt) {
				allowed = true
				break
			}
		}
		if !allowed {
			return minio.ObjectPart{}, errors.Forbidden("forbidden.upload.extensions", fmt.Sprintf("Extension %s is not allowed!", nodeExt))
		}
	}

	return a.next.MultipartPutObjectPart(ctx, target, uploadID, partNumberMarker, reader, requestData)
}

// Parse Upload Limits from config
func (a *UploadLimitFilter) getUploadLimits(ctx context.Context) (limit int64, extensions []string, err error) {

	pName := "core.uploader"
	maxSizeName := "UPLOAD_MAX_SIZE"
	extensionsName := "ALLOWED_EXTENSIONS"

	var stringExts string
	if v := config.Get("frontend", "plugin", pName).StringMap(); v != nil {
		if u, ok := v[maxSizeName]; ok {
			if l, e := strconv.ParseInt(u, 10, 64); e == nil {
				limit = l
			}
		}
		if exts, ok := v[extensionsName]; ok && strings.Trim(exts, " ") != "" {
			stringExts = strings.TrimSpace(exts)
		}
	}

	if i, ok := GetBranchInfo(ctx, "in"); ok {
		acl, e := permissions.AccessListFromContextClaims(ctx)
		if e != nil {
			err = e
			return
		}
		if e := permissions.AccessListLoadFrontValues(ctx, acl); e != nil {
			err = e
			return
		}
		aclParams := acl.FlattenedFrontValues().Val("parameters", pName)
		log.Logger(ctx).Debug("Checking upload max size from ACLs " + aclParams.String())
		scopes := permissions.FrontValuesScopesFromWorkspaces([]*idm.Workspace{&i.Workspace})
		for _, s := range scopes {
			limit = aclParams.Val(maxSizeName, s).Default(limit).Int64()
			stringExts = aclParams.Val(extensionsName, s).Default(stringExts).String()
		}
	}

	if stringExts != "" {
		extensions = strings.Split(stringExts, ",")
	}

	return
}

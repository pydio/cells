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
	"fmt"
	"io"
	"path"
	"strconv"
	"strings"

	"github.com/micro/go-micro/errors"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/minio-go"
)

type UploadLimitFilter struct {
	AbstractHandler
}

// Check Upload Limits (size, extension) defined in the frontend on PutObject operation
func (a *UploadLimitFilter) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *PutRequestData) (int64, error) {

	size, exts := a.getUploadLimits()
	if size > 0 && requestData.Size > size {
		return 0, errors.Forbidden(VIEWS_LIBRARY_NAME, fmt.Sprintf("Upload limit is %d", size))
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
			return 0, errors.Forbidden(VIEWS_LIBRARY_NAME, fmt.Sprintf("Extension %s is not allowed!", nodeExt))
		}
	}

	return a.next.PutObject(ctx, node, reader, requestData)
}

// Check Upload Limits (size, extension) defined in the frontend on MultipartPutObjectPart
func (a *UploadLimitFilter) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *PutRequestData) (minio.ObjectPart, error) {

	size, exts := a.getUploadLimits()
	if size > 0 && requestData.Size > size {
		return minio.ObjectPart{}, errors.Forbidden(VIEWS_LIBRARY_NAME, fmt.Sprintf("Upload limit is %d", size))
	}
	if len(exts) > 0 {
		nodeExt := path.Ext(target.GetPath())
		allowed := false
		for _, e := range exts {
			if strings.ToLower(e) == strings.ToLower(nodeExt) {
				allowed = true
				break
			}
		}
		if !allowed {
			return minio.ObjectPart{}, errors.Forbidden(VIEWS_LIBRARY_NAME, fmt.Sprintf("Extension %s is not allowed!", nodeExt))
		}
	}

	return a.next.MultipartPutObjectPart(ctx, target, uploadID, partNumberMarker, reader, requestData)
}

// Parse Upload Limits from config
func (a *UploadLimitFilter) getUploadLimits() (limit int64, extensions []string) {
	if v := config.Get("frontend", "plugin", "core.uploader").StringMap(); v != nil {
		if u, ok := v["UPLOAD_MAX_SIZE"]; ok {
			if l, e := strconv.ParseInt(u, 10, 64); e == nil {
				limit = l
			}
		}
		if exts, ok := v["ALLOWED_EXTENSIONS"]; ok && strings.Trim(exts, " ") != "" {
			extensions = strings.Split(strings.Trim(exts, " "), ",")
		}
	}
	return
}

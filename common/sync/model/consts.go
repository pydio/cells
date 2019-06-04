/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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

package model

import (
	"crypto/md5"
	"fmt"
	"io"
	"strings"

	"github.com/pydio/cells/common/proto/tree"
)

type DirectionType int

const (
	// Use unique path separator everywhere
	InternalPathSeparator = "/"
	// Minio default Etag when a new file is detected
	DefaultEtag = "00000000000000000000000000000000-1"

	DirectionLeft  DirectionType = 1
	DirectionRight DirectionType = 2
	DirectionBi    DirectionType = 3
)

func IsIgnoredFile(path string) (ignored bool) {
	return strings.HasSuffix(path, ".DS_Store") || strings.Contains(path, ".minio.sys") || strings.HasSuffix(path, "$buckets.json") || strings.HasSuffix(path, "$multiparts-session.json") || strings.HasSuffix(path, "--COMPUTE_HASH")
}

func DirWithInternalSeparator(filePath string) string {

	segments := strings.Split(filePath, InternalPathSeparator)
	return strings.Join(segments[:len(segments)-1], InternalPathSeparator)

}

func NodeRequiresChecksum(node *tree.Node) bool {
	return node.IsLeaf() && (node.Etag == "" || node.Etag == DefaultEtag || strings.Contains(node.Etag, "-"))
}

func StringContentToETag(uuid string) string {
	h := md5.New()
	io.Copy(h, strings.NewReader(uuid))
	return fmt.Sprintf("%x", h.Sum(nil))
}

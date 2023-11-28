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

package model

import (
	"crypto/md5"
	"fmt"
	"io"
	"strings"

	"github.com/gobwas/glob"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v4/common/proto/tree"
)

var (
	defaultIgnores = []glob.Glob{
		glob.MustCompile("**/$buckets.json", GlobSeparator),
		glob.MustCompile("**/$multiparts-session.json", GlobSeparator),
		glob.MustCompile("**/.DS_Store", GlobSeparator),
		glob.MustCompile("**/.minio.sys", GlobSeparator),
		glob.MustCompile("**/.minio.sys/**", GlobSeparator),
	}
)

func IgnoreMatcher(ignores ...glob.Glob) func(string) bool {
	mm := append(defaultIgnores, ignores...)
	return func(s string) bool {
		s = InternalPathSeparator + strings.TrimLeft(s, InternalPathSeparator)
		for _, i := range mm {
			if i.Match(s) {
				return true
			}
		}
		return false
	}
}

func IsIgnoredFile(path string, ignores ...glob.Glob) (ignored bool) {
	// For comparing, we make sure it has a left slash
	path = InternalPathSeparator + strings.TrimLeft(path, InternalPathSeparator)
	for _, i := range append(defaultIgnores, ignores...) {
		if i.Match(path) {
			return true
		}
	}
	return false
}

// NodeRequiresChecksum checks whether the current checksum is usable as index ETag or not.
// This part is linked to the **structured datasource**, and we still have return True if checksum is {md5}-numberOfParts
// otherwise at the next object Move ( = Copy in s3 ), the resulting ETag (now a real md5) will differ from the original one
// The downside is that uploading huge files will trigger a full re-reading of the file afterward to compute the stable md5.
func NodeRequiresChecksum(node tree.N) bool {
	return node.IsLeaf() && (node.GetEtag() == "" || node.GetEtag() == DefaultEtag || strings.Contains(node.GetEtag(), "-"))
}

func StringContentToETag(uuid string) string {
	h := md5.New()
	io.Copy(h, strings.NewReader(uuid))
	return fmt.Sprintf("%x", h.Sum(nil))
}

func ZapEndpoint(key string, e Endpoint) zapcore.Field {
	return zap.String(key, e.GetEndpointInfo().URI)
}

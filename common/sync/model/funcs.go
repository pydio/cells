package model

import (
	"crypto/md5"
	"fmt"
	"io"
	"strings"

	"github.com/gobwas/glob"
	"github.com/pydio/cells/common/proto/tree"
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

func IsIgnoredFile(path string, ignores ...glob.Glob) (ignored bool) {
	for _, i := range append(defaultIgnores, ignores...) {
		// For comparing, we make sure it has a left slash
		path = InternalPathSeparator + strings.TrimLeft(path, InternalPathSeparator)
		if i.Match(path) {
			return true
		}
	}
	return false
	//return strings.HasSuffix(path, ".DS_Store") || strings.Contains(path, ".minio.sys") || strings.HasSuffix(path, "$buckets.json") || strings.HasSuffix(path, "$multiparts-session.json") || strings.HasSuffix(path, "--COMPUTE_HASH")
}

func NodeRequiresChecksum(node *tree.Node) bool {
	return node.IsLeaf() && (node.Etag == "" || node.Etag == DefaultEtag || strings.Contains(node.Etag, "-"))
}

func StringContentToETag(uuid string) string {
	h := md5.New()
	io.Copy(h, strings.NewReader(uuid))
	return fmt.Sprintf("%x", h.Sum(nil))
}

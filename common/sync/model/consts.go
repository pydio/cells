package model

import (
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

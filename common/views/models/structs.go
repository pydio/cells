package models

import (
	"io"
	"strings"

	"github.com/pydio/cells/common"
)

type PutRequestData struct {
	Size              int64
	Md5Sum            []byte
	Sha256Sum         []byte
	Metadata          map[string]string
	MultipartUploadID string
	MultipartPartID   int
}

type GetRequestData struct {
	StartOffset int64
	Length      int64
	VersionId   string
}

type CopyRequestData struct {
	Metadata     map[string]string
	SrcVersionId string
	Progress     io.Reader
}

type MultipartRequestData struct {
	Metadata map[string]string

	ListKeyMarker      string
	ListUploadIDMarker string
	ListDelimiter      string
	ListMaxUploads     int
}

// MetaContentType looks for Content-Type or content-type key in metadata
func (p *PutRequestData) MetaContentType() string {
	if p.Metadata == nil {
		return ""
	}
	if c, o := p.Metadata[common.XContentType]; o {
		return c
	}
	if c, o := p.Metadata[strings.ToLower(common.XContentType)]; o {
		return c
	}
	return ""
}

// ContentTypeUnknown checks if cType is empty or generic "application/octet-stream"
func (p *PutRequestData) ContentTypeUnknown() bool {
	cType := p.MetaContentType()
	return cType == "" || cType == "application/octet-stream"
}

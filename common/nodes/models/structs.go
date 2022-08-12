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

package models

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/pydio/cells/v4/common"
)

// PutRequestData passes content-specific information during uploads
type PutRequestData struct {
	Size              int64
	Md5Sum            []byte
	Sha256Sum         []byte
	Metadata          map[string]string
	MultipartUploadID string
	MultipartPartID   int
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

// ReadMeta is an alias of map[string]string
type ReadMeta map[string]string

// PutMeta represents options specified by user for PutObject call
type PutMeta struct {
	UserMetadata       map[string]string
	Progress           io.Reader
	ContentType        string
	ContentEncoding    string
	ContentDisposition string
	ContentLanguage    string
	CacheControl       string
	NumThreads         uint
	// Valid values are STANDARD | REDUCED_REDUNDANCY | STANDARD_IA | ONEZONE_IA | INTELLIGENT_TIERING | GLACIER | DEEP_ARCHIVE | OUTPOSTS | GLACIER_IR
	StorageClass            string
	WebsiteRedirectLocation string
}

// SetRange - set the start and end offset of the object to be read.
// See https://tools.ietf.org/html/rfc7233#section-3.1 for reference.
func (o ReadMeta) SetRange(start, end int64) error {
	switch {
	case start == 0 && end < 0:
		// Read last '-end' bytes. `bytes=-N`.
		o["Range"] = fmt.Sprintf("bytes=%d", end)
	case 0 < start && end == 0:
		// Read everything starting from offset
		// 'start'. `bytes=N-`.
		o["Range"] = fmt.Sprintf("bytes=%d-", start)
	case 0 <= start && start <= end:
		// Read everything starting at 'start' till the
		// 'end'. `bytes=N-M`
		o["Range"] = fmt.Sprintf("bytes=%d-%d", start, end)
	default:
		// All other cases such as
		// bytes=-3-
		// bytes=5-3
		// bytes=-2-4
		// bytes=-3-0
		// bytes=-3--2
		// are invalid.
		return fmt.Errorf(
			"invalid range specified: start=%d end=%d",
			start, end)
	}
	return nil
}

// ContentTypeUnknown checks if cType is empty or generic "application/octet-stream"
func (p *PutRequestData) ContentTypeUnknown() bool {
	cType := p.MetaContentType()
	return cType == "" || cType == "application/octet-stream"
}

// GetRequestData passes optional Range instructions for reading file data
type GetRequestData struct {
	StartOffset int64
	Length      int64
	VersionId   string
}

// CopyRequestData can provide specific metadata, notably a version Id
type CopyRequestData struct {
	Metadata     map[string]string
	SrcVersionId string
	Progress     io.Reader
}

func (c *CopyRequestData) IsMove() bool {
	if c.Metadata != nil {
		if d, ok := c.Metadata[common.XAmzMetaDirective]; ok && d == "COPY" {
			return true
		}
	}
	return false
}

func (c *CopyRequestData) SetMeta(key, value string) {
	if c.Metadata == nil {
		c.Metadata = map[string]string{}
	}
	c.Metadata[key] = value
}

// MultipartRequestData is a metadata container for Multipart List Requests
type MultipartRequestData struct {
	Metadata map[string]string

	ListKeyMarker      string
	ListUploadIDMarker string
	ListDelimiter      string
	ListMaxUploads     int
}

// BucketInfo container for bucket metadata.
type BucketInfo struct {
	// The name of the bucket.
	Name string
	// Date the bucket was created.
	CreationDate time.Time
}

type ObjectInfoOwner struct {
	DisplayName string
	ID          string
}

// ObjectInfo container for object metadata.
type ObjectInfo struct {
	// An ETag is optionally set to md5sum of an object.  In case of multipart objects,
	// ETag is of the form MD5SUM-N where MD5SUM is md5sum of all individual md5sums of
	// each parts concatenated into one string.
	ETag string `json:"etag"`

	Key          string    `json:"name"`         // Name of the object
	LastModified time.Time `json:"lastModified"` // Date and time the object was last modified.
	Size         int64     `json:"size"`         // Size in bytes of the object.
	ContentType  string    `json:"contentType"`  // A standard MIME type describing the format of the object data.

	// Collection of additional metadata on the object.
	// eg: x-amz-meta-*, content-encoding etc.
	Metadata http.Header `json:"metadata" xml:"-"`

	// Owner name.
	Owner *ObjectInfoOwner

	// The class of storage used to store the object.
	StorageClass string `json:"storageClass"`

	// Error
	Err error `json:"-"`
}

// MultipartObjectPart container for particular part of an object.
// Can be used as CompletePart as well
type MultipartObjectPart struct {
	// Part number identifies the part.
	PartNumber int

	// Date and time the part was uploaded.
	LastModified time.Time

	// Entity tag returned when the part was uploaded, usually md5sum
	// of the part.
	ETag string

	// Size of the uploaded part data.
	Size int64
}

// MultipartObjectInfo container for multipart object metadata.
type MultipartObjectInfo struct {
	// Date and time at which the multipart upload was initiated.
	Initiated time.Time `type:"timestamp" timestampFormat:"iso8601"`

	Initiator struct {
		ID          string
		DisplayName string
	}
	Owner struct {
		DisplayName string
		ID          string
	}
	// The type of storage to use for the object. Defaults to 'STANDARD'.
	StorageClass string

	// Key of the object for which the multipart upload was initiated.
	Key string

	// Size in bytes of the object.
	Size int64

	// Upload ID that identifies the multipart upload.
	UploadID string `xml:"UploadId"`

	// Error
	Err error
}

// ListMultipartUploadsResult container for ListMultipartUploads response
type ListMultipartUploadsResult struct {
	Bucket             string
	KeyMarker          string
	UploadIDMarker     string `xml:"UploadIdMarker"`
	NextKeyMarker      string
	NextUploadIDMarker string `xml:"NextUploadIdMarker"`
	EncodingType       string
	MaxUploads         int64
	IsTruncated        bool
	Uploads            []MultipartObjectInfo `xml:"Upload"`
	Prefix             string
	Delimiter          string
	// A response can contain CommonPrefixes only if you specify a delimiter.
	CommonPrefixes []CommonPrefix
}

// ListObjectPartsResult container for ListObjectParts response.
type ListObjectPartsResult struct {
	Bucket   string
	Key      string
	UploadID string `xml:"UploadId"`

	Initiator struct {
		ID          string
		DisplayName string
	}
	Owner struct {
		DisplayName string
		ID          string
	}

	StorageClass         string
	PartNumberMarker     int
	NextPartNumberMarker int
	MaxParts             int

	// Indicates whether the returned list of parts is truncated.
	IsTruncated bool
	ObjectParts []MultipartObjectPart `xml:"Part"`

	EncodingType string
}

// CommonPrefix is used as virtual folders in object storage
type CommonPrefix struct {
	Prefix string
}

// ListBucketResult container for listObjects response.
type ListBucketResult struct {
	// A response can contain CommonPrefixes only if you have
	// specified a delimiter.
	CommonPrefixes []CommonPrefix
	// Metadata about each object returned.
	Contents  []ObjectInfo
	Delimiter string

	// Encoding type used to encode object keys in the response.
	EncodingType string

	// A flag that indicates whether or not ListObjects returned all of the results
	// that satisfied the search criteria.
	IsTruncated bool
	Marker      string
	MaxKeys     int64
	Name        string

	// When response is truncated (the IsTruncated element value in
	// the response is true), you can use the key name in this field
	// as marker in the subsequent request to get next set of objects.
	// Object storage lists objects in alphabetical order Note: This
	// element is returned only if you have delimiter request
	// parameter specified. If response does not include the NextMaker
	// and it is truncated, you can use the value of the last Key in
	// the response as the marker in the subsequent request to get the
	// next set of object keys.
	NextMarker string
	Prefix     string
}

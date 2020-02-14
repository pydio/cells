package minio

import (
	"context"
	"io"

	"fmt"
	"net/http"
	"net/url"

	"github.com/pydio/minio-go/pkg/encrypt"
)

// NewMultipartUpload - Initiates new multipart upload and returns the new uploadID.
func (c Core) NewMultipartUploadWithContext(ctx context.Context, bucket, object string, opts PutObjectOptions) (uploadID string, err error) {
	result, err := c.initiateMultipartUpload(ctx, bucket, object, opts)
	return result.UploadID, err
}

// PutObjectPart - Upload an object part.
func (c Core) PutObjectPartWithContext(ctx context.Context, bucket, object, uploadID string, partID int, data io.Reader, size int64, md5Base64, sha256Hex string, sse encrypt.ServerSide) (ObjectPart, error) {
	return c.uploadPart(ctx, bucket, object, uploadID, data, partID, md5Base64, sha256Hex, size, sse)
}

// CopyObjectPartWithContext - creates a part in a multipart upload by copying (a
// part of) an existing object.
func (c Core) CopyObjectPartWithContext(ctx context.Context, srcBucket, srcObject, destBucket, destObject string, uploadID string,
	partID int, startOffset, length int64, metadata map[string]string) (p CompletePart, err error) {

	return c.copyObjectPartDo(ctx, srcBucket, srcObject, destBucket, destObject, uploadID,
		partID, startOffset, length, metadata)
}

// CompleteMultipartUpload - Concatenate uploaded parts and commit to an object.
func (c Core) CompleteMultipartUploadWithContext(ctx context.Context, bucket, object, uploadID string, parts []CompletePart) (string, error) {
	res, err := c.completeMultipartUpload(ctx, bucket, object, uploadID, completeMultipartUpload{
		Parts: parts,
	})
	return res.ETag, err
}

// AbortMultipartUpload - Abort an incomplete upload.
func (c Core) AbortMultipartUploadWithContext(ctx context.Context, bucket, object, uploadID string) error {
	return c.abortMultipartUpload(ctx, bucket, object, uploadID)
}

func (c Core) ListMultipartUploadsWithContext(ctx context.Context, bucket, prefix, keyMarker, uploadIDMarker, delimiter string, maxUploads int) (result ListMultipartUploadsResult, err error) {

	// Get resources properly escaped and lined up before using them in http request.
	urlValues := make(url.Values)
	// Set uploads.
	urlValues.Set("uploads", "")
	// Set object key marker.
	if keyMarker != "" {
		urlValues.Set("key-marker", keyMarker)
	}
	// Set upload id marker.
	if uploadIDMarker != "" {
		urlValues.Set("upload-id-marker", uploadIDMarker)
	}
	// Set prefix marker.
	if prefix != "" {
		urlValues.Set("prefix", prefix)
	}
	// Set delimiter.
	if delimiter != "" {
		urlValues.Set("delimiter", delimiter)
	}

	// maxUploads should be 1000 or less.
	if maxUploads == 0 || maxUploads > 1000 {
		maxUploads = 1000
	}
	// Set max-uploads.
	urlValues.Set("max-uploads", fmt.Sprintf("%d", maxUploads))

	// Execute GET on bucketName to list multipart uploads.
	resp, err := c.executeMethod(ctx, "GET", requestMetadata{
		bucketName:       bucket,
		queryValues:      urlValues,
		contentSHA256Hex: emptySHA256Hex,
	})
	defer closeResponse(resp)
	if err != nil {
		return ListMultipartUploadsResult{}, err
	}
	if resp != nil {
		if resp.StatusCode != http.StatusOK {
			return ListMultipartUploadsResult{}, httpRespToErrorResponse(resp, bucket, "")
		}
	}
	// Decode response body.
	listMultipartUploadsResult := ListMultipartUploadsResult{}
	err = xmlDecoder(resp.Body, &listMultipartUploadsResult)
	if err != nil {
		return listMultipartUploadsResult, err
	}
	return listMultipartUploadsResult, nil

}

func (c Core) ListObjectPartsWithContext(ctx context.Context, bucketName, objectName, uploadID string, partNumberMarker, maxParts int) (ListObjectPartsResult, error) {
	// Get resources properly escaped and lined up before using them in http request.
	urlValues := make(url.Values)
	// Set part number marker.
	urlValues.Set("part-number-marker", fmt.Sprintf("%d", partNumberMarker))
	// Set upload id.
	urlValues.Set("uploadId", uploadID)

	// maxParts should be 1000 or less.
	if maxParts == 0 || maxParts > 1000 {
		maxParts = 1000
	}
	// Set max parts.
	urlValues.Set("max-parts", fmt.Sprintf("%d", maxParts))

	// Execute GET on objectName to get list of parts.
	resp, err := c.executeMethod(ctx, "GET", requestMetadata{
		bucketName:       bucketName,
		objectName:       objectName,
		queryValues:      urlValues,
		contentSHA256Hex: emptySHA256Hex,
	})
	defer closeResponse(resp)
	if err != nil {
		return ListObjectPartsResult{}, err
	}
	if resp != nil {
		if resp.StatusCode != http.StatusOK {
			return ListObjectPartsResult{}, httpRespToErrorResponse(resp, bucketName, objectName)
		}
	}
	// Decode list object parts XML.
	listObjectPartsResult := ListObjectPartsResult{}
	err = xmlDecoder(resp.Body, &listObjectPartsResult)
	if err != nil {
		return listObjectPartsResult, err
	}
	return listObjectPartsResult, nil
}

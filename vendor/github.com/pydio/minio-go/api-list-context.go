package minio

import (
	"context"
	"fmt"
	"net/http"
	"net/url"

	"github.com/pydio/minio-go/pkg/s3utils"
)

// ListBuckets list all buckets owned by this authenticated user.
//
// This call requires explicit authentication, no anonymous requests are
// allowed for listing buckets.
//
//   api := client.New(....)
//   for message := range api.ListBuckets() {
//       fmt.Println(message)
//   }
//
func (c Client) ListBucketsWithContext(ctx context.Context) ([]BucketInfo, error) {
	// Execute GET on service.
	resp, err := c.executeMethod(ctx, "GET", requestMetadata{contentSHA256Hex: emptySHA256Hex})
	defer closeResponse(resp)
	if err != nil {
		return nil, err
	}
	if resp != nil {
		if resp.StatusCode != http.StatusOK {
			return nil, httpRespToErrorResponse(resp, "", "")
		}
	}
	listAllMyBucketsResult := listAllMyBucketsResult{}
	err = xmlDecoder(resp.Body, &listAllMyBucketsResult)
	if err != nil {
		return nil, err
	}
	return listAllMyBucketsResult.Buckets.Bucket, nil
}


// ListObjects - List all the objects at a prefix, optionally with marker and delimiter
// you can further filter the results.
func (c Core) ListObjectsWithContext(ctx context.Context, bucket, prefix, marker, delimiter string, maxKeys int) (result ListBucketResult, err error) {

	// Validate bucket name.
	if err := s3utils.CheckValidBucketName(bucket); err != nil {
		return ListBucketResult{}, err
	}
	// Validate object prefix.
	if err := s3utils.CheckValidObjectNamePrefix(prefix); err != nil {
		return ListBucketResult{}, err
	}
	// Get resources properly escaped and lined up before
	// using them in http request.
	urlValues := make(url.Values)
	// Set object prefix.
	if prefix != "" {
		urlValues.Set("prefix", prefix)
	}
	// Set object marker.
	if marker != "" {
		urlValues.Set("marker", marker)
	}
	// Set delimiter.
	if delimiter != "" {
		urlValues.Set("delimiter", delimiter)
	}

	// maxkeys should default to 1000 or less.
	if maxKeys == 0 || maxKeys > 1000 {
		maxKeys = 1000
	}
	// Set max keys.
	urlValues.Set("max-keys", fmt.Sprintf("%d", maxKeys))

	// Execute GET on bucket to list objects.
	resp, err := c.executeMethod(ctx, "GET", requestMetadata{
		bucketName:       bucket,
		queryValues:      urlValues,
		contentSHA256Hex: emptySHA256Hex,
	})
	defer closeResponse(resp)
	if err != nil {
		return ListBucketResult{}, err
	}
	if resp != nil {
		if resp.StatusCode != http.StatusOK {
			return ListBucketResult{}, httpRespToErrorResponse(resp, bucket, "")
		}
	}
	// Decode listBuckets XML.
	listBucketResult := ListBucketResult{}
	err = xmlDecoder(resp.Body, &listBucketResult)
	if err != nil {
		return listBucketResult, err
	}
	return listBucketResult, nil

}

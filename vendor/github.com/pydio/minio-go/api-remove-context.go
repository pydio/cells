package minio

import (
	"context"
	"net/http"

	"github.com/pydio/minio-go/pkg/s3utils"
)

// RemoveObject remove an object from a bucket.
func (c Client) RemoveObjectWithContext(ctx context.Context, bucketName, objectName string) error {
	// Input validation.
	if err := s3utils.CheckValidBucketName(bucketName); err != nil {
		return err
	}
	if err := s3utils.CheckValidObjectName(objectName); err != nil {
		return err
	}
	// Execute DELETE on objectName.
	resp, err := c.executeMethod(ctx, "DELETE", requestMetadata{
		bucketName:       bucketName,
		objectName:       objectName,
		contentSHA256Hex: emptySHA256Hex,
	})
	defer closeResponse(resp)
	if err != nil {
		return err
	}
	if resp != nil {
		// if some unexpected error happened and max retry is reached, we want to let client know
		if resp.StatusCode != http.StatusNoContent {
			return httpRespToErrorResponse(resp, bucketName, objectName)
		}
	}

	// DeleteObject always responds with http '204' even for
	// objects which do not exist. So no need to handle them
	// specifically.
	return nil
}

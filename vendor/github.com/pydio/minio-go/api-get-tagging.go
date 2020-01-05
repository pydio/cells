/*
 * Minio Go Library for Amazon S3 Compatible Cloud Storage
 * Copyright 2015-2017 Minio, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package minio

import (
	"context"
	"net/http"
	"net/url"

	"github.com/pydio/minio-go/pkg/s3utils"
)

type Tag struct {
	Key string
	Value string
}
type TagSet struct{
	Tag []Tag
}
type Tagging struct{
	TagSet TagSet
}

// GetBucketPolicy - get bucket policy at a given path.
func (c Client) GetBucketTagging(bucketName string) ([]Tag, error) {
	// Input validation.
	if err := s3utils.CheckValidBucketName(bucketName); err != nil {
		return nil, err
	}
	tags, err := c.getBucketTagging(bucketName)
	if err != nil {
		errResponse := ToErrorResponse(err)
		if errResponse.Code == "NoSuchBucketPolicy" {
			return []Tag{}, nil
		}
		return nil, err
	}
	return tags, nil
}

// Request server for current bucket policy.
func (c Client) getBucketTagging(bucketName string) ([]Tag, error) {
	// Get resources properly escaped and lined up before
	// using them in http request.
	urlValues := make(url.Values)
	urlValues.Set("tagging", "")

	// Execute GET on bucket to list objects.
	resp, err := c.executeMethod(context.Background(), "GET", requestMetadata{
		bucketName:       bucketName,
		queryValues:      urlValues,
		contentSHA256Hex: emptySHA256Hex,
	})

	defer closeResponse(resp)
	if err != nil {
		// Handle specific NoSuchTagSetError (= no tag) with 500 Status
		if resp != nil {
			errResp := ErrorResponse{
				StatusCode: resp.StatusCode,
			}
			if e := xmlDecoder(resp.Body, &errResp); e == nil && errResp.Code == "NoSuchTagSetError" {
				return []Tag{}, nil
			}
			if resp.StatusCode != http.StatusOK {
				return nil, httpRespToErrorResponse(resp, bucketName, "")
			}
		}
		return nil, err
	}
	tagging := Tagging{}
	if er := xmlDecoder(resp.Body, &tagging); er != nil {
		return nil, er
	}
	return tagging.TagSet.Tag, nil
}

/*
 * Minio Go Library for Amazon S3 Compatible Cloud Storage
 * Copyright 2017 Minio, Inc.
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
	"bufio"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"time"

	context2 "github.com/pydio/cells/common/utils/context"
	"github.com/pydio/minio-go/pkg/s3utils"
)

// ListenBucketNotification - listen on bucket notifications.
func (c Client) ListenBucketNotificationWithContext(ctx context.Context, bucketName, prefix, suffix string, events []string, doneCh <-chan struct{}) <-chan NotificationInfo {
	notificationInfoCh := make(chan NotificationInfo, 1)
	// Only success, start a routine to start reading line by line.
	go func(notificationInfoCh chan<- NotificationInfo) {
		defer close(notificationInfoCh)

		// Validate the bucket name.
		if err := s3utils.CheckValidBucketName(bucketName); err != nil {
			notificationInfoCh <- NotificationInfo{
				Err: err,
			}
			return
		}

		// Check ARN partition to verify if listening bucket is supported
		if s3utils.IsAmazonEndpoint(*c.endpointURL) || s3utils.IsGoogleEndpoint(*c.endpointURL) {
			notificationInfoCh <- NotificationInfo{
				Err: ErrAPINotSupported("Listening for bucket notification is specific only to `minio` server endpoints"),
			}
			return
		}

		// Continuously run and listen on bucket notification.
		// Create a done channel to control 'ListObjects' go routine.
		retryDoneCh := make(chan struct{}, 1)

		// Indicate to our routine to exit cleanly upon return.
		defer close(retryDoneCh)

		meta, ok := context2.MinioMetaFromContext(ctx)

		// Wait on the jitter retry loop.
		for range c.newRetryTimerContinous(time.Second, time.Second*30, MaxJitter, retryDoneCh) {
			urlValues := make(url.Values)
			urlValues.Set("prefix", prefix)
			urlValues.Set("suffix", suffix)
			urlValues["events"] = events

			// Execute GET on bucket to list objects.
			ct := context.Background()
			if ok {
				ct = context2.WithMetadata(ct, meta)
			}
			resp, err := c.executeMethod(ct, "GET", requestMetadata{
				bucketName:       bucketName,
				queryValues:      urlValues,
				contentSHA256Hex: emptySHA256Hex,
			})
			if err != nil {
				notificationInfoCh <- NotificationInfo{
					Err: err,
				}
				return
			}

			// Validate http response, upon error return quickly.
			if resp.StatusCode != http.StatusOK {
				errResponse := httpRespToErrorResponse(resp, bucketName, "")
				notificationInfoCh <- NotificationInfo{
					Err: errResponse,
				}
				return
			}

			// Initialize a new bufio scanner, to read line by line.
			bio := bufio.NewScanner(resp.Body)

			// Close the response body.
			defer resp.Body.Close()

			// Unmarshal each line, returns marshalled values.
			for bio.Scan() {
				var notificationInfo NotificationInfo
				if err = json.Unmarshal(bio.Bytes(), &notificationInfo); err != nil {
					continue
				}
				// Send notificationInfo
				select {
				case notificationInfoCh <- notificationInfo:
				case <-doneCh:
					return
				}
			}
			// Look for any underlying errors.
			if err = bio.Err(); err != nil {
				// For an unexpected connection drop from server, we close the body
				// and re-connect.
				if err == io.ErrUnexpectedEOF {
					resp.Body.Close()
				}
			}
		}
	}(notificationInfoCh)

	// Returns the notification info channel, for caller to start reading from.
	return notificationInfoCh
}

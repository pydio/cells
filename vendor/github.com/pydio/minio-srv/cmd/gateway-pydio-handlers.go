/*
 * Minio Cloud Storage, (C) 2017 Minio, Inc.
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

package cmd

import (
	"errors"
	"io"
	"io/ioutil"
	"net"
	"net/http"
	"strconv"

	"encoding/hex"
	"encoding/json"

	"encoding/xml"
	"net/url"
	"sync"

	router "github.com/gorilla/mux"
	"github.com/pydio/minio-go/pkg/policy"
	"strings"
)

// GetObjectHandler - GET Object
// ----------
// This implementation of the GET operation retrieves object. To use GET,
// you must have READ access to the object.
func (api gatewayPydioAPIHandlers) GetObjectHandler(w http.ResponseWriter, r *http.Request) {
	var object, bucket string
	vars := router.Vars(r)
	bucket = vars["bucket"]
	object = vars["object"]

	pydioApi := api.PydioAPI()
	if pydioApi == nil {
		writeErrorResponse(w, ErrServerNotInitialized, r.URL)
		return
	}

	reqAuthType := getRequestAuthType(r)

	switch reqAuthType {
	case authTypePresignedV2, authTypeSignedV2:
		// Signature V2 validation.
		s3Error := isReqAuthenticatedV2(r)
		if s3Error != ErrNone {
			errorIf(errSignatureMismatch, "%s", dumpRequest(r))
			writeErrorResponse(w, s3Error, r.URL)
			return
		}
	case authTypeSigned, authTypePresigned:
		s3Error := isReqAuthenticated(r, serverConfig.GetRegion())
		if s3Error != ErrNone {
			errorIf(errSignatureMismatch, "%s", dumpRequest(r))
			writeErrorResponse(w, s3Error, r.URL)
			return
		}
	case authTypeAnonymous:
		// No verification needed for anonymous requests.
	default:
		// For all unknown auth types return error.
		writeErrorResponse(w, ErrAccessDenied, r.URL)
		return
	}

	versionId := r.URL.Query().Get("versionId")

	objInfo, err := pydioApi.GetObjectInfoWithContext(r.Context(), bucket, object, versionId)
	if err != nil {
		errorIf(err, "Unable to fetch object info.")
		apiErr := toAPIErrorCode(err)
		if apiErr == ErrNoSuchKey {
			apiErr = errAllowableObjectNotFound(bucket, r)
		}
		writeErrorResponse(w, apiErr, r.URL)
		return
	}

	// Get request range.
	var hrange *httpRange
	rangeHeader := r.Header.Get("Range")
	if rangeHeader != "" {
		if hrange, err = parseRequestRange(rangeHeader, objInfo.Size); err != nil {
			// Handle only errInvalidRange
			// Ignore other parse error and treat it as regular Get request like Amazon S3.
			if err == errInvalidRange {
				writeErrorResponse(w, ErrInvalidRange, r.URL)
				return
			}

			// log the error.
			errorIf(err, "Invalid request range")
		}
	}

	// Validate pre-conditions if any.
	if checkPreconditions(w, r, objInfo) {
		return
	}

	// Get the object.
	var startOffset int64
	length := objInfo.Size
	if hrange != nil {
		startOffset = hrange.offsetBegin
		length = hrange.getLength()
	}
	// Indicates if any data was written to the http.ResponseWriter
	dataWritten := false
	// io.Writer type which keeps track if any data was written.
	writer := funcToWriter(func(p []byte) (int, error) {
		if !dataWritten {
			// Set headers on the first write.
			// Set standard object headers.
			setObjectHeaders(w, objInfo, hrange)

			// Set any additional requested response headers.
			setHeadGetRespHeaders(w, r.URL.Query())

			dataWritten = true
		}
		return w.Write(p)
	})

	// Reads the object at startOffset and writes to mw.
	if err = pydioApi.GetObjectWithContext(r.Context(), bucket, object, startOffset, length, versionId, writer); err != nil {
		errorIf(err, "Unable to write to client.")
		if !dataWritten {
			// Error response only if no data has been written to client yet. i.e if
			// partial data has already been written before an error
			// occurred then no point in setting StatusCode and
			// sending error XML.
			writeErrorResponse(w, toAPIErrorCode(err), r.URL)
		}
		return
	}
	if !dataWritten {
		// If ObjectAPI.GetObject did not return error and no data has
		// been written it would mean that it is a 0-byte object.
		// call wrter.Write(nil) to set appropriate headers.
		writer.Write(nil)
	}

	// Get host and port from Request.RemoteAddr.
	host, port, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		host, port = "", ""
	}

	// Notify object accessed via a GET request.
	eventNotify(eventData{
		Type:      ObjectAccessedGet,
		Bucket:    bucket,
		ObjInfo:   objInfo,
		ReqParams: extractReqParams(r),
		UserAgent: r.UserAgent(),
		Host:      host,
		Port:      port,
	})
}

// PutObjectHandler - PUT Object
// ----------
// This implementation of the PUT operation adds an object to a bucket.
func (api gatewayPydioAPIHandlers) PutObjectHandler(w http.ResponseWriter, r *http.Request) {

	pydioApi := api.PydioAPI()
	if pydioApi == nil {
		writeErrorResponse(w, ErrServerNotInitialized, r.URL)
		return
	}

	// X-Amz-Copy-Source shouldn't be set for this call.
	if _, ok := r.Header["X-Amz-Copy-Source"]; ok {
		writeErrorResponse(w, ErrInvalidCopySource, r.URL)
		return
	}

	var object, bucket string
	vars := router.Vars(r)
	bucket = vars["bucket"]
	object = vars["object"]

	// TODO: we should validate the object name here

	// Get Content-Md5 sent by client and verify if valid
	md5Bytes, err := checkValidMD5(r.Header.Get("Content-Md5"))
	if err != nil {
		errorIf(err, "Unable to validate content-md5 format.")
		writeErrorResponse(w, ErrInvalidDigest, r.URL)
		return
	}

	/// if Content-Length is unknown/missing, deny the request
	size := r.ContentLength
	reqAuthType := getRequestAuthType(r)
	if reqAuthType == authTypeStreamingSigned {
		sizeStr := r.Header.Get("x-amz-decoded-content-length")
		size, err = strconv.ParseInt(sizeStr, 10, 64)
		if err != nil {
			errorIf(err, "Unable to parse `x-amz-decoded-content-length` into its integer value", sizeStr)
			writeErrorResponse(w, toAPIErrorCode(err), r.URL)
			return
		}
	}
	if size == -1 {
		writeErrorResponse(w, ErrMissingContentLength, r.URL)
		return
	}

	/// maximum Upload size for objects in a single operation
	if isMaxObjectSize(size) {
		writeErrorResponse(w, ErrEntityTooLarge, r.URL)
		return
	}

	// Extract metadata to be saved from incoming HTTP header.
	metadata, err := extractMetadataFromHeader(r.Header)
	if err != nil {
		errorIf(err, "found invalid http request header")
		writeErrorResponse(w, ErrInternalError, r.URL)
		return
	}
	if reqAuthType == authTypeStreamingSigned {
		if contentEncoding, ok := metadata["content-encoding"]; ok {
			contentEncoding = trimAwsChunkedContentEncoding(contentEncoding)
			if contentEncoding != "" {
				// Make sure to trim and save the content-encoding
				// parameter for a streaming signature which is set
				// to a custom value for example: "aws-chunked,gzip".
				metadata["content-encoding"] = contentEncoding
			} else {
				// Trimmed content encoding is empty when the header
				// value is set to "aws-chunked" only.

				// Make sure to delete the content-encoding parameter
				// for a streaming signature which is set to value
				// for example: "aws-chunked"
				delete(metadata, "content-encoding")
			}
		}
	}

	// Make sure we hex encode md5sum here.
	metadata["etag"] = hex.EncodeToString(md5Bytes)

	// Lock the object.
	objectLock := globalNSMutex.NewNSLock(bucket, object)
	if objectLock.GetLock(globalOperationTimeout) != nil {
		writeErrorResponse(w, ErrOperationTimedOut, r.URL)
		return
	}
	defer objectLock.Unlock()

	var objInfo ObjectInfo
	switch reqAuthType {
	case authTypeAnonymous:
		// Create anonymous object.
		//objInfo, err = objectAPI.AnonPutObject(bucket, object, size, r.Body, metadata, "")
		writeErrorResponse(w, ErrAccessDenied, r.URL)
	case authTypeStreamingSigned:
		// Initialize stream signature verifier.
		reader, s3Error := newSignV4ChunkedReader(r)
		if s3Error != ErrNone {
			errorIf(errSignatureMismatch, "%s", dumpRequest(r))
			writeErrorResponse(w, s3Error, r.URL)
			return
		}
		objInfo, err = pydioApi.PutObjectWithContext(r.Context(), bucket, object, size, reader, metadata, "")
	case authTypeSignedV2, authTypePresignedV2:
		s3Error := isReqAuthenticatedV2(r)
		if s3Error != ErrNone {
			errorIf(errSignatureMismatch, "%s", dumpRequest(r))
			writeErrorResponse(w, s3Error, r.URL)
			return
		}
		objInfo, err = pydioApi.PutObjectWithContext(r.Context(), bucket, object, size, r.Body, metadata, "")
	case authTypePresigned, authTypeSigned:
		if s3Error := reqSignatureV4Verify(r, serverConfig.GetRegion()); s3Error != ErrNone {
			errorIf(errSignatureMismatch, "%s", dumpRequest(r))
			writeErrorResponse(w, s3Error, r.URL)
			return
		}

		sha256sum := ""
		if !skipContentSha256Cksum(r) {
			sha256sum = getContentSha256Cksum(r)
		}

		// Create object.
		objInfo, err = pydioApi.PutObjectWithContext(r.Context(), bucket, object, size, r.Body, metadata, sha256sum)
	default:
		// For all unknown auth types return error.
		writeErrorResponse(w, ErrAccessDenied, r.URL)
		return
	}

	if err != nil {
		errorIf(err, "Unable to save an object %s", r.URL.Path)
		writeErrorResponse(w, toAPIErrorCode(err), r.URL)
		return
	}

	w.Header().Set("ETag", "\""+objInfo.ETag+"\"")
	writeSuccessResponseHeadersOnly(w)

	// Get host and port from Request.RemoteAddr.
	host, port, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		host, port = "", ""
	}

	// Notify object created event.
	eventNotify(eventData{
		Type:      ObjectCreatedPut,
		Bucket:    bucket,
		ObjInfo:   objInfo,
		ReqParams: extractReqParams(r),
		UserAgent: r.UserAgent(),
		Host:      host,
		Port:      port,
	})
}

// CopyObjectHandler - Copy Object
// ----------
// This implementation of the PUT operation adds an object to a bucket
// while reading the object from another source.
func (api gatewayPydioAPIHandlers) CopyObjectHandler(w http.ResponseWriter, r *http.Request) {
	vars := router.Vars(r)
	dstBucket := vars["bucket"]
	dstObject := vars["object"]

	pydioApi := api.PydioAPI()
	if pydioApi == nil {
		writeErrorResponse(w, ErrServerNotInitialized, r.URL)
		return
	}

	if s3Error := checkRequestAuthType(r, dstBucket, "s3:PutObject", serverConfig.GetRegion()); s3Error != ErrNone {
		writeErrorResponse(w, s3Error, r.URL)
		return
	}

	// TODO: Reject requests where body/payload is present, for now we don't even read it.

	// Copy source path.
	cpSrcPath, err := url.QueryUnescape(r.Header.Get("X-Amz-Copy-Source"))
	if err != nil {
		// Save unescaped string as is.
		cpSrcPath = r.Header.Get("X-Amz-Copy-Source")
	}
	// Remove ?versionId= in source
	var versionId string
	cleanPath := cpSrcPath
	if strings.Contains(cpSrcPath, "?versionId=") {
		parts := strings.Split(cpSrcPath, "?versionId=")
		cleanPath = parts[0]
		versionId = parts[1]
	}

	srcBucket, srcObject := path2BucketAndObject(cpSrcPath)
	// If source object is empty or bucket is empty, reply back invalid copy source.
	if srcObject == "" || srcBucket == "" {
		writeErrorResponse(w, ErrInvalidCopySource, r.URL)
		return
	}
	_, cleanSrcObject := path2BucketAndObject(cleanPath)

	// Check if metadata directive is valid.
	if !isMetadataDirectiveValid(r.Header) {
		writeErrorResponse(w, ErrInvalidMetadataDirective, r.URL)
		return
	}

	cpSrcDstSame := srcBucket == dstBucket && srcObject == dstObject
	// Hold write lock on destination since in both cases
	// - if source and destination are same
	// - if source and destination are different
	// it is the sole mutating state.
	objectDWLock := globalNSMutex.NewNSLock(dstBucket, dstObject)
	if objectDWLock.GetLock(globalOperationTimeout) != nil {
		writeErrorResponse(w, ErrOperationTimedOut, r.URL)
		return
	}
	defer objectDWLock.Unlock()

	// if source and destination are different, we have to hold
	// additional read lock as well to protect against writes on
	// source.
	if !cpSrcDstSame {
		// Hold read locks on source object only if we are
		// going to read data from source object.
		objectSRLock := globalNSMutex.NewNSLock(srcBucket, srcObject)
		if objectSRLock.GetRLock(globalOperationTimeout) != nil {
			writeErrorResponse(w, ErrOperationTimedOut, r.URL)
			return
		}
		defer objectSRLock.RUnlock()

	}

	objInfo, err := pydioApi.GetObjectInfoWithContext(r.Context(), srcBucket, cleanSrcObject, versionId)
	if err != nil {
		errorIf(err, "Unable to fetch object info.")
		writeErrorResponse(w, toAPIErrorCode(err), r.URL)
		return
	}

	// Verify before x-amz-copy-source preconditions before continuing with CopyObject.
	if checkCopyObjectPreconditions(w, r, objInfo) {
		return
	}

	/// maximum Upload size for object in a single CopyObject operation.
	if isMaxObjectSize(objInfo.Size) {
		writeErrorResponse(w, ErrEntityTooLarge, r.URL)
		return
	}

	defaultMeta := objInfo.UserDefined

	// Make sure to remove saved etag, CopyObject calculates a new one.
	delete(defaultMeta, "etag")

	newMetadata, err := getCpObjMetadataFromHeader(r.Header, defaultMeta)
	if err != nil {
		errorIf(err, "found invalid http request header")
		writeErrorResponse(w, ErrInternalError, r.URL)
	}
	// Check if x-amz-metadata-directive was not set to REPLACE and source,
	// desination are same objects.
	if !isMetadataReplace(r.Header) && cpSrcDstSame {
		// If x-amz-metadata-directive is not set to REPLACE then we need
		// to error out if source and destination are same.
		writeErrorResponse(w, ErrInvalidCopyDest, r.URL)
		return
	}

	// Copy source object to destination, if source and destination
	// object is same then only metadata is updated.
	objInfo, err = pydioApi.CopyObjectWithContext(r.Context(), srcBucket, srcObject, versionId, dstBucket, dstObject, newMetadata)
	if err != nil {
		writeErrorResponse(w, toAPIErrorCode(err), r.URL)
		return
	}

	response := generateCopyObjectResponse(objInfo.ETag, objInfo.ModTime)
	encodedSuccessResponse := encodeResponse(response)

	// Write success response.
	writeSuccessResponseXML(w, encodedSuccessResponse)

	// Get host and port from Request.RemoteAddr.
	host, port, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		host, port = "", ""
	}

	// Notify object created event.
	eventNotify(eventData{
		Type:      ObjectCreatedCopy,
		Bucket:    dstBucket,
		ObjInfo:   objInfo,
		ReqParams: extractReqParams(r),
		UserAgent: r.UserAgent(),
		Host:      host,
		Port:      port,
	})
}

// HeadObjectHandler - HEAD Object
// -----------
// The HEAD operation retrieves metadata from an object without returning the object itself.
func (api gatewayPydioAPIHandlers) HeadObjectHandler(w http.ResponseWriter, r *http.Request) {
	var object, bucket string
	vars := router.Vars(r)
	bucket = vars["bucket"]
	object = vars["object"]

	pydioApi := api.PydioAPI()
	if pydioApi == nil {
		writeErrorResponseHeadersOnly(w, ErrServerNotInitialized)
		return
	}

	reqAuthType := getRequestAuthType(r)

	switch reqAuthType {
	case authTypePresignedV2, authTypeSignedV2:
		// Signature V2 validation.
		s3Error := isReqAuthenticatedV2(r)
		if s3Error != ErrNone {
			errorIf(errSignatureMismatch, "%s", dumpRequest(r))
			writeErrorResponse(w, s3Error, r.URL)
			return
		}
	case authTypeSigned, authTypePresigned:
		s3Error := isReqAuthenticated(r, serverConfig.GetRegion())
		if s3Error != ErrNone {
			errorIf(errSignatureMismatch, "%s", dumpRequest(r))
			writeErrorResponse(w, s3Error, r.URL)
			return
		}
	case authTypeAnonymous:
		// No verification needed for anonymous requests.
	default:
		// For all unknown auth types return error.
		writeErrorResponse(w, ErrAccessDenied, r.URL)
		return
	}

	objInfo, err := pydioApi.GetObjectInfoWithContext(r.Context(), bucket, object, r.URL.Query().Get("versionId"))
	if err != nil {
		errorIf(err, "Unable to fetch object info.")
		apiErr := toAPIErrorCode(err)
		if apiErr == ErrNoSuchKey {
			apiErr = errAllowableObjectNotFound(bucket, r)
		}
		writeErrorResponse(w, apiErr, r.URL)
		return
	}

	// Validate pre-conditions if any.
	if checkPreconditions(w, r, objInfo) {
		return
	}

	// Set standard object headers.
	setObjectHeaders(w, objInfo, nil)

	// Successful response.
	w.WriteHeader(http.StatusOK)

	// Get host and port from Request.RemoteAddr.
	host, port, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		host, port = "", ""
	}

	// Notify object accessed via a HEAD request.
	eventNotify(eventData{
		Type:      ObjectAccessedHead,
		Bucket:    bucket,
		ObjInfo:   objInfo,
		ReqParams: extractReqParams(r),
		UserAgent: r.UserAgent(),
		Host:      host,
		Port:      port,
	})
}

// PutBucketPolicyHandler - PUT Bucket policy
// -----------------
// This implementation of the PUT operation uses the policy
// subresource to add to or replace a policy on a bucket
func (api gatewayPydioAPIHandlers) PutBucketPolicyHandler(w http.ResponseWriter, r *http.Request) {

	pydioApi := api.PydioAPI()
	if pydioApi == nil {
		writeErrorResponse(w, ErrServerNotInitialized, r.URL)
		return
	}

	if s3Error := checkRequestAuthType(r, "", "", serverConfig.GetRegion()); s3Error != ErrNone {
		writeErrorResponse(w, s3Error, r.URL)
		return
	}

	vars := router.Vars(r)
	bucket := vars["bucket"]

	// Before proceeding validate if bucket exists.
	_, err := pydioApi.GetBucketInfoWithContext(r.Context(), bucket)
	if err != nil {
		errorIf(err, "Unable to find bucket info.")
		writeErrorResponse(w, toAPIErrorCode(err), r.URL)
		return
	}

	// If Content-Length is unknown or zero, deny the
	// request. PutBucketPolicy always needs a Content-Length.
	if r.ContentLength == -1 || r.ContentLength == 0 {
		writeErrorResponse(w, ErrMissingContentLength, r.URL)
		return
	}
	// If Content-Length is greater than maximum allowed policy size.
	if r.ContentLength > maxAccessPolicySize {
		writeErrorResponse(w, ErrEntityTooLarge, r.URL)
		return
	}

	// Read access policy up to maxAccessPolicySize.
	// http://docs.aws.amazon.com/AmazonS3/latest/dev/access-policy-language-overview.html
	// bucket policies are limited to 20KB in size, using a limit reader.
	policyBytes, err := ioutil.ReadAll(io.LimitReader(r.Body, maxAccessPolicySize))
	if err != nil {
		errorIf(err, "Unable to read from client.")
		writeErrorResponse(w, toAPIErrorCode(err), r.URL)
		return
	}

	policyInfo := policy.BucketAccessPolicy{}
	if err = json.Unmarshal(policyBytes, &policyInfo); err != nil {
		writeErrorResponse(w, toAPIErrorCode(err), r.URL)
		return
	}

	if err = pydioApi.SetBucketPolicies(bucket, policyInfo); err != nil {
		writeErrorResponse(w, toAPIErrorCode(err), r.URL)
		return
	}
	// Success.
	writeSuccessNoContent(w)
}

// DeleteBucketPolicyHandler - DELETE Bucket policy
// -----------------
// This implementation of the DELETE operation uses the policy
// subresource to add to remove a policy on a bucket.
func (api gatewayPydioAPIHandlers) DeleteBucketPolicyHandler(w http.ResponseWriter, r *http.Request) {
	pydioApi := api.PydioAPI()
	if pydioApi == nil {
		writeErrorResponse(w, ErrServerNotInitialized, r.URL)
		return
	}

	if s3Error := checkRequestAuthType(r, "", "", serverConfig.GetRegion()); s3Error != ErrNone {
		writeErrorResponse(w, s3Error, r.URL)
		return
	}

	vars := router.Vars(r)
	bucket := vars["bucket"]

	// Before proceeding validate if bucket exists.
	_, err := pydioApi.GetBucketInfoWithContext(r.Context(), bucket)
	if err != nil {
		errorIf(err, "Unable to find bucket info.")
		writeErrorResponse(w, toAPIErrorCode(err), r.URL)
		return
	}

	// Delete bucket access policy, by passing an empty policy
	// struct.
	pydioApi.DeleteBucketPolicies(bucket)
	// Success.
	writeSuccessNoContent(w)
}

// GetBucketPolicyHandler - GET Bucket policy
// -----------------
// This operation uses the policy
// subresource to return the policy of a specified bucket.
func (api gatewayPydioAPIHandlers) GetBucketPolicyHandler(w http.ResponseWriter, r *http.Request) {
	pydioApi := api.PydioAPI()
	if pydioApi == nil {
		writeErrorResponse(w, ErrServerNotInitialized, r.URL)
		return
	}

	if s3Error := checkRequestAuthType(r, "", "", serverConfig.GetRegion()); s3Error != ErrNone {
		writeErrorResponse(w, s3Error, r.URL)
		return
	}

	vars := router.Vars(r)
	bucket := vars["bucket"]

	// Before proceeding validate if bucket exists.
	_, err := pydioApi.GetBucketInfoWithContext(r.Context(), bucket)
	if err != nil {
		errorIf(err, "Unable to find bucket info.")
		writeErrorResponse(w, toAPIErrorCode(err), r.URL)
		return
	}

	bp, err := pydioApi.GetBucketPolicies(bucket)
	if err != nil {
		errorIf(err, "Unable to read bucket policy.")
		writeErrorResponse(w, toAPIErrorCode(err), r.URL)
		return
	}

	policyBytes, err := json.Marshal(bp)
	if err != nil {
		errorIf(err, "Unable to read bucket policy.")
		writeErrorResponse(w, toAPIErrorCode(err), r.URL)
		return
	}
	// Write to client.
	w.Write(policyBytes)
}

// GetBucketNotificationHandler - This implementation of the GET
// operation uses the notification subresource to return the
// notification configuration of a bucket. If notifications are
// not enabled on the bucket, the operation returns an empty
// NotificationConfiguration element.
func (api gatewayPydioAPIHandlers) GetBucketNotificationHandler(w http.ResponseWriter, r *http.Request) {
	writeErrorResponse(w, ErrNotImplemented, r.URL)
}

// PutBucketNotificationHandler - Minio notification feature enables
// you to receive notifications when certain events happen in your bucket.
// Using this API, you can replace an existing notification configuration.
// The configuration is an XML file that defines the event types that you
// want Minio to publish and the destination where you want Minio to publish
// an event notification when it detects an event of the specified type.
// By default, your bucket has no event notifications configured. That is,
// the notification configuration will be an empty NotificationConfiguration.
func (api gatewayPydioAPIHandlers) PutBucketNotificationHandler(w http.ResponseWriter, r *http.Request) {
	writeErrorResponse(w, ErrNotImplemented, r.URL)
}

// ListenBucketNotificationHandler - list bucket notifications.
func (api gatewayPydioAPIHandlers) ListenBucketNotificationHandler(w http.ResponseWriter, r *http.Request) {
	writeErrorResponse(w, ErrNotImplemented, r.URL)
}

// PutBucketHandler - PUT Bucket
// ----------
// This implementation of the PUT operation creates a new bucket for authenticated request
func (api gatewayPydioAPIHandlers) PutBucketHandler(w http.ResponseWriter, r *http.Request) {
	objectAPI := api.ObjectAPI()
	if objectAPI == nil {
		writeErrorResponse(w, ErrServerNotInitialized, r.URL)
		return
	}

	// PutBucket does not have any bucket action.
	s3Error := checkRequestAuthType(r, "", "", globalMinioDefaultRegion)
	if s3Error == ErrInvalidRegion {
		// Clients like boto3 send putBucket() call signed with region that is configured.
		s3Error = checkRequestAuthType(r, "", "", serverConfig.GetRegion())
	}
	if s3Error != ErrNone {
		writeErrorResponse(w, s3Error, r.URL)
		return
	}

	vars := router.Vars(r)
	bucket := vars["bucket"]

	// Validate if incoming location constraint is valid, reject
	// requests which do not follow valid region requirements.
	location, s3Error := parseLocationConstraint(r)
	if s3Error != ErrNone {
		writeErrorResponse(w, s3Error, r.URL)
		return
	}

	bucketLock := globalNSMutex.NewNSLock(bucket, "")
	if bucketLock.GetLock(globalOperationTimeout) != nil {
		writeErrorResponse(w, ErrOperationTimedOut, r.URL)
		return
	}
	defer bucketLock.Unlock()

	// Proceed to creating a bucket.
	err := objectAPI.MakeBucketWithLocation(bucket, location)
	if err != nil {
		errorIf(err, "Unable to create a bucket.")
		writeErrorResponse(w, toAPIErrorCode(err), r.URL)
		return
	}

	// Make sure to add Location information here only for bucket
	w.Header().Set("Location", getLocation(r))

	writeSuccessResponseHeadersOnly(w)
}

// DeleteBucketHandler - Delete bucket
func (api gatewayPydioAPIHandlers) DeleteBucketHandler(w http.ResponseWriter, r *http.Request) {
	objectAPI := api.ObjectAPI()
	if objectAPI == nil {
		writeErrorResponse(w, ErrServerNotInitialized, r.URL)
		return
	}

	// DeleteBucket does not have any bucket action.
	if s3Error := checkRequestAuthType(r, "", "", serverConfig.GetRegion()); s3Error != ErrNone {
		writeErrorResponse(w, s3Error, r.URL)
		return
	}

	vars := router.Vars(r)
	bucket := vars["bucket"]

	// Attempt to delete bucket.
	if err := objectAPI.DeleteBucket(bucket); err != nil {
		errorIf(err, "Unable to delete a bucket.")
		writeErrorResponse(w, toAPIErrorCode(err), r.URL)
		return
	}

	// Write success response.
	writeSuccessNoContent(w)
}

// DeleteObjectHandler - delete an object
func (api gatewayPydioAPIHandlers) DeleteObjectHandler(w http.ResponseWriter, r *http.Request) {
	vars := router.Vars(r)
	bucket := vars["bucket"]
	object := vars["object"]

	pydioApi := api.PydioAPI()
	if pydioApi == nil {
		writeErrorResponse(w, ErrServerNotInitialized, r.URL)
		return
	}

	if s3Error := checkRequestAuthType(r, bucket, "s3:DeleteObject", serverConfig.GetRegion()); s3Error != ErrNone {
		writeErrorResponse(w, s3Error, r.URL)
		return
	}

	// http://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectDELETE.html
	// Ignore delete object errors while replying to client, since we are
	// suppposed to reply only 204. Additionally log the error for
	// investigation.

	if err := gatewayDeleteObject(pydioApi, bucket, object, r); err != nil {
		errorIf(err, "Unable to delete an object %s", pathJoin(bucket, object))
	}
	writeSuccessNoContent(w)
}

// DeleteMultipleObjectsHandler - deletes multiple objects.
func (api gatewayPydioAPIHandlers) DeleteMultipleObjectsHandler(w http.ResponseWriter, r *http.Request) {
	vars := router.Vars(r)
	bucket := vars["bucket"]

	pydioApi := api.PydioAPI()
	if pydioApi == nil {
		writeErrorResponse(w, ErrServerNotInitialized, r.URL)
		return
	}

	if s3Error := checkRequestAuthType(r, bucket, "s3:DeleteObject", serverConfig.GetRegion()); s3Error != ErrNone {
		writeErrorResponse(w, s3Error, r.URL)
		return
	}

	// Content-Length is required and should be non-zero
	// http://docs.aws.amazon.com/AmazonS3/latest/API/multiobjectdeleteapi.html
	if r.ContentLength <= 0 {
		writeErrorResponse(w, ErrMissingContentLength, r.URL)
		return
	}

	// Content-Md5 is requied should be set
	// http://docs.aws.amazon.com/AmazonS3/latest/API/multiobjectdeleteapi.html
	if _, ok := r.Header["Content-Md5"]; !ok {
		writeErrorResponse(w, ErrMissingContentMD5, r.URL)
		return
	}

	// Allocate incoming content length bytes.
	deleteXMLBytes := make([]byte, r.ContentLength)

	// Read incoming body XML bytes.
	if _, err := io.ReadFull(r.Body, deleteXMLBytes); err != nil {
		errorIf(err, "Unable to read HTTP body.")
		writeErrorResponse(w, ErrInternalError, r.URL)
		return
	}

	// Unmarshal list of keys to be deleted.
	deleteObjects := &DeleteObjectsRequest{}
	if err := xml.Unmarshal(deleteXMLBytes, deleteObjects); err != nil {
		errorIf(err, "Unable to unmarshal delete objects request XML.")
		writeErrorResponse(w, ErrMalformedXML, r.URL)
		return
	}

	var wg = &sync.WaitGroup{} // Allocate a new wait group.
	var dErrs = make([]error, len(deleteObjects.Objects))

	// Delete all requested objects in parallel.
	for index, object := range deleteObjects.Objects {
		wg.Add(1)
		go func(i int, obj ObjectIdentifier) {
			objectLock := globalNSMutex.NewNSLock(bucket, obj.ObjectName)
			if objectLock.GetLock(globalOperationTimeout) != nil {
				writeErrorResponse(w, ErrOperationTimedOut, r.URL)
				return
			}
			defer objectLock.Unlock()
			defer wg.Done()

			dErr := pydioApi.DeleteObjectWithContext(r.Context(), bucket, obj.ObjectName)
			if dErr != nil {
				dErrs[i] = dErr
			}
		}(index, object)
	}
	wg.Wait()

	// Collect deleted objects and errors if any.
	var deletedObjects []ObjectIdentifier
	var deleteErrors []DeleteError
	for index, err := range dErrs {
		object := deleteObjects.Objects[index]
		// Success deleted objects are collected separately.
		if err == nil {
			deletedObjects = append(deletedObjects, object)
			continue
		}
		if _, ok := errorCause(err).(ObjectNotFound); ok {
			// If the object is not found it should be
			// accounted as deleted as per S3 spec.
			deletedObjects = append(deletedObjects, object)
			continue
		}
		errorIf(err, "Unable to delete object. %s", object.ObjectName)
		// Error during delete should be collected separately.
		deleteErrors = append(deleteErrors, DeleteError{
			Code:    errorCodeResponse[toAPIErrorCode(err)].Code,
			Message: errorCodeResponse[toAPIErrorCode(err)].Description,
			Key:     object.ObjectName,
		})
	}

	// Generate response
	response := generateMultiDeleteResponse(deleteObjects.Quiet, deletedObjects, deleteErrors)
	encodedSuccessResponse := encodeResponse(response)

	// Write success response.
	writeSuccessResponseXML(w, encodedSuccessResponse)

	// Get host and port from Request.RemoteAddr failing which
	// fill them with empty strings.
	host, port, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		host, port = "", ""
	}

	// Notify deleted event for objects.
	for _, dobj := range deletedObjects {
		eventNotify(eventData{
			Type:   ObjectRemovedDelete,
			Bucket: bucket,
			ObjInfo: ObjectInfo{
				Name: dobj.ObjectName,
			},
			ReqParams: extractReqParams(r),
			UserAgent: r.UserAgent(),
			Host:      host,
			Port:      port,
		})
	}
}

// gatewayDeleteObject (derived from object-handlers-common deleteObject)
// is a convenient wrapper to delete an object, this
// is a common function to be called from object handlers and
// web handlers.
func gatewayDeleteObject(obj PydioGateway, bucket, object string, r *http.Request) (err error) {
	// Acquire a write lock before deleting the object.
	objectLock := globalNSMutex.NewNSLock(bucket, object)
	if objectLock.GetLock(globalOperationTimeout) != nil {
		return errors.New("Cannot get lock")
	}
	defer objectLock.Unlock()

	// Proceed to delete the object.
	if err = obj.DeleteObjectWithContext(r.Context(), bucket, object); err != nil {
		return err
	}

	// Get host and port from Request.RemoteAddr.
	host, port, _ := net.SplitHostPort(r.RemoteAddr)

	// Notify object deleted event.
	eventNotify(eventData{
		Type:   ObjectRemovedDelete,
		Bucket: bucket,
		ObjInfo: ObjectInfo{
			Name: object,
		},
		ReqParams: extractReqParams(r),
		UserAgent: r.UserAgent(),
		Host:      host,
		Port:      port,
	})

	return nil
}

// ListObjectsV1Handler - GET Bucket (List Objects) Version 1.
// --------------------------
// This implementation of the GET operation returns some or all (up to 1000)
// of the objects in a bucket. You can use the request parameters as selection
// criteria to return a subset of the objects in a bucket.
//
func (api gatewayPydioAPIHandlers) ListObjectsV1Handler(w http.ResponseWriter, r *http.Request) {
	vars := router.Vars(r)
	bucket := vars["bucket"]

	pydioApi := api.PydioAPI()
	if pydioApi == nil {
		writeErrorResponse(w, ErrServerNotInitialized, r.URL)
		return
	}

	reqAuthType := getRequestAuthType(r)

	switch reqAuthType {
	case authTypePresignedV2, authTypeSignedV2:
		// Signature V2 validation.
		s3Error := isReqAuthenticatedV2(r)
		if s3Error != ErrNone {
			errorIf(errSignatureMismatch, "%s", dumpRequest(r))
			writeErrorResponse(w, s3Error, r.URL)
			return
		}
	case authTypeSigned, authTypePresigned:
		s3Error := isReqAuthenticated(r, serverConfig.GetRegion())
		if s3Error != ErrNone {
			errorIf(errSignatureMismatch, "%s", dumpRequest(r))
			writeErrorResponse(w, s3Error, r.URL)
			return
		}
	case authTypeAnonymous:
		// No verification needed for anonymous requests.
	default:
		// For all unknown auth types return error.
		writeErrorResponse(w, ErrAccessDenied, r.URL)
		return
	}

	// Extract all the listObjectsV1 query params to their native
	// values.  N B We delegate validation of params to respective
	// gateway backends.
	prefix, marker, delimiter, maxKeys, _ := getListObjectsV1Args(r.URL.Query())

	versions := false
	if r.URL.Query().Get("versions") != "" {
		versions = true
	}

	// Inititate a list objects operation based on the input params.
	// On success would return back ListObjectsInfo object to be
	// marshalled into S3 compatible XML header.
	listObjectsInfo, err := pydioApi.ListObjectsWithContext(r.Context(), bucket, prefix, marker, delimiter, maxKeys, versions)
	if err != nil {
		errorIf(err, "Unable to list objects.")
		writeErrorResponse(w, toAPIErrorCode(err), r.URL)
		return
	}
	response := generateListObjectsV1Response(bucket, prefix, marker, delimiter, maxKeys, listObjectsInfo)
	// Write success response.
	writeSuccessResponseXML(w, encodeResponse(response))
}

// ListObjectsV2Handler - GET Bucket (List Objects) Version 2.
// --------------------------
// This implementation of the GET operation returns some or all (up to 1000)
// of the objects in a bucket. You can use the request parameters as selection
// criteria to return a subset of the objects in a bucket.
//
// NOTE: It is recommended that this API to be used for application development.
// Minio continues to support ListObjectsV1 for supporting legacy tools.
func (api gatewayPydioAPIHandlers) ListObjectsV2Handler(w http.ResponseWriter, r *http.Request) {
	vars := router.Vars(r)
	bucket := vars["bucket"]

	pydioApi := api.PydioAPI()
	if pydioApi == nil {
		writeErrorResponse(w, ErrServerNotInitialized, r.URL)
		return
	}

	reqAuthType := getRequestAuthType(r)

	switch reqAuthType {
	case authTypePresignedV2, authTypeSignedV2:
		// Signature V2 validation.
		s3Error := isReqAuthenticatedV2(r)
		if s3Error != ErrNone {
			errorIf(errSignatureMismatch, dumpRequest(r))
			writeErrorResponse(w, s3Error, r.URL)
			return
		}
	case authTypeSigned, authTypePresigned:
		s3Error := isReqAuthenticated(r, serverConfig.GetRegion())
		if s3Error != ErrNone {
			errorIf(errSignatureMismatch, dumpRequest(r))
			writeErrorResponse(w, s3Error, r.URL)
			return
		}
	case authTypeAnonymous:
		// No verification needed for anonymous requests.
	default:
		// For all unknown auth types return error.
		writeErrorResponse(w, ErrAccessDenied, r.URL)
		return
	}

	// Extract all the listObjectsV2 query params to their native values.
	prefix, token, startAfter, delimiter, fetchOwner, maxKeys, _ := getListObjectsV2Args(r.URL.Query())

	// In ListObjectsV2 'continuation-token' is the marker.
	marker := token
	// Check if 'continuation-token' is empty.
	if token == "" {
		// Then we need to use 'start-after' as marker instead.
		marker = startAfter
	}

	// Validate the query params before beginning to serve the request.
	// fetch-owner is not validated since it is a boolean
	if s3Error := validateListObjectsArgs(prefix, marker, delimiter, maxKeys); s3Error != ErrNone {
		writeErrorResponse(w, s3Error, r.URL)
		return
	}
	// Inititate a list objects operation based on the input params.
	// On success would return back ListObjectsV2Info object to be
	// serialized as XML and sent as S3 compatible response body.
	listObjectsV2Info, err := pydioApi.ListObjectsV2WithContext(r.Context(), bucket, prefix, token, fetchOwner, delimiter, maxKeys)
	if err != nil {
		errorIf(err, "Unable to list objects. Args to listObjectsV2 are bucket=%s, prefix=%s, token=%s, delimiter=%s", bucket, prefix, token, delimiter)
		writeErrorResponse(w, toAPIErrorCode(err), r.URL)
		return
	}

	response := generateListObjectsV2Response(bucket, prefix, token, listObjectsV2Info.ContinuationToken, startAfter, delimiter, fetchOwner, listObjectsV2Info.IsTruncated, maxKeys, listObjectsV2Info.Objects, listObjectsV2Info.Prefixes)

	// Write success response.
	writeSuccessResponseXML(w, encodeResponse(response))
}

// HeadBucketHandler - HEAD Bucket
// ----------
// This operation is useful to determine if a bucket exists.
// The operation returns a 200 OK if the bucket exists and you
// have permission to access it. Otherwise, the operation might
// return responses such as 404 Not Found and 403 Forbidden.
func (api gatewayPydioAPIHandlers) HeadBucketHandler(w http.ResponseWriter, r *http.Request) {
	vars := router.Vars(r)
	bucket := vars["bucket"]

	pydioApi := api.PydioAPI()
	if pydioApi == nil {
		writeErrorResponse(w, ErrServerNotInitialized, r.URL)
		return
	}

	reqAuthType := getRequestAuthType(r)

	switch reqAuthType {
	case authTypePresignedV2, authTypeSignedV2:
		// Signature V2 validation.
		s3Error := isReqAuthenticatedV2(r)
		if s3Error != ErrNone {
			errorIf(errSignatureMismatch, "%s", dumpRequest(r))
			writeErrorResponse(w, s3Error, r.URL)
			return
		}
	case authTypeSigned, authTypePresigned:
		s3Error := isReqAuthenticated(r, serverConfig.GetRegion())
		if s3Error != ErrNone {
			errorIf(errSignatureMismatch, "%s", dumpRequest(r))
			writeErrorResponse(w, s3Error, r.URL)
			return
		}
	case authTypeAnonymous:
		// No verification needed for anonymous requests.
	default:
		// For all unknown auth types return error.
		writeErrorResponse(w, ErrAccessDenied, r.URL)
		return
	}

	if _, err := pydioApi.GetBucketInfoWithContext(r.Context(), bucket); err != nil {
		errorIf(err, "Unable to fetch bucket info.")
		writeErrorResponseHeadersOnly(w, toAPIErrorCode(err))
		return
	}

	writeSuccessResponseHeadersOnly(w)
}

// GetBucketLocationHandler - GET Bucket location.
// -------------------------
// This operation returns bucket location.
func (api gatewayPydioAPIHandlers) GetBucketLocationHandler(w http.ResponseWriter, r *http.Request) {
	vars := router.Vars(r)
	bucket := vars["bucket"]

	objectAPI := api.ObjectAPI()
	if objectAPI == nil {
		writeErrorResponse(w, ErrServerNotInitialized, r.URL)
		return
	}
	reqAuthType := getRequestAuthType(r)

	switch reqAuthType {
	case authTypePresignedV2, authTypeSignedV2:
		// Signature V2 validation.
		s3Error := isReqAuthenticatedV2(r)
		if s3Error != ErrNone {
			errorIf(errSignatureMismatch, "%s", dumpRequest(r))
			writeErrorResponse(w, s3Error, r.URL)
			return
		}
	case authTypeSigned, authTypePresigned:
		s3Error := isReqAuthenticated(r, globalMinioDefaultRegion)
		if s3Error == ErrInvalidRegion {
			// Clients like boto3 send getBucketLocation() call signed with region that is configured.
			s3Error = isReqAuthenticated(r, serverConfig.GetRegion())
		}
		if s3Error != ErrNone {
			errorIf(errSignatureMismatch, "%s", dumpRequest(r))
			writeErrorResponse(w, s3Error, r.URL)
			return
		}
	case authTypeAnonymous:
		// No verification needed for anonymous requests.
	default:
		// For all unknown auth types return error.
		writeErrorResponse(w, ErrAccessDenied, r.URL)
		return
	}

	getBucketInfo := objectAPI.GetBucketInfo
	if reqAuthType == authTypeAnonymous {
		getBucketInfo = objectAPI.AnonGetBucketInfo
	}

	if _, err := getBucketInfo(bucket); err != nil {
		errorIf(err, "Unable to fetch bucket info.")
		writeErrorResponse(w, toAPIErrorCode(err), r.URL)
		return
	}

	// Generate response.
	encodedSuccessResponse := encodeResponse(LocationResponse{})
	// Get current region.
	region := serverConfig.GetRegion()
	if region != globalMinioDefaultRegion {
		encodedSuccessResponse = encodeResponse(LocationResponse{
			Location: region,
		})
	}

	// Write success response.
	writeSuccessResponseXML(w, encodedSuccessResponse)
}

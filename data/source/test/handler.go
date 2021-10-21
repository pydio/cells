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

package test

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/pborman/uuid"

	"github.com/micro/go-micro/metadata"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/test"
	"github.com/pydio/minio-go"
)

type Handler struct{}
type runImpl func(ctx context.Context, req *test.RunTestsRequest, conf *object.DataSource) (*test.TestResult, error)

func NewHandler() *Handler {
	return &Handler{}
}

// Run runs the defined tests
func (h *Handler) Run(ctx context.Context, req *test.RunTestsRequest, resp *test.RunTestsResponse) error {

	log.Logger(ctx).Info("-- Running Conformance Tests on " + name)

	// Assume there is a "cellsdata" datasource
	var dsConf *object.DataSource
	srvName := common.ServiceGrpcNamespace_ + common.ServiceDataSync_ + "cellsdata"
	if e := config.Get("services", srvName).Scan(&dsConf); e != nil {
		return fmt.Errorf("cannot read config for " + srvName)
	}
	h.doRun(ctx, req, resp, dsConf, h.TestAuthorization)
	h.doRun(ctx, req, resp, dsConf, h.TestEtags)
	h.doRun(ctx, req, resp, dsConf, h.TestEvents)

	// Try same tests on a gateway
	var gatewayConf *object.DataSource
	gatewayName := common.ServiceGrpcNamespace_ + common.ServiceDataSync_ + "s3ds"
	if e := config.Get("services", gatewayName).Scan(&gatewayConf); e != nil || gatewayConf == nil {
		res := test.NewTestResult("Testing on gateways3 datasource")
		res.Log("[SKIPPED] Cannot read config for " + gatewayName + " - Please create an S3 datasource named gateways3")
		resp.Results = append(resp.Results, res)
	} else {
		h.doRun(ctx, req, resp, gatewayConf, h.TestEtags)
		h.doRun(ctx, req, resp, gatewayConf, h.TestEvents)
	}

	return nil
}

func (h *Handler) doRun(ctx context.Context, req *test.RunTestsRequest, resp *test.RunTestsResponse, conf *object.DataSource, method runImpl) {
	r, e := method(ctx, req, conf)
	if e != nil {
		r.Fail(e.Error())
	}
	resp.Results = append(resp.Results, r)
}

// TestAuthorization checks that S3 server requires X-Pydio-User Header to be set
func (h *Handler) TestAuthorization(ctx context.Context, req *test.RunTestsRequest, dsConf *object.DataSource) (*test.TestResult, error) {

	result := test.NewTestResult("Test Authorization Header is required")
	// Hook to event listener
	core, er := minio.NewCore(fmt.Sprintf("localhost:%d", dsConf.ObjectsPort), dsConf.ApiKey, dsConf.ApiSecret, false)
	if er != nil {
		return result, er
	}
	key := uuid.New() + ".txt"
	content := uuid.New()
	_, e := core.PutObject(dsConf.ObjectsBucket, key, strings.NewReader(content), int64(len(content)), "", "", map[string]string{}, nil)
	if e == nil {
		core.RemoveObject(dsConf.ObjectsBucket, key)
		return result, fmt.Errorf("PutObject should have returned a 401 Error without a X-Pydio-User Header")
	} else {
		result.Log("PutObject without X-Pydio-User header returned error", e)
	}

	authCtx := metadata.NewContext(context.Background(), map[string]string{common.PydioContextUserKey: common.PydioSystemUsername})
	_, e = core.PutObjectWithContext(authCtx, dsConf.ObjectsBucket, key, strings.NewReader(content), int64(len(content)), minio.PutObjectOptions{})
	if e != nil {
		return result, fmt.Errorf("PutObject error (with X-Pydio-User Header): " + e.Error())
	}
	e = core.RemoveObjectWithContext(authCtx, dsConf.ObjectsBucket, key)
	if e != nil {
		return result, fmt.Errorf("PutObject with X-Pydio-User header passed but RemoteObjectWithContext failed")
	}
	result.Log("PutObject with X-Pydio-User header passed")

	return result, nil
}

// TestEtags checks various cases regarding dynamic etag computing when it is empty
func (h *Handler) TestEtags(ctx context.Context, req *test.RunTestsRequest, dsConf *object.DataSource) (*test.TestResult, error) {

	result := test.NewTestResult("Dynamic Etag Computation")

	// Load File Info going through Object Service
	core, er := minio.NewCore(fmt.Sprintf("localhost:%d", dsConf.ObjectsPort), dsConf.ApiKey, dsConf.ApiSecret, false)
	if er != nil {
		return result, er
	}
	opts := minio.StatObjectOptions{}
	opts.Set(common.PydioContextUserKey, common.PydioSystemUsername)
	authCtx := metadata.NewContext(context.Background(), map[string]string{common.PydioContextUserKey: common.PydioSystemUsername})

	var localFolder string
	var ok bool
	if localFolder, ok = dsConf.StorageConfiguration[object.StorageKeyFolder]; !ok {
		result.Log("[SKIPPED] This datasource does not have localFolder", dsConf)
	} else {
		// Create a random file inside local folder
		fileBaseName := uuid.New() + ".txt"
		filePath := filepath.Join(localFolder, fileBaseName)
		fileContent := uuid.New()
		if f, e := os.Create(filePath); e != nil {
			return result, e
		} else {
			defer os.Remove(filePath)
			fmt.Fprintf(f, fileContent)
			f.Close()
			result.Log("Created random data directly on local FS in " + filePath)
		}

		info, e := core.StatObject(dsConf.ObjectsBucket, fileBaseName, opts)
		if e != nil {
			return result, e
		}
		if info.ETag == "" {
			result.Log("No Etag was computed!", info)
		} else {
			result.Log("Etag was computed!")
			hasher := md5.New()
			hasher.Write([]byte(fileContent))
			out := hex.EncodeToString(hasher.Sum(nil))
			if out == info.ETag {
				result.Log("Etag is correct!")
			} else {
				result.Fail("No Etag was computed but value is not the one expected", info)
			}
		}
	}

	// Try multipart upload should have correct value as well
	uploadFile := uuid.New() + ".txt"
	contentPart1 := randString(5 * 1024 * 1024)
	contentPart2 := randString(5 * 1024 * 1024)
	uId, e := core.NewMultipartUploadWithContext(authCtx, dsConf.ObjectsBucket, uploadFile, minio.PutObjectOptions{})
	var parts []minio.CompletePart
	if p1, e := core.PutObjectPartWithContext(authCtx, dsConf.ObjectsBucket, uploadFile, uId, 1, strings.NewReader(contentPart1), int64(len(contentPart1)), "", "", nil); e == nil {
		parts = append(parts, minio.CompletePart{PartNumber: 1, ETag: p1.ETag})
	} else {
		return result, e
	}
	if p2, e := core.PutObjectPartWithContext(authCtx, dsConf.ObjectsBucket, uploadFile, uId, 2, strings.NewReader(contentPart2), int64(len(contentPart2)), "", "", nil); e == nil {
		parts = append(parts, minio.CompletePart{PartNumber: 2, ETag: p2.ETag})
	} else {
		return result, e
	}
	if _, e := core.CompleteMultipartUploadWithContext(authCtx, dsConf.ObjectsBucket, uploadFile, uId, parts); e != nil {
		return result, e
	}
	result.Log("Created multipart upload with 2 parts of 5MB (" + uploadFile + ")")
	// Register a defer for removing this object
	defer func() {
		core.RemoveObjectWithContext(authCtx, dsConf.ObjectsBucket, uploadFile)
	}()

	info2, e := core.StatObject(dsConf.ObjectsBucket, uploadFile, opts)
	if e != nil {
		return result, e
	}
	if info2.ETag == "" {
		result.Fail("[Multipart] No Etag was computed: ", info2)
	} else {
		result.Log("[Multipart] Etag was computed!")
		var out []byte
		hasher := md5.New()
		hasher.Write([]byte(contentPart1))
		out = append(out, hasher.Sum(nil)...)

		hasher.Reset()
		hasher.Write([]byte(contentPart2))
		out = append(out, hasher.Sum(nil)...)

		hasher.Reset()
		hasher.Write(out)
		outString := hex.EncodeToString(hasher.Sum(nil)) + "-2"

		if outString == info2.ETag {
			result.Log("[Multipart] Etag is correct!")
		} else {
			result.Fail("[Multipart] Etag was computed but value is not the one expected", info2, out)
		}
	}

	return result, nil
}

// TestEvents checks that metadata sent using the client is propagated to the corresponding s3 event
func (h *Handler) TestEvents(ctx context.Context, req *test.RunTestsRequest, dsConf *object.DataSource) (*test.TestResult, error) {

	result := test.NewTestResult("Events Metadata Propagation")

	// Hook to event listener
	core, er := minio.NewCore(fmt.Sprintf("localhost:%d", dsConf.ObjectsPort), dsConf.ApiKey, dsConf.ApiSecret, false)
	if er != nil {
		return result, er
	}

	opts := minio.StatObjectOptions{}
	opts.Set(common.PydioContextUserKey, common.PydioSystemUsername)
	authCtx := metadata.NewContext(context.Background(), map[string]string{common.PydioContextUserKey: common.PydioSystemUsername})

	result.Log("Setting up events listener")
	done := make(chan struct{})
	eventChan := core.ListenBucketNotificationWithContext(authCtx, dsConf.ObjectsBucket, "", "", []string{string(minio.ObjectCreatedAll)}, done)
	wg := &sync.WaitGroup{}
	wg.Add(1)
	var receivedInfo minio.NotificationInfo
	go func() {
		defer wg.Done()
		for {
			select {
			case i := <-eventChan:
				receivedInfo = i
				return
			case <-time.After(10 * time.Second):
				fmt.Println("Breaking after timeout - No Events returned!")
				return
			}
		}
	}()
	key := uuid.New() + ".txt"
	content := uuid.New()
	<-time.After(3 * time.Second)
	_, e := core.PutObjectWithContext(authCtx, dsConf.ObjectsBucket, key, strings.NewReader(content), int64(len(content)), minio.PutObjectOptions{})
	if e != nil {
		return result, e
	}

	result.Log("PutObject Passed")
	defer core.RemoveObjectWithContext(authCtx, dsConf.ObjectsBucket, key)

	wg.Wait()
	close(done)

	fmt.Println("Finished listening, checking event info: ", receivedInfo)
	result.Log("Finished listening, checking event info: ", receivedInfo)
	if receivedInfo.Records == nil || len(receivedInfo.Records) == 0 {
		return result, fmt.Errorf("NotificationInfo is empty")
	}
	metaFound := false
	for _, r := range receivedInfo.Records {
		k, e := url.QueryUnescape(r.S3.Object.Key)
		if e != nil {
			continue
		}
		if k == key {
			if v, ok := r.RequestParameters[common.PydioContextUserKey]; ok && v == common.PydioSystemUsername {
				metaFound = true
			}
		}
	}
	if metaFound {
		result.Log("Received correct event with initial metadata")
	} else {
		return result, fmt.Errorf("Could not find initial metadata in received events")
	}

	return result, nil

}

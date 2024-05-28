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

	minio "github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/notification"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/proto/test"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/propagator"
	"github.com/pydio/cells/v4/common/utils/std"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

type Handler struct {
	test.UnimplementedTesterServer
}

type runImpl func(ctx context.Context, oc nodes.StorageClient, req *test.RunTestsRequest, conf *object.DataSource) (*test.TestResult, error)

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) Name() string {
	return name
}

// Run runs the defined tests
func (h *Handler) Run(ctx context.Context, req *test.RunTestsRequest) (*test.RunTestsResponse, error) {

	log.Logger(ctx).Info("-- Running Conformance Tests on " + name)

	// Assume there is a "cellsdata" datasource
	var dsConf *object.DataSource
	srvName := common.ServiceGrpcNamespace_ + common.ServiceDataSync_ + "cellsdata"
	if e := config.Get("services", srvName).Scan(&dsConf); e != nil {
		return nil, fmt.Errorf("cannot read config for " + srvName)
	}
	dsConf.ApiKey = "mycustomapikey"
	dsConf.ApiSecret = "mycustomapisecret"
	dsConf.ObjectsHost = "127.0.0.1"
	dsConf.ObjectsPort = 9000
	oc, e := nodes.NewStorageClient(dsConf.ClientConfig())
	if e != nil {
		return nil, fmt.Errorf("cannot initialize client: %v", e)
	}

	resp := &test.RunTestsResponse{}
	h.doRun(ctx, req, resp, oc, dsConf, h.TestEvents)
	//h.doRun(ctx, req, resp, oc, dsConf, h.TestAuthorization)
	//h.doRun(ctx, req, resp, oc, dsConf, h.TestEtags)

	return resp, nil

	// Try same tests on a gateway
	var gatewayConf *object.DataSource
	gatewayName := common.ServiceGrpcNamespace_ + common.ServiceDataSync_ + "s3ds"
	if e := config.Get("services", gatewayName).Scan(&gatewayConf); e != nil || gatewayConf == nil {
		res := test.NewTestResult("Testing on gateways3 datasource")
		res.Log("[SKIPPED] Cannot read config for " + gatewayName + " - Please create an S3 datasource named gateways3")
		resp.Results = append(resp.Results, res)
	} else {
		h.doRun(ctx, req, resp, oc, gatewayConf, h.TestEtags)
		h.doRun(ctx, req, resp, oc, gatewayConf, h.TestEvents)
	}

	return resp, nil
}

func (h *Handler) doRun(ctx context.Context, req *test.RunTestsRequest, resp *test.RunTestsResponse, oc nodes.StorageClient, conf *object.DataSource, method runImpl) {
	r, e := method(ctx, oc, req, conf)
	if e != nil {
		r.Fail(e.Error())
	}
	resp.Results = append(resp.Results, r)
}

// TestAuthorization checks that S3 server requires X-Pydio-User Header to be set
func (h *Handler) TestAuthorization(ctx context.Context, oc nodes.StorageClient, req *test.RunTestsRequest, dsConf *object.DataSource) (*test.TestResult, error) {

	emptyContext := context.Background()
	authCtx := context.WithValue(emptyContext, common.PydioContextUserKey, common.PydioSystemUsername)
	authCtx = propagator.NewContext(authCtx, map[string]string{common.PydioContextUserKey: common.PydioSystemUsername})

	result := test.NewTestResult("Test Authorization Header is required")
	key := uuid.New() + ".txt"
	content := uuid.New()
	_, e := oc.PutObject(emptyContext, dsConf.ObjectsBucket, key, strings.NewReader(content), int64(len(content)), models.PutMeta{})
	if e == nil {
		_ = oc.RemoveObject(emptyContext, dsConf.ObjectsBucket, key)
		result.Log("PutObject should have returned a 401 Error without a X-Pydio-User Header")
	} else {
		result.Log("PutObject without X-Pydio-User header returned error", e)
	}

	_, e = oc.PutObject(authCtx, dsConf.ObjectsBucket, key, strings.NewReader(content), int64(len(content)), models.PutMeta{})
	if e != nil {
		return result, fmt.Errorf("PutObject error (with X-Pydio-User Header): " + e.Error())
	}
	e = oc.RemoveObject(authCtx, dsConf.ObjectsBucket, key)
	if e != nil {
		return result, fmt.Errorf("PutObject with X-Pydio-User header passed but RemoteObjectWithContext failed")
	}
	result.Log("PutObject with X-Pydio-User header passed")

	return result, nil
}

// TestEtags checks various cases regarding dynamic etag computing when it is empty
func (h *Handler) TestEtags(ctx context.Context, oc nodes.StorageClient, req *test.RunTestsRequest, dsConf *object.DataSource) (*test.TestResult, error) {

	result := test.NewTestResult("Dynamic Etag Computation")

	// Load File Info going through Object Service
	opts := map[string]string{common.PydioContextUserKey: common.PydioSystemUsername}
	authCtx := propagator.NewContext(context.Background(), map[string]string{common.PydioContextUserKey: common.PydioSystemUsername})

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

		info, e := oc.StatObject(authCtx, dsConf.ObjectsBucket, fileBaseName, opts)
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
				result.Fail("Etag was computed but value is not the one expected", info)
			}
		}
	}

	// Try multipart upload should have correct value as well
	uploadFile := uuid.New() + ".txt"
	contentPart1 := std.Randkey(5 * 1024 * 1024)
	contentPart2 := std.Randkey(5 * 1024 * 1024)
	uId, e := oc.NewMultipartUpload(authCtx, dsConf.ObjectsBucket, uploadFile, models.PutMeta{})
	var parts []models.MultipartObjectPart
	if p1, e := oc.PutObjectPart(authCtx, dsConf.ObjectsBucket, uploadFile, uId, 1, strings.NewReader(contentPart1), int64(len(contentPart1)), "", ""); e == nil {
		parts = append(parts, models.MultipartObjectPart{PartNumber: 1, ETag: p1.ETag})
	} else {
		return result, e
	}
	if p2, e := oc.PutObjectPart(authCtx, dsConf.ObjectsBucket, uploadFile, uId, 2, strings.NewReader(contentPart2), int64(len(contentPart2)), "", ""); e == nil {
		parts = append(parts, models.MultipartObjectPart{PartNumber: 2, ETag: p2.ETag})
	} else {
		return result, e
	}
	if _, e := oc.CompleteMultipartUpload(authCtx, dsConf.ObjectsBucket, uploadFile, uId, parts); e != nil {
		return result, e
	}
	result.Log("Created multipart upload with 2 parts of 5MB (" + uploadFile + ")")
	// Register a defer for removing this object
	defer func() {
		oc.RemoveObject(authCtx, dsConf.ObjectsBucket, uploadFile)
	}()

	info2, e := oc.StatObject(authCtx, dsConf.ObjectsBucket, uploadFile, opts)
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
func (h *Handler) TestEvents(ctx context.Context, oc nodes.StorageClient, req *test.RunTestsRequest, dsConf *object.DataSource) (*test.TestResult, error) {

	result := test.NewTestResult("Events Metadata Propagation")

	opts := minio.StatObjectOptions{}
	opts.Set(common.PydioContextUserKey, common.PydioSystemUsername)
	//authCtx := context.WithValue(context.Background(), common.PydioContextUserKey, common.PydioSystemUsername)
	authCtx := propagator.NewContext(context.Background(), map[string]string{common.PydioContextUserKey: common.PydioSystemUsername})
	listenCtx, cancel := context.WithCancel(authCtx)
	defer cancel()

	result.Log("Setting up events listener")
	eventChan, e := oc.BucketNotifications(listenCtx, dsConf.ObjectsBucket, "", []string{string(notification.ObjectCreatedAll)})
	if e != nil {
		return result, e
	}
	wg := &sync.WaitGroup{}
	wg.Add(1)
	var receivedInfo notification.Info
	go func() {
		defer wg.Done()
		for {
			select {
			case i := <-eventChan:
				receivedInfo = i.(notification.Info)
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
	if _, e = oc.PutObject(authCtx, dsConf.ObjectsBucket, key, strings.NewReader(content), int64(len(content)), models.PutMeta{}); e != nil {
		return result, e
	}

	result.Log("PutObject Passed")
	defer oc.RemoveObject(authCtx, dsConf.ObjectsBucket, key)

	wg.Wait()
	cancel()

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

func (h *Handler) TestNodesClient(ctx context.Context) (*test.TestResult, error) {
	res := &test.TestResult{}

	cl := compose.PathClient(ctx, nodes.AsAdmin())
	err := cl.ListNodesWithCallback(ctx, &tree.ListNodesRequest{Node: &tree.Node{Path: "pydiods1"}}, func(ctx context.Context, node *tree.Node, err error) error {
		res.Log("Got node", node.Zap())
		return nil
	}, false)

	return res, err
}

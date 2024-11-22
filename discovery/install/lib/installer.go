/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

// Package lib is in charge of installing cells. Used by both the Rest service and the CLI-based install.
package lib

import (
	"context"
	"fmt"
	"net/url"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/proto/install"
	"github.com/pydio/cells/v5/common/proto/object"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/configx"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

const (
	InstallAll = 1 << iota
	InstallDb
	InstallDs
	InstallConfig
	InstallFrontend
	InstallDSNOnly
)

type InstallProgressEvent struct {
	Progress int
	Message  string
}

func Install(ctx context.Context, c *install.InstallConfig, flags byte, publisher func(event *InstallProgressEvent)) error {

	//log.Logger(ctx).Info("Starting installation now")
	publisher(&InstallProgressEvent{Message: "Starting installation now", Progress: 0})

	if (flags&InstallAll) != 0 || (flags&InstallConfig) != 0 {
		if err := actionConfigsSet(ctx, c); err != nil {
			log.Logger(ctx).Error("Error while getting ports", zap.Error(err))
			return err
		}
		publisher(&InstallProgressEvent{Message: "Generating secrets", Progress: 80})
	}

	if (flags&InstallAll) != 0 || (flags&InstallDb) != 0 {
		if err := actionDatabaseAdd(ctx, c, flags); err != nil {
			log.Logger(ctx).Error("Error while adding database", zap.Error(err))
			return err
		}
		publisher(&InstallProgressEvent{Message: "Created main database", Progress: 30})
	}

	if (flags&InstallAll) != 0 || (flags&InstallDs) != 0 {
		if err := actionDatasourceAdd(ctx, c); err != nil {
			log.Logger(ctx).Error("Error while adding datasource", zap.Error(err))
			return err
		}
		publisher(&InstallProgressEvent{Message: "Created default datasources", Progress: 60})
	}

	if (flags&InstallAll) != 0 || (flags&InstallFrontend) != 0 {
		if err := actionFrontendsAdd(ctx, c); err != nil {
			log.Logger(ctx).Error("Error while creating logs directory", zap.Error(err))
			return err
		}
		publisher(&InstallProgressEvent{Message: "Creation of logs directory", Progress: 99})
	}
	return nil

}

func PerformCheck(ctx context.Context, name string, c *install.InstallConfig) (*install.CheckResult, error) {

	result := &install.CheckResult{}
	var wrappedError error
	wrapError := func(e error) {
		result.Success = false
		data, _ := json.Marshal(map[string]string{"error": e.Error()})
		result.JsonResult = string(data)
		wrappedError = e
	}

	switch name {
	case "DB":
		// Create DSN
		dsn, e := dsnFromInstallConfig(c)
		if e != nil {
			wrapError(e)
			break
		}
		if e := checkConnection(ctx, dsn); e != nil {
			wrapError(e)
			break
		}
		jData := map[string]interface{}{"message": "successfully connected to database"}
		if installExists, adminExists, err := checkCellsInstallExists(dsn); err == nil {
			if installExists {
				jData["tablesFound"] = true
			}
			if adminExists {
				jData["adminFound"] = true
			}
		}
		result.Success = true
		data, _ := json.Marshal(jData)
		result.JsonResult = string(data)

	case "MONGO":

		// Create a new client and connect to the server
		testDSN := c.DocumentsDSN
		if strings.Contains(testDSN, "srvScheme=true") {
			testDSN = strings.Replace(testDSN, "srvScheme=true", "", 1)
			testDSN = strings.Replace(testDSN, "mongodb://", "mongodb+srv://", 1)
		}
		opts := options.Client().ApplyURI(testDSN)
		client, err := mongo.Connect(context.Background(), opts)
		if err != nil {
			wrapError(err)
			break
		}

		ct, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()
		if err := client.Ping(ct, readpref.Primary()); err != nil {
			wrapError(err)
			break
		}
		_ = client.Disconnect(context.Background())
		result.Success = true
		jData := map[string]interface{}{"message": "successfully connected to MongoDB"}
		data, _ := json.Marshal(jData)
		result.JsonResult = string(data)

	case "S3_KEYS":
		endpoint := object.AmazonS3Endpoint
		secure := true
		isMinio := false
		if c.GetDsS3Custom() != "" {
			if u, e := url.Parse(c.GetDsS3Custom()); e != nil {
				wrapError(e)
				break
			} else {
				endpoint = u.Host
				if u.Scheme == "http" {
					secure = false
				}
				if u.Query().Get("minio") == "true" {
					isMinio = true
				}
			}
		}

		cfData := configx.New()
		cfData.Val("type").Set("mc")
		cfData.Val("endpoint").Set(endpoint)
		cfData.Val("key").Set(c.GetDsS3ApiKey())
		cfData.Val("secret").Set(c.GetDsS3ApiSecret())
		cfData.Val("secure").Set(secure)
		if r := c.GetDsS3CustomRegion(); r != "" {
			cfData.Val("region").Set(r)
		}
		if isMinio {
			cfData.Val("minioServer").Set(true)
		}
		mc, e := nodes.NewStorageClient(cfData)
		if e != nil {
			wrapError(e)
			break
		}
		// Check if buckets can be created
		data := make(map[string]interface{})
		var buckets []string
		if bb, er := mc.ListBuckets(ctx); er != nil {
			wrapError(er)
			break
		} else {
			for _, b := range bb {
				buckets = append(buckets, b.Name)
			}
		}
		data["buckets"] = buckets
		testBC := uuid.New()
		if er := mc.MakeBucket(ctx, testBC, c.GetDsS3CustomRegion()); er == nil {
			mc.RemoveBucket(ctx, testBC)
			data["canCreate"] = true
		} else {
			data["canCreate"] = false
		}
		result.Success = true
		dd, _ := json.Marshal(data)
		result.JsonResult = string(dd)

	case "S3_BUCKETS":
		endpoint := object.AmazonS3Endpoint
		secure := true
		if c.GetDsS3Custom() != "" {
			if u, e := url.Parse(c.GetDsS3Custom()); e != nil {
				wrapError(e)
				break
			} else {
				endpoint = u.Host
				if u.Scheme == "http" {
					secure = false
				}
			}
		}

		cfData := configx.New()
		cfData.Val("type").Set("mc")
		cfData.Val("endpoint").Set(endpoint)
		cfData.Val("key").Set(c.GetDsS3ApiKey())
		cfData.Val("secret").Set(c.GetDsS3ApiSecret())
		cfData.Val("secure").Set(secure)
		mc, e := nodes.NewStorageClient(cfData)
		if e != nil {
			wrapError(e)
			break
		}
		// Check if buckets can be created
		data := make(map[string]interface{})
		buckets := make(map[string]struct{})
		if bb, er := mc.ListBuckets(ctx); er != nil {
			wrapError(er)
			break
		} else {
			for _, b := range bb {
				buckets[b.Name] = struct{}{}
			}
		}
		toCheck := []string{
			c.GetDsS3BucketDefault(),
			c.GetDsS3BucketPersonal(),
			c.GetDsS3BucketCells(),
			c.GetDsS3BucketBinaries(),
			c.GetDsS3BucketThumbs(),
			c.GetDsS3BucketVersions(),
		}
		var created []string
		for _, check := range toCheck {
			if _, ok := buckets[check]; ok { // already exists
				continue
			}
			if e := mc.MakeBucket(ctx, check, c.GetDsS3CustomRegion()); e != nil {
				wrapError(e)
				break
			} else {
				created = append(created, check)
			}
		}
		result.Success = true
		data["bucketsCreated"] = created
		dd, _ := json.Marshal(data)
		result.JsonResult = string(dd)

	default:
		result.Success = false
		wrappedError = fmt.Errorf("unsupported check type " + name)
		data, _ := json.Marshal(map[string]string{"error": "unsupported check type " + name})
		result.JsonResult = string(data)

	}

	return result, wrappedError
}

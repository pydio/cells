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
	"net/url"

	json "github.com/pydio/cells/x/jsonx"

	"github.com/pborman/uuid"
	"github.com/pydio/minio-go"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/install"
)

const (
	InstallAll = 1 << iota
	InstallDb
	InstallDs
	InstallConfig
	InstallFrontend
)

type InstallProgressEvent struct {
	Progress int
	Message  string
}

func Install(ctx context.Context, c *install.InstallConfig, flags byte, publisher func(event *InstallProgressEvent)) error {

	//log.Logger(ctx).Info("Starting installation now")
	publisher(&InstallProgressEvent{Message: "Starting installation now", Progress: 0})

	if (flags&InstallAll) != 0 || (flags&InstallDb) != 0 {
		if err := actionDatabaseAdd(c); err != nil {
			log.Logger(ctx).Error("Error while adding database", zap.Error(err))
			return err
		}
		publisher(&InstallProgressEvent{Message: "Created main database", Progress: 30})
	}

	if (flags&InstallAll) != 0 || (flags&InstallDs) != 0 {
		if err := actionDatasourceAdd(c); err != nil {
			log.Logger(ctx).Error("Error while adding datasource", zap.Error(err))
			return err
		}
		publisher(&InstallProgressEvent{Message: "Created default datasources", Progress: 60})
	}

	if (flags&InstallAll) != 0 || (flags&InstallConfig) != 0 {
		if err := actionConfigsSet(c); err != nil {
			log.Logger(ctx).Error("Error while getting ports", zap.Error(err))
			return err
		}
		publisher(&InstallProgressEvent{Message: "Configuration of gateway services", Progress: 80})
	}

	if (flags&InstallAll) != 0 || (flags&InstallFrontend) != 0 {
		if err := actionFrontendsAdd(c); err != nil {
			log.Logger(ctx).Error("Error while creating logs directory", zap.Error(err))
			return err
		}
		publisher(&InstallProgressEvent{Message: "Creation of logs directory", Progress: 99})
	}
	return nil

}

func PerformCheck(ctx context.Context, name string, c *install.InstallConfig) *install.CheckResult {

	result := &install.CheckResult{}
	wrapError := func(e error) {
		result.Success = false
		data, _ := json.Marshal(map[string]string{"error": e.Error()})
		result.JsonResult = string(data)
	}

	switch name {
	case "DB":
		// Create DSN
		dsn, e := dsnFromInstallConfig(c)
		if e != nil {
			wrapError(e)
			break
		}
		if e := checkConnection(dsn); e != nil {
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

	case "S3_KEYS":
		endpoint := "s3.amazonaws.com"
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
		mc, e := minio.NewCore(endpoint, c.GetDsS3ApiKey(), c.GetDsS3ApiSecret(), secure)
		if e != nil {
			wrapError(e)
			break
		}
		// Check if buckets can be created
		data := make(map[string]interface{})
		var buckets []string
		if bb, er := mc.ListBuckets(); er != nil {
			wrapError(er)
			break
		} else {
			for _, b := range bb {
				buckets = append(buckets, b.Name)
			}
		}
		data["buckets"] = buckets
		testBC := uuid.New()
		if er := mc.MakeBucket(testBC, c.GetDsS3CustomRegion()); er == nil {
			mc.RemoveBucket(testBC)
			data["canCreate"] = true
		} else {
			data["canCreate"] = false
		}
		result.Success = true
		dd, _ := json.Marshal(data)
		result.JsonResult = string(dd)

	case "S3_BUCKETS":
		endpoint := "s3.amazonaws.com"
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
		mc, e := minio.NewCore(endpoint, c.GetDsS3ApiKey(), c.GetDsS3ApiSecret(), secure)
		if e != nil {
			wrapError(e)
			break
		}
		// Check if buckets can be created
		data := make(map[string]interface{})
		buckets := make(map[string]struct{})
		if bb, er := mc.ListBuckets(); er != nil {
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
			if e := mc.MakeBucket(check, c.GetDsS3CustomRegion()); e != nil {
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
		data, _ := json.Marshal(map[string]string{"error": "unsupported check type " + name})
		result.JsonResult = string(data)

	}

	return result
}

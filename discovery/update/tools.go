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

// Package update provides connection to a remote update server for upgrading cells binary
package update

import (
	"context"
	"crypto"
	"crypto/rsa"
	"encoding/asn1"
	"encoding/base64"
	"encoding/pem"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/golang/protobuf/jsonpb"
	update2 "github.com/inconshreveable/go-update"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"io/ioutil"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/update"
	"github.com/pydio/cells/common/utils"
)

// LoadUpdates will post a Json query to the update server to detect if there are any
// updates available
func LoadUpdates(ctx context.Context, config common.ConfigValues) ([]*update.Package, error) {

	urlConf := config.String("updateUrl")
	if urlConf == "" {
		return nil, errors.BadRequest(common.SERVICE_UPDATE, "cannot find update url")
	}
	parsed, e := url.Parse(urlConf)
	if e != nil {
		return nil, errors.BadRequest(common.SERVICE_UPDATE, e.Error())
	}
	if strings.Trim(parsed.Path, "/") == "" {
		parsed.Path = "/a/update-server"
	}
	channel := config.String("channel")
	if channel == "" {
		channel = "stable"
	}

	request := &update.UpdateRequest{
		PackageName:    common.PackageType,
		Channel:        channel,
		CurrentVersion: common.Version().String(),
		GOOS:           runtime.GOOS,
		GOARCH:         runtime.GOARCH,
	}

	log.Logger(ctx).Info("Posting Request for update", zap.Any("request", request))

	marshaller := jsonpb.Marshaler{}
	jsonReq, _ := marshaller.MarshalToString(request)
	reader := strings.NewReader(string(jsonReq))
	response, err := http.Post(strings.TrimRight(parsed.String(), "/")+"/", "application/json", reader)
	if err != nil {
		return nil, err
	}
	if response.StatusCode != 200 {
		return nil, fmt.Errorf("could not connect to the update server, error code was %d", response.StatusCode)
	}
	var updateResponse update.UpdateResponse
	if e := jsonpb.Unmarshal(response.Body, &updateResponse); e != nil {
		return nil, e
	}

	return updateResponse.AvailableBinaries, nil

}

// ApplyUpdate uses the info of an update.Package to download the binary and replace
// the current running binary. A restart is necessary afterward.
// The dryRun option will download the binary and just put it in the /tmp folder
func ApplyUpdate(ctx context.Context, p *update.Package, conf common.ConfigValues, dryRun bool, pgChan chan float64, doneChan chan bool, errorChan chan error) {

	defer func() {
		doneChan <- true
	}()

	if resp, err := http.Get(p.BinaryURL); err != nil {
		errorChan <- err
		return
	} else {
		defer resp.Body.Close()
		if resp.StatusCode != 200 {
			plain, _ := ioutil.ReadAll(resp.Body)
			errorChan <- errors.New("binary.download.error", "Error while downloading binary:"+string(plain), int32(resp.StatusCode))
			return
		}

		targetPath := ""
		if dryRun {
			targetPath = filepath.Join(os.TempDir(), "pydio-update")
		}
		if p.BinaryChecksum == "" || p.BinarySignature == "" {
			errorChan <- fmt.Errorf("Missing checksum and signature infos")
			return
		}
		checksum, e := base64.StdEncoding.DecodeString(p.BinaryChecksum)
		if e != nil {
			errorChan <- e
			return
		}
		signature, e := base64.StdEncoding.DecodeString(p.BinarySignature)
		if e != nil {
			errorChan <- e
			return
		}

		pKey := conf.Get("publicKey").(string)
		block, _ := pem.Decode([]byte(pKey))
		var pubKey rsa.PublicKey
		if _, err := asn1.Unmarshal(block.Bytes, &pubKey); err != nil {
			errorChan <- err
			return
		}
		dataDir, _ := config.ServiceDataDir(common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_UPDATE)
		oldPath := filepath.Join(dataDir, "revision-"+common.BuildStamp)

		/*
			pg := make(chan float64)
			done := make(chan bool, 1)
			go func() {
				defer close(pg)
				defer close(done)
				for {
					select {
					case progress := <-pg:
						log.Logger(ctx).Info("Download Progress", zap.Any("pg", progress))
					case <-done:
						log.Logger(ctx).Info("Download Finished")
						return
					}
				}
			}()
		*/

		reader := utils.BodyWithProgressMonitor(resp, pgChan, nil)

		er := update2.Apply(reader, update2.Options{
			Checksum:    checksum,
			Signature:   signature,
			TargetPath:  targetPath,
			OldSavePath: oldPath,
			Hash:        crypto.SHA256,
			PublicKey:   &pubKey,
			Verifier:    update2.NewRSAVerifier(),
		})
		if er != nil {
			errorChan <- er
		}
		return
	}

}

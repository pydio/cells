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
	"encoding/json"
	"encoding/pem"
	"fmt"
	"io/ioutil"
	"math"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"

	"github.com/golang/protobuf/jsonpb"
	"github.com/hashicorp/go-version"
	update2 "github.com/inconshreveable/go-update"
	"github.com/kardianos/osext"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/update"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/utils/filesystem"
	"github.com/pydio/cells/common/utils/net"
)

// LoadUpdates will post a Json query to the update server to detect if there are any
// updates available
func LoadUpdates(ctx context.Context, conf common.ConfigValues, request *update.UpdateRequest) ([]*update.Package, error) {

	urlConf := conf.String("updateUrl")
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
	channel := conf.String("channel")
	if channel == "" {
		channel = "stable"
	}

	// Set default values
	if request.PackageName == "" {
		request.PackageName = common.PackageType
	}
	request.Channel = channel
	if request.PackageName != common.PackageType {
		// This is an "upgrade" (from one package to another)
		// compute a version lower than current to get the current in the results set
		segments := common.Version().Segments()
		lower := service.ValidVersion(fmt.Sprintf("%v.%v.%v", math.Max(float64(segments[0]-1), 0), math.Max(float64(segments[1]-1), 0), 0))
		log.Logger(ctx).Info("Sending a lower version", zap.String("v", lower.String()))
		request.CurrentVersion = lower.String()
	} else {
		// This is an "update" : send current version to get the more recent ones
		request.CurrentVersion = common.Version().String()
	}
	request.GOOS = runtime.GOOS
	request.GOARCH = runtime.GOARCH

	log.Logger(ctx).Info("Posting Request for update", zap.Any("request", request))

	marshaller := jsonpb.Marshaler{}
	jsonReq, _ := marshaller.MarshalToString(request)
	reader := strings.NewReader(string(jsonReq))
	proxy := os.Getenv("CELLS_UPDATE_HTTP_PROXY")
	
	var response *http.Response
	var err error
	if proxy == "" {		
		response, err = http.Post(strings.TrimRight(parsed.String(), "/")+"/", "application/json", reader)
		if err != nil {
			return nil, err
		}
	}else{		
		postRequest, err := http.NewRequest("POST", strings.TrimRight(parsed.String(), "/")+"/", reader)
		if err != nil {
			return nil, err
		}
		postRequest.Header.Add("Content-type","application/json")

		proxyUrl, err := url.Parse(proxy)
		if err != nil {
			return nil, err
		}
		myClient := &http.Client{Transport: &http.Transport{Proxy: http.ProxyURL(proxyUrl)}}
		response, err = myClient.Do(postRequest)
	}
	
	if response.StatusCode != 200 {
		rErr := fmt.Errorf("could not connect to the update server, error code was %d", response.StatusCode)
		if response.StatusCode == 500 {
			var jsonErr struct {
				Title  string
				Detail string
			}
			data, _ := ioutil.ReadAll(response.Body)
			if e := json.Unmarshal(data, &jsonErr); e == nil {
				rErr = fmt.Errorf("failed connecting to the update server (%s), error code %d", jsonErr.Title, response.StatusCode)
			}
		}
		return nil, rErr
	}
	var updateResponse update.UpdateResponse
	if e := jsonpb.Unmarshal(response.Body, &updateResponse); e != nil {
		return nil, e
	}

	if request.LicenseInfo != nil {
		lic, ok := request.LicenseInfo["Key"]
		save, sOk := request.LicenseInfo["Save"]
		if ok && sOk && save == "true" {
			// Save license now : the check for update including license key passed without error,
			// this license must thus be valid
			log.Logger(ctx).Info("Saving LicenseKey to file now", zap.String("lic", lic))
			filePath := filepath.Join(config.ApplicationWorkingDir(), "pydio-license")
			if err := ioutil.WriteFile(filePath, []byte(lic), 0755); err != nil {
				return nil, fmt.Errorf("could not save license file to %s (%s), aborting upgrade", filePath, err.Error())
			}
		}
	}

	// When upgrading, filter out versions lesser than current
	if request.PackageName != common.PackageType {
		var bins []*update.Package
		for _, b := range updateResponse.AvailableBinaries {
			if service.ValidVersion(b.GetVersion()).LessThan(common.Version()) {
				continue
			}
			bins = append(bins, b)
		}
		updateResponse.AvailableBinaries = bins
	}

	// Sort by version using hashicorp sorting (X.X.X-rc should appear before X.X.X)
	sort.Slice(updateResponse.AvailableBinaries, func(i, j int) bool {
		va, _ := version.NewVersion(updateResponse.AvailableBinaries[i].Version)
		vb, _ := version.NewVersion(updateResponse.AvailableBinaries[j].Version)
		return va.LessThan(vb)
	})

	return updateResponse.AvailableBinaries, nil

}

// ApplyUpdate uses the info of an update.Package to download the binary and replace
// the current running binary. A restart is necessary afterward.
// The dryRun option will download the binary and just put it in the /tmp folder
func ApplyUpdate(ctx context.Context, p *update.Package, conf common.ConfigValues, dryRun bool, pgChan chan float64, doneChan chan bool, errorChan chan error) {

	defer func() {
		close(doneChan)
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

		// Write previous version inside the same folder
		if targetPath == "" {
			exe, er := osext.Executable()
			if er != nil {
				errorChan <- err
				return
			}
			targetPath = exe
		}
		backupFile := targetPath + "-rev-" + common.BuildStamp

		reader := net.BodyWithProgressMonitor(resp, pgChan, nil)

		er := update2.Apply(reader, update2.Options{
			Checksum:    checksum,
			Signature:   signature,
			TargetPath:  targetPath,
			OldSavePath: backupFile,
			Hash:        crypto.SHA256,
			PublicKey:   &pubKey,
			Verifier:    update2.NewRSAVerifier(),
		})
		if er != nil {
			errorChan <- er
		}

		// Now try to move previous version to the services folder. Do not break on error, just Warn in the logs.
		dataDir, _ := config.ServiceDataDir(common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_UPDATE)
		backupPath := filepath.Join(dataDir, filepath.Base(backupFile))
		if err := filesystem.SafeRenameFile(backupFile, backupPath); err != nil {
			log.Logger(ctx).Warn("Update successfully applied but previous binary could not be moved to backup folder", zap.Error(err))
		}

		return
	}

}

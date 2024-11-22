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
	"bytes"
	"context"
	"crypto"
	"crypto/rsa"
	"encoding/asn1"
	"encoding/base64"
	"encoding/pem"
	"fmt"
	"io"
	"math"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"

	version "github.com/hashicorp/go-version"
	update2 "github.com/inconshreveable/go-update"
	"github.com/kardianos/osext"
	"go.uber.org/zap"
	"google.golang.org/protobuf/encoding/protojson"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/update"
	runtime2 "github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/filesystem"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/net"
)

func init() {
	runtime2.RegisterEnvVariable("CELLS_UPDATE_HTTP_PROXY", "", "Outgoing Proxy URL to perform update checks")
}

// LoadUpdates will post a Json query to the update server to detect if there are any
// updates available
func LoadUpdates(ctx context.Context, conf configx.Values, request *update.UpdateRequest) ([]*update.Package, error) {
	if conf.Val("disableChecks").Default(false).Bool() {
		log.Logger(ctx).Info("Skipping update checks according to configurations - Returning empty list")
		// Return silently
		return []*update.Package{}, nil
	}
	urlConf := conf.Val("#/defaults/update/updateUrl").Default(conf.Val("updateUrl").String()).String()
	if urlConf == "" {
		return nil, errors.WithMessage(errors.StatusBadRequest, "cannot find update url")
	}
	parsed, e := url.Parse(urlConf)
	if e != nil {
		return nil, errors.Tag(e, errors.StatusInternalServerError)
	}
	if strings.Trim(parsed.Path, "/") == "" {
		parsed.Path = "/a/update-server"
	}

	channel := conf.Val("channel").Default(configx.Reference("#/defaults/update/channel")).Default("stable").String()

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
		log.Logger(ctx).Debug("Sending a lower version", zap.String("v", lower.String()))
		request.CurrentVersion = lower.String()
	} else {
		// This is an "update" : send current version to get the more recent ones
		request.CurrentVersion = common.Version().String()
	}
	request.GOOS = runtime.GOOS
	request.GOARCH = runtime.GOARCH

	log.Logger(ctx).Debug("Posting Request for update", zap.Any("request", request))

	jsonReq, _ := protojson.Marshal(request)
	postRequest, err := http.NewRequest("POST", strings.TrimRight(parsed.String(), "/")+"/", bytes.NewReader(jsonReq))
	if err != nil {
		return nil, err
	}
	postRequest.Header.Add("Content-type", "application/json")
	hC, e := getHttpClient()
	if e != nil {
		return nil, e
	}
	response, err := hC.Do(postRequest)
	if err != nil {
		return nil, err
	}

	if response.StatusCode != 200 {
		rErr := fmt.Errorf("could not connect to the update server, error code was %d", response.StatusCode)
		if response.StatusCode == 500 {
			var jsonErr struct {
				Title  string
				Detail string
			}
			data, _ := io.ReadAll(response.Body)
			if e := json.Unmarshal(data, &jsonErr); e == nil {
				rErr = fmt.Errorf("failed connecting to the update server (%s), error code %d", jsonErr.Title, response.StatusCode)
			}
		}
		return nil, rErr
	}
	var updateResponse update.UpdateResponse
	bb, _ := io.ReadAll(response.Body)
	if e := protojson.Unmarshal(bb, &updateResponse); e != nil {
		return nil, e
	}

	if request.LicenseInfo != nil {
		lic, ok := request.LicenseInfo["Key"]
		save, sOk := request.LicenseInfo["Save"]
		if ok && sOk && save == "true" {
			// Save license now : the check for update including license key passed without error,
			// this license must thus be valid
			log.Logger(ctx).Info("Saving LicenseKey to file now")
			filePath := filepath.Join(runtime2.ApplicationWorkingDir(), "pydio-license")
			if err := os.WriteFile(filePath, []byte(lic), 0644); err != nil {
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
func ApplyUpdate(ctx context.Context, p *update.Package, conf configx.Values, dryRun bool, pgChan chan float64, doneChan chan bool, errorChan chan error) {

	defer func() {
		close(doneChan)
	}()

	dlRequest, err := http.NewRequest("GET", p.BinaryURL, nil)
	if err != nil {
		errorChan <- err
		return
	}
	hC, e := getHttpClient()
	if e != nil {
		errorChan <- e
		return
	}

	if resp, err := hC.Do(dlRequest); err != nil {
		errorChan <- err
		return
	} else {
		defer resp.Body.Close()
		if resp.StatusCode != 200 {
			plain, _ := io.ReadAll(resp.Body)
			errorChan <- errors.WithMessagef(errors.StatusInternalServerError, "Error while downloading binary: %s, status code %d", string(plain), resp.StatusCode)
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

		pKey := conf.Val("#/defaults/update/publicKey").Default(conf.Val("publicKey").String()).String()
		if pKey == "" {
			errorChan <- fmt.Errorf("cannot find public key to verify binary integrity")
			return
		}
		block, _ := pem.Decode([]byte(pKey))
		if block == nil {
			errorChan <- fmt.Errorf("cannot decode public key")
			return
		}
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

		var backupFile string
		if runtime.GOOS == "windows" {
			suffix := filepath.Ext(targetPath)
			backupFile = fmt.Sprintf("%s-v%s%s", strings.TrimRight(targetPath, suffix), common.Version().String(), suffix)
		} else {
			backupFile = fmt.Sprintf("%s-v%s", targetPath, common.Version().String())
		}

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

		// Now try to move previous version to the services' folder. Do not break on error, just Warn in the logs.
		dataDir, _ := runtime2.ServiceDataDir(common.ServiceGrpcNamespace_ + common.ServiceUpdate)
		backupPath := filepath.Join(dataDir, filepath.Base(backupFile))
		if err := filesystem.SafeRenameFile(backupFile, backupPath); err != nil {
			log.Logger(ctx).Warn("Update successfully applied but previous binary could not be moved to backup folder", zap.Error(err))
		}

		return
	}

}

func getHttpClient() (*http.Client, error) {
	hC := http.DefaultClient
	if proxy := os.Getenv("CELLS_UPDATE_HTTP_PROXY"); proxy != "" {
		proxyUrl, err := url.Parse(proxy)
		if err != nil {
			return nil, fmt.Errorf("cannot parse CELLS_UPDATE_HTTP_PROXY : %s", err.Error())
		}
		hC = &http.Client{Transport: &http.Transport{Proxy: http.ProxyURL(proxyUrl)}}
	}
	return hC, nil
}

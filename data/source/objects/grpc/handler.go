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

package grpc

import (
	"bufio"
	"context"
	"fmt"
	minio "github.com/minio/minio/cmd"
	"go.uber.org/zap"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"

	_ "github.com/minio/minio/cmd/gateway"
	"github.com/pkg/errors"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/data/source/objects"
)

// ObjectHandler definition
type ObjectHandler struct {
	object.UnimplementedObjectsEndpointServer
	Config           *object.MinioConfig
	MinioConsolePort int
	handlerName      string
}

func (o *ObjectHandler) Name() string {
	return o.handlerName
}

func (o *ObjectHandler) LookupPath() string {
	ext := ""
	if runtime.GOOS == "windows" {
		ext = ".exe"
	}
	crtExe, er := os.Executable()
	if er != nil {
		return ""
	}
	return filepath.Join(filepath.Dir(crtExe), "minio"+ext)
}

func (o *ObjectHandler) Downloader(ctx context.Context, target string) error {
	ext := ""
	if runtime.GOOS == "windows" {
		ext = ".exe"
	}
	latest := fmt.Sprintf("https://dl.min.io/server/minio/release/%s-%s/minio%s", runtime.GOOS, runtime.GOARCH, ext)
	// latestCheck := latest + ".sha256sum"
	log.Logger(ctx).Info("Starting download of " + latest + ", please wait...")
	resp, e := http.Get(latest)
	if e != nil {
		return e
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		content, _ := ioutil.ReadAll(resp.Body)
		return fmt.Errorf("wrong status code: %d, error was %s", resp.StatusCode, string(content))
	}
	f, e := os.OpenFile(target, os.O_CREATE|os.O_WRONLY, 0777)
	if e != nil {
		return e
	}
	defer f.Close()
	n, e := io.Copy(f, resp.Body)
	if e != nil {
		return fmt.Errorf("could not read request body: %s", e.Error())
	}
	log.Logger(ctx).Info(fmt.Sprintf("Downloaded %s (size %d) to %s", latest, n, target))
	return nil

}

func (o *ObjectHandler) pipeOutputs(ctx context.Context, cmd *exec.Cmd) error {
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return err
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return err
	}
	scannerOut := bufio.NewScanner(stdout)
	logger := log.Logger(ctx)
	go func() {
		for scannerOut.Scan() {
			logger.Info(strings.TrimRight(scannerOut.Text(), "\n"))
		}
	}()
	scannerErr := bufio.NewScanner(stderr)
	go func() {
		for scannerErr.Scan() {
			text := strings.TrimRight(scannerErr.Text(), "\n")
			logger.Error(text)
		}
	}()
	return nil
}

// StartMinioServer handler
func (o *ObjectHandler) StartMinioServer(ctx context.Context, minioServiceName string) error {

	if o.Config.StorageType != object.StorageType_LOCAL {
		return nil
	}

	accessKey := o.Config.ApiKey
	secretKey := o.Config.ApiSecret

	// Replace secretKey on the fly
	if sec := config.GetSecret(secretKey).String(); sec != "" {
		secretKey = sec
	}
	configFolder, e := objects.CreateMinioConfigFile(minioServiceName, accessKey, secretKey)
	if e != nil {
		return e
	}

	var gateway, folderName, customEndpoint string
	if o.Config.StorageType == object.StorageType_S3 {
		gateway = "s3"
		customEndpoint = o.Config.EndpointUrl
	} else if o.Config.StorageType == object.StorageType_AZURE {
		gateway = "azure"
	} else if o.Config.StorageType == object.StorageType_GCS {
		gateway = "gcs"
		var credsUuid string
		if o.Config.GatewayConfiguration != nil {
			if jsonCred, ok := o.Config.GatewayConfiguration["jsonCredentials"]; ok {
				credsUuid = jsonCred
			}
		}
		if credsUuid == "" {
			return errors.New("missing google application credentials to start GCS gateway")
		}
		creds := config.GetSecret(credsUuid).Bytes()
		if len(creds) == 0 {
			return errors.New("missing google application credentials to start GCS gateway (cannot find inside vault)")
		}

		// Create gcs-credentials.json and pass it as env variable
		fName := filepath.Join(configFolder, "gcs-credentials.json")
		ioutil.WriteFile(fName, creds, 0600)
		os.Setenv("GOOGLE_APPLICATION_CREDENTIALS", fName)
	} else {
		folderName = o.Config.LocalFolder
	}

	port := o.Config.RunningPort

	params := []string{"minio"}
	if gateway != "" {
		params = append(params, "gateway")
		params = append(params, gateway)
	} else {
		params = append(params, "server")
	}

	if accessKey == "" {
		return errors.New("missing accessKey to start minio service")
	}

	params = append(params, "--quiet")
	if o.MinioConsolePort > 0 {
		params = append(params, "--console-address", fmt.Sprintf(":%d", o.MinioConsolePort))
	} else {
		os.Setenv("MINIO_BROWSER", "off")
	}

	params = append(params, "--config-dir")
	params = append(params, configFolder)

	if port > 0 {
		params = append(params, "--address")
		params = append(params, fmt.Sprintf(":%d", port))
	}

	if folderName != "" {
		params = append(params, folderName)
		log.Logger(ctx).Info("Starting local objects service " + minioServiceName + " on " + folderName)
	} else if customEndpoint != "" {
		params = append(params, customEndpoint)
		log.Logger(ctx).Info("Starting gateway objects service " + minioServiceName + " to " + customEndpoint)
	} else if gateway == "s3" && customEndpoint == "" {
		params = append(params, "https://s3.amazonaws.com", "pydio-ds")
		log.Logger(ctx).Info("Starting gateway objects service " + minioServiceName + " to Amazon S3")
	}

	os.Setenv("MINIO_ROOT_USER", accessKey)
	os.Setenv("MINIO_ROOT_PASSWORD", secretKey)

	var minioExe string
	if exe := os.Getenv("MINIO_EXECUTABLE"); exe != "" {
		log.Logger(ctx).Info("Using minio executable from environment")
		minioExe = exe
	} else if path := o.LookupPath(); path != "" {
		if _, e := os.Stat(path); e == nil {
			log.Logger(ctx).Info("Found minio executable next to cells executable")
			minioExe = path
		} else if er := o.Downloader(ctx, path); er == nil {
			minioExe = path
		} else {
			log.Logger(ctx).Error("Cannot download minio executable: "+er.Error(), zap.Error(er))
		}
	}
	if minioExe == "" {
		e := fmt.Errorf("Cannot install minio executable automatically. Please download correct version and pass it as MINIO_EXECUTABLE environment variable")
		log.Logger(ctx).Error(e.Error(), zap.Error(e))
		return e
	}

	//fmt.Println("Should Start", minioExe, params[1:])
	cmd := exec.CommandContext(ctx, minioExe, params[1:]...)
	if er := o.pipeOutputs(ctx, cmd); er != nil {
		fmt.Println("Cannot start pipe minio executable: ", er)
		return er
	}
	if er := cmd.Start(); er != nil {
		fmt.Println("Cannot start minio executable: ", er)
		return er
	}
	fmt.Println("Started, waiting")
	er := cmd.Wait()
	if er != nil {
		fmt.Println("Stop waiting", e)
	}

	/*
		minio.HookRegisterGlobalHandler(func(handler http.Handler) http.Handler {
			return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				handler.ServeHTTP(w, r)
			})
		})
		minio.HookExtractReqParams(func(req *http.Request, m map[string]string) {
			if v := req.Header.Get(common.PydioContextUserKey); v != "" {
				m[common.PydioContextUserKey] = v
			}
			for _, key := range common.XSpecialPydioHeaders {
				if v := req.Header.Get("X-Amz-Meta-" + key); v != "" {
					m[key] = v
				} else if v := req.Header.Get(key); v != "" {
					m[key] = v
				}
			}
		})

		minio.Main(params)

	*/

	return nil
}

// GetMinioConfig returns current configuration
func (o *ObjectHandler) GetMinioConfig(_ context.Context, _ *object.GetMinioConfigRequest) (*object.GetMinioConfigResponse, error) {

	return &object.GetMinioConfigResponse{
		MinioConfig: o.Config,
	}, nil

}

// StorageStats returns statistics about storage
func (o *ObjectHandler) StorageStats(_ context.Context, _ *object.StorageStatsRequest) (*object.StorageStatsResponse, error) {

	resp := &object.StorageStatsResponse{}
	resp.Stats = make(map[string]string)
	resp.Stats["StorageType"] = o.Config.StorageType.String()
	switch o.Config.StorageType {
	case object.StorageType_LOCAL:
		folder := o.Config.LocalFolder
		if stats, e := minio.ExposedDiskStats(context.Background(), folder, false); e != nil {
			return nil, e
		} else {
			resp.Stats["Total"] = fmt.Sprintf("%d", stats["Total"])
			resp.Stats["Free"] = fmt.Sprintf("%d", stats["Free"])
			resp.Stats["FSType"] = fmt.Sprintf("%s", stats["FSType"])
		}
	}

	return resp, nil
}

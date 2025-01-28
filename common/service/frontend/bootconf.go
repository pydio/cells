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

package frontend

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"os"
	"path"
	"runtime"
	"strings"
	"sync"
	"time"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/config/routing"
	runtime2 "github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/utils/i18n/languages"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

type BackendConf struct {
	BuildRevision string
	BuildStamp    string
	License       string
	PackageLabel  string
	PackageType   string
	Version       string
	ServerOffset  int
	PackagingInfo []string
}

type CustomWording struct {
	Title       string `json:"title"`
	Icon        string `json:"icon"`
	IconBinary  string `json:"iconBinary"`
	LoginTitle  string `json:"loginTitle"`
	LoginLegend string `json:"loginLegend"`
}

type BootConf struct {
	AjxpResourcesFolder          string `json:"ajxpResourcesFolder"`
	ENDPOINT_REST_API            string
	ENDPOINT_S3_GATEWAY          string
	ENDPOINT_WEBSOCKET           string
	PUBLIC_BASEURI               string
	ZipEnabled                   bool                   `json:"zipEnabled"`
	MultipleFilesDownloadEnabled bool                   `json:"multipleFilesDownloadEnabled"`
	CustomWording                CustomWording          `json:"customWording"`
	UsersEnabled                 bool                   `json:"usersEnabled"`
	LoggedUser                   bool                   `json:"loggedUser"`
	CurrentLanguage              string                 `json:"currentLanguage"`
	Session_timeout              int                    `json:"session_timeout"`
	Client_timeout               int                    `json:"client_timeout"`
	Client_timeout_warning       int                    `json:"client_timeout_warning"`
	AvailableLanguages           map[string]string      `json:"availableLanguages"`
	UsersEditable                bool                   `json:"usersEditable"`
	AjxpVersion                  string                 `json:"ajxpVersion"`
	AjxpVersionDate              string                 `json:"ajxpVersionDate"`
	I18nMessages                 map[string]string      `json:"i18nMessages"`
	Theme                        string                 `json:"theme"`
	AjxpImagesCommon             bool                   `json:"ajxpImagesCommon"`
	ValidMailer                  bool                   `json:"validMailer"`
	Backend                      BackendConf            `json:"backend"`
	Other                        map[string]interface{} `json:"other,omitempty"`
}

var versionHash string

func VersionHash(ctx context.Context) string {
	if versionHash != "" {
		return versionHash
	}
	// Create version seed
	vSeedVal := config.Get(ctx, "frontend", "versionSeed")
	vSeed := vSeedVal.Default("").String()
	if vSeed == "" {
		vSeed = uuid.New()
		vSeedVal.Set(vSeed)
		config.Save(ctx, common.PydioSystemUsername, "Generating version seed")
	}
	md := md5.New()
	md.Write([]byte(vSeed + common.Version().String()))
	versionHash = hex.EncodeToString(md.Sum(nil))
	return versionHash
}

var packagingOnce sync.Once

var packagingData []byte

// ComputeBootConf creates a JSON for web interface with a lot of useful info.
// There is no proto associated
func ComputeBootConf(ctx context.Context, pool *PluginsPool, showVersion ...bool) (*BootConf, error) {

	lang := config.Get(ctx, config.FrontendPluginPath(config.KeyFrontPluginCorePydio, config.KeyFrontDefaultLanguage)...).Default("en-us").String()
	sessionTimeout := config.Get(ctx, config.FrontendPluginPath(config.KeyFrontPluginGuiAjax, "SESSION_TIMEOUT")...).Default(60).Int()
	clientSession := config.Get(ctx, config.FrontendPluginPath(config.KeyFrontPluginGuiAjax, "CLIENT_TIMEOUT")...).Default(24).Int()
	timeoutWarn := config.Get(ctx, config.FrontendPluginPath(config.KeyFrontPluginGuiAjax, "CLIENT_TIMEOUT_WARN")...).Default(3).Int()

	vHash := VersionHash(ctx)
	vDate := ""
	vRev := ""
	_, tz := time.Now().Zone()
	var packagingInfo []string
	if len(showVersion) > 0 && showVersion[0] {
		vHash = common.Version().String()
		vDate = common.BuildStamp
		vRev = common.BuildRevision
		packagingOnce.Do(func() {
			if data, e := os.ReadFile(path.Join(runtime2.ApplicationWorkingDir(), "package.info")); e == nil {
				packagingData = data
			} else if runtime.GOOS != "windows" {
				if data2, e2 := os.ReadFile(path.Join("/opt/pydio", "package.info")); e2 == nil {
					packagingData = data2
				}
			}
		})
		if len(packagingData) > 0 {
			packagingInfo = strings.Split(string(packagingData), "\n")
		}
	}

	restApi := routing.RouteIngressURIContext(ctx, common.RouteApiREST, common.DefaultRouteREST)
	pubApi := routing.RouteIngressURIContext(ctx, common.RoutePublic, common.DefaultRoutePublic)

	b := &BootConf{
		AjxpResourcesFolder:          "/plug/gui.ajax/res",
		ENDPOINT_REST_API:            restApi,
		ENDPOINT_S3_GATEWAY:          "/io",
		ENDPOINT_WEBSOCKET:           "/ws/event",
		PUBLIC_BASEURI:               pubApi,
		ZipEnabled:                   true,
		MultipleFilesDownloadEnabled: true,
		UsersEditable:                true,
		UsersEnabled:                 true,
		LoggedUser:                   false,
		CurrentLanguage:              lang,
		Session_timeout:              sessionTimeout * 60,
		Client_timeout:               clientSession * 60,
		Client_timeout_warning:       timeoutWarn,
		AjxpVersion:                  vHash,
		AjxpVersionDate:              vDate,
		ValidMailer:                  config.Get(ctx, "services", "pydio.grpc.mailer", "valid").Default(false).Bool(),
		Theme:                        "material",
		AjxpImagesCommon:             true,
		CustomWording: CustomWording{
			Title: config.Get(ctx, config.FrontendPluginPath(config.KeyFrontPluginCorePydio, config.KeyFrontApplicationTitle)...).Default("Pydio Cells").String(),
			Icon:  "plug/gui.ajax/res/themes/common/images/LoginBoxLogo.png",
		},
		AvailableLanguages: languages.AvailableLanguages,
		I18nMessages:       pool.I18nMessages(ctx, lang).Messages,
		Backend: BackendConf{
			PackageType:   common.PackageType,
			PackageLabel:  common.PackageLabel,
			Version:       vHash,
			BuildRevision: vRev,
			BuildStamp:    vDate,
			License:       "agplv3",
			ServerOffset:  tz,
			PackagingInfo: packagingInfo,
		},
	}

	if icBinary := config.Get(ctx, config.FrontendPluginPath(config.KeyFrontPluginGuiAjax, "CUSTOM_ICON_BINARY")...).Default("").String(); icBinary != "" {
		b.CustomWording.IconBinary = icBinary
	}

	if e := ApplyBootConfModifiers(ctx, b); e != nil {
		return nil, e
	}

	return b, nil

}

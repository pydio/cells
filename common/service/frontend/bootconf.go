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
	"crypto/md5"
	"encoding/hex"
	"os"
	"path"
	"runtime"
	"strings"
	"sync"
	"time"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	runtime2 "github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/i18n"
	"github.com/pydio/cells/v4/common/utils/uuid"
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

func VersionHash() string {
	if versionHash != "" {
		return versionHash
	}
	// Create version seed
	vSeed := config.Get("frontend", "versionSeed").Default("").String()
	if vSeed == "" {
		vSeed = uuid.New()
		config.Set(vSeed, "frontend", "versionSeed")
		config.Save(common.PydioSystemUsername, "Generating version seed")
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
func ComputeBootConf(pool *PluginsPool, showVersion ...bool) (*BootConf, error) {

	lang := config.Get("frontend", "plugin", "core.pydio", "DEFAULT_LANGUAGE").Default("en-us").String()
	sessionTimeout := config.Get("frontend", "plugin", "gui.ajax", "SESSION_TIMEOUT").Default(60).Int()
	clientSession := config.Get("frontend", "plugin", "gui.ajax", "CLIENT_TIMEOUT").Default(24).Int()
	timeoutWarn := config.Get("frontend", "plugin", "gui.ajax", "CLIENT_TIMEOUT_WARN").Default(3).Int()

	vHash := VersionHash()
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

	b := &BootConf{
		AjxpResourcesFolder:          "plug/gui.ajax/res",
		ENDPOINT_REST_API:            common.DefaultRouteREST,
		ENDPOINT_S3_GATEWAY:          "/io",
		ENDPOINT_WEBSOCKET:           "/ws/event",
		PUBLIC_BASEURI:               config.GetPublicBaseUri(),
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
		ValidMailer:                  config.Get("services", "pydio.grpc.mailer", "valid").Default(false).Bool(),
		Theme:                        "material",
		AjxpImagesCommon:             true,
		CustomWording: CustomWording{
			Title: config.Get("frontend", "plugin", "core.pydio", "APPLICATION_TITLE").Default("Pydio Cells").String(),
			Icon:  "plug/gui.ajax/res/themes/common/images/LoginBoxLogo.png",
		},
		AvailableLanguages: i18n.AvailableLanguages,
		I18nMessages:       pool.I18nMessages(lang).Messages,
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

	if icBinary := config.Get("frontend", "plugin", "gui.ajax", "CUSTOM_ICON_BINARY").Default("").String(); icBinary != "" {
		b.CustomWording.IconBinary = icBinary
	}

	if e := ApplyBootConfModifiers(b); e != nil {
		return nil, e
	}

	return b, nil

}

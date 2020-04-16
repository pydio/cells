package frontend

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/micro/go-config/reader"
	"github.com/pborman/uuid"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/utils/i18n"
)

type BackendConf struct {
	BuildRevision string
	BuildStamp    string
	License       string
	PackageLabel  string
	PackageType   string
	Version       string
}

type CustomWording struct {
	Title      string `json:"title"`
	Icon       string `json:"icon"`
	IconBinary string `json:"iconBinary"`
}

type BootConf struct {
	AjxpResourcesFolder          string `json:"ajxpResourcesFolder"`
	ENDPOINT_REST_API            string
	ENDPOINT_S3_GATEWAY          string
	ENDPOINT_WEBSOCKET           string
	FRONTEND_URL                 string
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
	vSeed := config.Get("frontend", "versionSeed").String("")
	if vSeed == "" {
		vSeed = uuid.New()
		config.Set(vSeed, "frontend", "versionSeed")
		config.Save(common.PYDIO_SYSTEM_USERNAME, "Generating version seed")
	}
	md := md5.New()
	md.Write([]byte(vSeed + common.Version().String()))
	versionHash = hex.EncodeToString(md.Sum(nil))
	return versionHash
}

func numberFromIntOrString(value reader.Value, def int) int {
	intVal := def
	if value.Int(-1) != -1 {
		intVal = value.Int(def)
	} else if value.String("") != "" {
		if parsed, e := strconv.ParseInt(value.String(""), 10, 32); e == nil {
			intVal = int(parsed)
		}
	}
	return intVal
}

func ComputeBootConf(pool *PluginsPool, req *http.Request, showVersion ...bool) *BootConf {

	var u string
	if req.URL.Host == "" {
		h := req.Header.Get("X-Forwarded-For")
		sc := req.Header.Get("X-Forwarded-Proto")
		pt := req.Header.Get("X-Forwarded-Port")
		u = fmt.Sprintf("%s://%s:%s", sc, h, pt)
	} else {
		u = fmt.Sprintf("%s://%s:%s", req.URL.Scheme, req.URL.Host, req.URL.Port())
	}
	wsUrl := strings.Replace(strings.Replace(u, "https", "wss", -1), "http", "ws", -1)

	lang := config.Get("frontend", "plugin", "core.pydio", "DEFAULT_LANGUAGE").String("en-us")
	clientSession := numberFromIntOrString(config.Get("frontend", "plugin", "gui.ajax", "CLIENT_TIMEOUT"), 24)
	timeoutWarn := numberFromIntOrString(config.Get("frontend", "plugin", "gui.ajax", "CLIENT_TIMEOUT_WARN"), 3)

	vHash := VersionHash()
	vDate := ""
	vRev := ""
	if len(showVersion) > 0 && showVersion[0] {
		vHash = common.Version().String()
		vDate = common.BuildStamp
		vRev = common.BuildRevision
	}

	b := &BootConf{
		AjxpResourcesFolder:          "plug/gui.ajax/res",
		ENDPOINT_REST_API:            "/a",
		ENDPOINT_S3_GATEWAY:          "/io",
		ENDPOINT_WEBSOCKET:           wsUrl + "/ws/event",
		FRONTEND_URL:                 u,
		PUBLIC_BASEURI:               "/public",
		ZipEnabled:                   true,
		MultipleFilesDownloadEnabled: true,
		UsersEditable:                true,
		UsersEnabled:                 true,
		LoggedUser:                   false,
		CurrentLanguage:              lang,
		Session_timeout:              SessionTimeoutMinutes * 60,
		Client_timeout:               clientSession * 60,
		Client_timeout_warning:       timeoutWarn,
		AjxpVersion:                  vHash,
		AjxpVersionDate:              vDate,
		ValidMailer:                  config.Get("services", "pydio.grpc.mailer", "valid").Bool(false),
		Theme:                        "material",
		AjxpImagesCommon:             true,
		CustomWording: CustomWording{
			Title: config.Get("frontend", "plugin", "core.pydio", "APPLICATION_TITLE").String("Pydio Cells"),
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
		},
	}

	if icBinary := config.Get("frontend", "plugin", "gui.ajax", "CUSTOM_ICON_BINARY").String(""); icBinary != "" {
		b.CustomWording.IconBinary = icBinary
	}

	if e := ApplyBootConfModifiers(b); e != nil {
		log.Logger(context.Background()).Error("Error while applying BootConf modifiers", zap.Error(e))
	}

	return b

}

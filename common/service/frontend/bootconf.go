package frontend

import (
	"strings"

	"github.com/pborman/uuid"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
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
	Title string `json:"title"`
	Icon  string `json:"icon"`
}

type BootConf struct {
	AjxpResourcesFolder          string `json:"ajxpResourcesFolder"`
	AjxpServerAccess             string `json:"ajxpServerAccess"`
	ENDPOINT_REST_API            string
	ENDPOINT_S3_GATEWAY          string
	ENDPOINT_WEBSOCKET           string
	FRONTEND_URL                 string
	PUBLIC_BASEURI               string
	ZipEnabled                   bool              `json:"zipEnabled"`
	MultipleFilesDownloadEnabled bool              `json:"multipleFilesDownloadEnabled"`
	CustomWording                CustomWording     `json:"customWording"`
	UsersEnabled                 bool              `json:"usersEnabled"`
	LoggedUser                   bool              `json:"loggedUser"`
	CurrentLanguage              string            `json:"currentLanguage"`
	Session_timeout              int               `json:"session_timeout"`
	Client_timeout               int               `json:"client_timeout"`
	Client_timeout_warning       int               `json:"client_timeout_warning"`
	AvailableLanguages           map[string]string `json:"availableLanguages"`
	UsersEditable                bool              `json:"usersEditable"`
	AjxpVersion                  string            `json:"ajxpVersion"`
	AjxpVersionDate              string            `json:"ajxpVersionDate"`
	I18nMessages                 map[string]string `json:"i18nMessages"`
	SECURE_TOKEN                 string
	Streaming_supported          bool        `json:"streaming_supported"`
	Theme                        string      `json:"theme"`
	AjxpImagesCommon             bool        `json:"ajxpImagesCommon"`
	Backend                      BackendConf `json:"backend"`
}

func ComputeBootConf(pool *PluginsPool) *BootConf {

	url := config.Get("defaults", "url").String("")
	wsUrl := strings.Replace(strings.Replace(url, "https", "wss", -1), "http", "ws", -1)

	b := &BootConf{
		AjxpResourcesFolder:          "plug/gui.ajax/res",
		AjxpServerAccess:             "index.php",
		ENDPOINT_REST_API:            url + "/a",
		ENDPOINT_S3_GATEWAY:          url + "/io",
		ENDPOINT_WEBSOCKET:           wsUrl + "/ws/event",
		FRONTEND_URL:                 url,
		PUBLIC_BASEURI:               "/public",
		ZipEnabled:                   true,
		MultipleFilesDownloadEnabled: true,
		UsersEditable:                true,
		UsersEnabled:                 true,
		LoggedUser:                   false,
		CurrentLanguage:              "en",
		Session_timeout:              1440,
		Client_timeout:               1440,
		Client_timeout_warning:       3,
		AjxpVersion:                  common.Version().String(),
		AjxpVersionDate:              common.BuildStamp,
		SECURE_TOKEN:                 uuid.New(),
		Streaming_supported:          true,
		Theme:                        "material",
		AjxpImagesCommon:             true,
		CustomWording: CustomWording{
			Title: "Pydio",
			Icon:  "",
		},
		AvailableLanguages: map[string]string{
			"en":    "English",
			"es":    "Español",
			"de":    "Deutsch",
			"fr":    "Français",
			"it":    "Italiano",
			"pt-br": "Portuguese",
		},
		I18nMessages: pool.I18nMessages("en").Messages,
		Backend: BackendConf{
			PackageType:   common.PackageType,
			PackageLabel:  common.PackageLabel,
			Version:       common.Version().String(),
			BuildRevision: common.BuildRevision,
			BuildStamp:    common.BuildStamp,
			License:       "agplv3",
		},
	}
	return b

}

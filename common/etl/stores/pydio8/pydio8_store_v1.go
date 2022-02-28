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

package pydio8

import (
	"fmt"
	"github.com/go-openapi/runtime"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/pydio-sdk-go/config"
	"io/ioutil"
	"net/http"
	"path"
)

type ClientV1 struct {
	cli runtime.ClientTransport
}

type GetAdvancedUserInfoResponse struct {
	Login      string `json:"login"`
	AuthSource string `json:"authsource,omitempty"`
	Password   string `json:"password,omitempty"`
	Profile    string `json:"profile,omitempty"`
	OwnerLogin string `json:"parent,omitempty"`
}

type GetDomainNameResponse struct {
	DomainName string `json:"domainname"`
}

func (a *ClientV1) GetAdvancedUserInfo(userId string, sdkConfig *config.SdkConfig) (*GetAdvancedUserInfoResponse, error) {

	httpClient := config.GetHttpClient(sdkConfig)
	wPath := path.Join(sdkConfig.Url, sdkConfig.Path, "api/settings/hashedpassword")
	getUrl := fmt.Sprintf("%s://%s/%s", sdkConfig.Protocol, wPath, userId)

	req, _ := http.NewRequest("GET", getUrl, nil)
	req.SetBasicAuth(sdkConfig.User, sdkConfig.Password)

	resp, e := httpClient.Do(req)
	if e != nil {
		return nil, e
	}
	body, e := ioutil.ReadAll(resp.Body)
	if e != nil {
		return nil, e
	}
	var result GetAdvancedUserInfoResponse
	if e := json.Unmarshal(body, &result); e != nil {
		return nil, e
	}
	return &result, nil

}

func (a *ClientV1) GetDomainName(sdkConfig *config.SdkConfig) (*GetDomainNameResponse, error) {
	httpClient := config.GetHttpClient(sdkConfig)
	wPath := path.Join(sdkConfig.Url, sdkConfig.Path, "api/settings/ldapdomainname")
	getUrl := fmt.Sprintf("%s://%s", sdkConfig.Protocol, wPath)
	req, _ := http.NewRequest("GET", getUrl, nil)
	req.SetBasicAuth(sdkConfig.User, sdkConfig.Password)

	resp, e := httpClient.Do(req)
	if e != nil {
		return nil, e
	}
	body, e := ioutil.ReadAll(resp.Body)
	if e != nil {
		return nil, e
	}
	var result GetDomainNameResponse
	if e := json.Unmarshal(body, &result); e != nil {
		return nil, e
	}
	return &result, nil
}

type NonTechRole struct {
	RoleId        string                 `json:"role_id"`
	RoleLabel     string                 `json:"role_label"`
	AppliesTo     string                 `json:"applies_to"`
	OwnerId       string                 `json:"owner_id"`
	ForceOverride bool                   `json:"force_override"`
	RoleData      map[string]interface{} `json:"role"`
}

func (a *ClientV1) ListNonTechnicalRoles(teams bool, sdkConfig *config.SdkConfig) (map[string]*NonTechRole, error) {

	httpClient := config.GetHttpClient(sdkConfig)
	var param = ""
	if teams {
		param = "?teams=true"
	}
	wPath := path.Join(sdkConfig.Url, sdkConfig.Path, "api/settings/listroles"+param)
	getUrl := fmt.Sprintf("%s://%s", sdkConfig.Protocol, wPath)
	req, _ := http.NewRequest("GET", getUrl, nil)
	req.SetBasicAuth(sdkConfig.User, sdkConfig.Password)

	resp, e := httpClient.Do(req)
	if e != nil {
		return nil, e
	}
	body, e := ioutil.ReadAll(resp.Body)
	if e != nil {
		return nil, e
	}
	var result map[string]*NonTechRole
	if e := json.Unmarshal(body, &result); e != nil {
		return nil, e
	}
	return result, nil

}

const (
	P8GlobalMetaSharedUser  = "AJXP_METADATA_SHAREDUSER"
	P8GlobalMetaWatchRead   = "META_WATCH_READ"
	P8GlobalMetaWatchChange = "META_WATCH_CHANGE"
	P8GlobalMetaWatchBoth   = "META_WATCH_BOTH"
)

type P8GlobalMetaNode struct {
	Watches  map[string]string `json:"WATCH"`
	Bookmark map[string]bool   `json:"BOOKMARK"`
}
type P8GlobalMetaNodes map[string]P8GlobalMetaNode
type P8GlobalMetaUsers map[string]P8GlobalMetaNodes
type P8GlobalMeta map[string]P8GlobalMetaUsers

func (a *ClientV1) ListP8GlobalMeta(sdkConfig *config.SdkConfig) (P8GlobalMeta, error) {

	httpClient := config.GetHttpClient(sdkConfig)
	wPath := path.Join(sdkConfig.Url, sdkConfig.Path, "api/settings/getmetadata")
	getUrl := fmt.Sprintf("%s://%s", sdkConfig.Protocol, wPath)
	req, _ := http.NewRequest("GET", getUrl, nil)
	req.SetBasicAuth(sdkConfig.User, sdkConfig.Password)

	resp, e := httpClient.Do(req)
	if e != nil {
		return nil, e
	}
	body, e := ioutil.ReadAll(resp.Body)
	if e != nil {
		return nil, e
	}
	var result P8GlobalMeta
	if e := json.Unmarshal(body, &result); e != nil {
		return nil, e
	}
	return result, nil

}

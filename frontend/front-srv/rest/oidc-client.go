package rest

import (
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/idm/auth"
)

func GrantTypeAccess(nonce string, refreshToken string, login string, pwd string) (map[string]interface{}, error) {

	fullURL := config.Get("defaults", "urlInternal").String("") + "/auth/dex/token"
	selfSigned := config.Get("cert", "proxy", "ssl").Bool(false) && config.Get("cert", "proxy", "self").Bool(false)

	data := url.Values{}
	if refreshToken != "" {
		data.Set("grant_type", "refresh_token")
		data.Add("refresh_token", refreshToken)
		data.Add("scope", "email profile pydio")
	} else {
		data.Set("grant_type", "password")
		data.Add("username", login)
		data.Add("password", pwd)
		data.Add("scope", "email profile pydio offline_access")
	}
	data.Add("nonce", nonce)

	httpReq, err := http.NewRequest("POST", fullURL, strings.NewReader(data.Encode()))
	if err != nil {
		return nil, err
	}

	var basic string

	configDex := config.Get("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_AUTH, "dex")
	var c auth.Config
	remarshall, _ := json.Marshal(configDex)
	if err := json.Unmarshal(remarshall, &c); err != nil {
		return nil, err
	}
	for _, static := range c.StaticClients {
		if static.Name == "cells-front" {
			authString := static.ID + ":" + static.Secret
			basic = "Basic " + base64.StdEncoding.EncodeToString([]byte(authString))
		}
	}

	httpReq.Header.Add("Content-Type", "application/x-www-form-urlencoded") // Important our dex API does not yet support json payload.
	httpReq.Header.Add("Cache-Control", "no-cache")
	httpReq.Header.Add("Authorization", basic)

	var client *http.Client
	if selfSigned {
		tr := &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		}
		client = &http.Client{Transport: tr}
	} else {
		client = http.DefaultClient
	}
	res, err := client.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var respMap map[string]interface{}
	err = json.NewDecoder(res.Body).Decode(&respMap)
	if err != nil {
		return nil, fmt.Errorf("could not unmarshall response with status %d: %s\nerror cause: %s", res.StatusCode, res.Status, err.Error())
	}
	if errMsg, exists := respMap["error"]; exists {
		return nil, fmt.Errorf("could not retrieve token, %s: %s", errMsg, respMap["error_description"])
	}

	return respMap, nil

}

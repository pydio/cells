package modifiers

import (
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/emicklei/go-restful"
	"github.com/gorilla/sessions"
	"github.com/pborman/uuid"

	"context"

	"github.com/micro/go-micro/metadata"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/service/frontend"
	"github.com/pydio/cells/idm/auth"
	"go.uber.org/zap"
)

func LoginPasswordAuth(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {

	return func(req *restful.Request, rsp *restful.Response, in *rest.FrontSessionRequest, out *rest.FrontSessionResponse, session *sessions.Session) error {

		if a, ok := in.AuthInfo["type"]; !ok || a != "credentials" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}

		nonce := uuid.New()
		respMap, err := GrantTypeAccess(req.Request.Context(), nonce, "", in.AuthInfo["login"], in.AuthInfo["password"])
		if err != nil {
			return err
		}
		token := respMap["id_token"].(string)
		expiry := respMap["expires_in"].(float64)
		refreshToken := respMap["refresh_token"].(string)

		session.Values["nonce"] = nonce
		session.Values["jwt"] = token
		session.Values["refresh_token"] = refreshToken
		session.Values["expiry"] = time.Now().Add(time.Duration(expiry) * time.Second).Unix()

		out.JWT = token
		out.ExpireTime = int32(expiry)

		return middleware(req, rsp, in, out, session)

	}

}

func JwtFromSession(ctx context.Context, session *sessions.Session) (jwt string, expireTime int32, e error) {

	if val, ok := session.Values["jwt"]; ok {

		expiry := session.Values["expiry"].(int64)
		expTime := time.Unix(expiry, 0)
		ref := time.Now()
		if refresh, refOk := session.Values["refresh_token"]; refOk && (expTime.Before(ref) || expTime.Equal(ref)) {
			// Refresh token
			log.Logger(ctx).Debug("Refreshing Token Now", zap.Any("refresh", refresh), zap.Any("nonce", session.Values["nonce"]), zap.Any("jwt", session.Values["jwt"]))
			refreshResponse, err := GrantTypeAccess(ctx, session.Values["nonce"].(string), refresh.(string), "", "")
			if err != nil {
				// Refresh_token is invalid: clear session
				e = err
				delete(session.Values, "refresh_token")
				delete(session.Values, "nonce")
				delete(session.Values, "jwt")
				delete(session.Values, "expiry")
				return
			}
			expiry := refreshResponse["expires_in"].(float64)
			expTime = time.Now().Add(time.Duration(expiry) * time.Second)
			val = refreshResponse["id_token"].(string)
			newRefresh := refreshResponse["refresh_token"].(string)
			session.Values["jwt"] = val
			session.Values["expiry"] = expTime.Unix()
			session.Values["refresh_token"] = newRefresh
		}

		jwt = val.(string)
		expireTime = int32(expTime.Sub(time.Now()).Seconds())
	}

	return
}

func GrantTypeAccess(ctx context.Context, nonce string, refreshToken string, login string, pwd string) (map[string]interface{}, error) {

	dexHost := config.Get("services", "pydio.grpc.auth", "dex", "web", "http").String("")
	ssl := config.Get("cert", "http", "ssl").Bool(false)
	var fullURL string
	if ssl {
		fullURL = "https://" + dexHost + "/dex/token"
	} else {
		fullURL = "http://" + dexHost + "/dex/token"
	}
	selfSigned := ssl && config.Get("cert", "http", "self").Bool(false)

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

	if meta, ok := metadata.FromContext(ctx); ok {
		if remote, b := meta[servicecontext.HttpMetaRemoteAddress]; b {
			httpReq.Header.Add("X-Forwarded-For", remote)
		}
		if uAgent, b := meta[servicecontext.HttpMetaUserAgent]; b {
			httpReq.Header.Add("User-Agent", uAgent)
		}
		if span, b := meta[servicecontext.SpanMetadataId]; b {
			httpReq.Header.Add(servicecontext.SpanMetadataId, span)
		}
		if rootSpan, b := meta[servicecontext.SpanMetadataRootParentId]; b {
			httpReq.Header.Add(servicecontext.SpanMetadataRootParentId, rootSpan)
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

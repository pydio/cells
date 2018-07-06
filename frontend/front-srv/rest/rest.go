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

package rest

import (
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/emicklei/go-restful"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/pborman/uuid"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/service/frontend"
	service2 "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/views"
)

type FrontendHandler struct{}

func NewFrontendHandler() *FrontendHandler {
	f := &FrontendHandler{}
	return f
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (a *FrontendHandler) SwaggerTags() []string {
	return []string{"FrontendService"}
}

// Filter returns a function to filter the swagger path
func (a *FrontendHandler) Filter() func(string) string {
	return nil
}

func (a *FrontendHandler) FrontState(req *restful.Request, rsp *restful.Response) {
	pool, e := frontend.GetPluginsPool()
	if e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	ctx := req.Request.Context()
	wsId := req.QueryParameter("ws")
	lang := req.QueryParameter("lang")
	if lang == "" {
		lang = "en"
	}

	user := &frontend.User{}
	if e := user.Load(ctx); e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	user.LoadActiveWorkspace(wsId)
	cfg := config.Default()
	rolesConfigs := user.FlattenedRolesConfigs()

	status := frontend.RequestStatus{
		Config:        cfg,
		AclParameters: rolesConfigs.Get("parameters").(*config.Map),
		AclActions:    rolesConfigs.Get("actions").(*config.Map),
		WsScopes:      user.GetActiveScopes(),
		User:          user,
		NoClaims:      !user.Logged,
		Lang:          lang,
	}
	registry := pool.RegistryForStatus(ctx, status)
	rsp.WriteAsXml(registry)
}

func (a *FrontendHandler) FrontBootConf(req *restful.Request, rsp *restful.Response) {

	pool, e := frontend.GetPluginsPool()
	if e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	bootConf := frontend.ComputeBootConf(pool)
	rsp.WriteAsJson(bootConf)

}

func (a *FrontendHandler) FrontSession(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()

	var loginRequest rest.FrontSessionRequest
	if e := req.ReadEntity(&loginRequest); e != nil {
		service.RestError500(req, rsp, e)
		return
	}

	if loginRequest.Logout {
		if session, err := frontend.GetSessionStore().Get(req.Request, "pydio"); err == nil {
			if _, ok := session.Values["jwt"]; ok {
				log.Logger(req.Request.Context()).Info("Clearing session")
				delete(session.Values, "jwt")
				session.Options.MaxAge = 0
				session.Save(req.Request, rsp.ResponseWriter)
			}
		}
		rsp.WriteEntity(&rest.FrontSessionResponse{})
		return
	}

	if loginRequest.Login == "" && loginRequest.Password == "" {

		if session, err := frontend.GetSessionStore().Get(req.Request, "pydio"); err == nil {
			if val, ok := session.Values["jwt"]; ok {
				expiry := session.Values["expiry"].(int64)
				expTime := time.Unix(expiry, 0)
				ref := time.Now()
				if refresh, refOk := session.Values["refresh_token"]; refOk && (expTime.Before(ref) || expTime.Equal(ref)) {
					// Refresh token
					log.Logger(req.Request.Context()).Info("Refreshing Token Now", zap.Any("refresh", refresh), zap.Any("nonce", session.Values["nonce"]))
					refreshResponse, err := GrantTypeAccess(session.Values["nonce"].(string), refresh.(string), "", "")
					if err != nil {
						service.RestError401(req, rsp, err)
						return
					}
					expiry := refreshResponse["expires_in"].(float64)
					expTime = time.Now().Add(time.Duration(expiry) * time.Second)
					val = refreshResponse["id_token"].(string)
					newRefresh := refreshResponse["refresh_token"].(string)
					session.Values["jwt"] = val
					session.Values["expiry"] = expTime.Unix()
					session.Values["refresh_token"] = newRefresh
					if e := session.Save(req.Request, rsp.ResponseWriter); e != nil {
						log.Logger(req.Request.Context()).Error("Error saving session", zap.Error(e))
					}
				}
				response := &rest.FrontSessionResponse{
					JWT:        val.(string),
					ExpireTime: int32(expTime.Sub(time.Now()).Seconds()),
				}
				log.Logger(ctx).Debug("Sending response from session", zap.Any("r", response))
				rsp.WriteEntity(response)
			} else {
				// Just send an empty response
				rsp.WriteEntity(&rest.FrontSessionResponse{})
			}
		} else {
			service.RestError500(req, rsp, fmt.Errorf("could not load session store: %s", err))
		}
		return

	}

	nonce := uuid.New()
	respMap, err := GrantTypeAccess(nonce, "", loginRequest.Login, loginRequest.Password)
	if err != nil {
		service.RestError401(req, rsp, err)
		return
	}

	token := respMap["id_token"].(string)
	expiry := respMap["expires_in"].(float64)
	refreshToken := respMap["refresh_token"].(string)

	response := &rest.FrontSessionResponse{
		JWT:        token,
		ExpireTime: int32(expiry),
	}

	if session, err := frontend.GetSessionStore().Get(req.Request, "pydio"); err == nil {
		log.Logger(req.Request.Context()).Info("Saving token in session")
		session.Values["nonce"] = nonce
		session.Values["jwt"] = token
		session.Values["refresh_token"] = refreshToken
		session.Values["expiry"] = time.Now().Add(time.Duration(expiry) * time.Second).Unix()
		if e := session.Save(req.Request, rsp.ResponseWriter); e != nil {
			log.Logger(req.Request.Context()).Error("Error saving session", zap.Error(e))
		}
	} else {
		log.Logger(req.Request.Context()).Error("Could not load session store", zap.Error(err))
	}

	rsp.WriteEntity(response)
}

func (a *FrontendHandler) FrontMessages(req *restful.Request, rsp *restful.Response) {
	pool, e := frontend.GetPluginsPool()
	if e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	lang := req.PathParameter("Lang")
	rsp.WriteAsJson(pool.I18nMessages(lang).Messages)
}

// Log handles all HTTP requests sent to the FrontLogService, reads the message and directly returns.
// It then dispatches asynchronously the corresponding log message to technical and audit loggers.
func (a *FrontendHandler) FrontLog(req *restful.Request, rsp *restful.Response) {

	var message rest.FrontLogMessage
	req.ReadEntity(&message)
	rsp.WriteEntity(&rest.FrontLogResponse{Success: true})

	go func() {
		logger := log.Logger(req.Request.Context())

		zaps := []zapcore.Field{
			zap.String(common.KEY_FRONT_IP, message.Ip),
			zap.String(common.KEY_FRONT_USERID, message.UserId),
			zap.String(common.KEY_FRONT_WKSID, message.WorkspaceId),
			zap.String(common.KEY_FRONT_SOURCE, message.Source),
			zap.Strings(common.KEY_FRONT_NODES, message.Nodes),
		}

		if message.Level == rest.LogLevel_DEBUG || message.Level == rest.LogLevel_NOTICE {
			logger.Debug(message.Message, zaps...)
		} else if message.Level == rest.LogLevel_ERROR || message.Level == rest.LogLevel_WARNING {
			logger.Error(message.Message, zaps...)
		} else {
			logger.Info(message.Message, zaps...)
		}
	}()
}

func (a *FrontendHandler) FrontServeBinary(req *restful.Request, rsp *restful.Response) {

	binaryType := req.PathParameter("BinaryType")
	binaryUuid := req.PathParameter("Uuid")
	ctx := req.Request.Context()

	if binaryType == "USER" {

		var user *idm.User
		cli := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
		subQ, _ := ptypes.MarshalAny(&idm.UserSingleQuery{
			Login: binaryUuid,
		})
		stream, err := cli.SearchUser(ctx, &idm.SearchUserRequest{
			Query: &service2.Query{
				SubQueries: []*any.Any{subQ},
			},
		})
		if err != nil {
			return
		}
		defer stream.Close()
		for {
			rsp, e := stream.Recv()
			if e != nil {
				break
			}
			if rsp == nil {
				continue
			}
			user = rsp.User
			break
		}
		if user == nil {
			service.RestError404(req, rsp, fmt.Errorf("cannot find user"))
			return
		}
		if avatarId, ok := user.Attributes["avatar"]; ok {

			router := views.NewStandardRouter(views.RouterOptions{WatchRegistry: false})
			node := &tree.Node{
				Path: common.PYDIO_DOCSTORE_BINARIES_NAMESPACE + "/users_binaries." + user.Login + "-" + avatarId,
			}
			info, e := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: node})
			if e != nil {
				service.RestError404(req, rsp, e)
				return
			}
			reader, e := router.GetObject(ctx, node, &views.GetRequestData{Length: info.Node.Size})
			if e == nil {
				defer reader.Close()
				rsp.Header().Set("Content-Type", "image/"+strings.Split(avatarId, ".")[1])
				rsp.Header().Set("Content-Length", fmt.Sprintf("%d", info.Node.Size))
				_, e := io.Copy(rsp.ResponseWriter, reader)
				if e != nil {
					service.RestError500(req, rsp, e)
				}
			} else {
				service.RestError500(req, rsp, e)
			}
		}
	}

}

func (a *FrontendHandler) SettingsMenu(req *restful.Request, rsp *restful.Response) {

	rsp.WriteEntity(settingsNode)

}

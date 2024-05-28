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
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"strconv"
	"strings"
	"sync"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/emptypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/client/commons/idmc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/nodes/models"
	pauth "github.com/pydio/cells/v4/common/proto/auth"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/service/frontend"
	"github.com/pydio/cells/v4/common/service/frontend/sessions"
	"github.com/pydio/cells/v4/common/service/resources"
	"github.com/pydio/cells/v4/common/utils/permissions"
	"github.com/pydio/cells/v4/common/utils/propagator"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

const (
	avatarDefaultMaxSize = 5 * 1024 * 1024
)

var (
	formDevOnce sync.Once
)

type FrontendHandler struct {
	runtimeCtx context.Context
	resources.ResourceProviderHandler
}

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

	user := &frontend.User{}
	if e := user.Load(ctx); e != nil {
		service.RestError500(req, rsp, e)
		return
	}

	user.LoadActiveWorkspace(req.QueryParameter("ws"))
	lang := user.LoadActiveLanguage(req.QueryParameter("lang"))

	rolesConfigs := user.FlattenedRolesConfigs()

	c := config.Get()
	aclParameters := rolesConfigs.Val("parameters")
	aclActions := rolesConfigs.Val("actions")
	scopes := user.GetActiveScopes()

	status := frontend.RequestStatus{
		RuntimeCtx:    ctx,
		Config:        c,
		AclParameters: aclParameters,
		AclActions:    aclActions,
		WsScopes:      scopes,
		User:          user,
		NoClaims:      !user.Logged,
		Lang:          lang,
		Request:       req.Request,
	}
	registry, er := pool.RegistryForStatus(ctx, status)
	if er != nil {
		service.RestErrorDetect(req, rsp, er)
		return
	}
	rsp.WriteAsXml(registry)
}

// FrontBootConf loads an open JSON struct for start configuration. As it can be called
// directly as a simple GET /a/frontend/bootconf, this endpoint can rely on Cookie for authentication
func (a *FrontendHandler) FrontBootConf(req *restful.Request, rsp *restful.Response) {

	pool, e := frontend.GetPluginsPool()
	if e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	showVersion := false
	user := &frontend.User{}
	if e := user.Load(req.Request.Context()); e == nil && user.Logged {
		showVersion = true
	}
	bootConf, e := frontend.ComputeBootConf(pool, showVersion)
	if e != nil {
		service.RestErrorDetect(req, rsp, e)
		return
	}
	rsp.WriteAsJson(bootConf)

}

// FrontPlugins dumps a full list of available frontend plugins
func (a *FrontendHandler) FrontPlugins(req *restful.Request, rsp *restful.Response) {

	if req.Request.Header.Get("x-pydio-plugins-reload") != "" {
		frontend.HotReload()
		broker.MustPublish(context.Background(), common.TopicReloadAssets, &emptypb.Empty{})
	}

	pool, e := frontend.GetPluginsPool()
	if e != nil {
		service.RestError500(req, rsp, e)
		return
	}

	lang := req.QueryParameter("lang")
	if lang == "" {
		user := &frontend.User{}
		if e := user.Load(req.Request.Context()); e == nil {
			if l := user.LoadActiveLanguage(""); l != "" {
				lang = l
			}
		}
	}
	if lang == "" {
		lang = "en-us"
	}

	plugins := pool.AllPluginsManifests(a.runtimeCtx, lang)
	rsp.WriteAsXml(plugins)
}

// FrontSessionGet loads a cookie-based session to get info about an access token
func (a *FrontendHandler) FrontSessionGet(req *restful.Request, rsp *restful.Response) {

	dao, err := manager.Resolve[sessions.DAO](req.Request.Context())
	if err != nil {
		service.RestError500(req, rsp, fmt.Errorf("could not retrieve dao: %s", err))
		return
	}

	session, err := dao.GetSession(req.Request)
	if err != nil && session == nil {
		service.RestError500(req, rsp, fmt.Errorf("could not load session store: %s", err))
		return
	}

	response := &rest.FrontSessionGetResponse{}
	if len(session.Values) > 0 {
		response.Token = &pauth.Token{
			AccessToken: session.Values["access_token"].(string),
			IDToken:     session.Values["id_token"].(string),
			ExpiresAt:   session.Values["expires_at"].(string),
		}
	}

	rsp.WriteEntity(response)
}

// FrontSession initiate a cookie-based session based on a LoginRequest
func (a *FrontendHandler) FrontSession(req *restful.Request, rsp *restful.Response) {
	dao, err := manager.Resolve[sessions.DAO](req.Request.Context())
	if err != nil {
		service.RestError500(req, rsp, fmt.Errorf("could not retrieve dao: %s", err))
		return
	}

	var loginRequest rest.FrontSessionRequest
	if e := req.ReadEntity(&loginRequest); e != nil {
		service.RestError500(req, rsp, e)
		return
	}

	ctx := req.Request.Context()
	if loginRequest.AuthInfo == nil {
		loginRequest.AuthInfo = map[string]string{}
	}

	isMinisite := false
	if h := req.HeaderParameter("X-Pydio-Minisite"); h != "" {
		isMinisite = true
	}
	if h := req.HeaderParameter(common.XPydioFrontendSessionUuid); h != "" {
		isMinisite = true
	}

	session, err := dao.GetSession(req.Request)
	if err != nil && session == nil {
		service.RestError500(req, rsp, fmt.Errorf("could not load session store: %s", err))
		return
	}

	// Legacy code
	delete(session.Values, "jwt")

	if isMinisite {
		session.Values["minisite"] = true
	}

	response := &rest.FrontSessionResponse{}
	inReq := &frontend.FrontSessionWithRuntimeCtx{
		RuntimeCtx:          a.runtimeCtx,
		FrontSessionRequest: &loginRequest,
	}
	if e := frontend.ApplyAuthMiddlewares(req, rsp, inReq, response, session); e != nil {
		if e := session.Save(req.Request, rsp.ResponseWriter); e != nil {
			log.Logger(ctx).Error("Error saving session", zap.Error(e))
		}
		service.RestError401(req, rsp, e)
		return
	}

	if response.Error != "" {
		service.RestError401(req, rsp, errors.New(response.Error))
		return
	}

	if e := session.Save(req.Request, rsp.ResponseWriter); e != nil {
		log.Logger(ctx).Error("Error saving session", zap.Error(e))
	}

	// Legacy code
	if accessToken, ok := session.Values["access_token"]; ok {
		response.JWT = accessToken.(string)
	}

	if expiry, ok := session.Values["expires_at"]; ok {
		if expiryInt, err := strconv.Atoi(expiry.(string)); err == nil {
			response.ExpireTime = int32(expiryInt)
		}
	}

	rsp.WriteEntity(response)
}

// FrontSessionDel logs out user by clearing the associated cookie session.
func (a *FrontendHandler) FrontSessionDel(req *restful.Request, rsp *restful.Response) {

	dao, err := manager.Resolve[sessions.DAO](req.Request.Context())
	if err != nil {
		service.RestError500(req, rsp, fmt.Errorf("could not retrieve dao: %s", err))
		return
	}

	session, err := dao.GetSession(req.Request)
	if err != nil && session == nil {
		service.RestError500(req, rsp, fmt.Errorf("could not load session store: %s", err))
		return
	}

	session.Values = make(map[interface{}]interface{})
	session.Options.MaxAge = -1
	session.Save(req.Request, rsp.ResponseWriter)

	rsp.WriteEntity(nil)
}

// FrontEnrollAuth is a generic endpoint that can be handled by specific 2FA plugins
func (a *FrontendHandler) FrontEnrollAuth(req *restful.Request, rsp *restful.Response) {
	frontend.ApplyEnrollMiddlewares("FrontEnrollAuth", req, rsp)
}

// FrontMessages loads all i18n messages for a given language
func (a *FrontendHandler) FrontMessages(req *restful.Request, rsp *restful.Response) {
	pool, e := frontend.GetPluginsPool()
	if e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	lang := req.PathParameter("Lang")
	rsp.WriteAsJson(pool.I18nMessages(lang).Messages)
}

// Strip Cookies Metadata from context to avoid s3 too-long-header error
func ctxWithoutCookies(ctx context.Context) context.Context {

	if meta, ok := propagator.FromContextRead(ctx); ok {
		newMeta := map[string]string{}
		for k, v := range meta {
			if k != "CookiesString" {
				newMeta[k] = v
			}
		}
		return propagator.NewContext(ctx, newMeta)
	} else {
		return ctx
	}
}

// FrontServeBinary triggers the download of a stored binary.
// As it can be used directly in <img url="/a/frontend/binary">, this endpoint can rely
// on the cookie to authenticate user
func (a *FrontendHandler) FrontServeBinary(req *restful.Request, rsp *restful.Response) {

	binaryType := req.PathParameter("BinaryType")
	binaryUuid := req.PathParameter("Uuid")
	ctx := req.Request.Context()

	router := compose.PathClient(a.runtimeCtx)
	var readNode *tree.Node
	var extension string

	if binaryType == "USER" {

		user, e := permissions.SearchUniqueUser(ctx, binaryUuid, "")
		if e != nil {
			service.RestError404(req, rsp, e)
			return
		}
		if avatarId, ok := user.Attributes["avatar"]; ok {

			readNode = &tree.Node{
				Path: common.PydioDocstoreBinariesNamespace + "/users_binaries." + user.Login + "-" + avatarId,
			}
			extension = strings.Split(avatarId, ".")[1]
		}
	} else if binaryType == "GLOBAL" {

		readNode = &tree.Node{
			Path: common.PydioDocstoreBinariesNamespace + "/global_binaries." + binaryUuid,
		}
		if strings.Contains(binaryUuid, ".") {
			extension = strings.Split(binaryUuid, ".")[1]
		}
	}

	if readNode != nil {
		// If anonymous GET, add system user in context before querying object service
		if ctxUser, _ := permissions.FindUserNameInContext(ctx); ctxUser == "" {
			ctx = context.WithValue(ctx, common.PydioContextUserKey, common.PydioSystemUsername)
		}
		ctx = ctxWithoutCookies(ctx)
		if req.QueryParameter("dim") != "" {
			if dim, e := strconv.ParseInt(req.QueryParameter("dim"), 10, 32); e == nil {
				if e := readBinary(ctx, router, readNode, rsp.ResponseWriter, rsp.Header(), extension, int(dim)); e != nil {
					service.RestError500(req, rsp, e)
				}
				return
			}
		}
		readBinary(ctx, router, readNode, rsp.ResponseWriter, rsp.Header(), extension)
	}
}

// FrontPutBinary receives an upload to store a binary.
func (a *FrontendHandler) FrontPutBinary(req *restful.Request, rsp *restful.Response) {

	binaryType := req.PathParameter("BinaryType")
	binaryUuid := req.PathParameter("Uuid")
	ctx := req.Request.Context()

	if e := req.Request.ParseForm(); e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	var fileInput io.Reader
	var fileSize int64
	f1, f2, e1 := req.Request.FormFile("userfile")
	if e1 != nil {
		service.RestError500(req, rsp, e1)
		return
	}
	fileInput = f1
	fileSize = f2.Size

	cType := strings.Split(f2.Header.Get("Content-Type"), "/")
	extension := cType[1]
	binaryId := uuid.New()[0:12] + "." + extension
	ctxUser, ctxClaims := permissions.FindUserNameInContext(ctx)

	log.Logger(ctx).Debug("Upload Binary", zap.String("type", binaryType), zap.Any("header", f2))
	router := compose.PathClient(a.runtimeCtx)
	ctx = ctxWithoutCookies(ctx)

	defer f1.Close()

	if binaryType == "USER" {

		if f2.Size > avatarDefaultMaxSize {
			service.RestError403(req, rsp, fmt.Errorf("you are not allowed to use files bigger than %dB for avatars", avatarDefaultMaxSize))
			return
		}
		if fi, si, er := filterInputBinaryExif(ctx, fileInput); er == nil {
			fileInput = fi
			fileSize = si
		}
		// USER binaries can only be edited by context user or by admin
		if ctxClaims.Profile != common.PydioProfileAdmin && ctxUser != binaryUuid {
			service.RestError401(req, rsp, fmt.Errorf("you are not allowed to edit this binary"))
			return
		}

		user, e := permissions.SearchUniqueUser(ctx, binaryUuid, "")
		if e != nil {
			service.RestError404(req, rsp, e)
			return
		}
		if !a.IsContextEditable(ctx, user.Uuid, user.Policies) {
			service.RestError403(req, rsp, e)
			return
		}

		node := &tree.Node{
			Path: common.PydioDocstoreBinariesNamespace + "/users_binaries." + binaryUuid + "-" + binaryId,
		}

		if user.Attributes != nil {
			if av, ok := user.Attributes["avatar"]; ok && av != "" {
				// There is an existing avatar, remove it
				oldNode := &tree.Node{
					Path: common.PydioDocstoreBinariesNamespace + "/users_binaries." + binaryUuid + "-" + av,
				}
				if _, e = router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: oldNode}); e != nil {
					log.Logger(ctx).Error("Error while deleting existing binary", node.Zap(), zap.Error(e))
				}
			}
		}

		_, e = router.PutObject(ctx, node, fileInput, &models.PutRequestData{
			Size: fileSize,
		})
		if e != nil {
			service.RestError500(req, rsp, e)
			return
		}

		if user.Attributes == nil {
			user.Attributes = map[string]string{}
		}
		user.Attributes["avatar"] = binaryId
		cli := idmc.UserServiceClient(ctx)
		_, e = cli.CreateUser(ctx, &idm.CreateUserRequest{User: user})
		if e != nil {
			service.RestError404(req, rsp, e)
			return
		}
	} else if binaryType == "GLOBAL" {

		router := compose.PathClient(a.runtimeCtx)
		node := &tree.Node{
			Path: common.PydioDocstoreBinariesNamespace + "/global_binaries." + binaryId,
		}
		if _, e := router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: node}); e != nil {
			log.Logger(ctx).Error("Error while deleting existing binary", node.Zap(), zap.Error(e))
		}

		_, e := router.PutObject(ctx, node, fileInput, &models.PutRequestData{
			Size: fileSize,
		})
		if e != nil {
			service.RestError500(req, rsp, e)
			return
		}

	} else {

		service.RestError500(req, rsp, fmt.Errorf("unsupported Binary Type (must be USER or GLOBAL)"))
		return

	}

	rsp.WriteAsJson(map[string]string{"binary": binaryId})

}

// SettingsMenu builds the list of available page for the Cells Console left menu
func (a *FrontendHandler) SettingsMenu(req *restful.Request, rsp *restful.Response) {

	formDevOnce.Do(func() {
		if os.Getenv("CELLS_ENABLE_FORMS_DEVEL") == "1" {
			settingsNode.Sections = append(settingsNode.Sections,
				&rest.SettingsSection{
					Key:         "developer",
					Label:       "settings.144",
					Description: "settings.144",
					Children: []*rest.SettingsEntry{
						{
							Key:         "forms-devel",
							Label:       "Forms",
							Description: "Forms",
							Metadata: &rest.SettingsEntryMeta{
								IconClass: "mdi mdi-email",
								Component: "AdminPlugins.ServiceEditor",
								Props:     `{"serviceName":"pydio.rest.forms-devel","pluginId":"forms-devel","formToggles":true}`,
							},
						},
					},
				},
			)
		}
	})

	rsp.WriteEntity(settingsNode)

}

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
	"fmt"
	"time"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/commons/docstorec"
	"github.com/pydio/cells/v4/common/client/commons/idmc"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/proto/auth"
	"github.com/pydio/cells/v4/common/proto/docstore"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/mailer"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/utils/i18n"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/permissions"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/idm/oauth/lang"
)

type TokenHandler struct {
	RuntimeCtx context.Context
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (a *TokenHandler) SwaggerTags() []string {
	return []string{"TokenService"}
}

// Filter returns a function to filter the swagger path
func (a *TokenHandler) Filter() func(string) string {
	return nil
}

func (a *TokenHandler) Revoke(req *restful.Request, resp *restful.Response) {

	ctx := req.Request.Context()

	var input rest.RevokeRequest
	e := req.ReadEntity(&input)
	if e != nil {
		service.RestError500(req, resp, errors.BadRequest(common.ServiceAuth, "Cannot decode input request"))
		return
	}

	revokeRequest := &auth.RevokeTokenRequest{}
	revokeRequest.Token = &auth.Token{AccessToken: input.TokenId}
	revokerClient := auth.NewAuthTokenRevokerClient(grpc.ResolveConn(ctx, common.ServiceOAuth))
	if _, err := revokerClient.Revoke(ctx, revokeRequest); err != nil {
		service.RestError500(req, resp, err)
		return
	}

	resp.WriteEntity(&rest.RevokeResponse{Success: true, Message: "Token successfully invalidated"})

}

type ResetToken struct {
	UserLogin  string `json:"user_login"`
	UserEmail  string `json:"user_email"`
	Expiration int32  `json:"expiration"`
}

func (a *TokenHandler) ResetPasswordToken(req *restful.Request, resp *restful.Response) {

	userLogin := req.PathParameter("UserLogin")
	ctx := req.Request.Context()
	response := &rest.ResetPasswordTokenResponse{}
	T := lang.Bundle().GetTranslationFunc(i18n.UserLanguagesFromRestRequest(req, config.Get())...)

	// Search for user by login
	u, e := permissions.SearchUniqueUser(ctx, userLogin, "")
	if e != nil {
		// Search by email
		u, e = permissions.SearchUniqueUser(ctx, "", "", &idm.UserSingleQuery{AttributeName: "email", AttributeValue: userLogin})
		if e != nil || u.Attributes["email"] == "" {
			response.Success = false
			response.Message = T("ResetPassword.Err.EmailNotFound")
			return
		}
	}
	if u.Attributes["email"] == "" {
		response.Success = false
		response.Message = T("ResetPassword.Err.EmailNotFound")
		return
	}
	uLang := i18n.UserLanguage(ctx, u, config.Get())
	T = lang.Bundle().GetTranslationFunc(uLang)

	// Create token and store as document
	token := uuid.New()
	expiration := time.Now().Add(20 * time.Minute).Unix()
	keyData, _ := json.Marshal(&ResetToken{
		UserLogin:  u.Login,
		UserEmail:  u.Attributes["email"],
		Expiration: int32(expiration),
	})
	_, err := docstorec.DocStoreClient(ctx).PutDocument(ctx, &docstore.PutDocumentRequest{
		StoreID: common.DocStoreIdResetPassKeys,
		Document: &docstore.Document{
			ID:            token,
			Owner:         u.Login,
			Type:          docstore.DocumentType_JSON,
			Data:          string(keyData),
			IndexableMeta: string(keyData),
		},
	})
	if err != nil {
		log.Logger(ctx).Error("Could not store reset password key", zap.Error(err))
		response.Success = false
		response.Message = T("ResetPassword.Err.Unknown")
		return
	}

	// Send email
	mailCli := mailer.NewMailerServiceClient(grpc.ResolveConn(ctx, common.ServiceMailer))
	mailCli.SendMail(ctx, &mailer.SendMailRequest{
		InQueue: false,
		Mail: &mailer.Mail{
			To: []*mailer.User{{
				Uuid:     u.Uuid,
				Name:     u.Attributes["displayName"],
				Address:  u.Attributes["email"],
				Language: uLang,
			}},
			TemplateId: "ResetPassword",
			TemplateData: map[string]string{
				"LinkPath": fmt.Sprintf("/user/reset-password/%s", token),
			},
		},
	})
	response.Success = true
	response.Message = T("ResetPassword.Success.EmailSent")

	resp.WriteEntity(response)
}

func (a *TokenHandler) ResetPassword(req *restful.Request, resp *restful.Response) {

	var input rest.ResetPasswordRequest
	if e := req.ReadEntity(&input); e != nil {
		service.RestError500(req, resp, e)
		return
	}
	T := lang.Bundle().GetTranslationFunc(i18n.UserLanguagesFromRestRequest(req, config.Get())...)
	ctx := req.Request.Context()
	token := input.ResetPasswordToken
	cli := docstorec.DocStoreClient(ctx)
	docResp, e := cli.GetDocument(ctx, &docstore.GetDocumentRequest{
		StoreID:    common.DocStoreIdResetPassKeys,
		DocumentID: token,
	})
	if e != nil || docResp.Document == nil || docResp.Document.Data == "" {
		if e == nil {
			e = fmt.Errorf(T("ResetPassword.Err.Unknown"))
		}
		service.RestError500(req, resp, e)
		return
	}
	// Delete in store token now
	cli.DeleteDocuments(ctx, &docstore.DeleteDocumentsRequest{StoreID: common.DocStoreIdResetPassKeys, DocumentID: token})

	jsonData := docResp.Document.Data
	var storedToken ResetToken
	if e := json.Unmarshal([]byte(jsonData), &storedToken); e != nil {
		service.RestError500(req, resp, e)
		return
	}
	response := &rest.ResetPasswordResponse{}
	if time.Unix(int64(storedToken.Expiration), 0).Before(time.Now()) {
		response.Success = false
		response.Message = T("ResetPassword.Err.TokenExpired")
		return
	}
	if storedToken.UserLogin != input.UserLogin && storedToken.UserEmail != input.UserLogin {
		response.Success = false
		response.Message = T("ResetPassword.Err.TokenNotCorresponding")
		return
	}
	u, e := permissions.SearchUniqueUser(ctx, storedToken.UserLogin, "")
	if e != nil {
		response.Success = false
		response.Message = T("ResetPassword.Err.UserNotFound")
		return
	}
	uLang := i18n.UserLanguage(ctx, u, config.Get())
	T = lang.Bundle().GetTranslationFunc(uLang)
	u.Password = input.NewPassword
	userClient := idmc.UserServiceClient(ctx)
	if _, e := userClient.CreateUser(ctx, &idm.CreateUserRequest{User: u}); e != nil {
		service.RestError500(req, resp, fmt.Errorf(T("ResetPassword.Err.ResetFailed")))
		return
	}

	go func() {
		// Send email
		mailCli := mailer.NewMailerServiceClient(grpc.ResolveConn(ctx, common.ServiceMailer))
		mailCli.SendMail(ctx, &mailer.SendMailRequest{
			InQueue: false,
			Mail: &mailer.Mail{
				To: []*mailer.User{{
					Uuid:     u.Uuid,
					Name:     u.Attributes["displayName"],
					Address:  u.Attributes["email"],
					Language: uLang,
				}},
				TemplateId:   "ResetPasswordDone",
				TemplateData: map[string]string{},
			},
		})
	}()

	response.Success = true
	response.Message = T("ResetPassword.Success.ResetFinished")

	resp.WriteEntity(response)

}

// GenerateDocumentAccessToken generates a temporary access token for a specific document for the current user
func (a *TokenHandler) GenerateDocumentAccessToken(req *restful.Request, resp *restful.Response) {

	var datRequest rest.DocumentAccessTokenRequest
	if e := req.ReadEntity(&datRequest); e != nil {
		service.RestError500(req, resp, e)
		return
	}
	ctx := req.Request.Context()
	router := compose.PathClient(a.RuntimeCtx)
	readResp, e := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: datRequest.Path}})
	if e != nil {
		service.RestErrorDetect(req, resp, e)
		return
	}
	uName, claims := permissions.FindUserNameInContext(ctx)
	uUuid := claims.Subject
	permission := "r" // Must be read at least by default !
	if readResp.Node.GetStringMeta(common.MetaFlagReadonly) == "" {
		permission = "rw"
	}
	scope := fmt.Sprintf("node:%s:%s", readResp.Node.GetUuid(), permission)

	cVal := config.Get("defaults", "personalTokens", "documentTokensRefresh").Default("30m").String()
	var refresh int32
	if d, e := time.ParseDuration(cVal); e != nil {
		refresh = 30 * 60
	} else {
		refresh = int32(d.Seconds())
	}

	generateRequest := &auth.PatGenerateRequest{
		Type:              auth.PatType_DOCUMENT,
		UserUuid:          uUuid,
		UserLogin:         uName,
		Label:             "Temporary access token for document " + readResp.Node.Path,
		AutoRefreshWindow: refresh,
		Issuer:            req.Request.URL.String(),
		Scopes:            []string{scope},
	}
	a.GenerateAndWrite(ctx, generateRequest, req, resp)

}

func (a *TokenHandler) GenerateAndWrite(ctx context.Context, genReq *auth.PatGenerateRequest, req *restful.Request, resp *restful.Response) {
	cli := auth.NewPersonalAccessTokenServiceClient(grpc.ResolveConn(ctx, common.ServiceToken))
	log.Logger(ctx).Debug("Sending generate request", zap.Any("req", genReq))
	genResp, e := cli.Generate(ctx, genReq)
	if e != nil {
		service.RestErrorDetect(req, resp, e)
		return
	}
	resp.WriteEntity(&rest.DocumentAccessTokenResponse{AccessToken: genResp.AccessToken})
}

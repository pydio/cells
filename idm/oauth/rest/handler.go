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

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/client/commons/docstorec"
	"github.com/pydio/cells/v5/common/client/commons/idmc"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/middleware"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/auth"
	"github.com/pydio/cells/v5/common/proto/docstore"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/mailer"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/i18n/languages"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/uuid"
	"github.com/pydio/cells/v5/idm/oauth/lang"
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

func (a *TokenHandler) Revoke(req *restful.Request, resp *restful.Response) error {

	ctx := req.Request.Context()

	var input rest.RevokeRequest
	e := req.ReadEntity(&input)
	if e != nil {
		return e
	}

	revokeRequest := &auth.RevokeTokenRequest{}
	revokeRequest.Token = &auth.Token{AccessToken: input.TokenId}
	revokerClient := auth.NewAuthTokenRevokerClient(grpc.ResolveConn(ctx, common.ServiceOAuthGRPC))
	if _, err := revokerClient.Revoke(ctx, revokeRequest); err != nil {
		return err
	}

	return resp.WriteEntity(&rest.RevokeResponse{Success: true, Message: "Token successfully invalidated"})

}

type ResetToken struct {
	UserLogin  string `json:"user_login"`
	UserEmail  string `json:"user_email"`
	Expiration int32  `json:"expiration"`
}

func (a *TokenHandler) ResetPasswordToken(req *restful.Request, resp *restful.Response) error {

	userLogin := req.PathParameter("UserLogin")
	ctx := req.Request.Context()
	response := &rest.ResetPasswordTokenResponse{}
	T := lang.Bundle().T(middleware.DetectedLanguages(req.Request.Context())...)

	// Search for user by login
	u, e := permissions.SearchUniqueUser(ctx, userLogin, "")
	if e != nil {
		// Search by email
		u, e = permissions.SearchUniqueUser(ctx, "", "", &idm.UserSingleQuery{AttributeName: "email", AttributeValue: userLogin})
		if e != nil || u.Attributes["email"] == "" {
			response.Success = false
			response.Message = T("ResetPassword.Err.EmailNotFound")
			return resp.WriteEntity(response)
		}
	}
	if u.Attributes["email"] == "" {
		response.Success = false
		response.Message = T("ResetPassword.Err.EmailNotFound")
		return resp.WriteEntity(response)
	}
	uLang := languages.UserLanguage(ctx, u)
	T = lang.Bundle().T(uLang)

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
		return resp.WriteEntity(response)
	}

	// Send email
	mailCli := mailer.NewMailerServiceClient(grpc.ResolveConn(ctx, common.ServiceMailerGRPC))
	_, er := mailCli.SendMail(ctx, &mailer.SendMailRequest{
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
	if er != nil {
		response.Success = false
		response.Message = T("ResetPassword.Err.ResetFailed")
	} else {
		response.Success = true
		response.Message = T("ResetPassword.Success.EmailSent")
	}

	return resp.WriteEntity(response)
}

func (a *TokenHandler) ResetPassword(req *restful.Request, resp *restful.Response) error {

	var input rest.ResetPasswordRequest
	if e := req.ReadEntity(&input); e != nil {
		return e
	}
	T := lang.Bundle().T(middleware.DetectedLanguages(req.Request.Context())...)
	ctx := req.Request.Context()
	token := input.ResetPasswordToken
	cli := docstorec.DocStoreClient(ctx)
	docResp, e := cli.GetDocument(ctx, &docstore.GetDocumentRequest{
		StoreID:    common.DocStoreIdResetPassKeys,
		DocumentID: token,
	})
	if e != nil || docResp.Document == nil || docResp.Document.Data == "" {
		if e == nil {
			e = errors.WithStack(errors.StatusNotFound)
		}
		return e
	}
	// Delete in store token now
	_, _ = cli.DeleteDocuments(ctx, &docstore.DeleteDocumentsRequest{StoreID: common.DocStoreIdResetPassKeys, DocumentID: token})

	jsonData := docResp.Document.Data
	var storedToken ResetToken
	if e = json.Unmarshal([]byte(jsonData), &storedToken); e != nil {
		return errors.Tag(e, errors.UnmarshalError)
	}
	response := &rest.ResetPasswordResponse{}
	if time.Unix(int64(storedToken.Expiration), 0).Before(time.Now()) {
		response.Success = false
		response.Message = T("ResetPassword.Err.TokenExpired")
		return resp.WriteEntity(response)
	}
	if storedToken.UserLogin != input.UserLogin && storedToken.UserEmail != input.UserLogin {
		response.Success = false
		response.Message = T("ResetPassword.Err.TokenNotCorresponding")
		return resp.WriteEntity(response)
	}
	u, e := permissions.SearchUniqueUser(ctx, storedToken.UserLogin, "")
	if e != nil {
		response.Success = false
		response.Message = T("ResetPassword.Err.UserNotFound")
		return resp.WriteEntity(response)
	}
	uLang := languages.UserLanguage(ctx, u)
	T = lang.Bundle().T(uLang)
	u.Password = input.NewPassword
	userClient := idmc.UserServiceClient(ctx)
	if _, e = userClient.CreateUser(ctx, &idm.CreateUserRequest{User: u}); e != nil {
		return e
	}

	go func() {
		// Send email
		mailCli := mailer.NewMailerServiceClient(grpc.ResolveConn(ctx, common.ServiceMailerGRPC))
		_, _ = mailCli.SendMail(ctx, &mailer.SendMailRequest{
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
	return resp.WriteEntity(response)

}

// GenerateDocumentAccessToken generates a temporary access token for a specific document for the current user
func (a *TokenHandler) GenerateDocumentAccessToken(req *restful.Request, resp *restful.Response) error {

	var datRequest rest.DocumentAccessTokenRequest
	if e := req.ReadEntity(&datRequest); e != nil {
		return e
	}
	ctx := req.Request.Context()
	router := compose.PathClient()
	readResp, e := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: datRequest.Path}})
	if e != nil {
		return e
	}
	claims, ok := claim.FromContext(ctx)
	if !ok {
		return errors.WithStack(errors.MissingClaims)
	}

	permission := "r" // Must be read at least by default !
	if readResp.Node.GetStringMeta(common.MetaFlagReadonly) == "" {
		permission = "rw"
	}
	scope := fmt.Sprintf("node:%s:%s", readResp.Node.GetUuid(), permission)

	cVal := config.Get(ctx, "defaults", "personalTokens", "documentTokensRefresh").Default("30m").String()
	var refresh int32
	if d, e := time.ParseDuration(cVal); e != nil {
		refresh = 30 * 60
	} else {
		refresh = int32(d.Seconds())
	}

	generateRequest := &auth.PatGenerateRequest{
		Type:              auth.PatType_DOCUMENT,
		UserUuid:          claims.Subject,
		UserLogin:         claims.Name,
		Label:             "Temporary access token for document " + readResp.Node.Path,
		AutoRefreshWindow: refresh,
		Issuer:            req.Request.URL.String(),
		Scopes:            []string{scope},
	}

	return a.GenerateAndWrite(ctx, generateRequest, req, resp)

}

func (a *TokenHandler) GenerateAndWrite(ctx context.Context, genReq *auth.PatGenerateRequest, req *restful.Request, resp *restful.Response) error {
	cli := auth.NewPersonalAccessTokenServiceClient(grpc.ResolveConn(ctx, common.ServiceTokenGRPC))
	log.Logger(ctx).Debug("Sending generate request", zap.Any("req", genReq))
	genResp, e := cli.Generate(ctx, genReq)
	if e != nil {
		return e
	}
	return resp.WriteEntity(&rest.DocumentAccessTokenResponse{AccessToken: genResp.AccessToken})
}

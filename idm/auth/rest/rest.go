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
	"encoding/json"
	"fmt"
	"time"

	"github.com/emicklei/go-restful"
	"github.com/micro/go-micro/errors"
	"github.com/pborman/uuid"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/proto/auth"
	"github.com/pydio/cells/common/proto/docstore"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/mailer"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/utils"
)

type TokenHandler struct{}

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
	claims, ok := ctx.Value(claim.ContextKey).(claim.Claims)
	if !ok || !claims.Verified {
		e := errors.Forbidden(common.SERVICE_AUTH, "invalid token")
		resp.WriteError(403, e)
		return
	}

	var input rest.RevokeRequest
	e := req.ReadEntity(&input)
	if e != nil {
		service.RestError500(req, resp, errors.BadRequest(common.SERVICE_AUTH, "Cannot decode input request"))
		return
	}

	revokeRequest := &auth.RevokeTokenRequest{}
	if input.TokenId != "" {
		// Revoke a specific token
		info := map[string]interface{}{
			"revoker": claims.Name,
		}
		infoBytes, _ := json.Marshal(&info)

		revokeRequest.Token = &auth.Token{Value: input.TokenId, AdditionalInfo: string(infoBytes)}
	} else {
		// Revoke current user token
		claimsBytes, _ := json.Marshal(claims)
		revokeRequest.Token = &auth.Token{Value: string(claimsBytes)}
	}
	revokerClient := auth.NewAuthTokenRevokerClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_AUTH, defaults.NewClient())
	if _, err := revokerClient.Revoke(ctx, revokeRequest); err != nil {
		service.RestError500(req, resp, err)
		return
	}

	resp.WriteEntity(&rest.RevokeResponse{Success: true, Message: "Token successfully invalidated"})

}

type ResetToken struct {
	UserLogin  string `json:"user_login"`
	Expiration int32  `json:"expiration"`
}

func (a *TokenHandler) ResetPasswordToken(req *restful.Request, resp *restful.Response) {

	userLogin := req.PathParameter("UserLogin")
	ctx := req.Request.Context()
	response := &rest.ResetPasswordTokenResponse{}

	// Search for user by login
	u, e := utils.SearchUniqueUser(ctx, userLogin, "")
	if e != nil {
		// Search by email
		u, e = utils.SearchUniqueUser(ctx, "", "", &idm.UserSingleQuery{AttributeName: "email", AttributeValue: userLogin})
		if e != nil || u.Attributes["email"] == "" {
			response.Success = false
			response.Message = "Cannot find corresponding email address"
			return
		}
	}
	if u.Attributes["email"] == "" {
		response.Success = false
		response.Message = "Cannot find corresponding email address"
		return
	}

	// Create token and store as document
	token := uuid.NewUUID().String()
	expiration := time.Now().Add(20 * time.Minute).Unix()
	keyData, _ := json.Marshal(&ResetToken{
		UserLogin:  u.Login,
		Expiration: int32(expiration),
	})
	cli := docstore.NewDocStoreClient(registry.GetClient(common.SERVICE_DOCSTORE))
	_, err := cli.PutDocument(ctx, &docstore.PutDocumentRequest{
		StoreID: "resetPasswordKeys",
		Document: &docstore.Document{
			ID:            token,
			Owner:         u.Login,
			Type:          docstore.DocumentType_JSON,
			Data:          string(keyData),
			IndexableMeta: string(keyData),
		},
	})
	if err != nil {
		response.Success = false
		response.Message = err.Error()
		return
	}

	// Send email
	mailCli := mailer.NewMailerServiceClient(registry.GetClient(common.SERVICE_MAILER))
	mailCli.SendMail(ctx, &mailer.SendMailRequest{
		InQueue: false,
		Mail: &mailer.Mail{
			To: []*mailer.User{{
				Uuid:    u.Uuid,
				Name:    u.Attributes["displayName"],
				Address: u.Attributes["email"],
			}},
			TemplateId: "ResetPassword",
			TemplateData: map[string]string{
				"LinkPath": fmt.Sprintf("/user/reset-password/%s", token),
			},
		},
	})
	response.Success = true
	response.Message = "An email has been sent to you with further instructions"

	resp.WriteEntity(response)
}

func (a *TokenHandler) ResetPassword(req *restful.Request, resp *restful.Response) {

	var input rest.ResetPasswordRequest
	if e := req.ReadEntity(&input); e != nil {
		service.RestError500(req, resp, e)
		return
	}
	ctx := req.Request.Context()
	token := input.ResetPasswordToken
	cli := docstore.NewDocStoreClient(registry.GetClient(common.SERVICE_DOCSTORE))
	docResp, e := cli.GetDocument(ctx, &docstore.GetDocumentRequest{
		StoreID:    "resetPasswordKeys",
		DocumentID: token,
	})
	if e != nil || docResp.Document == nil || docResp.Document.Data == "" {
		if e == nil {
			e = fmt.Errorf("Oops, something wrong happened - Please relaunch reset password process")
		}
		service.RestError500(req, resp, e)
		return
	}
	// Delete in store token now
	cli.DeleteDocuments(ctx, &docstore.DeleteDocumentsRequest{StoreID: "resetPasswordKeys", DocumentID: token})

	jsonData := docResp.Document.Data
	var storedToken ResetToken
	if e := json.Unmarshal([]byte(jsonData), &storedToken); e != nil {
		service.RestError500(req, resp, e)
		return
	}
	response := &rest.ResetPasswordResponse{}
	if time.Unix(int64(storedToken.Expiration), 0).Before(time.Now()) {
		response.Success = false
		response.Message = "Token is expired, please follow again the reset password process!"
		return
	}
	if storedToken.UserLogin != input.UserLogin {
		response.Success = false
		response.Message = "Token is does not correspond to this user identifier!"
		return
	}
	u, e := utils.SearchUniqueUser(ctx, storedToken.UserLogin, "")
	if e != nil {
		response.Success = false
		response.Message = "Cannot find corresponding user"
		return
	}
	u.Password = input.NewPassword
	userClient := idm.NewUserServiceClient(registry.GetClient(common.SERVICE_USER))
	if _, e := userClient.CreateUser(ctx, &idm.CreateUserRequest{User: u}); e != nil {
		service.RestError500(req, resp, fmt.Errorf("Error while trying to set new password!"))
		return
	}

	go func() {
		// Send email
		mailCli := mailer.NewMailerServiceClient(registry.GetClient(common.SERVICE_MAILER))
		mailCli.SendMail(ctx, &mailer.SendMailRequest{
			InQueue: false,
			Mail: &mailer.Mail{
				To: []*mailer.User{{
					Uuid:    u.Uuid,
					Name:    u.Attributes["displayName"],
					Address: u.Attributes["email"],
				}},
				TemplateId:   "ResetPasswordDone",
				TemplateData: map[string]string{},
			},
		})
	}()

	response.Success = true
	response.Message = "Your password has successfully been reset, you can now return to the login page!"

	resp.WriteEntity(response)

}

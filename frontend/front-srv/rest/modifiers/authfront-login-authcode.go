package modifiers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/emicklei/go-restful"
	"github.com/gorilla/sessions"
	"github.com/micro/go-micro/errors"
	"github.com/pborman/uuid"
	"go.uber.org/zap"
	"golang.org/x/oauth2"

	"github.com/pydio/cells/common"
	commonauth "github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service/frontend"
	serviceproto "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils/permissions"
)

// AuthorizationCodeAuth allows users having a valid AuthCode to register a session
func AuthorizationCodeAuth(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {

	return func(req *restful.Request, rsp *restful.Response, in *rest.FrontSessionRequest, out *rest.FrontSessionResponse, session *sessions.Session) error {

		// BEFORE MIDDLEWARE

		// MIDDLEWARE
		if err := middleware(req, rsp, in, out, session); err != nil {
			return err
		}

		// AFTER MIDDLEWARE
		if a, ok := in.AuthInfo["type"]; !ok || a != "authorization_code" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}

		code, ok := in.AuthInfo["code"]
		if !ok {
			return errors.New("code.not_found", "Missing code", http.StatusNotFound)
		}

		// Special case for redirections
		if redirectURL, ok := in.AuthInfo["redirect_url"]; ok && redirectURL != "" {
			out.RedirectTo = redirectURL + "?code=" + code + "&state=" + in.AuthInfo["state"]
			return middleware(req, rsp, in, out, session)
		}

		token, err := tokenFromAuthCode(in.AuthInfo["code"])
		if err != nil {
			return err
		}

		session.Values["access_token"] = token.AccessToken
		session.Values["id_token"] = token.Extra("id_token").(string)
		session.Values["expires_at"] = strconv.Itoa(int(token.Expiry.Unix()))
		session.Values["refresh_token"] = token.RefreshToken

		out.Token = &rest.Token{
			AccessToken: session.Values["access_token"].(string),
			IDToken:     session.Values["id_token"].(string),
			ExpiresAt:   session.Values["expires_at"].(string),
		}

		return middleware(req, rsp, in, out, session)
	}
}

func tokenFromAuthCode(code string) (*oauth2.Token, error) {

	ctx := context.Background()

	// Verify state and errors.
	token, err := commonauth.DefaultJWTVerifier().Exchange(ctx, code)
	if err != nil {
		// handle error
		return nil, fmt.Errorf("Could not exchange code")
	}

	// Parse and verify ID Token payload.
	if _, c, err := commonauth.DefaultJWTVerifier().Verify(ctx, token.AccessToken); err != nil {

		e := errors.Parse(err.Error())
		if e.Code == http.StatusNotFound {

			login := c.Email
			attributes := map[string]string{
				idm.UserAttrProfile: common.PYDIO_PROFILE_STANDARD,
				idm.UserAttrEmail:   c.Email,
			}

			// Mapping Group
			sub, err := c.DecodeSubject()
			if err != nil {
				return nil, err
			}

			// Mapping admin profile
			if c.Profile == "admin" {
				attributes[idm.UserAttrProfile] = common.PYDIO_PROFILE_ADMIN
			}

			// Mapping Display Name
			if c.DisplayName != "" {
				attributes[idm.UserAttrDisplayName] = c.DisplayName
			} else if c.Name != "" {
				attributes[idm.UserAttrDisplayName] = c.Name
			}

			// This means that we didn't find the user, so let's create one
			user := &idm.User{
				Login:     login,
				GroupPath: sub.ConnId,
				Policies: []*serviceproto.ResourcePolicy{
					{Subject: "profile:standard", Action: serviceproto.ResourcePolicyAction_READ, Effect: serviceproto.ResourcePolicy_allow},
					{Subject: "user:" + login, Action: serviceproto.ResourcePolicyAction_WRITE, Effect: serviceproto.ResourcePolicy_allow},
					{Subject: "profile:admin", Action: serviceproto.ResourcePolicyAction_WRITE, Effect: serviceproto.ResourcePolicy_allow},
				},
				Attributes: attributes,
			}

			if err := createNewUser(user); err != nil {
				return nil, errors.InternalServerError("cannot.create.user", err.Error())
			}

			if _, _, err := commonauth.DefaultJWTVerifier().Verify(ctx, token.AccessToken); err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}

	return token, err
}

func createNewUser(inputUser *idm.User) error {

	ctx := context.Background()

	cli := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())

	if inputUser.GroupPath != "" {
		id := inputUser.GroupPath
		labels := getConnectorsLabels()
		if label, ok := labels[id]; ok {
			// Pre-create group with label as displayName
			if _, e := permissions.SearchUniqueUser(ctx, "", "", &idm.UserSingleQuery{
				NodeType: idm.NodeType_GROUP,
				FullPath: "/" + id,
			}); e != nil {
				log.Logger(ctx).Info("Creating group with label for connector", zap.String("l", label))
				_, e := cli.CreateUser(ctx, &idm.CreateUserRequest{
					User: &idm.User{
						Uuid:       uuid.New(),
						IsGroup:    true,
						GroupPath:  "/" + id,
						GroupLabel: id,
						Attributes: map[string]string{"displayName": label},
					},
				})
				if e != nil {
					log.Logger(ctx).Error("Cannot create group with label for connector", zap.Error(e))
				}
			}
		}
	}

	log.Logger(ctx).Info("Creating the following user automatically", inputUser.Zap())

	response, err := cli.CreateUser(ctx, &idm.CreateUserRequest{
		User: inputUser,
	})
	if err != nil {
		return err
	}

	var newRole = &idm.Role{
		Uuid:     response.User.Uuid,
		UserRole: true,
		Label:    "User " + response.User.Login,
		Policies: inputUser.Policies,
	}

	roleCli := idm.NewRoleServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, defaults.NewClient())

	if _, err := roleCli.CreateRole(ctx, &idm.CreateRoleRequest{Role: newRole}); err != nil {
		return err
	}

	out := response.User
	path := "/"
	if len(out.GroupPath) > 1 {
		path = out.GroupPath + "/"
	}

	log.Auditer(ctx).Info(
		fmt.Sprintf("Created user [%s%s]", path, out.Login),
		log.GetAuditId(common.AUDIT_USER_CREATE),
		out.ZapUuid(),
	)

	return nil
}

func getConnectorsLabels() map[string]string {
	confValues := config.Get("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_AUTH, "dex", "connectors").Bytes()
	labels := make(map[string]string)
	var connectors []map[string]interface{}
	if err := json.Unmarshal(confValues, &connectors); err != nil {
		return labels
	}
	for _, c := range connectors {
		id := c["id"].(string)
		if label, ok := c["name"]; ok {
			labels[id] = label.(string)
		}
	}
	return labels
}

package modifiers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/emicklei/go-restful"
	"github.com/gorilla/sessions"
	"github.com/micro/go-micro/errors"
	"github.com/pborman/uuid"

	"github.com/pydio/cells/common"
	commonauth "github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service/frontend"

	serviceproto "github.com/pydio/cells/common/service/proto"
)

func AuthorizationCodeAuth(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {

	return func(req *restful.Request, rsp *restful.Response, in *rest.FrontSessionRequest, out *rest.FrontSessionResponse, session *sessions.Session) error {

		if a, ok := in.AuthInfo["type"]; !ok || a != "authorization_code" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}

		nonce := uuid.New()

		respMap, err := jwtFromAuthCode(in.AuthInfo["code"])

		if err != nil {
			return middleware(req, rsp, in, out, session)
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

func jwtFromAuthCode(code string) (map[string]interface{}, error) {

	ctx := context.Background()

	values := make(map[string]interface{})

	// Verify state and errors.
	token, err := commonauth.DefaultJWTVerifier().Exchange(ctx, code)
	if err != nil {
		// handle error
		return nil, fmt.Errorf("Could not exchange code")
	}

	rawIDToken, ok := token.Extra("id_token").(string)
	if !ok {
		return nil, fmt.Errorf("Could not get id_token")
	}

	// Parse and verify ID Token payload.
	if _, claims, err := commonauth.DefaultJWTVerifier().Verify(ctx, rawIDToken); err != nil {
		e := errors.Parse(err.Error())
		if e.Code == http.StatusNotFound {
			// This means that we didn't find the user, so let's create one
			user := &idm.User{
				Login: claims.Name,
				Policies: []*serviceproto.ResourcePolicy{
					{Subject: "profile:standard", Action: serviceproto.ResourcePolicyAction_READ, Effect: serviceproto.ResourcePolicy_allow},
					{Subject: "user:" + claims.Name, Action: serviceproto.ResourcePolicyAction_WRITE, Effect: serviceproto.ResourcePolicy_allow},
					{Subject: "profile:admin", Action: serviceproto.ResourcePolicyAction_WRITE, Effect: serviceproto.ResourcePolicy_allow},
				},
				Attributes: map[string]string{"profile": common.PYDIO_PROFILE_STANDARD},
			}

			if err := createNewUser(user); err != nil {
				return nil, fmt.Errorf("Could not create new user")
			}

			if _, _, err := commonauth.DefaultJWTVerifier().Verify(ctx, rawIDToken); err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}

	values["id_token"] = rawIDToken
	values["expires_in"] = token.Extra("expires_in")
	values["refresh_token"] = token.Extra("refresh_token")

	return values, err
}

func createNewUser(inputUser *idm.User) error {

	ctx := context.Background()

	cli := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())

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

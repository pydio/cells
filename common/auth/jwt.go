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

package auth

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/coreos/dex/storage"
	"github.com/coreos/go-oidc"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	errors2 "github.com/micro/go-micro/errors"
	"github.com/micro/go-micro/metadata"
	"go.uber.org/zap"
	"golang.org/x/oauth2"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/auth"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils/permissions"
)

// Config is the config format for the main application.
type simpleConfig struct {
	Issuer string `json:"issuer"`
	// StaticClients cause the server to use this list of clients rather than
	// querying the storage. Write operations, like creating a client, will fail.
	StaticClients []storage.Client `json:"staticClients"`
}

func DefaultJWTVerifier() *JWTVerifier {

	var dex simpleConfig
	configDex := config.Get("services", "pydio.grpc.auth", "dex")
	remarshall, _ := json.Marshal(configDex)
	json.Unmarshal(remarshall, &dex)

	var cIds []string
	for _, c := range dex.StaticClients {
		cIds = append(cIds, c.ID)
	}

	return &JWTVerifier{
		IssuerUrl:           dex.Issuer,
		checkClientIds:      cIds,
		defaultClientID:     dex.StaticClients[0].ID,
		defaultClientSecret: dex.StaticClients[0].Secret,
	}
}

type JWTVerifier struct {
	IssuerUrl           string
	checkClientIds      []string
	defaultClientID     string
	defaultClientSecret string
}

// Verify validates an existing JWT token against the OIDC service that issued it
func (j *JWTVerifier) Verify(ctx context.Context, rawIDToken string) (context.Context, claim.Claims, error) {

	claims := claim.Claims{}

	ctx = oidc.ClientContext(ctx, &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: config.GetTLSClientConfig("proxy"),
		},
	})
	provider, err := oidc.NewProvider(ctx, j.IssuerUrl)
	if err != nil {
		log.Logger(ctx).Error("cannot init oidc provider", zap.Error(err))
		return ctx, claims, err
	}

	var idToken *oidc.IDToken
	var checkErr error
	for _, clientId := range j.checkClientIds {
		var verifier = provider.Verifier(&oidc.Config{ClientID: clientId, SkipNonceCheck: true})
		// Parse and verify ID Token payload.
		testToken, err := verifier.Verify(ctx, rawIDToken)
		if err != nil {
			log.Logger(ctx).Debug("jwt rawIdToken verify: failed", zap.Error(err))
			checkErr = err
		} else {
			idToken = testToken
			break
		}
	}
	if idToken == nil {
		return ctx, claims, checkErr
	}

	cli := auth.NewAuthTokenRevokerClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_AUTH, defaults.NewClient())
	rsp, err := cli.MatchInvalid(ctx, &auth.MatchInvalidTokenRequest{
		Token: rawIDToken,
	})

	if err != nil {
		log.Logger(ctx).Error("verify", zap.Error(err))
		return ctx, claims, err
	}

	if rsp.State == auth.State_REVOKED {
		log.Logger(ctx).Error("jwt is verified but it is revoked")
		return ctx, claim.Claims{}, errors.New("jwt was Revoked")
	}

	// Extract custom claims
	if err := idToken.Claims(&claims); err != nil {
		log.Logger(ctx).Error("cannot extract custom claims from idToken", zap.Error(err))
		return ctx, claims, err
	}

	if claims.Name == "" {
		log.Logger(ctx).Error("verify name")
		return ctx, claims, errors.New("cannot find name inside claims")
	}

	user, err := permissions.SearchUniqueUser(ctx, claims.Name, "")
	if err != nil {
		return ctx, claims, err
	}

	displayName, ok := user.Attributes["displayName"]
	if !ok {
		displayName = ""
	}

	profile, ok := user.Attributes["profile"]
	if !ok {
		profile = "standard"
	}

	var roles []string
	for _, role := range user.Roles {
		roles = append(roles, role.Uuid)
	}

	claims.DisplayName = displayName
	claims.Profile = profile
	claims.Roles = strings.Join(roles, ",")
	claims.GroupPath = user.GroupPath

	ctx = context.WithValue(ctx, claim.ContextKey, claims)
	md := make(map[string]string)
	if existing, ok := metadata.FromContext(ctx); ok {
		for k, v := range existing {
			md[k] = v
		}
	}
	md[common.PYDIO_CONTEXT_USER_KEY] = claims.Name
	jsonClaims, _ := json.Marshal(claims)
	md[claim.MetadataContextKey] = string(jsonClaims)
	ctx = metadata.NewContext(ctx, md)

	return ctx, claims, nil
}

// PasswordCredentialsToken will perform a call to the OIDC service with grantType "password"
// to get a valid token from a given user/pass credentials
func (j *JWTVerifier) PasswordCredentialsToken(ctx context.Context, userName string, password string) (context.Context, claim.Claims, error) {

	// Get JWT From Dex
	provider, _ := oidc.NewProvider(ctx, j.IssuerUrl)
	// Configure an OpenID Connect aware OAuth2 client.
	oauth2Config := oauth2.Config{
		ClientID:     j.defaultClientID,
		ClientSecret: j.defaultClientSecret,
		// Discovery returns the OAuth2 endpoints.
		Endpoint: provider.Endpoint(),
		// "openid" is a required scope for OpenID Connect flows.
		Scopes: []string{oidc.ScopeOpenID, "profile", "email", "pydio"},
	}

	claims := claim.Claims{}

	if token, err := oauth2Config.PasswordCredentialsToken(ctx, userName, password); err == nil {
		idToken, _ := provider.Verifier(&oidc.Config{SkipClientIDCheck: true, SkipNonceCheck: true}).Verify(ctx, token.Extra("id_token").(string))

		if e := idToken.Claims(&claims); e == nil {

			if claims.Name == "" {
				return ctx, claims, errors.New("No name inside Claims")
			}

			ctx = context.WithValue(ctx, claim.ContextKey, claims)

			md := make(map[string]string)
			if existing, ok := metadata.FromContext(ctx); ok {
				for k, v := range existing {
					md[k] = v
				}
			}
			md[common.PYDIO_CONTEXT_USER_KEY] = claims.Name
			ctx = metadata.NewContext(ctx, md)

			return ctx, claims, nil

		} else {
			return ctx, claims, e
		}
	} else {
		return ctx, claims, err
	}

}

// Add a fake Claims in context to impersonate user
func WithImpersonate(ctx context.Context, user *idm.User) context.Context {
	roles := make([]string, len(user.Roles))
	for _, r := range user.Roles {
		roles = append(roles, r.Uuid)
	}
	// Build Fake Claims Now
	c := claim.Claims{
		Name:  user.Login,
		Email: "TODO@pydio.com",
		Roles: strings.Join(roles, ","),
	}
	return context.WithValue(ctx, claim.ContextKey, c)
}

// SubjectsForResourcePolicyQuery prepares a slice of strings that will be used to check for resource ownership.
// Can be extracted either from context or by loading a given user ID from database.
func SubjectsForResourcePolicyQuery(ctx context.Context, q *rest.ResourcePolicyQuery) (subjects []string, err error) {

	if q == nil {
		q = &rest.ResourcePolicyQuery{Type: rest.ResourcePolicyQuery_CONTEXT}
	}

	switch q.Type {
	case rest.ResourcePolicyQuery_ANY, rest.ResourcePolicyQuery_NONE:

		var value interface{}
		if value = ctx.Value(claim.ContextKey); value == nil {
			return subjects, errors2.BadRequest("resources", "Only admin profiles can list resources of other users")
		}
		claims := value.(claim.Claims)
		if claims.Profile != common.PYDIO_PROFILE_ADMIN {
			return subjects, errors2.Forbidden("resources", "Only admin profiles can list resources with ANY or NONE filter")
		}
		return subjects, nil

	case rest.ResourcePolicyQuery_CONTEXT:

		subjects = append(subjects, "*")
		if value := ctx.Value(claim.ContextKey); value != nil {
			claims := value.(claim.Claims)
			subjects = append(subjects, "user:"+claims.Name)
			// Add all profiles up to the current one (e.g admin will check for anon, shared, standard, admin)
			for _, p := range common.PydioUserProfiles {
				subjects = append(subjects, "profile:"+p)
				if p == claims.Profile {
					break
				}
			}
			//subjects = append(subjects, "profile:"+claims.Profile)
			for _, r := range strings.Split(claims.Roles, ",") {
				subjects = append(subjects, "role:"+r)
			}
		} else {
			log.Logger(ctx).Error("Cannot find claims in context", zap.Any("c", ctx))
			subjects = append(subjects, "profile:anon")
		}

	case rest.ResourcePolicyQuery_USER:

		if q.UserId == "" {
			return subjects, errors2.BadRequest("resources", "Please provide a non-empty user id")
		}
		var value interface{}
		if value = ctx.Value(claim.ContextKey); value == nil {
			return subjects, errors2.BadRequest("resources", "Only admin profiles can list resources of other users")
		}
		claims := value.(claim.Claims)
		if claims.Profile != common.PYDIO_PROFILE_ADMIN {
			return subjects, errors2.Forbidden("resources", "Only admin profiles can list resources of other users")
		}
		subjects = append(subjects, "*")
		subQ, _ := ptypes.MarshalAny(&idm.UserSingleQuery{
			Uuid: q.UserId,
		})
		uClient := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
		if stream, e := uClient.SearchUser(ctx, &idm.SearchUserRequest{
			Query: &service.Query{SubQueries: []*any.Any{subQ}},
		}); e == nil {
			var user *idm.User
			for {
				resp, err := stream.Recv()
				if err != nil {
					break
				}
				if resp == nil {
					continue
				}
				user = resp.User
				break
			}
			if user == nil {
				return subjects, errors2.BadRequest("resources", "Cannot find user with id "+q.UserId)
			}
			for _, role := range user.Roles {
				subjects = append(subjects, "role:"+role.Uuid)
			}
			subjects = append(subjects, "user:"+user.Login)
			subjects = append(subjects, "profile:"+user.Attributes["profile"])
		} else {
			err = e
		}
	}
	return
}

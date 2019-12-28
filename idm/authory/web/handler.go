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

package web

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/pborman/uuid"
	"go.uber.org/zap"

	"github.com/coreos/dex/connector"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/hydra"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	serviceproto "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils/permissions"
)

func logger(inner http.Handler, name string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		start := time.Now()

		inner.ServeHTTP(w, r)

		log.Logger(r.Context()).Debug(
			fmt.Sprintf("%s %s %s %s",
				r.Method,
				r.RequestURI,
				name,
				time.Since(start),
			))
	})
}

func login(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	var u struct {
		Login    string
		Password string
	}

	err := json.NewDecoder(r.Body).Decode(&u)
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}

	c := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
	resp, err := c.BindUser(ctx, &idm.BindUserRequest{UserName: u.Login, Password: u.Password})

	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}

	js, err := json.Marshal(resp.GetUser())
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(js)
}

func loginCallback(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	fmt.Println(r.Header)
	format := r.Header.Get("Accept")
	challenge := q.Get("login_challenge")

	if format == "application/json" {
		loginCallbackJSON(w, r, challenge)
	}

	http.Redirect(w, r, "/login?login_challenge="+challenge, http.StatusFound)
}

func loginCallbackJSON(w http.ResponseWriter, r *http.Request, challenge string) {
	resp, err := hydra.GetLogin(challenge)
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}

	js, err := json.Marshal(resp)
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(js)
	return
}

func consentCallback(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	format := r.Header.Get("Accept")
	challenge := q.Get("consent_challenge")

	if format == "application/json" {
		consentCallbackJSON(w, r, challenge)
	}

	// Consent is automatically accepted
	resp, err := hydra.GetConsent(challenge)
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}

	accept, err := hydra.AcceptConsent(challenge, struct {
		GrantScope               []string                     `json:"grant_scope"`
		GrantAccessTokenAudience []string                     `json:"grant_access_token_audience"`
		Session                  map[string]map[string]string `json:"session"`
	}{
		resp.RequestedScope,
		resp.RequestedAccessTokenAudience,
		map[string]map[string]string{
			"access_token": map[string]string{
				"name":  "admin",
				"email": "admin",
			},
		},
	})

	fmt.Println(accept, err)

	http.Redirect(w, r, accept.RedirectTo, http.StatusFound)
}

func consentCallbackJSON(w http.ResponseWriter, r *http.Request, challenge string) {
	resp, err := hydra.GetConsent(challenge)
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}

	js, err := json.Marshal(resp)
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(js)
	return
}

func loginConnector(w http.ResponseWriter, r *http.Request) {
	url := r.URL.Path
	vars := mux.Vars(r)

	connectorID := vars["connector"]
	conn := connectors[connectorID]

	loginChallenge := r.URL.Query().Get("challenge")

	switch c := conn.(type) {
	case connector.CallbackConnector:
		callbackURL, err := c.LoginURL(connector.Scopes{}, "https://mypydio.localhost:8091"+url+"/callback", loginChallenge)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		http.Redirect(w, r, callbackURL, http.StatusFound)
	}
}

func loginConnectorCallback(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	connectorID := vars["connector"]
	conn := connectors[connectorID]

	challenge := r.URL.Query().Get("state")

	var identity connector.Identity

	switch c := conn.(type) {
	case connector.CallbackConnector:
		if v, err := c.HandleCallback(connector.Scopes{}, r); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		} else {
			identity = v
		}
	}

	user, _ := permissions.SearchUniqueUser(r.Context(), identity.Email, "")
	if user == nil {
		if u, err := createNewUser(identity, connectorID); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		} else {
			user = u
		}
	}

	resp, err := hydra.AcceptLogin(challenge, struct {
		Subject string
	}{
		user.Uuid,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, resp.RedirectTo, http.StatusFound)
}

func callback(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	format := r.Header.Get("Accept")

	if format == "application/json" {
		code := q.Get("code")
		scope := q.Get("scope")
		state := q.Get("state")

		js, err := json.Marshal(struct {
			Code  string `json:"code"`
			Scope string `json:"scope"`
			State string `json:"state"`
		}{
			code,
			scope,
			state,
		})

		if err != nil {
			http.Error(w, err.Error(), http.StatusServiceUnavailable)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(js)
		return
	}

	http.Redirect(w, r, "/login/callback?"+q.Encode(), http.StatusFound)
}

func logout(w http.ResponseWriter, r *http.Request) {
	js, err := json.Marshal(struct {
		Redirect string `json:"redirect"`
	}{
		"/logout",
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(js)
}

func createNewUser(identity connector.Identity, group string) (*idm.User, error) {

	login := identity.Email

	attributes := map[string]string{
		idm.UserAttrProfile: common.PYDIO_PROFILE_STANDARD,
		idm.UserAttrEmail:   identity.Email,
	}

	// Mapping Group
	// sub, err := c.DecodeSubject()
	// if err != nil {
	// 	return nil, err
	// }

	// TODO - retrieve profile in id token - Mapping admin profile
	// if c.Profile == "admin" {
	// 	attributes[idm.UserAttrProfile] = common.PYDIO_PROFILE_ADMIN
	// }

	// Mapping Display Name
	// if c.DisplayName != "" {
	// 	attributes[idm.UserAttrDisplayName] = identity.Usernamec.DisplayName
	// } else if c.Name != "" {
	// 	attributes[idm.UserAttrDisplayName] = c.Name
	// }

	attributes[idm.UserAttrDisplayName] = identity.Username

	// This means that we didn't find the user, so let's create one
	user := &idm.User{
		Login:     login,
		GroupPath: group,
		Policies: []*serviceproto.ResourcePolicy{
			{Subject: "profile:standard", Action: serviceproto.ResourcePolicyAction_READ, Effect: serviceproto.ResourcePolicy_allow},
			{Subject: "user:" + login, Action: serviceproto.ResourcePolicyAction_WRITE, Effect: serviceproto.ResourcePolicy_allow},
			{Subject: "profile:admin", Action: serviceproto.ResourcePolicyAction_WRITE, Effect: serviceproto.ResourcePolicy_allow},
		},
		Attributes: attributes,
	}

	ctx := context.Background()

	cli := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())

	labels := getConnectorsLabels()
	if label, ok := labels[group]; ok {
		// Pre-create group with label as displayName
		if _, e := permissions.SearchUniqueUser(ctx, "", "", &idm.UserSingleQuery{
			NodeType: idm.NodeType_GROUP,
			FullPath: "/" + group,
		}); e != nil {
			log.Logger(ctx).Info("Creating group with label for connector", zap.String("l", label))
			_, e := cli.CreateUser(ctx, &idm.CreateUserRequest{
				User: &idm.User{
					Uuid:       uuid.New(),
					IsGroup:    true,
					GroupPath:  "/" + group,
					GroupLabel: group,
					Attributes: map[string]string{"displayName": label},
				},
			})
			if e != nil {
				log.Logger(ctx).Error("Cannot create group with label for connector", zap.Error(e))
			}
		}
	}

	log.Logger(ctx).Info("Creating the following user automatically", user.Zap())

	response, err := cli.CreateUser(ctx, &idm.CreateUserRequest{
		User: user,
	})
	if err != nil {
		return nil, err
	}

	var newRole = &idm.Role{
		Uuid:     response.User.Uuid,
		UserRole: true,
		Label:    "User " + response.User.Login,
		Policies: user.Policies,
	}

	roleCli := idm.NewRoleServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, defaults.NewClient())

	if _, err := roleCli.CreateRole(ctx, &idm.CreateRoleRequest{Role: newRole}); err != nil {
		return nil, err
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

	return user, nil
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

package modifiers

import (
	"fmt"

	"github.com/coreos/dex/storage"
	"github.com/coreos/dex/storage/sql"
	"github.com/emicklei/go-restful"
	"github.com/google/uuid"
	"github.com/gorilla/sessions"
	"github.com/sirupsen/logrus"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service/frontend"
)

func InitAuthRequest(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {

	return func(req *restful.Request, rsp *restful.Response, in *rest.FrontSessionRequest, out *rest.FrontSessionResponse, session *sessions.Session) error {

		if a, ok := in.AuthInfo["type"]; !ok || a != "create_auth_request" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}

		if requestID, ok := in.AuthInfo["requestID"]; ok {

			conf := make(config.Map)
			config.Get("services", "pydio.grpc.auth").Scan(&conf)

			_, dsn := conf.Database("dsn")

			sqlConfig := new(sql.MySQL)
			sqlConfig.DSN = dsn

			s, _ := sqlConfig.Open(logrus.New())

			nonce := uuid.New().String()

			s.UpdateAuthRequest(requestID, func(a storage.AuthRequest) (storage.AuthRequest, error) {
				a.Nonce = nonce
				return a, nil
			})

			session.Values["requestID"] = requestID
			session.Values["nonce"] = nonce
		}

		return middleware(req, rsp, in, out, session)
	}
}

func ValidateAuthRequest(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {

	return func(req *restful.Request, rsp *restful.Response, in *rest.FrontSessionRequest, out *rest.FrontSessionResponse, session *sessions.Session) error {

		if a, ok := in.AuthInfo["type"]; !ok || a != "credentials" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}

		requestID, ok := session.Values["requestID"]
		if !ok {
			fmt.Println("No request ID")
			return middleware(req, rsp, in, out, session)
		}

		if _, ok := session.Values["jwt"]; !ok {
			// TODO - check we are actually logged in
			fmt.Println("No jwt")
			return middleware(req, rsp, in, out, session)
		}

		claims := storage.Claims{
			UserID:        "admin",
			Username:      "Test",
			Email:         "Test",
			EmailVerified: true,
		}

		conf := make(config.Map)
		config.Get("services", "pydio.grpc.auth").Scan(&conf)

		_, dsn := conf.Database("dsn")

		sqlConfig := new(sql.MySQL)
		sqlConfig.DSN = dsn

		s, _ := sqlConfig.Open(logrus.New())

		fmt.Println("Updating request id to show user is logged in")

		updater := func(a storage.AuthRequest) (storage.AuthRequest, error) {
			a.LoggedIn = true
			a.Claims = claims
			a.ConnectorID = "pydio"
			return a, nil
		}

		s.UpdateAuthRequest(requestID.(string), updater)

		return middleware(req, rsp, in, out, session)
	}
}

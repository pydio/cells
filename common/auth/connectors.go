/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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
	"fmt"
	"net/http"

	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/configx"
)

type ConnectorScanner func(context.Context, configx.Scanner) ([]ConnectorConfig, error)

type ConnectorConfig interface {
	ID() string
	Name() string
	Type() string
	Conn() Connector
}

type Connector interface{}

type OpenerFunc func(proto.Message) (Opener, error)

type Opener interface {
	Open(string, log.ZapLogger) (Connector, error)
}

var (
	connectorTypes                    = make(map[string]OpenerFunc)
	connectorScanner ConnectorScanner = DefaultConnectorScanner
)

// RegisterConnectorType registers how to set an opener for a connector type
func RegisterConnectorType(connType string, openerFunc OpenerFunc) {
	connectorTypes[connType] = openerFunc
}

// SetConnectorScanner replaces internal connectorScanner
func SetConnectorScanner(scanner ConnectorScanner) {
	connectorScanner = scanner
}

// ScanConnectors uses the internal connectorScanner to read configurations
func ScanConnectors(ctx context.Context, values configx.Values) ([]ConnectorConfig, error) {
	return connectorScanner(ctx, values)
}

// OpenConnector finds the correct opener
func OpenConnector(id, name, connectorType string, data proto.Message) (ConnectorConfig, error) {
	openerFunc, ok := connectorTypes[connectorType]
	if !ok {
		return nil, fmt.Errorf("could not retrieve opener func")
	}

	opener, err := openerFunc(data)
	if err != nil {
		return nil, err
	}

	c, err := opener.Open(id, nil)
	if err != nil {
		return nil, err
	}

	return &conn{
		id:            id,
		name:          name,
		connectorType: connectorType,
		conn:          c,
	}, nil
}

type conn struct {
	id            string
	name          string
	connectorType string
	conn          Connector
}

func (c *conn) ID() string {
	return c.id
}

func (c *conn) Name() string {
	return c.name
}

func (c *conn) Type() string {
	return c.connectorType
}

func (c *conn) Conn() Connector {
	return c.conn
}

// Scopes represents additional data requested by the clients about the end user.
type Scopes struct {
	// The client has requested a refresh token from the server.
	OfflineAccess bool

	// The client has requested group information about the end user.
	Groups bool
}

// Identity represents the ID Token claims supported by the server.
type Identity struct {
	UserID        string
	Username      string
	Email         string
	EmailVerified bool
	Claims        map[string]interface{}

	Groups []string

	// ConnectorData holds data used by the connector for subsequent requests after initial
	// authentication, such as access tokens for upstream provides.
	//
	// This data is never shared with end users, OAuth clients, or through the API.
	ConnectorData []byte
}

// PasswordConnector is an interface implemented by connectors which take a
// username and password.
// Prompt() is used to inform the handler what to display in the password
// template. If this returns an empty string, it'll default to "Username".
type PasswordConnector interface {
	Prompt() string
	Login(ctx context.Context, s Scopes, username, password string) (identity Identity, validPassword bool, err error)
}

// CallbackConnector is an interface implemented by connectors which use an OAuth
// style redirect flow to determine user information.
type CallbackConnector interface {
	// The initial URL to redirect the user to.
	//
	// OAuth2 implementations should request different scopes from the upstream
	// identity provider based on the scopes requested by the downstream client.
	// For example, if the downstream client requests a refresh token from the
	// server, the connector should also request a token from the provider.
	//
	// Many identity providers have arbitrary restrictions on refresh tokens. For
	// example Google only allows a single refresh token per client/user/scopes
	// combination, and wont return a refresh token even if offline access is
	// requested if one has already been issues. There's no good general answer
	// for these kind of restrictions, and may require this package to become more
	// aware of the global set of user/connector interactions.
	LoginURL(s Scopes, callbackURL, state string) (string, error)

	// Handle the callback to the server and return an identity.
	HandleCallback(s Scopes, r *http.Request) (identity Identity, err error)
}

// SAMLConnector represents SAML connectors which implement the HTTP POST binding.
//
//	RelayState is handled by the server.
//
// See: https://docs.oasis-open.org/security/saml/v2.0/saml-bindings-2.0-os.pdf
// "3.5 HTTP POST Binding"
type SAMLConnector interface {
	// POSTData returns an encoded SAML request and SSO URL for the server to
	// render a POST form with.
	//
	// POSTData should encode the provided request ID in the returned serialized
	// SAML request.
	POSTData(s Scopes, requestID string) (ssoURL, samlRequest string, err error)

	// HandlePOST decodes, verifies, and maps attributes from the SAML response.
	// It passes the expected value of the "InResponseTo" response field, which
	// the connector must ensure matches the response value.
	//
	// See: https://www.oasis-open.org/committees/download.php/35711/sstc-saml-core-errata-2.0-wd-06-diff.pdf
	// "3.2.2 Complex Type StatusResponseType"
	HandlePOST(s Scopes, samlResponse, inResponseTo string) (identity Identity, err error)
}

// RefreshConnector is a connector that can update the client claims.
type RefreshConnector interface {
	// Refresh is called when a client attempts to claim a refresh token. The
	// connector should attempt to update the identity object to reflect any
	// changes since the token was last refreshed.
	Refresh(ctx context.Context, s Scopes, identity Identity) (Identity, error)
}

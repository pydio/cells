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

// Package claim wraps the JWT claims with util functions
package claim

import (
	"encoding/base64"
	"strings"
	"time"

	"github.com/golang/protobuf/proto"
)

const (
	ContextKey contextKey = "pydio-claims"
)

type contextKey string

type Claims struct {
	ClientApp      interface{} `json:"aud" mapstructure:"aud"`
	Issuer         string      `json:"iss" mapstructure:"iss"`
	SessionID      string      `json:"sid" mapstructure:"sid"`
	Subject        string      `json:"sub" mapstructure:"sub"`
	Nonce          string      `json:"nonce" mapstructure:"nonce"`
	Name           string      `json:"name" mapstructure:"name"`
	Email          string      `json:"email" mapstructure:"email"`
	Profile        string      `json:"profile" mapstructure:"profile"`
	Verified       bool        `json:"email_verified" mapstructure:"email_verified"`
	Roles          string      `json:"roles" mapstructure:"roles"`
	Expiry         time.Time   `json:"expiry" mapstructure:"expiry"`
	AuthSource     string      `json:"authSource" mapstructure:"authSource"`
	DisplayName    string      `json:"displayName" mapstructure:"displayName"`
	GroupPath      string      `json:"groupPath" mapstructure:"groupPath"`
	ProvidesScopes bool        `json:"providesScopes" mapstructure:"providesScopes"`
	Scopes         []string    `json:"scopes" mapstructure:"scopes"`
}

// DecodeSubject decodes subject field of the claims
func (c *Claims) DecodeSubject() (*IDTokenSubject, error) {
	sub := c.Subject
	data, err := base64.RawURLEncoding.DecodeString(sub)
	if err != nil {
		return nil, err
	}

	var subject IDTokenSubject
	if err := proto.Unmarshal(data, &subject); err != nil {
		return nil, err
	} else {
		return &subject, nil
	}
}

func (c *Claims) GetClientApp() string {
	switch v := c.ClientApp.(type) {
	case string:
		return v
	case []string:
		return strings.Join(v, ",")
	default:
		return "unknown client app"
	}
}

// IDTokenSubject is the representation of the format of subject we are using
type IDTokenSubject struct {
	// UserId specific to cells
	UserId string `protobuf:"bytes,1,opt,name=user_id,json=userId" json:"user_id,omitempty"`
	// ConnId defines the connector chosen to login
	ConnId string `protobuf:"bytes,2,opt,name=conn_id,json=connId" json:"conn_id,omitempty"`
}

// Reset the value to empty
func (s *IDTokenSubject) Reset() { *s = IDTokenSubject{} }

// String representation
func (s *IDTokenSubject) String() string { return proto.CompactTextString(s) }

// ProtoMessage is used by the proto.Message interface
func (*IDTokenSubject) ProtoMessage() {}

// Encode the content of the ID Token Subject
func (s *IDTokenSubject) Encode() ([]byte, error) {

	data, err := proto.Marshal(s)
	if err != nil {
		return nil, err
	}

	buf := make([]byte, base64.RawURLEncoding.EncodedLen(len(data)))
	base64.RawURLEncoding.Encode(buf, data)

	return buf, nil
}

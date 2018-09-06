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

// Package claim wraps the JWT claims with util functions
package claim

import (
	"encoding/base64"
	"time"

	"github.com/coreos/go-oidc/jose"
	"github.com/golang/protobuf/proto"
)

const (
	ContextKey         = "pydio-claims"
	MetadataContextKey = "x-pydio-claims"
)

type IDTokenSubject struct {
	UserId string `protobuf:"bytes,1,opt,name=user_id,json=userId" json:"user_id,omitempty"`
	ConnId string `protobuf:"bytes,2,opt,name=conn_id,json=connId" json:"conn_id,omitempty"`
}

func (m *IDTokenSubject) Reset()         { *m = IDTokenSubject{} }
func (m *IDTokenSubject) String() string { return proto.CompactTextString(m) }
func (*IDTokenSubject) ProtoMessage()    {}

type Claims struct {
	ClientApp   string    `json:"aud"`
	Issuer      string    `json:"iss"`
	Subject     string    `json:"sub"`
	Nonce       string    `json:"nonce"`
	Name        string    `json:"name"`
	Email       string    `json:"email"`
	Profile     string    `json:"profile"`
	Verified    bool      `json:"email_verified"`
	Roles       string    `json:"roles"`
	Expiry      time.Time `json:"expiry"`
	AuthSource  string    `json:"authSource"`
	DisplayName string    `json:"displayName"`
	GroupPath   string    `json:"groupPath"`
}

// Decode Subject field of the claims
func (c *Claims) DecodeUserUuid() (string, error) {
	sub := c.Subject
	data, err := base64.RawURLEncoding.DecodeString(sub)
	if err != nil {
		return "", err
	}

	var subject IDTokenSubject
	if err := proto.Unmarshal(data, &subject); err != nil {
		return "", err
	} else {
		return subject.UserId, nil
	}
}

// UserNameFromIDToken parses an IDToken and extract the "name" field from the claims
func UserNameFromIDToken(token string) string {

	jwt, e := jose.ParseJWT(token)
	if e != nil {
		return ""
	}
	claims, e := jwt.Claims()
	if e != nil {
		return ""
	}
	if v, ok := claims["name"]; ok {
		return v.(string)
	}
	return ""

}

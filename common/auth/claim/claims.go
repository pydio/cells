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
	"context"
	"crypto/md5"
	"encoding/hex"
	"io"
	"strings"
	"time"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/utils/propagator"
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
	Public         bool        `json:"public" mapstructure:"public"`
	Roles          string      `json:"roles" mapstructure:"roles"`
	Expiry         time.Time   `json:"expiry" mapstructure:"expiry"`
	AuthSource     string      `json:"authSource" mapstructure:"authSource"`
	DisplayName    string      `json:"displayName" mapstructure:"displayName"`
	GroupPath      string      `json:"groupPath" mapstructure:"groupPath"`
	ProvidesScopes bool        `json:"providesScopes" mapstructure:"providesScopes"`
	Scopes         []string    `json:"scopes" mapstructure:"scopes"`

	secretPair string
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

// GetUniqueKey returns a key that is unique to a given claim value
func (c *Claims) GetUniqueKey() string {
	hash := md5.New()
	io.WriteString(hash, c.SessionID)
	io.WriteString(hash, c.Subject)

	if c.ProvidesScopes {
		for _, scope := range c.Scopes {
			io.WriteString(hash, scope)
		}
	}

	return hex.EncodeToString(hash.Sum(nil)[:])

}

func (c *Claims) AttachSecretPair(sp string) {
	c.secretPair = sp
}

func (c *Claims) GetSecretPair() string {
	return c.secretPair
}

// FromContext retrieves claims from context
func FromContext(ctx context.Context) (Claims, bool) {
	val := ctx.Value(ContextKey)
	if val == nil {
		return Claims{}, false
	}
	cl, ok := val.(Claims)
	if !ok {
		return Claims{}, false
	}
	return cl, true
}

// UserNameFromContext looks up for various keys to find username and **optionally** claims
func UserNameFromContext(ctx context.Context) string {

	var userName string
	if claims, ok := FromContext(ctx); ok {
		userName = claims.Name
	} else if ctx.Value(common.PydioContextUserKey) != nil {
		userName = ctx.Value(common.PydioContextUserKey).(string)
	} else if ctx.Value(strings.ToLower(common.PydioContextUserKey)) != nil {
		userName = ctx.Value(strings.ToLower(common.PydioContextUserKey)).(string)
	} else if meta, ok1 := propagator.FromContextRead(ctx); ok1 {
		if value, exists := meta[common.PydioContextUserKey]; exists {
			userName = value
		} else if value2, exists2 := meta[strings.ToLower(common.PydioContextUserKey)]; exists2 {
			userName = value2
		}
	}
	return userName
}

// ToContext feeds context with correct Keys and Metadata for a given Claims
func ToContext(ctx context.Context, claims Claims) context.Context {
	// Set context keys
	ctx = context.WithValue(ctx, ContextKey, claims)
	ctx = context.WithValue(ctx, common.PydioContextUserKey, claims.Name)

	// Set context Metadata
	md := make(map[string]string)
	if existing, ok := propagator.FromContextRead(ctx); ok {
		for k, v := range existing {
			// Ignore existing version of PydioContextUserKey, it will be replaced after
			if k == strings.ToLower(common.PydioContextUserKey) {
				continue
			}
			md[k] = v
		}
	}
	md[common.PydioContextUserKey] = claims.Name
	return propagator.NewContext(ctx, md)
}

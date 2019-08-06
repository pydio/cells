/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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

package permissions

import (
	"context"
	"fmt"
	"path"
	"strings"

	"github.com/micro/go-micro/metadata"

	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/context"
)

const (
	PolicyNodeMetaName      = "NodeMetaName"
	PolicyNodeMetaPath      = "NodeMetaPath"
	PolicyNodeMetaExtension = "NodeMetaExtension"
	PolicyNodeMetaSize      = "NodeMetaSize"
	PolicyNodeMetaMTime     = "NodeMetaMTime"
	// Todo - Problem, usermeta are not loaded at this point
	PolicyNodeMeta_ = "NodeMeta:"
)

// PolicyRequestSubjectsFromUser builds an array of string subjects from the passed User.
func PolicyRequestSubjectsFromUser(user *idm.User) []string {
	subjects := []string{
		fmt.Sprintf("user:%s", user.Login),
	}
	if prof, ok := user.Attributes["profile"]; ok {
		subjects = append(subjects, fmt.Sprintf("profile:%s", prof))
	} else {
		subjects = append(subjects, "profile:standard")
	}
	for _, r := range user.Roles {
		subjects = append(subjects, fmt.Sprintf("role:%s", r.Uuid))
	}
	return subjects
}

// PolicyRequestSubjectsFromClaims builds an array of string subjects from the passed Claims.
func PolicyRequestSubjectsFromClaims(claims claim.Claims) []string {
	subjects := []string{
		fmt.Sprintf("user:%s", claims.Name),
	}
	if claims.Profile != "" {
		subjects = append(subjects, fmt.Sprintf("profile:%s", claims.Profile))
	} else {
		subjects = append(subjects, "profile:standard")
	}
	for _, r := range strings.Split(claims.Roles, ",") {
		subjects = append(subjects, fmt.Sprintf("role:%s", r))
	}
	return subjects
}

// PolicyContextFromMetadata extracts metadata directly from the context and enriches the passed policyContext.
func PolicyContextFromMetadata(policyContext map[string]string, ctx context.Context) {
	if ctxMeta, has := metadata.FromContext(ctx); has {
		for _, key := range []string{
			servicecontext.HttpMetaRemoteAddress,
			servicecontext.HttpMetaUserAgent,
			servicecontext.HttpMetaContentType,
			servicecontext.HttpMetaProtocol,
			servicecontext.ClientTime,
			servicecontext.ServerTime,
		} {
			if val, hasKey := ctxMeta[key]; hasKey {
				policyContext[key] = val
				// log.Logger(ctx).Error("Set key: "+key, zap.Any("value", val))
			}
		}
	}
}

// PolicyContextFromNode extracts metadata from the Node and enriches the passed policyContext.
func PolicyContextFromNode(policyContext map[string]string, node *tree.Node) {
	policyContext[PolicyNodeMetaName] = node.GetStringMeta("name")
	policyContext[PolicyNodeMetaPath] = node.Path
	policyContext[PolicyNodeMetaMTime] = string(node.MTime)
	policyContext[PolicyNodeMetaSize] = string(node.Size)
	if node.IsLeaf() {
		policyContext[PolicyNodeMetaExtension] = strings.TrimLeft(path.Ext(node.Path), ".")
	}
}

/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package jobs

import (
	"context"

	grpc2 "google.golang.org/grpc"

	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/tree"
)

type FreeStringEvaluator func(ctx context.Context, query string, node *tree.Node) bool

type ConnexionResolver func(ctx context.Context, serviceName string) grpc2.ClientConnInterface

type ClientUniqueWorkspace func(ctx context.Context, wsUuid string, wsSlug string, queries ...*idm.WorkspaceSingleQuery) (*idm.Workspace, error)

type ClientUniqueUser func(ctx context.Context, login string, uuid string, queries ...*idm.UserSingleQuery) (user *idm.User, err error)

type ClaimsUsernameParser func(ctx context.Context) (string, claim.Claims)

var (
	freeStringEvaluator   FreeStringEvaluator
	connexionResolver     ConnexionResolver
	clientUniqueWorkspace ClientUniqueWorkspace
	clientUniqueUser      ClientUniqueUser
	claimsUsernameParser  ClaimsUsernameParser
)

func RegisterNodesFreeStringEvaluator(f FreeStringEvaluator) {
	freeStringEvaluator = f
}

func RegisterConnexionResolver(f ConnexionResolver) {
	connexionResolver = f
}

func RegisterClientUniqueWorkspace(f ClientUniqueWorkspace) {
	clientUniqueWorkspace = f
}

func RegisterClientUniqueUser(f ClientUniqueUser) {
	clientUniqueUser = f
}

func RegisterClaimsUsernameParser(f ClaimsUsernameParser) {
	claimsUsernameParser = f
}

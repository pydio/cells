/*
 * Copyright (c) 2019-2023. Abstrium SAS <team (at) pydio.com>
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

package resources

import (
	"context"
	"fmt"

	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/service"
)

func ModifyLogin(ctx context.Context, dao DAO, req *service.ModifyLoginRequest) (*service.ModifyLoginResponse, error) {
	var mm []string

	if req.GetDryRun() {

		// Check Policies
		if pp, e := dao.GetPoliciesForSubject(ctx, permissions.PolicySubjectLoginPrefix+req.OldLogin); e != nil {
			return nil, e
		} else {
			mm = append(mm, fmt.Sprintf("Found %d policy(ies) for login %s", len(pp), req.OldLogin))
			for _, p := range pp {
				mm = append(mm, " - Policy: "+p.Resource+"-"+p.Action.String()+"-"+p.JsonConditions)
			}
		}

	} else {

		// Apply Policies
		if count, e := dao.ReplacePoliciesSubject(ctx, permissions.PolicySubjectLoginPrefix+req.OldLogin, permissions.PolicySubjectLoginPrefix+req.NewLogin); e != nil {
			return nil, e
		} else {
			mm = append(mm, fmt.Sprintf("Replace %d policies in table", count))
		}

	}

	return &service.ModifyLoginResponse{Messages: mm, Success: true}, nil

}

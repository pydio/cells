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

package rest

import (
	"fmt"
	"testing"

	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common/proto/idm"
	serviceproto "github.com/pydio/cells/v4/common/proto/service"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

// Simple dummy tests to play with gRPC format that is used for role queries
func TestRole(t *testing.T) {
	uuid := "MyRoleId"
	// Simply creates a deleteRoleRequest in protobuf JSON serialised format
	query, _ := anypb.New(&idm.RoleSingleQuery{Uuid: []string{uuid}})
	r := idm.DeleteRoleRequest{Query: &serviceproto.Query{SubQueries: []*anypb.Any{query}}}
	r1, err := json.Marshal(r)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("Marshalled string: " + string(r1))

	// Same using json serialised object as starting point
	initialStr := `{"Uuid": ["MyRoleId"]}`
	var q idm.RoleSingleQuery
	err = json.Unmarshal([]byte(initialStr), &q)
	query2, _ := anypb.New(&q)
	rr := idm.DeleteRoleRequest{Query: &serviceproto.Query{SubQueries: []*anypb.Any{query2}}}
	r2, err := json.Marshal(rr)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("Marshalled string: " + string(r2))
}

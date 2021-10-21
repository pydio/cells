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

package jobs

import (
	"time"

	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/tree"
)

func (a *ActionMessage) AppendOutput(output *ActionOutput) {

	if a.OutputChain == nil {
		a.OutputChain = []*ActionOutput{}
	}
	if output.Time == 0 {
		output.Time = int32(time.Now().Unix())
	}

	a.OutputChain = append(a.OutputChain, output)

}

func (a *ActionMessage) GetLastOutput() *ActionOutput {

	if a.OutputChain == nil {
		return nil
	}

	return a.OutputChain[len(a.OutputChain)-1]

}

func (a *ActionMessage) GetOutputs() []*ActionOutput {

	if a.OutputChain == nil {
		a.OutputChain = []*ActionOutput{}
	}

	return a.OutputChain

}

func (a *ActionMessage) WithNode(n *tree.Node) ActionMessage {

	b := *a
	if n == nil {
		b.Nodes = []*tree.Node{}
	} else {
		b.Nodes = []*tree.Node{n}
	}
	return b

}

func (a *ActionMessage) WithNodes(nodes ...*tree.Node) ActionMessage {

	b := *a
	b.Nodes = append(b.Nodes, nodes...)
	return b

}

func (a *ActionMessage) WithUser(u *idm.User) ActionMessage {

	b := *a
	if u == nil {
		b.Users = []*idm.User{}
	} else {
		b.Users = []*idm.User{u}
	}
	return b

}

func (a *ActionMessage) WithUsers(users ...*idm.User) ActionMessage {

	b := *a
	for _, u := range users {
		b.Users = append(b.Users, u)
	}
	return b

}

func (a *ActionMessage) WithWorkspace(ws *idm.Workspace) ActionMessage {

	b := *a
	if ws == nil {
		b.Workspaces = []*idm.Workspace{}
	} else {
		b.Workspaces = []*idm.Workspace{ws}
	}
	return b

}

func (a *ActionMessage) WithWorkspaces(ws ...*idm.Workspace) ActionMessage {

	b := *a
	b.Workspaces = append(b.Workspaces, ws...)
	return b

}

func (a *ActionMessage) WithRole(r *idm.Role) ActionMessage {

	b := *a
	if r == nil {
		b.Roles = []*idm.Role{}
	} else {
		b.Roles = []*idm.Role{r}
	}
	return b

}

func (a *ActionMessage) WithRoles(r ...*idm.Role) ActionMessage {

	b := *a
	b.Roles = append(b.Roles, r...)
	return b

}

func (a *ActionMessage) WithAcl(acl *idm.ACL) ActionMessage {

	b := *a
	if acl == nil {
		b.Acls = []*idm.ACL{}
	} else {
		b.Acls = []*idm.ACL{acl}
	}
	return b

}

func (a *ActionMessage) WithAcls(aa ...*idm.ACL) ActionMessage {

	b := *a
	b.Acls = append(b.Acls, aa...)
	return b

}

func (a *ActionMessage) WithDataSource(ds *object.DataSource) ActionMessage {

	b := *a
	if ds == nil {
		b.DataSources = []*object.DataSource{}
	} else {
		b.DataSources = []*object.DataSource{ds}
	}
	return b

}

func (a *ActionMessage) WithDataSources(ds ...*object.DataSource) ActionMessage {

	b := *a
	b.DataSources = append(b.DataSources, ds...)
	return b

}

func (a *ActionMessage) WithError(e error) ActionMessage {

	b := *a
	b.AppendOutput(&ActionOutput{
		Success:     false,
		ErrorString: e.Error(),
	})
	return b

}

func (a *ActionMessage) WithIgnore() ActionMessage {

	b := *a
	b.AppendOutput(&ActionOutput{
		Ignored: true,
	})
	return b

}

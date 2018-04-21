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

package jobs

import (
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
)

func (a *ActionMessage) AppendOutput(output *ActionOutput) {

	if a.OutputChain == nil {
		a.OutputChain = []*ActionOutput{}
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
	b.Nodes = []*tree.Node{}
	for _, n := range nodes {
		b.Nodes = append(b.Nodes, n)
	}
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
	b.Users = []*idm.User{}
	for _, u := range users {
		b.Users = append(b.Users, u)
	}
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

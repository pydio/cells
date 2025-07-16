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
	"slices"
	"time"

	"go.uber.org/zap/zapcore"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/object"
	"github.com/pydio/cells/v5/common/proto/tree"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

func (a *ActionMessage) Clone() *ActionMessage {
	return proto.Clone(a).(*ActionMessage)
}

func (a *ActionMessage) AppendOutput(output *ActionOutput) {

	if a.OutputChain == nil {
		a.OutputChain = []*ActionOutput{}
	}
	if output.Time == 0 {
		output.Time = int32(time.Now().Unix())
	}

	a.OutputChain = append(a.OutputChain, output)

}

func (a *ActionMessage) WithOutput(output *ActionOutput) *ActionMessage {
	c := a.Clone()
	c.AppendOutput(output)
	return c
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

func (a *ActionMessage) StackedVars(expected ...string) map[string]interface{} {
	vv := make(map[string]interface{})
	for _, o := range a.OutputChain {
		o.FillVars(vv, expected...)
	}
	return vv
}

func (a *ActionMessage) StackedVarsKeys() (keys []string) {
	for _, o := range a.OutputChain {
		if o.Vars == nil {
			continue
		}
		for k := range o.Vars {
			if !slices.Contains(keys, k) {
				keys = append(keys, k)
			}
		}
	}
	return
}

func (a *ActionMessage) ScanVar(name string, output interface{}) error {
	// first find content
	l := len(a.OutputChain)
	var data string
	var found bool
	for i := l - 1; i >= 0; i-- {
		if a.OutputChain[i].Vars != nil {
			if d, o := a.OutputChain[i].Vars[name]; o {
				data = d
				found = true
				break
			}
		}
	}
	if !found {
		return errors.New("var not found")
	}
	if mess, ok := output.(proto.Message); ok {
		if er := protojson.Unmarshal([]byte(data), mess); er != nil {
			return er
		} else {
			output = mess
			return nil
		}
	} else {
		return json.Unmarshal([]byte(data), output)
	}
}

func (a *ActionMessage) WithNode(n *tree.Node) *ActionMessage {

	b := a.Clone()
	if n == nil {
		b.Nodes = []*tree.Node{}
	} else {
		b.Nodes = []*tree.Node{n}
	}
	return b

}

func (a *ActionMessage) WithNodes(nodes ...*tree.Node) *ActionMessage {

	b := a.Clone()
	b.Nodes = append(b.Nodes, nodes...)
	return b

}

func (a *ActionMessage) WithUser(u *idm.User) *ActionMessage {

	b := a.Clone()
	if u == nil {
		b.Users = []*idm.User{}
	} else {
		b.Users = []*idm.User{u}
	}
	return b

}

func (a *ActionMessage) WithUsers(users ...*idm.User) *ActionMessage {

	b := a.Clone()
	for _, u := range users {
		b.Users = append(b.Users, u)
	}
	return b

}

func (a *ActionMessage) WithWorkspace(ws *idm.Workspace) *ActionMessage {

	b := a.Clone()
	if ws == nil {
		b.Workspaces = []*idm.Workspace{}
	} else {
		b.Workspaces = []*idm.Workspace{ws}
	}
	return b

}

func (a *ActionMessage) WithWorkspaces(ws ...*idm.Workspace) *ActionMessage {

	b := a.Clone()
	b.Workspaces = append(b.Workspaces, ws...)
	return b

}

func (a *ActionMessage) WithRole(r *idm.Role) *ActionMessage {

	b := a.Clone()
	if r == nil {
		b.Roles = []*idm.Role{}
	} else {
		b.Roles = []*idm.Role{r}
	}
	return b

}

func (a *ActionMessage) WithRoles(r ...*idm.Role) *ActionMessage {

	b := a.Clone()
	b.Roles = append(b.Roles, r...)
	return b

}

func (a *ActionMessage) WithAcl(acl *idm.ACL) *ActionMessage {

	b := a.Clone()
	if acl == nil {
		b.Acls = []*idm.ACL{}
	} else {
		b.Acls = []*idm.ACL{acl}
	}
	return b

}

func (a *ActionMessage) WithAcls(aa ...*idm.ACL) *ActionMessage {

	b := a.Clone()
	b.Acls = append(b.Acls, aa...)
	return b

}

func (a *ActionMessage) WithDataSource(ds *object.DataSource) *ActionMessage {

	b := a.Clone()
	if ds == nil {
		b.DataSources = []*object.DataSource{}
	} else {
		b.DataSources = []*object.DataSource{ds}
	}
	return b

}

func (a *ActionMessage) WithDataSources(ds ...*object.DataSource) *ActionMessage {

	b := a.Clone()
	b.DataSources = append(b.DataSources, ds...)
	return b

}

func (a *ActionMessage) WithError(e error) *ActionMessage {

	b := a.Clone()
	b.AppendOutput(&ActionOutput{
		Success:     false,
		ErrorString: e.Error(),
	})
	return b

}

// AsRunError combines an input.WithError and the error itself
func (a *ActionMessage) AsRunError(e error) (*ActionMessage, error) {
	return a.WithError(e), e
}

func (a *ActionMessage) WithIgnore() *ActionMessage {

	b := a.Clone()
	b.AppendOutput(&ActionOutput{
		Ignored: true,
	})
	return b

}

// EventFromAny loads and unmarshal event from an anypb value
func (a *ActionMessage) EventFromAny() (interface{}, error) {
	if a.Event == nil {
		return nil, errors.New("event not set")
	}
	var event interface{}
	triggerEvent := &JobTriggerEvent{}
	nodeEvent := &tree.NodeChangeEvent{}
	idmEvent := &idm.ChangeEvent{}
	if e := anypb.UnmarshalTo(a.Event, triggerEvent, proto.UnmarshalOptions{}); e == nil {
		event = triggerEvent
	} else if e := anypb.UnmarshalTo(a.Event, nodeEvent, proto.UnmarshalOptions{}); e == nil {
		event = nodeEvent
	} else if e := anypb.UnmarshalTo(a.Event, idmEvent, proto.UnmarshalOptions{}); e == nil {
		event = idmEvent
	} else {
		return nil, errors.New("cannot unmarshal event to triggerEvent, nodeEvent or idmEvent")
	}
	return event, nil
}

func (a *ActionMessage) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	maxVarSize := 50 * 1024
	if ev, _ := a.EventFromAny(); ev != nil {
		if te, ok := ev.(*JobTriggerEvent); ok && te.RunParameters != nil {
			// Reduce Run Parameters
			for k, v := range te.RunParameters {
				if len(v) >= maxVarSize {
					te.RunParameters[k] = v[:maxVarSize] + "..."
				}
			}
			ev = te
		}
		_ = encoder.AddReflected("Event", ev)
	}
	vv := make(map[string]interface{})
	for _, o := range a.OutputChain {
		o.LogVarsWithLimit(vv, maxVarSize)
	}
	if len(vv) > 0 {
		_ = encoder.AddReflected("Vars", vv)
	}
	limitedSlice(encoder, "Nodes", a.Nodes, 5)
	limitedSlice(encoder, "Roles", a.Roles, 5)
	limitedSlice(encoder, "Users", a.Users, 5)
	limitedSlice(encoder, "Workspaces", a.Workspaces, 5)
	limitedSlice(encoder, "Acls", a.Acls, 5)
	limitedSlice(encoder, "Activities", a.Activities, 5)
	limitedSlice(encoder, "DataSources", a.DataSources, 5)
	if len(a.OutputChain) > 0 {
		if len(a.OutputChain) > 20 {
			encoder.AddInt("OutputChainTotal", len(a.OutputChain))
			return encoder.AddArray("OutputChain", actionOutputLogArray(a.OutputChain[:20]))
		} else {
			return encoder.AddArray("OutputChain", actionOutputLogArray(a.OutputChain))
		}
	}
	return nil
}

func limitedSlice[T any](encoder zapcore.ObjectEncoder, key string, in []T, max int) {
	initial := len(in)
	if initial == 0 {
		return
	}
	if initial > max {
		//return in[:max], initial, true, true
		_ = encoder.AddReflected(key, in[:max])
		encoder.AddInt(key+"Total", initial)
	} else {
		_ = encoder.AddReflected(key, in)
	}
}

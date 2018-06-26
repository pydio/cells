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

package utils

import (
	"context"
	"fmt"
	"strings"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"encoding/json"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
)

type PolicyResolver func(ctx context.Context, request *idm.PolicyEngineRequest) (*idm.PolicyEngineResponse, error)

type BitmaskFlag uint32

const (
	FLAG_READ BitmaskFlag = 1 << iota
	FLAG_WRITE
	FLAG_DENY
	FLAG_LIST
	FLAG_DELETE
	FLAG_POLICY
	FLAG_QUOTA
)

var (
	NamesToFlags = map[string]BitmaskFlag{
		"read":   FLAG_READ,
		"write":  FLAG_WRITE,
		"deny":   FLAG_DENY,
		"list":   FLAG_LIST,
		"delete": FLAG_DELETE,
		"policy": FLAG_POLICY,
		"quota":  FLAG_QUOTA,
	}
	FlagsToNames = map[BitmaskFlag]string{
		FLAG_READ:   "read",
		FLAG_WRITE:  "write",
		FLAG_DENY:   "deny",
		FLAG_LIST:   "list",
		FLAG_DELETE: "delete",
		FLAG_POLICY: "policy",
		FLAG_QUOTA:  "quota",
	}
	ACL_READ         = &idm.ACLAction{Name: "read", Value: "1"}
	ACL_WRITE        = &idm.ACLAction{Name: "write", Value: "1"}
	ACL_DENY         = &idm.ACLAction{Name: "deny", Value: "1"}
	ACL_POLICY       = &idm.ACLAction{Name: "policy"}
	ACL_QUOTA        = &idm.ACLAction{Name: "quota"}
	ACL_CONTENT_LOCK = &idm.ACLAction{Name: "content_lock"}
	// Not used yet
	ACL_FRONT_ACTION_    = &idm.ACLAction{Name: "action:*"}
	ACL_FRONT_PARAM_     = &idm.ACLAction{Name: "parameter:*"}
	ACL_DELETE           = &idm.ACLAction{Name: "delete", Value: "1"}
	ACL_LIST             = &idm.ACLAction{Name: "list", Value: "1"}
	ResolvePolicyRequest PolicyResolver
)

type Bitmask struct {
	BitmaskFlag
	PolicyIds  map[string]string
	ValueFlags map[BitmaskFlag]string
}

func (f Bitmask) HasFlag(ctx context.Context, flag BitmaskFlag, ctxNode ...*tree.Node) bool {

	if flag != FLAG_POLICY && flag != FLAG_DENY && f.BitmaskFlag&FLAG_POLICY != 0 && ResolvePolicyRequest != nil {
		// We should first resolve the policy, given the ctx and the node
		policyContext := make(map[string]string)
		PolicyContextFromMetadata(policyContext, ctx)
		if len(ctxNode) > 0 {
			PolicyContextFromNode(policyContext, ctxNode[0])
		}
		var subjects []string
		for k, _ := range f.PolicyIds {
			subjects = append(subjects, fmt.Sprintf("policy:%s", k))
		}
		req := &idm.PolicyEngineRequest{
			Subjects: subjects,
			Resource: "acl",
			Action:   FlagsToNames[flag],
			Context:  policyContext,
		}
		if resp, err := ResolvePolicyRequest(ctx, req); err == nil && resp.Allowed {
			log.Logger(ctx).Debug("Policy Allowed", zap.Any("req", req))
			return true
		} else {
			log.Logger(ctx).Debug("Policy Not Allowed", zap.Any("req", req))
			return false
		}
	}

	return f.BitmaskFlag&flag != 0
}

// AddFlag adds a simple flag.
func (f *Bitmask) AddFlag(flag BitmaskFlag) {
	f.BitmaskFlag |= flag
}

// AddPolicyFlag adds a policy flag and stacks policies.
func (f *Bitmask) AddPolicyFlag(policyId string) {
	f.AddFlag(FLAG_POLICY)
	if f.PolicyIds == nil {
		f.PolicyIds = make(map[string]string)
	}
	f.PolicyIds[policyId] = policyId
}

// AddValueFlag stores the value of a BitmaskFlag.
func (f *Bitmask) AddValueFlag(flag BitmaskFlag, value string) {
	f.AddFlag(flag)
	if f.ValueFlags == nil {
		f.ValueFlags = make(map[BitmaskFlag]string)
	}
	f.ValueFlags[flag] = value
}

//func (f *Bitmask) ClearFlag(flag Bitmask)   { *f &= ^flag }
//func (f *Bitmask) ToggleFlag(flag Bitmask)  { *f ^= flag }

type Right struct {
	Read  bool
	Write bool
}

func (r *Right) IsAccessible() bool {
	return r.Read || r.Write
}

func (r *Right) String() string {
	var s []string
	if r.Read {
		s = append(s, "read")
	}
	if r.Write {
		s = append(s, "write")
	}
	return strings.Join(s, ",")
}

// AccessList is a merged representation of all ACLs that a user has access to.
// ACLs are merged using a Bitmask form to ease flags detections and comparisons.
type AccessList struct {
	Workspaces         map[string]*idm.Workspace
	Acls               []*idm.ACL
	NodesAcls          map[string]Bitmask
	WorkspacesNodes    map[string]map[string]Bitmask
	OrderedRoles       []*idm.Role
	FrontPluginsValues []*idm.ACL
}

// NewAccessList creates a new AccessList.
func NewAccessList(orderedRoles []*idm.Role, Acls ...[]*idm.ACL) *AccessList {
	acl := &AccessList{
		Workspaces:   make(map[string]*idm.Workspace),
		OrderedRoles: orderedRoles,
	}
	for _, lists := range Acls {
		acl.Acls = append(acl.Acls, lists...)
	}
	return acl
}

// Append appends an additional list of ACLs.
func (a *AccessList) Append(acls []*idm.ACL) {
	a.Acls = append(a.Acls, acls...)
}

// HasPolicyBasedAcls checks if there are policy based acls.
func (a *AccessList) HasPolicyBasedAcls() bool {
	for _, acl := range a.Acls {
		if acl.Action.Name == ACL_POLICY.Name {
			return true
		}
	}
	return false
}

// Flatten performs actual flatten.
func (a *AccessList) Flatten(ctx context.Context) {
	nodes, workspaces := a.flattenNodes(ctx, a.Acls)
	a.NodesAcls = nodes
	a.WorkspacesNodes = workspaces
}

// GetWorkspacesNodes gets detected workspace root nodes that are then
// used to populate the Workspace keys.
func (a *AccessList) GetWorkspacesNodes() map[string]map[string]Bitmask {
	return a.WorkspacesNodes
}

func (a *AccessList) GetNodesBitmasks() map[string]Bitmask {
	return a.NodesAcls
}

// GetAccessibleWorkspaces retrieves a map of accessible workspaces.
func (a *AccessList) GetAccessibleWorkspaces(ctx context.Context) map[string]string {
	accessListWsNodes := a.GetWorkspacesNodes()
	results := make(map[string]string)
	for wsId, wsNodes := range accessListWsNodes {
		rights := &Right{}
		for nodeId, _ := range wsNodes {
			if a.CanRead(ctx, &tree.Node{Uuid: nodeId}) {
				rights.Read = true
			}
			if a.CanWrite(ctx, &tree.Node{Uuid: nodeId}) {
				rights.Write = true
			}
		}
		if rights.IsAccessible() {
			results[wsId] = rights.String()
		}
	}
	return results
}

// Flatten Permissions based on all the lists received :
// First go through each nodes and create Bitmask for each one, organized by roles
// Then flatten roles by keeping only last Bitmask found if node appears many times in many roles.
//
// At the same time, collect nodes that are flagged with a "WorkspaceID" in ACL to compute the list of
// accessible roots. Other permissions are used a simple folder permissions, they do not trigger a new workspace
// in the list.
func (a *AccessList) flattenNodes(ctx context.Context, aclList []*idm.ACL) (map[string]Bitmask, map[string]map[string]Bitmask) {

	flattenedNodes := make(map[string]Bitmask)
	flattenedWorkspaces := make(map[string]map[string]Bitmask)

	detectedWorkspaces := make(map[string]map[string]string)
	roles := make(map[string]map[string]Bitmask)

	// Create Bitmasks for each node, for each role
	for _, acl := range aclList {
		if acl.NodeID == "" {
			continue
		}
		var roleNodes map[string]Bitmask
		if test, ok := roles[acl.RoleID]; ok {
			roleNodes = test
		} else {
			roleNodes = make(map[string]Bitmask)
		}

		var nodeAcls Bitmask
		if test, ok := roleNodes[acl.NodeID]; ok {
			nodeAcls = test
		} else {
			nodeAcls = Bitmask{}
		}
		if flag, ok := NamesToFlags[acl.Action.Name]; ok {
			if flag == FLAG_POLICY {
				nodeAcls.AddPolicyFlag(acl.Action.Value)
			} else if flag == FLAG_QUOTA {
				nodeAcls.AddValueFlag(flag, acl.Action.Value)
			} else {
				nodeAcls.AddFlag(flag)
			}
		}

		roleNodes[acl.NodeID] = nodeAcls
		roles[acl.RoleID] = roleNodes

		if acl.WorkspaceID != "" {
			if _, ok := detectedWorkspaces[acl.WorkspaceID]; !ok {
				detectedWorkspaces[acl.WorkspaceID] = make(map[string]string)
			}
			detectedWorkspaces[acl.WorkspaceID][acl.NodeID] = acl.NodeID
		}
	}

	// Now flatten on roles : last role wins on each node
	for _, role := range a.OrderedRoles {
		if roleNodes, ok := roles[role.Uuid]; ok {
			for nodeId, bitmask := range roleNodes {
				flattenedNodes[nodeId] = bitmask
			}
		}
	}
	for workspaceId, workspaceRootNodes := range detectedWorkspaces {
		wsRoots := make(map[string]Bitmask)
		for nodeId, _ := range workspaceRootNodes {
			mask := flattenedNodes[nodeId]
			if !mask.HasFlag(ctx, FLAG_DENY) {
				wsRoots[nodeId] = mask
			}
		}
		if len(wsRoots) > 0 {
			flattenedWorkspaces[workspaceId] = wsRoots
		}
	}

	return flattenedNodes, flattenedWorkspaces
}

// FirstMaskForParents just climbs up the tree and gets the first non empty mask found.
func (a *AccessList) FirstMaskForParents(ctx context.Context, nodes ...*tree.Node) (Bitmask, *tree.Node) {
	for _, node := range nodes {
		if bitmask, ok := a.NodesAcls[node.Uuid]; ok {
			return bitmask, node
		}
	}
	return Bitmask{}, nil
}

// ParentMaskOrDeny browses access list from current node to ROOT, going through each parent.
// If there is a deny anywhere up the path, it returns that deny,
// otherwise it sends the first Bitmask found (closest parent having a Bitmask set).
func (a *AccessList) ParentMaskOrDeny(ctx context.Context, nodes ...*tree.Node) (bool, Bitmask) {
	var firstParent Bitmask
	var hasParentDeny bool
	for _, node := range nodes {
		if bitmask, ok := a.NodesAcls[node.Uuid]; ok {
			if firstParent.BitmaskFlag == BitmaskFlag(0) {
				firstParent = bitmask
			}
			if bitmask.HasFlag(ctx, FLAG_DENY, node) {
				return true, Bitmask{BitmaskFlag: FLAG_DENY}
			}
		}
	}
	return hasParentDeny, firstParent
}

// CanRead checks if a node has READ access.
func (a *AccessList) CanRead(ctx context.Context, nodes ...*tree.Node) bool {
	deny, mask := a.ParentMaskOrDeny(ctx, nodes...)
	return !deny && mask.HasFlag(ctx, FLAG_READ, nodes[0])
}

// CanWrite checks if a node has WRITE access.
func (a *AccessList) CanWrite(ctx context.Context, nodes ...*tree.Node) bool {
	deny, mask := a.ParentMaskOrDeny(ctx, nodes...)
	return !deny && mask.HasFlag(ctx, FLAG_WRITE, nodes[0])
}

// BelongsToWorkspaces finds corresponding workspace parents for this node.
func (a *AccessList) BelongsToWorkspaces(ctx context.Context, nodes ...*tree.Node) (workspaces []*idm.Workspace, workspacesRoots map[string]string) {

	wsNodes := a.GetWorkspacesNodes()
	foundWorkspaces := make(map[string]bool)
	workspacesRoots = make(map[string]string)
	for _, node := range nodes {
		uuid := node.Uuid
		for wsId, wsRoots := range wsNodes {
			if _, has := a.Workspaces[wsId]; !has {
				continue
			}
			for rootId, _ := range wsRoots {
				if rootId == uuid {
					foundWorkspaces[wsId] = true
					workspacesRoots[wsId] = rootId
				}
			}
		}
	}
	for workspaceId, _ := range foundWorkspaces {
		workspaces = append(workspaces, a.Workspaces[workspaceId])
	}
	return workspaces, workspacesRoots

}

// FlattenedFrontValues generates a config.Map with frontend actions/parameters configs
func (a *AccessList) FlattenedFrontValues() *config.Map {
	actions := config.NewMap()
	parameters := config.NewMap()
	for _, acl := range a.FrontPluginsValues {
		name := acl.Action.Name
		value := acl.Action.Value
		scope := acl.WorkspaceID
		var iVal interface{}
		if e := json.Unmarshal([]byte(value), &iVal); e != nil {
			log.Logger(context.Background()).Error("Cannot parse config value")
			continue
		}
		parts := strings.Split(name, ":")
		t := parts[0]
		p := parts[1]
		n := parts[2]
		var plugins *config.Map
		if t == "action" {
			plugins = actions
		} else {
			plugins = parameters
		}
		if plugs := plugins.Get(p); plugs != nil {
			plugins = plugs.(*config.Map)
		} else {
			plugins = config.NewMap()
		}
		var param *config.Map
		if sc := plugins.Get(n); sc != nil {
			param = sc.(*config.Map)
		} else {
			param = config.NewMap()
		}
		param.Set(scope, iVal)
		plugins.Set(n, param)
		if t == "action" {
			actions.Set(p, plugins)
		} else {
			parameters.Set(p, plugins)
		}
	}
	output := config.NewMap()
	output.Set("actions", actions)
	output.Set("parameters", parameters)
	return output
}

/* LOGGING SUPPORT */

// Zap simply returns a zapcore.Field object populated with this aggregated AccessList under a standard key
func (a *AccessList) Zap() zapcore.Field {
	return zap.Any(common.KEY_ACCESS_LIST, a)
}

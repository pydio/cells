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
	"sort"
	"strings"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
)

type PolicyResolver func(ctx context.Context, request *idm.PolicyEngineRequest) (*idm.PolicyEngineResponse, error)

type BitmaskFlag uint32

const (
	FlagRead BitmaskFlag = 1 << iota
	FlagWrite
	FlagDeny
	FlagList
	FlagDelete
	FlagPolicy
	FlagQuota
	FlagLock
)

var (
	NamesToFlags = map[string]BitmaskFlag{
		"read":   FlagRead,
		"write":  FlagWrite,
		"deny":   FlagDeny,
		"list":   FlagList,
		"delete": FlagDelete,
		"policy": FlagPolicy,
		"quota":  FlagQuota,
		"lock":   FlagLock,
	}
	FlagsToNames = map[BitmaskFlag]string{
		FlagRead:   "read",
		FlagWrite:  "write",
		FlagDeny:   "deny",
		FlagList:   "list",
		FlagDelete: "delete",
		FlagPolicy: "policy",
		FlagQuota:  "quota",
		FlagLock:   "lock",
	}
	AclRead        = &idm.ACLAction{Name: "read", Value: "1"}
	AclWrite       = &idm.ACLAction{Name: "write", Value: "1"}
	AclDeny        = &idm.ACLAction{Name: "deny", Value: "1"}
	AclPolicy      = &idm.ACLAction{Name: "policy"}
	AclQuota       = &idm.ACLAction{Name: "quota"}
	AclLock        = &idm.ACLAction{Name: "lock"}
	AclChildLock   = &idm.ACLAction{Name: "child_lock"}
	AclContentLock = &idm.ACLAction{Name: "content_lock"}
	// Not used yet
	AclFrontAction_      = &idm.ACLAction{Name: "action:*"}
	AclFrontParam_       = &idm.ACLAction{Name: "parameter:*"}
	AclDelete            = &idm.ACLAction{Name: "delete", Value: "1"}
	AclList              = &idm.ACLAction{Name: "list", Value: "1"}
	AclWsrootActionName  = "workspace-path"
	AclRecycleRoot       = &idm.ACLAction{Name: "recycle_root", Value: "1"}
	ResolvePolicyRequest PolicyResolver
)

type Bitmask struct {
	BitmaskFlag
	PolicyIds  map[string]string
	ValueFlags map[BitmaskFlag]string
}

func (f Bitmask) HasFlag(ctx context.Context, flag BitmaskFlag, ctxNode ...*tree.Node) bool {

	if flag != FlagPolicy && flag != FlagDeny && f.BitmaskFlag&FlagPolicy != 0 && ResolvePolicyRequest != nil {
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
	f.AddFlag(FlagPolicy)
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
	NodesPathsAcls     map[string]Bitmask
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
		if acl.Action.Name == AclPolicy.Name {
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
			if flag == FlagPolicy {
				nodeAcls.AddPolicyFlag(acl.Action.Value)
			} else if flag == FlagQuota {
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
			if !mask.HasFlag(ctx, FlagDeny) {
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

// FirstMaskForChildren look through all the access list pathes to get the first mask available for the node given in argument
func (a *AccessList) FirstMaskForChildren(ctx context.Context, node *tree.Node) Bitmask {
	keys := make([]string, 0, len(a.NodesPathsAcls))
	for k := range a.NodesPathsAcls {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	for _, path := range keys {
		if strings.HasPrefix(path, strings.TrimRight(node.Path, "/")+"/") {
			return a.NodesPathsAcls[path]
		}
	}
	return Bitmask{}
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
			if bitmask.HasFlag(ctx, FlagDeny, node) {
				return true, Bitmask{BitmaskFlag: FlagDeny}
			}
		}
	}
	return hasParentDeny, firstParent
}

// CanRead checks if a node has READ access.
func (a *AccessList) CanRead(ctx context.Context, nodes ...*tree.Node) bool {
	deny, mask := a.ParentMaskOrDeny(ctx, nodes...)
	return !deny && mask.HasFlag(ctx, FlagRead, nodes[0])
}

// CanWrite checks if a node has WRITE access.
func (a *AccessList) CanWrite(ctx context.Context, nodes ...*tree.Node) bool {
	deny, mask := a.ParentMaskOrDeny(ctx, nodes...)
	return !deny && mask.HasFlag(ctx, FlagWrite, nodes[0])
}

// CanWrite checks if a node has WRITE access.
func (a *AccessList) IsLocked(ctx context.Context, nodes ...*tree.Node) bool {
	// First we check for parents
	mask, _ := a.FirstMaskForParents(ctx, nodes...)
	if mask.HasFlag(ctx, FlagLock, nodes[0]) {
		return true
	}

	if mask := a.FirstMaskForChildren(ctx, nodes[0]); mask.HasFlag(ctx, FlagLock, nodes[0]) {
		return true
	}

	return false
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

/* LOGGING SUPPORT */
// Zap simply returns a zapcore.Field object populated with this aggregated AccessList under a standard key
func (a *AccessList) Zap() zapcore.Field {
	return zap.Any(common.KEY_ACCESS_LIST, a)
}

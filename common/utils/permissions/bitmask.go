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

package permissions

import (
	"context"
	"fmt"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/tree"
)

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
	FlagDownload
	FlagUpload
	FlagSync
)

var (
	NamesToFlags = map[string]BitmaskFlag{
		"read":     FlagRead,
		"write":    FlagWrite,
		"deny":     FlagDeny,
		"list":     FlagList,
		"remove":   FlagDelete,
		"policy":   FlagPolicy,
		"quota":    FlagQuota,
		"lock":     FlagLock,
		"download": FlagDownload,
		"upload":   FlagUpload,
		"sync":     FlagSync,
	}

	FlagsToNames = map[BitmaskFlag]string{
		FlagRead:     "read",
		FlagWrite:    "write",
		FlagDeny:     "deny",
		FlagList:     "list",
		FlagDelete:   "remove",
		FlagPolicy:   "policy",
		FlagQuota:    "quota",
		FlagLock:     "lock",
		FlagDownload: "download",
		FlagUpload:   "upload",
		FlagSync:     "sync",
	}
)

type Bitmask struct {
	BitmaskFlag
	PolicyIds  map[string]string
	ValueFlags map[BitmaskFlag]string
}

func (f *Bitmask) checkPolicy(ctx context.Context, initialMeta map[string]string, subjects []string, action string, ctxNode *tree.Node, explicityOnly bool) bool {
	policyContext := make(map[string]string, len(initialMeta))
	for k, v := range initialMeta {
		policyContext[k] = v
	}
	if ctxNode != nil {
		PolicyContextFromNode(policyContext, ctxNode)
	}
	req := &idm.PolicyEngineRequest{
		Subjects: subjects,
		Resource: "acl",
		Action:   action,
		Context:  policyContext,
	}
	if resp, err := ResolvePolicyRequest(ctx, req, explicityOnly); err == nil && resp.Allowed {
		log.Logger(ctx).Debug("Policy Allowed", zap.Any("req", req))
		return true
	} else {
		log.Logger(ctx).Debug("Policy Not Allowed", zap.Any("req", req))
		return false
	}
}

// HasFlag checks if current bitmask matches a given flag. If bitmask has a Policy Flag, it will
// extract metadata from context and from nodes and use the PolicyResolver to dynamically test these properties.
func (f *Bitmask) HasFlag(ctx context.Context, flag BitmaskFlag, ctxNodes ...*tree.Node) bool {

	if flag != FlagPolicy && flag != FlagDeny && f.BitmaskFlag&FlagPolicy != 0 && ResolvePolicyRequest != nil {
		// We should first resolve the policy, given the ctx and the node
		policyContext := make(map[string]string)
		PolicyContextFromMetadata(policyContext, ctx)
		PolicyContextFromClaims(policyContext, ctx)
		var subjects []string
		for k := range f.PolicyIds {
			subjects = append(subjects, fmt.Sprintf("policy:%s", k))
		}
		if len(ctxNodes) == 0 {
			return f.checkPolicy(ctx, policyContext, subjects, FlagsToNames[flag], nil, false)
		}
		// Check all parents, break if check is false (not allowed).
		explicitCheck := false
		for i, ctxNode := range ctxNodes {
			polNode := ctxNode
			if ctxNode.GetPath() == "" || ctxNode.GetPath() == "/" { // Do not try to check nodes meta on root
				polNode = nil
				policyContext[PolicyNodeMeta_+common.MetaFlagWorkspaceRoot] = "true"
			}
			if c := f.checkPolicy(ctx, policyContext, subjects, FlagsToNames[flag], polNode, explicitCheck); !c {
				log.Logger(ctx).Debug("Found forbidden access on node", ctxNode.ZapPath())
				return false
			} else if i == 0 && flag == FlagWrite { // If first node is allowed for Write, restrict further checks to explicit policies
				explicitCheck = true
			}
		}
		return true
	}

	return f.BitmaskFlag&flag != 0
}

// HasPolicyExplicitDeny checks if current bitmask matches a specific flag with Deny.
// If bitmask has a Policy Flag, it will extract metadata from context and from nodes and
// use the PolicyResolver to dynamically test these properties.
func (f *Bitmask) HasPolicyExplicitDeny(ctx context.Context, flag BitmaskFlag, ctxNodes ...*tree.Node) bool {

	if flag != FlagPolicy && flag != FlagDeny && f.BitmaskFlag&FlagPolicy != 0 && ResolvePolicyRequest != nil {
		// We should first resolve the policy, given the ctx and the node
		policyContext := make(map[string]string)
		PolicyContextFromMetadata(policyContext, ctx)
		PolicyContextFromClaims(policyContext, ctx)
		var subjects []string
		for k := range f.PolicyIds {
			subjects = append(subjects, fmt.Sprintf("policy:%s", k))
		}
		if len(ctxNodes) == 0 {
			return !f.checkPolicy(ctx, policyContext, subjects, FlagsToNames[flag], nil, true)
		}
		// Check all parents, break if check is false (not allowed).
		for _, ctxNode := range ctxNodes {
			polNode := ctxNode
			if ctxNode.GetPath() == "" || ctxNode.GetPath() == "/" { // Do not try to check nodes meta on root
				polNode = nil
				policyContext[PolicyNodeMeta_+common.MetaFlagWorkspaceRoot] = "true"
			}
			if c := f.checkPolicy(ctx, policyContext, subjects, FlagsToNames[flag], polNode, true); !c {
				log.Logger(ctx).Debug("Found explicity deny on node", ctxNode.ZapPath())
				return true
			}
		}
		return false
	}

	return false
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

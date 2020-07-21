package permissions

import (
	"context"
	"fmt"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"go.uber.org/zap"
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
)

type Bitmask struct {
	BitmaskFlag
	PolicyIds  map[string]string
	ValueFlags map[BitmaskFlag]string
}

func (f Bitmask) checkPolicy(ctx context.Context, initialMeta map[string]string, subjects []string, action string, ctxNode *tree.Node) bool {
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
	if resp, err := ResolvePolicyRequest(ctx, req); err == nil && resp.Allowed {
		log.Logger(ctx).Debug("Policy Allowed", zap.Any("req", req))
		return true
	} else {
		log.Logger(ctx).Debug("Policy Not Allowed", zap.Any("req", req))
		return false
	}
}

// HasFlag checks if current bitmask matches a given flag. If bitmask has a Policy Flag, it will
// extract metadata from context and from nodes and use the PolicyResolver to dynamically test these properties.
func (f Bitmask) HasFlag(ctx context.Context, flag BitmaskFlag, ctxNodes ...*tree.Node) bool {

	if flag != FlagPolicy && flag != FlagDeny && f.BitmaskFlag&FlagPolicy != 0 && ResolvePolicyRequest != nil {
		// We should first resolve the policy, given the ctx and the node
		policyContext := make(map[string]string)
		PolicyContextFromMetadata(policyContext, ctx)
		var subjects []string
		for k, _ := range f.PolicyIds {
			subjects = append(subjects, fmt.Sprintf("policy:%s", k))
		}
		if len(ctxNodes) == 0 {
			return f.checkPolicy(ctx, policyContext, subjects, FlagsToNames[flag], nil)
		}
		// Check all parents, break if check is false (not allowed).
		for _, ctxNode := range ctxNodes {
			if ctxNode.GetPath() == "" || ctxNode.GetPath() == "/" {
				continue
			}
			if c := f.checkPolicy(ctx, policyContext, subjects, FlagsToNames[flag], ctxNode); !c {
				log.Logger(ctx).Debug("Found forbidden access on node", ctxNode.ZapPath())
				return false
			}
		}
		return true
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

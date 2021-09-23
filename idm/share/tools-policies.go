package share

import (
	"context"
	"fmt"

	"github.com/pborman/uuid"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/utils/permissions"
)

func InheritPolicies(ctx context.Context, policyName string, read, write bool) (string, error) {
	polClient := idm.NewPolicyEngineServiceClient(registry.GetClient(common.ServicePolicy))
	response, e := polClient.ListPolicyGroups(ctx, &idm.ListPolicyGroupsRequest{})
	if e != nil {
		return "", e
	}
	gg := response.PolicyGroups
	parent, ok := policyByName(gg, policyName)
	if !ok {
		return "", fmt.Errorf("cannot find parent policy %s", policyName)
	}
	var suffix = ""
	if read && write {
		suffix = "rw"
	} else if read {
		suffix = "ro"
	} else if write {
		suffix = "wo"
	} else {
		return "", fmt.Errorf("provide at least one of read or write for extending policy")
	}
	// Create inherited flavours
	if ro, o := policyByName(gg, policyName+"-"+suffix); o {
		return ro.Uuid, nil
	}
	roPol, e := derivePolicy(parent, read, write, suffix)
	if e != nil {
		return "", e
	}
	if _, e := polClient.StorePolicyGroup(ctx, &idm.StorePolicyGroupRequest{PolicyGroup: roPol}); e != nil {
		return "", e
	}
	permissions.ClearCachedPolicies(ctx, "acl")
	return roPol.Uuid, nil
}

func derivePolicy(policy *idm.PolicyGroup, read, write bool, suffix string) (*idm.PolicyGroup, error) {
	var label string
	switch suffix {
	case "ro":
		label = "Read Only"
	case "rw":
		label = "Read Write"
	case "wo":
		label = "Write Only"
	}
	newG := &idm.PolicyGroup{
		Uuid:          policy.Uuid + "-" + suffix,
		Name:          policy.Name + " (" + label + ")",
		Description:   policy.Description + " (generated for sharing)",
		ResourceGroup: policy.ResourceGroup,
		OwnerUuid:     policy.OwnerUuid,
	}
	var hasRead, hasWrite bool
	var allowPol *idm.Policy
	for _, p := range policy.Policies {
		// Deny : append policy
		if p.Effect == idm.PolicyEffect_deny {
			p.Id = uuid.New()
			p.Subjects = []string{"policy:" + newG.Uuid}
			newG.Policies = append(newG.Policies, p)
			continue
		}
		// Allow : check action effect
		allowPol = p
		for _, a := range p.Actions {
			if a == permissions.AclRead.Name {
				hasRead = true
			} else if a == permissions.AclWrite.Name {
				hasWrite = true
			}
		}
	}
	if allowPol == nil {
		return nil, fmt.Errorf("cannot derive parent policy (no allow rule set)")
	}
	if read && !hasRead {
		return nil, fmt.Errorf("cannot assign read as parent policy does not provide read access")
	}
	if write && !hasWrite {
		return nil, fmt.Errorf("cannot assign write as parent policy does not provide write access")
	}
	// Reset actions
	allowPol.Id = uuid.New()
	allowPol.Subjects = []string{"policy:" + newG.Uuid}
	allowPol.Actions = []string{}
	if read {
		allowPol.Actions = append(allowPol.Actions, permissions.AclRead.Name)
	}
	if write {
		allowPol.Actions = append(allowPol.Actions, permissions.AclWrite.Name)
	}
	newG.Policies = append(newG.Policies, allowPol)

	return newG, nil
}

func policyByName(groups []*idm.PolicyGroup, name string) (*idm.PolicyGroup, bool) {
	var parent *idm.PolicyGroup
	for _, p := range groups {
		if p.Uuid == name {
			parent = p
			break
		}
	}
	if parent == nil {
		return nil, false
	}
	return parent, true
}

func InterpretInheritedPolicy(ctx context.Context, name string) (read, write bool, e error) {
	polClient := idm.NewPolicyEngineServiceClient(registry.GetClient(common.ServicePolicy))
	response, e := polClient.ListPolicyGroups(ctx, &idm.ListPolicyGroupsRequest{})
	if e != nil {
		return false, false, e
	}
	gg := response.PolicyGroups
	parent, ok := policyByName(gg, name)
	if !ok {
		return false, false, fmt.Errorf("could not find associated policy!")
	}

	for _, p := range parent.Policies {
		// Deny : append policy
		if p.Effect == idm.PolicyEffect_deny {
			continue
		}
		// Allow : check action effect
		for _, a := range p.Actions {
			if a == permissions.AclRead.Name {
				read = true
			} else if a == permissions.AclWrite.Name {
				write = true
			}
		}
	}
	return
}

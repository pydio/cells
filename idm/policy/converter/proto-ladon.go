package converter

import (
	"fmt"

	"github.com/ory/ladon"

	"github.com/pydio/cells/v4/common/proto/idm"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

func ProtoToLadonPolicy(policy *idm.Policy) ladon.Policy {

	output := &ladon.DefaultPolicy{
		ID:          policy.GetId(),
		Description: policy.GetDescription(),
		Subjects:    policy.GetSubjects(),
		Effect:      policy.GetEffect().String(),
		Resources:   policy.GetResources(),
		Actions:     policy.GetActions(),
	}
	// Special treatment for conditions : marshall to json and unmarshall from target from ConditionFactories
	if len(policy.GetConditions()) > 0 {
		output.Conditions = make(map[string]ladon.Condition)
		for name, condition := range policy.GetConditions() {
			cType := condition.GetType()
			if fac, o := ladon.ConditionFactories[cType]; o {
				newCond := fac()
				jsonOptions := condition.GetJsonOptions()
				if jsonOptions != "" {
					e := json.Unmarshal([]byte(jsonOptions), &newCond)
					if e != nil {
						fmt.Println("Cannot unmarshall newCond")
					}
				}
				output.Conditions[name] = newCond
			}
		}
	}

	return output
}

func LadonToProtoPolicy(policy ladon.Policy) *idm.Policy {

	output := &idm.Policy{
		Id:          policy.GetID(),
		Description: policy.GetDescription(),
		Subjects:    policy.GetSubjects(),
		Resources:   policy.GetResources(),
		Actions:     policy.GetActions(),
		Conditions:  nil,
	}
	if policy.GetEffect() == "allow" {
		output.Effect = idm.PolicyEffect_allow
	} else if policy.GetEffect() == "deny" {
		output.Effect = idm.PolicyEffect_deny
	}
	if len(policy.GetConditions()) > 0 {
		output.Conditions = make(map[string]*idm.PolicyCondition)
		for name, condition := range policy.GetConditions() {
			marsh, _ := json.Marshal(condition)
			output.Conditions[name] = &idm.PolicyCondition{
				Type:        condition.GetName(),
				JsonOptions: string(marsh),
			}
		}
	}
	return output

}

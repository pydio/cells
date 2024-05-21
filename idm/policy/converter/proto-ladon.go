package converter

import (
	"crypto/sha256"
	"fmt"
	"sort"
	"strings"

	"github.com/ory/ladon"
	"github.com/ory/ladon/compiler"

	"github.com/pydio/cells/v4/common/proto/idm"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

func ProtoToLadonPolicy(p *idm.Policy) ladon.Policy {

	res := &ladon.DefaultPolicy{
		ID:          p.GetID(),
		Description: p.GetDescription(),
		Effect:      p.GetEffect().String(),
	}

	res.Actions = []string{}
	for _, action := range p.Actions {
		res.Actions = append(res.Actions, action.Template)
	}
	res.Subjects = []string{}
	for _, subject := range p.Subjects {
		res.Subjects = append(res.Subjects, subject.Template)
	}
	res.Resources = []string{}
	for _, resource := range p.Resources {
		res.Resources = append(res.Resources, resource.Template)
	}

	sort.Strings(res.Actions)
	sort.Strings(res.Subjects)
	sort.Strings(res.Resources)

	// Special treatment for conditions : marshall to json and unmarshall from target from ConditionFactories
	if len(p.GetConditions()) > 0 {
		res.Conditions = make(map[string]ladon.Condition)
		for name, condition := range p.GetConditions() {
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
				res.Conditions[name] = newCond
			}
		}
	}

	return res
}

func LadonToProtoPolicy(p ladon.Policy) *idm.Policy {

	res := &idm.Policy{
		ID:          p.GetID(),
		Description: p.GetDescription(),
	}
	if p.GetEffect() == "allow" {
		res.Effect = idm.PolicyEffect_allow
	} else if p.GetEffect() == "deny" {
		res.Effect = idm.PolicyEffect_deny
	}

	for _, template := range p.GetActions() {
		h := sha256.New()
		h.Write([]byte(template))
		id := fmt.Sprintf("%x", h.Sum(nil))

		compiled, err := compiler.CompileRegex(template, p.GetStartDelimiter(), p.GetEndDelimiter())
		if err != nil {
			return nil
		}

		res.Actions = append(res.Actions, &idm.PolicyAction{
			ID:       id,
			Template: template,
			HasRegex: strings.Index(template, string(p.GetStartDelimiter())) >= -1,
			Compiled: compiled.String(),
		})
	}

	for _, template := range p.GetResources() {
		h := sha256.New()
		h.Write([]byte(template))
		id := fmt.Sprintf("%x", h.Sum(nil))

		compiled, err := compiler.CompileRegex(template, p.GetStartDelimiter(), p.GetEndDelimiter())
		if err != nil {
			return nil
		}

		res.Resources = append(res.Resources, &idm.PolicyResource{
			ID:       id,
			Template: template,
			HasRegex: strings.Index(template, string(p.GetStartDelimiter())) >= -1,
			Compiled: compiled.String(),
		})
	}

	for _, template := range p.GetSubjects() {
		h := sha256.New()
		h.Write([]byte(template))
		id := fmt.Sprintf("%x", h.Sum(nil))

		compiled, err := compiler.CompileRegex(template, p.GetStartDelimiter(), p.GetEndDelimiter())
		if err != nil {
			return nil
		}

		res.Subjects = append(res.Subjects, &idm.PolicySubject{
			ID:       id,
			Template: template,
			HasRegex: strings.Index(template, string(p.GetStartDelimiter())) >= -1,
			Compiled: compiled.String(),
		})
	}

	if len(p.GetConditions()) > 0 {
		res.Conditions = make(map[string]*idm.PolicyCondition)
		for name, condition := range p.GetConditions() {
			marsh, _ := json.Marshal(condition)
			res.Conditions[name] = &idm.PolicyCondition{
				Type:        condition.GetName(),
				JsonOptions: string(marsh),
			}
		}
	}

	return res
}

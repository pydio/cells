package converter

import (
	"crypto/sha256"
	"fmt"
	"sort"
	"strings"

	"github.com/ory/ladon"
	"github.com/ory/ladon/compiler"

	"github.com/pydio/cells/v5/common/proto/idm"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

func ProtoToLadonPolicy(p *idm.Policy) ladon.Policy {

	res := &ladon.DefaultPolicy{
		ID:          p.GetID(),
		Description: p.GetDescription(),
		Effect:      p.GetEffect().String(),
	}

	if len(p.GetActions()) > 0 {
		res.Actions = p.GetActions()
	} else if len(p.GetOrmActions()) > 0 {
		for _, action := range p.OrmActions {
			res.Actions = append(res.Actions, action.Template)
		}
	}

	if len(p.GetSubjects()) > 0 {
		res.Subjects = p.GetSubjects()
	} else if len(p.GetOrmSubjects()) > 0 {
		for _, subject := range p.OrmSubjects {
			res.Subjects = append(res.Subjects, subject.Template)
		}
	}

	if len(p.GetResources()) > 0 {
		res.Resources = p.GetResources()
	} else if len(p.GetOrmResources()) > 0 {
		for _, resource := range p.GetOrmResources() {
			res.Resources = append(res.Resources, resource.Template)
		}
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

var (
	defaultPol = &ladon.DefaultPolicy{}
)

func StringToTemplate(template string, obj idm.IPolicySubject) error {
	h := sha256.New()
	h.Write([]byte(template))
	id := fmt.Sprintf("%x", h.Sum(nil))

	compiled, err := compiler.CompileRegex(template, defaultPol.GetStartDelimiter(), defaultPol.GetEndDelimiter())
	if err != nil {
		return err
	}
	obj.SetID(id)
	obj.SetTemplate(template)
	obj.SetHasRegex(strings.Index(template, string(defaultPol.GetStartDelimiter())) >= -1)
	obj.SetCompiled(compiled.String())
	return nil
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
		action := &idm.PolicyAction{}
		if err := StringToTemplate(template, action); err == nil {
			res.OrmActions = append(res.OrmActions, action)
		}
	}

	for _, template := range p.GetResources() {
		resource := &idm.PolicyResource{}
		if err := StringToTemplate(template, resource); err == nil {
			res.OrmResources = append(res.OrmResources, resource)
		}
	}

	for _, template := range p.GetSubjects() {
		subject := &idm.PolicySubject{}
		if err := StringToTemplate(template, subject); err == nil {
			res.OrmSubjects = append(res.OrmSubjects, subject)
		}
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

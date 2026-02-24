package permissions

import (
	"context"
	"testing"
	"text/template"

	"github.com/pydio/cells/v5/common/proto/idm"
	. "github.com/smartystreets/goconvey/convey"
)

func TestResolveTemplates(t *testing.T) {
	Convey("Test resolveConditionsTemplates", t, func() {
		ctx := context.Background()

		// Create a policy with multiple conditions
		policy := &idm.Policy{
			ID:          "test-policy",
			Description: "Test policy with template conditions",
			Subjects:    []string{"user:testuser"},
			Resources:   []string{"resource:*"},
			Actions:     []string{"read"},
			Effect:      idm.PolicyEffect_allow,
			Conditions: map[string]*idm.PolicyCondition{
				"condition1": {
					Type:        "StringMatchCondition",
					JsonOptions: `{"matches": "{{.ClaimsName}}"}`,
				},
				"condition2": {
					Type:        "StringMatchCondition",
					JsonOptions: `{"matches": "fixed-value"}`,
				},
			},
		}

		// Create request context with ClaimsName
		requestContext := map[string]any{
			"ClaimsName": "john.doe",
		}

		// Create template cache
		templateCache := make(map[string]*template.Template)

		// Resolve templates
		resolved, err := resolveConditionsTemplates(ctx, policy, requestContext, templateCache)

		So(err, ShouldBeNil)
		So(resolved, ShouldNotBeNil)
		So(resolved.Conditions, ShouldHaveLength, 2)

		// Check condition1 - should have template resolved
		So(resolved.Conditions["condition1"], ShouldNotBeNil)
		So(resolved.Conditions["condition1"].Type, ShouldEqual, "StringMatchCondition")
		So(resolved.Conditions["condition1"].JsonOptions, ShouldEqual, `{"matches": "john.doe"}`)

		// Check condition2 - should remain unchanged
		So(resolved.Conditions["condition2"], ShouldNotBeNil)
		So(resolved.Conditions["condition2"].Type, ShouldEqual, "StringMatchCondition")
		So(resolved.Conditions["condition2"].JsonOptions, ShouldEqual, `{"matches": "fixed-value"}`)

		// Verify template was cached
		So(templateCache, ShouldHaveLength, 1)
	})

	Convey("Test policy without conditions", t, func() {
		ctx := context.Background()

		// Create a policy without any conditions
		policy := &idm.Policy{
			ID:          "test-policy-no-conditions",
			Description: "Test policy without conditions",
			Subjects:    []string{"user:testuser"},
			Resources:   []string{"resource:*"},
			Actions:     []string{"read"},
			Effect:      idm.PolicyEffect_allow,
			Conditions:  nil,
		}

		// Create request context
		requestContext := map[string]any{
			"ClaimsName": "john.doe",
		}

		// Create template cache
		templateCache := make(map[string]*template.Template)

		// Resolve templates
		resolved, err := resolveConditionsTemplates(ctx, policy, requestContext, templateCache)

		So(err, ShouldBeNil)
		So(resolved, ShouldNotBeNil)
		// Should return the same policy object when there are no conditions
		So(resolved, ShouldEqual, policy)
		So(resolved.Conditions, ShouldBeNil)
	})
}

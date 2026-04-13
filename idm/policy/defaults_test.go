/*
 * Copyright (c) 2026. Abstrium SAS <team (at) pydio.com>
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

package policy

import (
	"testing"

	"github.com/pydio/cells/v5/common/proto/idm"

	. "github.com/smartystreets/goconvey/convey"
)

func TestDefaultPolicyGroupsFrontendPostSplit(t *testing.T) {

	Convey("Test default policies split frontend-post by profile", t, func() {

		// Find the rest-apis-default-accesses policy group
		var restApiGroup *idm.PolicyGroup
		for _, pg := range DefaultPolicyGroups {
			if pg.Uuid == "rest-apis-default-accesses" {
				restApiGroup = pg
				break
			}
		}

		So(restApiGroup, ShouldNotBeNil)

		// Find the two split policies (frontend-post for standard, frontend-post-shared for shared)
		// Note: "frontend-post" keeps its original name for backward compatibility
		var standardPolicy, sharedPolicy *idm.Policy
		for _, p := range restApiGroup.Policies {
			if p.GetID() == "frontend-post" {
				standardPolicy = p
			} else if p.GetID() == "frontend-post-shared" {
				sharedPolicy = p
			}
		}

		So(standardPolicy, ShouldNotBeNil)
		So(sharedPolicy, ShouldNotBeNil)

		// Verify "frontend-post" only applies to standard profile (not the old unified version with both)
		hasStandardOnly := func(p *idm.Policy) bool {
			hasStandard := false
			hasShared := false
			for _, s := range p.OrmSubjects {
				if s.Template == "profile:standard" {
					hasStandard = true
				}
				if s.Template == "profile:shared" {
					hasShared = true
				}
			}
			return hasStandard && !hasShared
		}
		So(hasStandardOnly(standardPolicy), ShouldBeTrue)

		// Helper to check if policy contains a subject
		hasSubject := func(p *idm.Policy, subject string) bool {
			for _, s := range p.OrmSubjects {
				if s.Template == subject {
					return true
				}
			}
			return false
		}

		// Helper to check if policy contains a resource
		hasResource := func(p *idm.Policy, resource string) bool {
			for _, r := range p.OrmResources {
				if r.Template == resource {
					return true
				}
			}
			return false
		}

		// Verify standard profile has /frontend/enroll
		So(hasSubject(standardPolicy, "profile:standard"), ShouldBeTrue)
		So(hasResource(standardPolicy, "rest:/frontend/enroll"), ShouldBeTrue)

		// Verify shared profile does NOT have /frontend/enroll (WPB-23974 fix)
		So(hasSubject(sharedPolicy, "profile:shared"), ShouldBeTrue)
		So(hasResource(sharedPolicy, "rest:/frontend/enroll"), ShouldBeFalse)

		// Verify shared profile still has session and binaries
		So(hasResource(sharedPolicy, "rest:/frontend/session"), ShouldBeTrue)
		So(hasResource(sharedPolicy, "rest:/frontend/binaries/USER/<.+>"), ShouldBeTrue)
	})

	Convey("Test shared profile cannot POST to /frontend/enroll", t, func() {

		var restApiGroup *idm.PolicyGroup
		for _, pg := range DefaultPolicyGroups {
			if pg.Uuid == "rest-apis-default-accesses" {
				restApiGroup = pg
				break
			}
		}

		So(restApiGroup, ShouldNotBeNil)

		// Helper functions
		hasSubject := func(p *idm.Policy, subject string) bool {
			for _, s := range p.OrmSubjects {
				if s.Template == subject {
					return true
				}
			}
			return false
		}

		hasResource := func(p *idm.Policy, resource string) bool {
			for _, r := range p.OrmResources {
				if r.Template == resource {
					return true
				}
			}
			return false
		}

		hasAction := func(p *idm.Policy, action string) bool {
			for _, a := range p.OrmActions {
				if a.Template == action {
					return true
				}
			}
			return false
		}

		// Collect all policies that apply to profile:shared with POST action
		var sharedCanPostToEnroll bool
		for _, p := range restApiGroup.Policies {
			if hasSubject(p, "profile:shared") && hasAction(p, "POST") && hasResource(p, "rest:/frontend/enroll") {
				sharedCanPostToEnroll = true
				break
			}
		}

		So(sharedCanPostToEnroll, ShouldBeFalse)

		// Verify standard profile CAN POST to /frontend/enroll
		var standardCanPostToEnroll bool
		for _, p := range restApiGroup.Policies {
			if hasSubject(p, "profile:standard") && hasAction(p, "POST") && hasResource(p, "rest:/frontend/enroll") {
				standardCanPostToEnroll = true
				break
			}
		}
		So(standardCanPostToEnroll, ShouldBeTrue)
	})

	Convey("Test both profiles can still access /frontend/session", t, func() {

		var restApiGroup *idm.PolicyGroup
		for _, pg := range DefaultPolicyGroups {
			if pg.Uuid == "rest-apis-default-accesses" {
				restApiGroup = pg
				break
			}
		}

		So(restApiGroup, ShouldNotBeNil)

		hasSubject := func(p *idm.Policy, subject string) bool {
			for _, s := range p.OrmSubjects {
				if s.Template == subject {
					return true
				}
			}
			return false
		}

		hasResource := func(p *idm.Policy, resource string) bool {
			for _, r := range p.OrmResources {
				if r.Template == resource {
					return true
				}
			}
			return false
		}

		hasAction := func(p *idm.Policy, action string) bool {
			for _, a := range p.OrmActions {
				if a.Template == action {
					return true
				}
			}
			return false
		}

		var standardHasSession, sharedHasSession bool
		for _, p := range restApiGroup.Policies {
			if hasAction(p, "POST") && hasResource(p, "rest:/frontend/session") {
				if hasSubject(p, "profile:standard") {
					standardHasSession = true
				}
				if hasSubject(p, "profile:shared") {
					sharedHasSession = true
				}
			}
		}

		So(standardHasSession, ShouldBeTrue)
		So(sharedHasSession, ShouldBeTrue)
	})
}

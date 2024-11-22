//go:build storage

package sql

import (
	"context"
	"fmt"
	"testing"

	"github.com/ory/ladon"
	"github.com/pkg/errors"

	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/common/utils/uuid"
	"github.com/pydio/cells/v5/idm/policy"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = test.TemplateSQL(NewDAO)
)

func TestManager(t *testing.T) {
	//sql.TestPrintQueries = true
	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		dao, er := manager.Resolve[policy.DAO](ctx)
		if er != nil {
			panic(er)
		}
		sqlDAO := dao.(*sqlimpl)
		lm := NewManager(sqlDAO.DB).WithContext(ctx)

		t.Run("type=get errors", HelperTestGetErrors(lm))
		t.Run("type=CRUD", HelperTestCreateGetDelete(lm))
		t.Run("type=find-subject", HelperTestFindPoliciesForSubject(lm))
		t.Run("type=find-resource", HelperTestFindPoliciesForResource(lm))
	})
}

var TestManagerPolicies = []*ladon.DefaultPolicy{
	{
		ID:          uuid.New(),
		Description: "description",
		Subjects:    []string{"anonymous", "user"},
		Effect:      ladon.AllowAccess,
		Resources:   []string{"article", "user"},
		Actions:     []string{"create", "update"},
		Conditions:  ladon.Conditions{},
	},
	{
		ID:          uuid.New(),
		Description: "description",
		Subjects:    []string{},
		Effect:      ladon.AllowAccess,
		Resources:   []string{"<article|user>"},
		Actions:     []string{"view"},
		Conditions:  ladon.Conditions{},
	},
	{
		ID:          uuid.New(),
		Description: "description",
		Subjects:    []string{},
		Effect:      ladon.AllowAccess,
		Resources:   []string{},
		Actions:     []string{"view"},
		Conditions:  ladon.Conditions{},
	},
	{
		ID:          uuid.New(),
		Description: "description",
		Subjects:    []string{},
		Effect:      ladon.AllowAccess,
		Resources:   []string{},
		Actions:     []string{},
		Conditions:  ladon.Conditions{},
	},
	{
		ID:          uuid.New(),
		Description: "description",
		Subjects:    []string{},
		Effect:      ladon.AllowAccess,
		Resources:   []string{"foo"},
		Actions:     []string{},
		Conditions:  ladon.Conditions{},
	},
	{
		ID:          uuid.New(),
		Description: "description",
		Subjects:    []string{"foo"},
		Effect:      ladon.AllowAccess,
		Resources:   []string{"foo"},
		Actions:     []string{},
		Conditions:  ladon.Conditions{},
	},
	{
		ID:          uuid.New(),
		Description: "description",
		Subjects:    []string{"foo"},
		Effect:      ladon.AllowAccess,
		Resources:   []string{},
		Actions:     []string{},
		Conditions:  ladon.Conditions{},
	},
	{
		ID:          uuid.New(),
		Description: "description",
		Effect:      ladon.AllowAccess,
		Conditions:  ladon.Conditions{},
		Subjects:    []string{},
		Resources:   []string{},
		Actions:     []string{},
	},
	{
		ID:          uuid.New(),
		Description: "description",
		Subjects:    []string{"<peter|max>"},
		Effect:      ladon.DenyAccess,
		Resources:   []string{"article", "user"},
		Actions:     []string{"view"},
		Conditions: ladon.Conditions{
			"owner": &ladon.EqualsSubjectCondition{},
		},
	},
	{
		ID:          uuid.New(),
		Description: "description",
		Subjects:    []string{"<user|max|anonymous>", "peter"},
		Effect:      ladon.DenyAccess,
		Resources:   []string{".*"},
		Actions:     []string{"disable"},
		Conditions: ladon.Conditions{
			"ip": &ladon.CIDRCondition{
				CIDR: "1234",
			},
			"owner": &ladon.EqualsSubjectCondition{},
		},
	},
	{
		ID:          uuid.New(),
		Description: "description",
		Subjects:    []string{"<.*>"},
		Effect:      ladon.AllowAccess,
		Resources:   []string{"<article|user>"},
		Actions:     []string{"view"},
		Conditions: ladon.Conditions{
			"ip": &ladon.CIDRCondition{
				CIDR: "1234",
			},
			"owner": &ladon.EqualsSubjectCondition{},
		},
	},
	{
		ID:          uuid.New(),
		Description: "description",
		Subjects:    []string{"<us[er]+>"},
		Effect:      ladon.AllowAccess,
		Resources:   []string{"<article|user>"},
		Actions:     []string{"view"},
		Conditions: ladon.Conditions{
			"ip": &ladon.CIDRCondition{
				CIDR: "1234",
			},
			"owner": &ladon.EqualsSubjectCondition{},
		},
	},
	//Two new policies which do not persist in MySQL correctly
	{
		ID:          uuid.New(),
		Description: "A failed policy",
		Subjects:    []string{"supplier"},
		Effect:      ladon.AllowAccess,
		Resources:   []string{"product:<.*>"},
		Actions:     []string{"update"},
		Conditions:  ladon.Conditions{},
	},
	{
		ID:          uuid.New(),
		Description: "Another failed policy",
		Subjects:    []string{"buyer"},
		Effect:      ladon.AllowAccess,
		Resources:   []string{"products:attributeGroup:<.*>"},
		Actions:     []string{"create"},
		Conditions:  ladon.Conditions{},
	},
}

var testPolicies = []*ladon.DefaultPolicy{
	{
		ID:          uuid.New(),
		Description: "description",
		Subjects:    []string{"sql<.*>match"},
		Effect:      ladon.AllowAccess,
		Resources:   []string{"master", "user", "article"},
		Actions:     []string{"create", "update", "delete"},
		Conditions: ladon.Conditions{
			"foo": &ladon.StringEqualCondition{
				Equals: "foo",
			},
		},
	},
	{
		ID:          uuid.New(),
		Description: "description",
		Subjects:    []string{"sqlmatch"},
		Effect:      ladon.AllowAccess,
		Resources:   []string{"master", "user", "article"},
		Actions:     []string{"create", "update", "delete"},
		Conditions: ladon.Conditions{
			"foo": &ladon.StringEqualCondition{
				Equals: "foo",
			},
		},
	},
	{
		ID:          uuid.New(),
		Description: "description",
		Subjects:    []string{},
		Effect:      ladon.AllowAccess,
		Resources:   []string{"master", "user", "article"},
		Actions:     []string{"create", "update", "delete"},
		Conditions: ladon.Conditions{
			"foo": &ladon.StringEqualCondition{
				Equals: "foo",
			},
		},
	},
	{
		ID:          uuid.New(),
		Description: "description",
		Effect:      ladon.AllowAccess,
		Subjects:    []string{},
		Resources:   []string{"master", "user", "article"},
		Actions:     []string{"create", "update", "delete"},
		Conditions: ladon.Conditions{
			"foo": &ladon.StringEqualCondition{
				Equals: "foo",
			},
		},
	},
	{
		ID:          uuid.New(),
		Description: "description",
		Subjects:    []string{"some"},
		Effect:      ladon.AllowAccess,
		Resources:   []string{"sqlmatch_resource"},
		Actions:     []string{"create", "update", "delete"},
		Conditions: ladon.Conditions{
			"foo": &ladon.StringEqualCondition{
				Equals: "foo",
			},
		},
	},
	{
		ID:          uuid.New(),
		Description: "description",
		Subjects:    []string{"other"},
		Effect:      ladon.AllowAccess,
		Resources:   []string{"sql<.*>resource"},
		Actions:     []string{"create", "update", "delete"},
		Conditions: ladon.Conditions{
			"foo": &ladon.StringEqualCondition{
				Equals: "foo",
			},
		},
	},
}

func HelperTestFindPoliciesForSubject(s ladon.Manager) func(t *testing.T) {
	return func(t *testing.T) {
		Convey("test find", t, func() {
			for _, c := range testPolicies {
				So(s.Create(c), ShouldBeNil)
			}

			r, e := s.FindPoliciesForSubject("some")
			So(e, ShouldBeNil)
			So(len(r), ShouldEqual, 1)

			res, err := s.FindRequestCandidates(&ladon.Request{
				Subject:  "sqlmatch",
				Resource: "article",
				Action:   "create",
			})
			So(err, ShouldBeNil)
			So(len(res), ShouldEqual, 2)

			if testPolicies[0].ID == res[0].GetID() {
				AssertPolicyEqual(t, testPolicies[0], res[0])
				AssertPolicyEqual(t, testPolicies[1], res[1])
			} else {
				AssertPolicyEqual(t, testPolicies[0], res[1])
				AssertPolicyEqual(t, testPolicies[1], res[0])
			}

			res, err = s.FindRequestCandidates(&ladon.Request{
				Subject:  "sqlamatch",
				Resource: "article",
				Action:   "create",
			})

			So(err, ShouldBeNil)
			So(len(res), ShouldEqual, 1)
			AssertPolicyEqual(t, testPolicies[0], res[0])
		})
	}
}

func HelperTestFindPoliciesForResource(s ladon.Manager) func(t *testing.T) {
	return func(t *testing.T) {
		Convey("test find", t, func() {
			for _, c := range testPolicies {
				So(s.Create(c), ShouldBeNil)
			}

			res, err := s.FindPoliciesForResource("sqlmatch_resource")
			So(err, ShouldBeNil)
			So(len(res), ShouldEqual, 2)

			if testPolicies[len(testPolicies)-2].ID == res[0].GetID() {
				AssertPolicyEqual(t, testPolicies[len(testPolicies)-2], res[0])
				AssertPolicyEqual(t, testPolicies[len(testPolicies)-1], res[1])
			} else {
				AssertPolicyEqual(t, testPolicies[len(testPolicies)-2], res[1])
				AssertPolicyEqual(t, testPolicies[len(testPolicies)-1], res[0])
			}

			res, err = s.FindPoliciesForResource("sqlamatch_resource")
			So(err, ShouldBeNil)
			So(len(res), ShouldEqual, 1)
			AssertPolicyEqual(t, testPolicies[len(testPolicies)-1], res[0])
		})
	}
}

func AssertPolicyEqual(t *testing.T, expected, got ladon.Policy) {
	So(expected.GetID(), ShouldEqual, got.GetID())
	So(expected.GetDescription(), ShouldEqual, got.GetDescription())
	So(expected.GetEffect(), ShouldEqual, got.GetEffect())

	// This won't work in the memory manager
	//assert.NotNil(t, got.GetActions())
	//assert.NotNil(t, got.GetResources())
	//assert.NotNil(t, got.GetSubjects())

	//So(testEq(expected.GetActions(), got.GetActions()), ShouldBeNil)
	//So(testEq(expected.GetResources(), got.GetResources()), ShouldBeNil)
	//So(testEq(expected.GetSubjects(), got.GetSubjects()), ShouldBeNil)
	if len(expected.GetConditions()) == 0 {
		So(len(expected.GetConditions()), ShouldEqual, len(got.GetConditions()))
	} else {
		So(expected.GetConditions(), ShouldResemble, got.GetConditions())
	}
}

func testEq(a, b []string) error {
	// We don't care about nil types
	//if a == nil && b == nil {
	//	return true
	//}
	//
	//if a == nil || b == nil {
	//	return false
	//}

	if len(a) != len(b) {
		return errors.Errorf("Length not equal: %v (%d) != %v (%d)", a, len(a), b, len(b))
	}

	var found bool
	for i := range a {
		found = false

		for y := range b {
			if a[i] == b[y] {
				found = true
				break
			}
		}

		if !found {
			return errors.Errorf("No match found: %d from %v in %v", i, a, b)
		}
	}

	return nil
}

func HelperTestGetErrors(s ladon.Manager) func(t *testing.T) {
	return func(t *testing.T) {
		Convey("test errors", t, func() {
			_, err := s.Get(uuid.New())
			So(err, ShouldBeError)

			_, err = s.Get("asdf")
			So(err, ShouldBeError)
		})
	}
}

func HelperTestCreateGetDelete(s ladon.Manager) func(t *testing.T) {
	return func(t *testing.T) {
		for i, c := range TestManagerPolicies {
			Convey(fmt.Sprintf("case=%d/id=%s/type=create", i, c.GetID()), t, func() {
				_, err := s.Get(c.GetID())
				So(err, ShouldBeError)
				So(s.Create(c), ShouldBeNil)
			})

			Convey(fmt.Sprintf("case=%d/id=%s/type=query", i, c.GetID()), t, func() {
				get, err := s.Get(c.GetID())
				So(err, ShouldBeNil)

				AssertPolicyEqual(t, c, get)
			})

			Convey(fmt.Sprintf("case=%d/id=%s/type=update", i, c.GetID()), t, func() {
				c.Description = c.Description + "_updated"
				So(s.Update(c), ShouldBeNil)

				get, err := s.Get(c.GetID())
				So(err, ShouldBeNil)

				AssertPolicyEqual(t, c, get)
			})

			Convey(fmt.Sprintf("case=%d/id=%s/type=query", i, c.GetID()), t, func() {
				get, err := s.Get(c.GetID())
				So(err, ShouldBeNil)

				AssertPolicyEqual(t, c, get)
			})
		}

		Convey("type=query-all", t, func() {
			count := int64(len(TestManagerPolicies))

			pols, err := s.GetAll(100, 0)
			So(err, ShouldBeNil)
			So(len(pols), ShouldEqual, len(TestManagerPolicies))

			pols4, err := s.GetAll(1, 0)
			So(err, ShouldBeNil)
			So(len(pols4), ShouldEqual, 1)

			pols2, err := s.GetAll(100, count-1)
			So(err, ShouldBeNil)
			So(len(pols2), ShouldEqual, 1)

			pols3, err := s.GetAll(100, count)
			So(err, ShouldBeNil)
			So(len(pols3), ShouldEqual, 0)

			found := map[string]int{}
			for _, got := range pols {
				for _, expect := range TestManagerPolicies {
					if got.GetID() == expect.GetID() {
						AssertPolicyEqual(t, expect, got)
						found[got.GetID()]++
					}
				}
			}
			// for _, got := range pols {
			// 	for _, expect := range TestManagerPolicies {
			// 		//This is a modified equality check
			// 		if got.GetID() == expect.GetID() && reflect.DeepEqual(got.GetResources(), expect.GetResources()) && reflect.DeepEqual(got.GetActions(), expect.GetActions()) {
			// 			found[got.GetID()]++
			// 		}
			// 	}
			// }
			So(len(found), ShouldEqual, len(TestManagerPolicies))

			for _, f := range found {
				//This assert is supposed to pass
				So(1, ShouldEqual, f)
			}
		})

		for i, c := range TestManagerPolicies {
			Convey(fmt.Sprintf("case=%d/id=%s/type=delete", i, c.GetID()), t, func() {
				So(s.Delete(c.ID), ShouldBeNil)

				_, err := s.Get(c.GetID())
				So(err, ShouldBeError)
			})
		}
	}
}

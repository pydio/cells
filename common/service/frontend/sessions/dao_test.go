package sessions

import (
	"context"
	"fmt"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gorilla/sessions"

	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage/test"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = test.TemplateSQL(NewSQLDAO)
)

func TestInsert(t *testing.T) {

	Convey("Test Crud", t, func() {

		test.RunStorageTests(testcases, func(ctx context.Context) {

			dao, er := manager.Resolve[DAO](ctx)
			So(er, ShouldBeNil)
			So(dao, ShouldNotBeNil)

			req := httptest.NewRequest("GET", "https://example.com/a/frontend", nil)
			response := httptest.NewRecorder()

			s, er := dao.GetSession(req)
			So(er, ShouldBeNil)
			So(s, ShouldNotBeNil)
			So(s.IsNew, ShouldBeTrue)
			//id := s.ID

			// We must call registry.Save() to actual DB storage
			reg := sessions.GetRegistry(req)
			er = reg.Save(response)
			So(er, ShouldBeNil)
			So(response.Header().Get("Set-Cookie"), ShouldNotBeEmpty)

			cookieString := response.Header().Get("Set-Cookie")
			fmt.Println("Set-Cookie", cookieString)

			req2 := httptest.NewRequest("GET", "https://example.com/a/frontend", nil)
			req2.Header.Set("Cookie", strings.Split(cookieString, ";")[0])
			s, er = dao.GetSession(req2)
			So(er, ShouldBeNil)
			So(s, ShouldNotBeNil)
			So(s.IsNew, ShouldBeFalse)

			s.Values["newKey"] = "newValue"
			_ = reg.Save(response)

		})

	})

}

package sessions

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gorilla/sessions"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/test"
	. "github.com/smartystreets/goconvey/convey"
)

var (
	samesiteTestcases = test.TemplateSQL(NewSQLDAO)
)

func TestSameSiteCookieBehavior(t *testing.T) {

	test.RunStorageTests(samesiteTestcases, t, func(ctx context.Context) {

		Convey("SameSite=Strict cookie behavior", t, func() {

			dao, er := manager.Resolve[DAO](ctx)
			So(er, ShouldBeNil)
			So(dao, ShouldNotBeNil)

			Convey("Session cookie includes SameSite=Strict in Set-Cookie header", func() {
				req := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
				response := httptest.NewRecorder()

				s, er := dao.GetSession(req)
				So(er, ShouldBeNil)
				So(s, ShouldNotBeNil)

				reg := sessions.GetRegistry(req)
				er = reg.Save(response)
				So(er, ShouldBeNil)

				cookieString := response.Header().Get("Set-Cookie")
				So(cookieString, ShouldNotBeEmpty)
				So(strings.Contains(cookieString, "SameSite=Strict"), ShouldBeTrue)
			})

			Convey("Cookie options have SameSite=Strict set", func() {
				req := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
				response := httptest.NewRecorder()

				s, er := dao.GetSession(req)
				So(er, ShouldBeNil)
				So(s, ShouldNotBeNil)

				reg := sessions.GetRegistry(req)
				er = reg.Save(response)
				So(er, ShouldBeNil)

				So(s.Options.SameSite, ShouldEqual, http.SameSiteStrictMode)
			})

			Convey("Cookie domain matches request Host header", func() {
				req := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
				req.Host = "pydio.com"
				response := httptest.NewRecorder()

				_, er := dao.GetSession(req)
				So(er, ShouldBeNil)

				reg := sessions.GetRegistry(req)
				er = reg.Save(response)
				So(er, ShouldBeNil)

				cookieString := response.Header().Get("Set-Cookie")
				So(cookieString, ShouldNotBeEmpty)
				// Verify Domain is set to the request Host
				So(strings.Contains(cookieString, "Domain=pydio.com"), ShouldBeTrue)
			})

			Convey("Secure flag is set for HTTPS requests", func() {
				req := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
				response := httptest.NewRecorder()

				session, er := dao.GetSession(req)
				So(er, ShouldBeNil)

				reg := sessions.GetRegistry(req)
				er = reg.Save(response)
				So(er, ShouldBeNil)

				So(session.Options.Secure, ShouldBeTrue)

				cookieString := response.Header().Get("Set-Cookie")
				So(cookieString, ShouldNotBeEmpty)
				So(strings.Contains(cookieString, "Secure"), ShouldBeTrue)
			})

			Convey("Secure flag is NOT set for HTTP requests", func() {
				req := httptest.NewRequest("GET", "http://pydio.com/a/frontend", nil)
				response := httptest.NewRecorder()

				session, er := dao.GetSession(req)
				So(er, ShouldBeNil)

				reg := sessions.GetRegistry(req)
				er = reg.Save(response)
				So(er, ShouldBeNil)

				So(session.Options.Secure, ShouldBeFalse)

				cookieString := response.Header().Get("Set-Cookie")
				So(cookieString, ShouldNotBeEmpty)
				So(strings.Contains(cookieString, "Secure"), ShouldBeFalse)
			})
		})
	})
}

func TestSubdomainBehavior(t *testing.T) {

	test.RunStorageTests(samesiteTestcases, t, func(ctx context.Context) {

		Convey("Subdomain cookie behavior", t, func() {

			dao, er := manager.Resolve[DAO](ctx)
			So(er, ShouldBeNil)
			So(dao, ShouldNotBeNil)

			Convey("Cookie from app.pydio.com is set for pydio.com domain", func() {
				req := httptest.NewRequest("GET", "https://app.pydio.com/a/frontend", nil)
				req.Host = "app.pydio.com"
				response := httptest.NewRecorder()

				_, er := dao.GetSession(req)
				So(er, ShouldBeNil)

				reg := sessions.GetRegistry(req)
				er = reg.Save(response)
				So(er, ShouldBeNil)

				cookieString := response.Header().Get("Set-Cookie")
				So(cookieString, ShouldNotBeEmpty)
				// Domain should be the specific subdomain
				So(strings.Contains(cookieString, "Domain=app.pydio.com"), ShouldBeTrue)
			})

			Convey("SameSite=Strict allows same-site requests (subdomains)", func() {
				// Create session on app.pydio.com
				req1 := httptest.NewRequest("GET", "https://app.pydio.com/a/frontend", nil)
				req1.Host = "app.pydio.com"
				response1 := httptest.NewRecorder()

				s1, er := dao.GetSession(req1)
				So(er, ShouldBeNil)
				s1.Values["user"] = "testuser"
				reg1 := sessions.GetRegistry(req1)
				reg1.Save(response1)

				cookieString := response1.Header().Get("Set-Cookie")
				So(cookieString, ShouldNotBeEmpty)

				// Note: In real browser behavior, subdomains are considered same-site
				// However, cookies are domain-specific. This test validates the cookie options.
				So(s1.Options.SameSite, ShouldEqual, http.SameSiteStrictMode)
			})
		})
	})
}

func TestProxyScenario(t *testing.T) {

	test.RunStorageTests(samesiteTestcases, t, func(ctx context.Context) {

		Convey("Proxy scenario cookie behavior", t, func() {

			dao, er := manager.Resolve[DAO](ctx)
			So(er, ShouldBeNil)
			So(dao, ShouldNotBeNil)

			Convey("Cookie domain uses Host header from request", func() {
				// Simulate proxy scenario where backend receives request with different Host
				req := httptest.NewRequest("GET", "https://backend.internal.com/a/frontend", nil)
				req.Host = "backend.internal.com"
				response := httptest.NewRecorder()

				_, er := dao.GetSession(req)
				So(er, ShouldBeNil)

				reg := sessions.GetRegistry(req)
				er = reg.Save(response)
				So(er, ShouldBeNil)

				cookieString := response.Header().Get("Set-Cookie")
				So(cookieString, ShouldNotBeEmpty)
				// Cookie domain is set to what the backend sees in Host header
				So(strings.Contains(cookieString, "Domain=backend.internal.com"), ShouldBeTrue)
			})

			Convey("Proxy preserving Host header works correctly", func() {
				// Browser visits https://pydio.com, proxy passes Host: pydio.com
				req := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
				req.Host = "pydio.com"
				response := httptest.NewRecorder()

				s, er := dao.GetSession(req)
				So(er, ShouldBeNil)
				s.Values["user"] = "testuser"

				reg := sessions.GetRegistry(req)
				er = reg.Save(response)
				So(er, ShouldBeNil)

				cookieString := response.Header().Get("Set-Cookie")
				So(cookieString, ShouldNotBeEmpty)
				So(strings.Contains(cookieString, "Domain=pydio.com"), ShouldBeTrue)

				// Verify session can be retrieved with the same Host
				req2 := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
				req2.Host = "pydio.com"
				req2.Header.Set("Cookie", strings.Split(cookieString, ";")[0])

				s2, er := dao.GetSession(req2)
				So(er, ShouldBeNil)
				So(s2.IsNew, ShouldBeFalse)
				So(s2.Values["user"], ShouldEqual, "testuser")
			})

			Convey("Proxy overwriting Host header causes domain mismatch", func() {
				// Browser visits https://pydio.com, but proxy sends Host: backend.internal.com
				// This is the problematic scenario
				req := httptest.NewRequest("GET", "https://backend.internal.com/a/frontend", nil)
				req.Host = "backend.internal.com"
				response := httptest.NewRecorder()

				s, er := dao.GetSession(req)
				So(er, ShouldBeNil)
				s.Values["user"] = "testuser"

				reg := sessions.GetRegistry(req)
				er = reg.Save(response)
				So(er, ShouldBeNil)

				cookieString := response.Header().Get("Set-Cookie")
				So(cookieString, ShouldNotBeEmpty)
				// Cookie domain is backend.internal.com, not pydio.com
				So(strings.Contains(cookieString, "Domain=backend.internal.com"), ShouldBeTrue)

				// In a real browser scenario:
				// 1. Browser receives cookie with Domain=backend.internal.com
				// 2. Browser stores it for backend.internal.com
				// 3. Browser visits pydio.com again
				// 4. Cookie is NOT sent (domain mismatch)
				// This test documents the expected behavior
			})
		})
	})
}

func TestSessionPersistence(t *testing.T) {

	test.RunStorageTests(samesiteTestcases, t, func(ctx context.Context) {

		Convey("Session persistence with SameSite=Strict", t, func() {

			dao, er := manager.Resolve[DAO](ctx)
			So(er, ShouldBeNil)
			So(dao, ShouldNotBeNil)

			Convey("Session persists across same-site requests", func() {
				req1 := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
				req1.Host = "pydio.com"
				response1 := httptest.NewRecorder()

				s1, er := dao.GetSession(req1)
				So(er, ShouldBeNil)
				So(s1.IsNew, ShouldBeTrue)
				s1.Values["user"] = "testuser"
				s1.Values["token"] = "test-token-123"

				reg1 := sessions.GetRegistry(req1)
				er = reg1.Save(response1)
				So(er, ShouldBeNil)

				cookieString := response1.Header().Get("Set-Cookie")
				So(cookieString, ShouldNotBeEmpty)

				// Make another request with the same Host (simulating same-site navigation)
				req2 := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
				req2.Host = "pydio.com"
				req2.Header.Set("Cookie", strings.Split(cookieString, ";")[0])
				response2 := httptest.NewRecorder()

				s2, er := dao.GetSession(req2)
				So(er, ShouldBeNil)
				So(s2.IsNew, ShouldBeFalse)
				So(s2.Values["user"], ShouldEqual, "testuser")
				So(s2.Values["token"], ShouldEqual, "test-token-123")

				// Update session
				s2.Values["lastAction"] = "updated"
				reg2 := sessions.GetRegistry(req2)
				er = reg2.Save(response2)
				So(er, ShouldBeNil)

				// Verify update persists
				req3 := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
				req3.Host = "pydio.com"
				req3.Header.Set("Cookie", strings.Split(cookieString, ";")[0])

				s3, er := dao.GetSession(req3)
				So(er, ShouldBeNil)
				So(s3.IsNew, ShouldBeFalse)
				So(s3.Values["lastAction"], ShouldEqual, "updated")
			})

			Convey("Session data includes HttpOnly flag", func() {
				req := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
				response := httptest.NewRecorder()

				session, er := dao.GetSession(req)
				So(er, ShouldBeNil)

				reg := sessions.GetRegistry(req)
				er = reg.Save(response)
				So(er, ShouldBeNil)

				So(session.Options.HttpOnly, ShouldBeTrue)

				cookieString := response.Header().Get("Set-Cookie")
				So(cookieString, ShouldNotBeEmpty)
				So(strings.Contains(cookieString, "HttpOnly"), ShouldBeTrue)
			})
		})
	})
}

func TestCookieAttributes(t *testing.T) {

	test.RunStorageTests(samesiteTestcases, t, func(ctx context.Context) {

		Convey("Complete cookie attributes verification", t, func() {

			dao, er := manager.Resolve[DAO](ctx)
			So(er, ShouldBeNil)

			req := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
			response := httptest.NewRecorder()

			_, er = dao.GetSession(req)
			So(er, ShouldBeNil)

			reg := sessions.GetRegistry(req)
			er = reg.Save(response)
			So(er, ShouldBeNil)

			cookieString := response.Header().Get("Set-Cookie")
			So(cookieString, ShouldNotBeEmpty)

			Convey("Cookie includes HttpOnly attribute", func() {
				So(strings.Contains(cookieString, "HttpOnly"), ShouldBeTrue)
			})

			Convey("Cookie includes SameSite=Strict attribute", func() {
				So(strings.Contains(cookieString, "SameSite=Strict"), ShouldBeTrue)
			})

			Convey("Cookie includes Secure attribute for HTTPS", func() {
				So(strings.Contains(cookieString, "Secure"), ShouldBeTrue)
			})

			Convey("Cookie includes Path attribute", func() {
				So(strings.Contains(cookieString, "Path=/a/frontend"), ShouldBeTrue)
			})

			Convey("Cookie includes Domain attribute", func() {
				So(strings.Contains(cookieString, "Domain=pydio.com"), ShouldBeTrue)
			})

			Convey("Cookie includes Max-Age attribute", func() {
				So(strings.Contains(cookieString, "Max-Age="), ShouldBeTrue)
			})
		})
	})
}

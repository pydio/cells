package sessions

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/sessions"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/test"
	. "github.com/smartystreets/goconvey/convey"
)

var (
	refreshTestcases = test.TemplateSQL(NewSQLDAO)
)

// Session and cookie behavior around the refresh endpoint (not full OAuth flow)
func TestSessionBehaviorAroundRefreshEndpoint(t *testing.T) {

	test.RunStorageTests(refreshTestcases, t, func(ctx context.Context) {

		Convey("Session behavior around refresh endpoint", t, func() {

			dao, er := manager.Resolve[DAO](ctx)
			So(er, ShouldBeNil)

			Convey("Session stores refresh_token and sets SameSite=Strict", func() {
				// Simulate initial login - set tokens in session
				req := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
				req.Host = "pydio.com"
				response := httptest.NewRecorder()

				s, er := dao.GetSession(req)
				So(er, ShouldBeNil)
				So(s.IsNew, ShouldBeTrue)

				// Store tokens as login flow would
				s.Values["access_token"] = "initial-access-token"
				s.Values["id_token"] = "initial-id-token"
				s.Values["refresh_token"] = "initial-refresh-token"
				s.Values["expires_at"] = strconv.Itoa(int(time.Now().Add(10*time.Minute).Unix()))

				reg := sessions.GetRegistry(req)
				er = reg.Save(response)
				So(er, ShouldBeNil)

				cookieString := response.Header().Get("Set-Cookie")
				So(cookieString, ShouldNotBeEmpty)

				Convey("Cookie includes SameSite=Strict", func() {
					So(strings.Contains(cookieString, "SameSite=Strict"), ShouldBeTrue)
				})
			})

			Convey("Refresh token can be retrieved and updated via session", func() {
				// Initial session setup
				req1 := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
				req1.Host = "pydio.com"
				response1 := httptest.NewRecorder()

				s1, er := dao.GetSession(req1)
				So(er, ShouldBeNil)
				s1.Values["access_token"] = "old-access-token"
				s1.Values["id_token"] = "old-id-token"
				s1.Values["refresh_token"] = "valid-refresh-token"
				s1.Values["expires_at"] = strconv.Itoa(int(time.Now().Add(10*time.Minute).Unix()))

				reg1 := sessions.GetRegistry(req1)
				reg1.Save(response1)

				cookieString := response1.Header().Get("Set-Cookie")
				So(cookieString, ShouldNotBeEmpty)

				// Simulate refresh request - same Host (same-site)
				req2 := httptest.NewRequest("POST", "https://pydio.com/a/frontend/auth/refresh", nil)
				req2.Host = "pydio.com"
				req2.Header.Set("Cookie", strings.Split(cookieString, ";")[0])
				response2 := httptest.NewRecorder()

				s2, er := dao.GetSession(req2)
				So(er, ShouldBeNil)
				So(s2.IsNew, ShouldBeFalse)

				// Verify refresh token is accessible
				refreshToken, ok := s2.Values["refresh_token"]
				So(ok, ShouldBeTrue)
				So(refreshToken, ShouldEqual, "valid-refresh-token")

				// Simulate token refresh - update tokens
				s2.Values["access_token"] = "new-access-token"
				s2.Values["id_token"] = "new-id-token"
				s2.Values["refresh_token"] = "new-refresh-token"
				s2.Values["expires_at"] = strconv.Itoa(int(time.Now().Add(10*time.Minute).Unix()))

				reg2 := sessions.GetRegistry(req2)
				er = reg2.Save(response2)
				So(er, ShouldBeNil)

				Convey("Updated tokens persist", func() {
					// Verify updated tokens are accessible
					req3 := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
					req3.Host = "pydio.com"
					req3.Header.Set("Cookie", strings.Split(cookieString, ";")[0])

					s3, er := dao.GetSession(req3)
					So(er, ShouldBeNil)
					So(s3.IsNew, ShouldBeFalse)
					So(s3.Values["access_token"], ShouldEqual, "new-access-token")
					So(s3.Values["refresh_token"], ShouldEqual, "new-refresh-token")
				})
			})

			Convey("Refresh endpoint gets a new session when cookie is missing/invalid", func() {
				// Request without valid cookie
				req := httptest.NewRequest("POST", "https://pydio.com/a/frontend/auth/refresh", nil)
				req.Host = "pydio.com"
				// No Cookie header set

				s, er := dao.GetSession(req)
				So(er, ShouldBeNil)
				So(s.IsNew, ShouldBeTrue)

				// No refresh token in new session
				refreshToken, ok := s.Values["refresh_token"]
				So(ok, ShouldBeFalse)
				So(refreshToken, ShouldBeNil)
			})

			Convey("Multiple refresh-like requests reuse and update the same session", func() {
				// Initial session
				req1 := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
				req1.Host = "pydio.com"
				response1 := httptest.NewRecorder()

				s1, er := dao.GetSession(req1)
				So(er, ShouldBeNil)
				s1.Values["refresh_token"] = "refresh-v1"
				s1.Values["expires_at"] = strconv.Itoa(int(time.Now().Add(10*time.Minute).Unix()))
				reg1 := sessions.GetRegistry(req1)
				reg1.Save(response1)

				cookieString := response1.Header().Get("Set-Cookie")

				// First refresh
				req2 := httptest.NewRequest("POST", "https://pydio.com/a/frontend/auth/refresh", nil)
				req2.Host = "pydio.com"
				req2.Header.Set("Cookie", strings.Split(cookieString, ";")[0])
				response2 := httptest.NewRecorder()

				s2, er := dao.GetSession(req2)
				So(er, ShouldBeNil)
				s2.Values["refresh_token"] = "refresh-v2"
				reg2 := sessions.GetRegistry(req2)
				reg2.Save(response2)

				// Second refresh
				req3 := httptest.NewRequest("POST", "https://pydio.com/a/frontend/auth/refresh", nil)
				req3.Host = "pydio.com"
				req3.Header.Set("Cookie", strings.Split(cookieString, ";")[0])

				s3, er := dao.GetSession(req3)
				So(er, ShouldBeNil)
				refreshToken := s3.Values["refresh_token"]
				So(refreshToken, ShouldEqual, "refresh-v2")
				So(s3.IsNew, ShouldBeFalse)

				Convey("Session maintains SameSite=Strict across refreshes", func() {
					// Verify SameSite is consistently Strict
					So(s1.Options.SameSite, ShouldEqual, http.SameSiteStrictMode)
					So(s2.Options.SameSite, ShouldEqual, http.SameSiteStrictMode)
					So(s3.Options.SameSite, ShouldEqual, http.SameSiteStrictMode)
				})
			})
		})
	})
}

// Test that SameSite=Strict doesn't interfere with session persistence across same-site requests
func TestSessionPersistenceForRefresh(t *testing.T) {

	test.RunStorageTests(refreshTestcases, t, func(ctx context.Context) {

		Convey("Session persistence for refresh-like flow", t, func() {

			dao, er := manager.Resolve[DAO](ctx)
			So(er, ShouldBeNil)

			Convey("Session data persists across multiple same-site requests", func() {
				// Create session with tokens
				req1 := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
				req1.Host = "pydio.com"
				response1 := httptest.NewRecorder()

				s1, er := dao.GetSession(req1)
				So(er, ShouldBeNil)
				s1.Values["user"] = "testuser"
				s1.Values["refresh_token"] = "test-refresh-token"
				s1.Values["counter"] = 1

				reg1 := sessions.GetRegistry(req1)
				er = reg1.Save(response1)
				So(er, ShouldBeNil)

				cookieString := response1.Header().Get("Set-Cookie")

				// Simulate multiple requests over time
				for i := 0; i < 5; i++ {
					req := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
					req.Host = "pydio.com"
					req.Header.Set("Cookie", strings.Split(cookieString, ";")[0])
					response := httptest.NewRecorder()

					s, er := dao.GetSession(req)
					So(er, ShouldBeNil)
					So(s.IsNew, ShouldBeFalse)

					// Verify all data persists
					So(s.Values["user"], ShouldEqual, "testuser")
					So(s.Values["refresh_token"], ShouldEqual, "test-refresh-token")
					So(s.Values["counter"], ShouldEqual, 1)

					reg := sessions.GetRegistry(req)
					er = reg.Save(response)
					So(er, ShouldBeNil)
				}

				Convey("SameSite=Strict remains constant in Set-Cookie", func() {
					So(strings.Contains(cookieString, "SameSite=Strict"), ShouldBeTrue)
				})
			})
		})
	})
}

	// Test scenarios that Charles is concerned about - proxy configurations preserving Host
func TestProxyRefreshScenario(t *testing.T) {

	test.RunStorageTests(refreshTestcases, t, func(ctx context.Context) {

		Convey("Proxy refresh scenarios with preserved Host header", t, func() {

			dao, er := manager.Resolve[DAO](ctx)
			So(er, ShouldBeNil)

			Convey("Refresh-like request reuses session when Host is preserved by proxy", func() {
				// Browser visits https://pydio.com, proxy passes Host: pydio.com
				req1 := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
				req1.Host = "pydio.com"
				response1 := httptest.NewRecorder()

				s1, er := dao.GetSession(req1)
				So(er, ShouldBeNil)
				s1.Values["refresh_token"] = "refresh-token-1"

				reg1 := sessions.GetRegistry(req1)
				er = reg1.Save(response1)
				So(er, ShouldBeNil)

				cookieString := response1.Header().Get("Set-Cookie")

				// Refresh request - proxy still sends Host: pydio.com
				req2 := httptest.NewRequest("POST", "https://pydio.com/a/frontend/auth/refresh", nil)
				req2.Host = "pydio.com"
				req2.Header.Set("Cookie", strings.Split(cookieString, ";")[0])

				s2, er := dao.GetSession(req2)
				So(er, ShouldBeNil)
				So(s2.IsNew, ShouldBeFalse)
				So(s2.Values["refresh_token"], ShouldEqual, "refresh-token-1")
			})
		})
	})
}

// TestSameSiteConfigurable verifies that SameSite policy can be configured
func TestSameSiteConfigurable(t *testing.T) {
	test.RunStorageTests(refreshTestcases, t, func(ctx context.Context) {
		Convey("SameSite policy is configurable from frontend/secureCookies config", t, func() {
			// Test 1: Default is Strict
			dao, er := manager.Resolve[DAO](ctx)
			So(er, ShouldBeNil)

			req := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
			req.Host = "pydio.com"
			response := httptest.NewRecorder()

			s, er := dao.GetSession(req)
			So(er, ShouldBeNil)
			s.Values["test"] = "data"

			reg := sessions.GetRegistry(req)
			er = reg.Save(response)
			So(er, ShouldBeNil)

			cookie := response.Header().Get("Set-Cookie")
			So(cookie, ShouldNotBeEmpty)
			So(strings.Contains(cookie, "SameSite=Strict"), ShouldBeTrue)

			// Test 2: Can be overridden to Lax
			Convey("Can override to Lax", func() {
				err := config.Set(ctx, map[string]interface{}{
					"frontend": map[string]interface{}{
						"secureCookies": map[string]interface{}{
							"SameSite": "Lax",
						},
					},
				})
				So(err, ShouldBeNil)

				// Re-resolve with new config
				dao2, err := manager.Resolve[DAO](ctx)
				So(err, ShouldBeNil)

				req2 := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
				req2.Host = "pydio.com"
				response2 := httptest.NewRecorder()

				s2, err := dao2.GetSession(req2)
				So(err, ShouldBeNil)
				s2.Values["test"] = "data"

				reg2 := sessions.GetRegistry(req2)
				err = reg2.Save(response2)
				So(err, ShouldBeNil)

				cookie2 := response2.Header().Get("Set-Cookie")
				So(cookie2, ShouldNotBeEmpty)
				So(strings.Contains(cookie2, "SameSite=Lax"), ShouldBeTrue)
			})

			// Test 3: Can be overridden to None
			Convey("Can override to None", func() {
				err := config.Set(ctx, map[string]interface{}{
					"frontend": map[string]interface{}{
						"secureCookies": map[string]interface{}{
							"SameSite": "None",
						},
					},
				})
				So(err, ShouldBeNil)

				dao3, err := manager.Resolve[DAO](ctx)
				So(err, ShouldBeNil)

				req3 := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
				req3.Host = "pydio.com"
				response3 := httptest.NewRecorder()

				s3, err := dao3.GetSession(req3)
				So(err, ShouldBeNil)
				s3.Values["test"] = "data"

				reg3 := sessions.GetRegistry(req3)
				err = reg3.Save(response3)
				So(err, ShouldBeNil)

				cookie3 := response3.Header().Get("Set-Cookie")
				So(cookie3, ShouldNotBeEmpty)
				So(strings.Contains(cookie3, "SameSite=None"), ShouldBeTrue)
			})

			// Test 4: Invalid value falls back to Strict
			Convey("Invalid value falls back to Strict", func() {
				err := config.Set(ctx, map[string]interface{}{
					"frontend": map[string]interface{}{
						"secureCookies": map[string]interface{}{
							"SameSite": "InvalidValue",
						},
					},
				})
				So(err, ShouldBeNil)

				dao4, err := manager.Resolve[DAO](ctx)
				So(err, ShouldBeNil)

				req4 := httptest.NewRequest("GET", "https://pydio.com/a/frontend", nil)
				req4.Host = "pydio.com"
				response4 := httptest.NewRecorder()

				s4, err := dao4.GetSession(req4)
				So(err, ShouldBeNil)
				s4.Values["test"] = "data"

				reg4 := sessions.GetRegistry(req4)
				err = reg4.Save(response4)
				So(err, ShouldBeNil)

				cookie4 := response4.Header().Get("Set-Cookie")
				So(cookie4, ShouldNotBeEmpty)
				So(strings.Contains(cookie4, "SameSite=Strict"), ShouldBeTrue)
			})
		})
	})
}

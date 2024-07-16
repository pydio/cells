//go:build storage

package grpc

import (
	"context"
	"testing"
	"time"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/auth"
	"github.com/pydio/cells/v4/common/storage/test"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/idm/oauth/dao/sql"

	. "github.com/smartystreets/goconvey/convey"
)

func init() {
	tokensKey = []byte("secretersecretersecretersecreter") // 32 bytes long
}

var (
	options = configx.New()

	testCases = test.TemplateSQL(sql.NewPatDAO)
)

func TestPatHandler_Generate(t *testing.T) {

	test.RunStorageTests(testCases, t, func(ctx context.Context) {

		Convey("Test Personal Access Tokens", t, func() {
			pat := &PATHandler{}
			rsp, e := pat.Generate(ctx, &auth.PatGenerateRequest{
				Type:      auth.PatType_PERSONAL,
				UserUuid:  "admin-uuid",
				UserLogin: "admin",
				Label:     "Personal token for admin",
			})
			So(e, ShouldNotBeNil)
			rsp, e = pat.Generate(ctx, &auth.PatGenerateRequest{
				Type:      auth.PatType_PERSONAL,
				UserUuid:  "admin-uuid",
				UserLogin: "admin",
				Label:     "Personal token for admin",
				ExpiresAt: time.Now().Add(2 * time.Second).Unix(),
				Issuer:    "https://0.0.0.0:8080",
				Scopes:    []string{"doc:rw:uuid", "rest:r:/toto", "policy:uuid"}, // ?? POLICY
			})
			So(e, ShouldBeNil)
			So(rsp.AccessToken, ShouldNotBeEmpty)
			generatedToken := rsp.AccessToken
			defer func(uuid string) {
				pat.Revoke(ctx, &auth.PatRevokeRequest{Uuid: uuid})
			}(rsp.TokenUuid)

			verifyResponse, er1 := pat.Verify(ctx, &auth.VerifyTokenRequest{Token: "unknownToken"})
			So(er1, ShouldNotBeNil)
			So(errors.Is(er1, errors.StatusUnauthorized), ShouldBeTrue)
			verifyResponse, er1 = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: generatedToken})
			So(er1, ShouldBeNil)
			So(verifyResponse.Success, ShouldBeTrue)

			<-time.After(3 * time.Second)

			verifyResponse, er1 = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: generatedToken})
			So(er1, ShouldNotBeNil)
			So(errors.Is(er1, errors.StatusUnauthorized), ShouldBeTrue)

		})
	})

}

func TestPatHandler_AutoRefresh(t *testing.T) {
	test.RunStorageTests(testCases, t, func(ctx context.Context) {

		Convey("Test AutoRefresh Access Tokens", t, func() {
			pat := &PATHandler{}
			rsp, e := pat.Generate(ctx, &auth.PatGenerateRequest{
				Type:              auth.PatType_PERSONAL,
				UserUuid:          "admin-uuid",
				UserLogin:         "admin",
				Label:             "Personal token for admin",
				AutoRefreshWindow: 2, // Refresh every 2s
			})
			So(e, ShouldBeNil)
			generatedToken := rsp.AccessToken
			defer func(uuid string) {
				pat.Revoke(ctx, &auth.PatRevokeRequest{Uuid: uuid})
			}(rsp.TokenUuid)

			verifyResponse, er := pat.Verify(ctx, &auth.VerifyTokenRequest{Token: generatedToken})
			So(er, ShouldBeNil)
			So(verifyResponse.Success, ShouldBeTrue)

			<-time.After(1 * time.Second)
			verifyResponse, er = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: generatedToken})
			So(er, ShouldBeNil)
			<-time.After(1 * time.Second)
			verifyResponse, er = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: generatedToken})
			So(er, ShouldBeNil)
			<-time.After(1 * time.Second)
			verifyResponse, er = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: generatedToken})
			So(er, ShouldBeNil)
			<-time.After(1 * time.Second)
			verifyResponse, er = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: generatedToken})
			So(er, ShouldBeNil)
			<-time.After(1 * time.Second)
			verifyResponse, er = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: generatedToken})
			So(er, ShouldBeNil)

			// Longer than refresh - should fail
			<-time.After(3 * time.Second)
			verifyResponse, er = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: generatedToken})
			So(errors.Is(er, errors.StatusUnauthorized), ShouldBeTrue)

		})
	})
}

func TestPatHandler_Revoke(t *testing.T) {
	test.RunStorageTests(testCases, t, func(ctx context.Context) {

		Convey("Test Revoke Access Tokens", t, func() {
			pat := &PATHandler{}
			rsp, e := pat.Generate(ctx, &auth.PatGenerateRequest{
				Type:      auth.PatType_PERSONAL,
				UserUuid:  "admin-uuid",
				UserLogin: "admin",
				Label:     "Personal token for admin",
				ExpiresAt: time.Now().Add(5 * time.Second).Unix(),
			})
			So(e, ShouldBeNil)
			accessToken := rsp.AccessToken
			tokenUuid := rsp.TokenUuid
			_, e = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: accessToken})
			So(e, ShouldBeNil)
			_, e = pat.Revoke(ctx, &auth.PatRevokeRequest{Uuid: tokenUuid})
			So(e, ShouldBeNil)
			_, e = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: accessToken})
			So(e, ShouldNotBeNil)
		})
	})
}

func TestPathHandler_List(t *testing.T) {
	test.RunStorageTests(testCases, t, func(ctx context.Context) {

		Convey("Test Revoke Access Tokens", t, func() {
			pat := &PATHandler{}
			pat.Generate(ctx, &auth.PatGenerateRequest{
				Type:      auth.PatType_PERSONAL,
				UserUuid:  "admin-uuid",
				UserLogin: "admin",
				Label:     "Personal token for admin",
				ExpiresAt: time.Now().Add(5 * time.Second).Unix(),
			})
			pat.Generate(ctx, &auth.PatGenerateRequest{
				Type:      auth.PatType_DOCUMENT,
				UserUuid:  "admin-uuid",
				UserLogin: "admin",
				Label:     "Document token for admin",
				ExpiresAt: time.Now().Add(5 * time.Second).Unix(),
			})
			pat.Generate(ctx, &auth.PatGenerateRequest{
				Type:      auth.PatType_DOCUMENT,
				UserUuid:  "admin-uuid",
				UserLogin: "admin",
				Label:     "Other Document token for admin",
				ExpiresAt: time.Now().Add(5 * time.Second).Unix(),
			})
			resp, er := pat.Generate(ctx, &auth.PatGenerateRequest{
				Type:      auth.PatType_PERSONAL,
				UserUuid:  "user-uuid",
				UserLogin: "user",
				Label:     "Personal token for user",
				ExpiresAt: time.Now().Add(5 * time.Second).Unix(),
			})
			So(er, ShouldBeNil)
			So(resp.AccessToken, ShouldNotBeEmpty)

			listResponse, e := pat.List(ctx, &auth.PatListRequest{})
			So(e, ShouldBeNil)
			So(listResponse.Tokens, ShouldHaveLength, 4)
			listResponse.Tokens = []*auth.PersonalAccessToken{}
			listResponse, e = pat.List(ctx, &auth.PatListRequest{ByUserLogin: "admin"})
			So(e, ShouldBeNil)
			So(listResponse.Tokens, ShouldHaveLength, 3)
			listResponse.Tokens = []*auth.PersonalAccessToken{}
			listResponse, e = pat.List(ctx, &auth.PatListRequest{Type: auth.PatType_DOCUMENT})
			So(e, ShouldBeNil)
			So(listResponse.Tokens, ShouldHaveLength, 2)
			listResponse.Tokens = []*auth.PersonalAccessToken{}
			listResponse, e = pat.List(ctx, &auth.PatListRequest{Type: auth.PatType_PERSONAL})
			So(e, ShouldBeNil)
			So(listResponse.Tokens, ShouldHaveLength, 2)
			listResponse.Tokens = []*auth.PersonalAccessToken{}
			listResponse, e = pat.List(ctx, &auth.PatListRequest{Type: auth.PatType_PERSONAL, ByUserLogin: "user"})
			So(e, ShouldBeNil)
			So(listResponse.Tokens, ShouldHaveLength, 1)
			So(resp.AccessToken, ShouldNotBeEmpty)
		})
	})
}

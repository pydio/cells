package grpc

import (
	"context"
	"testing"
	"time"

	"github.com/micro/go-micro/errors"
	. "github.com/smartystreets/goconvey/convey"
	"gopkg.in/square/go-jose.v2/jwt"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/auth"
)

func init() {
	tokensKey = []byte("secret")
}

func TestPatHandler_Generate(t *testing.T) {

	Convey("Test Personal Access Tokens", t, func() {
		pat := &PatHandler{}
		ctx := context.Background()
		rsp := &auth.PatGenerateResponse{}
		e := pat.Generate(ctx, &auth.PatGenerateRequest{
			Type:      auth.PatType_PERSONAL,
			UserUuid:  "admin-uuid",
			UserLogin: "admin",
			Label:     "Personal token for admin",
		}, rsp)
		So(e, ShouldNotBeNil)
		e = pat.Generate(ctx, &auth.PatGenerateRequest{
			Type:      auth.PatType_PERSONAL,
			UserUuid:  "admin-uuid",
			UserLogin: "admin",
			Label:     "Personal token for admin",
			ExpiresAt: time.Now().Add(2 * time.Second).Unix(),
			Issuer:    "https://0.0.0.0:8080",
			Scopes:    []string{"doc:rw:uuid", "rest:r:/toto"},
		}, rsp)
		So(e, ShouldBeNil)
		So(rsp.IDToken, ShouldNotBeEmpty)
		generatedToken := rsp.IDToken
		tok, err := jwt.ParseSigned(rsp.IDToken)
		So(err, ShouldBeNil)
		out := jwt.Claims{}
		err = tok.Claims(tokensKey, &out)
		So(err, ShouldBeNil)
		So(out.Audience, ShouldContain, common.ServiceGrpcNamespace_+common.ServiceToken)
		So(out.Issuer, ShouldEqual, "https://0.0.0.0:8080")
		So(out.Subject, ShouldEqual, "admin-uuid")
		// Try to parse other claims ?
		custom := PatScopeClaims{}
		err = tok.Claims(tokensKey, &custom)
		So(err, ShouldBeNil)
		So(custom.Scopes, ShouldHaveLength, 2)

		verifyResponse := &auth.VerifyTokenResponse{}
		er1 := pat.Verify(ctx, &auth.VerifyTokenRequest{Token: "unknownToken"}, verifyResponse)
		So(er1, ShouldNotBeNil)
		So(errors.Parse(er1.Error()).Code, ShouldEqual, 401)
		er := pat.Verify(ctx, &auth.VerifyTokenRequest{Token: generatedToken}, verifyResponse)
		So(er, ShouldBeNil)
		So(verifyResponse.Success, ShouldBeTrue)

		<-time.After(3 * time.Second)

		er = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: generatedToken}, verifyResponse)
		So(er, ShouldNotBeNil)
		So(errors.Parse(er.Error()).Code, ShouldEqual, 401)

	})

	Convey("Test AutoRefresh Access Tokens", t, func() {
		pat := &PatHandler{}
		ctx := context.Background()
		rsp := &auth.PatGenerateResponse{}
		e := pat.Generate(ctx, &auth.PatGenerateRequest{
			Type:              auth.PatType_PERSONAL,
			UserUuid:          "admin-uuid",
			UserLogin:         "admin",
			Label:             "Personal token for admin",
			AutoRefreshWindow: 2, // Refresh every 2s
		}, rsp)
		So(e, ShouldBeNil)
		generatedToken := rsp.IDToken

		verifyResponse := &auth.VerifyTokenResponse{}
		er := pat.Verify(ctx, &auth.VerifyTokenRequest{Token: generatedToken}, verifyResponse)
		So(er, ShouldBeNil)
		So(verifyResponse.Success, ShouldBeTrue)

		<-time.After(1 * time.Second)
		er = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: generatedToken}, verifyResponse)
		So(er, ShouldBeNil)
		<-time.After(1 * time.Second)
		er = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: generatedToken}, verifyResponse)
		So(er, ShouldBeNil)
		<-time.After(1 * time.Second)
		er = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: generatedToken}, verifyResponse)
		So(er, ShouldBeNil)
		<-time.After(1 * time.Second)
		er = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: generatedToken}, verifyResponse)
		So(er, ShouldBeNil)
		<-time.After(1 * time.Second)
		er = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: generatedToken}, verifyResponse)
		So(er, ShouldBeNil)

		// Longer than refresh - should fail
		<-time.After(3 * time.Second)
		er = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: generatedToken}, verifyResponse)
		So(er, ShouldNotBeNil)
		So(errors.Parse(er.Error()).Code, ShouldEqual, 401)

	})

}

func TestPatHandler_Revoke(t *testing.T) {
	Convey("Test Revoke Access Tokens", t, func() {
		pat := &PatHandler{}
		ctx := context.Background()
		rsp := &auth.PatGenerateResponse{}
		e := pat.Generate(ctx, &auth.PatGenerateRequest{
			Type:      auth.PatType_PERSONAL,
			UserUuid:  "admin-uuid",
			UserLogin: "admin",
			Label:     "Personal token for admin",
			ExpiresAt: time.Now().Add(5 * time.Second).Unix(),
		}, rsp)
		So(e, ShouldBeNil)
		idToken := rsp.IDToken
		e = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: idToken}, &auth.VerifyTokenResponse{})
		So(e, ShouldBeNil)
		// Revoke and recheck
		e = pat.Revoke(ctx, &auth.PatRevokeRequest{IDToken: idToken}, &auth.PatRevokeResponse{})
		So(e, ShouldBeNil)
		e = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: idToken}, &auth.VerifyTokenResponse{})
		So(e, ShouldNotBeNil)
	})
}

func TestPathHandler_List(t *testing.T) {
	Convey("Test Revoke Access Tokens", t, func() {
		pat := &PatHandler{}
		ctx := context.Background()
		rsp := &auth.PatGenerateResponse{}
		pat.Generate(ctx, &auth.PatGenerateRequest{
			Type:      auth.PatType_PERSONAL,
			UserUuid:  "admin-uuid",
			UserLogin: "admin",
			Label:     "Personal token for admin",
			ExpiresAt: time.Now().Add(5 * time.Second).Unix(),
		}, rsp)
		pat.Generate(ctx, &auth.PatGenerateRequest{
			Type:      auth.PatType_DOCUMENT,
			UserUuid:  "admin-uuid",
			UserLogin: "admin",
			Label:     "Document token for admin",
			ExpiresAt: time.Now().Add(5 * time.Second).Unix(),
		}, rsp)
		pat.Generate(ctx, &auth.PatGenerateRequest{
			Type:      auth.PatType_DOCUMENT,
			UserUuid:  "admin-uuid",
			UserLogin: "admin",
			Label:     "Other Document token for admin",
			ExpiresAt: time.Now().Add(5 * time.Second).Unix(),
		}, rsp)
		pat.Generate(ctx, &auth.PatGenerateRequest{
			Type:      auth.PatType_PERSONAL,
			UserUuid:  "user-uuid",
			UserLogin: "user",
			Label:     "Personal token for user",
			ExpiresAt: time.Now().Add(5 * time.Second).Unix(),
		}, rsp)

		listResponse := &auth.PatListResponse{}
		e := pat.List(ctx, &auth.PatListRequest{}, listResponse)
		So(e, ShouldBeNil)
		So(listResponse.Tokens, ShouldHaveLength, 4)
		listResponse.Tokens = []*auth.PersonalAccessToken{}
		e = pat.List(ctx, &auth.PatListRequest{ByUserLogin: "admin"}, listResponse)
		So(e, ShouldBeNil)
		So(listResponse.Tokens, ShouldHaveLength, 3)
		listResponse.Tokens = []*auth.PersonalAccessToken{}
		e = pat.List(ctx, &auth.PatListRequest{Type: auth.PatType_DOCUMENT}, listResponse)
		So(e, ShouldBeNil)
		So(listResponse.Tokens, ShouldHaveLength, 2)
		listResponse.Tokens = []*auth.PersonalAccessToken{}
		e = pat.List(ctx, &auth.PatListRequest{Type: auth.PatType_PERSONAL}, listResponse)
		So(e, ShouldBeNil)
		So(listResponse.Tokens, ShouldHaveLength, 2)
		listResponse.Tokens = []*auth.PersonalAccessToken{}
		e = pat.List(ctx, &auth.PatListRequest{Type: auth.PatType_PERSONAL, ByUserLogin: "user"}, listResponse)
		So(e, ShouldBeNil)
		So(listResponse.Tokens, ShouldHaveLength, 1)
	})

}

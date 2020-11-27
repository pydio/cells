package grpc

import (
	"context"
	"fmt"
	"sync"
	"testing"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"github.com/micro/go-micro/errors"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/auth"
	servicecontext "github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/idm/oauth"
	"github.com/pydio/cells/x/configx"
)

func init() {
	tokensKey = []byte("secretersecretersecretersecreter") // 32 bytes long
}

var (
	options = configx.New()
	ctx     context.Context
	wg      sync.WaitGroup
)

func TestMain(m *testing.M) {

	dao := sql.NewDAO("sqlite3", "file::memory:?mode=memory&cache=shared", "idm_oauth_")
	if dao == nil {
		fmt.Print("Could not start sqlite3 DAO")
		return
	}

	mockDAO := oauth.NewDAO(dao).(oauth.DAO)
	if err := mockDAO.Init(options); err != nil {
		fmt.Print("Could not init DAO ", err)
		return
	}

	ctx = servicecontext.WithDAO(context.Background(), mockDAO)

	m.Run()
	wg.Wait()
}

func TestPatHandler_Generate(t *testing.T) {

	Convey("Test Personal Access Tokens", t, func() {
		pat := &PatHandler{}
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
			Scopes:    []string{"doc:rw:uuid", "rest:r:/toto", "policy:uuid"}, // ?? POLICY
		}, rsp)
		So(e, ShouldBeNil)
		So(rsp.AccessToken, ShouldNotBeEmpty)
		generatedToken := rsp.AccessToken
		defer func(uuid string) {
			pat.Revoke(ctx, &auth.PatRevokeRequest{Uuid: uuid}, &auth.PatRevokeResponse{})
		}(rsp.TokenUuid)

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

}
func TestPatHandler_AutoRefresh(t *testing.T) {
	Convey("Test AutoRefresh Access Tokens", t, func() {
		pat := &PatHandler{}
		rsp := &auth.PatGenerateResponse{}
		e := pat.Generate(ctx, &auth.PatGenerateRequest{
			Type:              auth.PatType_PERSONAL,
			UserUuid:          "admin-uuid",
			UserLogin:         "admin",
			Label:             "Personal token for admin",
			AutoRefreshWindow: 2, // Refresh every 2s
		}, rsp)
		So(e, ShouldBeNil)
		generatedToken := rsp.AccessToken
		defer func(uuid string) {
			pat.Revoke(ctx, &auth.PatRevokeRequest{Uuid: uuid}, &auth.PatRevokeResponse{})
		}(rsp.TokenUuid)

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
		rsp := &auth.PatGenerateResponse{}
		e := pat.Generate(ctx, &auth.PatGenerateRequest{
			Type:      auth.PatType_PERSONAL,
			UserUuid:  "admin-uuid",
			UserLogin: "admin",
			Label:     "Personal token for admin",
			ExpiresAt: time.Now().Add(5 * time.Second).Unix(),
		}, rsp)
		So(e, ShouldBeNil)
		accessToken := rsp.AccessToken
		tokenUuid := rsp.TokenUuid
		e = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: accessToken}, &auth.VerifyTokenResponse{})
		So(e, ShouldBeNil)
		e = pat.Revoke(ctx, &auth.PatRevokeRequest{Uuid: tokenUuid}, &auth.PatRevokeResponse{})
		So(e, ShouldBeNil)
		e = pat.Verify(ctx, &auth.VerifyTokenRequest{Token: accessToken}, &auth.VerifyTokenResponse{})
		So(e, ShouldNotBeNil)
	})
}

func TestPathHandler_List(t *testing.T) {
	Convey("Test Revoke Access Tokens", t, func() {
		pat := &PatHandler{}
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

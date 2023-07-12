package auth

import (
	"context"
	"database/sql"
	"github.com/google/uuid"
	"github.com/ory/fosite"
	"github.com/ory/hydra/v2/oauth2"
	"github.com/ory/x/errorsx"
	"github.com/ory/x/stringsx"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"gopkg.in/square/go-jose.v2"
	"gorm.io/gorm"
	"net/url"
	"strings"
	"time"
)

//var _ x.FositeStorer = new(oauth2Driver)

type (
	tableName        string
	OAuth2RequestSQL struct {
		ID                string
		NID               uuid.UUID
		Request           string
		ConsentChallenge  sql.NullString
		RequestedAt       time.Time
		Client            string
		Scopes            string
		GrantedScope      string
		RequestedAudience string
		GrantedAudience   string
		Form              string
		Subject           string
		Active            bool
		Session           []byte
		Table             tableName `gorm:"-"`
	}

	OAuth2RequestSQLOIDC    OAuth2RequestSQL
	OAuth2RequestSQLAccess  OAuth2RequestSQL
	OAuth2RequestSQLRefresh OAuth2RequestSQL
	OAuth2RequestSQLCode    OAuth2RequestSQL
	OAuth2RequestSQLPKCE    OAuth2RequestSQL
)

const (
	sqlTableOpenID  tableName = "oidc"
	sqlTableAccess  tableName = "access"
	sqlTableRefresh tableName = "refresh"
	sqlTableCode    tableName = "code"
	sqlTablePKCE    tableName = "pkce"
)

func (r *OAuth2RequestSQLOIDC) TableName() string {
	return "hydra_oauth2_oidc"
}

func (r *OAuth2RequestSQLAccess) TableName() string {
	return "hydra_oauth2_access"
}

func (r *OAuth2RequestSQLRefresh) TableName() string {
	return "hydra_oauth2_refresh"
}

func (r *OAuth2RequestSQLCode) TableName() string {
	return "hydra_oauth2_code"
}

func (r *OAuth2RequestSQLPKCE) TableName() string {
	return "hydra_oauth2_pkce"
}

type oauth2Driver struct {
	db *gorm.DB
	r  Registry
}

func (o *oauth2Driver) AutoMigrate() {
	o.db.AutoMigrate(&OAuth2RequestSQLOIDC{}, &OAuth2RequestSQLAccess{}, &OAuth2RequestSQLRefresh{}, &OAuth2RequestSQLCode{}, &OAuth2RequestSQLPKCE{})
}

func (o *oauth2Driver) createSession(ctx context.Context, signature string, request fosite.Requester, table tableName) error {

	session := request.GetSession().(*oauth2.Session)
	sessionBytes, err := json.Marshal(session)
	if err != nil {
		return err
	}

	req := &OAuth2RequestSQL{
		Request:           request.GetID(),
		ConsentChallenge:  sql.NullString{Valid: true, String: session.ConsentChallenge},
		ID:                signature,
		RequestedAt:       request.GetRequestedAt(),
		Client:            request.GetClient().GetID(),
		Scopes:            strings.Join(request.GetRequestedScopes(), "|"),
		GrantedScope:      strings.Join(request.GetGrantedScopes(), "|"),
		GrantedAudience:   strings.Join(request.GetGrantedAudience(), "|"),
		RequestedAudience: strings.Join(request.GetRequestedAudience(), "|"),
		Form:              request.GetRequestForm().Encode(),
		Session:           sessionBytes,
		Subject:           session.GetSubject(),
		Active:            true,
		Table:             table,
	}

	var tx *gorm.DB

	switch table {
	case sqlTableOpenID:
		tx = o.db.Create((*OAuth2RequestSQLOIDC)(req))
	case sqlTableAccess:
		tx = o.db.Create((*OAuth2RequestSQLAccess)(req))
	case sqlTableRefresh:
		tx = o.db.Create((*OAuth2RequestSQLRefresh)(req))
	case sqlTableCode:
		tx = o.db.Create((*OAuth2RequestSQLCode)(req))
	case sqlTablePKCE:
		tx = o.db.Create((*OAuth2RequestSQLPKCE)(req))
	}

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (o *oauth2Driver) getSession(ctx context.Context, req interface{}, session fosite.Session) (fosite.Requester, error) {

	tx := o.db.Where(req).Find(&req)
	if tx.Error != nil {
		return nil, tx.Error
	}

	var r *OAuth2RequestSQL
	switch v := req.(type) {
	case *OAuth2RequestSQLCode:
		r = (*OAuth2RequestSQL)(v)
	case *OAuth2RequestSQLAccess:
		r = (*OAuth2RequestSQL)(v)
	case *OAuth2RequestSQLRefresh:
		r = (*OAuth2RequestSQL)(v)
	case *OAuth2RequestSQLOIDC:
		r = (*OAuth2RequestSQL)(v)
	case *OAuth2RequestSQLPKCE:
		r = (*OAuth2RequestSQL)(v)
	}

	sess := r.Session
	//if !gjson.ValidBytes(sess) {
	//	var err error
	//	sess, err = o.Manager.KeyCipher().Decrypt(ctx, string(sess))
	//	if err != nil {
	//		return nil, errorsx.WithStack(err)
	//	}
	//}

	if session != nil {
		if err := json.Unmarshal(sess, session); err != nil {
			return nil, errorsx.WithStack(err)
		}
	} else {
		//p.l.Debugf("Got an empty session in toRequest")
	}

	c, err := o.r.ClientManager().GetClient(ctx, r.Client)
	if err != nil {
		return nil, err
	}

	val, err := url.ParseQuery(r.Form)
	if err != nil {
		return nil, errorsx.WithStack(err)
	}

	return &fosite.Request{
		ID:                r.Request,
		RequestedAt:       r.RequestedAt,
		Client:            c,
		RequestedScope:    stringsx.Splitx(r.Scopes, "|"),
		GrantedScope:      stringsx.Splitx(r.GrantedScope, "|"),
		RequestedAudience: stringsx.Splitx(r.RequestedAudience, "|"),
		GrantedAudience:   stringsx.Splitx(r.GrantedAudience, "|"),
		Form:              val,
		Session:           session,
	}, nil
}

func (o *oauth2Driver) ClientAssertionJWTValid(ctx context.Context, jti string) error {
	//TODO implement me
	panic("implement me")
}

func (o *oauth2Driver) SetClientAssertionJWT(ctx context.Context, jti string, exp time.Time) error {
	//TODO implement me
	panic("implement me")
}

func (o *oauth2Driver) CreateAuthorizeCodeSession(ctx context.Context, code string, request fosite.Requester) (err error) {
	return o.createSession(ctx, code, request, sqlTableCode)
}

func (o *oauth2Driver) GetAuthorizeCodeSession(ctx context.Context, code string, session fosite.Session) (fosite.Requester, error) {
	return o.getSession(ctx, &OAuth2RequestSQLCode{ID: code}, session)
}

func (o *oauth2Driver) InvalidateAuthorizeCodeSession(ctx context.Context, code string) (err error) {
	tx := o.db.Where(&OAuth2RequestSQLCode{ID: code}).Updates(OAuth2RequestSQLCode{Active: false})
	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (o *oauth2Driver) CreateAccessTokenSession(ctx context.Context, signature string, request fosite.Requester) (err error) {
	return o.createSession(ctx, signature, request, sqlTableAccess)
}

func (o *oauth2Driver) GetAccessTokenSession(ctx context.Context, signature string, session fosite.Session) (request fosite.Requester, err error) {
	return o.getSession(ctx, &OAuth2RequestSQLAccess{ID: signature}, session)
}

func (o *oauth2Driver) DeleteAccessTokenSession(ctx context.Context, signature string) (err error) {
	//TODO implement me
	panic("implement me")
}

func (o *oauth2Driver) CreateRefreshTokenSession(ctx context.Context, signature string, request fosite.Requester) (err error) {
	return o.createSession(ctx, signature, request, sqlTableRefresh)
}

func (o *oauth2Driver) GetRefreshTokenSession(ctx context.Context, signature string, session fosite.Session) (request fosite.Requester, err error) {
	return o.getSession(ctx, &OAuth2RequestSQLRefresh{ID: signature}, session)
}

func (o *oauth2Driver) DeleteRefreshTokenSession(ctx context.Context, signature string) (err error) {
	//TODO implement me
	panic("implement me")
}

func (o *oauth2Driver) CreateOpenIDConnectSession(ctx context.Context, authorizeCode string, requester fosite.Requester) error {
	return o.createSession(ctx, authorizeCode, requester, sqlTableOpenID)
}

func (o *oauth2Driver) GetOpenIDConnectSession(ctx context.Context, authorizeCode string, requester fosite.Requester) (fosite.Requester, error) {
	return o.getSession(ctx, &OAuth2RequestSQLOIDC{ID: authorizeCode}, requester.GetSession())
}

func (o *oauth2Driver) GetPKCERequestSession(ctx context.Context, signature string, session fosite.Session) (fosite.Requester, error) {
	return o.getSession(ctx, &OAuth2RequestSQLPKCE{ID: signature}, session)
}

func (o *oauth2Driver) CreatePKCERequestSession(ctx context.Context, signature string, requester fosite.Requester) error {
	return o.createSession(ctx, signature, requester, sqlTablePKCE)
}

func (o *oauth2Driver) DeletePKCERequestSession(ctx context.Context, signature string) error {
	r := &OAuth2RequestSQLPKCE{ID: signature}
	tx := o.db.Where(r).First(&r)
	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (o *oauth2Driver) GetPublicKey(ctx context.Context, issuer string, subject string, keyId string) (*jose.JSONWebKey, error) {
	//TODO implement me
	panic("implement me")
}

func (o *oauth2Driver) GetPublicKeys(ctx context.Context, issuer string, subject string) (*jose.JSONWebKeySet, error) {
	//TODO implement me
	panic("implement me")
}

func (o *oauth2Driver) GetPublicKeyScopes(ctx context.Context, issuer string, subject string, keyId string) ([]string, error) {
	//TODO implement me
	panic("implement me")
}

func (o *oauth2Driver) IsJWTUsed(ctx context.Context, jti string) (bool, error) {
	//TODO implement me
	panic("implement me")
}

func (o *oauth2Driver) MarkJWTUsedForTime(ctx context.Context, jti string, exp time.Time) error {
	//TODO implement me
	panic("implement me")
}

func (o *oauth2Driver) RevokeRefreshToken(ctx context.Context, requestID string) error {
	//TODO implement me
	panic("implement me")
}

func (o *oauth2Driver) RevokeAccessToken(ctx context.Context, requestID string) error {
	//TODO implement me
	panic("implement me")
}

func (o *oauth2Driver) FlushInactiveAccessTokens(ctx context.Context, notAfter time.Time, limit int, batchSize int) error {
	//TODO implement me
	panic("implement me")
}

func (o *oauth2Driver) FlushInactiveLoginConsentRequests(ctx context.Context, notAfter time.Time, limit int, batchSize int) error {
	//TODO implement me
	panic("implement me")
}

func (o *oauth2Driver) DeleteAccessTokens(ctx context.Context, clientID string) error {
	//TODO implement me
	panic("implement me")
}

func (o *oauth2Driver) FlushInactiveRefreshTokens(ctx context.Context, notAfter time.Time, limit int, batchSize int) error {
	//TODO implement me
	panic("implement me")
}

func (o *oauth2Driver) DeleteOpenIDConnectSession(ctx context.Context, authorizeCode string) error {
	//TODO implement me
	panic("implement me")
}

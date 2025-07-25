package sql

import (
	"context"
	"database/sql"
	"net/url"
	"strings"
	"time"

	"github.com/ory/fosite"
	foauth2 "github.com/ory/fosite/handler/oauth2"
	"github.com/ory/fosite/handler/openid"
	"github.com/ory/fosite/handler/pkce"
	"github.com/ory/hydra/v2/oauth2"
	hsql "github.com/ory/hydra/v2/persistence/sql"
	"github.com/ory/x/errorsx"
	"github.com/ory/x/stringsx"
	"github.com/tidwall/gjson"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"

	"github.com/pydio/cells/v5/common/errors"
	sql2 "github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/telemetry/tracing"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/idm/oauth"

	_ "github.com/ory/hydra/v2/x"
)

var _ foauth2.CoreStorage = (*oauth2Driver)(nil)

var _ openid.OpenIDConnectRequestStorage = (*oauth2Driver)(nil)

var _ pkce.PKCERequestStorage = (*oauth2Driver)(nil)

//var _ x.FositeStorer

type (
	tableName               string
	OAuth2RequestSQL        hsql.OAuth2RequestSQL
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

func (r *OAuth2RequestSQLOIDC) TableName(n schema.Namer) string {
	return n.TableName("oidc")
}

func (r *OAuth2RequestSQLAccess) TableName(n schema.Namer) string {
	return n.TableName("access")
}

func (r *OAuth2RequestSQLRefresh) TableName(n schema.Namer) string {
	return n.TableName("refresh")
}

func (r *OAuth2RequestSQLCode) TableName(n schema.Namer) string {
	return n.TableName("code")
}

func (r *OAuth2RequestSQLPKCE) TableName(n schema.Namer) string {
	return n.TableName("pkce")
}

var (
	OAuthRegistryError = errors.RegisterBaseSentinel(errors.CellsError, "oauth registry")
)

type oauth2Driver struct {
	*sql2.Abstract
	r oauth.Registry
}

func (o *oauth2Driver) Migrate(ctx context.Context) error {
	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "oAuth2Driver.Migrate")
	defer span.End()
	return o.DB.AutoMigrate(&OAuth2RequestSQLOIDC{}, &OAuth2RequestSQLAccess{}, &OAuth2RequestSQLRefresh{}, &OAuth2RequestSQLCode{}, &OAuth2RequestSQLPKCE{})
}

func (o *oauth2Driver) createSession(ctx context.Context, signature string, request fosite.Requester, table tableName) error {
	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "oAuth2Driver.createSession")
	defer span.End()

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
	}

	var tx *gorm.DB
	db := o.Session(ctx)

	switch table {
	case sqlTableOpenID:
		tx = db.Create((*OAuth2RequestSQLOIDC)(req))
	case sqlTableAccess:
		tx = db.Create((*OAuth2RequestSQLAccess)(req))
	case sqlTableRefresh:
		tx = db.Create((*OAuth2RequestSQLRefresh)(req))
	case sqlTableCode:
		tx = db.Create((*OAuth2RequestSQLCode)(req))
	case sqlTablePKCE:
		tx = db.Create((*OAuth2RequestSQLPKCE)(req))
	}

	if tx.Error != nil {
		return errors.Tag(tx.Error, OAuthRegistryError)
	}

	return nil
}

func (o *oauth2Driver) getSession(ctx context.Context, req interface{}, session fosite.Session) (fosite.Requester, error) {
	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "oAuth2Driver.getSession")
	defer span.End()
	tx := o.Session(ctx).Where(req).Find(&req)
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
	if !gjson.ValidBytes(sess) {
		var err error
		sess, err = o.r.KeyCipher().Decrypt(ctx, string(sess), nil)
		if err != nil {
			return nil, errorsx.WithStack(err)
		}
	}

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
	j := oauth2.NewBlacklistedJTI(jti, time.Time{})

	tx := o.Session(ctx).First(&j)
	if tx.Error != nil {
		if errors.Is(tx.Error, sql.ErrNoRows) {
			return nil
		}
		return errors.Tag(tx.Error, OAuthRegistryError)
	}

	if j.Expiry.After(time.Now()) {
		return fosite.ErrJTIKnown
	}

	return nil
}

func (o *oauth2Driver) SetClientAssertionJWT(ctx context.Context, jti string, exp time.Time) error {
	j := oauth2.NewBlacklistedJTI(jti, exp)

	tx := o.Session(ctx).Create(&j)
	if tx.Error != nil {
		return errors.Tag(tx.Error, OAuthRegistryError)
	}

	return nil
}

func (o *oauth2Driver) CreateAuthorizeCodeSession(ctx context.Context, code string, request fosite.Requester) (err error) {
	return o.createSession(ctx, code, request, sqlTableCode)
}

func (o *oauth2Driver) GetAuthorizeCodeSession(ctx context.Context, code string, session fosite.Session) (fosite.Requester, error) {
	return o.getSession(ctx, &OAuth2RequestSQLCode{ID: code}, session)
}

func (o *oauth2Driver) InvalidateAuthorizeCodeSession(ctx context.Context, code string) (err error) {
	tx := o.Session(ctx).Where(&OAuth2RequestSQLCode{ID: code}).Updates(OAuth2RequestSQLCode{Active: false})
	if tx.Error != nil {
		return errors.Tag(tx.Error, OAuthRegistryError)
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
	r := &OAuth2RequestSQLAccess{ID: signature}
	tx := o.Session(ctx).Where(r).Delete(&r)
	if tx.Error != nil {
		return errors.Tag(tx.Error, OAuthRegistryError)
	}

	return nil
}

func (o *oauth2Driver) CreateRefreshTokenSession(ctx context.Context, signature string, request fosite.Requester) (err error) {
	return o.createSession(ctx, signature, request, sqlTableRefresh)
}

func (o *oauth2Driver) GetRefreshTokenSession(ctx context.Context, signature string, session fosite.Session) (request fosite.Requester, err error) {
	return o.getSession(ctx, &OAuth2RequestSQLRefresh{ID: signature}, session)
}

func (o *oauth2Driver) DeleteRefreshTokenSession(ctx context.Context, signature string) (err error) {
	r := &OAuth2RequestSQLRefresh{ID: signature}
	tx := o.Session(ctx).Where(r).Delete(&r)
	if tx.Error != nil {
		return errors.Tag(tx.Error, OAuthRegistryError)
	}

	return nil
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
	tx := o.Session(ctx).Where(r).Delete(&r)
	if tx.Error != nil {
		return errors.Tag(tx.Error, OAuthRegistryError)
	}

	return nil
}

func (o *oauth2Driver) RevokeRefreshToken(ctx context.Context, requestID string) error {
	tx := o.Session(ctx).Where(OAuth2RequestSQLRefresh{Request: requestID}).Updates(OAuth2RequestSQLRefresh{Active: false})
	if tx.Error != nil {
		return errors.Tag(tx.Error, OAuthRegistryError)
	}

	return nil
}

func (o *oauth2Driver) RevokeRefreshTokenMaybeGracePeriod(ctx context.Context, requestID string, signature string) error {
	tx := o.Session(ctx).Where(OAuth2RequestSQLRefresh{Request: requestID}).Updates(OAuth2RequestSQLRefresh{Active: false})
	if tx.Error != nil {
		return errors.Tag(tx.Error, OAuthRegistryError)
	}

	return nil
}

func (o *oauth2Driver) RevokeAccessToken(ctx context.Context, requestID string) error {
	tx := o.Session(ctx).Where(OAuth2RequestSQLAccess{Request: requestID}).Updates(OAuth2RequestSQLAccess{Active: false})
	if tx.Error != nil {
		return errors.Tag(tx.Error, OAuthRegistryError)
	}

	return nil
}

func (o *oauth2Driver) FlushInactiveAccessTokens(ctx context.Context, notAfter time.Time, limit int, batchSize int) error {
	requestMaxExpire := time.Now().Add(-o.r.Config().GetAccessTokenLifespan(ctx))
	if requestMaxExpire.Before(notAfter) {
		notAfter = requestMaxExpire
	}

	tx := o.Session(ctx).Where("requested_at < ?", notAfter.UTC()).Limit(limit).Delete(&OAuth2RequestSQLAccess{})
	if tx.Error != nil {
		return errors.Tag(tx.Error, OAuthRegistryError)
	}
	log.TasksLogger(ctx).Info("FlushInactiveAccessTokens", zap.Time("notAfter", notAfter.UTC()), zap.Int64("count", tx.RowsAffected))

	return nil
}

func (o *oauth2Driver) DeleteAccessTokens(ctx context.Context, clientID string) error {
	tx := o.Session(ctx).Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&OAuth2RequestSQLAccess{})
	if tx.Error != nil {
		return errors.Tag(tx.Error, OAuthRegistryError)
	}

	return nil
}

func (o *oauth2Driver) FlushInactiveRefreshTokens(ctx context.Context, notAfter time.Time, limit int, batchSize int) error {
	requestMaxExpire := time.Now().Add(-o.r.Config().GetRefreshTokenLifespan(ctx))
	if requestMaxExpire.Before(notAfter) {
		notAfter = requestMaxExpire
	}

	tx := o.Session(ctx).Where("requested_at < ?", notAfter.UTC()).Limit(limit).Delete(&OAuth2RequestSQLRefresh{})
	if tx.Error != nil {
		return errors.Tag(tx.Error, OAuthRegistryError)
	}
	log.TasksLogger(ctx).Info("FlushInactiveRefreshTokens", zap.Time("notAfter", notAfter.UTC()), zap.Int64("count", tx.RowsAffected))

	return nil
}

func (o *oauth2Driver) DeleteOpenIDConnectSession(ctx context.Context, authorizeCode string) error {
	r := &OAuth2RequestSQLOIDC{ID: authorizeCode}
	tx := o.Session(ctx).Where(r).Delete(&r)
	if tx.Error != nil {
		return errors.Tag(tx.Error, OAuthRegistryError)
	}

	return nil
}

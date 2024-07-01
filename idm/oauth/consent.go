package oauth

import (
	"context"
	"time"

	"github.com/gofrs/uuid"
	"github.com/ory/hydra/v2/client"
	"github.com/ory/hydra/v2/consent"
	"github.com/ory/hydra/v2/flow"
	"github.com/ory/hydra/v2/oauth2/flowctx"
	"github.com/ory/x/sqlxx"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"

	"github.com/pydio/cells/v4/common/runtime/manager"
)

type consentDriver struct {
	db *gorm.DB

	r Registry
}

type Flow struct {
	// ID is the identifier ("login challenge") of the login request. It is used to
	// identify the session.
	//
	// required: true
	ID  string    `db:"login_challenge"`
	NID uuid.UUID `db:"nid"`

	// RequestedScope contains the OAuth 2.0 Scope requested by the OAuth 2.0 Client.
	//
	// required: true
	RequestedScope sqlxx.StringSliceJSONFormat `db:"requested_scope"`

	// RequestedAudience contains the access token audience as requested by the OAuth 2.0 Client.
	//
	// required: true
	RequestedAudience sqlxx.StringSliceJSONFormat `db:"requested_at_audience"`

	// LoginSkip, if true, implies that the client has requested the same scopes from the same user previously.
	// If true, you can skip asking the user to grant the requested scopes, and simply forward the user to the redirect URL.
	//
	// This feature allows you to update / set session information.
	//
	// required: true
	LoginSkip bool `db:"login_skip"`

	// Subject is the user ID of the end-user that authenticated. Now, that end user needs to grant or deny the scope
	// requested by the OAuth 2.0 client. If this value is set and `skip` is true, you MUST include this subject type
	// when accepting the login request, or the request will fail.
	//
	// required: true
	Subject string `db:"subject"`

	// OpenIDConnectContext provides context for the (potential) OpenID Connect context. Implementation of these
	// values in your app are optional but can be useful if you want to be fully compliant with the OpenID Connect spec.
	OpenIDConnectContext *flow.OAuth2ConsentRequestOpenIDConnectContext `db:"oidc_context"`

	// Ref to the Client ID
	ClientID string `db:"client_id"`

	// RequestURL is the original OAuth 2.0 Authorization URL requested by the OAuth 2.0 client. It is the URL which
	// initiates the OAuth 2.0 Authorization Code or OAuth 2.0 Implicit flow. This URL is typically not needed, but
	// might come in handy if you want to deal with additional request parameters.
	//
	// required: true
	RequestURL string `db:"request_url"`

	// SessionID is the login session ID. If the user-agent reuses a login session (via cookie / remember flag)
	// this ID will remain the same. If the user-agent did not have an existing authentication session (e.g. remember is false)
	// this will be a new random value. This value is used as the "sid" parameter in the ID Token and in OIDC Front-/Back-
	// channel logout. Its value can generally be used to associate consecutive login requests by a certain user.
	SessionID sqlxx.NullString `db:"login_session_id"`

	// IdentityProviderSessionID is the session ID of the end-user that authenticated.
	// If specified, we will use this value to propagate the logout.
	IdentityProviderSessionID sqlxx.NullString `db:"identity_provider_session_id"`

	LoginVerifier string `db:"login_verifier"`
	LoginCSRF     string `db:"login_csrf"`

	LoginInitializedAt sqlxx.NullTime `db:"login_initialized_at"`
	RequestedAt        time.Time      `db:"requested_at"`

	State int16 `db:"state"`

	// LoginRemember, if set to true, tells ORY Hydra to remember this user by telling the user agent (browser) to store
	// a cookie with authentication data. If the same user performs another OAuth 2.0 Authorization Request, he/she
	// will not be asked to log in again.
	LoginRemember bool `db:"login_remember"`

	// LoginRememberFor sets how long the authentication should be remembered for in seconds. If set to `0`, the
	// authorization will be remembered for the duration of the browser session (using a session cookie).
	LoginRememberFor int `db:"login_remember_for"`

	// LoginExtendSessionLifespan, if set to true, session cookie expiry time will be updated when session is
	// refreshed (login skip=true).
	LoginExtendSessionLifespan bool `db:"login_extend_session_lifespan"`

	// ACR sets the Authentication AuthorizationContext Class Reference value for this authentication session. You can use it
	// to express that, for example, a user authenticated using two factor authentication.
	ACR string `db:"acr"`

	// AMR sets the Authentication Methods References value for this
	// authentication session. You can use it to specify the method a user used to
	// authenticate. For example, if the acr indicates a user used two factor
	// authentication, the amr can express they used a software-secured key.
	AMR sqlxx.StringSliceJSONFormat `db:"amr"`

	// ForceSubjectIdentifier forces the "pairwise" user ID of the end-user that authenticated. The "pairwise" user ID refers to the
	// (Pairwise Identifier Algorithm)[http://openid.net/specs/openid-connect-core-1_0.html#PairwiseAlg] of the OpenID
	// Connect specification. It allows you to set an obfuscated subject ("user") identifier that is unique to the client.
	//
	// Please note that this changes the user ID on endpoint /userinfo and sub claim of the ID Token. It does not change the
	// sub claim in the OAuth 2.0 Introspection.
	//
	// Per default, ORY Hydra handles this value with its own algorithm. In case you want to set this yourself
	// you can use this field. Please note that setting this field has no effect if `pairwise` is not configured in
	// ORY Hydra or the OAuth 2.0 Client does not expect a pairwise identifier (set via `subject_type` key in the client's
	// configuration).
	//
	// Please also be aware that ORY Hydra is unable to properly compute this value during authentication. This implies
	// that you have to compute this value on every authentication process (probably depending on the client ID or some
	// other unique value).
	//
	// If you fail to compute the proper value, then authentication processes which have id_token_hint set might fail.
	ForceSubjectIdentifier string `db:"forced_subject_identifier"`

	// Context is an optional object which can hold arbitrary data. The data will be made available when fetching the
	// consent request under the "context" field. This is useful in scenarios where login and consent endpoints share
	// data.
	Context sqlxx.JSONRawMessage `db:"context"`

	// LoginWasUsed set to true means that the login request was already handled.
	// This can happen on form double-submit or other errors. If this is set we
	// recommend redirecting the user to `request_url` to re-initiate the flow.
	LoginWasUsed bool `db:"login_was_used"`

	LoginError           *flow.RequestDeniedError `db:"login_error"`
	LoginAuthenticatedAt sqlxx.NullTime           `db:"login_authenticated_at"`

	// ConsentChallengeID is the identifier ("authorization challenge") of the consent authorization request. It is used to
	// identify the session.
	//
	// required: true
	ConsentChallengeID sqlxx.NullString `db:"consent_challenge_id"`

	// ConsentSkip, if true, implies that the client has requested the same scopes from the same user previously.
	// If true, you must not ask the user to grant the requested scopes. You must however either allow or deny the
	// consent request using the usual API call.
	ConsentSkip     bool             `db:"consent_skip"`
	ConsentVerifier sqlxx.NullString `db:"consent_verifier"`
	ConsentCSRF     sqlxx.NullString `db:"consent_csrf"`

	// GrantedScope sets the scope the user authorized the client to use. Should be a subset of `requested_scope`.
	GrantedScope sqlxx.StringSliceJSONFormat `db:"granted_scope"`

	// GrantedAudience sets the audience the user authorized the client to use. Should be a subset of `requested_access_token_audience`.
	GrantedAudience sqlxx.StringSliceJSONFormat `db:"granted_at_audience"`

	// ConsentRemember, if set to true, tells ORY Hydra to remember this consent authorization and reuse it if the same
	// client asks the same user for the same, or a subset of, scope.
	ConsentRemember bool `db:"consent_remember"`

	// ConsentRememberFor sets how long the consent authorization should be remembered for in seconds. If set to `0`, the
	// authorization will be remembered indefinitely.
	ConsentRememberFor *int `db:"consent_remember_for"`

	// ConsentHandledAt contains the timestamp the consent request was handled.
	ConsentHandledAt sqlxx.NullTime `db:"consent_handled_at"`

	// ConsentWasHandled set to true means that the request was already handled.
	// This can happen on form double-submit or other errors. If this is set we
	// recommend redirecting the user to `request_url` to re-initiate the flow.
	ConsentWasHandled  bool                     `db:"consent_was_used"`
	ConsentError       *flow.RequestDeniedError `db:"consent_error"`
	SessionIDToken     sqlxx.MapStringInterface `db:"session_id_token" faker:"-"`
	SessionAccessToken sqlxx.MapStringInterface `db:"session_access_token" faker:"-"`
}

func (*Flow) TableName(namer2 schema.Namer) string {
	return namer2.TableName("flow")
}

func (f *Flow) BeforeSave(db *gorm.DB) error {
	if f.State == flow.FlowStateLoginUnused && string(f.Context) == "" {
		f.Context = sqlxx.JSONRawMessage("{}")
	}
	return nil
}

func (f *Flow) AfterSave(c *gorm.DB) error {
	if f.SessionAccessToken == nil {
		f.SessionAccessToken = make(map[string]interface{})
	}
	if f.SessionIDToken == nil {
		f.SessionIDToken = make(map[string]interface{})
	}
	return nil
}

func ToModel(f *flow.Flow) *Flow {
	clientId := f.ClientID
	if f.Client != nil {
		clientId = f.Client.GetID()
	}
	return &Flow{
		ID:                         f.ID,
		NID:                        f.NID,
		RequestedScope:             f.RequestedScope,
		RequestedAudience:          f.RequestedAudience,
		LoginSkip:                  f.LoginSkip,
		Subject:                    f.Subject,
		OpenIDConnectContext:       f.OpenIDConnectContext,
		ClientID:                   clientId,
		RequestURL:                 f.RequestURL,
		SessionID:                  f.SessionID,
		IdentityProviderSessionID:  f.IdentityProviderSessionID,
		LoginVerifier:              f.LoginVerifier,
		LoginCSRF:                  f.LoginCSRF,
		LoginInitializedAt:         f.LoginInitializedAt,
		RequestedAt:                f.RequestedAt,
		State:                      f.State,
		LoginRemember:              f.LoginRemember,
		LoginRememberFor:           f.LoginRememberFor,
		LoginExtendSessionLifespan: f.LoginExtendSessionLifespan,
		ACR:                        f.ACR,
		AMR:                        f.AMR,
		ForceSubjectIdentifier:     f.ForceSubjectIdentifier,
		Context:                    f.Context,
		LoginWasUsed:               f.LoginWasUsed,
		LoginError:                 f.LoginError,
		LoginAuthenticatedAt:       f.LoginAuthenticatedAt,
		ConsentChallengeID:         f.ConsentChallengeID,
		ConsentSkip:                f.ConsentSkip,
		ConsentVerifier:            f.ConsentVerifier,
		ConsentCSRF:                f.ConsentCSRF,
		GrantedScope:               f.GrantedScope,
		GrantedAudience:            f.GrantedAudience,
		ConsentRemember:            f.ConsentRemember,
		ConsentRememberFor:         f.ConsentRememberFor,
		ConsentHandledAt:           f.ConsentHandledAt,
		ConsentWasHandled:          f.ConsentWasHandled,
		ConsentError:               f.ConsentError,
		SessionIDToken:             f.SessionIDToken,
		SessionAccessToken:         f.SessionAccessToken,
	}
}

func FromModel(f *Flow) *flow.Flow {
	return &flow.Flow{
		ID:                         f.ID,
		NID:                        f.NID,
		RequestedScope:             f.RequestedScope,
		RequestedAudience:          f.RequestedAudience,
		LoginSkip:                  f.LoginSkip,
		Subject:                    f.Subject,
		OpenIDConnectContext:       f.OpenIDConnectContext,
		ClientID:                   f.ClientID,
		RequestURL:                 f.RequestURL,
		SessionID:                  f.SessionID,
		IdentityProviderSessionID:  f.IdentityProviderSessionID,
		LoginVerifier:              f.LoginVerifier,
		LoginCSRF:                  f.LoginCSRF,
		LoginInitializedAt:         f.LoginInitializedAt,
		RequestedAt:                f.RequestedAt,
		State:                      f.State,
		LoginRemember:              f.LoginRemember,
		LoginRememberFor:           f.LoginRememberFor,
		LoginExtendSessionLifespan: f.LoginExtendSessionLifespan,
		ACR:                        f.ACR,
		AMR:                        f.AMR,
		ForceSubjectIdentifier:     f.ForceSubjectIdentifier,
		Context:                    f.Context,
		LoginWasUsed:               f.LoginWasUsed,
		LoginError:                 f.LoginError,
		LoginAuthenticatedAt:       f.LoginAuthenticatedAt,
		ConsentChallengeID:         f.ConsentChallengeID,
		ConsentSkip:                f.ConsentSkip,
		ConsentVerifier:            f.ConsentVerifier,
		ConsentCSRF:                f.ConsentCSRF,
		GrantedScope:               f.GrantedScope,
		GrantedAudience:            f.GrantedAudience,
		ConsentRemember:            f.ConsentRemember,
		ConsentRememberFor:         f.ConsentRememberFor,
		ConsentHandledAt:           f.ConsentHandledAt,
		ConsentWasHandled:          f.ConsentWasHandled,
		ConsentError:               f.ConsentError,
		SessionIDToken:             f.SessionIDToken,
		SessionAccessToken:         f.SessionAccessToken,
	}
}

func (c *consentDriver) AutoMigrate() error {
	return c.db.AutoMigrate(&Flow{})
}

func (c *consentDriver) CreateConsentRequest(ctx context.Context, f *flow.Flow, req *flow.OAuth2ConsentRequest) error {
	f.State = flow.FlowStateConsentInitialized
	f.ConsentChallengeID = sqlxx.NullString(req.ID)
	f.ConsentSkip = req.Skip
	f.ConsentVerifier = sqlxx.NullString(req.Verifier)
	f.ConsentCSRF = sqlxx.NullString(req.CSRF)

	return nil
}

func (c *consentDriver) GetConsentRequest(ctx context.Context, challenge string) (req *flow.OAuth2ConsentRequest, err error) {

	reg, err := manager.Resolve[Registry](ctx)
	if err != nil {
		return nil, err
	}

	f, err := flowctx.Decode[flow.Flow](ctx, reg.FlowCipher(), challenge, flowctx.AsConsentChallenge)
	if err != nil {
		return nil, err
	}

	f.ConsentChallengeID = sqlxx.NullString(challenge)

	return ((*flow.Flow)(f)).GetConsentRequest(), nil
}

func (c *consentDriver) HandleConsentRequest(ctx context.Context, f *flow.Flow, r *flow.AcceptOAuth2ConsentRequest) (*flow.OAuth2ConsentRequest, error) {

	//if tx := c.db.First(&f, "consent_challenge_id=?", r.ID); tx.Error != nil {
	//	return nil, tx.Error
	//}

	//if cli, err := c.r.ClientManager().GetConcreteClient(ctx, f.ClientID); err != nil {
	//	return nil, err
	//} else {
	//	f.Client = cli
	//}

	// Restore the short challenge ID, which was previously sent to the encoded flow,
	// to make sure that the challenge ID in the returned flow matches the param.
	r.ID = f.ConsentChallengeID.String()

	if err := ((*flow.Flow)(f)).HandleConsentRequest(r); err != nil {
		return nil, err
	}

	//if tx := c.db.Omit("Client").Save(&f); tx.Error != nil {
	//	return nil, tx.Error
	//}

	return ((*flow.Flow)(f)).GetConsentRequest(), nil
}

func (c *consentDriver) RevokeSubjectConsentSession(ctx context.Context, user string) error {
	return nil
}

func (c *consentDriver) RevokeSubjectClientConsentSession(ctx context.Context, user, client string) error {
	return nil
}

func (c *consentDriver) VerifyAndInvalidateConsentRequest(ctx context.Context, verifier string) (*flow.AcceptOAuth2ConsentRequest, error) {
	reg, err := manager.Resolve[Registry](ctx)
	if err != nil {
		return nil, err
	}

	f, err := flowctx.Decode[flow.Flow](ctx, reg.FlowCipher(), verifier, flowctx.AsConsentVerifier)
	if err != nil {
		return nil, err
	}

	//tx := c.db.First(&f, "consent_verifier=?", verifier)
	//if tx.Error != nil {
	//	return nil, tx.Error
	//}
	//
	//if cli, err := c.r.ClientManager().GetConcreteClient(ctx, f.ClientID); err != nil {
	//	return nil, err
	//} else {
	//	f.Client = cli
	//}

	if err := ((*flow.Flow)(f)).InvalidateConsentRequest(); err != nil {
		return nil, err
	}

	if tx := c.db.Model(Flow{}).Create(ToModel(f)); tx.Error != nil {
		return nil, tx.Error
	}

	return ((*flow.Flow)(f)).GetHandledConsentRequest(), nil
}

func (c *consentDriver) FindGrantedAndRememberedConsentRequests(ctx context.Context, client, user string) ([]flow.AcceptOAuth2ConsentRequest, error) {
	return []flow.AcceptOAuth2ConsentRequest{}, nil
}

func (c *consentDriver) FindSubjectsGrantedConsentRequests(ctx context.Context, user string, limit, offset int) ([]flow.AcceptOAuth2ConsentRequest, error) {
	return []flow.AcceptOAuth2ConsentRequest{}, nil
}

func (c *consentDriver) FindSubjectsSessionGrantedConsentRequests(ctx context.Context, user, sid string, limit, offset int) ([]flow.AcceptOAuth2ConsentRequest, error) {
	return []flow.AcceptOAuth2ConsentRequest{}, nil
}

func (c *consentDriver) CountSubjectsGrantedConsentRequests(ctx context.Context, user string) (int, error) {
	return 0, nil
}

// Cookie management
func (c *consentDriver) GetRememberedLoginSession(ctx context.Context, loginSessionFromCookie *flow.LoginSession, id string) (*flow.LoginSession, error) {
	return loginSessionFromCookie, nil
}

func (c *consentDriver) CreateLoginSession(ctx context.Context, session *flow.LoginSession) error {
	//nid := c.r.NetworkID(ctx)
	//if nid == uuid.Nil {
	//	return errorsx.WithStack(x.ErrNotFound)
	//}
	//session.NID = nid

	return nil
}

func (c *consentDriver) DeleteLoginSession(ctx context.Context, id string) (deletedSession *flow.LoginSession, err error) {
	return
}

func (c *consentDriver) RevokeSubjectLoginSession(ctx context.Context, user string) error {
	return nil
}

func (c *consentDriver) ConfirmLoginSession(ctx context.Context, loginSession *flow.LoginSession) error {
	return nil
}

func (c *consentDriver) CreateLoginRequest(ctx context.Context, req *flow.LoginRequest) (*flow.Flow, error) {
	f := flow.NewFlow(req)

	// tx := c.db.Omit("Client").Create((*Flow)(f))

	return f, nil
}

func (c *consentDriver) GetLoginRequest(ctx context.Context, challenge string) (*flow.LoginRequest, error) {

	reg, err := manager.Resolve[Registry](ctx)
	if err != nil {
		return nil, err
	}

	f, err := flowctx.Decode[flow.Flow](ctx, reg.FlowCipher(), challenge, flowctx.AsLoginChallenge)
	if err != nil {
		return nil, err
	}

	// TODO Max Age

	//tx := c.db.First(&f, "id=?", challenge)
	//if tx.Error != nil {
	//	return nil, tx.Error
	//}
	//
	//if cli, err := c.r.ClientManager().GetConcreteClient(ctx, f.ClientID); err != nil {
	//	return nil, err
	//} else {
	//	f.Client = cli
	//}

	lr := f.GetLoginRequest()
	lr.ID = challenge

	return f.GetLoginRequest(), nil
}

func (c *consentDriver) HandleLoginRequest(ctx context.Context, f *flow.Flow, challenge string, r *flow.HandledLoginRequest) (*flow.LoginRequest, error) {

	//if tx := c.db.First(&f, "id=?", challenge); tx.Error != nil {
	//	return nil, tx.Error
	//}

	//if cli, err := c.r.ClientManager().GetConcreteClient(ctx, f.ClientID); err != nil {
	//	return nil, err
	//} else {
	//	f.Client = cli
	//}

	r.ID = f.ID

	if err := ((*flow.Flow)(f)).HandleLoginRequest(r); err != nil {
		return nil, err
	}

	//if tx := c.db.Omit("Client").Save(f); tx.Error != nil {
	//	return nil, tx.Error
	//}

	return ((*flow.Flow)(f)).GetLoginRequest(), nil
}

func (c *consentDriver) VerifyAndInvalidateLoginRequest(ctx context.Context, verifier string) (*flow.HandledLoginRequest, error) {
	reg, err := manager.Resolve[Registry](ctx)
	if err != nil {
		return nil, err
	}

	f, err := flowctx.Decode[flow.Flow](ctx, reg.FlowCipher(), verifier, flowctx.AsLoginVerifier)
	if err != nil {
		return nil, err
	}

	//tx := c.db.First(&f, "login_verifier=?", verifier)
	//if tx.Error != nil {
	//	return nil, tx.Error
	//}
	//
	//if cli, err := c.r.ClientManager().GetConcreteClient(ctx, f.ClientID); err != nil {
	//	return nil, err
	//} else {
	//	f.Client = cli
	//}

	if err := ((*flow.Flow)(f)).InvalidateLoginRequest(); err != nil {
		return nil, err
	}

	//if tx := c.db.Omit("Client").Save(f); tx.Error != nil {
	//	return nil, tx.Error
	//}

	var d flow.HandledLoginRequest
	d = ((*flow.Flow)(f)).GetHandledLoginRequest()

	return &d, nil
}

func (c *consentDriver) CreateForcedObfuscatedLoginSession(ctx context.Context, session *consent.ForcedObfuscatedLoginSession) error {
	return nil
}

func (c *consentDriver) GetForcedObfuscatedLoginSession(ctx context.Context, client, obfuscated string) (*consent.ForcedObfuscatedLoginSession, error) {
	return &consent.ForcedObfuscatedLoginSession{}, nil
}

func (c *consentDriver) ListUserAuthenticatedClientsWithFrontChannelLogout(ctx context.Context, subject, sid string) ([]client.Client, error) {
	return []client.Client{}, nil
}

func (c *consentDriver) ListUserAuthenticatedClientsWithBackChannelLogout(ctx context.Context, subject, sid string) ([]client.Client, error) {
	return []client.Client{}, nil
}

func (c *consentDriver) CreateLogoutRequest(ctx context.Context, request *flow.LogoutRequest) error {
	//f := flow.NewFlow(request)
	//
	//tx := c.db.Omit("Client").Create(f)
	//if tx.Error != nil {
	//	return tx.Error
	//}
	return nil
}

func (c *consentDriver) GetLogoutRequest(ctx context.Context, challenge string) (*flow.LogoutRequest, error) {
	return &flow.LogoutRequest{}, nil
}

func (c *consentDriver) AcceptLogoutRequest(ctx context.Context, challenge string) (*flow.LogoutRequest, error) {
	return &flow.LogoutRequest{}, nil
}

func (c *consentDriver) RejectLogoutRequest(ctx context.Context, challenge string) error {
	return nil
}

func (c *consentDriver) VerifyAndInvalidateLogoutRequest(ctx context.Context, verifier string) (*flow.LogoutRequest, error) {
	return &flow.LogoutRequest{}, nil
}

func (c *consentDriver) FlushInactiveLoginConsentRequests(ctx context.Context, notAfter time.Time, limit int, batchSize int) error {
	requestMaxExpire := time.Now().Add(-c.r.Config().ConsentRequestMaxAge(ctx))
	if requestMaxExpire.Before(notAfter) {
		notAfter = requestMaxExpire
	}

	tx := c.db.Model(&Flow{}).Where("requested_at < ?", notAfter.UTC()).Limit(limit).Delete(&Flow{})
	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

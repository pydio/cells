package oauth

import (
	"context"
	"time"

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

type Flow flow.Flow

func (c *consentDriver) AutoMigrate() {
	c.db.AutoMigrate(&Flow{})
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

	if tx := c.db.Model(Flow{}).Omit("Client").Create(f); tx.Error != nil {
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

func (*Flow) TableName(namer2 schema.Namer) string {
	return namer2.TableName("flow")
}

func (f *Flow) BeforeSave(_ *gorm.DB) error {
	if f.Client != nil {
		f.ClientID = f.Client.GetID()
	}
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

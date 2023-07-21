package auth

import (
	"context"
	"github.com/ory/hydra/v2/client"
	"github.com/ory/hydra/v2/consent"
	"github.com/ory/hydra/v2/flow"
	"github.com/ory/x/sqlxx"
	"gorm.io/gorm"
	"time"
)

type consentDriver struct {
	db *gorm.DB

	r Registry
}

type Flow flow.Flow

func (c *consentDriver) AutoMigrate() {
	c.db.AutoMigrate(&Flow{})
}

func (c *consentDriver) CreateConsentRequest(ctx context.Context, req *consent.OAuth2ConsentRequest) error {
	var f *Flow

	if tx := c.db.First(&f, "id=?", req.LoginChallenge); tx.Error != nil {
		return tx.Error
	}

	if cli, err := c.r.ClientManager().GetConcreteClient(ctx, f.ClientID); err != nil {
		return err
	} else {
		f.Client = cli
	}

	if tx := c.db.Model(f).Omit("Client").Updates(map[string]interface{}{
		"state":                flow.FlowStateConsentInitialized,
		"consent_challenge_id": req.ID,
		"consent_skip":         req.Skip,
		"consent_verifier":     req.Verifier,
		"consent_csrf":         req.CSRF,
	}); tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (c *consentDriver) GetConsentRequest(ctx context.Context, challenge string) (req *consent.OAuth2ConsentRequest, err error) {
	var f *Flow

	if tx := c.db.First(&f, "consent_challenge_id=?", challenge); tx.Error != nil {
		return nil, tx.Error
	}

	if cli, err := c.r.ClientManager().GetConcreteClient(ctx, f.ClientID); err != nil {
		return nil, err
	} else {
		f.Client = cli
	}

	return ((*flow.Flow)(f)).GetConsentRequest(), nil
}

func (c *consentDriver) HandleConsentRequest(ctx context.Context, r *consent.AcceptOAuth2ConsentRequest) (*consent.OAuth2ConsentRequest, error) {
	var f *Flow

	if tx := c.db.First(&f, "consent_challenge_id=?", r.ID); tx.Error != nil {
		return nil, tx.Error
	}

	if cli, err := c.r.ClientManager().GetConcreteClient(ctx, f.ClientID); err != nil {
		return nil, err
	} else {
		f.Client = cli
	}

	if err := ((*flow.Flow)(f)).HandleConsentRequest(r); err != nil {
		return nil, err
	}

	if tx := c.db.Omit("Client").Save(&f); tx.Error != nil {
		return nil, tx.Error
	}

	return ((*flow.Flow)(f)).GetConsentRequest(), nil
}

func (c *consentDriver) RevokeSubjectConsentSession(ctx context.Context, user string) error {
	return nil
}

func (c *consentDriver) RevokeSubjectClientConsentSession(ctx context.Context, user, client string) error {
	return nil
}

func (c *consentDriver) VerifyAndInvalidateConsentRequest(ctx context.Context, verifier string) (*consent.AcceptOAuth2ConsentRequest, error) {
	var f *Flow

	tx := c.db.First(&f, "consent_verifier=?", verifier)
	if tx.Error != nil {
		return nil, tx.Error
	}

	if cli, err := c.r.ClientManager().GetConcreteClient(ctx, f.ClientID); err != nil {
		return nil, err
	} else {
		f.Client = cli
	}

	if err := ((*flow.Flow)(f)).InvalidateConsentRequest(); err != nil {
		return nil, err
	}

	if tx := c.db.Omit("Client").Save(f); tx.Error != nil {
		return nil, tx.Error
	}

	return ((*flow.Flow)(f)).GetHandledConsentRequest(), nil
}

func (c *consentDriver) FindGrantedAndRememberedConsentRequests(ctx context.Context, client, user string) ([]consent.AcceptOAuth2ConsentRequest, error) {
	return []consent.AcceptOAuth2ConsentRequest{}, nil
}

func (c *consentDriver) FindSubjectsGrantedConsentRequests(ctx context.Context, user string, limit, offset int) ([]consent.AcceptOAuth2ConsentRequest, error) {
	return []consent.AcceptOAuth2ConsentRequest{}, nil
}

func (c *consentDriver) FindSubjectsSessionGrantedConsentRequests(ctx context.Context, user, sid string, limit, offset int) ([]consent.AcceptOAuth2ConsentRequest, error) {
	return []consent.AcceptOAuth2ConsentRequest{}, nil
}

func (c *consentDriver) CountSubjectsGrantedConsentRequests(ctx context.Context, user string) (int, error) {
	return 0, nil
}

// Cookie management
func (c *consentDriver) GetRememberedLoginSession(ctx context.Context, id string) (*consent.LoginSession, error) {
	return &consent.LoginSession{}, nil
}
func (c *consentDriver) CreateLoginSession(ctx context.Context, session *consent.LoginSession) error {
	//nid := c.r.NetworkID(ctx)
	//if nid == uuid.Nil {
	//	return errorsx.WithStack(x.ErrNotFound)
	//}
	//session.NID = nid

	return nil
}
func (c *consentDriver) DeleteLoginSession(ctx context.Context, id string) error {
	return nil
}
func (c *consentDriver) RevokeSubjectLoginSession(ctx context.Context, user string) error {
	return nil
}
func (c *consentDriver) ConfirmLoginSession(ctx context.Context, id string, authTime time.Time, subject string, remember bool) error {
	return nil
}

func (c *consentDriver) CreateLoginRequest(ctx context.Context, req *consent.LoginRequest) error {
	f := flow.NewFlow(req)

	tx := c.db.Omit("Client").Create((*Flow)(f))

	return tx.Error
}

func (c *consentDriver) GetLoginRequest(ctx context.Context, challenge string) (*consent.LoginRequest, error) {
	var f *Flow

	tx := c.db.First(&f, "id=?", challenge)
	if tx.Error != nil {
		return nil, tx.Error
	}

	if cli, err := c.r.ClientManager().GetConcreteClient(ctx, f.ClientID); err != nil {
		return nil, err
	} else {
		f.Client = cli
	}

	return ((*flow.Flow)(f)).GetLoginRequest(), nil
}

func (c *consentDriver) HandleLoginRequest(ctx context.Context, challenge string, r *consent.HandledLoginRequest) (*consent.LoginRequest, error) {
	var f *Flow

	if tx := c.db.First(&f, "id=?", challenge); tx.Error != nil {
		return nil, tx.Error
	}

	if cli, err := c.r.ClientManager().GetConcreteClient(ctx, f.ClientID); err != nil {
		return nil, err
	} else {
		f.Client = cli
	}

	if err := ((*flow.Flow)(f)).HandleLoginRequest(r); err != nil {
		return nil, err
	}

	if tx := c.db.Omit("Client").Save(f); tx.Error != nil {
		return nil, tx.Error
	}

	return ((*flow.Flow)(f)).GetLoginRequest(), nil
}

func (c *consentDriver) VerifyAndInvalidateLoginRequest(ctx context.Context, verifier string) (*consent.HandledLoginRequest, error) {
	var f *Flow

	tx := c.db.First(&f, "login_verifier=?", verifier)
	if tx.Error != nil {
		return nil, tx.Error
	}

	if cli, err := c.r.ClientManager().GetConcreteClient(ctx, f.ClientID); err != nil {
		return nil, err
	} else {
		f.Client = cli
	}

	if err := ((*flow.Flow)(f)).InvalidateLoginRequest(); err != nil {
		return nil, err
	}

	if tx := c.db.Omit("Client").Save(f); tx.Error != nil {
		return nil, tx.Error
	}

	var d consent.HandledLoginRequest
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

func (c *consentDriver) CreateLogoutRequest(ctx context.Context, request *consent.LogoutRequest) error {
	//f := flow.NewFlow(request)
	//
	//tx := c.db.Omit("Client").Create(f)
	//if tx.Error != nil {
	//	return tx.Error
	//}
	return nil
}

func (c *consentDriver) GetLogoutRequest(ctx context.Context, challenge string) (*consent.LogoutRequest, error) {
	return &consent.LogoutRequest{}, nil
}

func (c *consentDriver) AcceptLogoutRequest(ctx context.Context, challenge string) (*consent.LogoutRequest, error) {
	return &consent.LogoutRequest{}, nil
}

func (c *consentDriver) RejectLogoutRequest(ctx context.Context, challenge string) error {
	return nil
}

func (c *consentDriver) VerifyAndInvalidateLogoutRequest(ctx context.Context, verifier string) (*consent.LogoutRequest, error) {
	return &consent.LogoutRequest{}, nil
}

func (c *consentDriver) FlushInactiveLoginConsentRequests(ctx context.Context, notAfter time.Time, limit int, batchSize int) error {
	requestMaxExpire := time.Now().Add(-c.r.Config().ConsentRequestMaxAge(ctx))
	if requestMaxExpire.Before(notAfter) {
		notAfter = requestMaxExpire
	}

	tx := c.db.Model(&Flow{}).Where("requested_at < ?", notAfter).Limit(limit).Delete(&Flow{})
	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (_ Flow) TableName() string {
	return "hydra_oauth2_flow"
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

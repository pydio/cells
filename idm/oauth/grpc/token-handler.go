package grpc

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"io"
	"sync"
	"time"

	"github.com/ory/fosite"
	"github.com/ory/fosite/token/hmac"
	"github.com/ory/fosite/token/jwt"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/auth"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/service/errors"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/permissions"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/idm/oauth"
)

var tokensKey []byte

type PATScopeClaims struct {
	Scopes []string `json:"scopes"`
}

type PATHandler struct {
	auth.UnimplementedAuthTokenPrunerServer
	auth.UnimplementedAuthTokenVerifierServer
	auth.UnimplementedPersonalAccessTokenServiceServer

	config fosite.Configurator
}

func NewPATHandler(config fosite.Configurator) *PATHandler {
	return &PATHandler{
		config: config,
	}
}

func (p *PATHandler) getDao(ctx context.Context) (oauth.DAO, error) {
	return manager.Resolve[oauth.DAO](ctx)
}

func (p *PATHandler) getStrategy() *hmac.HMACStrategy {
	return &hmac.HMACStrategy{
		Config: p.config,
		Mutex:  sync.Mutex{},
	}
}

func (p *PATHandler) getKey() []byte {

	if len(tokensKey) > 0 {
		return tokensKey
	}

	cVal := config.Get("defaults", "personalTokens", "secureKey")
	if cVal.String() == "" {
		tokensKey = p.generateRandomKey(32)
		strKey := base64.StdEncoding.EncodeToString(tokensKey)
		cVal.Set(strKey)
		config.Save(common.PydioSystemUsername, "Creating random key for personal tokens service")
	} else if t, e := base64.StdEncoding.DecodeString(cVal.String()); e == nil {
		tokensKey = t
	} else {
		log.Logger(context.Background()).Error("Could not read generated key for personal tokens!", zap.Error(e))
	}
	return tokensKey
}

func (p *PATHandler) Verify(ctx context.Context, request *auth.VerifyTokenRequest) (*auth.VerifyTokenResponse, error) {
	dao, err := p.getDao(ctx)
	if err != nil {
		return nil, err
	}

	if err := p.getStrategy().Validate(ctx, request.Token); err != nil {
		return nil, errors.Unauthorized("token.invalid", "Cannot validate token")
	}

	pat, err := dao.Load(request.Token)
	if err != nil {
		return nil, errors.Unauthorized("token.not.found", "Cannot find corresponding Personal Access Token")
	}

	// Check Expiration Date
	if time.Unix(pat.ExpiresAt, 0).Before(time.Now()) {
		return nil, errors.Unauthorized("token.expired", "Personal token is expired")
	}

	if pat.AutoRefreshWindow > 0 {
		// Recompute expire date
		pat.ExpiresAt = time.Now().Add(time.Duration(pat.AutoRefreshWindow) * time.Second).Unix()
		if er := dao.Store(request.Token, pat, true); er != nil {
			return nil, errors.BadRequest("internal.error", "Cannot store updated token "+er.Error())
		}
	}

	cl := jwt.IDTokenClaims{
		Subject:   pat.UserUuid,
		Issuer:    "local",
		ExpiresAt: time.Unix(pat.ExpiresAt, 0),
		Audience:  []string{common.ServiceGrpcNamespace_ + common.ServiceToken},
	}

	if len(pat.Scopes) > 0 {
		cl.Extra = map[string]interface{}{
			"scopes": pat.Scopes,
		}
	}

	m, _ := json.Marshal(cl)

	return &auth.VerifyTokenResponse{
		Success: true,
		Data:    m,
	}, nil
}

func (p *PATHandler) Generate(ctx context.Context, request *auth.PatGenerateRequest) (*auth.PatGenerateResponse, error) {
	dao, err := p.getDao(ctx)
	if err != nil {
		return nil, err
	}

	token := &auth.PersonalAccessToken{
		Uuid:              uuid.New(),
		Type:              request.Type,
		Label:             request.Label,
		UserUuid:          request.UserUuid,
		UserLogin:         request.UserLogin,
		Scopes:            request.Scopes,
		AutoRefreshWindow: request.AutoRefreshWindow,
		ExpiresAt:         request.ExpiresAt,
	}

	if request.AutoRefreshWindow > 0 {
		request.ExpiresAt = time.Now().Add(time.Duration(request.AutoRefreshWindow) * time.Second).Unix()
		token.ExpiresAt = request.ExpiresAt
	} else if request.ExpiresAt > 0 {
		token.ExpiresAt = request.ExpiresAt
	} else {
		return nil, errors.BadRequest("missing.parameters", "Please provide one of ExpiresAt or AutoRefreshWindow")
	}

	token.CreatedAt = time.Now().Unix()
	if uName, _ := permissions.FindUserNameInContext(ctx); uName != "" {
		token.CreatedBy = uName
	}

	accessToken, _, err := p.getStrategy().Generate(ctx)
	if err != nil {
		return nil, err
	}

	if err := dao.Store(accessToken, token, false); err != nil {
		return nil, err
	}

	return &auth.PatGenerateResponse{
		TokenUuid:   token.Uuid,
		AccessToken: accessToken,
	}, nil
}

func (p *PATHandler) Revoke(ctx context.Context, request *auth.PatRevokeRequest) (*auth.PatRevokeResponse, error) {
	dao, err := p.getDao(ctx)
	if err != nil {
		return nil, err
	}
	if err := dao.Delete(request.GetUuid()); err != nil {
		return nil, err
	}

	return &auth.PatRevokeResponse{
		Success: true,
	}, nil
}

func (p *PATHandler) List(ctx context.Context, request *auth.PatListRequest) (*auth.PatListResponse, error) {
	dao, err := p.getDao(ctx)
	if err != nil {
		return nil, err
	}

	tt, err := dao.List(request.Type, request.ByUserLogin)
	if err != nil {
		return nil, err
	}

	return &auth.PatListResponse{
		Tokens: tt,
	}, nil
}

func (p *PATHandler) PruneTokens(ctx context.Context, request *auth.PruneTokensRequest) (*auth.PruneTokensResponse, error) {
	dao, err := p.getDao(ctx)
	if err != nil {
		return nil, err
	}

	i, err := dao.PruneExpired()
	if err != nil {
		return nil, err
	}

	return &auth.PruneTokensResponse{
		Count: int32(i),
	}, nil
}

func (p *PATHandler) generateRandomKey(length int) []byte {
	k := make([]byte, length)
	if _, err := io.ReadFull(rand.Reader, k); err != nil {
		return nil
	}
	return k
}

package grpc

import (
	"context"
	"crypto/rand"
	"crypto/sha512"
	"encoding/base64"
	"hash"
	"io"
	"sync"
	"time"

	"github.com/ory/fosite/token/hmac"
	"github.com/ory/fosite/token/jwt"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/auth"
	"github.com/pydio/cells/v5/common/runtime/manager"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/std"
	"github.com/pydio/cells/v5/common/utils/uuid"
	"github.com/pydio/cells/v5/idm/oauth"
)

var tokensKey []byte

type PATScopeClaims struct {
	Scopes []string `json:"scopes"`
}

type PATHandler struct {
	auth.UnimplementedAuthTokenPrunerServer
	auth.UnimplementedAuthTokenVerifierServer
	auth.UnimplementedPersonalAccessTokenServiceServer

	config hmac.HMACStrategyConfigurator
}

type configProvider struct{}

func (c *configProvider) GetTokenEntropy(ctx context.Context) int {
	//TODO - Recheck expected value
	return 32
}

func (c *configProvider) GetGlobalSecret(ctx context.Context) ([]byte, error) {
	if len(tokensKey) > 0 {
		return tokensKey, nil
	}

	cVal := config.Get(ctx, "defaults", "personalTokens", "secureKey")
	if cVal.String() == "" {
		tokensKey = c.generateRandomKey(32)
		strKey := base64.StdEncoding.EncodeToString(tokensKey)
		_ = cVal.Set(strKey)
		_ = config.Save(ctx, common.PydioSystemUsername, "Creating random key for personal tokens service")
	} else if t, e := base64.StdEncoding.DecodeString(cVal.String()); e == nil {
		tokensKey = t
	} else {
		return nil, errors.WithMessage(errors.UnmarshalError, "Could not read generated key for personal tokens!")
	}
	return tokensKey, nil
}

func (c *configProvider) generateRandomKey(length int) []byte {
	k := make([]byte, length)
	if _, err := io.ReadFull(rand.Reader, k); err != nil {
		return nil
	}
	return k
}

func (c *configProvider) GetRotatedGlobalSecrets(ctx context.Context) ([][]byte, error) {
	//TODO implement me ?
	return [][]byte{}, nil
}

func (c *configProvider) GetHMACHasher(ctx context.Context) func() hash.Hash {
	//TODO - Recheck expected value
	return sha512.New512_256
}

func (p *PATHandler) getDao(ctx context.Context) (oauth.PatDAO, error) {
	return manager.Resolve[oauth.PatDAO](ctx)
}

func (p *PATHandler) getStrategy() *hmac.HMACStrategy {
	return &hmac.HMACStrategy{
		Config: &configProvider{},
		Mutex:  sync.Mutex{},
	}
}

func (p *PATHandler) Verify(ctx context.Context, request *auth.VerifyTokenRequest) (*auth.VerifyTokenResponse, error) {
	dao, err := p.getDao(ctx)
	if err != nil {
		return nil, err
	}

	if er := p.getStrategy().Validate(ctx, request.Token); er != nil {
		return nil, errors.Tag(er, errors.InvalidIDToken)
	}

	pat, err := dao.Load(request.Token)
	if err != nil {
		return nil, errors.Tag(err, errors.InvalidIDToken)
	}

	// Check Expiration Date
	if time.Unix(pat.ExpiresAt, 0).Before(time.Now()) {
		return nil, errors.Tag(err, errors.ExpiredIDToken)
	}

	if pat.AutoRefreshWindow > 0 {
		// Recompute expire date
		pat.ExpiresAt = time.Now().Add(time.Duration(pat.AutoRefreshWindow) * time.Second).Unix()
		if er := dao.Store(request.Token, pat, true); er != nil {
			return nil, errors.Tag(er, errors.StatusInternalServerError)
		}
	}

	cl := jwt.IDTokenClaims{
		Subject:   pat.UserUuid,
		Issuer:    "local",
		ExpiresAt: time.Unix(pat.ExpiresAt, 0),
		Audience:  []string{common.ServiceGrpcNamespace_ + common.ServiceToken},
	}
	if len(pat.Scopes) > 0 || pat.SecretPair != "" {
		cl.Extra = map[string]interface{}{}
		if len(pat.Scopes) > 0 {
			cl.Extra["scopes"] = pat.Scopes
		}
		if len(pat.SecretPair) > 0 {
			cl.Extra["secret_pair"] = pat.SecretPair
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
		RevocationKey:     request.RevocationKey,
	}

	if request.AutoRefreshWindow > 0 {
		request.ExpiresAt = time.Now().Add(time.Duration(request.AutoRefreshWindow) * time.Second).Unix()
		token.ExpiresAt = request.ExpiresAt
	} else if request.ExpiresAt > 0 {
		token.ExpiresAt = request.ExpiresAt
	} else {
		return nil, errors.WithMessage(errors.InvalidParameters, "Please provide one of ExpiresAt or AutoRefreshWindow")
	}

	token.CreatedAt = time.Now().Unix()
	if uName := claim.UserNameFromContext(ctx); uName != "" {
		token.CreatedBy = uName
	}

	accessToken, _, err := p.getStrategy().Generate(ctx)
	if err != nil {
		return nil, err
	}
	if request.GenerateSecretPair {
		token.SecretPair = std.Randkey(24)
	}

	if err := dao.Store(accessToken, token, false); err != nil {
		return nil, err
	}

	return &auth.PatGenerateResponse{
		AccessToken: accessToken,
		TokenUuid:   token.Uuid,
		SecretPair:  token.SecretPair,
	}, nil
}

func (p *PATHandler) Revoke(ctx context.Context, request *auth.PatRevokeRequest) (*auth.PatRevokeResponse, error) {
	// TODO - REVOKE BY RevocationKey
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

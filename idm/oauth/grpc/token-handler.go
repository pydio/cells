package grpc

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"io"
	"time"

	"github.com/micro/go-micro/errors"
	jwt2 "github.com/ory/fosite/token/jwt"
	"github.com/pborman/uuid"
	"go.uber.org/zap"
	"gopkg.in/square/go-jose.v2"
	"gopkg.in/square/go-jose.v2/jwt"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/auth"
	servicecontext "github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/cells/idm/oauth"
	json "github.com/pydio/cells/x/jsonx"
)

var tokensKey []byte

type PatScopeClaims struct {
	Scopes []string `json:"scopes"`
}

type PatHandler struct {
	memDao oauth.PatDao
}

func (p *PatHandler) getDao(ctx context.Context) oauth.PatDao {
	if p.memDao == nil {
		p.memDao = oauth.NewMemDao()
	}
	return p.memDao
}

func (p *PatHandler) getKey(ctx context.Context) []byte {

	if len(tokensKey) > 0 {
		return tokensKey
	}

	conf := servicecontext.GetConfig(ctx)
	cVal := conf.Val("personalTokensKey")

	if cVal.String() == "" {
		tokensKey = p.generateRandomKey(32)
		strKey := base64.StdEncoding.EncodeToString(tokensKey)
		cVal.Set(strKey)
		config.Save(common.PydioSystemUsername, "Creating random key for personal tokens service")
	} else if t, e := base64.StdEncoding.DecodeString(cVal.String()); e == nil {
		tokensKey = t
	} else {
		log.Logger(ctx).Error("Could not read generated key for personal tokens!", zap.Error(e))
	}
	return tokensKey
}

func (p *PatHandler) Verify(ctx context.Context, request *auth.VerifyTokenRequest, response *auth.VerifyTokenResponse) error {
	dao := p.getDao(ctx)
	token, e := dao.Load(request.Token)
	if e != nil {
		return errors.Unauthorized("token.not.found", "Cannot find corresponding Personal Access Token")
	}
	// Check Expiration Date
	if time.Unix(token.ExpiresAt, 0).Before(time.Now()) {
		return errors.Unauthorized("token.expired", "Personal token is expired")
	}
	if token.AutoRefreshWindow > 0 {
		// Recompute expire date
		token.ExpiresAt = time.Now().Add(time.Duration(token.AutoRefreshWindow) * time.Second).Unix()
		if er := dao.Store(token); er != nil {
			return errors.BadRequest("internal.error", "Cannot store updated token")
		}
	}
	tok, _ := jwt.ParseSigned(request.Token)
	var coreClaims jwt.Claims
	e = tok.Claims(p.getKey(ctx), &coreClaims)
	if e != nil {
		return e
	}
	cl := jwt2.IDTokenClaims{
		Subject:   coreClaims.Subject,
		Issuer:    coreClaims.Issuer,
		ExpiresAt: time.Unix(token.ExpiresAt, 0),
		Audience:  coreClaims.Audience,
	}
	if len(token.Scopes) > 0 {
		cl.Extra = map[string]interface{}{
			"scopes": token.Scopes,
		}
	}
	m, _ := json.Marshal(cl)
	response.Success = true
	response.Data = m
	return nil
}

func (p *PatHandler) Generate(ctx context.Context, request *auth.PatGenerateRequest, response *auth.PatGenerateResponse) error {
	dao := p.getDao(ctx)
	token := &auth.PersonalAccessToken{
		Uuid:              uuid.New(),
		Type:              request.Type,
		Label:             request.Label,
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
		return errors.BadRequest("missing.parameters", "Please provide one of ExpiresAt or AutoRefreshWindow")
	}
	token.CreatedAt = time.Now().Unix()
	if uName, _ := permissions.FindUserNameInContext(ctx); uName != "" {
		token.CreatedBy = uName
	}
	idToken, err := p.createToken(request, p.getKey(ctx))
	if err != nil {
		return err
	}
	token.IDToken = idToken
	if err := dao.Store(token); err != nil {
		return err
	}
	response.IDToken = token.IDToken
	return nil
}

func (p *PatHandler) Revoke(ctx context.Context, request *auth.PatRevokeRequest, response *auth.PatRevokeResponse) error {
	dao := p.getDao(ctx)
	return dao.Delete(request.IDToken)
}

func (p *PatHandler) List(ctx context.Context, request *auth.PatListRequest, response *auth.PatListResponse) error {
	dao := p.getDao(ctx)
	tt, er := dao.List(request.Type, request.ByUserLogin)
	if er != nil {
		return nil
	}
	response.Tokens = tt
	return nil
}

func (p *PatHandler) createToken(request *auth.PatGenerateRequest, key []byte) (string, error) {

	sig, err := jose.NewSigner(jose.SigningKey{Algorithm: jose.HS256, Key: key}, (&jose.SignerOptions{}).WithType("JWT").WithHeader("nonce", uuid.New()))
	if err != nil {
		return "", err
	}

	cl := jwt.Claims{
		Subject:  request.UserUuid,
		Issuer:   request.Issuer,
		Audience: jwt.Audience{common.ServiceGrpcNamespace_ + common.ServiceToken},
		IssuedAt: jwt.NewNumericDate(time.Now()),
	}
	if request.AutoRefreshWindow == 0 {
		cl.Expiry = jwt.NewNumericDate(time.Unix(request.ExpiresAt, 0))
	}

	builder := jwt.Signed(sig).Claims(cl)
	if len(request.Scopes) > 0 {
		privateCl := &PatScopeClaims{Scopes: request.Scopes}
		builder = builder.Claims(privateCl)
	}

	return builder.CompactSerialize()

}

func (p *PatHandler) generateRandomKey(length int) []byte {
	k := make([]byte, length)
	if _, err := io.ReadFull(rand.Reader, k); err != nil {
		return nil
	}
	return k
}

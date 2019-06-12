package web

import (
	"crypto/rsa"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/ory/fosite"
	"github.com/ory/fosite/compose"
	"github.com/ory/fosite/handler/openid"
	"github.com/ory/fosite/storage"
	"github.com/ory/fosite/token/jwt"
	"github.com/ory/hydra/jwk"
	"go.uber.org/zap"
	jose "gopkg.in/square/go-jose.v2"

	commonauth "github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
)

const oidcid = "pydiooidc"

<<<<<<< HEAD
// Configure an OpenID Connect aware OAuth2 client.
var oauth2Config oauth2.Config

func auth(inner http.HandlerFunc) http.HandlerFunc {

	jwtVerifier := commonauth.DefaultJWTVerifier()

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		ctx := r.Context()

		fmt.Println(r.Header)
		if bearer := r.URL.Query().Get("access_token"); len(bearer) > 0 {
			var err error
			var claims claim.Claims
			ctx, claims, err = jwtVerifier.Verify(ctx, bearer)
			if err == nil && claims.Name != "" {
				r = r.WithContext(ctx)
				inner.ServeHTTP(w, r)
				return
			}

		}

		http.Redirect(w, r, "/authorize?"+r.URL.RawQuery, 301)
	})
}

// A session is passed from the `/auth` to the `/token` endpoint. You probably want to store data like: "Who made the request",
// "What organization does that person belong to" and so on.
// For our use case, the session will meet the requirements imposed by JWT access tokens, HMAC access tokens and OpenID Connect
// ID Tokens plus a custom field

// newSession is a helper function for creating a new session. This may look like a lot of code but since we are
// setting up multiple strategies it is a bit longer.
// Usually, you could do:
//
//  session = new(fosite.DefaultSession)
func newSession(user string) *openid.DefaultSession {
	return &openid.DefaultSession{
		Claims: &jwt.IDTokenClaims{
			Issuer:      "http://192.168.1.92:8080/a/config/discovery",
			Subject:     user,
			Audience:    []string{"https://my-client.my-application.com"},
			ExpiresAt:   time.Now().Add(time.Hour * 6),
			IssuedAt:    time.Now(),
			RequestedAt: time.Now(),
			AuthTime:    time.Now(),
		},
		Headers: &jwt.Headers{
			Extra: map[string]interface{}{
				"kid": jwk.Ider("public", "test"),
			},
		},
	}
}

func mustRSAKey() *rsa.PrivateKey {
	key, err := rsa.GenerateKey(rand.Reader, 1024)
	if err != nil {
		panic(err)
	}
	return key
}
=======
var (
	jwks           *jose.JSONWebKeySet
	oauth2Provider fosite.OAuth2Provider
)
>>>>>>> 7797d4e2... Cleanup

func init() {
	var err error

	generator := jwk.RS256Generator{KeyLength: 32}

	jwks, err = generator.Generate(oidcid, "sig")
	if err != nil {
		log.Fatal("Unable to generate signature", zap.Error(err))
	}

	externalURL := config.Get("defaults", "url").String("")

	// This is an exemplary storage instance. We will add a client and a user to it so we can use these later on.
	store := storage.NewMemoryStore()
	store.Clients[oidcid] = &fosite.DefaultClient{
		ID:            oidcid,
		Secret:        []byte(`$2a$10$IxMdI6d.LIRZPpSfEwNoeu4rY3FhDREsxFJXikcgdRRAStxUlsuEO`),
		RedirectURIs:  []string{externalURL + "/auth/dex/callback"},
		ResponseTypes: []string{"id_token", "code", "token"},
		GrantTypes:    []string{"implicit", "refresh_token", "authorization_code", "password", "client_credentials"},
		Scopes:        []string{"openid", "profile", "email"},
	}

	config := &compose.Config{
		AccessTokenLifespan: time.Minute * 30,
		IDTokenLifespan:     time.Minute * 30,
		IDTokenIssuer:       oidcid,
		RedirectSecureChecker: func(*url.URL) bool {
			return true
		},
	}

	// Because we are using oauth2 and open connect id, we use this little helper to combine the two in one
	// variable.
	strat := compose.CommonStrategy{
		CoreStrategy:               compose.NewOAuth2HMACStrategy(config, []byte("some-super-cool-secret-that-nobody-knows"), nil),
		OpenIDConnectTokenStrategy: compose.NewOpenIDConnectStrategy(config, jwks.Key(jwk.Ider("private", oidcid))[0].Key.(*rsa.PrivateKey)),
	}

	oauth2Provider = compose.Compose(
		config,
		store,
		strat,
		nil,

		// enabled handlers
		compose.OAuth2AuthorizeExplicitFactory,
		compose.OAuth2AuthorizeImplicitFactory,
		compose.OAuth2ClientCredentialsGrantFactory,
		compose.OAuth2RefreshTokenGrantFactory,
		compose.OAuth2ResourceOwnerPasswordCredentialsFactory,

		compose.OAuth2TokenRevocationFactory,
		compose.OAuth2TokenIntrospectionFactory,

		// be aware that open id connect factories need to be added after oauth2 factories to work properly.
		compose.OpenIDConnectExplicitFactory,
		compose.OpenIDConnectImplicitFactory,
		compose.OpenIDConnectHybridFactory,
		compose.OpenIDConnectRefreshFactory,
	)
}

// The authorize endpoint is usually at "https://mydomain.com/oauth2/auth".
func authorizeHandlerFunc(rw http.ResponseWriter, req *http.Request) {
	ctx := fosite.NewContext()

	// Let's create an AuthorizeRequest object!
	// It will analyze the request and extract important information like scopes, response type and others.
	ar, err := oauth2Provider.NewAuthorizeRequest(ctx, req)
	if err != nil {
		oauth2Provider.WriteAuthorizeError(rw, ar, err)
		return
	}

	// You have now access to authorizeRequest, Code ResponseTypes, Scopes ...
	var requestedScopes string
	for _, this := range ar.GetRequestedScopes() {
		requestedScopes += fmt.Sprintf(`<li><input type="checkbox" name="scopes" value="%s">%s</li>`, this, this)
	}

	// Normally, this would be the place where you would check if the user is logged in and gives his consent.
	// We're simplifying things and just checking if the request includes a valid username and password
	req.ParseForm()
	if req.PostForm.Get("username") == "" {
		http.Redirect(rw, req, "/authorize?"+req.URL.RawQuery, 301)

		return
	}

	// let's see what scopes the user gave consent to
	for _, scope := range req.PostForm["scopes"] {
		ar.GrantScope(scope)
	}

	claims, ok := req.Context().Value(claim.ContextKey).(claim.Claims)
	if !ok {
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Now that the user is authorized, we set up a session:
	mySessionData := newSession(claims.Name)
	mySessionData.Username = claims.Name
	mySessionData.Claims.Add("name", claims.Name)
	mySessionData.Claims.Add("email", claims.Email)

	// Now we need to get a response. This is the place where the AuthorizeEndpointHandlers kick in and start processing the request.
	// NewAuthorizeResponse is capable of running multiple response type handlers which in turn enables this library
	// to support open id connect.
	response, err := oauth2Provider.NewAuthorizeResponse(ctx, ar, mySessionData)

	// Catch any errors, e.g.:
	// * unknown client
	// * invalid redirect
	// * ...
	if err != nil {
		oauth2Provider.WriteAuthorizeError(rw, ar, err)
		return
	}

	fmt.Println("Authorize response")

	// Last but not least, send the response!
	oauth2Provider.WriteAuthorizeResponse(rw, ar, response)
}

// The token endpoint is usually at "https://mydomain.com/oauth2/token"
func tokenHandlerFunc(rw http.ResponseWriter, req *http.Request) {
	// This context will be passed to all methods.
	ctx := fosite.NewContext()

	// Create an empty session object which will be passed to the request handlers
	mySessionData := newSession("")

	// This will create an access request object and iterate through the registered TokenEndpointHandlers to validate the request.
	accessRequest, err := oauth2Provider.NewAccessRequest(ctx, req, mySessionData)

	// Catch any errors, e.g.:
	// * unknown client
	// * invalid redirect
	// * ...
	if err != nil {
		oauth2Provider.WriteAccessError(rw, accessRequest, err)
		return
	}

	// If this is a client_credentials grant, grant all scopes the client is allowed to perform.
	if accessRequest.GetGrantTypes().Exact("client_credentials") {
		for _, scope := range accessRequest.GetRequestedScopes() {
			if fosite.HierarchicScopeStrategy(accessRequest.GetClient().GetScopes(), scope) {
				accessRequest.GrantScope(scope)
			}
		}
	}

	// Next we create a response for the access request. Again, we iterate through the TokenEndpointHandlers
	// and aggregate the result in response.
	response, err := oauth2Provider.NewAccessResponse(ctx, accessRequest)
	if err != nil {
		oauth2Provider.WriteAccessError(rw, accessRequest, err)
		return
	}

	// All done, send the response.
	oauth2Provider.WriteAccessResponse(rw, accessRequest, response)

	// The client now has a valid access token
}

func jwksHandlerFunc(rw http.ResponseWriter, req *http.Request) {
	js, err := json.Marshal(jwks)
	if err != nil {
		rw.Header().Set("Content-Type", "application/json")
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	rw.Write(js)
}

func auth(inner http.HandlerFunc) http.HandlerFunc {

	jwtVerifier := commonauth.DefaultJWTVerifier()

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		if bearer := r.URL.Query().Get("access_token"); len(bearer) > 0 {
			var err error
			var claims claim.Claims
			ctx, claims, err = jwtVerifier.Verify(ctx, bearer)
			if err == nil && claims.Name != "" {
				r = r.WithContext(ctx)
				inner.ServeHTTP(w, r)
				return
			}
		}

		http.Redirect(w, r, "/authorize?"+r.URL.RawQuery, 301)
	})
}

// A session is passed from the `/auth` to the `/token` endpoint. You probably want to store data like: "Who made the request",
// "What organization does that person belong to" and so on.
// For our use case, the session will meet the requirements imposed by JWT access tokens, HMAC access tokens and OpenID Connect
// ID Tokens plus a custom field

// newSession is a helper function for creating a new session. This may look like a lot of code but since we are
// setting up multiple strategies it is a bit longer.
// Usually, you could do:
//
//  session = new(fosite.DefaultSession)
func newSession(user string) *openid.DefaultSession {
	externalURL := config.Get("defaults", "url").String("")

	return &openid.DefaultSession{
		Claims: &jwt.IDTokenClaims{
			Issuer:      externalURL + "/a/config/discovery",
			Subject:     user,
			ExpiresAt:   time.Now().Add(time.Hour * 6),
			IssuedAt:    time.Now(),
			RequestedAt: time.Now(),
			AuthTime:    time.Now(),
		},
		Headers: &jwt.Headers{
			Extra: map[string]interface{}{
				"kid": jwk.Ider("public", oidcid),
			},
		},
	}
}

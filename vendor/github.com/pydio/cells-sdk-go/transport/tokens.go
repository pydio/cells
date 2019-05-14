package transport

import (
	"crypto/md5"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	cache "github.com/patrickmn/go-cache"

	cells_sdk "github.com/pydio/cells-sdk-go"
)

type TokenStore struct {
	internalCache *cache.Cache
}

func NewTokenStore() *TokenStore {
	t := &TokenStore{
		internalCache: cache.New(20*time.Minute, 10*time.Minute),
	}
	return t
}

func (t *TokenStore) Store(c *cells_sdk.SdkConfig, token string, expiry time.Duration) {
	//fmt.Println("[Auth] Storing token with expiration ", expiry)
	t.internalCache.Set(t.computeKey(c), token, expiry)
}

func (t *TokenStore) TokenFor(c *cells_sdk.SdkConfig) string {

	if token, ok := t.internalCache.Get(t.computeKey(c)); ok {
		return token.(string)
	}
	return ""

}

func (t *TokenStore) computeKey(c *cells_sdk.SdkConfig) string {
	// Is this relly necessary or rather security theater?
	// using a generic password causes issues when testing wrong password access.
	//s := fmt.Sprintf("%s-%s-%s-%s-%s", c.Url, c.ClientKey, c.ClientSecret, c.User, "OBFUSCATED PWD XXXX")
	s := fmt.Sprintf("%s-%s-%s-%s-%s", c.Url, c.ClientKey, c.ClientSecret, c.User, c.Password)
	hasher := md5.New()
	hasher.Write([]byte(s))
	return hex.EncodeToString(hasher.Sum(nil))
}

func retrieveToken(sdkConfig *cells_sdk.SdkConfig) (string, error) {

	if sdkConfig.UseTokenCache {
		cached := store.TokenFor(sdkConfig)
		if cached != "" {
			// fmt.Println("[Auth: Retrieved token from cache]")
			return cached, nil
		}
		// fmt.Println("No token found in cache, querying the server")
	}

	fullURL := sdkConfig.Url + oidcResourcePath + "/token"

	data := url.Values{}
	data.Set("grant_type", grantType)
	data.Add("username", sdkConfig.User)
	data.Add("password", sdkConfig.Password)
	// TODO: Scope should ask for "offline_access" as well for more realism
	data.Add("scope", scope)
	// TODO: This should be a uuid.New() for more realism
	data.Add("nonce", "aVerySpecialNonce")

	req, err := http.NewRequest("POST", fullURL, strings.NewReader(data.Encode()))
	if err != nil {
		return "", err
	}

	req.Header.Add("Content-Type", "application/x-www-form-urlencoded") // Important: our dex API does not yet support json payload.
	req.Header.Add("Cache-Control", "no-cache")
	req.Header.Add("Authorization", basicAuthToken(sdkConfig.ClientKey, sdkConfig.ClientSecret))

	res, err := GetHttpClient(sdkConfig).Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	var respMap map[string]interface{}
	err = json.NewDecoder(res.Body).Decode(&respMap)
	if err != nil {
		return "", fmt.Errorf("could not unmarshall response with status %d: %s\nerror cause: %s", res.StatusCode, res.Status, err.Error())
	}
	if errMsg, exists := respMap["error"]; exists {
		return "", fmt.Errorf("could not retrieve token, %s: %s", errMsg, respMap["error_description"])
	}

	token := respMap["id_token"].(string)

	expiry := respMap["expires_in"].(float64) - 60 // Secure by shortening expiration time
	store.Store(sdkConfig, token, time.Duration(expiry)*time.Second)
	return token, nil
}

func basicAuthToken(username, password string) string {
	auth := username + ":" + password
	return "Basic " + base64.StdEncoding.EncodeToString([]byte(auth))
}

package cmd

import (
	"context"
	"time"

	"github.com/patrickmn/go-cache"
	auth2 "github.com/pydio/cells/common/auth"
	"github.com/pydio/minio-srv/pkg/auth"
	"github.com/pydio/minio-srv/pkg/iam/policy"
	"github.com/pydio/minio-srv/pkg/madmin"
)

func NewJwtIAMSys() *JwtIAMSys {
	j := &JwtIAMSys{}
	j.jwtVerifier = auth2.DefaultJWTVerifier()
	j.quickCache = cache.New(time.Second*1, time.Second*30)
	return j
}

type JwtIAMSys struct {
	IAMSys
	quickCache  *cache.Cache
	jwtVerifier *auth2.JWTVerifier
}

// GetUser - get user credentials
func (sys *JwtIAMSys) GetUser(accessKey string) (cred auth.Credentials, ok bool) {
	sys.RLock()
	defer sys.RUnlock()

	// Check if it's already cached
	if cred, ok := sys.quickCache.Get(accessKey); ok {
		return cred.(auth.Credentials), true
	}

	// Check if it's a valid JWT
	if _, _, e := sys.jwtVerifier.Verify(context.Background(), accessKey); e == nil {
		cred, _ = auth.CreateCredentials(accessKey, "gatewaysecret")
		ok = true
		sys.quickCache.Set(accessKey, cred, cache.DefaultExpiration)
	}

	return cred, ok
}

// SetTempUser - set temporary user credentials, these credentials have an expiry.
func (sys *JwtIAMSys) SetTempUser(accessKey string, cred auth.Credentials, policyName string) error {
	sys.RLock()
	defer sys.RUnlock()

	cred, _ = auth.CreateCredentials(accessKey, "gatewaysecret")
	sys.quickCache.Set(accessKey, cred, cache.DefaultExpiration)

	return nil
}

// Load - load iam.json
func (sys *JwtIAMSys) Load(objAPI ObjectLayer) error {
	return sys.Init(objAPI)
}

// Init - initializes config system from iam.json
func (sys *JwtIAMSys) Init(objAPI ObjectLayer) error {
	return nil
}

// DeleteCannedPolicy - deletes a canned policy.
func (sys *JwtIAMSys) DeleteCannedPolicy(policyName string) error {
	return nil
}

// ListCannedPolicies - lists all canned policies.
func (sys *JwtIAMSys) ListCannedPolicies() (map[string][]byte, error) {
	var cannedPolicyMap = make(map[string][]byte)
	return cannedPolicyMap, nil
}

// SetCannedPolicy - sets a new canned policy.
func (sys *JwtIAMSys) SetCannedPolicy(policyName string, p iampolicy.Policy) error {
	return nil
}

// SetUserPolicy - sets policy to given user name.
func (sys *JwtIAMSys) SetUserPolicy(accessKey, policyName string) error {
	return nil
}

// DeleteUser - set user credentials.
func (sys *JwtIAMSys) DeleteUser(accessKey string) error {
	return nil
}

// ListUsers - list all users.
func (sys *JwtIAMSys) ListUsers() (map[string]madmin.UserInfo, error) {
	var users = make(map[string]madmin.UserInfo)
	return users, nil
}

// SetUserStatus - sets current user status, supports disabled or enabled.
func (sys *JwtIAMSys) SetUserStatus(accessKey string, status madmin.AccountStatus) error {
	return nil
}

// SetUser - set user credentials.
func (sys *JwtIAMSys) SetUser(accessKey string, uinfo madmin.UserInfo) error {
	return nil
}

// IsAllowed - checks given policy args is allowed to continue the Rest API.
func (sys *JwtIAMSys) IsAllowed(args iampolicy.Args) bool {
	return true
}

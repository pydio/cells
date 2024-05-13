package storage

import (
	"net/url"
	"strings"
)

// DetectHooksAndRemoveFromURL detects a hookNames=hook1,hook2,hook3 query parameter
// and remove it from the RawQuery
func DetectHooksAndRemoveFromURL(u *url.URL) ([]string, bool) {
	if hooks := u.Query().Get("hookNames"); hooks != "" {
		hookNames := strings.Split(hooks, ",")
		qq := u.Query()
		qq.Del("hookNames")
		u.RawQuery = qq.Encode()
		return hookNames, true
	}
	return nil, false
}

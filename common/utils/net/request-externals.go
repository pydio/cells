package net

import (
	net_http "net/http"
	"net/url"
	"strings"
)

// ExternalDomainFromRequest finds external URL based on request fields or headers
func ExternalDomainFromRequest(r *net_http.Request) *url.URL {

	u := &url.URL{}
	if h := r.Header.Get("X-Forwarded-Proto"); len(h) > 0 {
		u.Scheme = h
	} else if r.URL.Scheme != "" {
		u.Scheme = r.URL.Scheme
	} else {
		u.Scheme = "http"
	}

	if h := r.Header.Get("Host"); len(h) > 0 {
		u.Host = h
	} else if r.Host != "" {
		u.Host = r.Host
	} else if r.URL.Host != "" {
		u.Host = r.URL.Host
	} else if h := r.Header.Get("X-Forwarded-For"); len(h) > 0 {
		u.Host = strings.Split(h, ",")[0]
	}

	return u
}

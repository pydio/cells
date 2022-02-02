/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package install

import (
	"fmt"
	"net/url"
	"strings"

	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/net"
)

func (m *ProxyConfig) GetDefaultBindURL() string {
	scheme := "http"
	if m.TLSConfig != nil {
		scheme = "https"
	}
	return fmt.Sprintf("%s://%s", scheme, m.Binds[0])
}

func (m *ProxyConfig) GetBindURLs() (addresses []string) {
	scheme := "http"
	if m.HasTLS() {
		scheme = "https"
	}
	for _, b := range m.Binds {
		host := b
		if strings.HasPrefix(b, ":") {
			host = "localhost" + b
		}
		addresses = append(addresses, fmt.Sprintf("%s://%s", scheme, host))
	}
	return
}

func (m *ProxyConfig) canonicalUrl(s string) (*url.URL, error) {
	u, e := url.Parse(s)
	if e != nil {
		return nil, e
	}
	if (u.Port() == "80" && u.Scheme == "http") || (u.Port() == "443" && u.Scheme == "https") {
		u.Host = u.Hostname() // Replace host with version without port
	}
	return u, nil
}

func (m *ProxyConfig) expandBindAll(u *url.URL) []*url.URL {
	var out []*url.URL
	if ii, e := net.GetAvailableIPs(); e == nil {
		for _, i := range ii {
			exp, _ := url.Parse(strings.ReplaceAll(u.String(), "0.0.0.0", i.String()))
			out = append(out, exp)
		}
	}
	if other, e := net.HostsFileLookup(); e == nil {
		for _, o := range other {
			exp, _ := url.Parse(strings.ReplaceAll(u.String(), "0.0.0.0", o))
			out = append(out, exp)
		}
	}
	return out
}

func (m *ProxyConfig) GetExternalUrls() map[string]*url.URL {
	uniques := make(map[string]*url.URL)
	if ext := m.GetReverseProxyURL(); ext != "" {
		if u, e := m.canonicalUrl(ext); e == nil {
			uniques[u.Host] = u
		}
	}
	for _, b := range m.GetBindURLs() {
		u, e := m.canonicalUrl(b)
		if e != nil {
			continue
		}
		uniques[u.Host] = u
		if u.Hostname() == "0.0.0.0" {
			for _, exp := range m.expandBindAll(u) {
				uniques[exp.Host] = exp
			}
		}
	}
	return uniques
}

func (m *ProxyConfig) HasTLS() bool {
	return m.TLSConfig != nil
}

func (m *ProxyConfig) GetTLSCertificate() *TLSCertificate {
	if cert, ok := m.TLSConfig.(*ProxyConfig_Certificate); ok {
		return cert.Certificate
	} else {
		return nil
	}
}

func (m *ProxyConfig) GetTLSSelfSigned() *TLSSelfSigned {
	if cert, ok := m.TLSConfig.(*ProxyConfig_SelfSigned); ok {
		return cert.SelfSigned
	} else {
		return nil
	}
}

func (m *ProxyConfig) GetTLSLetsEncrypt() *TLSLetsEncrypt {
	if cert, ok := m.TLSConfig.(*ProxyConfig_LetsEncrypt); ok {
		return cert.LetsEncrypt
	} else {
		return nil
	}
}

func (m *ProxyConfig) UnmarshalFromMap(data map[string]interface{}, getKey func(string) string) error {
	if u, o := data[getKey("Binds")]; o {
		if s, o := u.([]interface{}); o {
			for _, v := range s {
				if d, o := v.(string); o {
					m.Binds = append(m.Binds, d)
				} else {
					return fmt.Errorf("unexpected type for Binds item (expected string)")
				}
			}
		} else {
			return fmt.Errorf("unexpected type for Binds (expected array)")
		}
	}
	if u, o := data[getKey("SSLRedirect")]; o {
		if b, o := u.(bool); o {
			m.SSLRedirect = b
		} else {
			return fmt.Errorf("unexpected type for SSLRedirect (expected bool)")
		}
	}
	if u, o := data[getKey("ReverseProxyURL")]; o {
		if b, o := u.(string); o {
			m.ReverseProxyURL = b
		} else {
			return fmt.Errorf("unexpected type for ReverseProxyURL (expected string)")
		}
	}
	if t, o := data[getKey("TLSConfig")]; o {
		tls := mapInterface2mapString(t)
		if tls != nil {
			if u, o := tls[getKey("SelfSigned")]; o {
				uu := mapInterface2mapString(u)
				r, e := json.Marshal(uu)
				if e != nil {
					return fmt.Errorf("cannot remarsh data")
				}
				selfSigned := TLSSelfSigned{}
				if e := json.Unmarshal(r, &selfSigned); e == nil {
					m.TLSConfig = &ProxyConfig_SelfSigned{SelfSigned: &selfSigned}
				} else {
					return fmt.Errorf("unexpected type for SelfSigned (expected TLSSelfSigned)")
				}
			} else if u, o := tls[getKey("LetsEncrypt")]; o {
				uu := mapInterface2mapString(u)
				r, _ := json.Marshal(uu)
				le := &TLSLetsEncrypt{}
				if e := json.Unmarshal(r, &le); e == nil {
					m.TLSConfig = &ProxyConfig_LetsEncrypt{LetsEncrypt: le}
				} else {
					return fmt.Errorf("unexpected type for SelfSigned (expected TLSSelfSigned)")
				}
			} else if u, o := tls[getKey("Certificate")]; o {
				uu := mapInterface2mapString(u)
				r, _ := json.Marshal(uu)
				cert := &TLSCertificate{}
				if e := json.Unmarshal(r, &cert); e == nil {
					m.TLSConfig = &ProxyConfig_Certificate{Certificate: cert}
				} else {
					return fmt.Errorf("unexpected type for SelfSigned (expected TLSSelfSigned)")
				}
			}
		}
	}

	if u, o := data[getKey("Maintenance")]; o {
		if b, o := u.(bool); o {
			m.Maintenance = b
		} else {
			return fmt.Errorf("unexpected type for Maintenance (expected bool)")
		}
	}
	if u, o := data[getKey("MaintenanceConditions")]; o {
		if s, o := u.([]interface{}); o {
			for _, v := range s {
				if d, o := v.(string); o {
					m.MaintenanceConditions = append(m.MaintenanceConditions, d)
				} else {
					return fmt.Errorf("unexpected type for MaintenanceConditions item (expected string)")
				}
			}
		} else {
			return fmt.Errorf("unexpected type for MaintenanceConditions (expected array)")
		}
	}

	return nil
}

func (m *ProxyConfig) UnmarshalJSON(bb []byte) error {
	data := make(map[string]interface{})
	e := json.Unmarshal(bb, &data)
	if e != nil {
		return e
	}
	return m.UnmarshalFromMap(data, func(s string) string {
		return s
	})
}

func (m *ProxyConfig) UnmarshalYAML(unmarshal func(interface{}) error) error {
	data := make(map[string]interface{})
	if err := unmarshal(&data); err != nil {
		return err
	}
	return m.UnmarshalFromMap(data, func(s string) string {
		return strings.ToLower(s)
	})
}

func mapInterface2mapString(in interface{}) map[string]interface{} {
	if t, o := in.(map[string]interface{}); o {
		return t
	}
	if t, o := in.(map[interface{}]interface{}); o {
		out := make(map[string]interface{})
		for k, v := range t {
			out[k.(string)] = v
		}
		return out
	}
	return nil
}

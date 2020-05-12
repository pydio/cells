package install

import (
	"encoding/json"
	"fmt"
	"strings"
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

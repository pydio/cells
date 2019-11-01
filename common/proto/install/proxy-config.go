package install

import (
	"encoding/json"
	"fmt"
	"strings"
)

func (m *ProxyConfig) UnmarshalFromMap(data map[string]interface{}, getKey func(string) string) error {
	if u, o := data[getKey("BindURL")]; o {
		if s, o := u.(string); o {
			m.BindURL = s
		} else {
			return fmt.Errorf("unexpected type for BindURL (expected string)")
		}
	}
	if u, o := data[getKey("ExternalURL")]; o {
		if s, o := u.(string); o {
			m.ExternalURL = s
		} else {
			return fmt.Errorf("unexpected type for ExternalURL (expected string)")
		}
	}
	if u, o := data[getKey("RedirectURLs")]; o {
		if s, o := u.([]interface{}); o {
			for _, v := range s {
				if d, o := v.(string); o {
					m.RedirectURLs = append(m.RedirectURLs, d)
				} else {
					return fmt.Errorf("unexpected type for RedirectURLs item (expected string)")
				}
			}
		} else {
			return fmt.Errorf("unexpected type for RedirectURLs (expected array)")
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

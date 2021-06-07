package idm

import (
	"strings"

	json "github.com/pydio/cells/x/jsonx"
)

type WsAttributes struct {
	AllowSync     bool   `json:"ALLOW_SYNC,omitempty"`
	SkipRecycle   bool   `json:"SKIP_RECYCLE,omitempty"`
	DefaultRights string `json:"DEFAULT_RIGHTS,omitempty"`
	QuotaValue    string `json:"QUOTA,omitempty"`
}

func (m *Workspace) LoadAttributes() *WsAttributes {
	attributes := &WsAttributes{}
	if m.Attributes != "" && m.Attributes != "{}" {
		// In case bool value was stored as string
		strAttr := strings.ReplaceAll(m.Attributes, "\"true\"", "true")
		strAttr = strings.ReplaceAll(strAttr, "\"false\"", "false")
		// Unmarshal to WsAttributes struct
		if e := json.Unmarshal([]byte(strAttr), attributes); e == nil {
			return attributes
		}
	}
	return attributes
}

func (m *Workspace) SetAttributes(a *WsAttributes) {
	bb, _ := json.Marshal(a)
	s := string(bb)
	if s == "{}" {
		s = ""
	}
	m.Attributes = s
}

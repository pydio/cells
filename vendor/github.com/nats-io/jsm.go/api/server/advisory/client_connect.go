package advisory

import (
	"github.com/nats-io/jsm.go/api/event"
)

// ConnectEventMsgV1 is sent when a new connection is made that is part of an account.
//
// NATS Schema Type io.nats.server.advisory.v1.client_connect
type ConnectEventMsgV1 struct {
	event.NATSEvent

	Server ServerInfoV1 `json:"server"`
	Client ClientInfoV1 `json:"client"`
}

func init() {
	err := event.RegisterTextCompactTemplate("io.nats.server.advisory.v1.client_connect", `{{ .Time | ShortTime }} [Connection] {{ if .Client.User }}user: {{ .Client.User }}{{ end }} cid: {{ .Client.ID }} in account {{ .Client.Account }}`)
	if err != nil {
		panic(err)
	}

	err = event.RegisterTextExtendedTemplate("io.nats.server.advisory.v1.client_connect", `
[{{ .Time | ShortTime }}] [{{ .ID }}] Client Connection

   Server: {{ .Server.Name }}
{{- if .Server.Cluster }}
  Cluster: {{ .Server.Cluster }}
{{- end }}

   Client:
                 ID: {{ .Client.ID }}
{{- if .Client.User }}
               User: {{ .Client.User }}
{{- end }}
{{- if .Client.Name }}
               Name: {{ .Client.Name }}
{{- end }}
            Account: {{ .Client.Account }}
    Library Version: {{ .Client.Version }}  Language: {{ with .Client.Lang }}{{ . }}{{ else }}Unknown{{ end }}
{{- if .Client.Host }}
               Host: {{ .Client.Host }}
{{- end }}
{{- if .Client.Jwt }}
         Issuer Key: {{ .Client.IssuerKey }}
           Name Tag: {{ .Client.NameTag }}
               Tags: {{ .Client.Tags | JoinStrings }}
{{- end }}
`)
	if err != nil {
		panic(err)
	}
}

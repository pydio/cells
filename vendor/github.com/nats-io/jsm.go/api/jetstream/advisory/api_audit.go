package advisory

import (
	"github.com/nats-io/jsm.go/api/event"
	"github.com/nats-io/jsm.go/api/server/advisory"
)

// JetStreamAPIAuditV1 is a advisory published for any JetStream API access
//
// NATS Schema Type io.nats.jetstream.advisory.v1.api_audit
type JetStreamAPIAuditV1 struct {
	event.NATSEvent

	Server   string                `json:"server"`
	Client   advisory.ClientInfoV1 `json:"client"`
	Subject  string                `json:"subject"`
	Request  string                `json:"request,omitempty"`
	Response string                `json:"response"`
}

func init() {
	err := event.RegisterTextCompactTemplate("io.nats.jetstream.advisory.v1.api_audit", `{{ .Time | ShortTime }} [JS API] {{ .Subject }}{{ if .Client.User }} {{ .Client.User}} @{{ end }}{{ if .Client.Account }} {{ .Client.Account }}{{ end }}`)
	if err != nil {
		panic(err)
	}

	err = event.RegisterTextExtendedTemplate("io.nats.jetstream.advisory.v1.api_audit", `
[{{ .Time | ShortTime }}] [{{ .ID }}] JetStream API Access

      Server: {{ .Server }}
     Subject: {{ .Subject }}
      Client:
{{- if .Client.User }}
                      User: {{ .Client.User }} Account: {{ .Client.Account }}
{{- end }}
                      Host: {{ .Client.Host }}
                        ID: {{ .Client.ID }}
{{- if .Client.Name }}
                      Name: {{ .Client.Name }}
{{- end }}
           Library Version: {{ .Client.Version }}  Language: {{ with .Client.Lang }}{{ . }}{{ else }}Unknown{{ end }}

    Request:
{{ if .Request }}
{{ .Request | LeftPad 10 }}
{{- else }}
          Empty Request
{{- end }}

    Response:

{{ .Response | LeftPad 10 }}`)
	if err != nil {
		panic(err)
	}
}

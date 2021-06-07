package advisory

import (
	"github.com/nats-io/jsm.go/api/event"
)

// JSServerOutOfSpaceAdvisoryV1 is an advisory sent when a server runs out of disk space
//
// NATS Schema Type io.nats.jetstream.advisory.v1.server_out_of_space
type JSServerOutOfSpaceAdvisoryV1 struct {
	event.NATSEvent

	Server   string `json:"server"`
	ServerID string `json:"server_id"`
	Stream   string `json:"stream,omitempty"`
	Cluster  string `json:"cluster"`
}

func init() {
	err := event.RegisterTextCompactTemplate("io.nats.jetstream.advisory.v1.server_out_of_space", `{{ .Time | ShortTime }} [Out of Space] {{ .Server }} ({{ .ServerID }}){{ if .Cluster }} in cluster {{ .Cluster }}{{end}} ran out of disk space`)
	if err != nil {
		panic(err)
	}

	err = event.RegisterTextExtendedTemplate("io.nats.jetstream.advisory.v1.server_out_of_space", `
[{{ .Time | ShortTime }}] [{{ .ID }}] Out of Disk Space

        Server: {{ .Server }} - {{ .ServerID}}
       Cluster: {{ .Cluster }}
{{- if .Stream }}
        Stream: {{ .Stream }}
{{- end }}
`)
	if err != nil {
		panic(err)
	}
}

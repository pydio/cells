package advisory

import (
	"time"

	"github.com/nats-io/jsm.go/api/event"
	"github.com/nats-io/jsm.go/api/server/advisory"
)

// JSSnapshotCompleteAdvisoryV1 is an advisory sent after a snapshot is successfully started
//
// NATS Schema Type io.nats.jetstream.advisory.v1.snapshot_complete
type JSSnapshotCompleteAdvisoryV1 struct {
	event.NATSEvent

	Stream string                `json:"stream"`
	Start  time.Time             `json:"start"`
	End    time.Time             `json:"end"`
	Client advisory.ClientInfoV1 `json:"client"`
}

func init() {
	err := event.RegisterTextCompactTemplate("io.nats.jetstream.advisory.v1.snapshot_complete", `{{ .Time | ShortTime }} [Snapshot Complete] {{ .Stream }} started {{ .Start | ShortTime }} ended {{ .End | ShortTime }}`)
	if err != nil {
		panic(err)
	}

	err = event.RegisterTextExtendedTemplate("io.nats.jetstream.advisory.v1.snapshot_complete", `
[{{ .Time | ShortTime }}] [{{ .ID }}] Stream Snapshot Completed

        Stream: {{ .Stream }}
		Start: {{ .Start | NanoTime }}
          End: {{ .End | NanoTime }}
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
`)
	if err != nil {
		panic(err)
	}
}

package advisory

import (
	"time"

	"github.com/nats-io/jsm.go/api/event"
	"github.com/nats-io/jsm.go/api/server/advisory"
)

// JSRestoreCompleteAdvisoryV1 is an advisory sent after a snapshot is successfully started
//
// NATS Schema type io.nats.jetstream.advisory.v1.restore_complete
type JSRestoreCompleteAdvisoryV1 struct {
	event.NATSEvent

	Stream string                `json:"stream"`
	Start  time.Time             `json:"start"`
	End    time.Time             `json:"end"`
	Bytes  int64                 `json:"bytes"`
	Client advisory.ClientInfoV1 `json:"client"`
}

func init() {
	err := event.RegisterTextCompactTemplate("io.nats.jetstream.advisory.v1.restore_complete", `{{ .Time | ShortTime }} [Restore Complete] {{ .Stream }} restored {{ .Bytes | IBytes }} bytes started {{ .Start | ShortTime }} ended {{ .End | ShortTime }}`)
	if err != nil {
		panic(err)
	}

	err = event.RegisterTextExtendedTemplate("io.nats.jetstream.advisory.v1.restore_complete", `
[{{ .Time | ShortTime }}] [{{ .ID }}] Stream Restore Completed

        Stream: {{ .Stream }}
         Start: {{ .Start | NanoTime }}
           End: {{ .Start | NanoTime }}
         Bytes: {{ .Bytes | IBytes }}
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

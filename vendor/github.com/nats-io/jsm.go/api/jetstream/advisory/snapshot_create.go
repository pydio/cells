package advisory

import (
	"github.com/nats-io/jsm.go/api/event"
	"github.com/nats-io/jsm.go/api/server/advisory"
)

// JSSnapshotCreateAdvisoryV1 is an advisory sent after a snapshot is successfully started
//
// NATS Schema io.nats.jetstream.advisory.v1.snapshot_create
type JSSnapshotCreateAdvisoryV1 struct {
	event.NATSEvent
	Stream  string                `json:"stream"`
	NumBlks int64                 `json:"blocks"`
	BlkSize int64                 `json:"block_size"`
	Client  advisory.ClientInfoV1 `json:"client"`
}

func init() {
	err := event.RegisterTextCompactTemplate("io.nats.jetstream.advisory.v1.snapshot_create", `{{ .Time | ShortTime }} [Snapshot Create] {{ .Stream }} {{ .NumBlks | Int64Commas }} blocks of {{ .BlkSize | IBytes }}`)
	if err != nil {
		panic(err)
	}

	err = event.RegisterTextExtendedTemplate("io.nats.jetstream.advisory.v1.snapshot_create", `
[{{ .Time | ShortTime }}] [{{ .ID }}] Stream Snapshot Created

        Stream: {{ .Stream }}
        Blocks: {{ .NumBlks | Int64Commas }}
    Block Size: {{ .BlkSize | IBytes }}
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

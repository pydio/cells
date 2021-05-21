package advisory

import (
	"github.com/nats-io/jsm.go/api/event"
)

// ActionAdvisoryTypeV1 indicates which action against a stream, consumer or template triggered an advisory
type ActionAdvisoryTypeV1 string

func (a ActionAdvisoryTypeV1) String() string {
	return string(a)
}

const (
	CreateEvent ActionAdvisoryTypeV1 = "create"
	DeleteEvent ActionAdvisoryTypeV1 = "delete"
	ModifyEvent ActionAdvisoryTypeV1 = "modify"
)

// JetStreamAPIAuditV1 is a advisory published on create, modify or delete of a Stream
//
// NATS Schema Type io.nats.jetstream.advisory.v1.stream_action
type JSStreamActionAdvisoryV1 struct {
	event.NATSEvent

	Stream   string               `json:"stream"`
	Action   ActionAdvisoryTypeV1 `json:"action"`
	Template string               `json:"template,omitempty"`
}

func init() {
	err := event.RegisterTextCompactTemplate("io.nats.jetstream.advisory.v1.stream_action", `{{ .Time | ShortTime }} [Stream {{ .Action | ToString | TitleString }}] {{ .Stream }}`)
	if err != nil {
		panic(err)
	}

	err = event.RegisterTextExtendedTemplate("io.nats.jetstream.advisory.v1.stream_action", `
[{{ .Time | ShortTime }}] [{{ .ID }}] Stream {{ .Action | ToString | TitleString }} Action

        Stream: {{ .Stream }}
{{- if .Template }}
      Template: {{ .Template }}
{{- end }}`)
	if err != nil {
		panic(err)
	}
}

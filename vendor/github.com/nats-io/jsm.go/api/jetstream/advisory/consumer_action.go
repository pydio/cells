package advisory

import (
	"github.com/nats-io/jsm.go/api/event"
)

// JSConsumerActionAdvisoryV1 is a advisory published on create or delete of a Consumer
//
// NATS Schema Type io.nats.jetstream.advisory.v1.consumer_action
type JSConsumerActionAdvisoryV1 struct {
	event.NATSEvent

	Stream   string               `json:"stream"`
	Consumer string               `json:"consumer"`
	Action   ActionAdvisoryTypeV1 `json:"action"`
}

func init() {
	err := event.RegisterTextCompactTemplate("io.nats.jetstream.advisory.v1.consumer_action", `{{ .Time | ShortTime }} [Consumer {{ .Action | ToString | TitleString }}] {{ .Stream }} > {{ .Consumer }}`)
	if err != nil {
		panic(err)
	}

	err = event.RegisterTextExtendedTemplate("io.nats.jetstream.advisory.v1.consumer_action", `
[{{ .Time | ShortTime }}] [{{ .ID }}] Consumer {{ .Action | ToString | TitleString }} Action

        Stream: {{ .Stream }}
      Consumer: {{ .Consumer }}`)
	if err != nil {
		panic(err)
	}
}

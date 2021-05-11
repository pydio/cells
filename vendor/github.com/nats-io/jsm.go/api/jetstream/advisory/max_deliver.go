package advisory

import (
	"github.com/nats-io/jsm.go/api/event"
)

// ConsumerDeliveryExceededAdvisoryV1 is an advisory published when a consumer
// message reaches max delivery attempts
//
// NATS Schema Type io.nats.jetstream.advisory.v1.max_deliver
type ConsumerDeliveryExceededAdvisoryV1 struct {
	event.NATSEvent

	Stream     string `json:"stream"`
	Consumer   string `json:"consumer"`
	StreamSeq  uint64 `json:"stream_seq"`
	Deliveries uint64 `json:"deliveries"`
}

func init() {
	err := event.RegisterTextCompactTemplate("io.nats.jetstream.advisory.v1.max_deliver", `{{ .Time | ShortTime }} [JS Max Deliveries] {{ .Stream }} ({{ .StreamSeq }}) > {{ .Consumer }}: {{ .Deliveries }} deliveries`)
	if err != nil {
		panic(err)
	}

	err = event.RegisterTextExtendedTemplate("io.nats.jetstream.advisory.v1.max_deliver", `
[{{ .Time | ShortTime }}] [{{ .ID }}] Delivery Attempts Exceeded

          Consumer: {{ .Stream }} > {{ .Consumer }}
   Stream Sequence: {{ .StreamSeq }}
        Deliveries: {{ .Deliveries }}`)
	if err != nil {
		panic(err)
	}
}

package advisory

import (
	"github.com/nats-io/jsm.go/api/event"
)

// JSConsumerDeliveryTerminatedAdvisoryV1 is an advisory informing that a message was
// terminated by the consumer, so might be a candidate for DLQ handling
//
// NATS Schema: io.nats.jetstream.advisory.v1.terminated
type JSConsumerDeliveryTerminatedAdvisoryV1 struct {
	event.NATSEvent

	Stream      string `json:"stream"`
	Consumer    string `json:"consumer"`
	ConsumerSeq uint64 `json:"consumer_seq"`
	StreamSeq   uint64 `json:"stream_seq"`
	Deliveries  uint64 `json:"deliveries"`
}

func init() {
	err := event.RegisterTextCompactTemplate("io.nats.jetstream.advisory.v1.terminated", `{{ .Time | ShortTime }} [JS Delivery Terminated] {{ .Stream }} ({{ .StreamSeq }}) > {{ .Consumer }}: {{ .Deliveries }} deliveries`)
	if err != nil {
		panic(err)
	}

	err = event.RegisterTextExtendedTemplate("io.nats.jetstream.advisory.v1.terminated", `
[{{ .Time | ShortTime }}] [{{ .ID }}] Delivery Terminated

          Consumer: {{ .Stream }} > {{ .Consumer }}
   Stream Sequence: {{ .StreamSeq }}
        Deliveries: {{ .Deliveries }}`)
	if err != nil {
		panic(err)
	}
}

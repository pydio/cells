package metric

import (
	"github.com/nats-io/jsm.go/api/event"
)

// ConsumerAckMetricV1 is a metric published when a Consumer
// has ACK sampling enabled to indicate message processing stats
//
// NATS Schema Type io.nats.jetstream.metric.v1.consumer_ack
type ConsumerAckMetricV1 struct {
	event.NATSEvent

	Stream      string `json:"stream"`
	Consumer    string `json:"consumer"`
	ConsumerSeq uint64 `json:"consumer_seq"`
	StreamSeq   uint64 `json:"stream_seq"`
	Delay       int64  `json:"ack_time"`
	Deliveries  uint64 `json:"deliveries"`
}

func init() {
	err := event.RegisterTextCompactTemplate("io.nats.jetstream.metric.v1.consumer_ack", `{{ .Time | ShortTime }} [JS Ack] {{ .Stream }} ({{ .StreamSeq }}) > {{ .Consumer }} ({{ .ConsumerSeq}}): {{ .Deliveries }} deliveries in {{ .Delay }}`)
	if err != nil {
		panic(err)
	}

	err = event.RegisterTextExtendedTemplate("io.nats.jetstream.metric.v1.consumer_ack", `
[{{ .Time | ShortTime }}] [{{ .ID }}] Acknowledgment Sample

              Consumer: {{ .Stream }} > {{ .Consumer }}
       Stream Sequence: {{ .StreamSeq }}
     Consumer Sequence: {{ .ConsumerSeq }}
            Deliveries: {{ .Deliveries }}
                 Delay: {{ .Delay }}`)
	if err != nil {
		panic(err)
	}
}

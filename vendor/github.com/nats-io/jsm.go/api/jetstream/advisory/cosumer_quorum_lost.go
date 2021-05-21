package advisory

import (
	"github.com/nats-io/jsm.go/api/event"
)

// JSConsumerQuorumLostV1 is a advisory published when a stream elects a new leader
//
// NATS Schema Type io.nats.jetstream.advisory.v1.consumer_quorum_lost
type JSConsumerQuorumLostV1 struct {
	event.NATSEvent

	Stream   string        `json:"stream"`
	Consumer string        `json:"consumer"`
	Replicas []*PeerInfoV1 `json:"replicas"`
}

func init() {
	err := event.RegisterTextCompactTemplate("io.nats.jetstream.advisory.v1.consumer_quorum_lost", `{{ .Time | ShortTime }} [RAFT] Consumer {{ .Stream }} > {{ .Consumer }} lost quorum of {{ .Replicas | len }} peers`)
	if err != nil {
		panic(err)
	}

	err = event.RegisterTextExtendedTemplate("io.nats.jetstream.advisory.v1.consumer_quorum_lost", `
[{{ .Time | ShortTime }}] [{{ .ID }}] Consumer Quorum Lost

        Stream: {{ .Stream }}
      Consumer: {{ .Consumer }}
      Replicas:
{{ range .Replicas }}
             Name: {{ .Name }}
          Current: {{ .Current }}
           Active: {{ .Active }}
{{ end }}
`)
	if err != nil {
		panic(err)
	}
}

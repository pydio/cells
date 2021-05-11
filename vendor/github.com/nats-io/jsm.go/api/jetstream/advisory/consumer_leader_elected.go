package advisory

import (
	"github.com/nats-io/jsm.go/api/event"
)

// JSConsumerLeaderElectedV1 is a advisory published when a stream elects a new leader
//
// NATS Schema Type io.nats.jetstream.advisory.v1.consumer_leader_elected
type JSConsumerLeaderElectedV1 struct {
	event.NATSEvent

	Stream   string        `json:"stream"`
	Consumer string        `json:"consumer"`
	Leader   string        `json:"leader"`
	Replicas []*PeerInfoV1 `json:"replicas"`
}

func init() {
	err := event.RegisterTextCompactTemplate("io.nats.jetstream.advisory.v1.consumer_leader_elected", `{{ .Time | ShortTime }} [RAFT] Consumer {{ .Stream }} > {{ .Consumer }} elected {{ .Leader }} of {{ .Replicas | len }} peers`)
	if err != nil {
		panic(err)
	}

	err = event.RegisterTextExtendedTemplate("io.nats.jetstream.advisory.v1.consumer_leader_elected", `
[{{ .Time | ShortTime }}] [{{ .ID }}] Consumer Leader Election

        Stream: {{ .Stream }}
      Consumer: {{ .Consumer }}
        Leader: {{ .Leader }}
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

package advisory

import (
	"github.com/nats-io/jsm.go/api/event"
)

// JSStreamQuorumLostV1 is a advisory published when a stream elects a new leader
//
// NATS Schema Type io.nats.jetstream.advisory.v1.stream_quorum_lost
type JSStreamQuorumLostV1 struct {
	event.NATSEvent

	Stream   string        `json:"stream"`
	Replicas []*PeerInfoV1 `json:"replicas"`
}

func init() {
	err := event.RegisterTextCompactTemplate("io.nats.jetstream.advisory.v1.stream_quorum_lost", `{{ .Time | ShortTime }} [RAFT] Stream {{ .Stream }} lost quorum of {{ .Replicas | len }} peers`)
	if err != nil {
		panic(err)
	}

	err = event.RegisterTextExtendedTemplate("io.nats.jetstream.advisory.v1.stream_quorum_lost", `
[{{ .Time | ShortTime }}] [{{ .ID }}] Stream Quorum Lost

        Stream: {{ .Stream }}
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

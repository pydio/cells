package advisory

import (
	"time"

	"github.com/nats-io/jsm.go/api/event"
)

// PeerInfoV1 is information about a specific peer in a cluster
type PeerInfoV1 struct {
	Name    string        `json:"name"`
	Current bool          `json:"current"`
	Active  time.Duration `json:"active"`
}

// JSStreamLeaderElectedV1 is a advisory published when a stream elects a new leader
//
// NATS Schema Type io.nats.jetstream.advisory.v1.stream_leader_elected
type JSStreamLeaderElectedV1 struct {
	event.NATSEvent

	Stream   string        `json:"stream"`
	Leader   string        `json:"leader"`
	Replicas []*PeerInfoV1 `json:"replicas"`
}

func init() {
	err := event.RegisterTextCompactTemplate("io.nats.jetstream.advisory.v1.stream_leader_elected", `{{ .Time | ShortTime }} [RAFT] Stream {{ .Stream }} elected {{ .Leader }} of {{ .Replicas | len }} peers`)
	if err != nil {
		panic(err)
	}

	err = event.RegisterTextExtendedTemplate("io.nats.jetstream.advisory.v1.stream_leader_elected", `
[{{ .Time | ShortTime }}] [{{ .ID }}] Stream Leader Election

        Stream: {{ .Stream }}
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

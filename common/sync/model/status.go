package model

import (
	"encoding/json"
	"fmt"
	"math"

	"github.com/pydio/cells/common/proto/tree"
)

type TaskStatus int
type ErrorType int
type StatusScope int

const (
	StatusScopeTask = iota
	StatusScopeProcessing

	TaskStatusIdle TaskStatus = iota
	TaskStatusPaused
	TaskStatusDisabled
	TaskStatusProcessing
	TaskStatusError
	TaskStatusRestarting
	TaskStatusStopping

	SyncErrorUnknown ErrorType = iota
	SyncErrorNetworking
	SyncErrorAuthentication
	SyncErrorConflicts
)

type Status interface {
	fmt.Stringer

	Type() StatusScope
	Status() int
	IsError() bool
	Error() error

	Progress() float32
	AtomicProgress() bool

	EndpointURI() string
	Node() *tree.Node
}

// StatusProvider can register channels to send status/done events during processing
type StatusProvider interface {
	// SetupChannels register channels for listening to status and done infos
	SetupChannels(status chan Status, done chan interface{}, cmd *Command)
	// Status notify of a new ProcessStatus
	Status(s Status)
	// Done notify the patch is processed, can send any useful info to the associated channel
	Done(info interface{})
}

type ProcessingStatus struct {
	st     TaskStatus
	s      string
	e      error
	pg     float32
	atomic bool
	uri    string
	node   *tree.Node
}

func NewProcessingStatus(info string) *ProcessingStatus {
	return &ProcessingStatus{s: info}
}

func (p *ProcessingStatus) SetError(e error) *ProcessingStatus {
	p.e = e
	return p
}

func (p *ProcessingStatus) SetProgress(pg float32, atomic ...bool) *ProcessingStatus {
	p.pg = pg
	if len(atomic) > 0 {
		p.atomic = atomic[0]
	}
	return p
}

func (p *ProcessingStatus) SetNode(node *tree.Node) *ProcessingStatus {
	p.node = node
	return p
}

func (p *ProcessingStatus) SetEndpoint(uri string) *ProcessingStatus {
	p.uri = uri
	return p
}

func (p *ProcessingStatus) String() string {
	return p.s
}

func (p *ProcessingStatus) Type() StatusScope {
	return StatusScopeProcessing
}

func (p *ProcessingStatus) Status() int {
	return int(p.st)
}

func (p *ProcessingStatus) IsError() bool {
	return p.e != nil
}

func (p *ProcessingStatus) Error() error {
	return p.e
}

func (p *ProcessingStatus) Progress() float32 {
	return p.pg
}

func (p *ProcessingStatus) AtomicProgress() bool {
	return p.atomic
}

func (p *ProcessingStatus) EndpointURI() string {
	return p.uri
}

func (p *ProcessingStatus) Node() *tree.Node {
	return p.node
}

// MarshalJSON implements custom JSON marshalling
func (p *ProcessingStatus) MarshalJSON() ([]byte, error) {
	m := map[string]interface{}{
		"StatusString": p.s,
		"IsError":      p.IsError(),
	}
	if p.pg > 0 && !math.IsNaN(float64(p.pg)) {
		m["Progress"] = p.pg
	}
	if p.uri != "" {
		m["EndpointURI"] = p.uri
	}
	if p.node != nil {
		m["Node"] = p.node
	}
	return json.Marshal(m)
}

// UnmarshalJSON implements custom JSON unmarshalling
func (p *ProcessingStatus) UnmarshalJSON(data []byte) error {
	var m map[string]interface{}
	if e := json.Unmarshal(data, &m); e != nil {
		return e
	} else {
		if s, ok := m["StatusString"]; ok {
			p.s = s.(string)
		}
		if ie, ok := m["IsError"]; ok && ie.(bool) {
			p.e = fmt.Errorf(p.s)
		}
		if u, ok := m["EndpointURI"]; ok {
			p.uri = u.(string)
		}
		if n, ok := m["Node"]; ok {
			p.node = n.(*tree.Node)
		}
	}
	return nil
}

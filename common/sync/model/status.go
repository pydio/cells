/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package model

import (
	"fmt"
	"math"

	"github.com/pydio/cells/v4/common/proto/tree"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

type TaskStatus int
type ErrorType int
type StatusScope int

const (
	StatusScopeTask = iota
	StatusScopeProcessing
)
const (
	TaskStatusIdle TaskStatus = iota
	TaskStatusPaused
	TaskStatusDisabled
	TaskStatusProcessing
	TaskStatusError
	TaskStatusRestarting
	TaskStatusStopping
	TaskStatusRemoved
)
const (
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
	Node() Node
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
	node   Node
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

func (p *ProcessingStatus) SetNode(node Node) *ProcessingStatus {
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

func (p *ProcessingStatus) Node() Node {
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

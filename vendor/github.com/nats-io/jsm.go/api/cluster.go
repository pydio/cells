// Copyright 2020 The NATS Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package api

import (
	"time"
)

const (
	JSApiLeaderStepDown = "$JS.API.META.LEADER.STEPDOWN"
	JSApiRemoveServer   = "$JS.API.SERVER.REMOVE"
)

// io.nats.jetstream.api.v1.meta_leader_stepdown_request
type JSApiLeaderStepDownRequest struct {
	Placement *Placement `json:"placement,omitempty"`
}

// io.nats.jetstream.api.v1.meta_leader_stepdown_response
type JSApiLeaderStepDownResponse struct {
	JSApiResponse
	Success bool `json:"success,omitempty"`
}

// io.nats.jetstream.api.v1.meta_server_remove_request
type JSApiMetaServerRemoveRequest struct {
	// Server ID of the peer to be removed.
	Server string `json:"peer"`
}

// io.nats.jetstream.api.v1.meta_server_remove_response
type JSApiMetaServerRemoveResponse struct {
	JSApiResponse
	Success bool `json:"success,omitempty"`
}

// ClusterInfo shows information about the underlying set of servers
// that make up the stream or consumer.
type ClusterInfo struct {
	Name     string      `json:"name,omitempty"`
	Leader   string      `json:"leader,omitempty"`
	Replicas []*PeerInfo `json:"replicas,omitempty"`
}

// PeerInfo shows information about all the peers in the cluster that
// are supporting the stream or consumer.
type PeerInfo struct {
	Name    string        `json:"name"`
	Current bool          `json:"current"`
	Offline bool          `json:"offline,omitempty"`
	Active  time.Duration `json:"active"`
	Lag     uint64        `json:"lag,omitempty"`
}

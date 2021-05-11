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
	"encoding/json"
	"fmt"
	"time"
)

const (
	JSApiStreamCreateT         = "$JS.API.STREAM.CREATE.%s"
	JSApiStreamUpdateT         = "$JS.API.STREAM.UPDATE.%s"
	JSApiStreamNames           = "$JS.API.STREAM.NAMES"
	JSApiStreamList            = "$JS.API.STREAM.LIST"
	JSApiStreamInfoT           = "$JS.API.STREAM.INFO.%s"
	JSApiStreamDeleteT         = "$JS.API.STREAM.DELETE.%s"
	JSApiStreamPurgeT          = "$JS.API.STREAM.PURGE.%s"
	JSApiMsgDeleteT            = "$JS.API.STREAM.MSG.DELETE.%s"
	JSApiMsgGetT               = "$JS.API.STREAM.MSG.GET.%s"
	JSApiStreamSnapshotT       = "$JS.API.STREAM.SNAPSHOT.%s"
	JSApiStreamRestoreT        = "$JS.API.STREAM.RESTORE.%s"
	JSApiStreamRemovePeerT     = "$JS.API.STREAM.PEER.REMOVE.%s"
	JSApiStreamLeaderStepDownT = "$JS.API.STREAM.LEADER.STEPDOWN.%s"
	StreamDefaultReplicas      = 1
	StreamMaxReplicas          = 5
)

type StoredMsg struct {
	Subject  string    `json:"subject"`
	Sequence uint64    `json:"seq"`
	Header   []byte    `json:"hdrs,omitempty"`
	Data     []byte    `json:"data,omitempty"`
	Time     time.Time `json:"time"`
}

// io.nats.jetstream.api.v1.pub_ack_response
type JSPubAckResponse struct {
	Error *ApiError `json:"error,omitempty"`
	PubAck
}

// PubAck is the detail you get back from a publish to a stream that was successful
type PubAck struct {
	Stream    string `json:"stream"`
	Sequence  uint64 `json:"seq"`
	Duplicate bool   `json:"duplicate,omitempty"`
}

// io.nats.jetstream.api.v1.stream_create_request
type JSApiStreamCreateRequest struct {
	StreamConfig
}

// io.nats.jetstream.api.v1.stream_names_request
type JSApiStreamNamesRequest struct {
	JSApiIterableRequest
	// Subject filter the names to those consuming messages matching this subject or wildcard
	Subject string `json:"subject,omitempty"`
}

// io.nats.jetstream.api.v1.stream_names_response
type JSApiStreamNamesResponse struct {
	JSApiResponse
	JSApiIterableResponse
	Streams []string `json:"streams"`
}

// io.nats.jetstream.api.v1.stream_list_response
type JSApiStreamListResponse struct {
	JSApiResponse
	JSApiIterableResponse
	Streams []*StreamInfo `json:"streams"`
}

// io.nats.jetstream.api.v1.stream_list_request
type JSApiStreamListRequest struct {
	JSApiIterableRequest
}

// io.nats.jetstream.api.v1.stream_msg_delete_request
type JSApiMsgDeleteRequest struct {
	Seq     uint64 `json:"seq"`
	NoErase bool   `json:"no_erase,omitempty"`
}

// io.nats.jetstream.api.v1.stream_msg_delete_response
type JSApiMsgDeleteResponse struct {
	JSApiResponse
	Success bool `json:"success,omitempty"`
}

// io.nats.jetstream.api.v1.stream_create_response
type JSApiStreamCreateResponse struct {
	JSApiResponse
	*StreamInfo
}

// io.nats.jetstream.api.v1.stream_info_response
type JSApiStreamInfoResponse struct {
	JSApiResponse
	*StreamInfo
}

// io.nats.jetstream.api.v1.stream_update_response
type JSApiStreamUpdateResponse struct {
	JSApiResponse
	*StreamInfo
}

// io.nats.jetstream.api.v1.stream_delete_response
type JSApiStreamDeleteResponse struct {
	JSApiResponse
	Success bool `json:"success,omitempty"`
}

// io.nats.jetstream.api.v1.stream_purge_response
type JSApiStreamPurgeResponse struct {
	JSApiResponse
	Success bool   `json:"success,omitempty"`
	Purged  uint64 `json:"purged"`
}

// io.nats.jetstream.api.v1.stream_msg_get_response
type JSApiMsgGetResponse struct {
	JSApiResponse
	Message *StoredMsg `json:"message,omitempty"`
}

// io.nats.jetstream.api.v1.stream_msg_get_request
type JSApiMsgGetRequest struct {
	Seq uint64 `json:"seq"`
}

// io.nats.jetstream.api.v1.stream_snapshot_response
type JSApiStreamSnapshotResponse struct {
	JSApiResponse
	Config StreamConfig `json:"config"`
	State  StreamState  `json:"state"`
}

// io.nats.jetstream.api.v1.stream_snapshot_request
type JSApiStreamSnapshotRequest struct {
	// Subject to deliver the chunks to for the snapshot.
	DeliverSubject string `json:"deliver_subject"`
	// Do not include consumers in the snapshot.
	NoConsumers bool `json:"no_consumers,omitempty"`
	// Optional chunk size preference. Otherwise server selects.
	ChunkSize int `json:"chunk_size,omitempty"`
	// Check all message's checksums prior to snapshot.
	CheckMsgs bool `json:"jsck,omitempty"`
}

// io.nats.jetstream.api.v1.stream_restore_request
type JSApiStreamRestoreRequest struct {
	Config StreamConfig `json:"config"`
	State  StreamState  `json:"state"`
}

// io.nats.jetstream.api.v1.stream_restore_response
type JSApiStreamRestoreResponse struct {
	JSApiResponse
	// Subject to deliver the chunks to for the snapshot restore.
	DeliverSubject string `json:"deliver_subject"`
}

// io.nats.jetstream.api.v1.stream_remove_peer_request
type JSApiStreamRemovePeerRequest struct {
	// Server name of the peer to be removed.
	Peer string `json:"peer"`
}

// io.nats.jetstream.api.v1.stream_remove_peer_response
type JSApiStreamRemovePeerResponse struct {
	JSApiResponse
	Success bool `json:"success,omitempty"`
}

// io.nats.jetstream.api.v1.stream_leader_stepdown_response
type JSApiStreamLeaderStepDownResponse struct {
	JSApiResponse
	Success bool `json:"success,omitempty"`
}

type DiscardPolicy int

const (
	DiscardOld DiscardPolicy = iota
	DiscardNew
)

func (p DiscardPolicy) String() string {
	switch p {
	case DiscardOld:
		return "Old"
	case DiscardNew:
		return "New"
	default:
		return "Unknown Discard Policy"
	}
}

func (p *DiscardPolicy) UnmarshalJSON(data []byte) error {
	switch string(data) {
	case jsonString("old"):
		*p = DiscardOld
	case jsonString("new"):
		*p = DiscardNew
	default:
		return fmt.Errorf("can not unmarshal %q", data)
	}

	return nil
}

func (p DiscardPolicy) MarshalJSON() ([]byte, error) {
	switch p {
	case DiscardOld:
		return json.Marshal("old")
	case DiscardNew:
		return json.Marshal("new")
	default:
		return nil, fmt.Errorf("unknown discard policy %v", p)
	}
}

type StorageType int

const (
	FileStorage StorageType = iota
	MemoryStorage
)

func (t StorageType) String() string {
	switch t {
	case MemoryStorage:
		return "Memory"
	case FileStorage:
		return "File"
	default:
		return "Unknown Storage Type"
	}
}

func (t *StorageType) UnmarshalJSON(data []byte) error {
	switch string(data) {
	case jsonString("memory"):
		*t = MemoryStorage
	case jsonString("file"):
		*t = FileStorage
	default:
		return fmt.Errorf("can not unmarshal %q", data)
	}

	return nil
}

func (t StorageType) MarshalJSON() ([]byte, error) {
	switch t {
	case MemoryStorage:
		return json.Marshal("memory")
	case FileStorage:
		return json.Marshal("file")
	default:
		return nil, fmt.Errorf("unknown storage type %q", t)
	}
}

type RetentionPolicy int

const (
	LimitsPolicy RetentionPolicy = iota
	InterestPolicy
	WorkQueuePolicy
)

func (p RetentionPolicy) String() string {
	switch p {
	case LimitsPolicy:
		return "Limits"
	case InterestPolicy:
		return "Interest"
	case WorkQueuePolicy:
		return "WorkQueue"
	default:
		return "Unknown Retention Policy"
	}
}

func (p *RetentionPolicy) UnmarshalJSON(data []byte) error {
	switch string(data) {
	case jsonString("limits"):
		*p = LimitsPolicy
	case jsonString("interest"):
		*p = InterestPolicy
	case jsonString("workqueue"):
		*p = WorkQueuePolicy
	default:
		return fmt.Errorf("can not unmarshal %q", data)
	}

	return nil
}

func (p RetentionPolicy) MarshalJSON() ([]byte, error) {
	switch p {
	case LimitsPolicy:
		return json.Marshal("limits")
	case InterestPolicy:
		return json.Marshal("interest")
	case WorkQueuePolicy:
		return json.Marshal("workqueue")
	default:
		return nil, fmt.Errorf("unknown retention policy %q", p)
	}
}

// StreamConfig is the configuration for a JetStream Stream Template
//
// NATS Schema Type io.nats.jetstream.api.v1.stream_configuration
type StreamConfig struct {
	Name         string          `json:"name"`
	Subjects     []string        `json:"subjects,omitempty"`
	Retention    RetentionPolicy `json:"retention"`
	MaxConsumers int             `json:"max_consumers"`
	MaxMsgs      int64           `json:"max_msgs"`
	MaxBytes     int64           `json:"max_bytes"`
	MaxAge       time.Duration   `json:"max_age"`
	MaxMsgSize   int32           `json:"max_msg_size,omitempty"`
	Storage      StorageType     `json:"storage"`
	Discard      DiscardPolicy   `json:"discard"`
	Replicas     int             `json:"num_replicas"`
	NoAck        bool            `json:"no_ack,omitempty"`
	Template     string          `json:"template_owner,omitempty"`
	Duplicates   time.Duration   `json:"duplicate_window,omitempty"`
	Placement    *Placement      `json:"placement,omitempty"`
	Mirror       *StreamSource   `json:"mirror,omitempty"`
	Sources      []*StreamSource `json:"sources,omitempty"`
}

// Placement describes stream placement requirements for a stream
type Placement struct {
	Cluster string   `json:"cluster"`
	Tags    []string `json:"tags,omitempty"`
}

// StreamSourceInfo shows information about an upstream stream source.
type StreamSourceInfo struct {
	Name   string        `json:"name"`
	Lag    uint64        `json:"lag"`
	Active time.Duration `json:"active"`
	Error  *ApiError     `json:"error,omitempty"`
}

// LostStreamData indicates msgs that have been lost during file checks and recover due to corruption
type LostStreamData struct {
	// Message IDs of lost messages
	Msgs []uint64 `json:"msgs"`
	// How many bytes were lost
	Bytes uint64 `json:"bytes"`
}

// StreamSource dictates how streams can source from other streams.
type StreamSource struct {
	Name          string          `json:"name"`
	OptStartSeq   uint64          `json:"opt_start_seq,omitempty"`
	OptStartTime  *time.Time      `json:"opt_start_time,omitempty"`
	FilterSubject string          `json:"filter_subject,omitempty"`
	External      *ExternalStream `json:"external,omitempty"`
}

// ExternalStream allows you to qualify access to a stream source in another account.
type ExternalStream struct {
	ApiPrefix     string `json:"api"`
	DeliverPrefix string `json:"deliver"`
}

type StreamInfo struct {
	Config  StreamConfig        `json:"config"`
	Created time.Time           `json:"created"`
	State   StreamState         `json:"state"`
	Cluster *ClusterInfo        `json:"cluster,omitempty"`
	Mirror  *StreamSourceInfo   `json:"mirror,omitempty"`
	Sources []*StreamSourceInfo `json:"sources,omitempty"`
}

type StreamState struct {
	Msgs      uint64          `json:"messages"`
	Bytes     uint64          `json:"bytes"`
	FirstSeq  uint64          `json:"first_seq"`
	FirstTime time.Time       `json:"first_ts"`
	LastSeq   uint64          `json:"last_seq"`
	LastTime  time.Time       `json:"last_ts"`
	Deleted   []uint64        `json:"deleted,omitempty"`
	Lost      *LostStreamData `json:"lost,omitempty"`
	Consumers int             `json:"consumer_count"`
}

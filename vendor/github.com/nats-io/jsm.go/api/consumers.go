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
	JSApiConsumerCreateT                   = "$JS.API.CONSUMER.CREATE.%s"
	JSApiDurableCreateT                    = "$JS.API.CONSUMER.DURABLE.CREATE.%s.%s"
	JSApiConsumerNamesT                    = "$JS.API.CONSUMER.NAMES.%s"
	JSApiConsumerListT                     = "$JS.API.CONSUMER.LIST.%s"
	JSApiConsumerInfoT                     = "$JS.API.CONSUMER.INFO.%s.%s"
	JSApiConsumerDeleteT                   = "$JS.API.CONSUMER.DELETE.%s.%s"
	JSApiRequestNextT                      = "$JS.API.CONSUMER.MSG.NEXT.%s.%s"
	JSApiConsumerLeaderStepDownT           = "$JS.API.CONSUMER.LEADER.STEPDOWN.%s.%s"
	JSMetricConsumerAckPre                 = JSMetricPrefix + ".CONSUMER.ACK"
	JSAdvisoryConsumerMaxDeliveryExceedPre = JSAdvisoryPrefix + ".CONSUMER.MAX_DELIVERIES"
)

// io.nats.jetstream.api.v1.consumer_delete_response
type JSApiConsumerDeleteResponse struct {
	JSApiResponse
	Success bool `json:"success,omitempty"`
}

// io.nats.jetstream.api.v1.consumer_create_request
type JSApiConsumerCreateRequest struct {
	Stream string         `json:"stream_name"`
	Config ConsumerConfig `json:"config"`
}

// io.nats.jetstream.api.v1.consumer_create_response
type JSApiConsumerCreateResponse struct {
	JSApiResponse
	*ConsumerInfo
}

// io.nats.jetstream.api.v1.consumer_info_response
type JSApiConsumerInfoResponse struct {
	JSApiResponse
	*ConsumerInfo
}

// io.nats.jetstream.api.v1.consumer_names_request
type JSApiConsumerNamesRequest struct {
	JSApiIterableRequest
}

// io.nats.jetstream.api.v1.consumer_names_response
type JSApiConsumerNamesResponse struct {
	JSApiResponse
	JSApiIterableResponse
	Consumers []string `json:"consumers"`
}

// io.nats.jetstream.api.v1.consumer_list_request
type JSApiConsumerListRequest struct {
	JSApiIterableRequest
}

// io.nats.jetstream.api.v1.consumer_list_response
type JSApiConsumerListResponse struct {
	JSApiResponse
	JSApiIterableResponse
	Consumers []*ConsumerInfo `json:"consumers"`
}

// io.nats.jetstream.api.v1.consumer_leader_stepdown_response
type JSApiConsumerLeaderStepDownResponse struct {
	JSApiResponse
	Success bool `json:"success,omitempty"`
}

type AckPolicy int

const (
	AckNone AckPolicy = iota
	AckAll
	AckExplicit
)

func (p AckPolicy) String() string {
	switch p {
	case AckNone:
		return "None"
	case AckAll:
		return "All"
	case AckExplicit:
		return "Explicit"
	default:
		return "Unknown Acknowledgement Policy"
	}
}

func (p *AckPolicy) UnmarshalJSON(data []byte) error {
	switch string(data) {
	case jsonString("none"):
		*p = AckNone
	case jsonString("all"):
		*p = AckAll
	case jsonString("explicit"):
		*p = AckExplicit
	default:
		return fmt.Errorf("can not unmarshal %q", data)
	}

	return nil
}

func (p AckPolicy) MarshalJSON() ([]byte, error) {
	switch p {
	case AckNone:
		return json.Marshal("none")
	case AckAll:
		return json.Marshal("all")
	case AckExplicit:
		return json.Marshal("explicit")
	default:
		return nil, fmt.Errorf("unknown acknowlegement policy %v", p)
	}
}

type ReplayPolicy int

const (
	ReplayInstant ReplayPolicy = iota
	ReplayOriginal
)

func (p ReplayPolicy) String() string {
	switch p {
	case ReplayInstant:
		return "Instant"
	case ReplayOriginal:
		return "Original"
	default:
		return "Unknown Replay Policy"
	}
}

func (p *ReplayPolicy) UnmarshalJSON(data []byte) error {
	switch string(data) {
	case jsonString("instant"):
		*p = ReplayInstant
	case jsonString("original"):
		*p = ReplayOriginal
	default:
		return fmt.Errorf("can not unmarshal %q", data)
	}

	return nil
}

func (p ReplayPolicy) MarshalJSON() ([]byte, error) {
	switch p {
	case ReplayOriginal:
		return json.Marshal("original")
	case ReplayInstant:
		return json.Marshal("instant")
	default:
		return nil, fmt.Errorf("unknown replay policy %v", p)
	}
}

var (
	AckAck      = []byte("+ACK")
	AckNak      = []byte("-NAK")
	AckProgress = []byte("+WPI")
	AckNext     = []byte("+NXT")
	AckTerm     = []byte("+TERM")
)

type DeliverPolicy int

const (
	DeliverAll DeliverPolicy = iota
	DeliverLast
	DeliverNew
	DeliverByStartSequence
	DeliverByStartTime
)

func (p DeliverPolicy) String() string {
	switch p {
	case DeliverAll:
		return "All"
	case DeliverLast:
		return "Last"
	case DeliverNew:
		return "New"
	case DeliverByStartSequence:
		return "By Start Sequence"
	case DeliverByStartTime:
		return "By Start Time"
	default:
		return "Unknown Deliver Policy"
	}
}

func (p *DeliverPolicy) UnmarshalJSON(data []byte) error {
	switch string(data) {
	case jsonString("all"), jsonString("undefined"):
		*p = DeliverAll
	case jsonString("last"):
		*p = DeliverLast
	case jsonString("new"):
		*p = DeliverNew
	case jsonString("by_start_sequence"):
		*p = DeliverByStartSequence
	case jsonString("by_start_time"):
		*p = DeliverByStartTime
	}

	return nil
}

func (p DeliverPolicy) MarshalJSON() ([]byte, error) {
	switch p {
	case DeliverAll:
		return json.Marshal("all")
	case DeliverLast:
		return json.Marshal("last")
	case DeliverNew:
		return json.Marshal("new")
	case DeliverByStartSequence:
		return json.Marshal("by_start_sequence")
	case DeliverByStartTime:
		return json.Marshal("by_start_time")
	default:
		return nil, fmt.Errorf("unknown deliver policy %v", p)
	}
}

// ConsumerConfig is the configuration for a JetStream consumes
//
// NATS Schema Type io.nats.jetstream.api.v1.consumer_configuration
type ConsumerConfig struct {
	Durable         string        `json:"durable_name,omitempty"`
	DeliverSubject  string        `json:"deliver_subject,omitempty"`
	DeliverPolicy   DeliverPolicy `json:"deliver_policy"`
	OptStartSeq     uint64        `json:"opt_start_seq,omitempty"`
	OptStartTime    *time.Time    `json:"opt_start_time,omitempty"`
	AckPolicy       AckPolicy     `json:"ack_policy"`
	AckWait         time.Duration `json:"ack_wait,omitempty"`
	MaxDeliver      int           `json:"max_deliver,omitempty"`
	FilterSubject   string        `json:"filter_subject,omitempty"`
	ReplayPolicy    ReplayPolicy  `json:"replay_policy"`
	SampleFrequency string        `json:"sample_freq,omitempty"`
	RateLimit       uint64        `json:"rate_limit_bps,omitempty"`
	MaxAckPending   int           `json:"max_ack_pending,omitempty"`
	Heartbeat       time.Duration `json:"idle_heartbeat,omitempty"`
	FlowControl     bool          `json:"flow_control,omitempty"`
}

// SequencePair is the consumer and stream sequence that uniquely identify a message
type SequencePair struct {
	Consumer uint64 `json:"consumer_seq"`
	Stream   uint64 `json:"stream_seq"`
}

// ConsumerInfo reports the current state of a consumer
type ConsumerInfo struct {
	Stream         string         `json:"stream_name"`
	Name           string         `json:"name"`
	Config         ConsumerConfig `json:"config"`
	Created        time.Time      `json:"created"`
	Delivered      SequencePair   `json:"delivered"`
	AckFloor       SequencePair   `json:"ack_floor"`
	NumAckPending  int            `json:"num_ack_pending"`
	NumRedelivered int            `json:"num_redelivered"`
	NumWaiting     int            `json:"num_waiting"`
	NumPending     uint64         `json:"num_pending"`
	Cluster        *ClusterInfo   `json:"cluster,omitempty"`
}

// JSApiConsumerGetNextRequest is for getting next messages for pull based consumers
//
// NATS Schema Type io.nats.jetstream.api.v1.consumer_getnext_request
type JSApiConsumerGetNextRequest struct {
	Expires time.Duration `json:"expires,omitempty"`
	Batch   int           `json:"batch,omitempty"`
	NoWait  bool          `json:"no_wait,omitempty"`
}

func jsonString(s string) string {
	return "\"" + s + "\""
}

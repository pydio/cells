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

package jsm

import (
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/nats-io/nats.go"
)

// MsgInfo holds metadata about a message that was received from JetStream
type MsgInfo struct {
	stream    string
	consumer  string
	sSeq      uint64
	cSeq      uint64
	delivered int
	pending   uint64
	ts        time.Time
}

// Stream is the stream this message is stored in
func (i *MsgInfo) Stream() string {
	return i.stream
}

// Consumer is the name of the consumer that produced this message
func (i *MsgInfo) Consumer() string {
	return i.consumer
}

// StreamSequence is the sequence of this message in the stream
func (i *MsgInfo) StreamSequence() uint64 {
	return i.sSeq
}

// ConsumerSequence is the sequence of this message in the consumer
func (i *MsgInfo) ConsumerSequence() uint64 {
	return i.cSeq
}

// Delivered is the number of times this message had delivery attempts including this one
func (i *MsgInfo) Delivered() int {
	return i.delivered
}

// TimeStamp is the time the message was received by JetStream
func (i *MsgInfo) TimeStamp() time.Time {
	return i.ts
}

// Pending is the number of messages left to consumer, -1 when the number is not reported
func (i *MsgInfo) Pending() uint64 {
	return i.pending
}

// ParseJSMsgMetadataReply parses the reply subject of a JetStream originated message
func ParseJSMsgMetadataReply(reply string) (info *MsgInfo, err error) {
	if len(reply) == 0 {
		return nil, fmt.Errorf("reply subject is not an Ack")
	}

	parts := strings.Split(reply, ".")
	c := len(parts)

	if (c != 8 && c != 9) || parts[0] != "$JS" || parts[1] != "ACK" {
		return nil, fmt.Errorf("message metadata does not appear to be an ACK")
	}

	stream := parts[2]
	consumer := parts[3]
	delivered, _ := strconv.Atoi(parts[4])
	streamSeq, _ := strconv.ParseUint(parts[5], 10, 64)
	consumerSeq, _ := strconv.ParseUint(parts[6], 10, 64)
	tsi, _ := strconv.Atoi(parts[7])
	ts := time.Unix(0, int64(tsi))
	pending := uint64(math.MaxUint64)
	if c == 9 {
		pending, _ = strconv.ParseUint(parts[8], 10, 64)
	}

	return &MsgInfo{stream, consumer, streamSeq, consumerSeq, delivered, pending, ts}, nil
}

// ParseJSMsgMetadata parse the reply subject metadata to determine message metadata
func ParseJSMsgMetadata(m *nats.Msg) (info *MsgInfo, err error) {
	return ParseJSMsgMetadataReply(m.Reply)
}

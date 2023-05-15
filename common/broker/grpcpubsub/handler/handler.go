/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package handler

import (
	"context"
	"fmt"
	"os"
	"path"
	"strings"
	"sync"
	"time"

	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	pb "github.com/pydio/cells/v4/common/proto/broker"
)

var (
	topics     map[string]*subscriber
	topicsLock sync.RWMutex
)

func init() {
	topics = make(map[string]*subscriber)
}

type Handler struct {
	pb.UnimplementedBrokerServer

	broker      broker.Broker
	subscribers map[string][]string
}

func NewHandler(b broker.Broker) *Handler {
	return &Handler{
		broker: b,
	}
}

func (h *Handler) Name() string {
	return common.ServiceGrpcNamespace_ + common.ServiceBroker
}

// Publish receives events from remote client and forwards them to the internal broker.
func (h *Handler) Publish(stream pb.Broker_PublishServer) error {
	for {
		req, err := stream.Recv()
		if err != nil {
			if !strings.Contains(err.Error(), "context canceled") {
				fmt.Println("[discovery/grpc/broker] Publish: Error is ", err)
			}
			return err
		}

		for _, message := range req.Messages {
			if err := h.broker.PublishRaw(stream.Context(), path.Base(req.Topic), message.Body, message.Header); err != nil {
				return err
			}
		}
	}
}

// Subscribe forwards subscriptions from remote clients
func (h *Handler) Subscribe(stream pb.Broker_SubscribeServer) error {
	subPID := ""
	if md, ok := metadata.FromIncomingContext(stream.Context()); ok {
		subPID = strings.Join(md["cells-subscriber-id"], "")
	}

	for {
		req, err := stream.Recv()
		if err != nil {
			return err
		}
		id := req.GetId()
		topic := req.GetTopic()
		queue := req.GetQueue()
		topicKey := topic
		if queue != "" {
			topicKey += ":" + queue
		}

		topicsLock.RLock()
		if sub, ok := topics[topicKey]; ok {
			//fmt.Println("Receive subscribe on", topicKey, "from", subPID, "appending stream to existing subscription")
			sub.streams = append(sub.streams, newStreamWithReqId(id, stream))
			defer sub.removeStreamById(id)
			topicsLock.RUnlock()
			continue
		} else {
			topicsLock.RUnlock()
		}

		//fmt.Println("Receive subscribe on", topicKey, "from", subPID, "creating new internal subscription")
		sub := &subscriber{
			subPID: subPID,
			topic:  topicKey,
			queue:  queue,
			ch:     make(chan *pb.SubscribeResponse),
			streams: []streamWithReqId{
				newStreamWithReqId(id, stream),
			},
		}
		topicsLock.Lock()
		topics[topicKey] = sub
		topicsLock.Unlock()

		go sub.dispatch()
		defer sub.removeStreamById(id)
		var oo []broker.SubscribeOption
		if queue != "" {
			oo = append(oo, broker.Queue(queue))
		}
		unSub, e := h.broker.Subscribe(stream.Context(), topic, func(ctx context.Context, msg broker.Message) error {
			var target = &pb.Message{}
			target.Header, target.Body = msg.RawData()
			sub.ch <- &pb.SubscribeResponse{
				Id:       req.Id,
				Messages: []*pb.Message{target},
			}
			return nil
		}, oo...)
		if e != nil {
			return e
		}
		sub.unsub = unSub
	}
}

func newStreamWithReqId(id string, stream pb.Broker_SubscribeServer) streamWithReqId {
	return streamWithReqId{
		id:     id,
		stream: stream,
		Mutex:  &sync.Mutex{},
	}
}

type streamWithReqId struct {
	*sync.Mutex
	id     string
	stream pb.Broker_SubscribeServer
}

type subscriber struct {
	topic   string
	queue   string
	streams []streamWithReqId
	ch      chan *pb.SubscribeResponse
	unsub   broker.UnSubscriber
	subPID  string
	round   int
}

func (s *subscriber) dispatch() {
	for resp := range s.ch {
		if s.queue != "" && len(s.streams) > 1 {
			// RoundRobin on registered streams
			s.round = (s.round + 1) % len(s.streams)
			go s.sendWithWarning(s.streams[s.round], resp)
		} else {
			// Dispatch to all streams
			for _, stream := range s.streams {
				go s.sendWithWarning(stream, resp)
			}
		}
	}
}

func (s *subscriber) sendWithWarning(streamer streamWithReqId, message *pb.SubscribeResponse) {
	streamer.Lock()
	done := make(chan bool)
	defer close(done)
	go func() {
		defer streamer.Unlock() // Unlock streamer anyway
		select {
		case <-done:
			return
		case <-time.After(30 * time.Second):
			fmt.Println("GRPC broker stream.Send stuck after 30s", "subscriber was "+s.subPID)
			return
		}
	}()
	cop := proto.Clone(message).(*pb.SubscribeResponse)
	cop.Id = streamer.id
	if er := streamer.stream.Send(cop); er != nil {
		fmt.Println(os.Getpid(), "Grpc.sendWithWarning: there was an error while sending to stream : "+er.Error())
	}
}

func (s *subscriber) removeStreamById(id string) {
	var ss []streamWithReqId
	for _, st := range s.streams {
		if st.id == id {
			continue
		}
		ss = append(ss, st)
	}
	s.streams = ss
	if len(s.streams) == 0 {
		s.unregister()
	}
}

func (s *subscriber) unregister() {
	//fmt.Println("Grpc Handler : unregistering dispatcher", s.topic)
	if s.unsub != nil {
		s.unsub()
	}
	topicsLock.Lock()
	defer topicsLock.Unlock()
	delete(topics, s.topic)
}

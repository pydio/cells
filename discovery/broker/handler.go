package broker

import (
	"fmt"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	pb "github.com/pydio/cells/v4/common/proto/broker"
	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/proto"
	"strings"
	"sync"
	"time"
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
			if err := h.broker.PublishRaw(stream.Context(), req.Topic, message.Body, message.Header); err != nil {
				return err
			}
		}
	}
}

// Subscribe forwards subscriptions from remote clients
func (h *Handler) Subscribe(stream pb.Broker_SubscribeServer) error {
	subPID := ""
	if md, ok := metadata.FromIncomingContext(stream.Context()); ok {
		subPID = strings.Join(md["subscriberid"], "")
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
			sub.streams = append(sub.streams, streamWithReqId{id: id, stream: stream})
			defer sub.removeStreamById(id)
			topicsLock.RUnlock()
			continue
		} else {
			topicsLock.RUnlock()
		}

		//fmt.Println("Receive subscribe on", topicKey, "from", subPID, "creating new internal subscription")
		sub := &subscriber{
			subPID:  subPID,
			topic:   topicKey,
			queue:   queue,
			ch:      make(chan *pb.SubscribeResponse),
			streams: []streamWithReqId{{id: id, stream: stream}},
		}
		topicsLock.Lock()
		topics[topicKey] = sub
		topicsLock.Unlock()

		go sub.dispatch()
		defer sub.removeStreamById(id)

		unSub, e := h.broker.Subscribe(stream.Context(), topic, func(msg broker.Message) error {
			var target = &pb.Message{}
			target.Header, target.Body = msg.RawData()
			sub.ch <- &pb.SubscribeResponse{
				Id:       req.Id,
				Messages: []*pb.Message{target},
			}
			return nil
		})
		if e != nil {
			return e
		}
		sub.unsub = unSub
	}
}

type streamWithReqId struct {
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
			s.sendWithWarning(s.streams[s.round], resp)
		} else {
			// Dispatch to all streams
			for _, stream := range s.streams {
				s.sendWithWarning(stream, resp)
			}
		}
	}
}

func (s *subscriber) sendWithWarning(streamer streamWithReqId, message *pb.SubscribeResponse) {
	done := make(chan bool)
	defer close(done)
	go func() {
		select {
		case <-done:
			return
		case <-time.After(10 * time.Second):
			fmt.Println("GRPC broker stream.Send stuck after 10s", "subscriber was "+s.subPID)
			return
		}
	}()
	cop := proto.Clone(message).(*pb.SubscribeResponse)
	cop.Id = streamer.id
	if er := streamer.stream.Send(cop); er != nil {
		fmt.Println("There was an error while sending to stream")
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
	s.unsub()
	topicsLock.Lock()
	defer topicsLock.Unlock()
	delete(topics, s.topic)
}

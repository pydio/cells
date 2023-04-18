// Copyright 2018 The Go Cloud Development Kit Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package grpcpubsub

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"sync"

	"gocloud.dev/gcerrors"
	"gocloud.dev/pubsub"
	"gocloud.dev/pubsub/driver"
	"google.golang.org/grpc/metadata"

	clientcontext "github.com/pydio/cells/v4/common/client/context"
	"github.com/pydio/cells/v4/common/client/grpc"
	pb "github.com/pydio/cells/v4/common/proto/broker"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var (
	publishers  = make(map[string]pb.Broker_PublishClient)
	pubLock     sync.Mutex
	subscribers = make(map[string]*sharedSubscriber)
	subLock     sync.Mutex
)

type sharedSubscriber struct {
	pb.Broker_SubscribeClient
	cancel context.CancelFunc
	host   string
	out    map[string]chan []*pb.Message
	sync.RWMutex
}

func (s *sharedSubscriber) Dispatch() {
	for {
		resp, err := s.Recv()
		if err != nil {
			return
		}
		s.RLock()
		if ch, ok := s.out[resp.Id]; ok {
			ch <- resp.Messages
		}
		s.RUnlock()
	}
}

func (s *sharedSubscriber) Subscribe(subId string, ch chan []*pb.Message) {
	s.Lock()
	defer s.Unlock()
	s.out[subId] = ch
}

func (s *sharedSubscriber) Unsubscribe(subId string) {
	s.Lock()
	defer s.Unlock()
	delete(s.out, subId)
	if len(s.out) == 0 && s.cancel != nil {
		s.cancel()
		delete(subscribers, s.host)
	}
}

func init() {
	o := new(URLOpener)
	for _, scheme := range schemes {
		pubsub.DefaultURLMux().RegisterTopic(scheme, o)
		pubsub.DefaultURLMux().RegisterSubscription(scheme, o)
	}
}

// Scheme is the URL scheme grpc pubsub registers its URLOpeners under on pubsub.DefaultMux.
var schemes = []string{"grpc", "xds"}

// URLOpener opens grpc pubsub URLs like "cells://topic".
//
// The URL's host+path is used as the topic to create or subscribe to.
//
// Query parameters:
//   - ackdeadline: The ack deadline for OpenSubscription, in time.ParseDuration formats.
//     Defaults to 1m.
type URLOpener struct {
	mu     sync.Mutex
	topics map[string]*pubsub.Topic
}

// OpenTopicURL opens a pubsub.Topic based on u.
func (o *URLOpener) OpenTopicURL(ctx context.Context, u *url.URL) (*pubsub.Topic, error) {

	pubLock.Lock()
	defer pubLock.Unlock()
	if _, ok := publishers[u.Host]; !ok {
		conn := clientcontext.GetClientConn(ctx)
		if conn == nil {
			return nil, errors.New("no connection provided")
		}

		conn = grpc.NewClientConn("pydio.grpc.broker", grpc.WithClientConn(conn))

		cli := pb.NewBrokerClient(conn)
		if s, err := cli.Publish(ctx); err != nil {
			return nil, err
		} else {
			publishers[u.Host] = s
		}
	}

	topicName := strings.TrimPrefix(u.Path, "/")

	return NewTopic(topicName, u.Host, WithPublisher(publishers[u.Host]))
}

// OpenSubscriptionURL opens a pubsub.Subscription based on u.
func (o *URLOpener) OpenSubscriptionURL(ctx context.Context, u *url.URL) (*pubsub.Subscription, error) {

	topicName := strings.TrimPrefix(u.Path, "/")
	queue := u.Query().Get("queue")

	//return NewSubscription(topicName, WithContext(ctx))

	subLock.Lock()
	sub, ok := subscribers[u.Host]
	if !ok {
		conn := clientcontext.GetClientConn(ctx)
		if conn == nil {
			return nil, errors.New("no connection provided")
		}

		conn = grpc.NewClientConn("pydio.grpc.broker", grpc.WithClientConn(conn))

		ct, ca := context.WithCancel(ctx)
		ct = metadata.AppendToOutgoingContext(ct, "cells-subscriber-id", strings.Join(runtime.ProcessStartTags(), " "))
		cli, err := pb.NewBrokerClient(conn).Subscribe(ct)
		if err != nil {
			ca()
			return nil, err
		}
		sub = &sharedSubscriber{
			Broker_SubscribeClient: cli,
			host:                   u.Host,
			cancel:                 ca,
			out:                    make(map[string]chan []*pb.Message),
		}
		subscribers[u.Host] = sub
		go sub.Dispatch()
	}
	subLock.Unlock()

	return NewSubscription(topicName, WithQueue(queue), WithContext(ctx), WithSubscriber(sub))
}

var errNotExist = errors.New("cellspubsub: topic does not exist")

type topic struct {
	path   string
	stream Publisher
	pubKey string
}

// NewTopic creates a new in-memory topic.
func NewTopic(path, pubKey string, opts ...Option) (*pubsub.Topic, error) {
	var options Options
	for _, o := range opts {
		o(&options)
	}

	ctx := options.Context
	if ctx == nil {
		ctx = context.Background()
	}

	// extract the client from the context, fallback to grpc
	var stream Publisher
	if ctx != nil {
		if v := ctx.Value(publisherKey{}); v != nil {
			if c, ok := v.(Publisher); ok {
				stream = c
			}
		}
	}

	if stream == nil {
		conn := clientcontext.GetClientConn(ctx)
		if conn == nil {
			return nil, errors.New("no connection provided")
		}
		cli := pb.NewBrokerClient(conn)
		if s, err := cli.Publish(ctx); err != nil {
			return nil, err
		} else {
			stream = s
		}
	}

	return pubsub.NewTopic(&topic{
		path:   path,
		stream: stream,
		pubKey: pubKey,
	}, nil), nil
}

// SendBatch implements driver.Topic.SendBatch.
// It is error if the topic is closed or has no subscriptions.
func (t *topic) SendBatch(ctx context.Context, dms []*driver.Message) error {
	if t == nil || t.stream == nil {
		return errors.New("nil variable")
	}

	var ms []*pb.Message
	for _, dm := range dms {
		psm := &pb.Message{Body: dm.Body, Header: dm.Metadata}
		if dm.BeforeSend != nil {
			asFunc := func(i interface{}) bool {
				if p, ok := i.(**pb.Message); ok {
					*p = psm
					return true
				}
				return false
			}
			if err := dm.BeforeSend(asFunc); err != nil {
				return err
			}
		}
		ms = append(ms, psm)
	}
	req := &pb.PublishRequest{Topic: t.path, Messages: ms}
	if err := t.stream.Send(req); err != nil {
		return err
	}

	//for n, dm := range dms {
	//	if dm.AfterSend != nil {
	//		asFunc := func(i interface{}) bool {
	//			if p, ok := i.(*string); ok {
	//				*p = pr.MessageIds[n]
	//				return true
	//			}
	//			return false
	//		}
	//		if err := dm.AfterSend(asFunc); err != nil {
	//			return err
	//		}
	//	}
	//}

	return nil
}

// IsRetryable implements driver.Topic.IsRetryable.
func (*topic) IsRetryable(error) bool { return false }

// As implements driver.Topic.As.
// It supports *topic so that NewSubscription can recover a *topic
// from the portable type (see below). External users won't be able
// to use As because topic isn't exported.
func (t *topic) As(i interface{}) bool {
	x, ok := i.(**topic)
	if !ok {
		return false
	}
	*x = t
	return true
}

// ErrorAs implements driver.Topic.ErrorAs
func (*topic) ErrorAs(error, interface{}) bool {
	return false
}

// ErrorCode implements driver.Topic.ErrorCode
func (*topic) ErrorCode(err error) gcerrors.ErrorCode {
	if err == errNotExist {
		return gcerrors.NotFound
	}
	return gcerrors.Unknown
}

// Close implements driver.Topic.Close.
func (t *topic) Close() error {
	if t.pubKey != "" {
		pubLock.Lock()
		delete(publishers, t.pubKey)
		pubLock.Unlock()
	}
	return nil
}

type subscription struct {
	in     chan []*pb.Message
	closer func() error
}

// NewSubscription returns a *pubsub.Subscription representing a NATS subscription or NATS queue subscription.
// The subject is the NATS Subject to subscribe to;
// for more info, see https://nats.io/documentation/writing_applications/subjects.
func NewSubscription(path string, opts ...Option) (*pubsub.Subscription, error) {
	var options Options
	for _, o := range opts {
		o(&options)
	}

	ctx := options.Context
	if ctx == nil {
		ctx = context.Background()
	}

	subId := uuid.New()

	// extract the client from the context
	var ch chan []*pb.Message
	var cli pb.Broker_SubscribeClient
	var closer func() error

	if ctx != nil {
		if v := ctx.Value(subscriberKey{}); v != nil {
			if c, ok := v.(*sharedSubscriber); ok {
				ch = make(chan []*pb.Message, 5000)
				cli = c
				c.Subscribe(subId, ch)
				closer = func() error {
					c.Unsubscribe(subId)
					return nil
				}
			}
		}
	}

	if cli == nil {
		return nil, fmt.Errorf("please pass a shared subscriber in the subscription options")
	}

	req := &pb.SubscribeRequest{
		Id:    subId,
		Topic: path,
		Queue: options.Queue,
	}
	if err := cli.Send(req); err != nil {
		return nil, err
	}

	return pubsub.NewSubscription(&subscription{
		in:     ch,
		closer: closer,
	}, nil, nil), nil
}

// ReceiveBatch implements driver.ReceiveBatch.
func (s *subscription) ReceiveBatch(ctx context.Context, maxMessages int) ([]*driver.Message, error) {
	if s == nil || s.in == nil {
		return nil, errors.New("nil variable")
	}

	msgs := <-s.in

	var dms []*driver.Message
	for _, msg := range msgs {
		dms = append(dms, &driver.Message{
			Body:     msg.Body,
			Metadata: msg.Header,
		})
	}
	return dms, nil
}

// SendAcks implements driver.Subscription.SendAcks.
func (s *subscription) SendAcks(ctx context.Context, ids []driver.AckID) error {
	// Ack is a no-op.
	return nil
}

// CanNack implements driver.CanNack.
func (s *subscription) CanNack() bool { return false }

// SendNacks implements driver.Subscription.SendNacks. It should never be called
// because we return false for CanNack.
func (s *subscription) SendNacks(ctx context.Context, ids []driver.AckID) error {
	panic("unreachable")
}

// IsRetryable implements driver.Subscription.IsRetryable.
func (s *subscription) IsRetryable(error) bool { return false }

// As implements driver.Subscription.As.
func (s *subscription) As(i interface{}) bool {
	return false
}

// ErrorAs implements driver.Subscription.ErrorAs
func (*subscription) ErrorAs(error, interface{}) bool {
	return false
}

// ErrorCode implements driver.Subscription.ErrorCode
func (*subscription) ErrorCode(err error) gcerrors.ErrorCode {
	if err == errNotExist {
		return gcerrors.NotFound
	}
	return gcerrors.Unknown
}

// Close implements driver.Subscription.Close.
func (s *subscription) Close() error {
	if s.closer == nil {
		return nil
	}
	return s.closer()
}

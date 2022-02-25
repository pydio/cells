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

package service

import (
	"context"
	"errors"
	"net/url"
	"sync"

	"gocloud.dev/gcerrors"
	"gocloud.dev/pubsub"
	"gocloud.dev/pubsub/driver"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	pb "github.com/pydio/cells/v4/common/proto/broker"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var (
	publishers  = make(map[string]pb.Broker_PublishClient)
	subscribers = make(map[string]*subscriber)
)

type subscriber struct {
	pb.Broker_SubscribeClient
	out map[string]*subscriptionReceiver
}

type subscriptionReceiver struct {
	ch chan (*pb.SubscribeResponse)
}

func (s *subscriptionReceiver) Recv() (*pb.SubscribeResponse, error) {
	return <-s.ch, nil
}

func init() {
	o := new(URLOpener)
	pubsub.DefaultURLMux().RegisterTopic(Scheme, o)
	pubsub.DefaultURLMux().RegisterSubscription(Scheme, o)
}

// Scheme is the URL scheme grpc pubsub registers its URLOpeners under on pubsub.DefaultMux.
const Scheme = "grpc"

// URLOpener opens grpc pubsub URLs like "cells://topic".
//
// The URL's host+path is used as the topic to create or subscribe to.
//
// Query parameters:
//   - ackdeadline: The ack deadline for OpenSubscription, in time.ParseDuration formats.
//       Defaults to 1m.
type URLOpener struct {
	mu     sync.Mutex
	topics map[string]*pubsub.Topic
}

// OpenTopicURL opens a pubsub.Topic based on u.
func (o *URLOpener) OpenTopicURL(ctx context.Context, u *url.URL) (*pubsub.Topic, error) {

	if _, ok := publishers[u.Host]; !ok {
		// TODO v4 - there is something weird here that makes the start go slower
		conn := grpc.GetClientConnFromCtx(ctx, common.ServiceBroker)
		cli := pb.NewBrokerClient(conn)
		if s, err := cli.Publish(ctx); err != nil {
			return nil, err
		} else {
			publishers[u.Host] = s
		}
	}

	topicName := u.Path
	return NewTopic(topicName, WithPublisher(publishers[u.Host]))
}

// OpenSubscriptionURL opens a pubsub.Subscription based on u.
func (o *URLOpener) OpenSubscriptionURL(ctx context.Context, u *url.URL) (*pubsub.Subscription, error) {
	//q := u.Query()
	//
	//ackDeadline := 1 * time.Minute
	//if s := q.Get("ackdeadline"); s != "" {
	//	var err error
	//	ackDeadline, err = time.ParseDuration(s)
	//	if err != nil {
	//		return nil, fmt.Errorf("open subscription %v: invalid ackdeadline %q: %v", u, s, err)
	//	}
	//	q.Del("ackdeadline")
	//}
	//for param := range q {
	//	return nil, fmt.Errorf("open subscription %v: invalid query parameter %q", u, param)
	//}

	topicName := u.Path

	return NewSubscription(topicName, WithContext(ctx) /*, WithSubscriber(sub)*/)

	/*
		// TODO V4 - Not working yet (see below), and in fact opening a double connection !

		sub, ok := subscribers[u.Host]
		if !ok {
			conn := grpc.GetClientConnFromCtx(ctx, common.ServiceBroker)
			cli, err := pb.NewBrokerClient(conn).Subscribe(ctx)
			if err != nil {
				return nil, err
			}

			sub = new(subscriber)
			sub.Broker_SubscribeClient = cli
			sub.out = make(map[string]*subscriptionReceiver)

			subscribers[u.Host] = sub

			go func() {
				for {
					resp, err := cli.Recv()
					if err != nil {
						return
					}

					for subId, sub := range subscribers[u.Host].out {
						if subId == resp.Id {
							sub.ch <- resp
						}
					}
				}
			}()
		}

		subId := uuid.New()
		req := &pb.SubscribeRequest{Id: subId, Topic: topicName}
		if err := sub.Broker_SubscribeClient.Send(req); err != nil {
			return nil, err
		}

		subReceiver := &subscriptionReceiver{
			ch: make(chan *pb.SubscribeResponse),
		}

		sub.out[subId] = subReceiver

		return NewSubscription(topicName, WithContext(ctx), WithSubscriber(sub))

	*/
}

var errNotExist = errors.New("cellspubsub: topic does not exist")

type topic struct {
	path   string
	stream Publisher
}

// NewTopic creates a new in-memory topic.
func NewTopic(path string, opts ...Option) (*pubsub.Topic, error) {
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
		conn := grpc.GetClientConnFromCtx(ctx, common.ServiceBroker)
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
func (*topic) Close() error { return nil }

type subscription struct {
	in chan []*pb.Message
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

	// extract the client from the context, fallback to grpc
	var ch chan []*pb.Message
	if ctx != nil {
		if v := ctx.Value(subscriberKey{}); v != nil {
			// TODO V4 : Not working, we currently pass a Subscriber via the WithSubscriber option, not a chan[]*pb.Message
			if c, ok := v.(chan []*pb.Message); ok {
				ch = c
			}
		}
	}

	if ch == nil {
		ch = make(chan []*pb.Message)
		conn := grpc.GetClientConnFromCtx(ctx, common.ServiceBroker)
		// req := &pb.SubscribeRequest{Topic: path, Queue: options.Queue}
		cli, err := pb.NewBrokerClient(conn).Subscribe(ctx)
		if err != nil {
			return nil, err
		}

		subId := uuid.New()

		go func() {
			for {
				resp, err := cli.Recv()
				if err != nil {
					return
				}

				if subId == resp.Id {
					ch <- resp.Messages
				}
			}
		}()

		req := &pb.SubscribeRequest{Id: subId, Topic: path}
		if err := cli.Send(req); err != nil {
			return nil, err
		}
	}

	return pubsub.NewSubscription(&subscription{
		in: ch,
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
func (*subscription) Close() error { return nil }

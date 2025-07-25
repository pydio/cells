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

package broker

import (
	"context"
	"fmt"
	"net/url"
	"runtime"
	"strconv"
	"strings"
	"sync"

	"gocloud.dev/pubsub"
	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/middleware"
	"github.com/pydio/cells/v5/common/telemetry/metrics"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

type brokerKey struct{}

var (
	std           = NewBroker("mem://")
	topicReplacer = strings.NewReplacer("-", "_", ".", "_")
	ContextKey    = brokerKey{}
)

func Register(b Broker) {
	std = b
}

func Default() Broker {
	return std
}

type Broker interface {
	PublishRaw(context.Context, string, []byte, map[string]string, ...PublishOption) error
	Publish(context.Context, string, proto.Message, ...PublishOption) error
	Subscribe(context.Context, string, SubscriberHandler, ...SubscribeOption) (UnSubscriber, error)
}

type UnSubscriber func() error

type SubscriberHandler func(ctx context.Context, msg Message) error

// NewBroker wraps a standard broker but prevents it from disconnecting while there still is a service running
func NewBroker(s string, opts ...Option) Broker {

	opts = append(opts,
		WithChainSubscriberInterceptor(
			TimeoutSubscriberInterceptor(),
			HeaderInjectorInterceptor(),
			ContextInjectorInterceptor(),
		),
	)

	options := newOptions(opts...)
	u, err := url.Parse(s)
	if err != nil {
		panic(err)
	}
	scheme := u.Scheme

	br := &broker{
		publishOpener: func(ctx context.Context, topic string) (*pubsub.Topic, error) {
			namespace := u.Query().Get("namespace")
			uu := &url.URL{User: u.User, Scheme: u.Scheme, Host: u.Host, Path: namespace + "/" + strings.TrimPrefix(topic, "/"), RawQuery: u.RawQuery}
			return pubsub.OpenTopic(ctx, uu.String())
		},
		subscribeOpener: func(ctx context.Context, topic string, oo ...SubscribeOption) (*pubsub.Subscription, error) {
			// Handle queue for grpc vs. nats vs memory
			op := &SubscribeOptions{Context: ctx}
			for _, o := range oo {
				o(op)
			}

			q, _ := url.ParseQuery(u.RawQuery)
			if op.Queue != "" {
				switch scheme {
				case "nats", "grpc", "xds":
					q.Add("queue", op.Queue)
				default:
				}
			}

			namespace := u.Query().Get("namespace")

			uu := &url.URL{User: u.User, Scheme: u.Scheme, Host: u.Host, Path: namespace + "/" + strings.TrimPrefix(topic, "/"), RawQuery: q.Encode()}
			return pubsub.OpenSubscription(ctx, uu.String())
		},
		publishers: make(map[string]*pubsub.Topic),
		Options:    options,
	}

	chainPublisherInterceptors(br)
	chainSubscriberInterceptors(br)

	if options.Context != nil {
		go func() {
			<-options.Context.Done()
			br.closeTopics(options.Context)
		}()
	}

	return br
}

// PublishRaw sends a message to standard broker. For the moment, forward message to client.Publish
func PublishRaw(ctx context.Context, topic string, body []byte, header map[string]string, opts ...PublishOption) error {
	return std.PublishRaw(ctx, topic, body, header, opts...)
}

// Publish sends a message to standard broker. For the moment, forward message to client.Publish
func Publish(ctx context.Context, topic string, message proto.Message, opts ...PublishOption) error {
	metrics.Helper().Counter("pub_"+topicReplacer.Replace(topic), "Total number of messages sent on a given topic").Inc(1)
	return std.Publish(ctx, topic, message, opts...)
}

// MustPublish publishes a message ignoring the error
func MustPublish(ctx context.Context, topic string, message proto.Message, opts ...PublishOption) {
	err := Publish(ctx, topic, message, opts...)
	if err != nil {
		fmt.Printf("[Message Publication Error] Topic: %s, Error: %v\n", topic, err)
	}
}

func SubscribeCancellable(ctx context.Context, topic string, handler SubscriberHandler, opts ...SubscribeOption) error {
	if _, file, line, ok := runtime.Caller(1); ok {
		opts = append(opts, WithCallee(file, line))
	}
	// Go through Subscribe to parse MessageQueue option
	unsub, e := Subscribe(ctx, topic, handler, opts...)
	if e != nil {
		if errors.Is(e, context.Canceled) {
			return nil
		}
		return e
	}
	go func() {
		<-ctx.Done()
		_ = unsub()
	}()

	return nil
}

func Subscribe(root context.Context, topic string, handler SubscriberHandler, opts ...SubscribeOption) (UnSubscriber, error) {
	so := parseSubscribeOptions(topic, opts...)
	if so.CalleeFile == "" {
		if _, file, line, ok := runtime.Caller(1); ok {
			opts = append(opts, WithCallee(file, line))
			so.CalleeFile = file
			so.CalleeLine = line
		}
	}
	root = context.WithValue(root, "CalleeFile", so.CalleeFile)
	root = context.WithValue(root, "CalleeLine", strconv.Itoa(so.CalleeLine))
	root = context.WithValue(root, "CalleeTopic", topic)

	// Wrap Handler for counters
	id := "sub_" + topicReplacer.Replace(topic)
	c := metrics.TaggedHelper(map[string]string{"subscriber": so.CounterName}).Counter(id)
	wh := func(ctx context.Context, m Message) error {
		c.Inc(1)
		return so.HandleError(ctx, handler(ctx, m))
	}

	// Wrap handler in Queue
	if len(so.AsyncQueuePool) > 0 {
		openerID := uuid.New()
		qH := func(ctx context.Context, m Message) error {
			openReso := map[string]interface{}{
				OpenerIDKey: openerID,
				OpenerFuncKey: OpenWrapper(func(q AsyncQueue) (AsyncQueue, error) {
					err := q.Consume(func(ctx context.Context, mm ...Message) {
						for _, mess := range mm {
							_ = so.HandleError(ctx, wh(ctx, mess))
						}
					})
					return q, err
				}),
			}
			var q AsyncQueue
			var er error
			for _, po := range so.AsyncQueuePool {
				if q, er = po.AsyncQueuePool.Get(ctx, openReso, po.Resolution); er == nil {
					break
				}
			}
			if er != nil {
				return er
			}
			return q.PushRaw(ctx, m)
		}
		// Replace original handler
		return std.Subscribe(root, topic, qH, opts...)
	}

	return std.Subscribe(root, topic, wh, opts...)
}

type broker struct {
	sync.Mutex
	publishOpener   TopicOpener
	subscribeOpener SubscribeOpener
	publishers      map[string]*pubsub.Topic
	Options
}

type TopicOpener func(context.Context, string) (*pubsub.Topic, error)

type SubscribeOpener func(context.Context, string, ...SubscribeOption) (*pubsub.Subscription, error)

func (b *broker) openTopic(ctx context.Context, topic string) (*pubsub.Topic, error) {
	b.Lock()
	defer b.Unlock()
	publisher, ok := b.publishers[topic]
	if !ok {
		var err error
		publisher, err = b.publishOpener(ctx, topic)
		if err != nil {
			return nil, err
		}
		b.publishers[topic] = publisher
	}

	return publisher, nil
}

func (b *broker) closeTopics(c context.Context) {
	b.Lock()
	defer b.Unlock()
	for t, p := range b.publishers {
		_ = p.Shutdown(c)
		delete(b.publishers, t)
	}
}

func (b *broker) PublishRaw(ctx context.Context, topic string, body []byte, header map[string]string, opts ...PublishOption) error {
	publisher, er := b.openTopic(ctx, topic)
	if er != nil {
		return er
	}

	if err := publisher.Send(ctx, &pubsub.Message{
		Body:     body,
		Metadata: header,
	}); err != nil {
		return err
	}

	return nil
}

// Publish sends a message to standard broker. For the moment, forward message to client.Publish
func (b *broker) Publish(ctx context.Context, topic string, message proto.Message, opts ...PublishOption) error {
	body, err := proto.Marshal(message)
	if err != nil {
		return err
	}

	header := make(map[string]string)
	if hh, ok := propagator.FromContextRead(ctx); ok {
		for k, v := range hh {
			header[k] = v
		}
	}
	gc := middleware.ApplyGRPCOutgoingContextModifiers(ctx)
	if md, ok := metadata.FromOutgoingContext(gc); ok {
		for k, v := range md {
			header[k] = strings.Join(v, "")
		}
	}

	publisher, err := b.openTopic(ctx, topic)
	if err != nil {
		return err
	}

	if er := publisher.Send(ctx, &pubsub.Message{
		Body:     body,
		Metadata: header,
	}); er != nil {
		return err
	}

	return nil
}

func (b *broker) Subscribe(ctx context.Context, topic string, handler SubscriberHandler, opts ...SubscribeOption) (UnSubscriber, error) {
	so := parseSubscribeOptions(topic, opts...)
	if so.CalleeFile == "" {
		if _, file, line, ok := runtime.Caller(1); ok {
			so.CalleeFile = file
			so.CalleeLine = line
		}
	}

	// Making sure topic is opened
	_, err := b.openTopic(ctx, topic)
	if err != nil {
		return nil, err
	}

	sub, err := b.subscribeOpener(ctx, topic, opts...)
	if err != nil {
		return nil, err
	}

	go func() {
		for {
			msg, er := sub.Receive(ctx)
			if er != nil {
				break
			}
			metaCopy := make(map[string]string, len(msg.Metadata))
			for k, v := range msg.Metadata {
				metaCopy[k] = v
			}
			msg.Ack()
			var subErr error
			if b.Options.subscriberInt != nil {
				subErr = b.Options.subscriberInt(ctx, &message{
					header: metaCopy,
					body:   msg.Body,
				}, handler)
			} else {
				subErr = handler(ctx, &message{
					header: metaCopy,
					body:   msg.Body,
				})
			}
			_ = so.HandleError(ctx, subErr)
		}
	}()

	return func() error {
		return sub.Shutdown(ctx)
	}, nil
}

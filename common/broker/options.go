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

	"gocloud.dev/pubsub"

	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

type SubscriptionErrorHandler func(context.Context, *SubscribeOptions, error)

var (
	defaultSubscriptionErrorHandler SubscriptionErrorHandler = func(_ context.Context, o *SubscribeOptions, err error) {
		fmt.Println(o.HandleErrorToString(err), err)
	}
)

// Options to the broker
type Options struct {
	Context          context.Context
	beforeDisconnect []func() error

	publisherInt  PublisherInterceptor
	subscriberInt SubscriberInterceptor

	chainPublisherInts  []PublisherInterceptor
	chainSubscriberInts []SubscriberInterceptor
}

// Option definition
type Option func(*Options)

func newOptions(opts ...Option) Options {
	opt := Options{}

	for _, o := range opts {
		o(&opt)
	}

	return opt
}

func WithContext(ctx context.Context) Option {
	return func(options *Options) {
		options.Context = ctx
	}
}

// WithChainPublisherInterceptor synchronously modifies the pushed messages
func WithChainPublisherInterceptor(interceptors ...PublisherInterceptor) Option {
	return func(options *Options) {
		options.chainPublisherInts = append(options.chainPublisherInts, interceptors...)
	}
}

// WithChainSubscriberInterceptor synchronously modifies the received messages
func WithChainSubscriberInterceptor(interceptors ...SubscriberInterceptor) Option {
	return func(options *Options) {
		options.chainSubscriberInts = append(options.chainSubscriberInts, interceptors...)
	}
}

// BeforeDisconnect registers all functions to be triggered before the broker disconnect
func BeforeDisconnect(f func() error) Option {
	return func(o *Options) {
		o.beforeDisconnect = append(o.beforeDisconnect, f)
	}
}

// PublishOptions holds various configurations for publishing
type PublishOptions struct {
	Context context.Context

	MessageQueueURLs []string
}

type PublishOption func(options *PublishOptions)

// WithAsyncPublisherInterceptor registers a FIFO-like queue to intercept the pushed messages and send them
// asynchronously after pre-processing
func WithAsyncPublisherInterceptor(queueURL string, fallbackURLs ...string) PublishOption {
	return func(options *PublishOptions) {
		options.MessageQueueURLs = append(options.MessageQueueURLs, queueURL)
		options.MessageQueueURLs = append(options.MessageQueueURLs, fallbackURLs...)
	}
}

func PublishContext(ctx context.Context) PublishOption {
	return func(options *PublishOptions) {
		options.Context = ctx
	}
}

// SubscribeOptions holds configuration for subscribers
type SubscribeOptions struct {
	// Subscribers with the same queue name
	// will create a shared subscription where each
	// receives a subset of messages.
	Queue string

	// Other options for implementations of the interface
	// can be stored in a context
	Context context.Context

	// Optional MessageQueue than can debounce/persist
	// received messages and re-process them later on.
	// They should be dynamically opened based on the input context
	MessageQueueURLs []string
	MessageQueuePool *openurl.Pool[MessageQueue]

	// Optional name for metrics
	CounterName string

	// Hints used when handling errors with default error handler
	TopicName  string
	CalleeFile string
	CalleeLine int

	// Overrides default error handler
	customErrorHandler func(context.Context, *SubscribeOptions, error)
}

type SubscribeOption func(*SubscribeOptions)

func parseSubscribeOptions(topic string, opts ...SubscribeOption) SubscribeOptions {
	opt := SubscribeOptions{
		TopicName:   topic,
		CounterName: uuid.New()[0:6],
	}

	for _, o := range opts {
		o(&opt)
	}

	return opt
}

// WithAsyncSubscriberInterceptor registers a FIFO-like queue to intercept messages received and trigger the main
// SubscribeHandler asynchronously
func WithAsyncSubscriberInterceptor(queueURL string, fallbackURLs ...string) SubscribeOption {
	return func(options *SubscribeOptions) {
		options.MessageQueueURLs = append(options.MessageQueueURLs, queueURL)
		options.MessageQueueURLs = append(options.MessageQueueURLs, fallbackURLs...)
	}
}

// WithErrorHandler sets an ErrorHandler to catch all broker errors that cant be handled
// in normal way, for example Codec errors
func WithErrorHandler(h func(context.Context, *SubscribeOptions, error)) SubscribeOption {
	return func(o *SubscribeOptions) {
		o.customErrorHandler = h
	}
}

// Queue sets the name of the queue to share messages on
func Queue(name string) SubscribeOption {
	return func(o *SubscribeOptions) {
		o.Queue = name
	}
}

// WithCounterName adds a custom id for metrics counter name
func WithCounterName(n string) SubscribeOption {
	return func(options *SubscribeOptions) {
		options.CounterName = n
	}
}

// WithCallee adds a custom id for metrics counter name
func WithCallee(file string, line int) SubscribeOption {
	return func(options *SubscribeOptions) {
		options.CalleeFile = file
		options.CalleeLine = line
	}
}

// SubscribeContext set context
func SubscribeContext(ctx context.Context) SubscribeOption {
	return func(o *SubscribeOptions) {
		o.Context = ctx
	}
}

func (o *SubscribeOptions) HandleErrorToString(err error) string {
	msg := fmt.Sprintf("Subscription on %s cannot be handled: %s", o.TopicName, err.Error())
	if o.CalleeFile != "" {
		msg = fmt.Sprintf("Subscription on %s from %s:%d cannot be handled: %s", o.TopicName, o.CalleeFile, o.CalleeLine, err.Error())
	}
	return msg
}

// HandleError tries to log an error during a handler execution. If err is nil it is ignored.
// If options have a customErrorHandler, it is applied and then it returns
func (o *SubscribeOptions) HandleError(ctx context.Context, err error) {
	if err == nil {
		return
	}
	if o.customErrorHandler != nil {
		o.customErrorHandler(ctx, o, err)
	} else {
		defaultSubscriptionErrorHandler(ctx, o, err)
	}
}

type Publisher func(ctx context.Context, msg *pubsub.Message) error

type PublisherInterceptor func(ctx context.Context, msg *pubsub.Message, publisher Publisher) error

type SubscriberInterceptor func(ctx context.Context, msg Message, handler SubscriberHandler) error

// chainPublisherInterceptors chains all publisher interceptors into one.
func chainPublisherInterceptors(b *broker) {
	interceptors := b.Options.chainPublisherInts
	// Prepend Options.publisherInt to the chaining interceptors if it exists, since unaryInt will
	// be executed before any other chained interceptors.
	if b.Options.publisherInt != nil {
		interceptors = append([]PublisherInterceptor{b.Options.publisherInt}, interceptors...)
	}
	var chainedInt PublisherInterceptor
	if len(interceptors) == 0 {
		chainedInt = nil
	} else if len(interceptors) == 1 {
		chainedInt = interceptors[0]
	} else {
		chainedInt = func(ctx context.Context, msg *pubsub.Message, publisher Publisher) error {
			return interceptors[0](ctx, msg, getChainPublisher(interceptors, 0, publisher))
		}
	}
	b.Options.publisherInt = chainedInt
}

// getChainPublisher recursively generate the chained publisher.
func getChainPublisher(interceptors []PublisherInterceptor, curr int, finalPublisher Publisher) Publisher {
	if curr == len(interceptors)-1 {
		return finalPublisher
	}
	return func(ctx context.Context, msg *pubsub.Message) error {
		return interceptors[curr+1](ctx, msg, getChainPublisher(interceptors, curr+1, finalPublisher))
	}
}

// chainSubscriberInterceptors chains all publisher interceptors into one.
func chainSubscriberInterceptors(b *broker) {
	interceptors := b.Options.chainSubscriberInts
	// Prepend Options.publisherInt to the chaining interceptors if it exists, since unaryInt will
	// be executed before any other chained interceptors.
	if b.Options.publisherInt != nil {
		interceptors = append([]SubscriberInterceptor{b.Options.subscriberInt}, interceptors...)
	}
	var chainedInt SubscriberInterceptor
	if len(interceptors) == 0 {
		chainedInt = nil
	} else if len(interceptors) == 1 {
		chainedInt = interceptors[0]
	} else {
		chainedInt = func(ctx context.Context, msg Message, handler SubscriberHandler) error {
			return interceptors[0](ctx, msg, getChainSubscriber(interceptors, 0, handler))
		}
	}
	b.Options.subscriberInt = chainedInt
}

// getChainSubscriber recursively generate the chained publisher.
func getChainSubscriber(interceptors []SubscriberInterceptor, curr int, finalHandler SubscriberHandler) SubscriberHandler {
	if curr == len(interceptors)-1 {
		return finalHandler
	}
	return func(ctx context.Context, msg Message) error {
		return interceptors[curr+1](ctx, msg, getChainSubscriber(interceptors, curr+1, finalHandler))
	}
}

package nats

import (
	"bytes"
	"context"
	"encoding/gob"
	"errors"
	"fmt"
	"net/url"
	"path"
	"strings"
	"sync"
	"time"

	nats "github.com/nats-io/nats.go"
	"go.uber.org/zap"
	"gocloud.dev/gcerrors"
	"gocloud.dev/pubsub"
	"gocloud.dev/pubsub/batcher"
	"gocloud.dev/pubsub/driver"

	"github.com/pydio/cells/v5/common/crypto"
	pb "github.com/pydio/cells/v5/common/proto/broker"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/std"
)

var errNotInitialized = errors.New("natspubsub: topic not initialized")

var recvBatcherOpts = &batcher.Options{
	// NATS has at-most-once semantics, meaning once it delivers a message, the
	// message won't be delivered again.
	// Therefore, we can't allow the portable type to read-ahead and queue any
	// messages; they might end up undelivered if the user never calls Receive
	// to get them. Setting both the MaxBatchSize and MaxHandlers to one means
	// that we'll only return a message at a time, which should be immediately
	// returned to the user.
	//
	// Note: there is a race condition where the original Receive that
	// triggered a call to ReceiveBatch ends up failing (e.g., due to a
	// Done context), and ReceiveBatch returns a message that ends up being
	// queued for the next Receive. That message is at risk of being dropped.
	// This seems OK.
	MaxBatchSize: 1,
	MaxHandlers:  1, // max concurrency for receives
}

var (
	publishers = make(map[string]pb.Broker_PublishClient)
	pubLock    sync.Mutex
	subLock    sync.Mutex
)

func init() {
	o := new(URLOpener)
	pubsub.DefaultURLMux().RegisterTopic(Scheme, o)
	pubsub.DefaultURLMux().RegisterSubscription(Scheme, o)
}

func getConnection(ctx context.Context, u *url.URL) (*nats.Conn, error) {
	var conn *nats.Conn

	tlsConfig, err := crypto.TLSConfigFromURL(u)
	if err != nil {
		return nil, err
	}

	if err := std.Retry(ctx, func() error {
		u.RawQuery = ""
		opts := []nats.Option{
			nats.Timeout(10 * time.Second),
		}

		if tlsConfig != nil {
			opts = append(opts, nats.Secure(tlsConfig))
		}

		if pwd, ok := u.User.Password(); ok {
			opts = append(opts, nats.UserInfo(u.User.Username(), pwd))
		}

		c, err := nats.Connect(u.String(), opts...)
		if err != nil {
			log.Logger(ctx).Warn("[nats] connection unavailable, retrying in 10s...", zap.Error(err))
			return err
		}

		conn = c
		return nil
	}, 10*time.Second, 10*time.Minute); err != nil {
		return nil, err
	}

	return conn, nil
}

// Scheme is the URL scheme grpc pubsub registers its URLOpeners under on pubsub.DefaultMux.
const Scheme = "nats"

// URLOpener opens grpc pubsub URLs like "cells://topic".
//
// The URL's host+path is used as the topic to create or subscribe to.
//
// Query parameters:
//   - ackdeadline: The ack deadline for OpenSubscription, in time.ParseDuration formats.
//     Defaults to 1m.
type URLOpener struct {
	// Connection to use for communication with the server.
	Connection *nats.Conn
	// TopicOptions specifies the options to pass to OpenTopic.
	TopicOptions TopicOptions
	// SubscriptionOptions specifies the options to pass to OpenSubscription.
	SubscriptionOptions SubscriptionOptions
}

// OpenTopicURL opens a pubsub.Topic based on u.
func (o *URLOpener) OpenTopicURL(ctx context.Context, u *url.URL) (*pubsub.Topic, error) {
	u2, _ := url.Parse(u.String())
	if conn, err := getConnection(ctx, u2); err != nil {
		return nil, err
	} else {
		o.Connection = conn
	}

	for param := range u.Query() {
		return nil, fmt.Errorf("open topic %v: invalid query parameter %s", u, param)
	}
	subject := path.Join(u.Host, u.Path)
	return OpenTopic(o.Connection, subject, &o.TopicOptions)
}

// OpenSubscriptionURL opens a pubsub.Subscription based on u.
func (o *URLOpener) OpenSubscriptionURL(ctx context.Context, u *url.URL) (*pubsub.Subscription, error) {
	u2, _ := url.Parse(u.String())
	if conn, err := getConnection(ctx, u2); err != nil {
		return nil, err
	} else {
		o.Connection = conn
	}

	opts := o.SubscriptionOptions
	for param, values := range u.Query() {
		if strings.ToLower(param) == "queue" && values != nil {
			opts.Queue = values[0]
		} else {
			return nil, fmt.Errorf("open subscription %v: invalid query parameter %s", u, param)
		}
	}
	subject := path.Join(u.Host, u.Path)
	return OpenSubscription(o.Connection, subject, &opts)
}

// TopicOptions sets options for constructing a *pubsub.Topic backed by NATS.
type TopicOptions struct{}

// SubscriptionOptions sets options for constructing a *pubsub.Subscription
// backed by NATS.
type SubscriptionOptions struct {
	// Queue sets the subscription as a QueueSubcription.
	// For more info, see https://docs.nats.io/nats-concepts/queue.
	Queue string
}

type topic struct {
	nc   *nats.Conn
	subj string
}

// OpenTopic returns a *pubsub.Topic for use with NATS.
// The subject is the NATS Subject; for more info, see
// https://nats.io/documentation/writing_applications/subjects.
func OpenTopic(nc *nats.Conn, subject string, _ *TopicOptions) (*pubsub.Topic, error) {
	dt, err := openTopic(nc, subject)
	if err != nil {
		return nil, err
	}
	return pubsub.NewTopic(dt, nil), nil
}

// openTopic returns the driver for OpenTopic. This function exists so the test
// harness can get the driver interface implementation if it needs to.
func openTopic(nc *nats.Conn, subject string) (driver.Topic, error) {
	if nc == nil {
		return nil, errors.New("natspubsub: nats.Conn is required")
	}
	return &topic{nc, subject}, nil
}

// SendBatch implements driver.Topic.SendBatch.
func (t *topic) SendBatch(ctx context.Context, msgs []*driver.Message) error {
	if t == nil || t.nc == nil {
		return errNotInitialized
	}

	for _, m := range msgs {
		if err := ctx.Err(); err != nil {
			return err
		}
		// TODO(jba): benchmark message encoding to see if it's
		// worth reusing a buffer.
		payload, err := encodeMessage(m)
		if err != nil {
			return err
		}
		if m.BeforeSend != nil {
			asFunc := func(i interface{}) bool { return false }
			if err := m.BeforeSend(asFunc); err != nil {
				return err
			}
		}
		if err := t.nc.Publish(t.subj, payload); err != nil {
			return err
		}
	}
	// Per specification this is supposed to only return after
	// a message has been sent. Normally NATS is very efficient
	// at sending messages in batches on its own and also handles
	// disconnected buffering during a reconnect event. We will
	// let NATS handle this for now. If needed we could add a
	// FlushWithContext() call which ensures the connected server
	// has processed all the messages.
	return nil
}

// IsRetryable implements driver.Topic.IsRetryable.
func (*topic) IsRetryable(error) bool { return false }

// As implements driver.Topic.As.
func (t *topic) As(i interface{}) bool {
	c, ok := i.(**nats.Conn)
	if !ok {
		return false
	}
	*c = t.nc
	return true
}

// ErrorAs implements driver.Topic.ErrorAs
func (*topic) ErrorAs(error, interface{}) bool {
	return false
}

// ErrorCode implements driver.Topic.ErrorCode
func (*topic) ErrorCode(err error) gcerrors.ErrorCode {
	switch err {
	case nil:
		return gcerrors.OK
	case context.Canceled:
		return gcerrors.Canceled
	case errNotInitialized:
		return gcerrors.NotFound
	case nats.ErrBadSubject:
		return gcerrors.FailedPrecondition
	case nats.ErrAuthorization:
		return gcerrors.PermissionDenied
	case nats.ErrMaxPayload, nats.ErrReconnectBufExceeded:
		return gcerrors.ResourceExhausted
	}
	return gcerrors.Unknown
}

// Close implements driver.Topic.Close.
func (*topic) Close() error { return nil }

type subscription struct {
	nc   *nats.Conn
	nsub *nats.Subscription
}

// OpenSubscription returns a *pubsub.Subscription representing a NATS subscription or NATS queue subscription.
// The subject is the NATS Subject to subscribe to;
// for more info, see https://nats.io/documentation/writing_applications/subjects.
func OpenSubscription(nc *nats.Conn, subject string, opts *SubscriptionOptions) (*pubsub.Subscription, error) {
	ds, err := openSubscription(nc, subject, opts)
	if err != nil {
		return nil, err
	}
	return pubsub.NewSubscription(ds, recvBatcherOpts, nil), nil
}

func openSubscription(nc *nats.Conn, subject string, opts *SubscriptionOptions) (driver.Subscription, error) {
	var sub *nats.Subscription
	var err error
	if opts != nil && opts.Queue != "" {
		sub, err = nc.QueueSubscribeSync(subject, opts.Queue)
	} else {
		sub, err = nc.SubscribeSync(subject)
	}
	if err != nil {
		return nil, err
	}
	return &subscription{nc, sub}, nil
}

// ReceiveBatch implements driver.ReceiveBatch.
func (s *subscription) ReceiveBatch(ctx context.Context, maxMessages int) ([]*driver.Message, error) {
	if s == nil || s.nsub == nil {
		return nil, nats.ErrBadSubscription
	}

	msg, err := s.nsub.NextMsg(100 * time.Millisecond)
	if err != nil {
		if err == nats.ErrTimeout {
			return nil, nil
		}
		return nil, err
	}
	dm, err := decode(msg)
	if err != nil {
		return nil, err
	}
	return []*driver.Message{dm}, nil
}

// Convert NATS msgs to *driver.Message.
func decode(msg *nats.Msg) (*driver.Message, error) {
	if msg == nil {
		return nil, nats.ErrInvalidMsg
	}
	var dm driver.Message
	if err := decodeMessage(msg.Data, &dm); err != nil {
		return nil, err
	}
	dm.AckID = -1 // Not applicable to NATS
	dm.AsFunc = messageAsFunc(msg)
	return &dm, nil
}

func messageAsFunc(msg *nats.Msg) func(interface{}) bool {
	return func(i interface{}) bool {
		p, ok := i.(**nats.Msg)
		if !ok {
			return false
		}
		*p = msg
		return true
	}
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
	c, ok := i.(**nats.Subscription)
	if !ok {
		return false
	}
	*c = s.nsub
	return true
}

// ErrorAs implements driver.Subscription.ErrorAs
func (*subscription) ErrorAs(error, interface{}) bool {
	return false
}

// ErrorCode implements driver.Subscription.ErrorCode
func (*subscription) ErrorCode(err error) gcerrors.ErrorCode {
	switch err {
	case nil:
		return gcerrors.OK
	case context.Canceled:
		return gcerrors.Canceled
	case errNotInitialized, nats.ErrBadSubscription:
		return gcerrors.NotFound
	case nats.ErrBadSubject, nats.ErrTypeSubscription:
		return gcerrors.FailedPrecondition
	case nats.ErrAuthorization:
		return gcerrors.PermissionDenied
	case nats.ErrMaxMessages, nats.ErrSlowConsumer:
		return gcerrors.ResourceExhausted
	case nats.ErrTimeout:
		return gcerrors.DeadlineExceeded
	}
	return gcerrors.Unknown
}

// Close implements driver.Subscription.Close.
func (*subscription) Close() error { return nil }

func encodeMessage(dm *driver.Message) ([]byte, error) {
	var buf bytes.Buffer
	enc := gob.NewEncoder(&buf)
	if len(dm.Metadata) == 0 {
		return dm.Body, nil
	}
	if err := enc.Encode(dm.Metadata); err != nil {
		return nil, err
	}
	if err := enc.Encode(dm.Body); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func decodeMessage(data []byte, dm *driver.Message) error {
	buf := bytes.NewBuffer(data)
	dec := gob.NewDecoder(buf)
	if err := dec.Decode(&dm.Metadata); err != nil {
		// This may indicate a normal NATS message, so just treat as the body.
		dm.Metadata = nil
		dm.Body = data
		return nil
	}
	return dec.Decode(&dm.Body)
}

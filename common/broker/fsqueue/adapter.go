/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

// Package filepubsub provides an AsyncQueue adapter that wraps the gocloud pubsub
// file driver, enabling sync endpoints to use filesystem-backed pubsub queues.
//
// # URLs
//
// The queue registers the "fpub" scheme. The URL format is:
//
//	fpub:///path/to/spool?name=streamname&ackdeadline=1m
//
// Query parameters:
//   - name: Required stream name (used for directory naming)
//   - ackdeadline: Optional ack deadline (defaults to 1m)
//
// Example:
//
//	fpub:///shared/broker?name=syncro
package filepubsub

import (
	"context"
	"errors"
	"net/url"
	"path/filepath"
	"sync"
	"time"

	"go.uber.org/zap"
	"gocloud.dev/pubsub"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

var (
	errMissingStreamName = errors.New("fpub: please provide a stream name via ?name=")
	errQueueClosed       = errors.New("fpub: queue is closed")
)

func init() {
	broker.RegisterAsyncQueue("fpub", &fpubQueue{})
}

// fpubQueue implements broker.AsyncQueue using the filepubsub gocloud driver.
type fpubQueue struct {
	ctx      context.Context
	cancel   context.CancelFunc
	topic    *pubsub.Topic
	sub      *pubsub.Subscription
	basePath string
	name     string

	closeMu  sync.Mutex
	closed   bool
	closeErr error
}

// OpenURL implements broker.AsyncQueueOpener.
func (f *fpubQueue) OpenURL(ctx context.Context, u *url.URL) (broker.AsyncQueue, error) {
	streamName := u.Query().Get("name")
	if streamName == "" {
		return nil, errMissingStreamName
	}

	// Parse ack deadline
	ackDeadline := time.Minute
	if ad := u.Query().Get("ackdeadline"); ad != "" {
		if d, err := time.ParseDuration(ad); err == nil {
			ackDeadline = d
		}
	}

	// Build base path: /path/from/url/fpub-streamname
	basePath := filepath.Join(u.Path, "fpub-"+streamName)

	// Create topic
	topic, err := NewTopic(basePath)
	if err != nil {
		return nil, err
	}

	// Create subscription
	sub, err := NewSubscription(topic, ackDeadline)
	if err != nil {
		_ = topic.Shutdown(ctx)
		return nil, err
	}

	qCtx, cancel := context.WithCancel(ctx)
	return &fpubQueue{
		ctx:      qCtx,
		cancel:   cancel,
		topic:    topic,
		sub:      sub,
		basePath: basePath,
		name:     streamName,
	}, nil
}

// Push implements broker.AsyncQueue.Push.
// Encodes the protobuf message with context and sends via pubsub.Topic.
func (f *fpubQueue) Push(ctx context.Context, msg proto.Message) error {
	f.closeMu.Lock()
	if f.closed {
		f.closeMu.Unlock()
		return errQueueClosed
	}
	f.closeMu.Unlock()

	body := broker.EncodeProtoWithContext(ctx, msg)
	return f.topic.Send(ctx, &pubsub.Message{
		Body: body,
	})
}

// PushRaw implements broker.AsyncQueue.PushRaw.
// Sends a pre-encoded broker.Message.
func (f *fpubQueue) PushRaw(ctx context.Context, message broker.Message) error {
	f.closeMu.Lock()
	if f.closed {
		f.closeMu.Unlock()
		return errQueueClosed
	}
	f.closeMu.Unlock()

	body := broker.EncodeBrokerMessage(message)
	return f.topic.Send(ctx, &pubsub.Message{
		Body: body,
	})
}

// Consume implements broker.AsyncQueue.Consume.
// Starts a goroutine that receives messages from the subscription
// and invokes the callback with decoded broker.Messages.
func (f *fpubQueue) Consume(callback func(context.Context, ...broker.Message)) error {
	go func() {
		for {
			select {
			case <-f.ctx.Done():
				log.Logger(f.ctx).Debug("[fpubQueue] Consumer stopping: context done", zap.String("name", f.name))
				return
			default:
			}

			msg, err := f.sub.Receive(f.ctx)
			if err != nil {
				// Check if we're closing
				f.closeMu.Lock()
				closing := f.closed
				f.closeMu.Unlock()
				if closing {
					log.Logger(f.ctx).Debug("[fpubQueue] Consumer stopping: queue closed", zap.String("name", f.name))
					return
				}

				// Context canceled
				if f.ctx.Err() != nil {
					log.Logger(f.ctx).Debug("[fpubQueue] Consumer stopping: context error", zap.String("name", f.name), zap.Error(f.ctx.Err()))
					return
				}

				log.Logger(f.ctx).Error("[fpubQueue] Error receiving message", zap.String("name", f.name), zap.Error(err))
				// Brief pause before retry
				select {
				case <-time.After(100 * time.Millisecond):
				case <-f.ctx.Done():
					return
				}
				continue
			}

			// Decode the broker message
			brokerMsg, err := broker.DecodeToBrokerMessage(msg.Body)
			if err != nil {
				log.Logger(f.ctx).Error("[fpubQueue] Failed to decode message", zap.String("name", f.name), zap.Error(err))
				msg.Ack()
				continue
			}

			// Invoke callback
			callback(f.ctx, brokerMsg)

			// Acknowledge after callback completes
			msg.Ack()
		}
	}()
	return nil
}

// Close implements broker.AsyncQueue.Close.
// Shuts down both subscription and topic.
func (f *fpubQueue) Close(ctx context.Context) error {
	f.closeMu.Lock()
	defer f.closeMu.Unlock()

	if f.closed {
		return f.closeErr
	}
	f.closed = true

	// Cancel consumer context
	if f.cancel != nil {
		f.cancel()
	}

	var errs []error

	// Shutdown subscription first
	if f.sub != nil {
		if err := f.sub.Shutdown(ctx); err != nil {
			errs = append(errs, err)
		}
	}

	// Then shutdown topic
	if f.topic != nil {
		if err := f.topic.Shutdown(ctx); err != nil {
			errs = append(errs, err)
		}
	}

	if len(errs) > 0 {
		f.closeErr = errs[0]
	}
	return f.closeErr
}

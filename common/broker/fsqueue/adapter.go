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
//   - sendbatchsize: Optional send batch size for publisher (defaults to 10)
//   - recvbatchsize: Optional receive batch size for subscriber (defaults to 1)
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
	"strconv"
	"sync"
	"time"

	"go.uber.org/zap"
	"gocloud.dev/pubsub"
	"gocloud.dev/pubsub/batcher"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/telemetry/metrics"
)

var (
	errMissingStreamName = errors.New("fpub: please provide a stream name via ?name=")
	errQueueClosed       = errors.New("fpub: queue is closed")
)

// Process-wide registry so two opens of the same basePath share one queue.
var (
	registryMu sync.Mutex
	registry   = map[string]*fpubEntry{}
)

type fpubEntry struct {
	queue    *fpubQueue
	refCount int
}

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

	closeMu         sync.Mutex
	closed          bool
	consumerDone    chan struct{} // Lazily initialized in Consume()
	consumerStarted bool
	closeErr        error
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

	sendBatchSize := 10 //gocloud default
	if sb := u.Query().Get("sendbatchsize"); sb != "" {
		if n, err := strconv.Atoi(sb); err == nil && n > 0 {
			sendBatchSize = n
		}
	}

	recvBatchSize := 1 // maintain strict ordering
	if rb := u.Query().Get("recvbatchsize"); rb != "" {
		if n, err := strconv.Atoi(rb); err == nil && n > 0 {
			recvBatchSize = n
		}
	}

	// Build base path: /path/from/url/fpub-streamname
	basePath := filepath.Join(u.Path, "fpub-"+streamName)

	registryMu.Lock()
	defer registryMu.Unlock()
	if entry, ok := registry[basePath]; ok {
		entry.refCount++
		return entry.queue, nil
	}

	topicOptions := &TopicOptions{
		BatcherOptions: batcher.Options{MaxBatchSize: sendBatchSize},
	}

	// Create topic
	topic, err := NewTopicWithOptions(basePath, topicOptions)
	if err != nil {
		return nil, err
	}

	subOpts := &SubscriptionOptions{
		ReceiveBatcherOptions: batcher.Options{
			MaxBatchSize: recvBatchSize,
			MaxHandlers:  1,
		},
	}

	// Create subscription
	sub, err := NewSubscriptionWithOptions(topic, ackDeadline, subOpts)
	if err != nil {
		_ = topic.Shutdown(ctx)
		return nil, err
	}
	qCtx, cancel := context.WithCancel(ctx)
	q := &fpubQueue{
		ctx:          qCtx,
		cancel:       cancel,
		topic:        topic,
		sub:          sub,
		basePath:     basePath,
		name:         streamName,
		consumerDone: make(chan struct{}),
	}
	registry[basePath] = &fpubEntry{queue: q, refCount: 1}
	return q, nil
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
	err := f.topic.Send(ctx, &pubsub.Message{
		Body: body,
	})
	if err == nil {
		metrics.Helper().Counter("fpub_push_total", "Total messages pushed to fpub queue").Inc(1)
	} else {
		metrics.Helper().Counter("fpub_push_errors_total", "Total push errors in fpub queue").Inc(1)
	}
	return err
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
	err := f.topic.Send(ctx, &pubsub.Message{
		Body: body,
	})
	if err == nil {
		metrics.Helper().Counter("fpub_push_raw_total", "Total raw messages pushed to fpub queue").Inc(1)
	} else {
		metrics.Helper().Counter("fpub_push_errors_total", "Total push errors in fpub queue").Inc(1)
	}
	return err
}

// Consume implements broker.AsyncQueue.Consume.
// Starts a goroutine that receives messages from the subscription
// and invokes the callback with decoded broker.Messages.
func (f *fpubQueue) Consume(callback func(context.Context, ...broker.Message)) error {
	f.closeMu.Lock()
	f.consumerStarted = true
	f.closeMu.Unlock()
	go func() {
		defer close(f.consumerDone) // Signal consumer exit when goroutine exits
		for {
			select {
			case <-f.ctx.Done():
				log.Logger(f.ctx).Debug("[fpubQueue] Consumer stopping: context done",
					zap.String("name", f.name))
				return
			default:
			}

			msg, err := f.sub.Receive(f.ctx)
			if err != nil {
				if f.ctx.Err() != nil {
					return
				}
				// Check if we're closing
				f.closeMu.Lock()
				closing := f.closed
				f.closeMu.Unlock()
				if closing || f.ctx.Err() != nil {
					return
				}
				log.Logger(f.ctx).Error("[fpubQueue] Error receiving message",
					zap.String("name", f.name), zap.Error(err))
				if f.consumerStarted {
					select {
					case <-time.After(100 * time.Millisecond):
					case <-f.ctx.Done():
						return
					}
				}
				continue
			}

			brokerMsg, err := broker.DecodeToBrokerMessage(msg.Body)
			if err != nil {
				log.Logger(f.ctx).Error("[fpubQueue] decode failed, nacking for retry",
					zap.String("name", f.name), zap.Error(err))
				if msg.Nackable() {
					msg.Nack()
				} else {
					msg.Ack()
				}
				continue
			}

			// Recover panics in the callback so a bad event doesn't kill the
			// consume goroutine; Nack the message for retry up to the gocloud
			// limit (governed by ackDeadline).
			func() {
				defer func() {
					if r := recover(); r != nil {
						log.Logger(f.ctx).Error("[fpubQueue] panic in consume callback",
							zap.String("name", f.name), zap.Any("panic", r))
						if msg.Nackable() {
							msg.Nack()
						} else {
							msg.Ack()
						}
					}
				}()
				callback(f.ctx, brokerMsg)
				msg.Ack()
			}()

			// Track consumed message
			metrics.Helper().Counter("fpub_consumed_total", "Total messages consumed from fpub queue").Inc(1)
		}
	}()
	return nil
}

// Close implements broker.AsyncQueue.Close with refcounted teardown.
func (f *fpubQueue) Close(ctx context.Context) error {
	f.closeMu.Lock()
	if f.closed {
		f.closeMu.Unlock()
		return f.closeErr
	}
	f.closed = true
	f.closeMu.Unlock()

	registryMu.Lock()
	entry, ok := registry[f.basePath]
	if !ok || entry.queue != f {
		registryMu.Unlock()
		return errQueueClosed
	}
	entry.refCount--
	if entry.refCount > 0 {
		registryMu.Unlock()
		return nil
	}
	delete(registry, f.basePath)
	registryMu.Unlock() // ← Release BEFORE waiting

	// Track queue close
	metrics.Helper().Counter("fpub_closed_total", "Times fpub queue was closed").Inc(1)

	// Cancel consumer context
	if f.cancel != nil {
		f.cancel()
	}

	// Wait for consumer goroutine to exit
	if f.consumerStarted {
		<-f.consumerDone
	}

	// Final cleanup
	f.closeMu.Lock()
	defer f.closeMu.Unlock()

	var errs []error
	if f.sub != nil {
		if err := f.sub.Shutdown(ctx); err != nil {
			errs = append(errs, err)
		}
	}
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

func (f *fpubQueue) Done() <-chan struct{} {
	return f.consumerDone
}

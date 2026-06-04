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

// Package filepubsub provides a filesystem-backed pubsub implementation using gocloud.dev/pubsub.
// It writes messages as .pb files to a directory and uses filesystem notifications (notify)
// for efficient subscription instead of polling.
//
// Use NewTopic to construct a *pubsub.Topic, and NewSubscription to construct a *pubsub.Subscription.
//
// filepubsub provides at-least-once delivery semantics. Messages that are not acknowledged
// within the ack deadline will be redelivered.
//
// # URLs
//
// For pubsub.OpenTopic and pubsub.OpenSubscription, filepubsub registers
// for the scheme "file".
// The host+path is used as the directory path for message storage.
// Query parameters:
//   - ackdeadline: The ack deadline for OpenSubscription, in time.ParseDuration formats.
//     Defaults to 1m.
//
// Examples:
//   - file:///shared/broker/mytopic
//   - file:///var/spool/pubsub/events?ackdeadline=30s
//
// # As
//
// filepubsub does not support any types for As.
package filepubsub

import (
	"bytes"
	"context"
	"encoding/gob"
	"errors"
	"fmt"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/rjeczalik/notify"
	"gocloud.dev/gcerrors"
	"gocloud.dev/pubsub"
	"gocloud.dev/pubsub/batcher"
	"gocloud.dev/pubsub/driver"

	"github.com/pydio/cells/v5/common/telemetry/metrics"
)

func init() {
	o := new(URLOpener)
	pubsub.DefaultURLMux().RegisterTopic(Scheme, o)
	pubsub.DefaultURLMux().RegisterSubscription(Scheme, o)
}

// Scheme is the URL scheme filepubsub registers its URLOpeners under on pubsub.DefaultMux.
const Scheme = "file"

// Subdirectories for message states
const (
	pendingDir    = "pending"
	processingDir = "processing"
	tmpDir        = ".tmp"
)

// Sentinel errors for filepubsub package
var (
	ErrTopicNotExist      = errors.New("filepubsub: topic does not exist")
	ErrTopicClosed        = errors.New("filepubsub: topic is closed")
	ErrSubscriptionClosed = errors.New("filepubsub: subscription is closed")
	ErrInvalidPath        = errors.New("filepubsub: path is required")
	ErrInvalidParam       = errors.New("filepubsub: invalid query parameter")
	ErrInvalidAckDeadline = errors.New("filepubsub: invalid ackdeadline")
	ErrCreateDir          = errors.New("filepubsub: failed to create directory")
	ErrWriteFile          = errors.New("filepubsub: failed to write file")
	ErrMoveFile           = errors.New("filepubsub: failed to move file")
)

// recvBatcherOpts configures batching for receives.
// Like NATS, we use MaxBatchSize=1 and MaxHandlers=1 for strict ordering.
var recvBatcherOpts = &batcher.Options{
	MaxBatchSize: 1,
	MaxHandlers:  1,
}

// URLOpener opens filepubsub URLs like "file:///path/to/topic".
//
// The URL's host+path is used as the directory for message storage.
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
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	for param := range u.Query() {
		if param != "ackdeadline" {
			return nil, fmt.Errorf("%w: %q in %v", ErrInvalidParam, param, u)
		}
	}
	topicPath := path.Join(u.Host, u.Path)
	if topicPath == "" {
		return nil, fmt.Errorf("%w: %v", ErrInvalidPath, u)
	}

	o.mu.Lock()
	defer o.mu.Unlock()
	if o.topics == nil {
		o.topics = map[string]*pubsub.Topic{}
	}
	t := o.topics[topicPath]
	if t == nil {
		var err error
		t, err = NewTopic(topicPath)
		if err != nil {
			return nil, err
		}
		o.topics[topicPath] = t
	}
	return t, nil
}

// OpenSubscriptionURL opens a pubsub.Subscription based on u.
func (o *URLOpener) OpenSubscriptionURL(ctx context.Context, u *url.URL) (*pubsub.Subscription, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	q := u.Query()
	ackDeadline := 1 * time.Minute
	if s := q.Get("ackdeadline"); s != "" {
		var err error
		ackDeadline, err = time.ParseDuration(s)
		if err != nil {
			return nil, fmt.Errorf("%w %q: %v", ErrInvalidAckDeadline, s, err)
		}
		q.Del("ackdeadline")
	}
	for param := range q {
		return nil, fmt.Errorf("%w: %q in %v", ErrInvalidParam, param, u)
	}
	topicPath := path.Join(u.Host, u.Path)
	if topicPath == "" {
		return nil, fmt.Errorf("%w: %v", ErrInvalidPath, u)
	}

	o.mu.Lock()
	defer o.mu.Unlock()
	if o.topics == nil {
		o.topics = map[string]*pubsub.Topic{}
	}
	t := o.topics[topicPath]
	if t == nil {
		// Create topic if it doesn't exist
		var err error
		t, err = NewTopic(topicPath)
		if err != nil {
			return nil, err
		}
		o.topics[topicPath] = t
	}
	return NewSubscription(t, ackDeadline)
}

// TopicOptions contains configuration options for topics.
type TopicOptions struct {
	// BatcherOptions adds constraints to the default batching done for sends.
	BatcherOptions batcher.Options
}

type topic struct {
	mu        sync.Mutex
	basePath  string
	subs      []*subscription
	nextAckID int
	closed    bool
}

// NewTopic creates a new filesystem-backed topic.
func NewTopic(basePath string) (*pubsub.Topic, error) {
	return NewTopicWithOptions(basePath, nil)
}

// NewTopicWithOptions is similar to NewTopic, but supports TopicOptions.
func NewTopicWithOptions(basePath string, opts *TopicOptions) (*pubsub.Topic, error) {
	if opts == nil {
		opts = &TopicOptions{}
	}

	// Create directories
	for _, dir := range []string{pendingDir, processingDir, tmpDir} {
		dirPath := filepath.Join(basePath, dir)
		if err := os.MkdirAll(dirPath, 0o755); err != nil {
			return nil, fmt.Errorf("filepubsub: failed to create directory %s: %w", dirPath, err)
		}
	}

	t := &topic{
		basePath: basePath,
	}
	return pubsub.NewTopic(t, &opts.BatcherOptions), nil
}

// SendBatch implements driver.Topic.SendBatch.
func (t *topic) SendBatch(ctx context.Context, ms []*driver.Message) error {
	if err := ctx.Err(); err != nil {
		return err
	}
	if t == nil {
		return ErrTopicNotExist
	}
	t.mu.Lock()
	defer t.mu.Unlock()
	if t.closed {
		return ErrTopicClosed
	}

	tmpPath := filepath.Join(t.basePath, tmpDir)
	pendPath := filepath.Join(t.basePath, pendingDir)

	filenames := make([]string, 0, len(ms))
	for i, m := range ms {
		m.AckID = t.nextAckID + i
		m.LoggableID = fmt.Sprintf("msg #%d", m.AckID)
		m.AsFunc = func(any) bool { return false }
		if m.BeforeSend != nil {
			if err := m.BeforeSend(func(any) bool { return false }); err != nil {
				return err
			}
		}

		// Encode message
		payload, err := encodeMessage(m)
		if err != nil {
			return err
		}
		filename := fmt.Sprintf("%020d-%s.pb", m.AckID, uuid.New().String()[:8])
		filenames = append(filenames, filename)
		tmpFile := filepath.Join(tmpPath, filename)
		if err := os.WriteFile(tmpFile, payload, 0o644); err != nil {
			// Roll back any tmp files written so far.
			for _, fn := range filenames {
				_ = os.Remove(filepath.Join(tmpPath, fn))
			}
			return fmt.Errorf("filepubsub: failed to write temp file: %w", err)
		}
	}

	// Move all files to pending/. On failure, roll back to .tmp/.
	var committed []string
	for _, filename := range filenames {
		tmpFile := filepath.Join(tmpPath, filename)
		finalFile := filepath.Join(pendPath, filename)
		if err := os.Rename(tmpFile, finalFile); err != nil {
			// Roll back already-committed renames.
			for _, fn := range committed {
				_ = os.Rename(filepath.Join(pendPath, fn), filepath.Join(tmpPath, fn))
			}
			// Best-effort cleanup of remaining .tmp/ entries.
			for _, fn := range filenames {
				_ = os.Remove(filepath.Join(tmpPath, fn))
			}
			return fmt.Errorf("filepubsub: failed to move file to pending: %w", err)
		}
		committed = append(committed, filename)
	}

	t.nextAckID += len(ms)

	for _, s := range t.subs {
		s.notifyNewMessages()
	}

	// Track published messages
	metrics.Helper().Counter("fsqueue_pub_total", "Total messages published to fsqueue").Inc(int64(len(ms)))

	return nil
}

// IsRetryable implements driver.Topic.IsRetryable.
func (*topic) IsRetryable(error) bool { return false }

// As implements driver.Topic.As.
func (t *topic) As(i any) bool {
	p, ok := i.(**topic)
	if !ok {
		return false
	}
	*p = t
	return true
}

// ErrorAs implements driver.Topic.ErrorAs
func (*topic) ErrorAs(error, any) bool {
	return false
}

// ErrorCode implements driver.Topic.ErrorCode
func (*topic) ErrorCode(err error) gcerrors.ErrorCode {
	switch {
	case errors.Is(err, ErrTopicNotExist), errors.Is(err, ErrTopicClosed), errors.Is(err, ErrSubscriptionClosed):
		return gcerrors.NotFound
	case errors.Is(err, ErrInvalidPath), errors.Is(err, ErrInvalidParam), errors.Is(err, ErrInvalidAckDeadline):
		return gcerrors.InvalidArgument
	case errors.Is(err, context.Canceled):
		return gcerrors.Canceled
	case errors.Is(err, context.DeadlineExceeded):
		return gcerrors.DeadlineExceeded
	default:
		return gcerrors.Unknown
	}
}

// Close implements driver.Topic.Close.
func (t *topic) Close() error {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.closed = true
	return nil
}

// SubscriptionOptions sets options for constructing a *pubsub.Subscription
// backed by filepubsub.
type SubscriptionOptions struct {
	// ReceiveBatcherOptions adds constraints to the default batching done for receives.
	ReceiveBatcherOptions batcher.Options
	// AckBatcherOptions adds constraints to the default batching done for acks.
	AckBatcherOptions batcher.Options
}

type subscription struct {
	mu          sync.Mutex
	topic       *topic
	ackDeadline time.Duration
	msgs        map[driver.AckID]*message // all unacknowledged messages
	notifyChan  chan notify.EventInfo
	newMsgChan  chan struct{} // signaled when new messages arrive
	stopWatcher chan struct{}
	watcherDone chan struct{}
	closed      bool
}

type message struct {
	msg        *driver.Message
	filename   string
	expiration time.Time
}

// NewSubscription creates a new subscription for the given topic.
// It panics if the given topic did not come from filepubsub.
func NewSubscription(pstopic *pubsub.Topic, ackDeadline time.Duration) (*pubsub.Subscription, error) {
	return NewSubscriptionWithOptions(pstopic, ackDeadline, nil)
}

// NewSubscriptionWithOptions is similar to NewSubscription, but supports SubscriptionOptions.
func NewSubscriptionWithOptions(pstopic *pubsub.Topic, ackDeadline time.Duration, opts *SubscriptionOptions) (*pubsub.Subscription, error) {
	if opts == nil {
		opts = &SubscriptionOptions{}
	}
	var t *topic
	if !pstopic.As(&t) {
		panic("filepubsub: NewSubscription passed a Topic not from filepubsub")
	}

	s, err := newSubscription(t, ackDeadline)
	if err != nil {
		return nil, err
	}
	return pubsub.NewSubscription(s, recvBatcherOpts, &opts.AckBatcherOptions), nil
}

func newSubscription(t *topic, ackDeadline time.Duration) (*subscription, error) {
	s := &subscription{
		topic:       t,
		ackDeadline: ackDeadline,
		msgs:        map[driver.AckID]*message{},
		// 10000-deep buffer absorbs bursts that would otherwise drop OS-level
		// notify events. notifyNewMessages is buffered-1 with non-blocking
		// send, so the watcher goroutine collapses any backlog into one
		// signal on newMsgChan; the larger buffer just guards against
		// notify drops during the brief window before that collapse.
		notifyChan:  make(chan notify.EventInfo, 10000),
		newMsgChan:  make(chan struct{}, 1),
		stopWatcher: make(chan struct{}),
		watcherDone: make(chan struct{}),
	}
	if t != nil {
		t.mu.Lock()
		t.subs = append(t.subs, s)
		t.mu.Unlock()

		// Recover any messages stuck in processing
		if err := s.recoverProcessing(); err != nil {
			return nil, err
		}

		// Start filesystem watcher
		if err := s.startWatcher(); err != nil {
			return nil, err
		}
	}
	return s, nil
}

// startWatcher sets up filesystem notifications on the pending directory
func (s *subscription) startWatcher() error {
	pendPath := filepath.Join(s.topic.basePath, pendingDir)

	// Watch for new files in pending directory
	if err := notify.Watch(pendPath, s.notifyChan, notify.Create, notify.Rename); err != nil {
		return fmt.Errorf("filepubsub: failed to watch directory: %w", err)
	}

	go func() {
		defer close(s.watcherDone)
		for {
			select {
			case <-s.stopWatcher:
				notify.Stop(s.notifyChan)
				return
			case ev := <-s.notifyChan:
				if strings.HasSuffix(ev.Path(), ".pb") {
					s.notifyNewMessages()
				}
			}
		}
	}()

	return nil
}

// notifyNewMessages signals that new messages are available
func (s *subscription) notifyNewMessages() {
	select {
	case s.newMsgChan <- struct{}{}:
	default:
		// Channel already has a signal
	}
}

// recoverProcessing moves stuck messages from processing back to pending
func (s *subscription) recoverProcessing() error {
	procPath := filepath.Join(s.topic.basePath, processingDir)
	pendPath := filepath.Join(s.topic.basePath, pendingDir)

	entries, err := os.ReadDir(procPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}

	// Pre-allocate slice for filenames to reduce memory allocations
	filenames := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".pb") {
			continue
		}
		filenames = append(filenames, entry.Name())
	}

	// Move all files in a single loop
	for _, filename := range filenames {
		src := filepath.Join(procPath, filename)
		dst := filepath.Join(pendPath, filename)
		_ = os.Rename(src, dst)
	}
	return nil
}

// receiveNoWait collects messages available for delivery
func (s *subscription) receiveNoWait(now time.Time, max int) ([]*driver.Message, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// 1. Collect every expired in-flight message.
	type expiredEntry struct {
		ackID int
		m     *message
	}
	var expired []expiredEntry
	for id, m := range s.msgs {
		if now.After(m.expiration) {
			expired = append(expired, expiredEntry{ackID: id.(int), m: m})
		}
	}
	if len(expired) > 0 {
		sort.Slice(expired, func(i, j int) bool { return expired[i].ackID < expired[j].ackID })
		msgs := make([]*driver.Message, 0, len(expired))
		for _, e := range expired {
			e.m.expiration = now.Add(s.ackDeadline)
			msgs = append(msgs, e.m.msg)
			if len(msgs) >= max {
				break
			}
		}
		return msgs, nil
	}

	// 2. Claim fresh messages from pending/.
	pendPath := filepath.Join(s.topic.basePath, pendingDir)
	procPath := filepath.Join(s.topic.basePath, processingDir)

	entries, err := os.ReadDir(pendPath)
	if err != nil {
		return nil, err
	}
	sort.Slice(entries, func(i, j int) bool { return entries[i].Name() < entries[j].Name() })

	msgs := make([]*driver.Message, 0, max)
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".pb") {
			continue
		}
		filename := entry.Name()
		src := filepath.Join(pendPath, filename)
		dst := filepath.Join(procPath, filename)
		if err := os.Rename(src, dst); err != nil {
			continue // another consumer claimed it
		}
		data, err := os.ReadFile(dst)
		if err != nil {
			_ = os.Rename(dst, src) // give it back for retry
			continue
		}
		dm, err := decodeMessage(data)
		if err != nil {
			// Dead-letter conditionally rather than silent delete
			deadDir := filepath.Join(s.topic.basePath, "dead")
			_ = os.MkdirAll(deadDir, 0o755)
			if mvErr := os.Rename(dst, filepath.Join(deadDir, filename)); mvErr != nil {
				_ = os.Remove(dst)
			}
			continue
		}
		m := &message{
			msg:        dm,
			filename:   filename,
			expiration: now.Add(s.ackDeadline),
		}
		s.msgs[dm.AckID] = m
		msgs = append(msgs, dm)
		if len(msgs) >= max {
			break
		}
	}
<<<<<<< Updated upstream
=======

	// Track received messages
	if len(msgs) > 0 {
		metrics.Helper().Counter("fsqueue_sub_total", "Total messages received from fsqueue").Inc(int64(len(msgs)))
	}

>>>>>>> Stashed changes
	return msgs, nil
}

// ReceiveBatch implements driver.ReceiveBatch.
func (s *subscription) ReceiveBatch(ctx context.Context, maxMessages int) ([]*driver.Message, error) {
	if s == nil || s.topic == nil {
		return nil, ErrTopicNotExist
	}

	s.mu.Lock()
	if s.closed {
		s.mu.Unlock()
		return nil, ErrSubscriptionClosed
	}
	s.mu.Unlock()

	// Check for messages
	msgs, err := s.receiveNoWait(time.Now(), maxMessages)
	if err != nil {
		return nil, err
	}
	if len(msgs) > 0 {
		return msgs, nil
	}

	// Wait for new messages or timeout
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	case <-s.newMsgChan:
		// New messages available, try again
		return s.receiveNoWait(time.Now(), maxMessages)
	case <-time.After(100 * time.Millisecond):
		// Periodic check for redelivery
		return nil, nil
	}
}

// SendAcks implements driver.SendAcks.
func (s *subscription) SendAcks(ctx context.Context, ackIDs []driver.AckID) error {
	if s.topic == nil {
		return ErrTopicNotExist
	}
	if err := ctx.Err(); err != nil {
		return err
	}

	procPath := filepath.Join(s.topic.basePath, processingDir)

	s.mu.Lock()
	defer s.mu.Unlock()

	// Pre-allocate slice to reduce memory allocations
	toDelete := make([]driver.AckID, 0, len(ackIDs))
	for _, id := range ackIDs {
		if m, ok := s.msgs[id]; ok {
			// Delete the file (acknowledge)
			filePath := filepath.Join(procPath, m.filename)
			_ = os.Remove(filePath)
			toDelete = append(toDelete, id)
		}
	}

	// Delete all messages at once to reduce map operations
	for _, id := range toDelete {
		delete(s.msgs, id)
	}

	// Track acknowledged messages
	if len(toDelete) > 0 {
		metrics.Helper().Counter("fsqueue_ack_total", "Total messages acknowledged in fsqueue").Inc(int64(len(toDelete)))
	}

	return nil
}

// CanNack implements driver.CanNack.
func (s *subscription) CanNack() bool { return true }

// SendNacks implements driver.SendNacks.
func (s *subscription) SendNacks(ctx context.Context, ackIDs []driver.AckID) error {
	if s.topic == nil {
		return ErrTopicNotExist
	}
	if err := ctx.Err(); err != nil {
		return err
	}

	procPath := filepath.Join(s.topic.basePath, processingDir)
	pendPath := filepath.Join(s.topic.basePath, pendingDir)

	s.mu.Lock()
	defer s.mu.Unlock()

	// Pre-allocate slice to reduce memory allocations
	toProcess := make([]driver.AckID, 0, len(ackIDs))
	for _, id := range ackIDs {
		if m, ok := s.msgs[id]; ok {
			// Move file back to pending for redelivery
			src := filepath.Join(procPath, m.filename)
			dst := filepath.Join(pendPath, m.filename)
			_ = os.Rename(src, dst)
			toProcess = append(toProcess, id)
		}
	}

	// Delete all messages at once to reduce map operations
	for _, id := range toProcess {
		delete(s.msgs, id)
	}

	// Track nacked/redelivered messages
	if len(toProcess) > 0 {
		metrics.Helper().Counter("fsqueue_nack_total", "Total messages nacked/redelivered in fsqueue").Inc(int64(len(toProcess)))
	}

	return nil
}

// IsRetryable implements driver.Subscription.IsRetryable.
func (*subscription) IsRetryable(error) bool { return false }

// As implements driver.Subscription.As.
func (s *subscription) As(i any) bool { return false }

// ErrorAs implements driver.Subscription.ErrorAs
func (*subscription) ErrorAs(error, any) bool {
	return false
}

// Close implements driver.Subscription.Close.
// Stops the watcher, rehomes any in-flight (claimed-but-unacked) messages
// from processing/ back to pending/ so a sibling/next subscription can pick
// them up without waiting for a process restart, and deregisters this
// subscription from the topic to prevent notify leaks.
func (s *subscription) Close() error {
	s.mu.Lock()
	if s.closed {
		s.mu.Unlock()
		return nil
	}
	s.closed = true
	msgs := s.msgs
	s.msgs = map[driver.AckID]*message{}
	s.mu.Unlock()

	// Stop the watcher
	close(s.stopWatcher)
	<-s.watcherDone

	if s.topic != nil {
		s.topic.mu.Lock()
		procPath := filepath.Join(s.topic.basePath, processingDir)
		pendPath := filepath.Join(s.topic.basePath, pendingDir)
		for _, m := range msgs {
			src := filepath.Join(procPath, m.filename)
			dst := filepath.Join(pendPath, m.filename)
			_ = os.Rename(src, dst)
		}
		// Deregister from topic.subs to stop the topic from notifying
		// a closed subscription forever.
		for i, sub := range s.topic.subs {
			if sub == s {
				s.topic.subs = append(s.topic.subs[:i], s.topic.subs[i+1:]...)
				break
			}
		}
		s.topic.mu.Unlock()
	}
	return nil
}

// ErrorCode implements driver.Subscription.ErrorCode.
func (*subscription) ErrorCode(err error) gcerrors.ErrorCode {
	switch {
	case errors.Is(err, ErrTopicNotExist), errors.Is(err, ErrTopicClosed), errors.Is(err, ErrSubscriptionClosed):
		return gcerrors.NotFound
	case errors.Is(err, ErrInvalidPath), errors.Is(err, ErrInvalidParam), errors.Is(err, ErrInvalidAckDeadline):
		return gcerrors.InvalidArgument
	case errors.Is(err, context.Canceled):
		return gcerrors.Canceled
	case errors.Is(err, context.DeadlineExceeded):
		return gcerrors.DeadlineExceeded
	default:
		return gcerrors.Unknown
	}
}

// wireMessage is a serializable representation of driver.Message
type wireMessage struct {
	Metadata map[string]string
	Body     []byte
	AckID    int // concrete type instead of driver.AckID (any)
}

// encodeMessage encodes a driver.Message to bytes using gob.
func encodeMessage(dm *driver.Message) ([]byte, error) {
	wm := wireMessage{
		Metadata: dm.Metadata,
		Body:     dm.Body,
		AckID:    dm.AckID.(int), // we always set AckID as int in SendBatch
	}
	var buf bytes.Buffer
	// Pre-allocate buffer to reduce memory allocations
	buf.Grow(1024) // Start with 1KB buffer
	if err := gob.NewEncoder(&buf).Encode(wm); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// decodeMessage decodes bytes to a driver.Message using gob.
func decodeMessage(data []byte) (*driver.Message, error) {
	var wm wireMessage
	if err := gob.NewDecoder(bytes.NewBuffer(data)).Decode(&wm); err != nil {
		return nil, err
	}
	return &driver.Message{
		Metadata: wm.Metadata,
		Body:     wm.Body,
		AckID:    wm.AckID,
		AsFunc:   func(any) bool { return false },
	}, nil
}

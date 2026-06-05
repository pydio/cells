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

package filepubsub

import (
	"context"
	"errors"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"gocloud.dev/gcerrors"
	"gocloud.dev/pubsub"
	"gocloud.dev/pubsub/batcher"
	"gocloud.dev/pubsub/driver"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/emptypb"

	"github.com/pydio/cells/v5/common/broker"
	. "github.com/smartystreets/goconvey/convey"
)

// Test constants
const (
	testBody      = "test"
	invalidPath   = "/dev/null/cannot-create"
	testURLFile   = "file:///tmp/test"
	ackDeadline1m = "?ackdeadline=1m"
)

// Helper: create temp dir with cleanup
func tempDir(_ *testing.T, pattern string) (string, func()) {
	dir, _ := os.MkdirTemp("", pattern)
	return dir, func() { os.RemoveAll(dir) }
}

// Helper: create topic dirs manually
func createTopicDirs(basePath string) {
	for _, d := range []string{pendingDir, processingDir, tmpDir} {
		os.MkdirAll(filepath.Join(basePath, d), 0o755)
	}
}

func mustParseURL(s string) *url.URL {
	u, _ := url.Parse(s)
	return u
}

func TestFilePubSub(t *testing.T) {
	Convey("Test FilePubSub Topic and Subscription", t, func() {
		testDir, cleanup := tempDir(t, "filepubsub-test-*")
		defer cleanup()
		topicPath := filepath.Join(testDir, "test-topic")

		Convey("Create Topic", func() {
			topic, err := NewTopic(topicPath)
			So(err, ShouldBeNil)
			So(topic, ShouldNotBeNil)
			defer topic.Shutdown(context.Background())

			// Verify directories created
			for _, d := range []string{pendingDir, processingDir, tmpDir} {
				_, err = os.Stat(filepath.Join(topicPath, d))
				So(err, ShouldBeNil)
			}
		})

		Convey("Send and Receive Message", func() {
			topic, err := NewTopic(topicPath)
			So(err, ShouldBeNil)
			defer topic.Shutdown(context.Background())

			sub, err := NewSubscription(topic, 1*time.Minute)
			So(err, ShouldBeNil)
			defer sub.Shutdown(context.Background())

			ctx := context.Background()

			// Send message
			err = topic.Send(ctx, &pubsub.Message{
				Body:     []byte("hello world"),
				Metadata: map[string]string{"key": "value"},
			})
			So(err, ShouldBeNil)

			// Receive message
			msg, err := sub.Receive(ctx)
			So(err, ShouldBeNil)
			So(msg, ShouldNotBeNil)
			So(string(msg.Body), ShouldEqual, "hello world")
			So(msg.Metadata["key"], ShouldEqual, "value")

			// Ack the message
			msg.Ack()

			// Verify file is deleted
			time.Sleep(100 * time.Millisecond)
			entries, _ := os.ReadDir(filepath.Join(topicPath, processingDir))
			So(len(entries), ShouldEqual, 0)
		})

		Convey("Nack and Redeliver Message", func() {
			topic, err := NewTopic(topicPath)
			So(err, ShouldBeNil)
			defer topic.Shutdown(context.Background())

			sub, err := NewSubscription(topic, 1*time.Minute)
			So(err, ShouldBeNil)
			defer sub.Shutdown(context.Background())

			ctx := context.Background()

			// Send message
			err = topic.Send(ctx, &pubsub.Message{
				Body: []byte("nack test"),
			})
			So(err, ShouldBeNil)

			// Receive and nack
			msg, err := sub.Receive(ctx)
			So(err, ShouldBeNil)
			So(msg.Nackable(), ShouldBeTrue)
			msg.Nack()

			// Should be redelivered
			time.Sleep(100 * time.Millisecond)
			msg2, err := sub.Receive(ctx)
			So(err, ShouldBeNil)
			So(string(msg2.Body), ShouldEqual, "nack test")
			msg2.Ack()
		})

		Convey("Message Ordering", func() {
			topic, err := NewTopic(topicPath)
			So(err, ShouldBeNil)
			defer topic.Shutdown(context.Background())

			sub, err := NewSubscription(topic, 1*time.Minute)
			So(err, ShouldBeNil)
			defer sub.Shutdown(context.Background())

			ctx := context.Background()

			// Send multiple messages
			for i := 0; i < 5; i++ {
				err = topic.Send(ctx, &pubsub.Message{
					Body: []byte{byte('A' + i)},
				})
				So(err, ShouldBeNil)
				time.Sleep(10 * time.Millisecond) // Ensure different timestamps
			}

			// Receive in order
			for i := 0; i < 5; i++ {
				msg, err := sub.Receive(ctx)
				So(err, ShouldBeNil)
				So(msg.Body[0], ShouldEqual, byte('A'+i))
				msg.Ack()
			}
		})
	})
}

func TestURLOpener(t *testing.T) {
	Convey("Test URL Opener", t, func() {
		td, cleanup := tempDir(t, "filepubsub-url-*")
		defer cleanup()
		ctx := context.Background()

		topic, err := pubsub.OpenTopic(ctx, "file://"+filepath.Join(td, "topic"))
		So(err, ShouldBeNil)
		defer topic.Shutdown(ctx)

		sub, err := pubsub.OpenSubscription(ctx, "file://"+filepath.Join(td, "sub")+"?ackdeadline=30s")
		So(err, ShouldBeNil)
		defer sub.Shutdown(ctx)
	})
}

func TestFpubQueue(t *testing.T) {
	Convey("Test fpubQueue AsyncQueue", t, func() {
		td, cleanup := tempDir(t, "fpubqueue-*")
		defer cleanup()
		ctx := context.Background()

		Convey("OpenURL and Push/Consume", func() {
			q := &fpubQueue{}

			// Missing name fails
			_, err := q.OpenURL(ctx, mustParseURL("fpub://"+td))
			So(err, ShouldEqual, errMissingStreamName)

			// Valid open
			queue, err := q.OpenURL(ctx, mustParseURL("fpub://"+td+"?name=test"))
			So(err, ShouldBeNil)
			defer queue.Close(ctx)

			received := make(chan broker.Message, 1)
			queue.Consume(func(ctx context.Context, msgs ...broker.Message) {
				for _, m := range msgs {
					received <- m
				}
			})
			queue.Push(ctx, &emptypb.Empty{})

			select {
			case <-received:
			case <-time.After(2 * time.Second):
				t.Fatal("timeout")
			}
		})

		Convey("Push after Close", func() {
			q := &fpubQueue{}
			queue, _ := q.OpenURL(ctx, mustParseURL("fpub://"+td+"?name=close"))
			queue.Close(ctx)
			So(queue.Push(ctx, &emptypb.Empty{}), ShouldEqual, errQueueClosed)
		})
	})
}

func TestRecovery(t *testing.T) {
	Convey("Test recovery of processing messages with ordering", t, func() {
		testDir, cleanup := tempDir(t, "filepubsub-recovery-*")
		defer cleanup()
		topicPath := filepath.Join(testDir, "recovery-topic")
		ctx := context.Background()

		// Phase 1: Send multiple messages
		topic, err := NewTopic(topicPath)
		So(err, ShouldBeNil)

		messages := []string{"msg1", "msg2", "recover me", "msg4"}
		for _, msg := range messages {
			err = topic.Send(ctx, &pubsub.Message{Body: []byte(msg)})
			So(err, ShouldBeNil)
			time.Sleep(10 * time.Millisecond) // Ensure different timestamps for ordering
		}

		// Phase 2: Receive and selectively ack
		sub, err := NewSubscription(topic, time.Minute)
		So(err, ShouldBeNil)

		// Receive msg1 and ack (should be gone)
		msg1, err := sub.Receive(ctx)
		So(err, ShouldBeNil)
		So(string(msg1.Body), ShouldEqual, "msg1")
		msg1.Ack()

		// Receive msg2 and ack (should be gone)
		msg2, err := sub.Receive(ctx)
		So(err, ShouldBeNil)
		So(string(msg2.Body), ShouldEqual, "msg2")
		msg2.Ack()

		// Receive "recover me" but DON'T ack (simulate crash with in-flight message)
		msgRecover, err := sub.Receive(ctx)
		So(err, ShouldBeNil)
		So(string(msgRecover.Body), ShouldEqual, "recover me")
		_ = msgRecover // Intentionally NOT acking

		// Receive msg4 and ack (should be gone)
		msg4, err := sub.Receive(ctx)
		So(err, ShouldBeNil)
		So(string(msg4.Body), ShouldEqual, "msg4")
		msg4.Ack()

		// Wait for ack to be processed
		time.Sleep(100 * time.Millisecond)

		// Phase 3: Verify state before crash
		// Pending should be empty (all processed)
		pendingDir := filepath.Join(topicPath, "pending")
		pendingEntries, _ := os.ReadDir(pendingDir)
		So(len(pendingEntries), ShouldEqual, 0) // All moved to processing

		// Processing should have "recover me" (unacked)
		// Phase 3: Verify state before crash
		processingDir := filepath.Join(topicPath, "processing")
		procEntries, _ := os.ReadDir(processingDir)
		So(len(procEntries), ShouldEqual, 1)

		// Optionally verify the file contains "recover me"
		filePath := filepath.Join(processingDir, procEntries[0].Name())
		data, err := os.ReadFile(filePath)
		So(err, ShouldBeNil)
		msg, err := decodeMessage(data)
		So(err, ShouldBeNil)
		So(string(msg.Body), ShouldEqual, "recover me") // ✅ Correct - checks file content

		// Phase 4: Simulate crash - shutdown without acking the last message
		sub.Shutdown(ctx)
		topic.Shutdown(ctx)

		// Phase 5: Recovery - re-open and verify
		topic2, err := NewTopic(topicPath)
		So(err, ShouldBeNil)
		defer topic2.Shutdown(ctx)

		sub2, err := NewSubscription(topic2, time.Minute)
		So(err, ShouldBeNil)
		defer sub2.Shutdown(ctx)

		// Should recover "recover me" (was in processing, moved back to pending)
		recoveredMsg, err := sub2.Receive(ctx)
		So(err, ShouldBeNil)
		So(string(recoveredMsg.Body), ShouldEqual, "recover me")
		recoveredMsg.Ack()

		// Should NOT receive msg1, msg2, or msg4 (they were acked)
		ctx2, cancel := context.WithTimeout(ctx, 500*time.Millisecond)
		defer cancel()

		extraMsg, err := sub2.Receive(ctx2)
		So(err, ShouldNotBeNil) // Timeout or cancelled
		So(extraMsg, ShouldBeNil)

		// Verify processing dir is now clean
		procEntries2, _ := os.ReadDir(processingDir)
		So(len(procEntries2), ShouldEqual, 0)
	})
}

func TestContextCancellation(t *testing.T) {
	Convey("Test context cancellation", t, func() {
		td, cleanup := tempDir(t, "filepubsub-ctx-*")
		defer cleanup()

		topic, _ := NewTopic(td)
		defer topic.Shutdown(context.Background())
		sub, _ := NewSubscription(topic, time.Minute)
		defer sub.Shutdown(context.Background())

		ctx, cancel := context.WithCancel(context.Background())
		cancel()
		_, err := sub.Receive(ctx)
		So(err, ShouldNotBeNil)
	})
}

func TestErrorCases(t *testing.T) {
	Convey("Test error cases", t, func() {
		ctx := context.Background()
		_, err := pubsub.OpenTopic(ctx, testURLFile+"?invalid=param")
		So(err, ShouldNotBeNil)
		_, err = pubsub.OpenTopic(ctx, "file://")
		So(err, ShouldNotBeNil)
	})
}

func TestWithOptions(t *testing.T) {
	Convey("Test WithOptions functions", t, func() {
		td, cleanup := tempDir(t, "filepubsub-opts-*")
		defer cleanup()
		ctx := context.Background()

		topic, _ := NewTopicWithOptions(td, &TopicOptions{BatcherOptions: batcher.Options{MaxBatchSize: 5}})
		defer topic.Shutdown(ctx)
		sub, _ := NewSubscriptionWithOptions(topic, time.Minute, &SubscriptionOptions{ReceiveBatcherOptions: batcher.Options{MaxBatchSize: 5, MaxHandlers: 1}})
		defer sub.Shutdown(ctx)

		// Nil options use defaults
		topic2, _ := NewTopicWithOptions(filepath.Join(td, "t2"), nil)
		defer topic2.Shutdown(ctx)
		sub2, _ := NewSubscriptionWithOptions(topic2, time.Minute, nil)
		defer sub2.Shutdown(ctx)
	})
}
func TestDriverMethods(t *testing.T) {
	Convey("Driver topic and subscription methods", t, func() {
		td, cleanup := tempDir(t, "fspubsub-drv-*")
		defer cleanup()
		ctx := context.Background()

		psTopic, _ := NewTopic(td)
		defer psTopic.Shutdown(ctx)
		var drv *topic
		psTopic.As(&drv)

		sub := &subscription{topic: drv, ackDeadline: time.Minute, msgs: map[driver.AckID]*message{},
			newMsgChan: make(chan struct{}, 1), stopWatcher: make(chan struct{}), watcherDone: make(chan struct{})}
		go func() { <-sub.stopWatcher; close(sub.watcherDone) }()

		// IsRetryable, CanNack
		So(drv.IsRetryable(errors.New("x")), ShouldBeFalse)
		So(sub.IsRetryable(errors.New("x")), ShouldBeFalse)
		So(sub.CanNack(), ShouldBeTrue)

		// As
		var t2 *topic
		var str string
		So(drv.As(&t2), ShouldBeTrue)
		So(drv.As(&str), ShouldBeFalse)
		So(sub.As(&struct{}{}), ShouldBeFalse)

		// ErrorAs
		So(drv.ErrorAs(errors.New("x"), &str), ShouldBeFalse)
		So(sub.ErrorAs(errors.New("x"), &str), ShouldBeFalse)

		// ErrorCode - topic
		So(drv.ErrorCode(ErrTopicNotExist), ShouldEqual, gcerrors.NotFound)
		So(drv.ErrorCode(ErrTopicClosed), ShouldEqual, gcerrors.NotFound)
		So(drv.ErrorCode(ErrSubscriptionClosed), ShouldEqual, gcerrors.NotFound)
		So(drv.ErrorCode(ErrInvalidPath), ShouldEqual, gcerrors.InvalidArgument)
		So(drv.ErrorCode(ErrInvalidParam), ShouldEqual, gcerrors.InvalidArgument)
		So(drv.ErrorCode(ErrInvalidAckDeadline), ShouldEqual, gcerrors.InvalidArgument)
		So(drv.ErrorCode(context.Canceled), ShouldEqual, gcerrors.Canceled)
		So(drv.ErrorCode(context.DeadlineExceeded), ShouldEqual, gcerrors.DeadlineExceeded)
		So(drv.ErrorCode(errors.New("x")), ShouldEqual, gcerrors.Unknown)

		// ErrorCode - subscription
		So(sub.ErrorCode(ErrTopicNotExist), ShouldEqual, gcerrors.NotFound)
		So(sub.ErrorCode(context.Canceled), ShouldEqual, gcerrors.Canceled)
		So(sub.ErrorCode(context.DeadlineExceeded), ShouldEqual, gcerrors.DeadlineExceeded)

		// Close
		So(sub.Close(), ShouldBeNil)
		So(drv.Close(), ShouldBeNil)
		So(drv.closed, ShouldBeTrue)
	})
}

func TestEdgeCases(t *testing.T) {
	Convey("Edge cases for Send/Receive/Ack/Nack", t, func() {
		ctx := context.Background()
		td, cleanup := tempDir(t, "fspubsub-edge-*")
		defer cleanup()

		psTopic, _ := NewTopic(td)
		defer psTopic.Shutdown(ctx)
		var drv *topic
		psTopic.As(&drv)

		canceledCtx, cancel := context.WithCancel(ctx)
		cancel()

		// Nil/closed topic
		var nilDrv *topic
		So(nilDrv.SendBatch(ctx, nil), ShouldEqual, ErrTopicNotExist)
		closedDrv := &topic{basePath: td, closed: true}
		So(closedDrv.SendBatch(ctx, nil), ShouldEqual, ErrTopicClosed)
		So(drv.SendBatch(canceledCtx, nil), ShouldEqual, context.Canceled)

		// Nil/closed subscription
		var nilSub *subscription
		_, err := nilSub.ReceiveBatch(ctx, 1)
		So(err, ShouldEqual, ErrTopicNotExist)
		nilTopicSub := &subscription{topic: nil}
		_, err = nilTopicSub.ReceiveBatch(ctx, 1)
		So(err, ShouldEqual, ErrTopicNotExist)

		closedSub := &subscription{topic: drv, closed: true, msgs: map[driver.AckID]*message{},
			newMsgChan: make(chan struct{}, 1), stopWatcher: make(chan struct{}), watcherDone: make(chan struct{})}
		go func() { <-closedSub.stopWatcher; close(closedSub.watcherDone) }()
		_, err = closedSub.ReceiveBatch(ctx, 1)
		So(err, ShouldEqual, ErrSubscriptionClosed)

		// Ack/Nack with nil topic or canceled ctx
		So(nilTopicSub.SendAcks(ctx, nil), ShouldEqual, ErrTopicNotExist)
		So(nilTopicSub.SendNacks(ctx, nil), ShouldEqual, ErrTopicNotExist)
		validSub := &subscription{topic: drv, msgs: map[driver.AckID]*message{}}
		So(validSub.SendAcks(canceledCtx, nil), ShouldEqual, context.Canceled)
		So(validSub.SendNacks(canceledCtx, nil), ShouldEqual, context.Canceled)
	})
}

func TestCreationErrors(t *testing.T) {
	Convey("Creation errors", t, func() {
		_, err := NewTopic(invalidPath)
		So(err, ShouldNotBeNil)
		So(err.Error(), ShouldContainSubstring, "failed to create directory")

		q := &fpubQueue{}
		_, err = q.OpenURL(context.Background(), mustParseURL("fpub://"+invalidPath+"?name=test"))
		So(err, ShouldNotBeNil)
	})
}

func TestSendBatchErrors(t *testing.T) {
	Convey("SendBatch errors", t, func() {
		ctx := context.Background()

		Convey("BeforeSend callback error", func() {
			td, cleanup := tempDir(t, "fspubsub-send-*")
			defer cleanup()
			createTopicDirs(td)
			drv := &topic{basePath: td}

			expectedErr := errors.New("BeforeSend failed")
			err := drv.SendBatch(ctx, []*driver.Message{{Body: []byte(testBody), BeforeSend: func(func(any) bool) error { return expectedErr }}})
			So(err, ShouldEqual, expectedErr)
		})

		Convey("Write and rename errors", func() {
			td, cleanup := tempDir(t, "fspubsub-send-*")
			defer cleanup()
			createTopicDirs(td)

			// Write error - make tmp readonly
			os.Chmod(filepath.Join(td, tmpDir), 0o555)
			drv := &topic{basePath: td}
			err := drv.SendBatch(ctx, []*driver.Message{{Body: []byte(testBody)}})
			So(err, ShouldNotBeNil)
			So(err.Error(), ShouldContainSubstring, "failed to write temp file")
			os.Chmod(filepath.Join(td, tmpDir), 0o755)

			// Rename error - make pending readonly
			os.Chmod(filepath.Join(td, pendingDir), 0o555)
			err = drv.SendBatch(ctx, []*driver.Message{{Body: []byte(testBody)}})
			So(err, ShouldNotBeNil)
			So(err.Error(), ShouldContainSubstring, "failed to move file to pending")
			os.Chmod(filepath.Join(td, pendingDir), 0o755)
		})
	})
}

func TestReceiveNoWaitErrors(t *testing.T) {
	Convey("receiveNoWait error handling", t, func() {
		td, cleanup := tempDir(t, "fspubsub-recv-*")
		defer cleanup()
		ctx := context.Background()

		psTopic, _ := NewTopic(td)
		defer psTopic.Shutdown(ctx)
		var drv *topic
		psTopic.As(&drv)
		sub := &subscription{topic: drv, ackDeadline: time.Minute, msgs: map[driver.AckID]*message{}}

		// ReadDir error
		os.RemoveAll(filepath.Join(td, pendingDir))
		_, err := sub.receiveNoWait(time.Now(), 1)
		So(err, ShouldNotBeNil)
		os.MkdirAll(filepath.Join(td, pendingDir), 0o755)

		// Corrupt message deleted
		os.WriteFile(filepath.Join(td, pendingDir, "00000000000000000001-corrupt.pb"), []byte("bad"), 0o644)
		msgs, _ := sub.receiveNoWait(time.Now(), 1)
		So(len(msgs), ShouldEqual, 0)

		// recoverProcessing with missing dir returns nil
		os.RemoveAll(filepath.Join(td, processingDir))
		So(sub.recoverProcessing(), ShouldBeNil)
	})
}

func TestURLOpenerErrors(t *testing.T) {
	Convey("URL opener error cases", t, func() {
		ctx := context.Background()

		// Invalid ack deadline
		_, err := pubsub.OpenSubscription(ctx, testURLFile+"?ackdeadline=invalid")
		So(err, ShouldNotBeNil)
		So(err.Error(), ShouldContainSubstring, "invalid ackdeadline")

		// Extra invalid params
		_, err = pubsub.OpenSubscription(ctx, testURLFile+ackDeadline1m+"&badparam=x")
		So(err, ShouldNotBeNil)
		So(err.Error(), ShouldContainSubstring, "invalid query parameter")

		// Canceled context
		canceledCtx, cancel := context.WithCancel(ctx)
		cancel()
		opener := &URLOpener{}
		_, err = opener.OpenTopicURL(canceledCtx, mustParseURL(testURLFile))
		So(err, ShouldEqual, context.Canceled)
		_, err = opener.OpenSubscriptionURL(canceledCtx, mustParseURL(testURLFile))
		So(err, ShouldEqual, context.Canceled)

		// Decode error
		_, err = decodeMessage([]byte("invalid gob data"))
		So(err, ShouldNotBeNil)
	})
}

// testMessage implements broker.Message for testing
type testMessage struct {
	header map[string]string
	body   []byte
}

func (m *testMessage) Unmarshal(ctx context.Context, target proto.Message) (context.Context, error) {
	return ctx, proto.Unmarshal(m.body, target)
}

func (m *testMessage) RawData() (map[string]string, []byte) {
	return m.header, m.body
}

func TestFpubQueuePushRaw(t *testing.T) {
	Convey("fpubQueue PushRaw", t, func() {
		td, cleanup := tempDir(t, "fpubqueue-raw-*")
		defer cleanup()
		ctx := context.Background()
		q := &fpubQueue{}

		queue, _ := q.OpenURL(ctx, mustParseURL("fpub://"+td+"?name=raw"))
		defer queue.Close(ctx)

		received := make(chan broker.Message, 1)
		queue.Consume(func(ctx context.Context, msgs ...broker.Message) { received <- msgs[0] })

		fq := queue.(*fpubQueue)
		fq.PushRaw(ctx, &testMessage{header: map[string]string{"k": "v"}, body: []byte("raw")})

		select {
		case <-received:
		case <-time.After(2 * time.Second):
			t.Fatal("timeout")
		}

		// After close
		queue2, _ := q.OpenURL(ctx, mustParseURL("fpub://"+td+"?name=raw2"))
		fq2 := queue2.(*fpubQueue)
		queue2.Close(ctx)
		So(fq2.PushRaw(ctx, &testMessage{body: []byte("x")}), ShouldEqual, errQueueClosed)
	})
}

func TestFpubQueueOpenURLWithOptions(t *testing.T) {
	Convey("Test fpubQueue OpenURL options", t, func() {
		testDir, err := os.MkdirTemp("", "fpubqueue-opts-*")
		So(err, ShouldBeNil)
		defer os.RemoveAll(testDir)
		ctx := context.Background()
		q := &fpubQueue{}

		// Valid options
		queue, err := q.OpenURL(ctx, mustParseURL("fpub://"+testDir+"?name=test1&ackdeadline=5m&sendbatchsize=5&recvbatchsize=3"))
		So(err, ShouldBeNil)
		queue.Close(ctx)

		// Invalid values fall back to defaults
		queue, err = q.OpenURL(ctx, mustParseURL("fpub://"+testDir+"?name=test2&ackdeadline=invalid&sendbatchsize=notanumber&recvbatchsize=-1"))
		So(err, ShouldBeNil)
		queue.Close(ctx)
	})
}

func TestFileHandlingAndRecovery(t *testing.T) {
	Convey("File handling in receive and recovery", t, func() {
		td, cleanup := tempDir(t, "fspubsub-fh-*")
		defer cleanup()
		ctx := context.Background()

		psTopic, _ := NewTopic(td)
		defer psTopic.Shutdown(ctx)
		var drv *topic
		psTopic.As(&drv)
		sub := &subscription{topic: drv, ackDeadline: time.Minute, msgs: map[driver.AckID]*message{}}

		// Skips directories and non-.pb files
		os.MkdirAll(filepath.Join(td, pendingDir, "subdir.pb"), 0o755)
		os.WriteFile(filepath.Join(td, pendingDir, "notamessage.txt"), []byte("skip"), 0o644)
		msgs, _ := sub.receiveNoWait(time.Now(), 1)
		So(len(msgs), ShouldEqual, 0)

		// Expired message redelivery
		sub.msgs[1] = &message{msg: &driver.Message{Body: []byte("expired"), AckID: 1}, filename: "x.pb", expiration: time.Now().Add(-time.Hour)}
		msgs, _ = sub.receiveNoWait(time.Now(), 1)
		So(len(msgs), ShouldEqual, 1)
		So(string(msgs[0].Body), ShouldEqual, "expired")
		delete(sub.msgs, 1)

		// recoverProcessing skips non-.pb files
		procPath := filepath.Join(td, processingDir)
		os.MkdirAll(filepath.Join(procPath, "subdir.pb"), 0o755)
		os.WriteFile(filepath.Join(procPath, "skip.txt"), []byte("x"), 0o644)
		os.WriteFile(filepath.Join(procPath, "valid.pb"), []byte("data"), 0o644)
		sub.recoverProcessing()
		pendFiles, _ := os.ReadDir(filepath.Join(td, pendingDir))
		pbCount := 0
		for _, f := range pendFiles {
			if strings.HasSuffix(f.Name(), ".pb") && !f.IsDir() {
				pbCount++
			}
		}
		So(pbCount, ShouldEqual, 1)
	})
}

func TestURLOpenerCachesTopics(t *testing.T) {
	Convey("URLOpener caches topics", t, func() {
		tmpDir, err := os.MkdirTemp("", "fspubsub-cache-*")
		So(err, ShouldBeNil)
		defer os.RemoveAll(tmpDir)

		ctx := context.Background()
		opener := &URLOpener{}

		topicPath := filepath.Join(tmpDir, "cached-topic")
		u := mustParseURL("file://" + topicPath)

		// First open
		topic1, err := opener.OpenTopicURL(ctx, u)
		So(err, ShouldBeNil)
		defer topic1.Shutdown(ctx)

		// Second open - should return same topic
		topic2, err := opener.OpenTopicURL(ctx, u)
		So(err, ShouldBeNil)

		// Should be the same instance
		So(topic1, ShouldEqual, topic2)
	})
}

func TestConsumeWithDecodeError(t *testing.T) {
	Convey("Consume handles decode error", t, func() {
		testDir, err := os.MkdirTemp("", "fpubqueue-decode-*")
		So(err, ShouldBeNil)
		defer os.RemoveAll(testDir)

		ctx := context.Background()
		q := &fpubQueue{}
		queue, err := q.OpenURL(ctx, mustParseURL("fpub://"+testDir+"?name=decodetest"))
		So(err, ShouldBeNil)
		defer queue.Close(ctx)

		consumed := make(chan struct{}, 1)
		err = queue.Consume(func(ctx context.Context, msgs ...broker.Message) {
			consumed <- struct{}{}
		})
		So(err, ShouldBeNil)

		// Write invalid message directly to pending (will fail broker decode)
		fq := queue.(*fpubQueue)
		var drv *topic
		fq.topic.As(&drv)
		// Valid fspubsub encoding but invalid broker message
		invalidData, _ := encodeMessage(&driver.Message{Body: []byte("not a valid broker message"), AckID: 1})
		os.WriteFile(filepath.Join(drv.basePath, pendingDir, "00000000000000000001-bad.pb"), invalidData, 0o644)

		// Consumer should handle decode error gracefully (ack and continue)
		time.Sleep(500 * time.Millisecond)

		// Push a valid message - should still be consumed
		err = queue.Push(ctx, &emptypb.Empty{})
		So(err, ShouldBeNil)

		select {
		case <-consumed:
			// OK - consumer still working
		case <-time.After(2 * time.Second):
			t.Fatal("consumer should still be working after decode error")
		}
	})
}

func TestNewSubscriptionErrors(t *testing.T) {
	Convey("newSubscription errors", t, func() {
		td, cleanup := tempDir(t, "fspubsub-sub-err-*")
		defer cleanup()

		psTopic, _ := NewTopic(td)
		defer psTopic.Shutdown(context.Background())
		var drv *topic
		psTopic.As(&drv)

		// Watcher error - remove pending dir
		os.RemoveAll(filepath.Join(td, pendingDir))
		_, err := newSubscription(drv, time.Minute)
		So(err, ShouldNotBeNil)
		So(err.Error(), ShouldContainSubstring, "failed to watch directory")

		// Recreate pending and cause recover error
		os.MkdirAll(filepath.Join(td, pendingDir), 0o755)
		procPath := filepath.Join(td, processingDir)
		os.Chmod(procPath, 0o000)
		defer os.Chmod(procPath, 0o755)
		_, err = newSubscription(drv, time.Minute)
		So(err, ShouldNotBeNil)

		// Empty path
		_, err = pubsub.OpenSubscription(context.Background(), "file://")
		So(err, ShouldNotBeNil)
	})
}

func TestEncodeDecode(t *testing.T) {
	Convey("encode/decode roundtrip and AsFunc", t, func() {
		original := &driver.Message{Body: []byte("test"), Metadata: map[string]string{"k": "v"}, AckID: 42}
		encoded, _ := encodeMessage(original)
		decoded, _ := decodeMessage(encoded)
		So(string(decoded.Body), ShouldEqual, "test")
		So(decoded.Metadata["k"], ShouldEqual, "v")
		So(decoded.AsFunc("x"), ShouldBeFalse)
	})
}

func TestConsumeBehavior(t *testing.T) {
	Convey("Consume context cancel and retry", t, func() {
		td, cleanup := tempDir(t, "fpubqueue-consume-*")
		defer cleanup()

		// Context cancel
		ctx, cancel := context.WithCancel(context.Background())
		q := &fpubQueue{}
		queue, _ := q.OpenURL(ctx, mustParseURL("fpub://"+td+"?name=ctx"))
		queue.Consume(func(ctx context.Context, msgs ...broker.Message) {})
		cancel()
		time.Sleep(100 * time.Millisecond)
		queue.Close(context.Background())

		// Retry after error
		ctx2 := context.Background()
		queue2, _ := q.OpenURL(ctx2, mustParseURL("fpub://"+td+"?name=retry"))
		defer queue2.Close(ctx2)
		consumed := make(chan struct{}, 1)
		queue2.Consume(func(ctx context.Context, msgs ...broker.Message) { consumed <- struct{}{} })

		fq := queue2.(*fpubQueue)
		var drv *topic
		fq.topic.As(&drv)
		pendPath := filepath.Join(drv.basePath, pendingDir)
		os.RemoveAll(pendPath)
		time.Sleep(100 * time.Millisecond)
		os.MkdirAll(pendPath, 0o755)
		queue2.Push(ctx2, &emptypb.Empty{})

		select {
		case <-consumed:
		case <-time.After(3 * time.Second):
		}
	})
}

func TestFpubQueueCloseAndOpenErrors(t *testing.T) {
	Convey("fpubQueue close idempotent, name, and open errors", t, func() {
		td, cleanup := tempDir(t, "fpubqueue-close-*")
		defer cleanup()
		ctx := context.Background()
		q := &fpubQueue{}

		queue, _ := q.OpenURL(ctx, mustParseURL("fpub://"+td+"?name=myqueue"))
		fq := queue.(*fpubQueue)
		So(fq.name, ShouldEqual, "myqueue")
		So(queue.Close(ctx), ShouldBeNil)
		So(queue.Close(ctx), ShouldBeNil)

		// Subscription creation error
		topicPath := filepath.Join(td, "fpub-suberr")
		os.MkdirAll(filepath.Join(topicPath, pendingDir), 0o755)
		os.MkdirAll(filepath.Join(topicPath, processingDir), 0o000)
		defer os.Chmod(filepath.Join(topicPath, processingDir), 0o755)
		os.MkdirAll(filepath.Join(topicPath, tmpDir), 0o755)
		_, err := q.OpenURL(ctx, mustParseURL("fpub://"+td+"?name=suberr"))
		So(err, ShouldNotBeNil)
	})
}

func TestConsumeCallbackPanic(t *testing.T) {
	Convey("Consume callback panic recovery", t, func() {
		td, cleanup := tempDir(t, "fpubqueue-panic-*")
		defer cleanup()
		ctx := context.Background()
		q := &fpubQueue{}

		queue, _ := q.OpenURL(ctx, mustParseURL("fpub://"+td+"?name=panic"))
		defer queue.Close(ctx)

		panicCalled := false
		queue.Consume(func(ctx context.Context, msgs ...broker.Message) {
			panicCalled = true
			panic("test panic")
		})
		queue.Push(ctx, &emptypb.Empty{})

		time.Sleep(2 * time.Second)
		So(panicCalled, ShouldBeTrue)
	})
}

func TestCloseWithShutdownErrors(t *testing.T) {
	Convey("Close handles Shutdown errors gracefully", t, func() {
		td, cleanup := tempDir(t, "fpubqueue-shutdown-*")
		defer cleanup()
		ctx := context.Background()
		q := &fpubQueue{}

		queue, _ := q.OpenURL(ctx, mustParseURL("fpub://"+td+"?name=shuterr"))

		queue.Consume(func(ctx context.Context, msgs ...broker.Message) {})

		err := queue.Close(ctx)
		So(err, ShouldBeNil)

		err2 := queue.Close(ctx)
		So(err2, ShouldBeNil)
	})
}

func TestReceiveErrorHandling(t *testing.T) {
	Convey("Receive error handling with retry", t, func() {
		td, cleanup := tempDir(t, "fpubqueue-recverr-*")
		defer cleanup()
		ctx := context.Background()
		q := &fpubQueue{}

		queue, _ := q.OpenURL(ctx, mustParseURL("fpub://"+td+"?name=recverr"))
		defer queue.Close(ctx)

		messageCount := 0
		queue.Consume(func(ctx context.Context, msgs ...broker.Message) {
			messageCount++
		})

		// Push valid message
		queue.Push(ctx, &emptypb.Empty{})

		// Wait for message
		start := time.Now()
		for messageCount == 0 && time.Since(start) < 2*time.Second {
			time.Sleep(10 * time.Millisecond)
		}
		So(messageCount, ShouldEqual, 1)
	})
}

func TestPushClosedQueue(t *testing.T) {
	Convey("Push to closed queue returns error", t, func() {
		td, cleanup := tempDir(t, "fpubqueue-pushclose-*")
		defer cleanup()
		ctx := context.Background()
		q := &fpubQueue{}

		queue, _ := q.OpenURL(ctx, mustParseURL("fpub://"+td+"?name=pushclose"))
		queue.Close(ctx)

		err := queue.Push(ctx, &emptypb.Empty{})
		So(err, ShouldEqual, errQueueClosed)
	})
}

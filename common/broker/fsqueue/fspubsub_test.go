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
	"net/url"
	"os"
	"path/filepath"
	"testing"
	"time"

	"gocloud.dev/pubsub"
	"google.golang.org/protobuf/types/known/emptypb"

	"github.com/pydio/cells/v5/common/broker"
	. "github.com/smartystreets/goconvey/convey"
)

func TestFilePubSub(t *testing.T) {
	Convey("Test FilePubSub Topic and Subscription", t, func() {
		// Create temp directory
		testDir, err := os.MkdirTemp("", "filepubsub-test-*")
		So(err, ShouldBeNil)
		defer os.RemoveAll(testDir)

		topicPath := filepath.Join(testDir, "test-topic")

		Convey("Create Topic", func() {
			topic, err := NewTopic(topicPath)
			So(err, ShouldBeNil)
			So(topic, ShouldNotBeNil)
			defer topic.Shutdown(context.Background())

			// Verify directories created
			_, err = os.Stat(filepath.Join(topicPath, pendingDir))
			So(err, ShouldBeNil)
			_, err = os.Stat(filepath.Join(topicPath, processingDir))
			So(err, ShouldBeNil)
			_, err = os.Stat(filepath.Join(topicPath, tmpDir))
			So(err, ShouldBeNil)
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
		tmpDir, err := os.MkdirTemp("", "filepubsub-url-test-*")
		So(err, ShouldBeNil)
		defer os.RemoveAll(tmpDir)

		ctx := context.Background()

		Convey("Open Topic via URL", func() {
			url := "file://" + filepath.Join(tmpDir, "url-topic")
			topic, err := pubsub.OpenTopic(ctx, url)
			So(err, ShouldBeNil)
			So(topic, ShouldNotBeNil)
			defer topic.Shutdown(ctx)
		})

		Convey("Open Subscription via URL", func() {
			url := "file://" + filepath.Join(tmpDir, "url-sub") + "?ackdeadline=30s"
			sub, err := pubsub.OpenSubscription(ctx, url)
			So(err, ShouldBeNil)
			So(sub, ShouldNotBeNil)
			defer sub.Shutdown(ctx)
		})
	})
}

func mustParseURL(s string) *url.URL {
	u, _ := url.Parse(s)
	return u
}

func TestFpubQueue(t *testing.T) {
	Convey("Test fpubQueue AsyncQueue", t, func() {
		testDir, err := os.MkdirTemp("", "fpubqueue-test-*")
		So(err, ShouldBeNil)
		defer os.RemoveAll(testDir)

		ctx := context.Background()

		Convey("OpenURL with valid params", func() {
			q := &fpubQueue{}
			queue, err := q.OpenURL(ctx, mustParseURL("fpub://"+testDir+"?name=test"))
			So(err, ShouldBeNil)
			So(queue, ShouldNotBeNil)
			defer queue.Close(ctx)
		})

		Convey("OpenURL missing name param", func() {
			q := &fpubQueue{}
			_, err := q.OpenURL(ctx, mustParseURL("fpub://"+testDir))
			So(err, ShouldEqual, errMissingStreamName)
		})

		Convey("Push and Consume", func() {
			q := &fpubQueue{}
			queue, err := q.OpenURL(ctx, mustParseURL("fpub://"+testDir+"?name=pushtest"))
			So(err, ShouldBeNil)
			defer queue.Close(ctx)

			received := make(chan broker.Message, 1)
			err = queue.Consume(func(ctx context.Context, msgs ...broker.Message) {
				for _, m := range msgs {
					received <- m
				}
			})
			So(err, ShouldBeNil)

			// Push a proto message
			err = queue.Push(ctx, &emptypb.Empty{})
			So(err, ShouldBeNil)

			select {
			case <-received:
				// OK
			case <-time.After(2 * time.Second):
				t.Fatal("timeout waiting for message")
			}
		})

		Convey("Push after Close returns error", func() {
			q := &fpubQueue{}
			queue, err := q.OpenURL(ctx, mustParseURL("fpub://"+testDir+"?name=closetest"))
			So(err, ShouldBeNil)
			queue.Close(ctx)

			err = queue.Push(ctx, &emptypb.Empty{})
			So(err, ShouldEqual, errQueueClosed)
		})
	})
}

func TestRecovery(t *testing.T) {
	Convey("Test recovery of processing messages", t, func() {
		testDir, err := os.MkdirTemp("", "filepubsub-recovery-*")
		So(err, ShouldBeNil)
		defer os.RemoveAll(testDir)

		topicPath := filepath.Join(testDir, "recovery-topic")
		ctx := context.Background()

		// Create topic and send message
		topic, err := NewTopic(topicPath)
		So(err, ShouldBeNil)

		err = topic.Send(ctx, &pubsub.Message{Body: []byte("recover me")})
		So(err, ShouldBeNil)

		sub, err := NewSubscription(topic, time.Minute)
		So(err, ShouldBeNil)

		// Receive but don't ack (simulate crash)
		msg, err := sub.Receive(ctx)
		So(err, ShouldBeNil)
		_ = msg // intentionally not acking

		// Shutdown without ack
		sub.Shutdown(ctx)
		topic.Shutdown(ctx)

		// Re-open - should recover stuck message
		topic2, err := NewTopic(topicPath)
		So(err, ShouldBeNil)
		defer topic2.Shutdown(ctx)

		sub2, err := NewSubscription(topic2, time.Minute)
		So(err, ShouldBeNil)
		defer sub2.Shutdown(ctx)

		msg2, err := sub2.Receive(ctx)
		So(err, ShouldBeNil)
		So(string(msg2.Body), ShouldEqual, "recover me")
		msg2.Ack()
	})
}

func TestContextCancellation(t *testing.T) {
	Convey("Test context cancellation", t, func() {
		testDir, err := os.MkdirTemp("", "filepubsub-ctx-*")
		So(err, ShouldBeNil)
		defer os.RemoveAll(testDir)

		topicPath := filepath.Join(testDir, "ctx-topic")

		topic, err := NewTopic(topicPath)
		So(err, ShouldBeNil)
		defer topic.Shutdown(context.Background())

		sub, err := NewSubscription(topic, time.Minute)
		So(err, ShouldBeNil)
		defer sub.Shutdown(context.Background())

		ctx, cancel := context.WithCancel(context.Background())
		cancel() // Cancel immediately

		_, err = sub.Receive(ctx)
		So(err, ShouldNotBeNil) // Should return context canceled
	})
}

func TestErrorCases(t *testing.T) {
	Convey("Test error cases", t, func() {
		ctx := context.Background()

		Convey("Invalid URL param", func() {
			_, err := pubsub.OpenTopic(ctx, "file:///tmp/test?invalid=param")
			So(err, ShouldNotBeNil)
		})

		Convey("Empty path", func() {
			_, err := pubsub.OpenTopic(ctx, "file://")
			So(err, ShouldNotBeNil)
		})
	})
}

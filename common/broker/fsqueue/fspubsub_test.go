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
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"gocloud.dev/pubsub"
	"gocloud.dev/pubsub/batcher"
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
	Convey("Test recovery of processing messages with ordering", t, func() {
		testDir, err := os.MkdirTemp("", "filepubsub-recovery-*")
		So(err, ShouldBeNil)
		defer os.RemoveAll(testDir)

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
func TestFuzzyOrderingWithFolderStructure(t *testing.T) {
	Convey("Test ordering with deep folder structure and many messages", t, func() {
		testDir, err := os.MkdirTemp("", "filepubsub-fuzzy-*")
		So(err, ShouldBeNil)
		defer os.RemoveAll(testDir)

		// Create 3-layer deep folder structure with various files
		deepPath := filepath.Join(testDir, "layer1", "layer2", "layer3")
		os.MkdirAll(deepPath, 0o755)

		// Add some noise/junk files in the structure
		os.WriteFile(filepath.Join(testDir, "layer1", "junk.txt"), []byte("noise"), 0o644)
		os.WriteFile(filepath.Join(testDir, "layer1", "layer2", ".hidden"), []byte("hidden"), 0o644)
		os.WriteFile(filepath.Join(testDir, "layer1", "layer2", "layer3", "readme.md"), []byte("readme"), 0o644)

		// Create topic in deep folder
		topicPath := filepath.Join(deepPath, "topic")
		ctx := context.Background()

		topic, err := NewTopic(topicPath)
		So(err, ShouldBeNil)
		defer topic.Shutdown(ctx)

		// Phase 1: Send many messages rapidly with various payload sizes
		// TODO configure
		numMessages := 20
		expectedBodies := make([]string, numMessages)

		for i := 0; i < numMessages; i++ {
			payload := fmt.Sprintf("msg-%05d-payload-with-longer-content-for-variety-%s",
				i, strings.Repeat("x", i%100))
			expectedBodies[i] = payload

			err = topic.Send(ctx, &pubsub.Message{Body: []byte(payload)})
			So(err, ShouldBeNil)

			// Vary timing slightly to test timestamp handling
			if i%5 == 0 {
				time.Sleep(1 * time.Millisecond)
			}
		}

		// Verify pending directory state
		pendingDir := filepath.Join(topicPath, pendingDir)
		pendingFiles, err := os.ReadDir(pendingDir)
		So(err, ShouldBeNil)
		So(len(pendingFiles), ShouldEqual, numMessages)

		// Phase 2: Create subscription and receive in order
		sub, err := NewSubscription(topic, time.Minute)
		So(err, ShouldBeNil)
		defer sub.Shutdown(ctx)

		receivedBodies := make([]string, 0, numMessages)

		for i := 0; i < numMessages; i++ {
			msg, err := sub.Receive(ctx)
			So(err, ShouldBeNil)
			So(msg, ShouldNotBeNil)

			body := string(msg.Body)
			receivedBodies = append(receivedBodies, body)
			msg.Ack()

			// Verify processing directory has exactly 1 file at a time (due to batcher)
			procDir := filepath.Join(topicPath, processingDir)
			procFiles, _ := os.ReadDir(procDir)
			So(len(procFiles), ShouldBeLessThanOrEqualTo, 1) // Can be 0 if already cleaned
		}

		// Phase 3: Assert ordering matches send order
		So(len(receivedBodies), ShouldEqual, numMessages)
		var orderErrors []string
		for i := 0; i < numMessages; i++ {
			if receivedBodies[i] != expectedBodies[i] {
				orderErrors = append(orderErrors, fmt.Sprintf("pos %d: got %s, expected %s", i, receivedBodies[i], expectedBodies[i]))
			}
		}
		So(orderErrors, ShouldBeEmpty)

		// Phase 4: Verify pending/processing directories are now clean
		pendingFiles, _ = os.ReadDir(pendingDir)
		So(len(pendingFiles), ShouldEqual, 0)

		procFiles, _ := os.ReadDir(filepath.Join(topicPath, processingDir))
		So(len(procFiles), ShouldEqual, 0)

		// Phase 5: Verify no extra messages are available
		ctx2, cancel := context.WithTimeout(ctx, 200*time.Millisecond)
		defer cancel()

		extraMsg, err := sub.Receive(ctx2)
		So(err, ShouldNotBeNil) // Should timeout
		So(extraMsg, ShouldBeNil)

		// Phase 6: Verify original junk files still exist (not affected by topic)
		layer1Junk, err := os.ReadFile(filepath.Join(testDir, "layer1", "junk.txt"))
		So(err, ShouldBeNil)
		So(string(layer1Junk), ShouldEqual, "noise")

		layer2Hidden, err := os.ReadFile(filepath.Join(testDir, "layer1", "layer2", ".hidden"))
		So(err, ShouldBeNil)
		So(string(layer2Hidden), ShouldEqual, "hidden")
	})
}

func TestWatcherOrderPreservation(t *testing.T) {
	Convey("Test watcher preserves order on rapid batch publish", t, func() {
		testDir, err := os.MkdirTemp("", "filepubsub-watcher-*")
		So(err, ShouldBeNil)
		defer os.RemoveAll(testDir)

		topicPath := filepath.Join(testDir, "watcher-topic")
		ctx := context.Background()

		// Create topic and subscription
		topic, err := NewTopic(topicPath)
		So(err, ShouldBeNil)
		defer topic.Shutdown(ctx)

		sub, err := NewSubscription(topic, time.Minute)
		So(err, ShouldBeNil)
		defer sub.Shutdown(ctx)

		// Rapidly publish many messages (not as batch, but rapid individual sends)
		for i := 0; i < 50; i++ {
			err = topic.Send(ctx, &pubsub.Message{Body: []byte(fmt.Sprintf("msg-%03d", i))})
			So(err, ShouldBeNil)
		}

		// Wait briefly for watcher to fire
		time.Sleep(100 * time.Millisecond)

		// Receive messages and verify ordering
		var received []string
		for i := 0; i < 50; i++ {
			msg, err := sub.Receive(ctx)
			So(err, ShouldBeNil)
			So(msg, ShouldNotBeNil)

			received = append(received, string(msg.Body))
			msg.Ack()
		}

		// Verify all messages received in order
		So(len(received), ShouldEqual, 50)
		var orderErrors []string
		for i, msgBody := range received {
			expectedBody := fmt.Sprintf("msg-%03d", i)
			if msgBody != expectedBody {
				orderErrors = append(orderErrors, fmt.Sprintf("pos %d: got %s, expected %s", i, msgBody, expectedBody))
			}
		}
		So(orderErrors, ShouldBeEmpty)

		// Verify no more messages available
		ctx2, cancel := context.WithTimeout(ctx, 500*time.Millisecond)
		defer cancel()
		_, err = sub.Receive(ctx2)
		So(err, ShouldNotBeNil) // Should timeout
	})
}

func TestRapidBatchOrdering(t *testing.T) {
	Convey("Test rapid batch publishing preserves order", t, func() {
		testDir, err := os.MkdirTemp("", "filepubsub-batch-order-*")
		So(err, ShouldBeNil)
		defer os.RemoveAll(testDir)

		topicPath := filepath.Join(testDir, "batch-order-topic")
		ctx := context.Background()

		topic, err := NewTopic(topicPath)
		So(err, ShouldBeNil)
		defer topic.Shutdown(ctx)

		sub, err := NewSubscription(topic, time.Minute)
		So(err, ShouldBeNil)
		defer sub.Shutdown(ctx)

		// Publish messages as rapidly as possible without delays
		totalMessages := 0
		for batch := 0; batch < 3; batch++ {
			for i := 0; i < 20; i++ {
				err = topic.Send(ctx, &pubsub.Message{
					Body: []byte(fmt.Sprintf("%04d", totalMessages)),
				})
				So(err, ShouldBeNil)
				totalMessages++
			}
			// Minimal delay between batches - still rapid
			time.Sleep(500 * time.Microsecond)
		}

		// Wait for all files to be written
		time.Sleep(200 * time.Millisecond)

		// Receive all messages and extract their sequence numbers
		var received []int
		for i := 0; i < totalMessages; i++ {
			msg, err := sub.Receive(ctx)
			So(err, ShouldBeNil)
			So(msg, ShouldNotBeNil)

			seqNum := 0
			_, err = fmt.Sscanf(string(msg.Body), "%d", &seqNum)
			So(err, ShouldBeNil)
			received = append(received, seqNum)

			msg.Ack()
		}

		// Verify strictly sequential ordering
		So(len(received), ShouldEqual, 60)
		var orderErrors []string
		for i, seqNum := range received {
			if seqNum != i {
				orderErrors = append(orderErrors, fmt.Sprintf("pos %d: got %d, expected %d", i, seqNum, i))
			}
		}
		So(orderErrors, ShouldBeEmpty)

		// Verify no more messages
		ctx2, cancel := context.WithTimeout(ctx, 500*time.Millisecond)
		defer cancel()
		_, err = sub.Receive(ctx2)
		So(err, ShouldNotBeNil)
	})
}

func TestTopicWithBatchOptions(t *testing.T) {
	Convey("Test topic creation with custom batch options", t, func() {
		testDir, err := os.MkdirTemp("", "filepubsub-topic-opts-*")
		So(err, ShouldBeNil)
		defer os.RemoveAll(testDir)

		ctx := context.Background()

		Convey("Should accept custom send batch size", func() {
			topicOpts := &TopicOptions{
				BatcherOptions: batcher.Options{
					MaxBatchSize: 5,
				},
			}
			topic, err := NewTopicWithOptions(testDir, topicOpts)
			So(err, ShouldBeNil)
			So(topic, ShouldNotBeNil)
			defer topic.Shutdown(ctx)

			// Verify topic was created successfully
			pendingPath := filepath.Join(testDir, pendingDir)
			_, err = os.Stat(pendingPath)
			So(err, ShouldBeNil)
		})

		Convey("Should use defaults when nil options provided", func() {
			topic, err := NewTopicWithOptions(testDir, nil)
			So(err, ShouldBeNil)
			So(topic, ShouldNotBeNil)
			defer topic.Shutdown(ctx)
		})
	})
}

func TestSubscriptionWithBatchOptions(t *testing.T) {
	Convey("Test subscription creation with custom batch options", t, func() {
		testDir, err := os.MkdirTemp("", "filepubsub-sub-opts-*")
		So(err, ShouldBeNil)
		defer os.RemoveAll(testDir)

		ctx := context.Background()

		topic, err := NewTopic(testDir)
		So(err, ShouldBeNil)
		defer topic.Shutdown(ctx)

		Convey("Should accept custom receive batch size", func() {
			subOpts := &SubscriptionOptions{
				ReceiveBatcherOptions: batcher.Options{
					MaxBatchSize: 10,
					MaxHandlers:  1, // Keep ordering
				},
			}
			sub, err := NewSubscriptionWithOptions(topic, time.Minute, subOpts)
			So(err, ShouldBeNil)
			So(sub, ShouldNotBeNil)
			defer sub.Shutdown(ctx)
		})

		Convey("Should use defaults when nil options provided", func() {
			sub, err := NewSubscriptionWithOptions(topic, time.Minute, nil)
			So(err, ShouldBeNil)
			So(sub, ShouldNotBeNil)
			defer sub.Shutdown(ctx)
		})
	})
}

func TestBatchSizePreservesOrdering(t *testing.T) {
	Convey("Test that batch size > 1 preserves ordering with MaxHandlers=1", t, func() {
		testDir, err := os.MkdirTemp("", "filepubsub-batch-ordering-*")
		So(err, ShouldBeNil)
		defer os.RemoveAll(testDir)

		ctx := context.Background()

		// Create topic with batch size 10
		topicOpts := &TopicOptions{
			BatcherOptions: batcher.Options{
				MaxBatchSize: 10,
			},
		}
		topic, err := NewTopicWithOptions(testDir, topicOpts)
		So(err, ShouldBeNil)
		defer topic.Shutdown(ctx)

		// Create subscription with receive batch size 5 but MaxHandlers=1
		subOpts := &SubscriptionOptions{
			ReceiveBatcherOptions: batcher.Options{
				MaxBatchSize: 5,
				MaxHandlers:  1, // Single handler maintains order
			},
		}
		sub, err := NewSubscriptionWithOptions(topic, time.Minute, subOpts)
		So(err, ShouldBeNil)
		defer sub.Shutdown(ctx)

		// Publish 20 messages
		totalMessages := 20
		for i := 0; i < totalMessages; i++ {
			err = topic.Send(ctx, &pubsub.Message{
				Body: []byte(fmt.Sprintf("%04d", i)),
			})
			So(err, ShouldBeNil)
		}

		// Wait for writes
		time.Sleep(200 * time.Millisecond)

		// Receive all messages and verify order
		var received []int
		for i := 0; i < totalMessages; i++ {
			msg, err := sub.Receive(ctx)
			So(err, ShouldBeNil)
			So(msg, ShouldNotBeNil)

			seqNum := 0
			_, err = fmt.Sscanf(string(msg.Body), "%d", &seqNum)
			So(err, ShouldBeNil)
			received = append(received, seqNum)

			msg.Ack()
		}

		// Verify strict ordering maintained despite batching
		So(len(received), ShouldEqual, totalMessages)
		for i, seqNum := range received {
			So(seqNum, ShouldEqual, i)
		}
	})
}

func TestSendBatchSizeAffectsThroughput(t *testing.T) {
	Convey("Test that larger send batch reduces filesystem operations", t, func() {
		testDir, err := os.MkdirTemp("", "filepubsub-batch-throughput-*")
		So(err, ShouldBeNil)
		defer os.RemoveAll(testDir)

		ctx := context.Background()

		Convey("Small batch size (1)", func() {
			topicOpts := &TopicOptions{
				BatcherOptions: batcher.Options{
					MaxBatchSize: 1,
				},
			}
			topic, err := NewTopicWithOptions(testDir, topicOpts)
			So(err, ShouldBeNil)
			defer topic.Shutdown(ctx)

			start := time.Now()
			for i := 0; i < 100; i++ {
				err = topic.Send(ctx, &pubsub.Message{
					Body: []byte(fmt.Sprintf("msg-%d", i)),
				})
				So(err, ShouldBeNil)
			}
			smallBatchDuration := time.Since(start)

			// Verify all files written
			pendingPath := filepath.Join(testDir, pendingDir)
			entries, err := os.ReadDir(pendingPath)
			So(err, ShouldBeNil)
			So(len(entries), ShouldEqual, 100)

			t.Logf("Small batch (1): %v for 100 messages", smallBatchDuration)
		})

		// Clean up for next test
		os.RemoveAll(testDir)
		testDir, err = os.MkdirTemp("", "filepubsub-batch-throughput-*")
		So(err, ShouldBeNil)

		Convey("Large batch size (20)", func() {
			topicOpts := &TopicOptions{
				BatcherOptions: batcher.Options{
					MaxBatchSize: 20,
				},
			}
			topic, err := NewTopicWithOptions(testDir, topicOpts)
			So(err, ShouldBeNil)
			defer topic.Shutdown(ctx)

			start := time.Now()
			for i := 0; i < 100; i++ {
				err = topic.Send(ctx, &pubsub.Message{
					Body: []byte(fmt.Sprintf("msg-%d", i)),
				})
				So(err, ShouldBeNil)
			}
			// Force flush
			topic.Shutdown(ctx)
			largeBatchDuration := time.Since(start)

			// Verify all files written
			pendingPath := filepath.Join(testDir, pendingDir)
			entries, err := os.ReadDir(pendingPath)
			So(err, ShouldBeNil)
			So(len(entries), ShouldEqual, 100)

			t.Logf("Large batch (20): %v for 100 messages", largeBatchDuration)
		})
	})
}

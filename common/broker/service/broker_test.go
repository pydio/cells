package service

import (
	"context"
	"fmt"
	"io"
	"sync"
	"testing"

	"github.com/pydio/cells/v4/common/proto/tree"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/server/stubs/discoverytest"
	"gocloud.dev/pubsub"
)

func init() {
	grpc.RegisterMock(common.ServiceBroker, discoverytest.NewBrokerService())
}

func TestServiceBroker(t *testing.T) {

	subscription, _ := NewSubscription("test")

	wg := &sync.WaitGroup{}

	go func() {
		// defer wg.Done()

		defer subscription.Shutdown(context.Background())

		for {
			msg, err := subscription.Receive(context.Background())
			if err == io.EOF {
				return
			}

			ev := &tree.NodeChangeEvent{}
			if err := proto.Unmarshal(msg.Body, ev); err != nil {
				return
			}
			fmt.Println(ev)
			fmt.Println("The message received is ? ", string(msg.Body), err)

			wg.Done()
		}

	}()

	topic, _ := NewTopic("test")

	numMessages := 1000

	wg.Add(numMessages)

	msg := &tree.NodeChangeEvent{Source: &tree.Node{Path: "source"}, Target: &tree.Node{Path: "target"}}
	b, err := proto.Marshal(msg)
	if err != nil {
		fmt.Println("Error ", err)
		return
	}

	for i := 0; i < numMessages; i++ {
		go topic.Send(context.Background(), &pubsub.Message{
			Body: b,
		})
	}

	wg.Wait()

	topic.Shutdown(context.Background())
}

func TestSendReceive(t *testing.T) {
	ctx := context.Background()

	topic, _ := NewTopic("test")
	defer topic.Shutdown(ctx)

	m := &pubsub.Message{Body: []byte("user signed up")}
	if err := topic.Send(ctx, m); err != nil {
		t.Fatal(err)
	}

	sub, _ := NewSubscription("test")
	defer sub.Shutdown(ctx)
	m2, err := sub.Receive(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if string(m2.Body) != string(m.Body) {
		t.Fatalf("received message has body %q, want %q", m2.Body, m.Body)
	}
	m2.Ack()
}

func TestConcurrentReceivesGetAllTheMessages(t *testing.T) {
	howManyToSend := int(1e3)
	ctx, cancel := context.WithCancel(context.Background())

	// wg is used to wait until all messages are received.
	var wg sync.WaitGroup
	wg.Add(howManyToSend)

	// Make a subscription.
	s, _ := NewSubscription("test")
	defer s.Shutdown(ctx)

	// Start 10 goroutines to receive from it.
	var mu sync.Mutex
	receivedMsgs := make(map[string]bool)
	for i := 0; i < 10; i++ {
		go func() {
			for {
				m, err := s.Receive(ctx)
				if err != nil {
					// Permanent error; ctx cancelled or subscription closed is
					// expected once we've received all the messages.
					mu.Lock()
					n := len(receivedMsgs)
					mu.Unlock()
					if n != howManyToSend {
						t.Errorf("Worker's Receive failed before all messages were received (%d)", n)
					}
					return
				}
				m.Ack()
				mu.Lock()
				receivedMsgs[string(m.Body)] = true
				mu.Unlock()
				wg.Done()
			}
		}()
	}

	// Send messages. Each message has a unique body used as a key to receivedMsgs.
	topic, _ := NewTopic("test")
	defer topic.Shutdown(ctx)
	for i := 0; i < howManyToSend; i++ {
		key := fmt.Sprintf("message #%d", i)
		m := &pubsub.Message{Body: []byte(key)}
		if err := topic.Send(ctx, m); err != nil {
			t.Fatal(err)
		}
	}

	// Wait for the goroutines to receive all of the messages, then cancel the
	// ctx so they all exit.
	wg.Wait()
	defer cancel()

	// Check that all the messages were received.
	for i := 0; i < howManyToSend; i++ {
		key := fmt.Sprintf("message #%d", i)
		if !receivedMsgs[key] {
			t.Errorf("message %q was not received", key)
		}
	}
}

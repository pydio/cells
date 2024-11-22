package grpcpubsub

import (
	"context"
	"fmt"
	"io"
	"log"
	"sync"
	"testing"

	"gocloud.dev/pubsub"
	"golang.org/x/sync/errgroup"
	grpc2 "google.golang.org/grpc"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common"
	cb "github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/broker/grpcpubsub/handler"
	"github.com/pydio/cells/v5/common/client/grpc"
	pb "github.com/pydio/cells/v5/common/proto/broker"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/storage/test"

	_ "gocloud.dev/pubsub/mempubsub"

	. "github.com/smartystreets/goconvey/convey"
)

const (
	serviceBroker = common.ServiceGrpcNamespace_ + common.ServiceBroker
)

func init() {
	runtime.Register("test", func(ctx context.Context) {
		service.NewService(
			service.Name(serviceBroker),
			service.Context(ctx),
			service.Tag("test"),
			service.WithGRPC(func(ctx context.Context, srv grpc2.ServiceRegistrar) error {
				pb.RegisterBrokerServer(srv, handler.NewHandler(cb.NewBroker("mem://")))
				return nil
			}),
		)
	})

	// grpc.RegisterMock(common.ServiceBroker, discoverytest.NewBrokerService())
}

func TestServiceBroker(t *testing.T) {
	test.RunTests(t, func(ctx context.Context) {
		Convey("Test Service Broker", t, func() {

			numMessagesToSend := 1000
			numMessagesReceived := 0

			var cancel context.CancelFunc
			conn := grpc.ResolveConn(ctx, common.ServiceBrokerGRPC)

			ctx := runtime.WithClientConn(ctx, conn)
			ctx, cancel = context.WithCancel(ctx)

			// defer cancel()

			cli, err := pb.NewBrokerClient(conn).Subscribe(ctx)
			if err != nil {
				log.Fatal(err)
			}
			sub := &sharedSubscriber{
				Broker_SubscribeClient: cli,
				sharedKey:              "h",
				cancel:                 nil,
				out:                    make(map[string]chan []*pb.Message),
			}
			go sub.Dispatch()

			subscription, err := NewSubscription("test1", WithContext(ctx), WithSubscriber(sub))
			if err != nil {
				log.Fatal(err)
			}

			wg := sync.WaitGroup{}
			wg.Add(1)
			go func() {
				defer wg.Done()
				defer subscription.Shutdown(context.Background())

				for {
					msg, err := subscription.Receive(context.Background())
					if err == io.EOF {
						fmt.Println("Received EOF")
						return
					}

					if err != nil {
						fmt.Println(err)
						return
					}

					fmt.Println("Received message")

					numMessagesReceived++

					msg.Ack()

					ev := &tree.NodeChangeEvent{}
					if err := proto.Unmarshal(msg.Body, ev); err != nil {
						return
					}
				}
			}()

			topic, err := NewTopic("test1", "", WithContext(ctx))
			if err != nil {
				log.Fatal(err)
			}

			msg := &tree.NodeChangeEvent{Source: &tree.Node{Path: "source"}, Target: &tree.Node{Path: "target"}}
			b, err := proto.Marshal(msg)
			if err != nil {
				return
			}

			var eg errgroup.Group
			for i := 0; i < numMessagesToSend; i++ {
				eg.Go(func() error {
					fmt.Println("Sent ", i)
					return topic.Send(context.Background(), &pubsub.Message{
						Body: b,
					})
				})
			}

			if err := eg.Wait(); err != nil {
				So(err, ShouldBeNil)
			}

			topic.Shutdown(ctx)

			wg.Wait()
			fmt.Println(cancel)

			fmt.Println(numMessagesReceived, numMessagesToSend)

			So(numMessagesReceived, ShouldEqual, numMessagesToSend)

		})
	})
}

func SkipTestConcurrentReceivesGetAllTheMessages(t *testing.T) {
	howManyToSend := int(1e3)

	var cancel context.CancelFunc

	conn := grpc.ResolveConn(context.Background(), common.ServiceBroker)
	// ctx := clientcontext.WithClientConn(context.Background(), conn)
	ctx, cancel := context.WithCancel(context.Background())
	cli, err := pb.NewBrokerClient(conn).Subscribe(ctx)
	if err != nil {
		log.Fatal(err)
	}
	sub := &sharedSubscriber{
		Broker_SubscribeClient: cli,
		sharedKey:              "h",
		cancel:                 cancel,
		out:                    make(map[string]chan []*pb.Message),
	}
	go sub.Dispatch()

	// wg is used to wait until all messages are received.
	var wg sync.WaitGroup
	wg.Add(howManyToSend)

	// Make a subscription.
	s, err := NewSubscription("test2", WithContext(ctx), WithSubscriber(sub))
	if err != nil {
		log.Fatal(err)
	}
	defer s.Shutdown(ctx)

	// Start 10 goroutines to receive from it.
	var mu sync.Mutex
	receivedMsgs := make(map[string]bool)
	for i := 0; i < 10; i++ {
		go func(i int) {
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
		}(i)
	}

	// Send messages. Each message has a unique body used as a key to receivedMsgs.
	topic, err := NewTopic("test2", "", WithContext(ctx))
	if err != nil {
		log.Fatal(err)
	}

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

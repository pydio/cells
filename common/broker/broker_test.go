package broker

import (
	"context"
	"testing"
	"time"

	"github.com/pydio/cells/v4/common/proto/tree"

	_ "gocloud.dev/pubsub/mempubsub"

	. "github.com/smartystreets/goconvey/convey"
)

func TestBroker(t *testing.T) {
	Convey("Test Broker", t, func() {
		var ev *tree.NodeChangeEvent

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		unsub, err := Subscribe(ctx, "test", func(ctx context.Context, msg Message) error {
			defer cancel()

			ev = new(tree.NodeChangeEvent)
			msg.Unmarshal(ctx, ev)

			return nil
		})
		So(err, ShouldBeNil)

		defer unsub()

		err = Publish(ctx, "test", &tree.NodeChangeEvent{Source: &tree.Node{Path: "source"}, Target: &tree.Node{Path: "target"}})
		So(err, ShouldBeNil)

		select {
		case <-ctx.Done():
		}

		So(ev, ShouldNotBeNil)
		So(ev.Target.Path, ShouldEqual, "target")
	})
}

func TestBrokerResub(t *testing.T) {
	Convey("Test Broker Unsubscribe / Resubscribe", t, func() {
		var ev *tree.NodeChangeEvent

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		unsub, err := Subscribe(ctx, "test", func(ctx context.Context, msg Message) error {
			defer cancel()

			ev = new(tree.NodeChangeEvent)
			msg.Unmarshal(ctx, ev)

			return nil
		})
		So(err, ShouldBeNil)

		err = Publish(ctx, "test", &tree.NodeChangeEvent{Source: &tree.Node{Path: "source"}, Target: &tree.Node{Path: "target"}})
		So(err, ShouldBeNil)

		select {
		case <-ctx.Done():
		}

		So(ev, ShouldNotBeNil)
		So(ev.Target.Path, ShouldEqual, "target")

		t.Log("Unsubscribing")
		_ = unsub()

		var ev2 *tree.NodeChangeEvent

		ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
		t.Log("Resubscribing")
		unsub, err = Subscribe(ctx, "test", func(ctx context.Context, msg Message) error {
			defer cancel()

			ev2 = new(tree.NodeChangeEvent)
			msg.Unmarshal(ctx, ev2)

			return nil
		})
		So(err, ShouldBeNil)

		defer unsub()

		err = Publish(context.TODO(), "test", &tree.NodeChangeEvent{Source: &tree.Node{Path: "source"}, Target: &tree.Node{Path: "target"}})
		So(err, ShouldBeNil)

		select {
		case <-ctx.Done():
		}

		So(ev2, ShouldNotBeNil)
		So(ev2.Target.Path, ShouldEqual, "target")
	})
}

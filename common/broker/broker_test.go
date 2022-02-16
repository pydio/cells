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
		unsub, err := Subscribe(ctx, "test", func(msg Message) error {
			defer cancel()

			ev = new(tree.NodeChangeEvent)
			msg.Unmarshal(ev)

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

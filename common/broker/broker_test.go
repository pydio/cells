package broker

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/pydio/cells/v4/common/proto/tree"

	_ "gocloud.dev/pubsub/mempubsub"
)

func TestBroker(t *testing.T) {
	unsub, err := Subscribe(context.Background(), "test", func(msg Message) error {
		ev := &tree.NodeChangeEvent{}
		ctx, err := msg.Unmarshal(ev)
		fmt.Println("I've got a message ? ", ctx, ev.Source, err)
		return nil
	})
	if err != nil {
		fmt.Println(err)
		return
	}
	defer unsub()

	if err := Publish(context.Background(), "test", &tree.NodeChangeEvent{Source: &tree.Node{Path: "source"}, Target: &tree.Node{Path: "target"}}); err != nil {
		fmt.Println("Publish error ", err)
		return
	}

	<-time.After(1 * time.Second)
}

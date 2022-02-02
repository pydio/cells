package websocket

import (
	"testing"
	"time"

	"github.com/pydio/cells/v4/common/proto/tree"

	. "github.com/smartystreets/goconvey/convey"
)

func TestEventBatcher(t *testing.T) {

	Convey("Test event batcher", t, func() {

		batchers := make(map[string]*NodeEventsBatcher)
		dispatcher := make(chan *NodeChangeEventWithInfo)
		done := make(chan string)
		var dispatched []*NodeChangeEventWithInfo
		clean := make(chan struct{})
		go func() {
			for {
				select {
				case e := <-dispatcher:
					dispatched = append(dispatched, e)
				case finished := <-done:
					delete(batchers, finished)
				case <-clean:
					return
				}
			}
		}()
		defer close(clean)

		nodeUUID := "test-uuid"
		batcher := NewEventsBatcher(1*time.Second, nodeUUID, dispatcher, done)
		batchers[nodeUUID] = batcher
		batcher.in <- &tree.NodeChangeEvent{
			Type:   tree.NodeChangeEvent_CREATE,
			Target: &tree.Node{Uuid: nodeUUID},
		}
		batcher.in <- &tree.NodeChangeEvent{
			Type:   tree.NodeChangeEvent_UPDATE_CONTENT,
			Target: &tree.Node{Uuid: nodeUUID},
		}
		<-time.After(1500 * time.Millisecond)

		So(dispatched, ShouldHaveLength, 1)
		So(batchers, ShouldHaveLength, 0)
		So(batcher.closed, ShouldBeTrue)

	})

}

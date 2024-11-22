package websocket

import (
	"context"
	"testing"
	"time"

	"github.com/pydio/cells/v5/common/proto/tree"

	. "github.com/smartystreets/goconvey/convey"
)

func TestEventBatcher(t *testing.T) {

	Convey("Test event batcher", t, func() {

		batchers := make(map[string]*NodeEventsBatcher)
		dispatcher := make(chan *NodeChangeEventWithInfo)
		done := make(chan string)
		var dispatched []*NodeChangeEventWithInfo
		var dispatchedCtx context.Context

		clean := make(chan struct{})
		originalCtx := context.WithValue(context.Background(), "originalKey", "originalValue")
		go func() {
			for {
				select {
				case e := <-dispatcher:
					dispatchedCtx = e.ctx
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
		batcher.in <- &NodeChangeEventWithInfo{
			NodeChangeEvent: tree.NodeChangeEvent{
				Type:   tree.NodeChangeEvent_CREATE,
				Target: &tree.Node{Uuid: nodeUUID},
			},
			ctx: originalCtx,
		}
		batcher.in <- &NodeChangeEventWithInfo{
			NodeChangeEvent: tree.NodeChangeEvent{
				Type:   tree.NodeChangeEvent_UPDATE_CONTENT,
				Target: &tree.Node{Uuid: nodeUUID},
			},
			ctx: originalCtx,
		}
		<-time.After(1500 * time.Millisecond)

		So(dispatchedCtx, ShouldNotBeNil)
		So(dispatchedCtx.Value("originalKey"), ShouldEqual, "originalValue")
		So(dispatched, ShouldHaveLength, 1)
		So(batchers, ShouldHaveLength, 0)
		So(batcher.closed, ShouldBeTrue)

	})

}

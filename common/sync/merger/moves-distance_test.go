package merger

import (
	"testing"

	"github.com/pydio/cells/common/sync/endpoints/memory"
	"github.com/pydio/cells/common/sync/model"
	"github.com/smartystreets/goconvey/convey"
)

func TestSortClosestMove(t *testing.T) {

	convey.Convey("Test SortClosestMoves flat", t, func() {

		moves := sortClosestMoves([]*Move{
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/similar-file-moved"},
					Key:       "/similar-file-moved",
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
					Key:       "/file-to-move",
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/similar-file-moved"},
					Key:       "/similar-file-moved",
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/similar-file"},
					Key:       "/similar-file",
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-moved"},
					Key:       "/file-moved",
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
					Key:       "/file-to-move",
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-moved"},
					Key:       "/file-moved",
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/similar-file"},
					Key:       "/similar-file",
				},
			},
		})

		convey.So(moves, convey.ShouldHaveLength, 2)
	})

	convey.Convey("Test SortClosestMoves deep", t, func() {

		moves := sortClosestMoves([]*Move{
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/similar-file-moved"},
					Key:       "/a/similar-file-moved",
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
					Key:       "/file-to-move",
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/similar-file-moved"},
					Key:       "/a/similar-file-moved",
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/similar-file"},
					Key:       "/a/similar-file",
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-moved"},
					Key:       "/file-moved",
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
					Key:       "/file-to-move",
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-moved"},
					Key:       "/file-moved",
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/similar-file"},
					Key:       "/a/similar-file",
				},
			},
		})

		convey.So(moves, convey.ShouldHaveLength, 2)
		var keys int
		for _, m := range moves {
			if m.deleteEvent.Key == "/a/similar-file" {
				convey.So(m.createEvent.Key, convey.ShouldEqual, "/a/similar-file-moved")
				keys++
			} else if m.deleteEvent.Key == "/file-to-move" {
				convey.So(m.createEvent.Key, convey.ShouldEqual, "/file-moved")
				keys++
			}
		}
		convey.So(keys, convey.ShouldEqual, 2)
	})

	convey.Convey("Test SortClosestMoves deeper", t, func() {

		moves := sortClosestMoves([]*Move{
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-moved"},
					Key:       "/file-moved",
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
					Key:       "/file-to-move",
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/b/c/similar-file-moved"},
					Key:       "/a/b/c/similar-file-moved",
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
					Key:       "/file-to-move",
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-moved"},
					Key:       "/file-moved",
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/similar-file"},
					Key:       "/a/similar-file",
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/b/c/similar-file-moved"},
					Key:       "/a/b/c/similar-file-moved",
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/similar-file"},
					Key:       "/a/similar-file",
				},
			},
		})

		convey.So(moves, convey.ShouldHaveLength, 2)
		var keys int
		for _, m := range moves {
			if m.deleteEvent.Key == "/a/similar-file" {
				convey.So(m.createEvent.Key, convey.ShouldEqual, "/a/b/c/similar-file-moved")
				keys++
			} else if m.deleteEvent.Key == "/file-to-move" {
				convey.So(m.createEvent.Key, convey.ShouldEqual, "/file-moved")
				keys++
			}
		}
		convey.So(keys, convey.ShouldEqual, 2)

	})

	convey.Convey("Test SortClosestMoves crossing", t, func() {

		moves := sortClosestMoves([]*Move{
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/similar-file-moved"},
					Key:       "/a/similar-file-moved",
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
					Key:       "/file-to-move",
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/file-moved"},
					Key:       "/a/file-moved",
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
					Key:       "/file-to-move",
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/similar-file-moved"},
					Key:       "/a/similar-file-moved",
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/similar-file"},
					Key:       "/similar-file",
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/file-moved"},
					Key:       "/a/file-moved",
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/similar-file"},
					Key:       "/similar-file",
				},
			},
		})

		convey.So(moves, convey.ShouldHaveLength, 2)
		var keys int
		for _, m := range moves {
			if m.deleteEvent.Key == "/similar-file" {
				keys++
			} else if m.deleteEvent.Key == "/file-to-move" {
				keys++
			}
		}
		convey.So(keys, convey.ShouldEqual, 2)
	})

	convey.Convey("Test SortClosestMoves same paths", t, func() {
		patch := newTreePatch(memory.NewMemDB(), memory.NewMemDB())
		moves := sortClosestMoves([]*Move{
			{
				createEvent: &Operation{EventInfo: model.EventInfo{Path: "/move1"}, Key: "/move1", Patch: patch},
				deleteEvent: &Operation{EventInfo: model.EventInfo{Path: "/move1"}, Key: "/move1", Patch: patch},
			},
			{
				createEvent: &Operation{EventInfo: model.EventInfo{Path: "/move2"}, Key: "/move2", Patch: patch},
				deleteEvent: &Operation{EventInfo: model.EventInfo{Path: "/move1"}, Key: "/move1", Patch: patch},
			},
			{
				createEvent: &Operation{EventInfo: model.EventInfo{Path: "/move3"}, Key: "/move3", Patch: patch},
				deleteEvent: &Operation{EventInfo: model.EventInfo{Path: "/move1"}, Key: "/move1", Patch: patch},
			},
			{
				createEvent: &Operation{EventInfo: model.EventInfo{Path: "/move4"}, Key: "/move4", Patch: patch},
				deleteEvent: &Operation{EventInfo: model.EventInfo{Path: "/move1"}, Key: "/move1", Patch: patch},
			},
			{
				createEvent: &Operation{EventInfo: model.EventInfo{Path: "/move1"}, Key: "/move1", Patch: patch},
				deleteEvent: &Operation{EventInfo: model.EventInfo{Path: "/move2"}, Key: "/move2", Patch: patch},
			},
			{
				createEvent: &Operation{EventInfo: model.EventInfo{Path: "/move2"}, Key: "/move2", Patch: patch},
				deleteEvent: &Operation{EventInfo: model.EventInfo{Path: "/move2"}, Key: "/move2", Patch: patch},
			},
			{
				createEvent: &Operation{EventInfo: model.EventInfo{Path: "/move3"}, Key: "/move3", Patch: patch},
				deleteEvent: &Operation{EventInfo: model.EventInfo{Path: "/move2"}, Key: "/move2", Patch: patch},
			},
			{
				createEvent: &Operation{EventInfo: model.EventInfo{Path: "/move4"}, Key: "/move4", Patch: patch},
				deleteEvent: &Operation{EventInfo: model.EventInfo{Path: "/move2"}, Key: "/move2", Patch: patch},
			},
			{
				createEvent: &Operation{EventInfo: model.EventInfo{Path: "/move1"}, Key: "/move1", Patch: patch},
				deleteEvent: &Operation{EventInfo: model.EventInfo{Path: "/move3"}, Key: "/move3", Patch: patch},
			},
			{
				createEvent: &Operation{EventInfo: model.EventInfo{Path: "/move2"}, Key: "/move2", Patch: patch},
				deleteEvent: &Operation{EventInfo: model.EventInfo{Path: "/move3"}, Key: "/move3", Patch: patch},
			},
			{
				createEvent: &Operation{EventInfo: model.EventInfo{Path: "/move3"}, Key: "/move3", Patch: patch},
				deleteEvent: &Operation{EventInfo: model.EventInfo{Path: "/move3"}, Key: "/move3", Patch: patch},
			},
			{
				createEvent: &Operation{EventInfo: model.EventInfo{Path: "/move4"}, Key: "/move4", Patch: patch},
				deleteEvent: &Operation{EventInfo: model.EventInfo{Path: "/move3"}, Key: "/move3", Patch: patch},
			},
			{
				createEvent: &Operation{EventInfo: model.EventInfo{Path: "/move1"}, Key: "/move1", Patch: patch},
				deleteEvent: &Operation{EventInfo: model.EventInfo{Path: "/move4"}, Key: "/move4", Patch: patch},
			},
			{
				createEvent: &Operation{EventInfo: model.EventInfo{Path: "/move2"}, Key: "/move2", Patch: patch},
				deleteEvent: &Operation{EventInfo: model.EventInfo{Path: "/move4"}, Key: "/move4", Patch: patch},
			},
			{
				createEvent: &Operation{EventInfo: model.EventInfo{Path: "/move3"}, Key: "/move3", Patch: patch},
				deleteEvent: &Operation{EventInfo: model.EventInfo{Path: "/move4"}, Key: "/move4", Patch: patch},
			},
			{
				createEvent: &Operation{EventInfo: model.EventInfo{Path: "/move4"}, Key: "/move4", Patch: patch},
				deleteEvent: &Operation{EventInfo: model.EventInfo{Path: "/move4"}, Key: "/move4", Patch: patch},
			},
		})
		convey.So(moves, convey.ShouldHaveLength, 4)
		var keys int
		for _, m := range moves {
			if m.deleteEvent.Key == "/move1" {
				convey.So(m.createEvent.Key, convey.ShouldEqual, "/move1")
				keys++
			} else if m.deleteEvent.Key == "/move2" {
				convey.So(m.createEvent.Key, convey.ShouldEqual, "/move2")
				keys++
			} else if m.deleteEvent.Key == "/move3" {
				convey.So(m.createEvent.Key, convey.ShouldEqual, "/move3")
				keys++
			} else if m.deleteEvent.Key == "/move4" {
				convey.So(m.createEvent.Key, convey.ShouldEqual, "/move4")
				keys++
			}
		}
		convey.So(keys, convey.ShouldEqual, 4)
	})

}

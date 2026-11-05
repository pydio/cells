package mongodb

import (
	"context"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

// idProvider is a minimal IndexIDProvider for testing DeleteOne's type-assert path.
type idProvider struct{ id string }

func (p *idProvider) IndexID() string { return p.id }

func TestIndexerConstruction(t *testing.T) {
	Convey("newIndexer", t, func() {
		Convey("empty collection returns no-op indexer", func() {
			ix := newIndexer(nil, "")
			So(ix, ShouldNotBeNil)
			So(ix.collection, ShouldEqual, "")
			So(ix.bufferSize, ShouldEqual, 0)
			So(ix.GetCodex(), ShouldBeNil)
		})

		Convey("named collection sets fields", func() {
			ix := newIndexer(nil, "mycoll")
			So(ix.collection, ShouldEqual, "mycoll")
			So(ix.bufferSize, ShouldEqual, 2000)
		})

		Convey("SetCollection overrides the collection name", func() {
			ix := newIndexer(nil, "original")
			ix.SetCollection("updated")
			So(ix.collection, ShouldEqual, "updated")
		})
	})
}

func TestIndexerInit(t *testing.T) {
	ctx := context.Background()

	Convey("Init", t, func() {
		Convey("returns error when collection is empty", func() {
			ix := newIndexer(nil, "")
			err := ix.Init(ctx, nil)
			So(err, ShouldNotBeNil)
			So(err.Error(), ShouldContainSubstring, "collection name")
		})

		Convey("returns nil when collection is set and codec is nil", func() {
			ix := newIndexer(nil, "mycoll")
			err := ix.Init(ctx, nil)
			So(err, ShouldBeNil)
		})
	})
}

func TestIndexerStubs(t *testing.T) {
	ctx := context.Background()

	Convey("TODO stubs", t, func() {
		ix := newIndexer(nil, "mycoll")

		Convey("Count always returns (0, nil)", func() {
			n, err := ix.Count(ctx, nil)
			So(err, ShouldBeNil)
			So(n, ShouldEqual, 0)
		})

		Convey("Search always returns nil", func() {
			err := ix.Search(ctx, nil, nil)
			So(err, ShouldBeNil)
		})
	})
}

func TestIndexerDeleteOneErrors(t *testing.T) {
	ctx := context.Background()

	Convey("DeleteOne without a valid ID returns error before DB call", t, func() {
		ix := newIndexer(nil, "mycoll")

		Convey("nil data", func() {
			err := ix.DeleteOne(ctx, nil)
			So(err, ShouldNotBeNil)
			So(err.Error(), ShouldContainSubstring, "string or an IndexIDProvider")
		})

		Convey("non-string non-IDProvider data", func() {
			err := ix.DeleteOne(ctx, 42)
			So(err, ShouldNotBeNil)
		})

		Convey("IndexIDProvider with empty ID", func() {
			err := ix.DeleteOne(ctx, &idProvider{id: ""})
			So(err, ShouldNotBeNil)
		})
	})
}

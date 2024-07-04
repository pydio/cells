//go:build storage

package bleve_test

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"testing"
	"time"

	v2 "github.com/blevesearch/bleve/v2"

	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage/bleve"
	"github.com/pydio/cells/v4/common/storage/test"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/filesystem"
	"github.com/pydio/cells/v4/common/utils/uuid"

	. "github.com/smartystreets/goconvey/convey"
)

type DocTest struct {
	Message string
	Level   string
	Ts      string
	MsgId   string
	Logger  string
}

type CodexTest struct{}

func (c *CodexTest) Marshal(input interface{}) (interface{}, error) {
	return input, nil
}

func (c *CodexTest) Unmarshal(indexed interface{}) (interface{}, error) {
	return indexed, nil
}

func (c *CodexTest) BuildQuery(query interface{}, offset, limit int32, sortFields string, sortDesc bool) (interface{}, interface{}, error) {
	return query, nil, nil
}

func (c *CodexTest) GetModel(sc configx.Values) (interface{}, bool) {
	return nil, false
}

func TestSizeRotation(t *testing.T) {
	fp := filepath.Join(os.TempDir(), "log_test_rotation_"+uuid.New()+".db")
	rotationTest := test.StorageTestCase{
		DSN:       []string{"bleve://" + fp + fmt.Sprintf("?mapping=log&batchSize=2500&rotationSize=%d", 1*1024*1024)},
		Condition: true,
		DAO:       func(v *bleve.Indexer) *bleve.Indexer { return v },
	}

	test.RunStorageTests([]test.StorageTestCase{rotationTest}, func(ctx context.Context) {

		Convey("Test Insertion Counts", t, func() {

			s, e := manager.Resolve[*bleve.Indexer](ctx)
			So(e, ShouldBeNil)
			So(s, ShouldNotBeNil)

			batch, err := s.NewBatch(ctx)
			if err != nil {
				fmt.Println(err)
			}

			for i := 0; i < 20020; i++ {
				_ = batch.Insert(&DocTest{
					Message: fmt.Sprintf("testing %d", i),
					Level:   "info",
					Ts:      time.Now().Format(time.RFC3339),
					MsgId:   "1",
					Logger:  "pydio.grpc.test.logger",
				})
			}
			_ = batch.Flush()
			<-time.After(3 * time.Second)

			searchAll := &v2.SearchRequest{Query: v2.NewMatchAllQuery()}
			res, err := s.Count(ctx, searchAll)
			So(err, ShouldBeNil)
			So(res, ShouldEqual, 20020)

			m := s.Stats(ctx)
			So(m, ShouldNotBeNil)
			So(m["docsCount"], ShouldEqual, uint64(20020))
			So(m["indexes"], ShouldHaveLength, 9)

			// Put more
			for i := 0; i < 20020; i++ {
				_ = batch.Insert(&DocTest{
					Message: fmt.Sprintf("testing %d", i),
					Level:   "info",
					Ts:      time.Now().Format(time.RFC3339),
					MsgId:   "1",
					Logger:  "pydio.grpc.test.logger",
				})
			}
			_ = batch.Flush()
			<-time.After(3 * time.Second)
			m = s.Stats(ctx)
			So(m, ShouldNotBeNil)
			So(m["docsCount"], ShouldEqual, uint64(40040))
			So(m["indexes"], ShouldHaveLength, 17)
			fullSize := func(indexes []string) (size int64, count int) {
				for _, i := range indexes {
					i = filepath.Join(filepath.Dir(fp), i)
					if st, er := filesystem.RecursiveDiskUsage(i); er == nil {
						size += st
					} else {
						t.Errorf("cannot stat index %s", i)
					}
				}
				return size, len(indexes)
			}
			size1, len1 := fullSize(m["indexes"].([]string))

			So(s.Truncate(ctx, 10*1024*1024, func(s string) {
				t.Logf("Truncate: %s", s)
			}), ShouldBeNil)
			m = s.Stats(ctx)
			size2, len2 := fullSize(m["indexes"].([]string))
			So(len2, ShouldBeLessThan, len1)
			So(size2, ShouldBeLessThan, size1)
			t.Logf("Truncate:  %d (%d) ==> %d (%d)", len1, size1, len2, size2)

		})

		Convey("Test Resync", t, func() {
			s, e := manager.Resolve[*bleve.Indexer](ctx)
			So(e, ShouldBeNil)
			So(s, ShouldNotBeNil)
			s.SetCodex(&CodexTest{})

			// Count logs before resync
			countBefore, er := s.Count(ctx, &v2.SearchRequest{Query: v2.NewMatchAllQuery()})
			So(er, ShouldBeNil)
			t.Logf("Starting ReIndexation with %d logs", countBefore)

			So(s.Resync(ctx, func(s string) {
				t.Log(s)
			}), ShouldBeNil)

			countAfter, er := s.Count(ctx, &v2.SearchRequest{Query: v2.NewMatchAllQuery()})
			So(countAfter, ShouldEqual, countBefore)
			t.Logf("Reading %d logs after Reindexation", countAfter)
		})
	})
}

/*
func TestBleve(t *testing.T) {
	Convey("Testing the opener", t, func() {
		ctx := context.Background()
		conn, err := storage.OpenStorage(
			context.Background(),
			`bleve:///tmp/test?rotationSize=6963200&batchSize=1000&mappingName=test`,
			storage.WithID("test"),
			storage.WithName("test"),
			storage.WithContextualizedKeys(common.KeyJobId),
		)
		So(err, ShouldBeNil)

		prefix, err := template.New("prefix").Parse(`test.{{ .Ctx.Value "JobId" }}`)
		So(err, ShouldBeNil)
		ctx = context.WithValue(ctx, "prefix", prefix)

		var contexts []context.Context
		contexts = append(contexts, context.WithValue(ctx, common.KeyJobId, "job-id-1"))
		contexts = append(contexts, context.WithValue(ctx, common.KeyJobId, "job-id-2"))

		storage.Get(ctx, storage.WithName("test"))

		indexer := &Indexer{}
		conn.Get(ctx, &indexer)

		batch, err := indexer.NewBatch(contexts[0])
		if err != nil {
			fmt.Println(err)
		}

		for i := 0; i < 100000; i++ {
			batch.Insert(fmt.Sprintf("testing %d", i))
		}
		batch.Close()

		batch2, err := indexer.NewBatch(contexts[1])
		if err != nil {
			fmt.Println(err)
		}

		for i := 0; i < 100000; i++ {
			batch2.Insert(fmt.Sprintf("searching %d", i))
		}
		batch2.Close()

		<-time.After(5 * time.Second)

		res, err := indexer.FindMany(contexts[0], "testing", 0, 10, "", false, nil)
		So(err, ShouldBeNil)
		for r := range res {
			fmt.Println(r.(*search.DocumentMatch).String())
		}

		res2, err := indexer.FindMany(contexts[1], "testing", 0, 10, "nil", false, nil)
		So(err, ShouldBeNil)
		for r := range res2 {
			fmt.Println(r.(*search.DocumentMatch).Expl.String())
		}
	})
}
*/

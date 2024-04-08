package bleve

import (
	"context"
	"fmt"
	"testing"
	"text/template"
	"time"

	"github.com/blevesearch/bleve/v2/search"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/storage"
)

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

		indexer := &bleveIndexer{}
		conn.As(&indexer)

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

		res, err := indexer.FindMany(contexts[0], "testing", 0, 10, nil)
		So(err, ShouldBeNil)
		for r := range res {
			fmt.Println(r.(*search.DocumentMatch).String())
		}

		res2, err := indexer.FindMany(contexts[1], "testing", 0, 10, nil)
		So(err, ShouldBeNil)
		for r := range res2 {
			fmt.Println(r.(*search.DocumentMatch).Expl.String())
		}
	})
}

package bolt

import (
	"context"
	"os"
	"path/filepath"
	"testing"
	"time"

	humanize "github.com/dustin/go-humanize"
	"google.golang.org/protobuf/types/known/timestamppb"

	activity2 "github.com/pydio/cells/v4/broker/activity"
	"github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage/test"
	"github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/uuid"

	. "github.com/smartystreets/goconvey/convey"
)

func boltCases() []test.StorageTestCase {
	return []test.StorageTestCase{
		{[]string{"boltdb://" + filepath.Join(os.TempDir(), "activity_bolt_"+uuid.New()+".db")}, true, NoCacheDAO},
	}
}

func TestBoltMassivePurge(t *testing.T) {
	test.RunStorageTests(boltCases(), t, func(ctx context.Context) {
		dao, err := manager.Resolve[activity2.DAO](ctx)
		if err != nil {
			panic(err)
		}

		number := 100000
		bb := dao.(*boltdbimpl).DB

		Convey("Test Massive Purge", t, func() {
			var aa []*activity2.BatchActivity
			for i := 0; i < number; i++ {
				aa = append(aa, &activity2.BatchActivity{
					Object:     &activity.Object{Type: activity.ObjectType_Like, Updated: &timestamppb.Timestamp{Seconds: time.Now().Unix()}},
					OwnerType:  activity.OwnerType_NODE,
					OwnerId:    "node-id",
					BoxName:    activity2.BoxOutbox,
					PublishCtx: nil,
				})
			}
			err := dao.(activity2.BatchDAO).BatchPost(aa)
			So(err, ShouldBeNil)
			st, e := os.Stat(bb.Path())
			So(e, ShouldBeNil)
			initSize := st.Size()
			t.Log("DB Size is", humanize.Bytes(uint64(initSize)))
			stats, _ := jsonx.Marshal(bb.Stats())
			t.Log(string(stats))
			So(st.Size(), ShouldBeGreaterThan, 0)

			<-time.After(5 * time.Second)
			deleted := 0
			// Now Purge
			e = dao.Purge(ctx, func(s string, i int) { deleted += i }, activity.OwnerType_NODE, "node-id", activity2.BoxOutbox, 0, 10, time.Time{}, true, true)
			So(e, ShouldBeNil)
			So(deleted, ShouldBeGreaterThan, 1)

			// Resolve DAO Again
			dao2, err2 := manager.Resolve[activity2.DAO](ctx)
			if err2 != nil {
				panic(err2)
			}
			bb2 := dao2.(*boltdbimpl).DB

			st, _ = os.Stat(bb2.Path())
			newSize := st.Size()
			t.Log("DB Size is now", humanize.Bytes(uint64(newSize)), "after", deleted, "deletes and compaction")
			stats, _ = jsonx.Marshal(bb2.Stats())
			t.Log(string(stats))
			So(newSize, ShouldBeLessThan, initSize)

		})
	})
}

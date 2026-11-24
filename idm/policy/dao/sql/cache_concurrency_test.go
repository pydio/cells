//go:build sql || storage

package sql

import (
	"context"
	"path/filepath"
	"sync"
	"testing"

	"github.com/glebarez/sqlite"
	"github.com/ory/ladon"
	"gorm.io/gorm"

	"github.com/pydio/cells/v5/common/proto/idm"
	. "github.com/smartystreets/goconvey/convey"
)

func TestConcurrentRequestDAOCandidates(t *testing.T) {
	Convey("new request DAOs share initialized schemas without rewriting active preloads", t, func() {
		db, err := gorm.Open(sqlite.Open(filepath.Join(t.TempDir(), "policies.db")), &gorm.Config{})
		So(err, ShouldBeNil)
		pool, err := db.DB()
		So(err, ShouldBeNil)
		defer pool.Close()
		ctx := context.Background()
		dao := NewDAO(db)
		So(dao.Migrate(ctx), ShouldBeNil)
		_, err = dao.StorePolicyGroup(ctx, &idm.PolicyGroup{Uuid: "concurrent", Policies: []*idm.Policy{{ID: "concurrent-p", Effect: idm.PolicyEffect_allow, Subjects: []string{"alice", "bob"}, Resources: []string{"doc:1", "doc:2"}, Actions: []string{"read", "write"}}}})
		So(err, ShouldBeNil)
		const workers = 16
		results := make([]ladon.Policies, workers)
		failures := make([]error, workers)
		start := make(chan struct{})
		var wg sync.WaitGroup
		for i := 0; i < workers; i++ {
			wg.Add(1)
			go func(i int) {
				defer wg.Done()
				<-start
				results[i], failures[i] = NewDAO(db).FindRequestCandidates(ctx, &ladon.Request{Subject: "alice", Resource: "doc:1", Action: "read"})
			}(i)
		}
		close(start)
		wg.Wait()
		for i := 0; i < workers; i++ {
			So(failures[i], ShouldBeNil)
			So(results[i], ShouldHaveLength, 1)
			So(results[i][0].GetID(), ShouldEqual, "concurrent-p")
			So(results[i][0].GetSubjects(), ShouldResemble, []string{"alice", "bob"})
			So(results[i][0].GetResources(), ShouldResemble, []string{"doc:1", "doc:2"})
			So(results[i][0].GetActions(), ShouldResemble, []string{"read", "write"})
		}
	})
}

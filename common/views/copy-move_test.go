package views

import (
	"context"
	"fmt"
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"
)

type testSessionLocker struct {
	expiration time.Duration
}

func (t *testSessionLocker) Lock(ctx context.Context) error {
	return nil
}

func (t *testSessionLocker) UpdateExpiration(ctx context.Context, expireAfter time.Duration) error {
	t.expiration = expireAfter
	return nil
}

func (t *testSessionLocker) Unlock(ctx context.Context) error {
	return nil
}

func (t *testSessionLocker) AddChildTarget(parentUUID, targetChildName string) {
}

func Test_updateLockerForByteSize(t *testing.T) {
	Convey("Test update lock expiration time", t, func() {
		tester := &testSessionLocker{}
		updateLockerForByteSize(context.Background(), tester, 300*1024*1024*1024, 20000)
		fmt.Println(tester.expiration)
		So(tester.expiration, ShouldBeGreaterThan, 12*time.Minute)

		updateLockerForByteSize(context.Background(), tester, 30*1024*1024, 1)
		fmt.Println(tester.expiration)
	})
}

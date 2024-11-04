package grpc

import (
	"context"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"github.com/pydio/cells/v4/common/utils/net"
	"github.com/pydio/cells/v4/common/utils/uuid"

	. "github.com/smartystreets/goconvey/convey"
)

// SkipTestObjectHandler_StartMinioServer - skipped for now, it does not stop when context is done
func SkipTestObjectHandler_StartMinioServer(t *testing.T) {
	Convey("Start multiple minio servers", t, func() {
		h := &ObjectHandler{}
		p1 := net.GetAvailablePort()
		p2 := net.GetAvailablePort()
		serveFolder1 := filepath.Join(os.TempDir(), "minio"+uuid.New()[:6])
		serveFolder2 := filepath.Join(os.TempDir(), "minio"+uuid.New()[:6])
		wg := &sync.WaitGroup{}
		wg.Add(2)
		ctx, can := context.WithTimeout(context.Background(), 10*time.Second)
		defer can()
		// Will block until context done
		go func() {
			defer wg.Done()
			er := h.startMinioServer(ctx, "test1", "minio_test_api_key", "minio_test_api_secret", serveFolder1, int32(p1))
			So(er, ShouldBeNil)
		}()
		go func() {
			defer wg.Done()
			er := h.startMinioServer(ctx, "test2", "minio_test_api_key", "minio_test_api_secret", serveFolder2, int32(p2))
			So(er, ShouldBeNil)
		}()
		wg.Wait()
	})
}

package memory

import (
	"context"
	"fmt"
	"testing"

	"github.com/pydio/cells/v4/common/config"
	c "github.com/smartystreets/goconvey/convey"
)

func TestInit(t *testing.T) {
	c.Convey("Test memory config", t, func() {

		ctx := context.Background()
		conf, err := config.OpenStore(ctx, "memory:///")
		c.So(err, c.ShouldBeNil)

		conf.Set("")
		fmt.Println(conf)
	})
}

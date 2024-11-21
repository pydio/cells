package service

import (
	"context"
	"fmt"
	"os"
	"testing"

	"github.com/spf13/viper"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"

	_ "embed"
	_ "github.com/pydio/cells/v4/common/registry/config"
	_ "github.com/pydio/cells/v4/common/server/grpc"
)

var (
	//go:embed service_test.yaml
	serviceTestTemplate string
)

func TestRegistryXDS(t *testing.T) {

	if os.Getenv("GRPC_XDS_BOOTSTRAP") == "" {
		t.Logf("Skipping this test as no GRPC_XDS_BOOTSTRAP environment variable set")
		t.Skip()
		return
	}

	v := viper.New()
	v.Set("yaml", serviceTestTemplate)
	v.Set("config", "mem://")
	v.Set("keyring", "mem://")
	v.Set("registry", "mem://")
	runtime.SetRuntime(v)

	ctx := context.Background()

	mg, err := manager.NewManager(ctx, "main", nil)
	if err != nil {
		t.Error("cannot run test", err)
		t.Fail()
		return
	}

	if err := mg.ServeAll(); err != nil {
		t.Error("cannot run test", err)
	}

	conn, err := grpc.NewClient("xds://default.cells.com/cells", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		t.Error("cannot run test", err)
	}

	cli := registry.NewRegistryClient(conn)
	resp, err := cli.List(ctx, &registry.ListRequest{})
	if err != nil {
		t.Error("cannot list registry", err)
	}

	fmt.Println(resp)
}

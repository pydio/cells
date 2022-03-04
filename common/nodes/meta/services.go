package meta

import (
	"context"
	"github.com/pydio/cells/v4/common/runtime"
	servercontext "github.com/pydio/cells/v4/common/server/context"

	"github.com/pydio/cells/v4/common/log"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
)

func servicesWithMeta(ctx context.Context, metaName string, metaValue string) ([]registry.Service, error) {

	reg := servercontext.GetRegistry(ctx)
	if reg == nil {
		defaultReg, err := registry.OpenRegistry(context.Background(), runtime.RegistryURL())
		if err != nil {
			return nil, err
		}
		reg = defaultReg
		log.Logger(context.Background()).Warn("servicesWithMeta called empty registry, will use default, this is not recommended")
	}

	items, e := reg.List(registry.WithType(pb.ItemType_SERVICE), registry.WithMeta(metaName, metaValue))
	if e != nil {
		return nil, e
	}
	var res []registry.Service
	for _, item := range items {
		res = append(res, item.(registry.Service))
	}

	return res, nil

}

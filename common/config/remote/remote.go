package remote

import (
	"context"
	"encoding/json"
	"time"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/x/configx"
	proto "github.com/pydio/config-srv/proto/config"
)

type remote struct {
	// cli    proto.ConfigClient
	config configx.Values
}

func New() configx.Entrypoint {
	return &remote{}
}

func (r *remote) Val(path ...string) configx.Values {
	if r.config == nil {
		r.Get()
	}

	return r.config.Val(path...)
}

func (r *remote) Get() configx.Value {
	v := configx.New(configx.WithJSON())

	cli := proto.NewConfigClient(common.ServiceGrpcNamespace_+common.ServiceConfig, defaults.NewClient())
	rsp, err := cli.Read(context.TODO(), &proto.ReadRequest{
		Id:   "config",
		Path: "",
	})

	if err != nil {
		return nil
	}

	m := make(map[string]interface{})
	json.Unmarshal([]byte(rsp.Change.ChangeSet.Data), &m)

	v.Set(m)

	r.config = v

	return v
}

func (r *remote) Set(data interface{}) error {
	return nil
}

func (r *remote) Del() error {
	return nil
}

func (r *remote) Watch(path ...string) (configx.Receiver, error) {
	return &receiver{}, nil
}

type receiver struct {
}

func (r *receiver) Next() (configx.Values, error) {
	<-time.After(10 * time.Second)

	v := configx.New(configx.WithJSON())

	cli := proto.NewConfigClient(common.ServiceGrpcNamespace_+common.ServiceConfig, defaults.NewClient())
	rsp, err := cli.Read(context.TODO(), &proto.ReadRequest{
		Id:   "config",
		Path: "",
	})

	m := make(map[string]interface{})

	if err == nil {
		json.Unmarshal([]byte(rsp.Change.ChangeSet.Data), &m)
	}

	v.Set(m)

	return v, err
}

func (r *receiver) Stop() {
}

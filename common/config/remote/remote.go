package remote

import (
	"context"
	"encoding/json"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/x/configx"
	proto "github.com/pydio/config-srv/proto/config"
)

type remote struct {
	id     string
	config configx.Values
}

func New(id string) configx.Entrypoint {
	return &remote{id: id}
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
		Id:   r.id,
		Path: "",
	})

	r.config = v

	if err != nil {
		return v
	}

	m := make(map[string]interface{})
	json.Unmarshal([]byte(rsp.Change.ChangeSet.Data), &m)

	v.Set(m)

	return v
}

func (r *remote) Set(data interface{}) error {
	return nil
}

func (r *remote) Del() error {
	return nil
}

func (r *remote) Watch(path ...string) (configx.Receiver, error) {
	cli := proto.NewConfigClient(common.ServiceGrpcNamespace_+common.ServiceConfig, defaults.NewClient())
	stream, err := cli.Watch(context.TODO(), &proto.WatchRequest{
		Id: r.id,
		// 	Path: strings.Join(path, "/"),
	})

	if err != nil {
		return nil, err
	}

	return &receiver{stream: stream}, nil
}

type receiver struct {
	stream proto.Config_WatchClient
}

func (r *receiver) Next() (configx.Values, error) {
	var m interface{}
	rsp, err := r.stream.Recv()
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal([]byte(rsp.ChangeSet.Data), &m); err != nil {
		return nil, err
	}

	v := configx.New(configx.WithJSON())

	v.Set(m)

	return v, err
}

func (r *receiver) Stop() {
}

package etcd

import (
	"context"
	"fmt"

	"github.com/pydio/cells/x/configx"
	"go.etcd.io/etcd/clientv3"
)

type etcd struct {
	clientv3.Config
}

func NewSource(config clientv3.Config) configx.KVStore {
	return &etcd{
		Config: config,
	}
}

func (m *etcd) Get() configx.Value {
	v := configx.NewMap()

	cli, err := clientv3.New(m.Config)
	if err != nil {
		return v
	}
	defer cli.Close()

	resp, _ := cli.Get(context.Background(), "")
	fmt.Println(resp)

	return v
}

func (m *etcd) Set(data interface{}) error {
	cli, err := clientv3.New(m.Config)
	if err != nil {
		return err
	}
	defer cli.Close()

	resp, err := cli.Put(context.Background(), "", data.(string))
	if err != nil {
		return err
	}

	fmt.Println(resp)

	return nil
}

func (m *etcd) Del() error {
	return fmt.Errorf("not implemented")
}

func (m *etcd) Watch(path ...string) (configx.Receiver, error) {
	// For the moment do nothing
	return &receiver{}, nil
}

type receiver struct{}

func (*receiver) Next() (configx.Values, error) {
	select {}

	return nil, nil
}

func (*receiver) Stop() {
}

package raft

import (
	"context"
	"encoding/json"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/storage"
	"github.com/pydio/cells/x/configx"
)

type conf struct {
	cli storage.StorageEndpointClient
	cache configx.Values
}

var (
	_ configx.Entrypoint = (*conf)(nil)
)

func (c *conf) Get() configx.Value {
	c.cache = configx.New()

	resp, err := c.cli.Lookup(context.TODO(), &storage.LookupRequest{})
	if err != nil {
		return c.cache
	}

	if err := c.cache.Set(resp.GetValue()); err != nil {
		return c.cache
	}

	return c.cache
}

func (c *conf) Set(value interface{}) error {
	b, err := json.Marshal(value)
	if err != nil {
		return err
	}
	if _, err := c.cli.Propose(context.TODO(), &storage.ProposeRequest{Value: b}); err != nil {
		return err
	}
	return nil
}

func (c *conf) Del() error {
	return c.Set(nil)
}

func (c *conf) Val(path ...string) configx.Values {
	c.Get()
	return c.cache.Val(path...)
}

func NewConfig() configx.Entrypoint {
	cli := storage.NewStorageEndpointClient(common.ServiceStorageNamespace_+common.ServiceConfig, defaults.NewClient())
	return &conf{
		cli: cli,
	}
}

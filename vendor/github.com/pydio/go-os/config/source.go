package config

import (
	"time"

	"github.com/micro/go-micro/client"
	proto "github.com/pydio/config-srv/proto/config"
	"golang.org/x/net/context"
)

type source struct {
	opts SourceOptions

	client proto.ConfigClient
}

func (s *source) Read() (*ChangeSet, error) {
	rsp, err := s.client.Read(context.TODO(), &proto.ReadRequest{
		Id: s.opts.Name,
	})
	if err != nil {
		return nil, err
	}
	return &ChangeSet{
		Timestamp: time.Unix(rsp.Change.ChangeSet.Timestamp, 0),
		Data:      []byte(rsp.Change.ChangeSet.Data),
		Checksum:  rsp.Change.ChangeSet.Checksum,
		Source:    rsp.Change.ChangeSet.Source,
	}, nil
}

func (s *source) String() string {
	return "os"
}

func (s *source) Watch() (SourceWatcher, error) {
	stream, err := s.client.Watch(context.TODO(), &proto.WatchRequest{
		Id: s.opts.Name,
	})
	if err != nil {
		return nil, err
	}
	return &sourceWatcher{stream}, nil
}

func NewSource(opts ...SourceOption) Source {
	var options SourceOptions
	for _, o := range opts {
		o(&options)
	}

	if len(options.Name) == 0 {
		options.Name = DefaultSourceName
	}

	if options.Client == nil {
		options.Client = client.DefaultClient
	}

	return &source{
		opts:   options,
		client: proto.NewConfigClient("go.micro.srv.config", options.Client),
	}
}

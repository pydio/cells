package grpc

import (
	"context"

	"time"

	"crypto/md5"
	"fmt"

	"strings"

	"github.com/micro/go-micro/errors"
	"github.com/pydio/cells/common/config"
	proto "github.com/pydio/config-srv/proto/config"
	"github.com/pydio/go-os/config/proto"
)

var (
	notImplemented = errors.New("notimplemented", "service not implemented", 501)
)

type Handler struct {
}

func (h *Handler) Create(ctx context.Context, request *proto.CreateRequest, response *proto.CreateResponse) error {
	return notImplemented
}

func (h *Handler) Update(ctx context.Context, request *proto.UpdateRequest, response *proto.UpdateResponse) error {
	return notImplemented
}

func (h *Handler) Delete(ctx context.Context, request *proto.DeleteRequest, response *proto.DeleteResponse) error {
	return notImplemented
}

func (h *Handler) Search(ctx context.Context, request *proto.SearchRequest, response *proto.SearchResponse) error {
	return notImplemented
}

func (h *Handler) Read(ctx context.Context, request *proto.ReadRequest, response *proto.ReadResponse) error {

	var value []byte
	if request.Path != "" {
		value = config.Get(strings.Split(request.Path, "/")...).Bytes()
	} else {
		value = config.Default().Bytes()
	}

	hasher := md5.New()
	hasher.Write(value)
	checksum := fmt.Sprintf("%x", hasher.Sum(nil))

	response.Change = &proto.Change{
		Timestamp: time.Now().Unix(),
		Path:      request.Path,
		ChangeSet: &go_micro_os_config.ChangeSet{
			Data:      string(value),
			Source:    "local",
			Checksum:  checksum,
			Timestamp: time.Now().Unix(),
		},
	}

	return nil
}

func (h *Handler) AuditLog(ctx context.Context, request *proto.AuditLogRequest, response *proto.AuditLogResponse) error {
	return notImplemented
}

func (h *Handler) Watch(ctx context.Context, request *proto.WatchRequest, stream proto.Config_WatchStream) error {
	// TODO
	return nil
}

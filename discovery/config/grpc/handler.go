package grpc

import (
	"context"
	"crypto/md5"
	"fmt"
	"strings"
	"time"

	json "github.com/pydio/cells/x/jsonx"

	"github.com/micro/go-micro/errors"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	proto "github.com/pydio/config-srv/proto/config"
	go_micro_os_config "github.com/pydio/go-os/config/proto"
)

var (
	notImplemented = errors.New("notimplemented", "service not implemented", 501)
)

type Handler struct{}

// Create just forwards to Update
func (h *Handler) Create(ctx context.Context, request *proto.CreateRequest, response *proto.CreateResponse) error {
	return h.Update(ctx, &proto.UpdateRequest{
		Change: request.Change,
	}, &proto.UpdateResponse{})
}

// Update will write to local config or vault
func (h *Handler) Update(ctx context.Context, request *proto.UpdateRequest, response *proto.UpdateResponse) error {
	var data interface{}
	if e := json.Unmarshal([]byte(request.Change.ChangeSet.Data), &data); e != nil {
		return e
	}
	if request.Change.Id == "config" {
		log.Logger(ctx).Info("Updating config remotely")
		config.Set(data, request.Change.Path)
		config.Save(common.PydioSystemUsername, "Updated config remotely")
	} else if request.Change.Id == "vault" {
		log.Logger(ctx).Info("Updating vault remotely")
		config.SetSecret(request.Change.Path, data.(string))
	} else {
		return errors.BadRequest("config.update", "config ID not supported, please use config or vault")
	}
	return nil
}

// Delete will write to local config or vault
func (h *Handler) Delete(ctx context.Context, request *proto.DeleteRequest, response *proto.DeleteResponse) error {
	if request.Change.Id == "config" {
		log.Logger(ctx).Info("Updating config remotely")
		config.Del(request.Change.Path)
		config.Save(common.PydioSystemUsername, "Updated config remotely")
	} else if request.Change.Id == "vault" {
		log.Logger(ctx).Info("Updating vault remotely")
		config.DelSecret(request.Change.Path)
	} else {
		return errors.BadRequest("config.delete", "config ID not supported, please use config or vault")
	}
	return nil
}

func (h *Handler) Search(ctx context.Context, request *proto.SearchRequest, response *proto.SearchResponse) error {
	return notImplemented
}

// Read will grab info from local config or vault
func (h *Handler) Read(ctx context.Context, request *proto.ReadRequest, response *proto.ReadResponse) error {

	var value []byte
	if request.Id == "config" {
		if request.Path != "" {
			value = config.Get(strings.Split(request.Path, "/")...).Bytes()
		} else {
			value = config.Get().Bytes()
		}
	} else if request.Id == "vault" {
		value = config.Vault().Val(request.Path).Bytes()
	} else {
		return errors.BadRequest("config.read", "config ID not supported, please use config or vault")
	}

	hasher := md5.New()
	hasher.Write(value)
	checksum := fmt.Sprintf("%x", hasher.Sum(nil))

	response.Change = &proto.Change{
		Timestamp: time.Now().Unix(),
		Path:      request.Path,
		ChangeSet: &go_micro_os_config.ChangeSet{
			Data:      string(value),
			Source:    request.Id,
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
	if request.Id == "config" {
		w, err := config.Watch()
		if err != nil {
			return err
		}

		for {
			next, err := w.Next()
			if err != nil {
				return err
			}

			value := next.Bytes()

			hasher := md5.New()
			hasher.Write(value)
			checksum := fmt.Sprintf("%x", hasher.Sum(nil))

			stream.Send(&proto.WatchResponse{
				Id: "config",
				ChangeSet: &go_micro_os_config.ChangeSet{
					Data:      string(value),
					Source:    request.Id,
					Checksum:  checksum,
					Timestamp: time.Now().Unix(),
				},
			})
		}
	}
	return nil
}

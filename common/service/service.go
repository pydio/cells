/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package service

import (
	"context"
	"errors"
	"fmt"
	"github.com/pydio/cells/v4/common/runtime"
	"sync"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/server"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

// Service for the pydio app
type service struct {
	opts   *ServiceOptions
	status Status
}

var _ registry.Service = (*service)(nil)

var (
	mandatoryOptions []ServiceOption

	errNoServerAttached = errors.New("no server attached to the service")
)

type Service interface {
	Init(opts ...ServiceOption)
	Options() *ServiceOptions
	Metadata() map[string]string
	ID() string
	Name() string
	Start() error
	Stop() error
	ServerScheme() string
	As(i interface{}) bool
}

type Stopper func() error

func NewService(opts ...ServiceOption) Service {
	s := &service{
		opts:   newOptions(append(mandatoryOptions, opts...)...),
		status: StatusStopped,
	}

	name := s.opts.Name

	s.opts.Context = servicecontext.WithServiceName(s.opts.Context, name)

	if reg := servicecontext.GetRegistry(s.opts.Context); reg != nil {
		if err := reg.Register(s); err != nil {
			log.Logger(s.opts.Context).Warn("could not register", zap.Error(err))
		}
	} else {
		log.Logger(s.opts.Context).Warn("no registry attached")
	}

	return s
}

func (s *service) Init(opts ...ServiceOption) {
	for _, o := range opts {
		if o == nil {
			continue
		}
		o(s.opts)
	}
}

func (s *service) Options() *ServiceOptions {
	return s.opts
}

func (s *service) Metadata() map[string]string {
	// Create a copy to append internal status as metadata
	cp := make(map[string]string, len(s.opts.Metadata)+1)
	for k, v := range s.opts.Metadata {
		cp[k] = v
	}
	cp[MetaStatusKey] = string(s.status)
	cp[MetaDescriptionKey] = s.opts.Description
	return cp
}

func (s *service) As(i interface{}) bool {
	if v, ok := i.(*Service); ok {
		*v = s
		return true
	}

	if v, ok := i.(*registry.Service); ok {
		*v = s
		return true
	}

	return false
}

func (s *service) updateRegister(status ...Status) {
	if len(status) > 0 {
		s.status = status[0]
		if status[0] == StatusReady {
			log.Logger(s.opts.Context).Info("ready")
		} else {
			log.Logger(s.opts.Context).Debug(string(status[0]))
		}
	}
	reg := servicecontext.GetRegistry(s.opts.Context)
	if reg == nil {
		return
	}
	var options []registry.RegisterOption
	if s.opts.Server != nil && (s.status == StatusServing || s.status == StatusReady) {
		options = append(options, registry.WithEdgeTo(s.opts.Server.ID(), "Server", map[string]string{}))
	}
	if len(s.opts.Tags) > 0 {
		for _, t := range s.opts.Tags {
			generic := util.ToGeneric(&pb.Item{Id: "tag-" + t, Name: "tag", Metadata: map[string]string{"Tag": t}}, &pb.Generic{Type: pb.ItemType_TAG})
			if er := reg.Register(generic); er == nil {
				options = append(options, registry.WithEdgeTo(generic.ID(), "Tag", map[string]string{}))
			}
		}
	}
	if err := reg.Register(s, options...); err != nil {
		if s.status == StatusStopping || s.status == StatusStopped {
			log.Logger(s.opts.Context).Debug("could not register", zap.Error(err))
		} else {
			log.Logger(s.opts.Context).Warn("could not register", zap.Error(err))
		}
		return
	}
}

func (s *service) Start() (er error) {
	// now := time.Now()

	defer func() {
		if e := recover(); e != nil {
			log.Logger(s.opts.Context).Error("panic while starting service", zap.Any("p", e))
			er = fmt.Errorf("panic while starting service %v", e)
		}
	}()

	s.updateRegister(StatusStarting)

	for _, before := range s.opts.BeforeStart {
		if err := before(s.opts.Context); err != nil {
			return err
		}
	}

	if s.opts.serverStart != nil {
		if err := s.opts.serverStart(); err != nil {
			return err
		}
	}

	s.updateRegister(StatusServing)

	onServerReady := func() error {
		w := &sync.WaitGroup{}
		w.Add(len(s.opts.AfterServe) + 1)
		go func() {
			defer w.Done()
			if e := UpdateServiceVersion(s.opts); e != nil {
				log.Logger(s.opts.Context).Error("UpdateServiceVersion failed", zap.Error(er))
			}
		}()
		for _, after := range s.opts.AfterServe {
			go func(f func(context.Context) error) {
				defer w.Done()
				if e := f(s.opts.Context); e != nil {
					log.Logger(s.opts.Context).Error("AfterServe failed", zap.Error(er))
				}
			}(after)
		}
		w.Wait()
		s.updateRegister(StatusReady)
		return nil
	}

	if s.opts.Server.Metadata()["status"] == "ready" {
		if er := onServerReady(); er != nil {
			fmt.Println("Error while manually triggering onServerReady", er.Error())
		}
	} else {
		s.opts.Server.AfterServe(onServerReady)
	}

	//s.updateRegister()

	return nil
}

func (s *service) Stop() error {

	s.updateRegister(StatusStopping)

	if s.opts.serverStop != nil {
		if err := s.opts.serverStop(); err != nil {
			return err
		}
	}

	if reg := servicecontext.GetRegistry(s.opts.Context); reg != nil {
		// Deregister to make sure to break existing links
		if err := reg.Deregister(s); err != nil {
			log.Logger(s.opts.Context).Error("Could not deregister", zap.Error(err))
		} else {
			// Re-register as Stopped
			s.updateRegister(StatusStopped)
		}
	} else {
		log.Logger(s.opts.Context).Warn("no registry attached")
	}

	log.Logger(s.opts.Context).Info("stopped")

	return nil
}

func (s *service) Name() string {
	return s.opts.Name
}
func (s *service) ID() string {
	return s.opts.ID
}
func (s *service) Version() string {
	return s.opts.Version
}
func (s *service) Tags() []string {
	return s.opts.Tags
}

func (s *service) ServerScheme() string {
	if s.opts.Fork && !runtime.IsFork() {
		return "fork://?start=" + s.opts.Name
	} else if s.opts.customScheme != "" {
		return s.opts.customScheme
	}
	switch s.opts.serverType {
	case server.TypeGeneric:
		return "generic://"
	case server.TypeGrpc:
		return "grpc://"
	case server.TypeHttp:
		return runtime.HttpServerType() + "://"
	default:
		return ""
	}
}

func (s *service) MarshalJSON() ([]byte, error) {
	return json.Marshal(s.opts)
}

func (s *service) UnmarshalJSON(b []byte) error {
	return json.Unmarshal(b, s.opts)
}

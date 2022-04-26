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
	IsGRPC() bool
	IsREST() bool
	IsGeneric() bool
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
	if err := reg.Register(s); err != nil {
		if s.status == StatusStopping || s.status == StatusStopped {
			log.Logger(s.opts.Context).Debug("could not register", zap.Error(err))
		} else {
			log.Logger(s.opts.Context).Warn("could not register", zap.Error(err))
		}
		return
	}
	if s.opts.Server != nil {
		if edge, e := registry.RegisterEdge(reg, s.opts.Server.ID(), s.ID(), "ServiceNode", map[string]string{}); e != nil {
			log.Logger(s.opts.Context).Warn("could not register edge", zap.Error(e), zap.Any("edge", edge))
		}
	}
	if len(s.opts.Tags) > 0 {
		for _, t := range s.opts.Tags {
			generic := util.ToGeneric(&pb.Generic{Id: "tag-" + t, Name: "tag", Metadata: map[string]string{"Tag": t}})
			if er := reg.Register(generic); er == nil {
				if edge, e := registry.RegisterEdge(reg, generic.ID(), s.ID(), "Tag", map[string]string{}); e != nil {
					log.Logger(s.opts.Context).Warn("could not register edge", zap.Error(e), zap.Any("edge", edge))
				}
			}
		}
	}
}

func (s *service) Start() (er error) {
	// now := time.Now()

	defer func() {
		/*
			elapsed := time.Now().Sub(now)
			if elapsed > 5*time.Second {
				fmt.Println(s.Name(), "took ", elapsed, " to start")
			}
		*/

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

	for _, after := range s.opts.AfterStart {
		if err := after(s.opts.Context); err != nil {
			return err
		}
	}

	s.updateRegister(StatusServing)

	wg := &sync.WaitGroup{}
	wg.Add(len(s.opts.AfterServe) + 1)

	s.opts.Server.AfterServe(func() error {
		go func() {
			defer wg.Done()
			if e := UpdateServiceVersion(s.opts); e != nil {
				log.Logger(s.opts.Context).Error("UpdateServiceVersion failed", zap.Error(er))
			}
		}()
		return nil
	})

	for _, after := range s.opts.AfterServe {
		s.opts.Server.AfterServe(func() error {
			go func(f func(context.Context) error) {
				defer wg.Done()
				if e := f(s.opts.Context); e != nil {
					log.Logger(s.opts.Context).Error("AfterServe failed", zap.Error(er))
				}
			}(after)
			return nil
		})
	}

	s.updateRegister()

	go func() {
		wg.Wait()
		s.updateRegister(StatusReady)
	}()

	return nil
}

func (s *service) Stop() error {

	s.updateRegister(StatusStopping)

	for _, before := range s.opts.BeforeStop {
		if err := before(s.opts.Context); err != nil {
			return err
		}
	}

	if s.opts.serverStop != nil {
		if err := s.opts.serverStop(); err != nil {
			return err
		}
	}

	for _, after := range s.opts.AfterStop {
		if err := after(s.opts.Context); err != nil {
			return err
		}
	}

	if reg := servicecontext.GetRegistry(s.opts.Context); reg != nil {
		if err := reg.Deregister(s); err != nil {
			log.Logger(s.opts.Context).Error("Could not deregister", zap.Error(err))
		} else if edges, er2 := registry.ClearEdges(reg, s); er2 != nil {
			log.Logger(s.opts.Context).Error("Could not deregister edges", zap.Error(er2))
		} else if len(edges) > 0 {
			log.Logger(s.opts.Context).Debug(fmt.Sprintf("Deregistered %d edges", len(edges)))
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
func (s *service) IsGeneric() bool {
	return s.opts.serverType == server.ServerType_GENERIC
}
func (s *service) IsGRPC() bool {
	return s.opts.serverType == server.ServerType_GRPC
}
func (s *service) IsREST() bool {
	return s.opts.serverType == server.ServerType_HTTP
}

func (s *service) MarshalJSON() ([]byte, error) {
	return json.Marshal(s.opts)
}

func (s *service) UnmarshalJSON(b []byte) error {
	return json.Unmarshal(b, s.opts)
}

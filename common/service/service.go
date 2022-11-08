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
	errors2 "github.com/pkg/errors"
	"go.uber.org/zap"
	"sync"

	"github.com/pydio/cells/v4/common/log"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

// Service for the pydio app
type service struct {
	opts   *ServiceOptions
	status registry.Status
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
	Start(oo ...registry.RegisterOption) error
	Stop(oo ...registry.RegisterOption) error
	OnServe(oo ...registry.RegisterOption) error
	ServerScheme() string
	Server() server.Server
	Is(status registry.Status) bool
	As(i interface{}) bool
}

type Stopper func() error

// NewService creates a service and directly register it as StatusStopped
func NewService(opts ...ServiceOption) Service {
	s := &service{
		opts:   newOptions(append(mandatoryOptions, opts...)...),
		status: registry.StatusStopped,
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

// Server is a shortcut to Options().Server
func (s *service) Server() server.Server {
	return s.opts.Server
}

// Is checks internal status
func (s *service) Is(status registry.Status) bool {
	return s.status == status
}

func (s *service) Metadata() map[string]string {
	// Create a copy to append internal status as metadata
	cp := make(map[string]string, len(s.opts.Metadata)+1)
	for k, v := range s.opts.Metadata {
		cp[k] = v
	}
	cp[registry.MetaStatusKey] = string(s.status)
	cp[registry.MetaDescriptionKey] = s.opts.Description
	if s.opts.Unique {
		cp[registry.MetaUniqueKey] = "unique"
	}
	if len(s.opts.Storages) > 0 {
		for _, so := range s.opts.Storages {
			if len(so.SupportedDrivers) > 0 {
				cp[so.StorageKey] = so.ToMeta()
			}
		}
	}
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

// Start runs service and update registry as required
func (s *service) Start(oo ...registry.RegisterOption) (er error) {
	locker := servicecontext.GetRegistry(s.opts.Context).NewLocker("start-service-" + s.Name())
	locker.Lock()

	defer func() {
		locker.Unlock()

		if e := recover(); e != nil {
			log.Logger(s.opts.Context).Error("panic while starting service", zap.Any("p", e))
			er = fmt.Errorf("panic while starting service %v", e)
		}
		if er != nil {
			er = errors2.Wrap(er, "service.Start "+s.Name())
			s.updateRegister(registry.StatusError)
		}
	}()

	s.updateRegister(registry.StatusStarting)

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

	s.updateRegister(registry.StatusServing)

	return nil
}

// Stop shutdown service and clean registry
func (s *service) Stop(oo ...registry.RegisterOption) error {

	s.updateRegister(registry.StatusStopping)

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

	opts := &registry.RegisterOptions{}
	for _, o := range oo {
		o(opts)
	}

	if reg := servicecontext.GetRegistry(s.opts.Context); reg != nil {
		// Deregister to make sure to break existing links
		if err := reg.Deregister(s, registry.WithRegisterFailFast()); err != nil {
			log.Logger(s.opts.Context).Error("Could not deregister", zap.Error(err))
		} else if !opts.DeregisterFull {
			// Re-register as Stopped
			s.updateRegister(registry.StatusStopped)
		}
	} else {
		log.Logger(s.opts.Context).Warn("no registry attached")
	}

	log.Logger(s.opts.Context).Info("stopped")

	return nil
}

// OnServe should be called after s.Server is started. It can be passed as an AfterServe() option
// to server.Start()
func (s *service) OnServe(oo ...registry.RegisterOption) error {
	w := &sync.WaitGroup{}
	w.Add(len(s.opts.AfterServe) + 1)
	go func() {
		fmt.Println("Doing this ?")
		if locker := servicecontext.GetRegistry(s.opts.Context).NewLocker("update-service-version-" + s.opts.Name); locker != nil {
			locker.Lock()
			defer locker.Unlock()
		}

		defer w.Done()
		if e := UpdateServiceVersion(s.opts); e != nil {
			log.Logger(s.opts.Context).Error("UpdateServiceVersion failed", zap.Error(e))
		}
	}()
	for _, after := range s.opts.AfterServe {
		go func(f func(context.Context) error) {
			defer w.Done()
			if e := f(s.opts.Context); e != nil {
				log.Logger(s.opts.Context).Error("AfterServe failed", zap.Error(e))
			}
		}(after)
	}
	w.Wait()
	s.updateRegister(registry.StatusReady)
	return nil
}

func (s *service) updateRegister(status ...registry.Status) {
	if len(status) > 0 {
		s.status = status[0]
		if status[0] == registry.StatusReady {
			log.Logger(s.opts.Context).Info("ready")
		} else {
			log.Logger(s.opts.Context).Debug(string(status[0]))
		}
	}
	up := s.status == registry.StatusServing || s.status == registry.StatusReady
	down := s.status == registry.StatusStopping || s.status == registry.StatusStopped || s.status == registry.StatusError

	reg := servicecontext.GetRegistry(s.opts.Context)
	if reg == nil {
		return
	}
	var options []registry.RegisterOption
	if up && s.opts.Server != nil {
		options = append(options, registry.WithEdgeTo(s.opts.Server.ID(), "Server", map[string]string{}))
	}
	if len(s.opts.Tags) > 0 && !down {
		for _, t := range s.opts.Tags {
			generic := util.ToGeneric(&pb.Item{Id: "tag-" + t, Name: "tag", Metadata: map[string]string{"Tag": t}}, &pb.Generic{Type: pb.ItemType_TAG})
			if er := reg.Register(generic); er == nil {
				options = append(options, registry.WithEdgeTo(generic.ID(), "Tag", map[string]string{}))
			}
		}
	}
	if down {
		options = append(options, registry.WithRegisterFailFast())
	}
	if err := reg.Register(s, options...); err != nil {
		if s.status == registry.StatusStopping || s.status == registry.StatusStopped {
			log.Logger(s.opts.Context).Debug("could not register", zap.Error(err))
		} else {
			log.Logger(s.opts.Context).Warn("could not register", zap.Error(err))
		}
		return
	}
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

// ServerScheme returns current server URL type
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
	case server.TypeHttpPure:
		return "http://"
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

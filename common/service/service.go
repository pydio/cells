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

	errors2 "github.com/pkg/errors"
	"go.uber.org/zap"
	"golang.org/x/exp/maps"

	"github.com/pydio/cells/v4/common/config"
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
	Opts   *ServiceOptions
	status registry.Status

	locker *sync.RWMutex
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
	Version() string
	Tags() []string
	Start(oo ...registry.RegisterOption) error
	Stop(oo ...registry.RegisterOption) error
	OnServe(oo ...registry.RegisterOption) error
	ServerScheme() string
	Server() server.Server
	Is(status registry.Status) bool
	As(i interface{}) bool

	config(ctx context.Context) config.Store
}

type Stopper func() error

// NewService creates a service and directly register it as StatusStopped
func NewService(opts ...ServiceOption) Service {
	s := &service{
		Opts:   newOptions(append(mandatoryOptions, opts...)...),
		status: registry.StatusStopped,
		locker: &sync.RWMutex{},
	}

	name := s.Opts.Name

	s.Opts.Context = servicecontext.WithServiceName(s.Opts.Context, name)

	if reg := servicecontext.GetRegistry(s.Opts.Context); reg != nil {
		if err := reg.Register(s); err != nil {
			log.Logger(s.Opts.Context).Warn("could not register", zap.Error(err))
		}
	} else {
		log.Logger(s.Opts.Context).Warn("no registry attached")
	}

	return s
}

func (s *service) Init(opts ...ServiceOption) {
	for _, o := range opts {
		if o == nil {
			continue
		}
		o(s.Opts)
	}
}

func (s *service) Options() *ServiceOptions {
	return s.Opts
}

// Server is a shortcut to Options().Server
func (s *service) Server() server.Server {
	return s.Opts.Server
}

// Is checks internal status
func (s *service) Is(status registry.Status) bool {
	return s.status == status
}

func (s *service) Metadata() map[string]string {
	s.locker.RLock()
	defer s.locker.RUnlock()

	// Create a copy to append internal status as metadata
	clone := maps.Clone(s.Opts.Metadata)
	clone[registry.MetaStatusKey] = string(s.status)
	clone[registry.MetaDescriptionKey] = s.Opts.Description
	if s.Opts.Unique {
		clone[registry.MetaUniqueKey] = "unique"
	}
	if len(s.Opts.Storages) > 0 {
		for _, so := range s.Opts.Storages {
			if len(so.SupportedDrivers) > 0 {
				clone[so.StorageKey] = so.ToMeta()
			}
		}
	}
	return clone
}

func (s *service) SetMetadata(meta map[string]string) {
	s.locker.Lock()
	defer s.locker.Unlock()

	if status, ok := meta[registry.MetaStatusKey]; ok {
		s.status = registry.Status(status)
	}
	s.Opts.Metadata = meta
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
	// Making sure we only start one at a time for a unique service
	if s.Options().Unique {
		reg := servicecontext.GetRegistry(s.Opts.Context)
		if locker := reg.NewLocker("start-service-" + s.Name()); locker != nil {
			locker.Lock()
			w, err := reg.Watch(registry.WithID(s.ID()), registry.WithType(pb.ItemType_SERVER))
			if err != nil {
				log.Logger(s.Opts.Context).Error("Error unlocking service"+s.Name(), zap.Error(err))
				locker.Unlock()
				return err
			}
			go func() {
				defer w.Stop()
				defer locker.Unlock()

				for {
					res, err := w.Next()
					if err != nil {
						log.Logger(s.Opts.Context).Error("Error unlocking service "+s.Name()+" (watch)", zap.Error(err))
						return
					}

					if len(res.Items()) == 0 {
						continue
					}

					if res.Items()[0].Metadata()[registry.MetaStatusKey] != string(registry.StatusStarting) {
						// Releasing the lock
						break
					}
				}
			}()
		}
	}

	defer func() {
		if e := recover(); e != nil {
			log.Logger(s.Opts.Context).Error("panic while starting service", zap.Any("p", e))
			er = fmt.Errorf("panic while starting service %v", e)
		}
		if er != nil {
			er = errors2.Wrap(er, "service.Start "+s.Name())
			s.updateRegister(registry.StatusError)
		}
	}()

	s.updateRegister(registry.StatusStarting)

	for _, before := range s.Opts.BeforeStart {
		if err := before(s.Opts.Context); err != nil {
			return err
		}
	}

	if s.Opts.serverStart != nil {
		if err := s.Opts.serverStart(); err != nil {
			return err
		}
	}

	s.updateRegister(registry.StatusReady)

	// Updating server

	return nil
}

// Stop shutdown service and clean registry
func (s *service) Stop(oo ...registry.RegisterOption) error {

	s.updateRegister(registry.StatusStopping)

	for _, before := range s.Opts.BeforeStop {
		if err := before(s.Opts.Context); err != nil {
			return err
		}
	}

	if s.Opts.serverStop != nil {
		if err := s.Opts.serverStop(); err != nil {
			return err
		}
	}

	opts := &registry.RegisterOptions{}
	for _, o := range oo {
		o(opts)
	}

	if reg := servicecontext.GetRegistry(s.Opts.Context); reg != nil {
		// Deregister to make sure to break existing links
		if err := reg.Deregister(s, registry.WithRegisterFailFast()); err != nil {
			log.Logger(s.Opts.Context).Error("Could not deregister", zap.Error(err))
		} else if !opts.DeregisterFull {
			// Re-register as Stopped
			s.updateRegister(registry.StatusStopped)
		}
	} else {
		log.Logger(s.Opts.Context).Warn("no registry attached")
	}

	log.Logger(s.Opts.Context).Info("stopped")

	return nil
}

// OnServe should be called after s.Server is started. It can be passed as an AfterServe() option
// to server.Start()
func (s *service) OnServe(oo ...registry.RegisterOption) error {
	w := &sync.WaitGroup{}
	w.Add(len(s.Opts.AfterServe) + 1)
	go func() {
		if locker := servicecontext.GetRegistry(s.Opts.Context).NewLocker("update-service-version-" + s.Opts.Name); locker != nil {
			locker.Lock()
			defer locker.Unlock()
		}

		defer w.Done()

		//if e := UpdateServiceVersion(s.Opts.Context, config.Main(), s.Opts); e != nil {
		//	log.Logger(s.Opts.Context).Error("UpdateServiceVersion failed", zap.Error(e))
		//}
	}()
	for _, after := range s.Opts.AfterServe {
		go func(f func(context.Context) error) {
			defer w.Done()
			if e := f(s.Opts.Context); e != nil {
				log.Logger(s.Opts.Context).Error("AfterServe failed", zap.Error(e))
			}
		}(after)
	}
	w.Wait()

	return nil
}

func (s *service) updateRegister(status ...registry.Status) {
	if len(status) > 0 {
		s.status = status[0]
		if status[0] == registry.StatusReady {
			log.Logger(s.Opts.Context).Info("ready")
		} else {
			log.Logger(s.Opts.Context).Debug(string(status[0]))
		}
	}
	// up := s.status == registry.StatusReady
	down := s.status == registry.StatusStopping || s.status == registry.StatusStopped || s.status == registry.StatusError

	reg := servicecontext.GetRegistry(s.Opts.Context)
	if reg == nil {
		return
	}
	var options []registry.RegisterOption
	if s.Opts.Server != nil {
		options = append(options, registry.WithEdgeTo(s.Opts.Server.ID(), "Server", map[string]string{}))
	}
	if len(s.Opts.Tags) > 0 && !down {
		for _, t := range s.Opts.Tags {
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
			log.Logger(s.Opts.Context).Debug("could not register", zap.Error(err))
		} else {
			log.Logger(s.Opts.Context).Warn("could not register", zap.Error(err))
		}
		return
	}
}

func (s *service) Name() string {
	return s.Opts.Name
}
func (s *service) ID() string {
	return s.Opts.ID
}
func (s *service) Version() string {
	return s.Opts.Version
}
func (s *service) Tags() []string {
	return s.Opts.Tags
}

// ServerScheme returns current server URL type
func (s *service) ServerScheme() string {
	if s.Opts.Fork && !runtime.IsFork() {
		return "fork://?start=" + s.Opts.Name
	} else if s.Opts.customScheme != "" {
		return s.Opts.customScheme
	}
	switch s.Opts.serverType {
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
	return json.Marshal(s.Opts)
}

func (s *service) UnmarshalJSON(b []byte) error {
	return json.Unmarshal(b, s.Opts)
}

func (s *service) Clone() interface{} {
	clone := &service{
		locker: &sync.RWMutex{},
	}

	clone.status = s.status
	clone.Opts = &ServiceOptions{
		Name:        s.Opts.Name,
		ID:          s.Opts.ID,
		Tags:        s.Opts.Tags,
		Version:     s.Opts.Version,
		Description: s.Opts.Description,
		Metadata:    maps.Clone(s.Opts.Metadata),
	}

	return clone
}

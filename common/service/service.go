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
	"encoding/gob"
	"fmt"
	"sync"

	"go.uber.org/zap"
	"golang.org/x/exp/maps"

	"github.com/pydio/cells/v5/common/errors"
	pb "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/registry/util"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/server"
	"github.com/pydio/cells/v5/common/telemetry/log"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/openurl"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

// Service for the pydio app
type service struct {
	Opts   *ServiceOptions
	status registry.Status

	locker *sync.RWMutex
}

type serviceKey struct{}

var _ registry.Service = (*service)(nil)

var (
	mandatoryOptions []ServiceOption
	ContextKey       = serviceKey{}
)

func init() {
	gob.Register(&service{})
	propagator.RegisterKeyInjector[Service](ContextKey)
	openurl.RegisterTemplateInjector(func(ctx context.Context, m map[string]interface{}) error {
		var svc Service
		if o := propagator.Get(ctx, ContextKey, &svc); o {
			m["Service"] = svc.Name()
		}
		return nil
	})
}

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
	Server() server.Server
	Is(status registry.Status) bool
	As(i interface{}) bool
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

	s.Opts.rootContext = runtime.WithServiceName(s.Opts.rootContext, name)

	var reg registry.Registry
	if propagator.Get(s.Opts.rootContext, registry.ContextKey, &reg) {
		if err := reg.Register(s); err != nil {
			s.Opts.Logger().Warn("could not register", zap.Error(err))
		}
	} else {
		s.Opts.Logger().Warn("no registry attached")
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
	//if len(s.Opts.Storages) > 0 {
	//	for _, so := range s.Opts.Storages {
	//		if len(so.SupportedDrivers) > 0 {
	//			clone[so.StorageKey] = so.ToMeta()
	//		}
	//	}
	//}
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
	ro := &registry.RegisterOptions{}
	for _, o := range oo {
		o(ro)
	}

	// Making sure we only start one at a time for a unique service
	if s.Options().Unique {
		reg := s.Opts.GetRegistry()
		if locker := reg.NewLocker("start-service-" + s.Name()); locker != nil {
			locker.Lock()
			w, err := reg.Watch(registry.WithID(s.ID()), registry.WithType(pb.ItemType_SERVER))
			if err != nil {
				s.Opts.Logger().Error("Error unlocking service"+s.Name(), zap.Error(err))
				locker.Unlock()
				er = err
				return err
			}
			go func() {
				defer w.Stop()
				defer locker.Unlock()

				for {
					res, err := w.Next()
					if err != nil {
						s.Opts.Logger().Error("Error unlocking service "+s.Name()+" (watch)", zap.Error(err))
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
			er = fmt.Errorf("panic while starting service %v", e)
		}
		if er != nil {
			s.Opts.Logger().Error("Error while starting service: "+er.Error(), zap.Error(er))
			er = errors.WithMessagef(errors.ServiceStartError, "starting %s, %w", s.Name(), er)
			s.updateRegister(registry.StatusError)
			if s.Opts.runtimeCancel != nil {
				s.Opts.runtimeCancel()
				s.Opts.runtimeCancel = nil
			}
		}
	}()

	s.updateRegister(registry.StatusStarting)

	s.Opts.runtimeCtx, s.Opts.runtimeCancel = context.WithCancel(ro.Context)
	s.Opts.runtimeCtx = propagator.With(s.Opts.runtimeCtx, ContextKey, s)
	s.Opts.runtimeCtx = runtime.WithServiceName(s.Opts.runtimeCtx, s.Opts.Name)

	for _, before := range s.Opts.BeforeStart {
		var err error
		if s.Opts.runtimeCtx, err = before(s.Opts.runtimeCtx); err != nil {
			er = err
			return err
		}
	}

	if s.Opts.serverStart != nil {
		if err := s.Opts.serverStart(s.Opts.runtimeCtx); err != nil {
			er = err
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

	if s.Opts.runtimeCancel != nil {
		s.Opts.runtimeCancel()
		s.Opts.runtimeCancel = nil
	}
	refCtx := s.Opts.runtimeCtx
	if refCtx == nil {
		refCtx = s.Opts.rootContext
	}

	for _, before := range s.Opts.BeforeStop {
		if err := before(refCtx); err != nil {
			return err
		}
	}

	if s.Opts.serverStop != nil {
		if err := s.Opts.serverStop(refCtx); err != nil {
			return err
		}
	}

	opts := &registry.RegisterOptions{}
	for _, o := range oo {
		o(opts)
	}

	if reg := s.Opts.GetRegistry(); reg != nil {
		// Deregister to make sure to break existing links
		if err := reg.Deregister(s, registry.WithRegisterFailFast()); err != nil {
			s.Opts.Logger().Error("Could not deregister", zap.Error(err))
		} else if !opts.DeregisterFull {
			// Re-register as Stopped
			s.updateRegister(registry.StatusStopped)
		}
	} else {
		s.Opts.Logger().Warn("no registry attached")
	}

	s.Opts.Logger().Info("stopped")

	return nil
}

// OnServe should be called after s.Server is started. It can be passed as an AfterServe() option
// to server.Start()
func (s *service) OnServe(oo ...registry.RegisterOption) error {
	w := &sync.WaitGroup{}
	w.Add(len(s.Opts.AfterServe))
	refCtx := s.Opts.runtimeCtx
	if refCtx == nil {
		refCtx = s.Opts.rootContext
	}

	/*go func() {
		if locker := s.Opts.GetRegistry().NewLocker("update-service-version-" + s.Opts.Name); locker != nil {
			locker.Lock()
			defer locker.Unlock()
		}

		defer w.Done()
		if er := runtime.MultiContextManager().Iterate(refCtx, func(ctx context.Context, _ string) error {
			if s.Opts.MigrateIterator.Lister != nil {
				var errs []error
				for _, key := range s.Opts.MigrateIterator.Lister(ctx) {
					ctx = propagator.With(ctx, s.Opts.MigrateIterator.ContextKey, key)
					errs = append(errs, UpdateServiceVersion(ctx, s.Opts))
				}
				if outE := multierr.Combine(errs...); outE != nil {
					log.Logger(ctx).Error("One specific upgrade was not performed successfully, but process is continued", zap.Error(outE))
				}
			} else {
				return UpdateServiceVersion(ctx, s.Opts)
			}
			return nil
		}); er != nil {
			log.Logger(refCtx).Error("Error while updating service version", zap.Error(er))
		}
	}()*/

	for _, after := range s.Opts.AfterServe {
		go func(f func(context.Context) error) {
			defer w.Done()
			if e := f(refCtx); e != nil {
				log.Logger(refCtx).Error("AfterServe failed", zap.Error(e))
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
			s.Opts.Logger().Info("ready")
		} else {
			s.Opts.Logger().Debug(string(status[0]))
		}
	}
	// up := s.status == registry.StatusReady
	down := s.status == registry.StatusStopping || s.status == registry.StatusStopped || s.status == registry.StatusError

	reg := s.Opts.GetRegistry()
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
			s.Opts.Logger().Debug("could not register", zap.Error(err))
		} else {
			s.Opts.Logger().Warn("could not register", zap.Error(err))
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

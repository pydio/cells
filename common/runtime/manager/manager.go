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

package manager

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/bep/debounce"
	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/utils/configx"
)

const (
	CommandStart   = "start"
	CommandStop    = "stop"
	CommandRestart = "restart"
)

type Manager interface {
	Init(ctx context.Context) error
	ServeAll(...server.ServeOption)
	StopAll()
	SetServeOptions(...server.ServeOption)
	WatchServicesConfigs()
	WatchBroker(ctx context.Context, br broker.Broker) error
}

type manager struct {
	ctx        context.Context
	ns         string
	srcUrl     string
	reg        registry.Registry
	root       registry.Item
	rootIsFork bool

	serveOptions []server.ServeOption

	servers  map[string]server.Server
	services map[string]service.Service

	logger log.ZapLogger
}

func NewManager(ctx context.Context, reg registry.Registry, srcUrl string, namespace string, logger log.ZapLogger) Manager {
	m := &manager{
		ctx:    ctx,
		ns:     namespace,
		srcUrl: srcUrl,
		// reg:      reg,
		servers:  make(map[string]server.Server),
		services: make(map[string]service.Service),
		logger:   logger,
	}

	reg = registry.NewTransientWrapper(reg, registry.WithType(pb.ItemType_SERVICE))
	reg = registry.NewMetaWrapper(reg, server.InitPeerMeta, registry.WithType(pb.ItemType_SERVER), registry.WithType(pb.ItemType_NODE))
	reg = registry.NewMetaWrapper(reg, func(meta map[string]string) {
		if _, ok := meta[runtime.NodeRootID]; !ok {
			meta[runtime.NodeRootID] = m.root.ID()
		}
	}, registry.WithType(pb.ItemType_SERVER), registry.WithType(pb.ItemType_SERVICE), registry.WithType(pb.ItemType_NODE))
	m.reg = reg

	// Detect a parent root
	var current, parent registry.Item
	if ii, er := reg.List(registry.WithType(pb.ItemType_NODE), registry.WithMeta(runtime.NodeMetaHostName, runtime.GetHostname())); er == nil && len(ii) > 0 {
		for _, root := range ii {
			rPID := root.Metadata()[runtime.NodeMetaPID]
			if rPID == strconv.Itoa(os.Getppid()) {
				parent = root
			} else if rPID == strconv.Itoa(os.Getpid()) {
				current = root
			}
		}
	}
	if current != nil {
		m.root = current
	} else {
		node := util.CreateNode()
		runtime.SetProcessRootID(node.ID())

		m.root = node

		if er := reg.Register(registry.Item(node)); er == nil {
			if parent != nil {
				m.rootIsFork = true
				_, _ = reg.RegisterEdge(parent.ID(), m.root.ID(), "Fork", map[string]string{})
			}
		}
	}

	go m.WatchTransientStatus()
	return m
}

func (m *manager) Init(ctx context.Context) error {

	srcReg, err := registry.OpenRegistry(ctx, m.srcUrl)
	if err != nil {
		return err
	}

	ctx = servercontext.WithRegistry(ctx, m.reg)
	ctx = servicecontext.WithRegistry(ctx, srcReg)
	runtime.Init(ctx, m.ns)

	services, err := srcReg.List(registry.WithType(pb.ItemType_SERVICE))
	if err != nil {
		return err
	}

	byScheme := map[string]server.Server{}

	for _, ss := range services {
		var s service.Service
		if !ss.As(&s) {
			continue
		}
		opts := s.Options()
		mustFork := opts.Fork && !runtime.IsFork()

		// Replace service context with target registry
		opts.SetRegistry(m.reg)

		if !runtime.IsRequired(s.Name(), opts.Tags...) && !opts.ForceRegister {
			continue
		}

		if mustFork && !opts.AutoStart {
			continue
		}

		scheme := s.ServerScheme()
		if sr, o := byScheme[scheme]; o {
			opts.Server = sr
		} else if srv, er := server.OpenServer(opts.RootContext(), scheme); er == nil {
			byScheme[scheme] = srv
			opts.Server = srv
		} else {
			return er
		}

		if mustFork {
			continue // Do not register here
		}

		if er := m.reg.Register(s, registry.WithEdgeTo(m.root.ID(), "N", map[string]string{})); er != nil {
			return er
		}

		m.services[s.ID()] = s
	}

	if m.root != nil {
		for _, sr := range byScheme {
			m.servers[sr.ID()] = sr // Keep a ref to the actual object
			_, _ = m.reg.RegisterEdge(m.root.ID(), sr.ID(), "N", map[string]string{})
		}
	}

	return nil

}

func (m *manager) SetServeOptions(oo ...server.ServeOption) {
	m.serveOptions = oo
}

func (m *manager) ServeAll(oo ...server.ServeOption) {
	registry.NewMetaWrapper(m.reg, func(meta map[string]string) {
		meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())
		meta[registry.MetaStatusKey] = string(registry.StatusTransient)
	}).Register(m.root)

	if locker := m.reg.NewLocker("start-node-" + m.ns); locker != nil {
		locker.Lock()

		w, err := m.reg.Watch(registry.WithID(m.root.ID()), registry.WithType(pb.ItemType_NODE), registry.WithFilter(func(item registry.Item) bool {
			status, ok := item.Metadata()[registry.MetaStatusKey]
			if ok && (status == string(registry.StatusReady) || status == string(registry.StatusError)) {
				return true
			}

			return false
		}))
		if err != nil {
			locker.Unlock()
			return
		}
		go func() {
			defer w.Stop()
			defer locker.Unlock()

			for {
				res, err := w.Next()
				if err != nil {
					return
				}

				if len(res.Items()) == 0 {
					continue
				}

				break
			}
		}()
	}

	m.serveOptions = oo
	opt := &server.ServeOptions{}
	for _, o := range oo {
		o(opt)
	}
	eg := &errgroup.Group{}
	ss := m.serversWithStatus(registry.StatusStopped)
	for _, srv := range ss {
		func(srv server.Server) {
			eg.Go(func() error {
				return m.startServer(srv, oo...)
			})
		}(srv)
	}

	waitAndServe := func() {
		if err := eg.Wait(); err != nil && opt.ErrorCallback != nil {
			opt.ErrorCallback(err)
		}
	}
	if opt.BlockUntilServe {
		waitAndServe()
		return
	} else {
		go waitAndServe()
	}
}

func (m *manager) StopAll() {
	eg := &errgroup.Group{}
	for _, srv := range m.serversWithStatus(registry.StatusReady) {
		func(sr server.Server) {
			eg.Go(func() error {
				if err := m.stopServer(sr, registry.WithDeregisterFull()); err != nil {
					return err
				}

				return nil
			})
		}(srv)
	}
	if er := eg.Wait(); er != nil {
		if !(strings.Contains(er.Error(), "error reading from server: EOF") && runtime.IsFork()) &&
			!strings.Contains(er.Error(), "context canceled") {
			m.logger.Error("error while stopping servers: "+er.Error(), zap.Error(er))
		}
	}
	_ = m.reg.Deregister(m.root, registry.WithRegisterFailFast())
}

func (m *manager) startServer(srv server.Server, oo ...server.ServeOption) error {
	opts := append(oo)

	var uniques []service.Service
	detectedCount := 1
	for _, svc := range m.services {
		if svc.Options().Server == srv {
			if svc.Options().Unique {
				uniques = append(uniques, svc)
				if running, count := m.regRunningService(svc.Name()); running {
					detectedCount = count
					// There is already a running service here. Do not start now, watch registry and postpone start
					m.logger.Warn("There is already a running instance of " + svc.Name() + ". Do not start now, watch registry and postpone start")
					registry.NewMetaWrapper(m.reg, func(meta map[string]string) {
						meta[registry.MetaStatusKey] = string(registry.StatusWaiting)
					}).Register(svc)

					continue
				}
			}
			opts = append(opts, m.serviceServeOptions(svc)...)
		}
	}
	if len(uniques) > 0 {
		go m.WatchServerUniques(srv, uniques, detectedCount)
	}

	registry.NewMetaWrapper(m.reg, func(meta map[string]string) {
		meta[registry.MetaStatusKey] = string(registry.StatusTransient)
	}).Register(srv)

	return srv.Serve(opts...)
}

func (m *manager) stopServer(srv server.Server, oo ...registry.RegisterOption) error {
	// Stop all running services on this server
	eg := &errgroup.Group{}
	for _, svc := range m.servicesRunningOn(srv) {
		func(sv service.Service) {
			eg.Go(func() error {
				return m.stopService(sv, oo...)
			})
		}(svc)
	}
	if er := eg.Wait(); er != nil {
		return er
	}

	// Stop server now
	return srv.Stop(oo...)
}

func (m *manager) startService(svc service.Service) error {
	// Look up for corresponding server
	srv := svc.Options().Server
	serveOptions := append(m.serveOptions, m.serviceServeOptions(svc)...)

	if srv.Is(registry.StatusStopped) {

		m.logger.Info("Server is not running, starting " + srv.ID() + " now")
		return srv.Serve(serveOptions...)

	} else if srv.NeedsRestart() {

		m.logger.Info("Server needs a restart to append a new service")
		for _, sv := range m.servicesRunningOn(srv) {
			serveOptions = append(serveOptions, m.serviceServeOptions(sv)...)
		}
		if er := m.stopServer(srv); er != nil {
			return er
		}
		return srv.Serve(serveOptions...)

	} else {

		m.logger.Info("Starting service")
		if er := svc.Start(); er != nil {
			return er
		}
		if er := svc.OnServe(); er != nil {
			return er
		}

	}

	return nil
}

func (m *manager) stopService(svc service.Service, oo ...registry.RegisterOption) error {
	return svc.Stop(oo...)
}

func (m *manager) serviceServeOptions(svc service.Service) []server.ServeOption {
	return []server.ServeOption{
		server.WithBeforeServe(svc.Start),
		server.WithAfterServe(svc.OnServe),
	}
}

func (m *manager) serversWithStatus(status registry.Status) (ss []server.Server) {
	for _, srv := range m.servers {
		if srv.Is(status) {
			ss = append(ss, srv)
		}
	}
	return
}

func (m *manager) servicesRunningOn(server server.Server) (ss []service.Service) {
	for _, svc := range m.services {
		if svc.Server() == server && svc.Is(registry.StatusReady) {
			ss = append(ss, svc)
		}
	}
	return
}

func (m *manager) WatchServicesConfigs() {
	res, err := config.Watch(configx.WithPath("services"), configx.WithChangesOnly())
	if err != nil {
		return
	}
	for {
		v, _ := res.Next()
		mm := v.(configx.Values).Val("update", "services").Map()

		for k, _ := range mm {
			ss, err := m.reg.List(registry.WithName(k), registry.WithType(pb.ItemType_SERVICE))
			if err != nil || len(ss) == 0 {
				continue
			}
			var svc service.Service
			if ss[0].As(&svc) && svc.Options().AutoRestart {
				if er := m.stopService(svc); er == nil {
					if sErr := m.startService(svc); sErr != nil {
						log.Logger(m.ctx).Error("Cannot start service"+svc.Name(), zap.Error(sErr))
					}
				} else {
					log.Logger(m.ctx).Error("Cannot stop service"+svc.Name(), zap.Error(er))
				}
			}
		}
	}
}

func (m *manager) WatchBroker(ctx context.Context, br broker.Broker) error {
	_, er := br.Subscribe(ctx, common.TopicRegistryCommand, func(message broker.Message) error {
		hh, _ := message.RawData()
		cmd := hh["command"]
		itemName := hh["itemName"]
		s, err := m.reg.Get(itemName, registry.WithType(pb.ItemType_SERVER), registry.WithType(pb.ItemType_SERVICE))
		if err != nil {
			if err == os.ErrNotExist || strings.Contains(err.Error(), "file does not exist") {
				return nil
			}
			return err
		}

		var svc service.Service
		var srv server.Server
		var rsrc registry.Service
		var rsrv registry.Server
		if s.As(&svc) || s.As(&srv) {
			// In-memory object found
		} else if s.As(&rsrc) {
			if mem, ok := m.services[s.ID()]; ok {
				svc = mem
			}
		} else if s.As(&rsrv) {
			if mem, ok := m.servers[s.ID()]; ok {
				srv = mem
			}
		}
		if svc == nil && srv == nil {
			return nil
		}
		if svc != nil {
			// Service Commands
			switch cmd {
			case CommandStart:
				return m.startService(svc)
			case CommandStop:
				return m.stopService(svc)
			case CommandRestart:
				if er := m.stopService(svc); er != nil {
					return er
				}
				return m.startService(svc)
			default:
				return fmt.Errorf("unsupported command %s", cmd)
			}
		} else if srv != nil {
			// Server Commands
			switch cmd {
			case CommandStart:
				return m.startServer(srv, m.serveOptions...)
			case CommandStop:
				return m.stopServer(srv)
			case CommandRestart:
				if er := m.stopServer(srv); er != nil {
					return er
				}
				return m.startServer(srv, m.serveOptions...)
			default:
				return fmt.Errorf("unsupported command %s", cmd)
			}
		}
		return nil
	})
	if er != nil {
		m.logger.Error("Manager cannot watch broker: " + er.Error())
	}
	return er
}

func (m *manager) regRunningService(name string) (bool, int) {
	ll, _ := m.reg.List(registry.WithType(pb.ItemType_SERVICE), registry.WithName(name))
	for _, l := range ll {
		if l.Metadata()[registry.MetaStatusKey] != string(registry.StatusStopped) && l.Metadata()[registry.MetaStatusKey] != string(registry.StatusWaiting) {
			return true, len(ll)
		}
	}
	return false, 0
}

func (m *manager) WatchTransientStatus() {
	options := []registry.Option{
		registry.WithType(pb.ItemType_NODE),
		registry.WithType(pb.ItemType_SERVER),
		registry.WithAction(pb.ActionType_CREATE),
		registry.WithAction(pb.ActionType_UPDATE),
		registry.WithContext(m.ctx),
		registry.WithFilter(func(item registry.Item) bool {
			var node registry.Node
			if item.As(&node) {
				if item.ID() != m.root.ID() {
					return false
				}
			}

			var server registry.Server
			if item.As(&server) {
				meta := item.Metadata()
				if rootID, ok := meta[runtime.NodeRootID]; !ok || rootID != m.root.ID() {
					return false
				}
			}

			if status, ok := item.Metadata()[registry.MetaStatusKey]; !ok || status != string(registry.StatusTransient) {
				return false
			}

			return true
		}),
	}

	w, _ := m.reg.Watch(options...)
	defer w.Stop()

	for {
		res, er := w.Next()
		if er != nil {
			break
		}

		for _, i := range res.Items() {
			statusToSet := string(registry.StatusReady)
			items := m.reg.ListAdjacentItems(i, registry.WithType(pb.ItemType_SERVICE))
			for _, item := range items {
				itemStatus := item.Metadata()[registry.MetaStatusKey]
				if itemStatus != string(registry.StatusReady) && itemStatus != string(registry.StatusWaiting) && itemStatus != string(registry.StatusError) {
					statusToSet = string(registry.StatusTransient)
					break
				}
				if itemStatus == string(registry.StatusError) && statusToSet == string(registry.StatusReady) {
					statusToSet = string(registry.StatusError)
				}
			}

			if ms, ok := i.(registry.MetaSetter); ok {
				meta := i.Metadata()
				meta[registry.MetaTimestampKey] = fmt.Sprintf("%d", time.Now().UnixNano())
				meta[registry.MetaStatusKey] = statusToSet
				ms.SetMetadata(meta)

				go m.reg.Register(ms.(registry.Item))
			}
		}
	}
}

func (m *manager) WatchServerUniques(srv server.Server, ss []service.Service, count int) {
	db := debounce.New(time.Duration(count*3) * time.Second)
	options := []registry.Option{
		registry.WithType(pb.ItemType_SERVICE),
		registry.WithAction(pb.ActionType_DELETE),
		registry.WithAction(pb.ActionType_UPDATE),
		registry.WithContext(m.ctx),
	}
	// Watch specific names
	for _, s := range ss {
		options = append(options, registry.WithName(s.Name()))
	}
	// Exclude local IDs
	options = append(options, registry.WithFilter(func(item registry.Item) bool {
		for _, s := range ss {
			if s.ID() == item.ID() {
				m.logger.Debug("FILTERING event on " + item.Name() + " as it is locally managed")
				return false
			}
		}
		return true
	}))
	w, _ := m.reg.Watch(options...)
	defer w.Stop()

	for {
		res, er := w.Next()
		if er != nil {
			break
		}
		if res.Action() == pb.ActionType_UPDATE {
			var hasStopped bool
			for _, i := range res.Items() {
				if s, ok := i.Metadata()[registry.MetaStatusKey]; ok && s == string(registry.StatusStopped) {
					hasStopped = true
				}
			}
			if !hasStopped {
				continue
			}
		}
		var iNames []string
		for _, i := range res.Items() {
			iNames = append(iNames, i.Name())
		}
		m.logger.Info("Delete event received for " + strings.Join(iNames, "|") + ", debounce server Restart" + strconv.Itoa(count))
		db(func() {
			if srv.NeedsRestart() {
				w.Stop()
				m.logger.Info(" -- Restarting server now", zap.Int8("type", int8(srv.Type())), zap.String("name", srv.Name()))
				if er := m.stopServer(srv); er != nil {
					m.logger.Error("Error while stopping server"+er.Error(), zap.Error(er))
				}
				if er := m.startServer(srv, m.serveOptions...); er != nil {
					m.logger.Error("Error while starting server "+er.Error(), zap.Error(er))
				}
			} else {
				for _, s := range ss {
					for _, i := range res.Items() {
						if s.Name() == i.Name() {
							m.logger.Info(" -- Restarting service now", zap.String("name", s.Name()))
							s.Stop()

							s.Start()
						}
					}
				}
			}
		})
	}
}

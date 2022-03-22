/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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
	"fmt"
	"sync"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/server/generic"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/fork"
	"github.com/pydio/cells/v4/common/utils/net"
)

// WithChildrenRunner option to define a micro server that runs children services
func WithChildrenRunner(parentName string, childrenPrefix string, cleanEndpointBeforeDelete bool, afterDeleteListener func(context.Context, string), secondaryPrefix ...string) ServiceOption {
	return WithGeneric(func(ctx context.Context, srv *generic.Server) error {
		runner := NewChildrenRunner(parentName, childrenPrefix, secondaryPrefix...)
		runner.StartFromInitialConf(ctx, config.Get("services", parentName))
		runner.beforeDeleteClean = cleanEndpointBeforeDelete
		if afterDeleteListener != nil {
			runner.OnDeleteConfig(afterDeleteListener)
		}
		return runner.Watch(ctx)
	})
}

// NewChildrenRunner creates a ChildrenRunner
func NewChildrenRunner(parentName string, childPrefix string, secondaryPrefix ...string) *ChildrenRunner {
	c := &ChildrenRunner{
		parentName:  parentName,
		childPrefix: childPrefix,
	}
	if len(secondaryPrefix) > 0 {
		c.secondaryPrefix = secondaryPrefix[0]
	}
	c.mutex = &sync.RWMutex{}
	c.services = make(map[string]*fork.Process)
	return c
}

// ChildrenRunner For Regexp based service
type ChildrenRunner struct {
	mutex             *sync.RWMutex
	services          map[string]*fork.Process
	parentName        string
	childPrefix       string
	secondaryPrefix   string
	beforeDeleteClean bool
	afterDeleteChan   chan string
	initialCtx        context.Context
}

// OnDeleteConfig defines what's happening when the config related to the service is deleted
func (c *ChildrenRunner) OnDeleteConfig(callback func(context.Context, string)) {
	c.afterDeleteChan = make(chan string)
	go func() {
		for deleted := range c.afterDeleteChan {
			callback(c.initialCtx, deleted)
		}
	}()
}

// StartFromInitialConf list the sources keys and start them
func (c *ChildrenRunner) StartFromInitialConf(ctx context.Context, cfg configx.Values) {
	sources := config.SourceNamesFromDataConfigs(cfg)
	c.initialCtx = ctx
	log.Logger(ctx).Info("Starting umbrella service "+c.childPrefix+" with sources", log.DangerouslyZapSmallSlice("sources", sources))
	for _, s := range sources {
		if !c.FilterOutSource(ctx, s) {
			go c.Start(ctx, s)
		}
	}
}

// Start starts a forked process for a new source
func (c *ChildrenRunner) Start(ctx context.Context, source string, retries ...int) error {

	name := c.childPrefix + source
	var opts []fork.Option
	if config.Get("services", name, "debugFork").Bool() {
		opts = append(opts, fork.WithDebug())
	}
	if len(config.DefaultBindOverrideToFlags()) > 0 {
		opts = append(opts, fork.WithCustomFlags(config.DefaultBindOverrideToFlags()...))
	}
	opts = append(opts, fork.WithRetries(3))
	opts = append(opts, fork.WithWatch(func(event string, process *fork.Process) {
		c.mutex.Lock()
		if event == "start" {
			c.services[source] = process
		} else if event == "stop" {
			delete(c.services, source)
		}
		c.mutex.Unlock()
	}))
	names := []string{name}
	if c.secondaryPrefix != "" {
		names = append(names, c.secondaryPrefix+source)
	}
	process := fork.NewProcess(ctx, names, opts...)
	process.StartAndWait()
	return nil
}

// StopAll services
func (c *ChildrenRunner) StopAll(ctx context.Context) {
	for name, cmd := range c.services {
		log.Logger(ctx).Debug("stopping sub-process " + c.childPrefix + name)
		cmd.Stop()
	}
}

func (c *ChildrenRunner) updateSourcesList(ctx context.Context, sources []string) {

	//log.Logger(ctx).Info("Got an event on sources keys for " + c.parentName + ". Let's start/stop services accordingly")
	log.Logger(ctx).Info("Got an event on sources keys for "+c.parentName, zap.Any("new sources", sources), zap.Any("currently running", c.services))

	all := config.Get("services")
	var servicesConf map[string]interface{}
	all.Scan(&servicesConf)

	// First stopping what's been removed
	for name, cmd := range c.services {
		found := false
		for _, source := range sources {
			if source == name && !c.FilterOutSource(ctx, source) {
				found = true
				break
			}
		}

		if found {
			continue
		}

		// Verify if it was fully deleted (not just filtered out)
		_, exists := servicesConf[c.childPrefix+name]
		if !exists && c.beforeDeleteClean {
			caller := object.NewResourceCleanerEndpointClient(grpc.GetClientConnFromCtx(ctx, c.childPrefix+name))
			if resp, err := caller.CleanResourcesBeforeDelete(ctx, &object.CleanResourcesRequest{}); err == nil {
				log.Logger(ctx).Info("Successfully cleaned resources before stopping "+c.childPrefix+name, zap.String("msg", resp.Message))
			} else {
				log.Logger(ctx).Error("Could not clean resources before stopping service", zap.Error(err))
			}
			if c.secondaryPrefix != "" {
				caller = object.NewResourceCleanerEndpointClient(grpc.GetClientConnFromCtx(ctx, c.secondaryPrefix+name))
				if resp, err := caller.CleanResourcesBeforeDelete(ctx, &object.CleanResourcesRequest{}); err == nil {
					log.Logger(ctx).Info("Successfully cleaned resources before stopping "+c.secondaryPrefix+name, zap.String("msg", resp.Message))
				} else {
					log.Logger(ctx).Error("Could not clean resources before stopping service", zap.Error(err))
				}
			}
		}

		log.Logger(ctx).Info("Stopping sub-service " + c.childPrefix + name)
		cmd.Stop()

		if !exists && c.afterDeleteChan != nil {
			c.afterDeleteChan <- name
		}
	}

	// Then start what's been added
	for _, source := range sources {
		c.mutex.RLock()
		_, ok := c.services[source]
		c.mutex.RUnlock()
		if !ok && !c.FilterOutSource(ctx, source) {
			log.Logger(ctx).Info("Starting sub-service " + c.childPrefix + source)
			go c.Start(ctx, source)
		}
	}

}

// Watch watches the configuration changes for new sources
func (c *ChildrenRunner) Watch(ctx context.Context) error {
	watcher, err := config.Watch("services", c.parentName, "sources")
	if err != nil {
		return err
	}

	ss := make(chan []string)
	go func() {
		timer := time.NewTimer(1500 * time.Millisecond)
		var sources []string
		for {
			select {
			case <-timer.C:
				if len(sources) > 0 {
					c.updateSourcesList(ctx, sources)
					sources = []string{}
				}
			case s := <-ss:
				sources = s
				timer.Stop()
				timer = time.NewTimer(1500 * time.Millisecond)
			case <-ctx.Done():
				watcher.Stop()
				return
			}
		}
	}()
	go func() {
		for {
			res, err := watcher.Next()
			if err != nil {
				break
			}
			arr := res.StringArray()
			ss <- config.SourceNamesFiltered(arr)
		}
	}()

	return nil
}

// Watch watches the configuration changes for new sources
func (c *ChildrenRunner) WatchOld(ctx context.Context) error {

	// TODO - should be linked to context to stop
	go func() {
		for {
			watcher, err := config.Watch("services", c.parentName, "sources")
			if err != nil {
				time.Sleep(1 * time.Second)
				continue
			}

			for {
				res, err := watcher.Next()
				if err != nil {
					break
				}

				arr := res.StringArray()

				sources := config.SourceNamesFiltered(arr)
				//log.Logger(ctx).Info("Got an event on sources keys for " + c.parentName + ". Let's start/stop services accordingly")
				log.Logger(ctx).Info("Got an event on sources keys for "+c.parentName+". Details", zap.Any("currently running", c.services), zap.Int("new sources length", len(sources)))

				all := config.Get("services")
				var servicesConf map[string]interface{}
				all.Scan(&servicesConf)

				// First stopping what's been removed
				for name, cmd := range c.services {
					found := false
					for _, source := range sources {
						if source == name && !c.FilterOutSource(ctx, source) {
							found = true
							break
						}
					}

					if found {
						continue
					}

					// Verify if it was fully deleted (not just filtered out)
					_, exists := servicesConf[c.childPrefix+name]
					if !exists && c.beforeDeleteClean {
						caller := object.NewResourceCleanerEndpointClient(grpc.GetClientConnFromCtx(ctx, c.childPrefix+name))
						if resp, err := caller.CleanResourcesBeforeDelete(ctx, &object.CleanResourcesRequest{}); err == nil {
							log.Logger(ctx).Info("Successfully cleaned resources before stopping "+c.childPrefix+name, zap.String("msg", resp.Message))
						} else {
							log.Logger(ctx).Error("Could not clean resources before stopping service", zap.Error(err))
						}
						if c.secondaryPrefix != "" {
							caller = object.NewResourceCleanerEndpointClient(grpc.GetClientConnFromCtx(ctx, c.secondaryPrefix+name))
							if resp, err := caller.CleanResourcesBeforeDelete(ctx, &object.CleanResourcesRequest{}); err == nil {
								log.Logger(ctx).Info("Successfully cleaned resources before stopping "+c.secondaryPrefix+name, zap.String("msg", resp.Message))
							} else {
								log.Logger(ctx).Error("Could not clean resources before stopping service", zap.Error(err))
							}
						}
					}

					log.Logger(ctx).Info("Stopping sub-service " + c.childPrefix + name)
					cmd.Stop()

					if !exists && c.afterDeleteChan != nil {
						c.afterDeleteChan <- name
					}
				}

				// Then start what's been added
				for _, source := range sources {
					c.mutex.RLock()
					_, ok := c.services[source]
					c.mutex.RUnlock()
					if !ok && !c.FilterOutSource(ctx, source) {
						log.Logger(ctx).Info("Starting sub-service " + c.childPrefix + source)
						go c.Start(ctx, source)
					}
				}
			}

			watcher.Stop()
			time.Sleep(1 * time.Second)
		}
	}()

	return nil
}

// FilterOutSource checks in the actual source config if there are some
// keys that would prevent running on this node
func (c *ChildrenRunner) FilterOutSource(ctx context.Context, sourceName string) bool {
	cfg := config.Get("services", c.childPrefix+sourceName)
	if cfg == nil {
		return false
	}
	var basic map[string]interface{}
	if e := cfg.Scan(&basic); e == nil {
		if val, ok := basic["Disabled"]; ok {
			if b, is := val.(bool); is && b {
				log.Logger(ctx).Info("Ignoring " + c.childPrefix + sourceName + " as it is disabled")
				return true
			} else if b, is := val.(string); is && b == "true" {
				log.Logger(ctx).Info("Ignoring " + c.childPrefix + sourceName + " as it is disabled")
				return true
			}
		}
		if val, ok := basic["PeerAddress"]; ok && val.(string) != "" && !net.PeerAddressIsLocal(val.(string)) {
			log.Logger(ctx).Info(fmt.Sprintf("Ignoring %s as PeerAddress (%s) does not correspond to any current peer ip", c.childPrefix+sourceName, val))
			return true
		}
	}

	return false
}

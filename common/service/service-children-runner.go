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
	"bufio"
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/micro/go-micro"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/object"
	servicecontext "github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/utils/net"
	"github.com/pydio/cells/x/configx"
)

// WithMicroChildrenRunner option to define a micro server that runs children services
func WithMicroChildrenRunner(parentName string, childrenPrefix string, cleanEndpointBeforeDelete bool, afterDeleteListener func(context.Context, string)) ServiceOption {
	// TODO - should be a generic server
	return WithMicro(func(m micro.Service) error {
		runner := NewChildrenRunner(parentName, childrenPrefix)
		var cancel context.CancelFunc

		m.Init(
			micro.AfterStart(func() error {
				ctx := m.Options().Context
				ctx, cancel = context.WithCancel(ctx)

				conf := servicecontext.GetConfig(ctx)
				runner.StartFromInitialConf(ctx, conf)
				runner.beforeDeleteClean = cleanEndpointBeforeDelete
				if afterDeleteListener != nil {
					runner.OnDeleteConfig(afterDeleteListener)
				}
				return nil
			}),
			micro.BeforeStop(func() error {
				cancel()

				return nil
			}),
		)
		return runner.Watch(m.Options().Context)
	})
}

// NewChildrenRunner creates a ChildrenRunner
func NewChildrenRunner(parentName string, childPrefix string) *ChildrenRunner {
	c := &ChildrenRunner{
		parentName:  parentName,
		childPrefix: childPrefix,
	}
	c.mutex = &sync.RWMutex{}
	c.services = make(map[string]*exec.Cmd)
	return c
}

// ChildrenRunner For Regexp based service
type ChildrenRunner struct {
	mutex             *sync.RWMutex
	services          map[string]*exec.Cmd
	parentService     micro.Service
	parentName        string
	childPrefix       string
	beforeDeleteClean bool
	afterDeleteChan   chan string
	initialCtx        context.Context
}

// OnDeleteConfig defines what's happening when the config related to the service is deleted
func (c *ChildrenRunner) OnDeleteConfig(callback func(context.Context, string)) {
	c.afterDeleteChan = make(chan string)
	go func() {
		for {
			select {
			case deleted := <-c.afterDeleteChan:
				callback(c.initialCtx, deleted)
			}
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
	cmd := exec.Command(os.Args[0], buildForkStartParams(name)...)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return err
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return err
	}
	serviceCtx := servicecontext.WithServiceName(ctx, name)
	scannerOut := bufio.NewScanner(stdout)
	parentName := c.childPrefix + "(.+)"
	go func() {
		for scannerOut.Scan() {
			text := strings.TrimRight(scannerOut.Text(), "\n")
			if strings.Contains(text, name) || strings.Contains(text, parentName) {
				log.StdOut.WriteString(text + "\n")
			} else {
				log.Logger(serviceCtx).Info(text)
			}
		}
	}()
	scannerErr := bufio.NewScanner(stderr)
	go func() {
		for scannerErr.Scan() {
			text := strings.TrimRight(scannerErr.Text(), "\n")
			if strings.Contains(text, name) || strings.Contains(text, parentName) {
				log.StdOut.WriteString(text + "\n")
			} else {
				log.Logger(serviceCtx).Error(text)
			}
		}
	}()

	select {
	case <-ctx.Done():
		return nil
	default:
		c.mutex.Lock()
		c.services[source] = cmd
		c.mutex.Unlock()

		log.Logger(ctx).Debug("Starting SubProcess: " + name)
		if err := cmd.Start(); err != nil {
			return err
		}

		if err := cmd.Wait(); err != nil {
			if err.Error() != "signal: terminated" && err.Error() != "signal: interrupt" {
				log.Logger(serviceCtx).Error("SubProcess was not killed properly: " + err.Error())
				c.mutex.Lock()
				delete(c.services, source)
				c.mutex.Unlock()
				r := 0
				if len(retries) > 0 {
					r = retries[0]
				}
				if r < 3 {
					log.Logger(serviceCtx).Error("Restarting service in 3s...")
					<-time.After(3 * time.Second)
					return c.Start(ctx, source, r+1)
				}
			}
			return err
		}

		c.mutex.Lock()
		delete(c.services, source)
		c.mutex.Unlock()
	}

	return nil
}

// StopAll services
func (c *ChildrenRunner) StopAll(ctx context.Context) {
	for name, cmd := range c.services {
		log.Logger(ctx).Debug("stopping sub-process " + c.childPrefix + name)
		if cmd.Process != nil {
			if e := cmd.Process.Signal(syscall.SIGINT); e != nil {
				cmd.Process.Kill()
			}
		}
	}
}

// Watch watches the configuration changes for new sources
func (c *ChildrenRunner) Watch(ctx context.Context) error {

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
				log.Logger(ctx).Info("Got an event on sources keys for " + c.parentName + ". Let's start/stop services accordingly")
				log.Logger(ctx).Debug("Got an event on sources keys for "+c.parentName+". Details", zap.Any("currently running", c.services), zap.Int("new sources length", len(sources)))

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
					all := config.Get("services")
					var conf map[string]interface{}
					all.Scan(&conf)
					_, exists := conf[c.childPrefix+name]
					if !exists && c.beforeDeleteClean {
						caller := object.NewResourceCleanerEndpointClient(c.childPrefix+name, defaults.NewClient())
						if resp, err := caller.CleanResourcesBeforeDelete(ctx, &object.CleanResourcesRequest{}); err == nil {
							log.Logger(ctx).Info("Successfully cleaned resources before stopping service", zap.String("msg", resp.Message))
						} else {
							log.Logger(ctx).Error("Could not clean resources before stopping service", zap.Error(err))
						}
					}

					if cmd.Process != nil {
						if e := cmd.Process.Signal(syscall.SIGINT); e != nil {
							cmd.Process.Kill()
						}
					}
					c.mutex.Lock()
					delete(c.services, name)
					c.mutex.Unlock()

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

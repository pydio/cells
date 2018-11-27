/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
	"encoding/json"
	"os"
	"os/exec"
	"strings"
	"sync"
	"syscall"

	"github.com/micro/go-micro"
	"github.com/spf13/viper"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/utils"
)

func WithMicroChildrenRunner(parentName string, childrenPrefix string, cleanEndpointBeforeDelete bool, afterDeleteListener func(context.Context, string)) ServiceOption {

	return WithMicro(func(m micro.Service) error {
		runner := NewChildrenRunner(m, parentName, childrenPrefix)
		m.Init(
			micro.AfterStart(func() error {
				ctx := m.Options().Context
				conf := servicecontext.GetConfig(ctx)
				runner.StartFromInitialConf(ctx, conf)
				runner.beforeDeleteClean = cleanEndpointBeforeDelete
				if afterDeleteListener != nil {
					runner.OnDeleteConfig(afterDeleteListener)
				}
				return nil
			}),
			micro.BeforeStop(func() error {
				runner.StopAll(m.Options().Context)
				return nil
			}),
		)
		return runner.Watch(m.Options().Context)
	})
}

// NewChildrenRunner creates a ChildrenRunner
func NewChildrenRunner(parentService micro.Service, parentName string, childPrefix string) *ChildrenRunner {
	c := &ChildrenRunner{
		parentService: parentService,
		parentName:    parentName,
		childPrefix:   childPrefix,
	}
	c.mutex = &sync.Mutex{}
	c.services = make(map[string]*exec.Cmd)
	return c
}

// For Regexp based service
type ChildrenRunner struct {
	mutex             *sync.Mutex
	services          map[string]*exec.Cmd
	parentService     micro.Service
	parentName        string
	childPrefix       string
	beforeDeleteClean bool
	afterDeleteChan   chan string
	initialCtx        context.Context
}

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
func (c *ChildrenRunner) StartFromInitialConf(ctx context.Context, cfg common.ConfigValues) {
	sources := cfg.StringArray("sources")
	c.initialCtx = ctx
	log.Logger(ctx).Debug("Starting umbrella service "+c.childPrefix+" with sources", zap.Any("sources", sources))
	for _, s := range sources {
		if !c.FilterOutSource(s) {
			go c.Start(ctx, s)
		}
	}
}

// Start starts a forked process for a new source
func (c *ChildrenRunner) Start(ctx context.Context, source string) error {

	name := c.childPrefix + source

	cmd := exec.CommandContext(ctx, os.Args[0], "start",
		"--fork",
		"--registry", viper.GetString("registry"),
		"--registry_address", viper.GetString("registry_address"),
		"--registry_cluster_address", viper.GetString("registry_cluster_address"),
		"--registry_cluster_routes", viper.GetString("registry_cluster_routes"),
		name,
	)

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

	c.mutex.Lock()
	c.services[source] = cmd
	c.mutex.Unlock()

	log.Logger(ctx).Debug("Starting SubProcess: " + name)
	if err := cmd.Start(); err != nil {
		return err
	}

	if err := cmd.Wait(); err != nil {
		if err.Error() != "signal: killed" {
			log.Logger(serviceCtx).Error("SubProcess was not killed properly: " + err.Error())
			registry.Default.SetServiceStopped(name)
		}
		return err
	}

	c.mutex.Lock()
	delete(c.services, source)
	c.mutex.Unlock()

	return nil
}

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

	watcher, err := config.Default().Watch("services", c.parentName, "sources")
	if err != nil {
		return err
	}

	go func() {
		defer watcher.Stop()
		for {
			res, err := watcher.Next()
			if err != nil {
				return
			}
			log.Logger(ctx).Info("Got an event on sources keys for " + c.parentName + ". Let's start/stop services accordingly")
			var sources string
			if err := res.Scan(&sources); err != nil {
				log.Logger(ctx).Error("Cannot read sources", zap.Error(err))
				continue
			}

			var arr []string
			if err := json.Unmarshal([]byte(sources), &arr); err != nil {
				log.Logger(ctx).Error("Invalid sources", zap.Error(err))
				continue
			}

			// First stopping what's been removed
			for name, cmd := range c.services {
				found := false
				for _, source := range arr {
					if source == name && !c.FilterOutSource(source) {
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

				if e := cmd.Process.Signal(syscall.SIGINT); e != nil {
					cmd.Process.Kill()
				}
				c.mutex.Lock()
				delete(c.services, name)
				c.mutex.Unlock()

				if !exists && c.afterDeleteChan != nil {
					c.afterDeleteChan <- name
				}
			}

			// Then start what's been added
			for _, source := range arr {
				if _, ok := c.services[source]; !ok && !c.FilterOutSource(source) {
					go c.Start(ctx, source)
				}
			}
		}
	}()

	return nil
}

// FilterOutSource checks in the actual source config if there are some
// keys that would prevent running on this node
func (c *ChildrenRunner) FilterOutSource(sourceName string) bool {
	cfg := config.Get("services", c.childPrefix+sourceName)
	if cfg == nil {
		return false
	}
	var basic map[string]interface{}
	if e := cfg.Scan(&basic); e == nil {
		if val, ok := basic["Disabled"]; ok {
			if b, is := val.(bool); is && b {
				return true
			} else if b, is := val.(string); is && b == "true" {
				return true
			}
		}
		if val, ok := basic["PeerAddress"]; ok {
			limitToAddress := val.(string)
			// TODO : How to make sure they are corresponding?
			// Can we get the "Node" on which the current service is running?
			ip, e := utils.GetExternalIP()
			if e != nil && ip.String() != limitToAddress {
				return true
			}
		}
	}

	return false
}

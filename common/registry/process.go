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

// Package registry provides the main glue between services
//
// It wraps micro registry (running services declared to the discovery server) into a more generic registry where all
// actual plugins are self-declared.
package registry

import (
	"fmt"
	"os"
	"strconv"
	"sync"

	"github.com/micro/go-micro/registry"
)

var (
	ProcessStartTags []string
)

type Process struct {
	Id          string
	ParentId    string
	MetricsPort int
	PeerId      string
	PeerAddress string
	StartTag    string

	sLock    *sync.RWMutex
	Services map[string]string
}

func NewProcess(node *registry.Node) *Process {
	pid, ok := node.Metadata[serviceMetaPID]
	if !ok {
		return nil
	}

	process := &Process{
		Id:       pid,
		Services: make(map[string]string),
		sLock:    &sync.RWMutex{},
	}
	process.PeerId = node.Id
	process.PeerAddress = node.Address
	if parent, ok := node.Metadata[serviceMetaParentPID]; ok {
		process.ParentId = parent
	}
	if port, ok := node.Metadata[serviceMetaMetrics]; ok {
		if met, e := strconv.ParseInt(port, 10, 32); e == nil {
			process.MetricsPort = int(met)
		}
	}
	if start, ok := node.Metadata[serviceMetaStartTag]; ok {
		process.StartTag = start
	}

	return process
}

// GetProcesses implements registry GetProcesses method, by creating a copy of the
// internal processes list
func (c *pydioregistry) GetProcesses() map[string]*Process {
	c.processeslock.RLock()
	defer c.processeslock.RUnlock()
	pp := make(map[string]*Process, len(c.processes))
	for k, v := range c.processes {
		pp[k] = v
	}
	return pp
}

func (c *pydioregistry) GetProcess(node *registry.Node) *Process {
	pid, ok := node.Metadata[serviceMetaPID]
	if !ok {
		return nil
	}

	c.processeslock.Lock()
	defer c.processeslock.Unlock()
	if proc, ok := c.processes[pid]; ok {
		return proc
	}

	proc := NewProcess(node)

	c.processes[pid] = proc

	return proc
}

func (c *pydioregistry) GetCurrentProcess() *Process {
	c.processeslock.RLock()
	defer c.processeslock.RUnlock()

	pid := fmt.Sprintf("%d", os.Getpid())
	process, ok := c.processes[pid]
	if !ok {
		return nil
	}

	return process
}

func (c *pydioregistry) GetCurrentChildrenProcesses() []*Process {
	c.processeslock.RLock()
	defer c.processeslock.RUnlock()

	pid := fmt.Sprintf("%d", os.Getpid())
	var processes []*Process

	for _, v := range c.processes {
		if v.ParentId == pid {
			processes = append(processes, v)
		}
	}

	return processes
}

func (p *Process) Add(serviceName string) {
	p.sLock.Lock()
	defer p.sLock.Unlock()
	p.Services[serviceName] = serviceName
}

func (p *Process) Delete(serviceName string) {
	p.sLock.Lock()
	defer p.sLock.Unlock()
	delete(p.Services, serviceName)
}

func GetProcesses() map[string]*Process {
	return Default.GetProcesses()
}

func GetProcess(node *registry.Node) *Process {
	return Default.GetProcess(node)
}

func GetCurrentProcess() *Process {
	return Default.GetCurrentProcess()
}

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

package registry

import (
	"context"
	"regexp"
	"strings"

	"github.com/micro/go-micro/registry"
	"github.com/pydio/cells/common"
)

type mockService struct {
	name          string
	description   string
	version       string
	running       bool
	nodes         []*registry.Node
	tags          []string
	excluded      bool
	microMetadata map[string]string
}

func NewMockFromMicroService(rs *registry.Service) *mockService {
	description := ""
	if len(rs.Nodes) > 0 {
		if d, ok := rs.Nodes[0].Metadata["description"]; ok {
			description = d
		}
	}
	m := &mockService{
		name:          rs.Name,
		nodes:         rs.Nodes,
		description:   description,
		version:       rs.Version,
		running:       true,
		tags:          nil,
		excluded:      false,
		microMetadata: rs.Metadata,
	}
	if m.microMetadata == nil {
		m.microMetadata = make(map[string]string)
	}
	if strings.HasPrefix(rs.Name, common.ServiceGrpcNamespace_+common.ServiceData_) {
		m.tags = []string{common.ServiceTagDatasource}
	}
	return m
}

func (m *mockService) Start(context.Context) {}
func (m *mockService) Stop()                 {}
func (m *mockService) IsRunning() bool {
	return m.running
}
func (m *mockService) IsExcluded() bool {
	return m.excluded
}
func (m *mockService) SetExcluded(ex bool) {
	m.excluded = ex
}
func (m *mockService) Check(context.Context) error {
	return nil
}
func (m *mockService) Name() string {
	return m.name
}
func (m *mockService) ID() string {
	return m.name
}
func (m *mockService) Address() string {
	return ""
}
func (m *mockService) Version() string {
	return m.version
}
func (m *mockService) Description() string {
	return m.description
}
func (m *mockService) Regexp() *regexp.Regexp {
	return nil
}
func (m *mockService) Tags() []string {
	return m.tags
}
func (m *mockService) AddDependency(name string) {
}

func (m *mockService) GetDependencies() []Service {
	return nil
}
func (m *mockService) SetRunningNodes(nodes []*registry.Node) {
	m.nodes = nodes
}
func (m *mockService) RunningNodes() []*registry.Node {
	return m.nodes
}
func (m *mockService) ExposedConfigs() common.XMLSerializableForm {
	return nil
}
func (m *mockService) IsGeneric() bool {
	return !strings.HasPrefix(m.name, common.ServiceGrpcNamespace_) && !strings.HasPrefix(m.name, common.ServiceRestNamespace_)
}
func (m *mockService) IsGRPC() bool {
	return strings.HasPrefix(m.name, common.ServiceGrpcNamespace_)
}
func (m *mockService) IsREST() bool {
	return strings.HasPrefix(m.name, common.ServiceRestNamespace_)
}
func (m *mockService) RequiresFork() bool {
	return false
}
func (m *mockService) AutoStart() bool {
	return false
}
func (m *mockService) ForkStart(context.Context, ...int) {
}
func (m *mockService) MustBeUnique() bool {
	return false
}
func (m *mockService) MatchesRegexp(string) bool {
	return false
}
func (m *mockService) BeforeInit() error {
	return nil
}
func (m *mockService) AfterInit() error {
	return nil
}
func (m *mockService) DAO() interface{} {
	return nil
}

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

package jobs

import (
	"context"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/object"
	service "github.com/pydio/cells/v4/common/proto/service"
)

func (m *DataSourceSelector) FilterID() string {
	return "DataSourceFilter"
}

func (m *DataSourceSelector) ApplyClearInput(msg *ActionMessage) *ActionMessage {
	return msg.WithDataSource(nil)
}

func (m *DataSourceSelector) Filter(ctx context.Context, input *ActionMessage) (*ActionMessage, *ActionMessage, bool) {
	var passed, excluded []*object.DataSource
	for _, ds := range input.DataSources {
		if m.All || m.evaluate(ctx, m.Query, input, ds) {
			passed = append(passed, ds)
		} else {
			excluded = append(passed, ds)
		}
	}
	input.DataSources = passed
	var x *ActionMessage
	if len(excluded) > 0 {
		filteredOutput := input.Clone()
		filteredOutput.DataSources = excluded
		x = filteredOutput
	}
	return input, x, len(passed) > 0
}

func (m *DataSourceSelector) Select(ctx context.Context, input *ActionMessage, objects chan interface{}, done chan bool) error {
	defer func() {
		done <- true
	}()
	// Simply FanOut Input.DataSources without performing queries
	if m.FanOutInput {
		for _, ds := range input.DataSources {
			objects <- proto.Clone(ds).(*object.DataSource)
		}
		return nil
	}
	for _, ds := range m.loadDSS(ctx) {
		if m.All || m.evaluate(ctx, m.Query, input, ds) {
			objects <- ds
		}
	}
	return nil
}

func (m *DataSourceSelector) MultipleSelection() bool {
	return m.Collect
}

func (m *DataSourceSelector) SelectorID() string {
	return "DataSourceSelector"
}

func (m *DataSourceSelector) SelectorLabel() string {
	if m.Label != "" {
		return m.Label
	}
	return m.SelectorID()
}

func (m *DataSourceSelector) loadDSS(ctx context.Context) (sources []*object.DataSource) {
	for _, ds := range config.ListSourcesFromConfig(ctx) {
		sources = append(sources, ds)
	}
	return
}

func (m *DataSourceSelector) evaluate(ctx context.Context, query *service.Query, input *ActionMessage, dsObject *object.DataSource) bool {

	if query == nil {
		return true
	}
	var bb []bool
	for _, q := range query.SubQueries {
		msg := &object.DataSourceSingleQuery{}
		subQ := &service.Query{}
		if e := anypb.UnmarshalTo(q, msg, proto.UnmarshalOptions{}); e == nil {
			// Evaluate fields
			msg.Name = EvaluateFieldStr(ctx, input, msg.Name)
			msg.ObjectServiceName = EvaluateFieldStr(ctx, input, msg.ObjectServiceName)
			msg.StorageConfigurationName = EvaluateFieldStr(ctx, input, msg.StorageConfigurationName)
			msg.StorageConfigurationValue = EvaluateFieldStr(ctx, input, msg.StorageConfigurationValue)
			msg.PeerAddress = EvaluateFieldStr(ctx, input, msg.PeerAddress)
			msg.EncryptionKey = EvaluateFieldStr(ctx, input, msg.EncryptionKey)
			msg.VersioningPolicyName = EvaluateFieldStr(ctx, input, msg.VersioningPolicyName)
			bb = append(bb, msg.Matches(dsObject))
		} else if e := anypb.UnmarshalTo(q, subQ, proto.UnmarshalOptions{}); e == nil {
			bb = append(bb, m.evaluate(ctx, subQ, input, dsObject))
		}
	}
	return service.ReduceQueryBooleans(bb, query.Operation)

}

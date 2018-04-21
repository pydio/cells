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

package policy

import (
	"context"
	"encoding/json"

	"github.com/golang/protobuf/jsonpb"
	"github.com/ory/ladon"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
)

func ProtoToLadonPolicy(policy *idm.Policy) ladon.Policy {

	var output ladon.DefaultPolicy
	marshaler := &jsonpb.Marshaler{
		EnumsAsInts: false,
	}
	body, _ := marshaler.MarshalToString(policy)
	err := json.Unmarshal([]byte(body), &output)
	if err != nil {
		log.Logger(context.Background()).Error("cannot translate proto.Policy to ladon.Policy", zap.Error(err))
		//log.Print(err.Error())
	}
	return &output
}

func LadonToProtoPolicy(policy ladon.Policy) *idm.Policy {

	body, _ := json.Marshal(policy)
	var output idm.Policy
	jsonpb.UnmarshalString(string(body), &output)

	return &output
}

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

package idm

import (
	json "github.com/pydio/cells/x/jsonx"

	"github.com/golang/protobuf/jsonpb"
)

func (c *PolicyCondition) MarshalJSONPB(marshaler *jsonpb.Marshaler) ([]byte, error) {

	output := make(map[string]interface{})
	output["type"] = c.Type
	if len(c.JsonOptions) > 0 {
		var data map[string]interface{}
		json.Unmarshal([]byte(c.JsonOptions), &data)
		output["options"] = data
		output["jsonOptions"] = c.JsonOptions
	}

	return json.Marshal(output)

}

func (c *PolicyCondition) UnmarshalJSONPB(unmarshaller *jsonpb.Unmarshaler, data []byte) error {

	// Unmarshall as map[string]interface{}
	var output map[string]interface{}
	if err := json.Unmarshal(data, &output); err != nil {
		return err
	}
	c.Type = output["type"].(string)
	if optionsData, ok := output["options"]; ok {
		// Now remarshall as string and assign to JsonOptions
		stringOpts, _ := json.Marshal(optionsData)
		c.JsonOptions = string(stringOpts)
	} else if jsonOpts, ok := output["jsonOptions"]; ok {
		c.JsonOptions = jsonOpts.(string)
	}
	return nil

}

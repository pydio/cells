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

package utils

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/pydio/cells/common/config"
)

// SaveConfigs sends configuration to the config client and to a local file.
func SaveConfigs() error {
	//cli := go_micro_srv_config_config.NewConfigClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_CONFIG, defaults.NewClient())

	var data map[string]interface{}
	err := config.Default().Unmarshal(&data)
	if err != nil {
		return err
	}

	if err := setConfigsInFile(config.GetFile(), data); err != nil {
		return err
	}
	/*
		for id, changeset := range data {
			b, err := json.Marshal(changeset)
			if err != nil {
				return err
			}

			c := &go_micro_srv_config_config.Change{
				Id:   id,
				Path: id,
				ChangeSet: &go_micro_os_config.ChangeSet{
					Data: fmt.Sprintf("%s", b),
				},
			}

			_, err = cli.Update(context.Background(), &go_micro_srv_config_config.UpdateRequest{Change: c})

			if err != nil {
				if details := errors.Parse(err.Error()); !strings.Contains(details.Detail, "not found") {
					return err
				}

				_, err := cli.Create(context.Background(), &go_micro_srv_config_config.CreateRequest{Change: c})
				if err != nil {
					return err
				}

			}
		}
	*/

	return nil
}

func setConfigsInFile(filename string, data interface{}) error {

	b, err := json.MarshalIndent(data, "", "  ")

	f, err := os.OpenFile(filename, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0755)
	if err != nil {
		return err
	}
	defer f.Close()

	if _, err := f.WriteString(fmt.Sprintf("%s", b)); err != nil {
		return err
	}

	return nil
}

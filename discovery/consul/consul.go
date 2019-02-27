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

package consul

import (
	"context"

	"github.com/hashicorp/consul/agent"
	"github.com/hashicorp/consul/agent/config"
	"github.com/pydio/cells/cmd"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/plugins"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

var (
	defaultConfig = `{
      "bootstrap": true,
      "data_dir": "/tmp/consul",
      "server": true
	}`
)

func Init() {
	flags := cmd.RootCmd.PersistentFlags()
	flags.String("consul_config", "", "Configuration file for consul")

	viper.BindPFlag("consul_config", flags.Lookup("consul_config"))

	plugins.Register(run)
}

func run() {

	reg := viper.GetString("registry")

	if reg == "consul" {

		//create the logwriter
		runtime := config.DefaultRuntimeConfig(defaultConfig)

		agent, err := agent.New(runtime)
		if err != nil {
			log.Fatal("Cannot start consul", zap.Error(err))
		}

		agent.LogOutput = &logwriter{context.Background()}

		go func() {
			agent.Start()
		}()
	}
}

type logwriter struct {
	ctx context.Context
}

// Write to the lowest context for the standard logwriter
func (lw *logwriter) Write(p []byte) (n int, err error) {
	log.Logger(lw.ctx).Info(string(p))

	return len(p), nil
}

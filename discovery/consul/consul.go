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
	"encoding/json"
	"log"
	"strings"

	"github.com/hashicorp/consul/agent"
	"github.com/hashicorp/consul/agent/config"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

func init() {
	cobra.OnInitialize(run)
}

func run() {

	reg := viper.GetString("registry")
	regAddress := viper.GetString("registry_address")
	regClusterAddress := viper.GetString("registry_cluster_address")
	regClusterRoutes := viper.GetString("registry_cluster_routes")

	if reg == "consul" {

		data, _ := json.Marshal(servicecontext.GetConfig(ctx))

		// Making sure bool are converted
		r := strings.NewReplacer(`"true"`, `true`, `"false"`, `false`)
		str := r.Replace(string(data))

		//create the logwriter
		runtime := config.DefaultRuntimeConfig(str)

		agent, err := agent.New(runtime)
		if err != nil {
			return nil, nil, nil, err
		}

		agent.LogOutput = &logwriter{ctx}

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

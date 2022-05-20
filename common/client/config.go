/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package client

// ClusterConfig holds configuration for cluster
type ClusterConfig struct {
	Clients map[string]ClientConfig `json:"clients"`
}

// ClientConfig holds configuration for a specific client (http or grpc)
type ClientConfig struct {
	LBStrategies []*LBStrategy `json:"loadBalancingStrategies,omitempty"`
}

// LBStrategy holds LoadBalancer strategies for a given client
type LBStrategy struct {
	Name   string                 `json:"name"`
	Config map[string]interface{} `json:"config,omitempty"`
}

// LBOptions converts LBStrategies to a slice of BalancerOption
func (c ClientConfig) LBOptions() (oo []BalancerOption) {
	for _, lb := range c.LBStrategies {
		switch lb.Name {
		case "priority-local":
			oo = append(oo, WithPriorityToLocal())
		case "priority-process":
			oo = append(oo, WithPriorityToProcess())
		case "restrict-local":
			oo = append(oo, WithRestrictToLocal())
		case "restrict-process":
			oo = append(oo, WithRestrictToProcess())
		}
	}
	return
}

// GetClientConfig returns ClientConfig for a specific client (either grpc or http)
func (c ClusterConfig) GetClientConfig(name string) ClientConfig {
	if c.Clients != nil {
		if cf, ok := c.Clients[name]; ok {
			return cf
		}
	}
	return ClientConfig{}
}

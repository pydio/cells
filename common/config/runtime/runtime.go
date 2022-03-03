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

package runtime

import (
	"net"
	"regexp"

	"github.com/spf13/viper"
	utilnet "k8s.io/apimachinery/pkg/util/net"
)

var (
	ProcessStartTags []string
)

// TODO v4 : rethink how the runitme is defined (cmd, config, ...)

// IsFork checks if the runtime is originally a fork of a different process
func IsFork() bool {
	return viper.GetBool("is_fork")
}

// IsLocal check if the environment runtime config is generated locally
func IsLocal() bool {
	return viper.GetString("config") == "local"
}

// IsRemote check if the environment runtime config is a remote server
func IsRemote() bool {
	return viper.GetString("config") == "remote" || viper.GetString("config") == "raft"
}

func DefaultAdvertiseAddress() string {
	if addr := viper.GetString("advertise_address"); addr != "" {
		return addr
	}
	bindAddress := viper.GetString("bind_address")
	ip := net.ParseIP(viper.GetString("bind_address"))
	addr, err := utilnet.ResolveBindAddress(ip)
	if err != nil {
		return bindAddress
	}
	viper.SetDefault("advertise_address", addr)

	return viper.GetString("advertise_address")
}

func BuildProcessStartTag() {
	args := viper.GetStringSlice("args")
	xx := viper.GetStringSlice("exclude")
	tt := viper.GetStringSlice("tags")
	for _, t := range tt {
		ProcessStartTags = append(ProcessStartTags, "t:"+t)
	}
	for _, a := range args {
		ProcessStartTags = append(ProcessStartTags, "s:"+a)
	}
	for _, x := range xx {
		ProcessStartTags = append(ProcessStartTags, "x:"+x)
	}
}

func IsRequired(name string, tags ...string) bool {
	args := viper.GetStringSlice("args")
	xx := viper.GetStringSlice("exclude")
	tt := viper.GetStringSlice("tags")
	if len(tt) > 0 {
		var hasTag bool
		for _, t := range tt {
			for _, st := range tags {
				if st == t {
					hasTag = true
					break
				}
			}
		}
		if !hasTag {
			return false
		}
	}
	for _, x := range xx {
		re := regexp.MustCompile(x)
		if re.MatchString(name) {
			return false
		}
	}

	if len(args) == 0 {
		return true
	}

	for _, arg := range viper.GetStringSlice("args") {
		re := regexp.MustCompile(arg)
		if re.MatchString(name) {
			return true
		}
	}

	return false
}

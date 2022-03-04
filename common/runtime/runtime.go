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
	"fmt"
	"net"
	"regexp"
	"strings"

	utilnet "k8s.io/apimachinery/pkg/util/net"
)

var (
	args             []string
	processStartTags []string
	r                Runtime
)

type Runtime interface {
	GetBool(key string) bool
	GetString(key string) string
	GetStringSlice(key string) []string
	IsSet(key string) bool
	SetDefault(key string, value interface{})
}

func SetRuntime(runtime Runtime) {
	r = runtime
}

func GetBool(key string) bool {
	return r.GetBool(key)
}

func GetString(key string) string {
	return r.GetString(key)
}

func GetStringSlice(key string) []string {
	return r.GetStringSlice(key)
}

func SetDefault(key string, value interface{}) {
	r.SetDefault(key, value)
}

func IsSet(key string) bool {
	return r.IsSet(key)
}

func RegistryURL() string {
	return r.GetString(KeyRegistry)
}

func BrokerURL() string {
	return r.GetString(KeyBroker)
}

func ConfigURL() string {
	return r.GetString(KeyConfig)
}

func HttpServerType() string {
	return r.GetString(KeyHttpServer)
}

func GrpcBindAddress() string {
	return net.JoinHostPort(r.GetString(KeyBindHost), r.GetString(KeyGrpcPort))
}

func GrpcExternalPort() string {
	return r.GetString(KeyGrpcExternal)
}

func HttpBindAddress() string {
	return net.JoinHostPort(r.GetString(KeyBindHost), r.GetString(KeyHttpPort))
}

func LogLevel() string {
	return r.GetString(KeyLog)
}

func LogJSON() bool {
	return r.GetBool(KeyLogJson)
}

func LogToFile() bool {
	return r.GetBool(KeyLogToFile)
}

// IsFork checks if the runtime is originally a fork of a different process
func IsFork() bool {
	return r.GetBool(KeyForkLegacy)
}

// IsLocal check if the environment runtime config is generated locally
func IsLocal() bool {
	return r.GetString(KeyConfig) == "local"
}

// IsRemote check if the environment runtime config is a remote server
func IsRemote() bool {
	return r.GetString(KeyConfig) == "remote" || r.GetString(KeyConfig) == "raft"
}

func MetricsEnabled() bool {
	return r.GetBool(KeyEnableMetrics)
}

func PprofEnabled() bool {
	return r.GetBool(KeyEnablePprof)
}

func DefaultAdvertiseAddress() string {
	if addr := r.GetString(KeyAdvertiseAddress); addr != "" {
		return addr
	}
	bindAddress := r.GetString(KeyBindHost)
	ip := net.ParseIP(r.GetString(KeyBindHost))
	addr, err := utilnet.ResolveBindAddress(ip)
	if err != nil {
		return bindAddress
	}
	r.SetDefault(KeyAdvertiseAddress, addr)

	return r.GetString(KeyAdvertiseAddress)
}

func ProcessStartTags() []string {
	return processStartTags
}

func SetArgs(aa []string) {
	args = aa
	buildProcessStartTag()
}

func buildProcessStartTag() {
	xx := r.GetStringSlice(KeyArgExclude)
	tt := r.GetStringSlice(KeyArgTags)
	for _, t := range tt {
		processStartTags = append(processStartTags, "t:"+t)
	}
	for _, a := range args {
		processStartTags = append(processStartTags, "s:"+a)
	}
	for _, x := range xx {
		processStartTags = append(processStartTags, "x:"+x)
	}
}

func BuildForkParams(cmd string) []string {

	grpcAddr := GrpcBindAddress()
	reg := fmt.Sprintf("grpc://%s", grpcAddr)
	if !strings.HasPrefix(RegistryURL(), "mem://") {
		reg = RegistryURL()
	}

	brok := fmt.Sprintf("grpc://%s", grpcAddr)
	if !strings.HasPrefix(BrokerURL(), "mem://") {
		brok = BrokerURL()
	}

	params := []string{
		cmd,
		"--" + KeyFork,
		"--" + KeyRegistry, reg,
		"--" + KeyBroker, brok,
		"--" + KeyGrpcPort, "0",
		"--" + KeyHttpServer, HttpServerNative,
		"--" + KeyHttpPort, "0",
	}

	// Copy string arguments
	strArgs := []string{
		KeyBindHost,
		KeyAdvertiseAddress,
		KeyConfig,
	}

	// Copy bool arguments
	boolArgs := []string{
		KeyEnableMetrics,
		KeyEnablePprof,
	}

	for _, s := range strArgs {
		if IsSet(s) {
			params = append(params, "--"+s, GetString(s))
		}
	}
	for _, bo := range boolArgs {
		if GetBool(bo) {
			params = append(params, "--"+bo)
		}
	}

	return params
}

func IsRequired(name string, tags ...string) bool {
	xx := r.GetStringSlice(KeyArgExclude)
	tt := r.GetStringSlice(KeyArgTags)
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

	for _, arg := range args {
		re := regexp.MustCompile(arg)
		if re.MatchString(name) {
			return true
		}
	}

	return false
}

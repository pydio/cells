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
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/manifoldco/promptui"
	utilnet "k8s.io/apimachinery/pkg/util/net"

	cellsnet "github.com/pydio/cells/v4/common/utils/net"
)

var (
	args             []string
	processStartTags []string
	preRunRegistry   []func(Runtime)
	r                Runtime = &emptyRuntime{}
)

type Runtime interface {
	GetBool(key string) bool
	GetString(key string) string
	GetStringSlice(key string) []string
	IsSet(key string) bool
	SetDefault(key string, value interface{})
}

// SetRuntime sets internal global Runtime
func SetRuntime(runtime Runtime) {
	r = runtime
}

func RegisterPreRun(preRun func(runtime Runtime)) {
	preRunRegistry = append(preRunRegistry, preRun)
}

// GetBool gets a key as boolean from global runtime
func GetBool(key string) bool {
	if l, o := legacyMap[key]; o && !r.IsSet(key) && r.IsSet(l) {
		return r.GetBool(l)
	}
	return r.GetBool(key)
}

// GetString gets a key from global runtime
func GetString(key string) string {
	if l, o := legacyMap[key]; o && !r.IsSet(key) && r.IsSet(l) {
		return r.GetString(l)
	}
	return r.GetString(key)
}

// GetStringSlice gets a slice from global runtime.
func GetStringSlice(key string) []string {
	if l, o := legacyMap[key]; o && !r.IsSet(key) && r.IsSet(l) {
		return r.GetStringSlice(l)
	}
	return r.GetStringSlice(key)
}

// SetDefault updates global runtime
func SetDefault(key string, value interface{}) {
	r.SetDefault(key, value)
}

// IsSet check existence of a key in runtime
func IsSet(key string) bool {
	return r.IsSet(key)
}

// DiscoveryURL returns the scheme://address url for Registry
func DiscoveryURL() string {
	return r.GetString(KeyDiscovery)
}

func IsGrpcScheme(u string) bool {
	if u != "" {
		if ur, e := url.Parse(u); e == nil && ur.Scheme == "grpc" {
			return true
		}
	}
	return false
}

func NeedsGrpcDiscoveryConn() (bool, string) {
	if IsGrpcScheme(ConfigURL()) {
		return true, ConfigURL()
	} else if IsGrpcScheme(RegistryURL()) {
		return true, RegistryURL()
	} else if IsGrpcScheme(BrokerURL()) {
		return true, BrokerURL()
	}
	return false, ""
}

// RegistryURL returns the scheme://address url for Registry
func RegistryURL() string {
	if r.IsSet(KeyDiscovery) {
		return r.GetString(KeyDiscovery)
	}

	return r.GetString(KeyRegistry)
}

// BrokerURL returns the scheme://address url for Broker
func BrokerURL() string {
	if r.IsSet(KeyDiscovery) {
		return r.GetString(KeyDiscovery)
	}

	return r.GetString(KeyBroker)
}

// ConfigURL returns the scheme://address url for Config
func ConfigURL() string {
	v := r.GetString(KeyConfig)
	if r.IsSet(KeyDiscovery) {
		v = r.GetString(KeyDiscovery)
	}
	if u, e := url.Parse(v); e == nil && strings.TrimLeft(u.Path, "/") == "" {
		u.Path = "/config"
		v = u.String()
	}
	return v
}

func CacheURL() string {
	return r.GetString(KeyCache)
}

func ShortCacheURL() string {
	return r.GetString(KeyShortCache)
}

// ConfigIsLocalFile checks if ConfigURL scheme is file
func ConfigIsLocalFile() bool {
	if u, e := url.Parse(ConfigURL()); e == nil {
		return u.Scheme == "file"
	} else {
		return false
	}
}

func VaultURL(withMaster string) string {
	var u *url.URL
	var e error
	if r.IsSet(KeyVault) && r.GetString(KeyVault) != "" && r.GetString(KeyVault) != "detect" {
		u, e = url.Parse(r.GetString(KeyVault))
	} else {
		u, e = url.Parse(ConfigURL())
	}
	if e != nil {
		return ""
	}
	if u.Scheme == "file" {
		// Replace basename with pydio-vault.json
		u.Path = filepath.Join(filepath.Dir(u.Path), DefaultVaultFileName)
	} else {
		u.Path = "vault"
	}
	q := u.Query()
	q.Set("masterKey", withMaster)
	u.RawQuery = q.Encode()
	return u.String()
}

func KeyringURL() string {
	return r.GetString(KeyKeyring)
}

func CertsStoreURL() string {
	return r.GetString(KeyCertsStore)
}

func CertsStoreLocalLocation() string {
	return filepath.Join(ApplicationWorkingDir(), DefaultCertStorePath)
}

// HttpServerType returns one of HttpServerCaddy or HttpServerCore
func HttpServerType() string {
	return r.GetString(KeyHttpServer)
}

// GrpcBindAddress returns the KeyBindHost:KeyGrpcPort URL
func GrpcBindAddress() string {
	return net.JoinHostPort(r.GetString(KeyBindHost), r.GetString(KeyGrpcPort))
}

// GrpcDiscoveryBindAddress returns the KeyBindHost:KeyGrpcDiscoveryPort URL
func GrpcDiscoveryBindAddress() string {
	return net.JoinHostPort(r.GetString(KeyBindHost), r.GetString(KeyGrpcDiscoveryPort))
}

// GrpcExternalPort returns optional GRPC port to be used for external binding
func GrpcExternalPort() string {
	return r.GetString(KeyGrpcExternal)
}

// HttpBindAddress returns the KeyBindHost:KeyHttpPort URL
func HttpBindAddress() string {
	h := r.GetString(KeyBindHost)
	if HttpServerType() == HttpServerNative && h == "0.0.0.0" {
		if addr, err := utilnet.ResolveBindAddress(net.ParseIP(h)); err == nil {
			h = addr.String()
		}
	}
	return net.JoinHostPort(h, r.GetString(KeyHttpPort))
}

// LogLevel returns the --log value
func LogLevel() string {
	return r.GetString(KeyLog)
}

// LogJSON returns the --log_json value
func LogJSON() bool {
	return r.GetBool(KeyLogJson)
}

// LogToFile returns the --log_to_file value
func LogToFile() bool {
	return r.GetBool(KeyLogToFile)
}

// IsFork checks if the runtime is originally a fork of a different process
func IsFork() bool {
	return r.GetBool(KeyForkLegacy)
}

// MetricsEnabled returns if the metrics should be published or not
func MetricsEnabled() bool {
	return r.GetBool(KeyEnableMetrics)
}

// PprofEnabled returns if an http endpoint should be published for debug/pprof
func PprofEnabled() bool {
	return r.GetBool(KeyEnablePprof)
}

// DefaultAdvertiseAddress reads or compute the address advertised to clients
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

	if !cellsnet.IsPrivateIP(addr) {
		fmt.Println(promptui.IconWarn + " WARNING: no private IP detected. Please set up a virtual IP interface with a private address — see " + promptui.Styler(promptui.FGUnderline)("https://pydio.com/docs/kb/deployment/no-private-ip-detected-issue") + " — or Cells internal servers might become accessible publicly")
	}

	return r.GetString(KeyAdvertiseAddress)
}

// ProcessStartTags returns a list of tags to be used for identifying processes
func ProcessStartTags() []string {
	return processStartTags
}

// SetArgs copies command arguments to internal value
func SetArgs(aa []string) {
	args = aa
	buildProcessStartTag()
	for _, pr := range preRunRegistry {
		pr(r)
	}
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

// BuildForkParams creates --key=value arguments from runtime parameters
func BuildForkParams(cmd string) []string {
	discovery := fmt.Sprintf("grpc://" + GrpcDiscoveryBindAddress())
	params := []string{
		cmd,
		"--" + KeyFork,
		"--" + KeyDiscovery, discovery,
		"--" + KeyGrpcPort, "0",
		"--" + KeyGrpcDiscoveryPort, "0",
		"--" + KeyHttpServer, HttpServerNative,
		//"--" + KeyHttpPort, "0", // This is already the default
	}

	defKR := "file://" + filepath.Join(ApplicationWorkingDir(), DefaultKeyringFileName) + "?keyring=true"
	if r.GetString(KeyKeyring) != defKR {
		params = append(params, "--"+KeyKeyring, r.GetString(KeyKeyring))
	}

	// Copy string arguments
	strArgs := []string{
		KeyBindHost,
		KeyAdvertiseAddress,
	}

	// Copy bool arguments
	boolArgs := []string{
		KeyEnableMetrics,
		KeyEnablePprof,
	}

	// Copy slices arguments
	sliceArgs := []string{
		KeyNodeCapacity,
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
	for _, sl := range sliceArgs {
		if IsSet(sl) {
			for _, a := range GetStringSlice(sl) {
				params = append(params, "--"+sl, a)
			}
		}
	}

	return params
}

// IsRequired checks arguments, --tags and --exclude against a service name
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

// GetHostname wraps os.Hostname, could be overwritten by env or parameter.
func GetHostname() string {
	if s, er := os.Hostname(); er == nil {
		return s
	}
	return ""
}

// HasCapacity checks if a specific capacity is registered for the current process
func HasCapacity(c string) bool {
	caps := r.GetStringSlice(KeyNodeCapacity)
	for _, ca := range caps {
		if c == ca {
			return true
		}
	}
	return false
}

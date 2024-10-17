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
	"path"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/manifoldco/promptui"
	utilnet "k8s.io/apimachinery/pkg/util/net"

	net2 "github.com/pydio/cells/v4/common/utils/net"
)

var (
	args             []string
	processStartTags []string
	processRootID    string
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

// GetRuntime returns the main Runtime
func GetRuntime() Runtime {
	return r
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

// Name returns the name for the node
func Name() string {
	return r.GetString(KeyName)
}

func Cluster() string {
	if !IsSet(KeyCluster) {
		return "default"
	}
	return r.GetString(KeyCluster)
}

// DiscoveryURL returns the scheme://address url for Registry
func DiscoveryURL() string {
	return r.GetString(KeyDiscovery)
}

func IsGrpcScheme(u string) bool {
	if u != "" {
		if ur, e := url.Parse(u); e == nil && (ur.Scheme == "grpc" || ur.Scheme == "xds") {
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

	// if r.IsSet(KeyRegistry) {
	str := r.GetString(KeyRegistry)
	u, _ := url.Parse(str)
	if u.Path == "" {
		u.Path = DefaultRegistrySuffix
	}
	return u.String()
}

// BrokerURL returns the scheme://address url for Broker
func BrokerURL() string {
	if r.IsSet(KeyDiscovery) {
		return r.GetString(KeyDiscovery)
	}

	str := r.GetString(KeyBroker)
	u, _ := url.Parse(str)
	if u.Path == "" {
		u.Path += DefaultBrokerSuffix
	}

	return u.String()
}

// ConfigURL returns the scheme://address url for Config
func ConfigURL() string {
	v := r.GetString(KeyConfig)
	if r.IsSet(KeyDiscovery) {
		v = r.GetString(KeyDiscovery)
	}
	if u, e := url.Parse(v); e == nil {
		if u.Scheme != "file" {
			if u.Path == "" {
				u.Path += DefaultConfigSuffix
			}
		}

		v = u.String()
	}
	return v
}

// ProxyServerURL defines which proxy to use for serving Sites
func ProxyServerURL() string {
	if HttpServerType() == HttpServerCaddy {
		return ""
	}
	return r.GetString(KeyHttpProxyURL)
}

// ConfigIsLocalFile checks if ConfigURL scheme is file
func ConfigIsLocalFile() bool {
	if u, e := url.Parse(ConfigURL()); e == nil {
		return u.Scheme == "file"
	} else {
		return false
	}
}

func SetVaultMasterKey(masterKey string) {
	var u *url.URL
	var e error
	if r.IsSet(KeyVault) && r.GetString(KeyVault) != "" && r.GetString(KeyVault) != "detect" {
		u, e = url.Parse(r.GetString(KeyVault))
	} else {
		u, e = url.Parse(ConfigURL())
	}
	if e != nil {
		return
	}
	if u.Scheme == "file" {
		// Replace basename with pydio-vault.json
		u.Path = path.Join(path.Dir(u.Path), DefaultVaultFileName)
	}

	q := u.Query()
	q.Set("namespace", "vault")
	q.Set("masterKey", masterKey)
	u.RawQuery = q.Encode()
	r.SetDefault("computedVaultURL", u.String())
}

func VaultURL() string {
	// return ConfigURL()
	// TODO
	return r.GetString("computedVaultURL")
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

func BindHost() string {
	return r.GetString(KeyBindHost)
}

func AdvertiseHost() string {
	return r.GetString(KeyAdvertiseAddress)
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

// DefaultAdvertiseAddress reads or compute the address advertised to clients
func DefaultAdvertiseAddress() string {
	if addr := r.GetString(KeyAdvertiseAddress); addr != "" {
		return addr
	}

	bindAddress := r.GetString(KeyBindHost)
	ip := net.ParseIP(r.GetString(KeyBindHost))
	store := bindAddress
	if ip == nil || ip.IsUnspecified() {
		if public, privates, er := net2.ShouldWarnPublicBind(); er == nil && public != "" {
			fmt.Println(promptui.IconWarn + " WARNING: You are using an unspecified bind_address, which could expose Cells internal servers on a public IP address (" + public + "). Use 'bind_address' flag to select an internal network interface (amongst " + strings.Join(privates, ",") + "). If this machine does not provide one, you can set up a virtual IP interface with a private address — see " + promptui.Styler(promptui.FGUnderline)("https://pydio.com/docs/kb/deployment/no-private-ip-detected-issue"))
		} else if er != nil {
			fmt.Println(promptui.IconWarn + " WARNING: Cannot verify if bind_address is properly protected: " + er.Error())
		}
		if addr, err := utilnet.ResolveBindAddress(ip); err == nil {
			store = addr.String()
		}
	} else if !ip.IsLoopback() && !ip.IsPrivate() {
		fmt.Println(promptui.IconWarn + " WARNING: You are using a non-private bind_address, which could expose Cells internal servers.")
	}
	r.SetDefault(KeyAdvertiseAddress, store)

	return r.GetString(KeyAdvertiseAddress)
}

// ProcessRootID retrieves a unique identifier for the current process
func ProcessRootID() string {
	return processRootID
}

// SetProcessRootID passes a UUID for the current process
func SetProcessRootID(id string) {
	processRootID = id
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
	processStartTags = append(processStartTags, "n:"+r.GetString(KeyName))
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

	// Copy string arguments
	strArgs := []string{
		KeyBindHost,
		KeyAdvertiseAddress,
	}

	strArgsWithDefaults := map[string]string{
		KeyKeyring: DefaultKeyKeyring,
	}

	// Copy bool arguments
	boolArgs := []string{
		KeyEnablePprof,
		KeyEnableMetrics,
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
	// Set these only if they differ from their default value
	for k, v := range strArgsWithDefaults {
		if IsSet(k) && GetString(k) != v {
			params = append(params, "--"+k, GetString(k))
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

// GetPID wraps os.Getpid.
func GetPID() string {
	return fmt.Sprintf("%d", os.Getpid())
}

// GetPPID wraps os.Getppid.
func GetPPID() string {
	return fmt.Sprintf("%d", os.Getppid())
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

type InfoPair struct {
	Key   string
	Value string
}

type InfoGroup struct {
	Name  string
	Pairs []InfoPair
}

// Describe echoes the current runtime status
func Describe() (out []InfoGroup) {

	uGroup := InfoGroup{Name: "Drivers"}
	keys := []string{
		"Registry",
		"Broker",
		"Config",
		"Vault",
		"Keyring",
		"Certificates",
		//"Cache",
		//"ShortCache",
		//"Queue",
		//"Persisting Queue",
	}
	urls := map[string]func() string{
		"Registry":     RegistryURL,
		"Broker":       BrokerURL,
		"Config":       ConfigURL,
		"Vault":        VaultURL,
		"Keyring":      KeyringURL,
		"Certificates": CertsStoreURL,
		/*
			"Cache": func() string {
				return CacheURL("")
			},
			"ShortCache": func() string {
				return ShortCacheURL()
			},
			"Queue": func() string {
				return QueueURL()
			},
			"Persisting Queue": func() string {
				return PersistingQueueURL()
			},
		*/
	}

	for _, k := range keys {
		u := urls[k]
		var urlString string
		ur, e := url.Parse(u())
		if e != nil {
			urlString = "Error: " + e.Error()
		} else {
			ur.RawQuery = ""
			urlString = ur.Redacted()
		}
		uGroup.Pairs = append(uGroup.Pairs, InfoPair{Key: k, Value: urlString})
	}

	network := InfoGroup{Name: "Networking"}
	network.Pairs = append(network.Pairs,
		InfoPair{"Hostname", GetHostname()},
		InfoPair{"Advertise", DefaultAdvertiseAddress()},
	)

	// Todo - expose telemetry info ?
	logging := InfoGroup{Name: "Telemetry (todo)"}
	/*
		me := "false"
		pp := "false"
		if o, _, _ := MetricsRemoteEnabled(); o {
			me = "/metrics/sd (with basic-auth)"
		} else if MetricsEnabled() {
			me = "true"
		}
		if PprofEnabled() {
			pp = "true"
		}
		logging.Pairs = append(logging.Pairs,
			InfoPair{"Metrics", me},
			InfoPair{"Profiles", pp},
		)
	*/

	return append(out, uGroup, network, logging)
}

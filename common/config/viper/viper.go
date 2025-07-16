package viper

import (
	"context"
	"io"
	"strings"
	"sync"
	"time"

	"github.com/fsnotify/fsnotify"
	mapstructure "github.com/go-viper/mapstructure/v2"
	"github.com/spf13/cast"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/std"
	"github.com/pydio/cells/v5/common/utils/watch"
)

type Viper interface {
	AddConfigPath(in string)
	AllKeys() []string
	AllSettings() map[string]interface{}
	AutomaticEnv()
	BindEnv(input ...string) error
	BindFlagValue(key string, flag viper.FlagValue) error
	BindFlagValues(flags viper.FlagValueSet) error
	BindPFlag(key string, flag *pflag.Flag) error
	ConfigFileUsed() string
	Debug()
	Get(key string) interface{}
	GetBool(key string) bool
	GetDuration(key string) time.Duration
	GetFloat64(key string) float64
	GetInt(key string) int
	GetInt64(key string) int64
	GetIntSlice(key string) []int
	GetSizeInBytes(key string) uint
	GetString(key string) string
	GetStringMap(key string) map[string]interface{}
	GetStringMapString(key string) map[string]string
	GetStringMapStringSlice(key string) map[string][]string
	GetStringSlice(key string) []string
	GetTime(key string) time.Time
	GetUint(key string) uint
	InConfig(key string) bool
	IsSet(key string) bool
	MergeConfig(in io.Reader) error
	MergeConfigMap(cfg map[string]interface{}) error
	MergeInConfig() error
	OnConfigChange(run func(e fsnotify.Event))
	ReadConfig(in io.Reader) error
	ReadInConfig() error
	RegisterAlias(alias string, key string)
	SafeWriteConfig() error
	SafeWriteConfigAs(filename string) error
	Set(key string, value interface{})
	SetConfigFile(in string)
	SetConfigName(in string)
	SetConfigType(in string)
	SetDefault(key string, value interface{})
	SetEnvKeyReplacer(r *strings.Replacer)
	SetEnvPrefix(in string)
	// TODO - add sub
	// Sub(key string) Viper
	Unmarshal(rawVal interface{}, opts ...viper.DecoderConfigOption) error
	UnmarshalExact(rawVal interface{}, opts ...viper.DecoderConfigOption) error
	UnmarshalKey(key string, rawVal interface{}, opts ...viper.DecoderConfigOption) error
	WatchConfig()
	WriteConfig() error
	WriteConfigAs(filename string) error

	// Remote provider methods
	AddRemoteProvider(provider, endpoint, path string) error
	ReadRemoteConfig() error
	WatchRemoteConfig() error
	WatchRemoteConfigOnChannel() error
}

const (
	delimiter = "/"
)

type viperClone struct {
	viper Viper
	lock  *sync.RWMutex
}

func (m *viperClone) Clone() *viperClone {
	m.lock.RLock()
	settings := m.viper.AllSettings()
	clone := std.DeepClone(settings)
	m.lock.RUnlock()

	v := viper.New()
	v.MergeConfigMap(clone)

	return &viperClone{viper: v, lock: m.lock}
}

func (m *viperClone) Get() any {
	m.lock.RLock()
	res := m.viper.AllSettings()
	m.lock.RUnlock()

	return res
}

func (m *viperClone) Empty() {
	m.viper = viper.New()
}

type viperStore struct {
	v Viper
	watch.Watcher
	locker         *sync.RWMutex
	externalLocker *sync.RWMutex
}

func newViper(v Viper, opt ...configx.Option) config.Store {
	opts := configx.Options{}
	for _, o := range opt {
		o(&opts)
	}

	lock := new(sync.RWMutex)

	//viper.RemoteConfig = remoteProvider{}
	v = newViperWithSlices(v, lock)
	w := watch.NewWatcher(&viperClone{v, lock})

	m := &viperStore{
		v:              v,
		Watcher:        w,
		locker:         lock,
		externalLocker: &sync.RWMutex{},
	}

	return m
}

func (m *viperStore) update() {
	m.Reset()
}

func (m *viperStore) Key() []string {
	return m.Val().Key()
}

func (m *viperStore) Get() any {
	m.locker.RLock()
	res := m.v.AllSettings()
	m.locker.RUnlock()
	return res
}

func (m *viperStore) Set(value any) error {
	return m.Val().Set(value)
}

func (m *viperStore) Context(ctx context.Context) configx.Values {
	return m.Val().Context(ctx)
}

func (m *viperStore) Options() *configx.Options {
	return m.Val().Options()
}

func (m *viperStore) Val(path ...string) configx.Values {
	return &values{v: m, k: std.StringToKeys(path...), locker: m.locker}
}

func (m *viperStore) Default(d any) configx.Values {
	return m.Val().Default(d)
}

func (m *viperStore) Del() error {
	return errors.New("not implemented")
}

func (f *viperStore) As(out any) bool { return false }

func (m *viperStore) Close(_ context.Context) error {
	return nil
}

func (m *viperStore) Done() <-chan struct{} {
	// Never returns
	return nil
}

func (m *viperStore) Save(string, string) error {
	return m.v.SafeWriteConfig()
}

func (m *viperStore) Lock() {
	m.externalLocker.Lock()
}

func (m *viperStore) Unlock() {
	m.externalLocker.Unlock()
}

type values struct {
	k []string
	v *viperStore

	locker *sync.RWMutex

	ctx context.Context
}

func (v *values) Get() any {
	if len(v.k) == 0 {
		return v.v.v.AllSettings()
	} else {
		return v.v.v.Get(strings.Join(v.k, delimiter))
	}
}

func (v *values) Set(value any) error {
	path := std.StringToKeys(v.k...)
	if len(path) == 0 {
		cast.ToStringMap(value)
		if err := v.v.v.MergeConfigMap(cast.ToStringMap(value)); err != nil {
			return err
		}
	} else {
		v.v.v.Set(strings.Join(std.StringToKeys(v.k...), delimiter), value)
	}
	v.v.update()

	return nil
}

func (v *values) Del() error {
	v.v.v.Set(strings.Join(std.StringToKeys(v.k...), delimiter), nil)

	v.v.update()

	return nil
}

func (v *values) Context(ctx context.Context) configx.Values {
	return &values{v: v.v, k: v.k, ctx: ctx, locker: v.locker}
}

func (v *values) Val(path ...string) configx.Values {
	return &values{v: v.v, k: std.StringToKeys(append(v.k, path...)...), ctx: v.ctx, locker: v.v.locker}
}

func (v *values) Default(d any) configx.Values {
	v.v.v.SetDefault(strings.Join(std.StringToKeys(v.k...), delimiter), d)

	return &values{v: v.v, k: v.k, ctx: v.ctx, locker: v.v.locker}
}

func (v *values) Options() *configx.Options {
	return &configx.Options{
		Context: v.ctx,
	}
}

func (v *values) Key() []string {
	return v.k
}

func (v *values) Bool() bool {
	v.locker.RLock()
	res := v.v.v.GetBool(strings.Join(std.StringToKeys(v.k...), delimiter))
	v.locker.RUnlock()
	return res
}

func (v *values) Bytes() []byte {
	// TODO - context
	return []byte{}
}

func (v *values) Interface() any {
	return v.Get()
}

func (v *values) Int() int {
	v.locker.RLock()
	res := v.v.v.GetInt(strings.Join(std.StringToKeys(v.k...), delimiter))
	v.locker.RUnlock()
	return res
}

func (v *values) Int64() int64 {
	v.locker.RLock()
	res := v.v.v.GetInt64(strings.Join(std.StringToKeys(v.k...), delimiter))
	v.locker.RUnlock()
	return res
}

func (v *values) Duration() time.Duration {
	v.locker.RLock()
	res := v.v.v.GetDuration(strings.Join(std.StringToKeys(v.k...), delimiter))
	v.locker.RUnlock()
	return res
}

func (v *values) String() string {
	v.locker.RLock()
	res := v.v.v.GetString(strings.Join(std.StringToKeys(v.k...), delimiter))
	v.locker.RUnlock()
	return res
}

func (v *values) StringMap() map[string]string {
	v.locker.RLock()
	res := v.v.v.GetStringMapString(strings.Join(std.StringToKeys(v.k...), delimiter))
	v.locker.RUnlock()
	return res
}

func (v *values) StringArray() []string {
	v.locker.RLock()
	res := v.v.v.GetStringSlice(strings.Join(std.StringToKeys(v.k...), delimiter))
	v.locker.RUnlock()
	return res
}

func (v *values) Slice() []any {
	var r []any
	if err := v.Scan(&r); err != nil {
		return nil
	}

	return r
}

func (v *values) Map() map[string]any {
	v.locker.RLock()
	res := v.v.v.GetStringMap(strings.Join(std.StringToKeys(v.k...), delimiter))
	v.locker.RUnlock()
	return res
}

func (v *values) Scan(out any, options ...configx.Option) error {
	v.locker.RLock()
	defer v.locker.RUnlock()

	return mapstructure.Decode(v.v.v.Get(strings.Join(std.StringToKeys(v.k...), delimiter)), out)
}

type remoteConfig struct{}

func (rc *remoteConfig) Get(rp viper.RemoteProvider) (io.Reader, error) {
	return nil, nil
}

func (rc *remoteConfig) Watch(rp viper.RemoteProvider) (io.Reader, error) {
	return nil, nil
}

func (rc *remoteConfig) WatchChannel(rp viper.RemoteProvider) (<-chan *viper.RemoteResponse, chan bool) {
	return nil, nil
}

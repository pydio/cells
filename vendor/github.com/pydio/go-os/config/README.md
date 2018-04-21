# Config [![GoDoc](https://godoc.org/github.com/pydio/go-os?status.svg)](https://godoc.org/github.com/pydio/go-os/config)

Provides a high level pluggable abstraction for dynamic configuration.

## Interface

There's a need for dynamic configuration with namespacing, deltas for rollback, 
watches for changes and an audit log. At a low level we may care about server 
addresses changing, routing information, etc. At a high level there may be a 
need to control business level logic; External API Urls, Pricing information, etc.

```go
// Config is the top level config which aggregates a
// number of sources and provides a single merged
// interface.
type Config interface {
	// Config values
	Values
	// Config options
	Options() Options
	// Render unusable
	Close() error
	// String name of config
	String() string
}

// Values loaded within the config
type Values interface {
	// The path could be a nested structure so
	// make it a composable.
	// Returns internal cached value
	Get(path ...string) Value
	// Sets internal cached value
	Set(val interface{}, path ...string)
	// Deletes internal cached value
	Del(path ...string)
	// Returns vals as bytes
	Bytes() []byte
}

// Represent a value retrieved from the values loaded
type Value interface {
	Bool(def bool) bool
	Int(def int) int
	String(def string) string
	Float64(def float64) float64
	Duration(def time.Duration) time.Duration
	StringSlice(def []string) []string
	StringMap(def map[string]string) map[string]string
	Scan(val interface{}) error
	Bytes() []byte
}

func NewConfig(opts ...Option) Config {
	return newOS(opts...)
}
```

## Supported Backends

- [Config service](https://github.com/micro/config-srv)
- Consul
- File

## Usage

Config provides a way to use configuration that's dynamically loaded from a variety of backends and subscribe to changes. 
It also allows the ability to set default values where config might be missing.

```go
	// Create a config instance
	config := config.NewConfig(
		// Poll every minute for changes
		config.PollInterval(time.Minute),
		// Use file as a config source
		// Multiple sources can be specified
		config.WithSource(file.NewSource(config.SourceName(configFile))),
	)

	defer config.Close()

	// Get config at path as string
	// Sets value 'default' if it does not exist
	val := config.Get("path", "to", "key").String("default")


	// Scan into some type
	var ival map[string]interface{}
	if err := config.Get("path", "to", "key").Scan(&ival); err != nil {
		fmt.Println(err)
		return
	}

	// Watch for changes. Optionally specify path to watch.
	w, err := c.Watch("path", "to", "key")
	if err != nil {
		fmt.Println(err)
		return
	}

	for {
		// Block waiting for changes from watcher.
		v, err := w.Next()
		if err != nil {
			fmt.Println(err)
			return
		}
		fmt.Println("Received value for key:", v.String("default"))
	}

```

## Config Format

The config format expected for backend sources by default is JSON. This is handled by the `Reader` interface. 
Multiple sources will be read and merged down based on the order they were configured in options. 

```
{
	"path": {
		"to": {
			"key": ["foo", "bar"]
		}
	}
}
```

package viper

import (
	"context"
	"github.com/pydio/cells/v5/common/config/etcd"
	"github.com/pydio/cells/v5/common/config/file"
	"github.com/pydio/cells/v5/common/config/memory"
	"testing"
	"time"

	"github.com/spf13/viper"
	"github.com/stretchr/testify/assert"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/kv"
	"github.com/pydio/cells/v5/common/utils/openurl"
	"github.com/pydio/cells/v5/common/utils/watch"
)

func TestMemory(t *testing.T) {
	u := &memory.MemOpener{}

	store, err := u.Open(context.Background(), "mem://")
	if err != nil {
		t.Fatal(err)
	}

	// Define test cases
	testSetAndGet(t, store)
}

func TestFile(t *testing.T) {
	u := &file.FileOpener{}

	store, err := u.Open(context.Background(), "file:///tmp/test/cells.json")
	if err != nil {
		t.Fatal(err)
	}

	// Define test cases
	testSetAndGet(t, store)

	if err := store.Save("test", "test"); err != nil {
		t.Fatal(err)
	}
}

func TestETCD(t *testing.T) {
	u := &etcd.EtcdOpener{}

	store, err := u.Open(context.Background(), "etcd://0.0.0.0:23379/config")
	if err != nil {
		t.Fatal(err)
	}

	// Define test cases
	testSetAndGet(t, store)

	if err := store.Save("test", "test"); err != nil {
		t.Fatal(err)
	}
}

func testSetAndGet(t *testing.T, store config.Store) {
	tests := []struct {
		name           string
		setKey         string
		setValue       interface{}
		getKey         string
		expectedValue  interface{}
		expectGetError bool
	}{
		// Basic map cases
		{
			name:          "Set and Get map value",
			setKey:        "config/db/user",
			setValue:      "admin",
			getKey:        "config/db/user",
			expectedValue: "admin",
		},
		{
			name:          "Set and Get nested map value",
			setKey:        "config/db/password",
			setValue:      "secret",
			getKey:        "config/db/password",
			expectedValue: "secret",
		},

		// Slice cases
		{
			name:          "Set and Get slice value",
			setKey:        "config/servers/0",
			setValue:      "server1",
			getKey:        "config/servers/0",
			expectedValue: "server1",
		},
		{
			name:          "Update existing slice value",
			setKey:        "config/servers/1",
			setValue:      "server2",
			getKey:        "config/servers/1",
			expectedValue: "server2",
		},
		{
			name:          "Expand slice and set new value",
			setKey:        "config/servers/3",
			setValue:      "server4",
			getKey:        "config/servers/3",
			expectedValue: "server4",
		},
		{
			name:           "Retrieve nonexistent slice index",
			getKey:         "config/servers/10",
			expectGetError: true,
		},

		// Mixed map and slice
		{
			name:          "Set and Get value in map within slice",
			setKey:        "config/serverDetails/0/name",
			setValue:      "server1",
			getKey:        "config/serverDetails/0/name",
			expectedValue: "server1",
		},
		{
			name:          "Update value in map within slice",
			setKey:        "config/serverDetails/0/port",
			setValue:      8080,
			getKey:        "config/serverDetails/0/port",
			expectedValue: 8080,
		},
	}

	// Run test cases
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.setKey != "" {
				// Perform the set operation
				defer func() {
					if r := recover(); r != nil {
						// Handle panics gracefully for invalid test cases
						if !tt.expectGetError {
							assert.Nil(t, r, "Unexpected panic in set")
						} else {
							assert.True(t, tt.expectGetError, "Unexpected panic in set")
						}
					}
				}()
				store.Val(tt.setKey).Set(tt.setValue)
			}

			// Perform the get operation
			result := store.Val(tt.getKey).Get()
			if tt.expectGetError {
				assert.Nil(t, result, "Expected nil result for error case")
			} else {
				assert.Equal(t, tt.expectedValue, result, "Unexpected value for key %s", tt.getKey)
			}
		})
	}
}

func TestViperWithRefPool_Get(t *testing.T) {
	// Mock data
	mainConfig := map[string]interface{}{
		"simple_key": "simple_value",
		"nested_key": map[string]interface{}{
			"sub_key": "sub_value",
		},
		"list_key": []interface{}{"item1", "item2", "item3"},
		"ref_key": map[string]interface{}{
			"$ref": `"otherConfig#nested_key/sub_key"`,
		},
	}

	otherConfig := map[string]interface{}{
		"nested_key": map[string]interface{}{
			"sub_key": "other_sub_value",
		},
	}

	// Setup main viper instance
	mainViper := viper.New()
	mainViper.MergeConfigMap(mainConfig)

	// Setup other viper instance
	otherViper := viper.New()
	otherViper.MergeConfigMap(otherConfig)

	pool, err := openurl.OpenPool[config.Store](context.Background(), []string{""}, func(ctx context.Context, urlstr string) (config.Store, error) {
		return newViper(otherViper), nil
	})
	if err != nil {
		t.Fatal(err)
	}

	// Create ref pool
	refPool := map[string]*openurl.Pool[config.Store]{
		"otherConfig": pool,
	}

	// Create storeWithRefPool instance
	vwrp := kv.newStoreWithRefPool(newViper(mainViper), refPool)

	// Table-driven tests
	tests := []struct {
		name      string
		key       string
		expected  interface{}
		expectNil bool
	}{
		{"SimpleKey", "simple_key", "simple_value", false},
		{"NestedKey", "nested_key/sub_key", "sub_value", false},
		{"ListKeyValidIndex", "list_key/1", "item2", false},
		{"ListKeyInvalidIndex", "list_key/3", nil, true},
		{"RefKeyValid", "ref_key", "other_sub_value", false},
		{"NonExistentKey", "nonexistent", nil, true},
		{"InvalidRefTarget", "invalid_ref_key", nil, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := vwrp.Val(tt.key).Get()

			if tt.expectNil && result != nil {
				t.Errorf("expected nil but got %v", result)
			}

			if !tt.expectNil && result != tt.expected {
				t.Errorf("expected %v but got %v", tt.expected, result)
			}
		})
	}
}

func TestViperWithRefPool_Set(t *testing.T) {
	// Mock data for main configuration
	mainConfig := map[string]interface{}{
		"simple_key": "simple_value",
		"nested_key": map[string]interface{}{
			"sub_key": "sub_value",
		},
		"list_key": []interface{}{"item1", "item2"},
		"ref_key": map[string]interface{}{
			"$ref": `"otherConfig#nested_key.sub_key"`,
		},
	}

	// Mock data for another configuration (referenced by ref_key)
	otherConfig := map[string]interface{}{
		"nested_key": map[string]interface{}{
			"sub_key": "other_sub_value",
		},
	}

	// Initialize the main Viper instance
	mainViper := viper.New()
	mainViper.MergeConfigMap(mainConfig)

	// Initialize the other Viper instance
	otherViper := viper.New()
	otherViper.MergeConfigMap(otherConfig)

	pool, err := openurl.OpenPool[config.Store](context.Background(), []string{""}, func(ctx context.Context, urlstr string) (config.Store, error) {
		return newViper(otherViper), nil
	})
	if err != nil {
		t.Fatal(err)
	}

	// Create the reference pool
	refPool := map[string]*openurl.Pool[config.Store]{
		"otherConfig": pool,
	}

	// Create the storeWithRefPool instance
	vwrp := kv.newStoreWithRefPool(newViper(mainViper), refPool)

	// Table-driven tests
	tests := []struct {
		name         string
		key          string
		value        interface{}
		expectedPath string // Key to verify in mainConfig or otherConfig
		expected     interface{}
		usesOther    bool // Whether the expected value should be in otherConfig
	}{
		{"SetSimpleKey", "simple_key", "new_value", "simple_key", "new_value", false},
		{"SetNestedKey", "nested_key.new_sub_key", "nested_value", "nested_key.new_sub_key", "nested_value", false},
		{"SetListKeyValidIndex", "list_key.1", "updated_item2", "list_key.1", "updated_item2", false},
		{"SetListKeyNewIndex", "list_key.3", "new_item4", "list_key.3", "new_item4", false},
		{"SetRefKey", "ref_key", "ignored_value", "nested_key.sub_key", "ignored_value", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Perform the Set operation
			vwrp.Val(tt.key).Set(tt.value)

			// Verify the updated value
			var result interface{}
			if tt.usesOther {
				result = otherViper.Get(tt.expectedPath)
			} else {
				result = mainViper.Get(tt.expectedPath)
			}

			if result != tt.expected {
				t.Errorf("expected %v but got %v for key %s", tt.expected, result, tt.expectedPath)
			}
		})
	}
}

func TestViperWithRefPool_Watch(t *testing.T) {
	// Mock data for main configuration
	mainConfig := map[string]interface{}{
		"simple_key": "simple_value",
		"nested_key": map[string]interface{}{
			"sub_key": "sub_value",
		},
		"list_key": []interface{}{"item1", "item2"},
		"ref_key": map[string]interface{}{
			"$ref": `"otherConfig#other_nested_key/other_sub_key"`,
		},
	}

	// Mock data for another configuration (referenced by ref_key)
	otherConfig := map[string]interface{}{
		"other_nested_key": map[string]interface{}{
			"other_sub_key": map[string]interface{}{
				"subkey": "subvalue",
			},
		},
	}

	// Initialize the main Viper instance
	mainViper := viper.NewWithOptions(viper.KeyDelimiter("/"))
	mainViper.MergeConfigMap(mainConfig)

	// Table-driven tests
	tests := []struct {
		name         string
		key          string
		value        interface{}
		watchPath    string
		expectedPath string // Key to verify in mainConfig or otherConfig
		expected     interface{}
	}{
		{"NewSimpleKey", "new_simple_key", "new_value", "", "new_simple_key", "new_value"},
		{"NewNestedKey", "new_nested_key/new_sub_key", "nested_value", "", "new_nested_key/new_sub_key", "nested_value"},
		{"UpdSimpleKey", "simple_key", "updated_value", "", "simple_key", "updated_value"},
		{"UpdNestedKey", "nested_key/sub_key", "updated_nested", "", "nested_key/sub_key", "updated_nested"},
		{"DelSimpleKey", "new_simple_key", nil, "", "new_simple_key", nil},
		{"DelNestedKey", "new_nested_key/new_sub_key", nil, "", "new_nested_key/new_sub_key", nil},
		{"InsideRefPool", "ref_key/new", "ref_value", "ref_key", "ref_key/new", "ref_value"},
		{"OutsideRefPool", "ref_key/new", "new_ref_value", "", "ref_key/new", "new_ref_value"},
	}

	// Initialize the other Viper instance
	otherViper := viper.NewWithOptions(viper.KeyDelimiter("/"))
	otherViper.MergeConfigMap(otherConfig)

	pool, err := openurl.OpenPool[config.Store](context.Background(), []string{""}, func(ctx context.Context, urlstr string) (config.Store, error) {
		return newViper(otherViper), nil
	})
	if err != nil {
		t.Fatal(err)
	}

	// Create the reference pool
	refPool := map[string]*openurl.Pool[config.Store]{
		"otherConfig": pool,
	}

	// Create the storeWithRefPool instance
	vwrp := &memory.memStore{Store: kv.newStoreWithRefPool(newViper(mainViper), refPool), clone: func(store config.Store) config.Store {
		return &kv.storeWithRefPool{Store: store, refPool: refPool}
	}}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w, err := vwrp.Watch(watch.WithPath(tt.watchPath))
			assert.Nil(t, err, "Setting a watcher should not fail")

			vwrp.Val(tt.key).Set(tt.value)

			ch := make(chan any, 1)

			go func() {
				res, err := w.Next()
				assert.Nil(t, err)

				ch <- res
			}()

			select {
			case <-time.After(time.Minute * 40):
				assert.Fail(t, "Watch timing out")
			case res := <-ch:
				assert.Equal(t, tt.expected, res.(configx.Values).Val(tt.expectedPath).Get())
			}

			w.Stop()
		})
	}
}

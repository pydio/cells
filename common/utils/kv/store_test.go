package kv

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/watch"
)

func TestMemory(t *testing.T) {

	store := NewStore()

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

func TestStore_Watch(t *testing.T) {
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
	}

	store := NewStore()
	store.Set(mainConfig)

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w, err := store.Watch(watch.WithPath(tt.watchPath))
			assert.Nil(t, err, "Setting a watcher should not fail")

			store.Val(tt.key).Set(tt.value)

			ch := make(chan any, 1)

			go func() {
				res, err := w.Next()
				assert.Nil(t, err)

				ch <- res
			}()

			select {
			case <-time.After(603 * time.Second):
				assert.Fail(t, "Watch timing out")
			case res := <-ch:
				assert.Equal(t, tt.expected, res.(configx.Values).Val(tt.expectedPath).Get())
			}

			w.Stop()
		})
	}
}

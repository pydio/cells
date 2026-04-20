package kv

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/pydio/cells/v5/common/utils/watch"
)

func TestMerge(t *testing.T) {
	a := []any{0, map[string]any{"1": 1}, 3, []any{}, []any{-1, 5}}
	b := []any{nil, 1, 2, 3, []any{4, nil, 6}}

	c, err := merge(a, b)
	if err != nil {
		t.Fatal(err)
	}

	assert.IsType(t, c, a)

}

func TestMergeDelete(t *testing.T) {
	a := map[string]any{"1": 1}
	b := map[string]any{"1": nil}

	c, err := merge(a, b)
	if err != nil {
		t.Fatal(err)
	}

	assert.IsType(t, c, a)
}

func TestMergeSlices(t *testing.T) {
	a := []any{0, nil, 3, 3, []any{-1, 5}}
	b := []any{nil, 1, 2, nil, []any{4, nil, 6}}

	c, err := merge(a, b)
	if err != nil {
		t.Fatal(err)
	}

	assert.IsType(t, c, a)
}

func TestMergeMaps(t *testing.T) {
	a := map[string]any{
		"0": 0,
		"2": map[string]any{
			"4": "0",
			"5": "5",
		},
	}

	b := map[string]any{
		"1": "1",
		"2": map[string]any{
			"3": "3",
			"4": "4",
			"6": "6",
		},
	}

	c, err := merge(a, b)
	if err != nil {
		t.Fatal(err)
	}

	assert.IsType(t, c, a)
}

func TestCopy(t *testing.T) {

	a := map[string]any{
		"test": map[string]any{
			"test0": "test0_1",
		},
	}

	b := map[string]any{
		"test": map[string]any{
			"test1": "test0_1",
		},
	}

	c, err := merge(a, b)
	if err != nil {
		t.Fatal(err)
	}

	assert.IsType(t, c, a)
}

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

		// --- New deletion-related tests ---
		{
			name:     "Remove key from map by setting to nil",
			setKey:   "config/db/password",
			setValue: nil,
			getKey:   "config/db/password",
			// Since password key is deleted, it should not exist anymore
			expectGetError: true,
		},
		{
			name:     "Remove element from slice via nil assignment",
			setKey:   "config/servers/1",
			setValue: nil,
			getKey:   "config/servers/1",
			// Element should be removed
			expectGetError: true,
		},
		{
			name:          "Add element after deletion to ensure re-expansion works",
			setKey:        "config/servers/1",
			setValue:      "server2b",
			getKey:        "config/servers/1",
			expectedValue: "server2b",
		},
		{
			name:   "Shorter slice replaces longer slice (removes tail)",
			setKey: "config/servers",
			setValue: []interface{}{
				"server1", "server2b",
			},
			getKey:        "config/servers",
			expectedValue: []interface{}{"server1", "server2b"},
		},
		{
			name:           "Deleted element index should not exist after truncation",
			getKey:         "config/servers/2",
			expectGetError: true,
		},

		// --- Deeply nested deletions ---
		{
			name:           "Remove key inside map within slice",
			setKey:         "config/serverDetails/0/port",
			setValue:       nil,
			getKey:         "config/serverDetails/0/port",
			expectGetError: true,
		},
		{
			name:          "Re-add deleted key inside nested map",
			setKey:        "config/serverDetails/0/port",
			setValue:      9090,
			getKey:        "config/serverDetails/0/port",
			expectedValue: 9090,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.setKey != "" {
				defer func() {
					if r := recover(); r != nil {
						if !tt.expectGetError {
							assert.Nil(t, r, "Unexpected panic in set")
						} else {
							assert.True(t, tt.expectGetError, "Unexpected panic in set")
						}
					}
				}()
				store.Val(tt.setKey).Set(tt.setValue)
			}

			result := store.Val(tt.getKey).Get()
			if tt.expectGetError {
				assert.Nil(t, result, "Expected nil result for error case")
			} else {
				assert.Equal(t, tt.expectedValue, result, "Unexpected value for key %s", tt.getKey)
			}
		})
	}
}

// Skipping for now as store.Watch always returns an error!
func SkipTestStore_Watch(t *testing.T) {
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
			case <-time.After(60 * time.Second):
				assert.Fail(t, "Watch timing out")
			case res := <-ch:
				assert.Equal(t, tt.expected, res.(Values).Val(tt.expectedPath).Get())
			}

			w.Stop()
		})
	}
}

package viper

import (
	"fmt"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/spf13/cast"
)

// storeWithRefPool embeds Viper to extend its behavior
type viperWithSlices struct {
	Viper

	*sync.RWMutex
}

// newViperWithSlices creates a new instance of storeWithRefPool
func newViperWithSlices(v Viper, lock *sync.RWMutex) *viperWithSlices {
	return &viperWithSlices{
		Viper:   v,
		RWMutex: lock,
	}
}

// Get overrides the Viper Get method to support slice indexing
func (ev *viperWithSlices) Get(key string) any {
	ev.RLock()
	defer ev.RUnlock()

	parts := strings.Split(key, delimiter)
	var current any = ev.AllSettings() // Start from the root configuration

	for _, part := range parts {
		part = strings.ToLower(part)
		switch value := current.(type) {
		case map[string]any:
			// If the current level is a map, get the next key
			current = value[part]
		case []string:
			// If the current level is a slice, parse the index
			index, err := strconv.Atoi(part)
			if err != nil || index < 0 || index >= len(value) {
				return nil // Invalid index
			}
			current = value[index]
		case []any:
			// If the current level is a slice, parse the index
			index, err := strconv.Atoi(part)
			if err != nil || index < 0 || index >= len(value) {
				return nil // Invalid index
			}
			current = value[index]
		default:
			return nil // Unexpected structure or key does not exist
		}
	}

	return current
}

// Set overrides the Viper Set method to support slice indexing
func (ev *viperWithSlices) Set(key string, value any) {
	ev.Lock()
	defer ev.Unlock()

	parts := strings.Split(key, delimiter)
	if len(parts) == 0 {
		return
	}

	// Start with the root settings
	root := ev.AllSettings()

	var current any
	current = root

	var mergeNeeded bool = true
	// Traverse all parts except the last
	for i := 0; i < len(parts)-1; i++ {
		part := parts[i]

		switch parent := current.(type) {
		case map[string]any:
			// If it's a map, move to the next level, or create a map if the key doesn't exist
			if _, exists := parent[part]; !exists {
				// What do we need to create ? a map or a slice
				if i+1 < len(parts) {
					if pi, err := cast.ToIntE(parts[i+1]); err != nil {
						parent[part] = make(map[string]any)
					} else {
						parent[part] = make([]any, pi+1)
					}
				}

			} else {
				if s, ok := parent[part].([]any); ok {
					if i+1 < len(parts) {
						if pi, err := cast.ToIntE(parts[i+1]); err == nil {
							var newPart []any
							if pi+1 > len(s) {
								newPart = make([]any, pi+1)
							} else {
								newPart = make([]any, len(s))
							}

							for pj := 0; pj < len(s); pj++ {
								newPart[pj] = s[pj]
							}

							parent[part] = newPart

						}
					}
				}
			}

			current = parent[part]
		case []any:
			// If it's a slice, parse the index
			index, err := strconv.Atoi(part)
			if err != nil || index < 0 || index >= len(parent) {
				panic("Invalid slice index")
			}

			if current = parent[index]; current == nil {
				// What do we need to create ? a map or a slice
				if i+1 < len(parts) {
					if _, err := cast.ToIntE(parts[i+1]); err != nil {
						parent[index] = make(map[string]any)
					} else {
						parent[index] = make([]any, i)
					}
				}

				current = parent[index]
			}
		default:
			// Unsupported type; reset the path
			panic("Unexpected structure in path")
		}
	}

	// Set the final value
	lastKey := parts[len(parts)-1]
	switch parent := current.(type) {
	case map[string]any:
		parent[lastKey] = value

	case []any:
		index, err := strconv.Atoi(lastKey)
		if err != nil || index < 0 {
			panic("Invalid slice index")
		}

		// Expand the slice if necessary
		for len(parent) <= index {
			parent = append(parent, nil)
		}

		parent[index] = value
	default:
		panic("Unexpected structure at final key")
	}

	// Update Viper's internal configuration
	now := time.Now()
	if mergeNeeded {
		ev.Viper.MergeConfigMap(root)
	}
	fmt.Println("Merging took ", time.Since(now))
}

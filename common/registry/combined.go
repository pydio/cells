package registry

import (
	"errors"
)

var _ Registry = (*combinedRegistry)(nil)

type combinedRegistry struct {
	Registry
	next Registry
}

func NewCombinedRegistry(main Registry, next Registry) Registry {
	return &combinedRegistry{
		Registry: main,
		next:     next,
	}
}

func (c *combinedRegistry) Get(s string, option ...Option) (Item, error) {
	// Getting original
	if item, err := c.Registry.Get(s, option...); err == nil {
		return item, nil
	}

	// Getting next
	if item, err := c.next.Get(s, option...); err == nil {
		return item, nil
	}

	return nil, errors.New("no item found")
}

// Listing registry combined
func (c *combinedRegistry) List(option ...Option) ([]Item, error) {
	var items []Item

	// Listing original
	if ii, err := c.Registry.List(option...); err != nil {
		return nil, err
	} else {
		for _, i := range ii {
			items = append(items, i)
		}
	}

	// Listing next
	if ii, err := c.next.List(option...); err != nil {
		return nil, err
	} else {
		for _, i := range ii {
			items = append(items, i)
		}
	}

	return items, nil
}

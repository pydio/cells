package actions

import (
	"fmt"

	"github.com/pydio/cells/common/etl"
	"github.com/pydio/cells/common/etl/stores"
)

type etlAction struct {
	params    map[string]string
	leftType  string
	rightType string
}

func (c *etlAction) ProvidesProgress() bool {
	return true
}

func (c *etlAction) parseStores(params map[string]string) error {
	c.params = params
	if r, o := params["left"]; o {
		c.leftType = r
	} else if t, o2 := params["type"]; o2 {
		c.leftType = t
	} else {
		return fmt.Errorf("task sync user must take a left or type parameter")
	}
	if r, o := params["right"]; o {
		c.rightType = r
	} else {
		// Use local as default target
		c.rightType = "cells-local"
	}

	return nil
}

func (c *etlAction) initMerger() (*etl.Merger, error) {
	options := stores.CreateOptions(c.params)
	left, err := stores.LoadReadableStore(c.leftType, options)
	if err != nil {
		return nil, err
	}

	right, err := stores.LoadWritableStore(c.rightType, options)
	if err != nil {
		return nil, err
	}

	return etl.NewMerger(left, right, options.MergeOptions), nil
}
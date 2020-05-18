package actions

import (
	"context"
	"fmt"

	"github.com/pydio/cells/common/etl"
	"github.com/pydio/cells/common/etl/stores"
	"github.com/pydio/cells/common/proto/jobs"
)

type etlAction struct {
	params    map[string]string
	leftType  string
	rightType string
}

func (c *etlAction) ProvidesProgress() bool {
	return true
}

func (c *etlAction) ParseStores(params map[string]string) error {
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

func (c *etlAction) initMerger(ctx context.Context, input jobs.ActionMessage) (*etl.Merger, error) {
	options := stores.CreateOptions(ctx, c.params, input)
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

package viper

import (
	"errors"
	"fmt"
	"strings"

	diff "github.com/r3labs/diff/v3"

	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/watch"
)

type receiverWithStore struct {
	watch.Receiver
	configx.Values
}

func (r *receiverWithStore) Next() (any, error) {
	a, err := r.Receiver.Next()
	if err != nil {
		return nil, err
	}

	changes, ok := a.([]diff.Change)
	if !ok {
		return nil, errors.New("expected a diff change")
	}

	for _, op := range changes {
		if err := r.Values.Val(op.Path...).Set(op.To); err != nil {
			return nil, err
		}
	}

	return r.Values.Val(), nil
}

type receiverWithStoreChangesOnly struct {
	level int
	watch.Receiver
	configx.Values
}

func (r *receiverWithStoreChangesOnly) Next() (any, error) {
	a, err := r.Receiver.Next()
	if err != nil {
		return nil, err
	}

	changes, ok := a.([]diff.Change)
	if !ok {
		return nil, errors.New("expected a diff change")
	}

	fmt.Println("In the receiver, treating ", len(changes), "changes")

	for _, op := range changes {
		//fmt.Println("On", op.Path)
		switch op.Type {
		case diff.CREATE:
			if len(op.Path) > r.level {
				if err := r.Values.Val(diff.UPDATE).Val(op.Path...).Set(op.To); err != nil {
					return nil, err
				}
			} else {
				if err := r.Values.Val(diff.CREATE).Val(op.Path...).Set(op.To); err != nil {
					return nil, err
				}
			}
		case diff.DELETE:
			if len(op.Path) > r.level {
				if err := r.Values.Val(diff.UPDATE).Val(op.Path...).Set(nil); err != nil {
					return nil, err
				}
			} else {
				if err := r.Values.Val(diff.DELETE).Val(op.Path...).Set(op.From); err != nil {
					return nil, err
				}
			}
		case diff.UPDATE:
			if err := r.Values.Val(diff.UPDATE).Val(op.Path...).Set(op.To); err != nil {
				return nil, err
			}
		}
	}

	fmt.Println(r.Values.Val(diff.UPDATE).Val("server").Map())

	fmt.Println("In the receiver, sending back  ", len(r.Values.Val(diff.CREATE).Map()), len(r.Values.Val(diff.UPDATE).Map()), len(r.Values.Val(diff.DELETE).Map()))

	return r.Values.Val(), nil
}

type receiverWithPathSwitch struct {
	watch.Receiver

	pathFrom string
	pathTo   string
}

func (r *receiverWithPathSwitch) Next() (any, error) {
	a, err := r.Receiver.Next()
	if err != nil {
		return nil, err
	}

	changes, ok := a.([]diff.Change)
	if !ok {
		return nil, errors.New("expected a diff change")
	}

	var res []diff.Change
	for _, change := range changes {
		res = append(res, diff.Change{
			Type: change.Type,
			Path: strings.Split(strings.Replace(strings.Join(change.Path, "/"), r.pathFrom, r.pathTo, 1), "/"),
			From: change.From,
			To:   change.To,
		})
	}

	return res, nil
}

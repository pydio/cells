/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package proc

import (
	"context"
	"errors"
	sync2 "sync"
	"time"

	"github.com/pydio/cells/common/log"
	"go.uber.org/zap"

	"fmt"

	"github.com/pydio/cells/common/proto/tree"
	sync "github.com/pydio/cells/data/source/sync/lib/common"
	"github.com/pydio/cells/data/source/sync/lib/endpoints"
	"github.com/pydio/cells/data/source/sync/lib/filters"
)

type SourceDiff struct {
	Left         sync.PathSyncSource
	Right        sync.PathSyncSource
	MissingLeft  []*tree.Node
	MissingRight []*tree.Node
	Context      context.Context
}

func (diff *SourceDiff) FilterMissing(source sync.PathSyncSource, target sync.PathSyncTarget, in []*tree.Node, folders bool, nofilter bool) (out map[string]*filters.BatchedEvent) {

	var eventType sync.EventType
	if nofilter {
		eventType = sync.EventRemove
	} else {
		eventType = sync.EventCreate
	}
	out = make(map[string]*filters.BatchedEvent)
	for _, n := range in {
		if nofilter || !folders && n.IsLeaf() || folders && !n.IsLeaf() {
			eventInfo := sync.NodeToEventInfo(diff.Context, n.Path, n, eventType)
			be := &filters.BatchedEvent{
				Key:       n.Path,
				Node:      n,
				EventInfo: eventInfo,
				Source:    source,
				Target:    target,
			}
			out[n.Path] = be
		}
	}
	return out

}

func ComputeSourcesDiff(ctx context.Context, left sync.PathSyncSource, right sync.PathSyncSource, strong bool, statusChan chan filters.BatchProcessStatus) (diff *SourceDiff, err error) {

	diff = &SourceDiff{
		Left:    left,
		Right:   right,
		Context: ctx,
	}

	var rightSnapshot, leftSnapshot *endpoints.MemDB
	mainWg := &sync2.WaitGroup{}
	var err1, err2 error

	if right != nil {
		mainWg.Add(1)
		go func() {
			start := time.Now()
			rightSnapshot = endpoints.NewMemDB()
			defer func() {
				if statusChan != nil {
					statusChan <- filters.BatchProcessStatus{StatusString: fmt.Sprintf("[right] Snapshot loaded in %v - %s", time.Now().Sub(start), rightSnapshot.Stats())}
				}
				mainWg.Done()
			}()
			if statusChan != nil {
				statusChan <- filters.BatchProcessStatus{StatusString: "[right] Loading snapshot"}
			}
			wg := &sync2.WaitGroup{}
			throttle := make(chan struct{}, 15)
			err = right.Walk(func(path string, node *tree.Node, err error) {
				if sync.IsIgnoredFile(path) || len(path) == 0 {
					return
				}
				rightSnapshot.CreateNode(ctx, node, true)
				if sync.NodeRequiresChecksum(node) {
					wg.Add(1)
					go func() {
						throttle <- struct{}{}
						defer func() {
							<-throttle
							wg.Done()
						}()
						if e := left.ComputeChecksum(node); e != nil {
							log.Logger(ctx).Error("Error computing checksum for "+node.Path, zap.Error(e))
						}
					}()
				}
			})
			wg.Wait()
			if err != nil {
				err1 = err
			}
		}()
	}

	if left != nil {
		mainWg.Add(1)
		go func() {
			start := time.Now()
			leftSnapshot = endpoints.NewMemDB()
			defer func() {
				if statusChan != nil {
					statusChan <- filters.BatchProcessStatus{StatusString: fmt.Sprintf("[left] Snapshot loaded in %v - %s", time.Now().Sub(start), leftSnapshot.Stats())}
				}
				mainWg.Done()
			}()
			if statusChan != nil {
				statusChan <- filters.BatchProcessStatus{StatusString: "[left] Loading snapshot"}
			}
			wg := &sync2.WaitGroup{}
			throttle := make(chan struct{}, 15)
			err = left.Walk(func(path string, node *tree.Node, err error) {
				if sync.IsIgnoredFile(path) || len(path) == 0 {
					return
				}
				leftSnapshot.CreateNode(ctx, node, true)
				if sync.NodeRequiresChecksum(node) {
					wg.Add(1)
					go func() {
						throttle <- struct{}{}
						defer func() {
							<-throttle
							wg.Done()
						}()
						if e := left.ComputeChecksum(node); e != nil {
							log.Logger(ctx).Error("Error computing checksum for "+node.Path, zap.Error(e))
						}
					}()
				}
			})
			wg.Wait()
			if err != nil {
				err2 = err
			}
		}()
	}

	mainWg.Wait()
	if err1 != nil {
		return nil, err1
	}
	if err2 != nil {
		return nil, err2
	}

	//	log.Logger(ctx).Info("Snapshots", zap.Any("left", leftSnapshot), zap.Any("right", rightSnapshot))

	if statusChan != nil {
		statusChan <- filters.BatchProcessStatus{StatusString: "Now computing diff between snapshots"}
	}

	if leftSnapshot != nil {
		err = leftSnapshot.Walk(func(path string, node *tree.Node, err error) {
			if rightSnapshot == nil {
				diff.MissingRight = append(diff.MissingRight, node)
				return
			}
			otherNode, _ := rightSnapshot.LoadNode(ctx, path, node.IsLeaf())
			if otherNode == nil {
				diff.MissingRight = append(diff.MissingRight, node)
			} else if strong {
				if node.IsLeaf() && (!otherNode.IsLeaf() || node.Etag != otherNode.Etag) {
					diff.MissingRight = append(diff.MissingRight, node)
				}
				if !node.IsLeaf() && (otherNode.IsLeaf() || node.Uuid != otherNode.Uuid) {
					diff.MissingRight = append(diff.MissingRight, node)
				}
			}
		})
		if err != nil {
			return nil, err
		}
	}

	if rightSnapshot != nil {
		err = rightSnapshot.Walk(func(path string, node *tree.Node, err error) {
			if leftSnapshot == nil {
				diff.MissingLeft = append(diff.MissingLeft, node)
				return
			}
			dbNode, _ := leftSnapshot.LoadNode(ctx, path, node.IsLeaf())
			if dbNode == nil {
				diff.MissingLeft = append(diff.MissingLeft, node)
			} else if strong {
				if node.IsLeaf() && (!dbNode.IsLeaf() || node.Etag != dbNode.Etag) {
					diff.MissingRight = append(diff.MissingRight, node)
				}
				if !node.IsLeaf() && (dbNode.IsLeaf() || node.Uuid != dbNode.Uuid) {
					diff.MissingRight = append(diff.MissingRight, node)
				}
			}

		})
		if err != nil {
			return nil, err
		}
	}

	if statusChan != nil {
		statusChan <- filters.BatchProcessStatus{StatusString: fmt.Sprintf("Diff contents: missing left %v - missing right %v", len(diff.MissingLeft), len(diff.MissingRight))}
	}

	return diff, nil
}

func (diff *SourceDiff) String() string {
	output := ""
	output += "\n MissingLeft : "
	for _, node := range diff.MissingLeft {
		output += "\n " + node.Path
	}
	output += "\n MissingRight : "
	for _, node := range diff.MissingRight {
		output += "\n " + node.Path
	}
	return output
}

func (diff *SourceDiff) ToUnidirectionalBatch(direction string) (batch *filters.Batch, err error) {

	rightTarget, rightOk := interface{}(diff.Right).(sync.PathSyncTarget)
	leftTarget, leftOk := interface{}(diff.Left).(sync.PathSyncTarget)

	if direction == "left" && rightOk {
		batch = filters.NewBatch()
		batch.CreateFolders = diff.FilterMissing(diff.Left, rightTarget, diff.MissingRight, true, false)
		batch.CreateFiles = diff.FilterMissing(diff.Left, rightTarget, diff.MissingRight, false, false)
		batch.Deletes = diff.FilterMissing(diff.Left, rightTarget, diff.MissingLeft, false, true)
		return batch, nil
	} else if direction == "right" && leftOk {
		batch = filters.NewBatch()
		batch.CreateFolders = diff.FilterMissing(diff.Right, leftTarget, diff.MissingLeft, true, false)
		batch.CreateFiles = diff.FilterMissing(diff.Right, leftTarget, diff.MissingLeft, false, false)
		batch.Deletes = diff.FilterMissing(diff.Right, leftTarget, diff.MissingRight, false, true)
		return batch, nil
	}
	return nil, errors.New("Error while extracting unidirectional batch. Either left or right is not a sync target")

}

func (diff *SourceDiff) ToBidirectionalBatch(leftTarget sync.PathSyncTarget, rightTarget sync.PathSyncTarget) (batch *filters.BidirectionalBatch, err error) {

	leftBatch := filters.NewBatch()
	if rightTarget != nil {
		leftBatch.CreateFolders = diff.FilterMissing(diff.Left, rightTarget, diff.MissingRight, true, false)
		leftBatch.CreateFiles = diff.FilterMissing(diff.Left, rightTarget, diff.MissingRight, false, false)
	}

	rightBatch := filters.NewBatch()
	if leftTarget != nil {
		rightBatch.CreateFolders = diff.FilterMissing(diff.Right, leftTarget, diff.MissingLeft, true, false)
		rightBatch.CreateFiles = diff.FilterMissing(diff.Right, leftTarget, diff.MissingLeft, false, false)
	}

	batch = &filters.BidirectionalBatch{
		Left:  leftBatch,
		Right: rightBatch,
	}
	return batch, nil

}

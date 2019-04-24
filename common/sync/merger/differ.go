package merger

import (
	"context"
	"fmt"
	"sync"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

// ComputeDiff loads the diff by crawling the sources in parallel, filling up a Hash Tree and performing the merge
func ComputeDiff(ctx context.Context, left model.PathSyncSource, right model.PathSyncSource, statusChan chan BatchProcessStatus) (diff *Diff, err error) {

	lTree := NewTreeNode(&tree.Node{Path: "", Etag: "-1"})
	rTree := NewTreeNode(&tree.Node{Path: "", Etag: "-1"})
	var errs []error
	wg := &sync.WaitGroup{}

	for _, k := range []string{"left", "right"} {
		wg.Add(1)
		go func(logId string) {
			start := time.Now()
			h := ""
			defer func() {
				if statusChan != nil {
					statusChan <- BatchProcessStatus{StatusString: fmt.Sprintf("[%s] Snapshot loaded in %v - Root Hash is %s", logId, time.Now().Sub(start), h)}
				}
				wg.Done()
			}()
			if statusChan != nil {
				statusChan <- BatchProcessStatus{StatusString: fmt.Sprintf("[%s] Loading snapshot", logId)}
			}
			var err error
			if logId == "left" {
				if lTree, err = TreeNodeFromSource(left); err == nil {
					lTree.GetHash()
				}
			} else if logId == "right" {
				if rTree, err = TreeNodeFromSource(right); err == nil {
					rTree.GetHash()
				}
			}
			if err != nil {
				errs = append(errs, err)
			}
		}(k)
	}
	wg.Wait()
	if len(errs) > 0 {
		return nil, errs[0]
	}

	if statusChan != nil {
		statusChan <- BatchProcessStatus{StatusString: "Now computing diff between snapshots"}
	}
	//lTree.PrintOut()
	//rTree.PrintOut()
	treeMerge := &Diff{
		Left:    left,
		Right:   right,
		Context: ctx,
	}
	MergeNodes(lTree, rTree, treeMerge)
	log.Logger(ctx).Info("Diff Stats", zap.Any("s", treeMerge.Stats()))

	if statusChan != nil {
		statusChan <- BatchProcessStatus{StatusString: fmt.Sprintf("Diff contents: missing left %v - missing right %v", len(treeMerge.MissingLeft), len(treeMerge.MissingRight))}
	}
	return treeMerge, nil
}

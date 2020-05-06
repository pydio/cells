package s3

import (
	"sync"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
)

type input struct {
	path string
	info *S3FileInfo
}

type statBatcher struct {
	c       *Client
	pending []*input
	size    int
	walker  func(path string, info *S3FileInfo, node *tree.Node)
}

func (b *statBatcher) push(n *input) {
	b.pending = append(b.pending, n)
	if len(b.pending) >= b.size {
		b.flush()
	}
}

func (b *statBatcher) flush() {
	if len(b.pending) == 0 {
		return
	}

	process := make([]*input, len(b.pending))
	results := make([]*tree.Node, len(b.pending))

	process = append(b.pending)
	b.pending = b.pending[0:0]
	wg := &sync.WaitGroup{}
	wg.Add(len(process))
	t := time.Now()
	log.Logger(b.c.globalContext).Debug("Sending Loadnodes in parallel", zap.Int("n", b.size))
	for i, in := range process {
		go func(idx int, input *input) {
			defer wg.Done()
			if tN, e := b.c.loadNode(b.c.globalContext, input.path, !input.info.isDir); e == nil {
				results[idx] = tN
			} else {
				results[idx] = nil
			}
		}(i, in)
	}
	wg.Wait()
	log.Logger(b.c.globalContext).Debug("Finished sending Loadnodes in parallel", zap.Duration("d", time.Now().Sub(t)))
	for i, n := range results {
		if n == nil {
			continue
		}
		b.walker(process[i].path, process[i].info, n)
	}

}

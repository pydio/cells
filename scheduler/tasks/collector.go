package tasks

import (
	"context"
	"sync"

	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

type collector struct {
	*sync.WaitGroup
	ctx               context.Context
	id                string
	cm                chan *jobs.ActionMessage
	started, finished bool
	done, final       chan bool
	coll              []*jobs.ActionMessage
}

func newCollector(ctx context.Context) *collector {
	c := &collector{
		ctx:       ctx,
		id:        uuid.New()[:6],
		WaitGroup: &sync.WaitGroup{},
		cm:        make(chan *jobs.ActionMessage, 1000),
		done:      make(chan bool, 1),
		final:     make(chan bool, 1),
	}

	//fmt.Println("Setup Collector " + c.id)

	go func() {
		for {
			select {
			case <-c.ctx.Done():
				c.finished = true
				//fmt.Printf("Collector %s interrupted by context with %d elements\n", c.id, len(c.coll))
				close(c.cm)
				close(c.final)
				return
			case <-c.done:
				c.finished = true
				//fmt.Printf("Collector %s finished with %d elements\n", c.id, len(c.coll))
				close(c.cm)
				close(c.final)
				return
			case msg := <-c.cm:
				c.coll = append(c.coll, msg)
			}
		}
	}()
	return c
}

func (c *collector) WaitMsg() *jobs.ActionMessage {
	<-c.final
	// MERGE NOW
	out := &jobs.ActionMessage{}
	for _, m := range c.coll {
		if m.Event != nil {
			out.Event = m.Event
		}
		out.Users = append(out.Users, m.Users...)
		out.Roles = append(out.Roles, m.Roles...)
		out.Acls = append(out.Acls, m.Acls...)
		out.Activities = append(out.Activities, m.Activities...)
		out.Nodes = append(out.Nodes, m.Nodes...)
		out.DataSources = append(out.DataSources, m.DataSources...)
		out.Workspaces = append(out.Workspaces, m.Workspaces...)

		out.OutputChain = append(out.OutputChain, m.OutputChain...)
	}
	return out
}

func (c *collector) autoStart() {
	if c.started {
		return
	}
	//fmt.Println("AutoStart", c.id)
	c.started = true
	go func() {
		c.Wait()
		close(c.done)
	}()
}

func (c *collector) Merge(i *jobs.ActionMessage) {
	//fmt.Println("Merge on ", c.id, c.finished)
	if c.finished {
		return
	}
	c.autoStart()
	c.cm <- i
}

func (c *collector) Add(delta int) {
	//fmt.Println("Add ", delta, c.id, c.finished)
	if c.finished {
		return
	}
	c.autoStart()
	//fmt.Println("ADDING", delta)
	c.WaitGroup.Add(delta)
}

func (c *collector) Done() {
	//fmt.Println("Done ", c.id, c.finished)
	if c.finished {
		return
	}
	//fmt.Println("REMOVING 1")
	c.WaitGroup.Done()
}

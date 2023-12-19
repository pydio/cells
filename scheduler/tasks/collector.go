package tasks

import (
	"context"
	"github.com/pydio/cells/v4/common/log"
	"strings"
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
	mergeVars := make(map[string]interface{})
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

		// Handle ArrayMerge Variables, only load "Merge:XXX" vars
		var mKeys []string
		for _, k := range m.StackedVarsKeys() {
			if strings.HasPrefix(k, "Merge:") {
				mKeys = append(mKeys, k)
			}
		}
		if len(mKeys) > 0 {
			mVars := m.StackedVars(mKeys...)
			for k, v := range mVars {
				mergeKey := k
				k = strings.TrimPrefix(k, "Merge:")
				var jsonPath string
				if strings.Contains(k, ":") {
					parts := strings.Split(k, ":")
					k = parts[0]
					jsonPath = parts[1]
					if jsonPath != "" && jobs.JSONPathSelector == nil {
						log.TasksLogger(c.ctx).Warn("No JSONPathSelector found, variable 'Merge:" + k + "' will be merged as is")
						jsonPath = ""
					}
				}
				var sl []interface{}
				if mv, o := mergeVars[k]; o {
					if ms, ok := mv.([]interface{}); ok {
						sl = ms
					} else {
						log.TasksLogger(c.ctx).Warn("Merging variable 'Merge:" + k + "', current value is not a slice, skipping")
						continue
					}
				} else {
					if jsonPath != "" {
						log.TasksLogger(c.ctx).Debug("Merging contents into a slice " + k + " using JSONPath selector")
					} else {
						log.TasksLogger(c.ctx).Debug("Merging contents into a slice " + k)
					}
				}
				if jsonPath != "" { // JSONPathSelector != nil checked above
					if list, er := jobs.JSONPathSelector(c.ctx, map[string]interface{}{"Data": v}, jsonPath); er == nil {
						for _, l := range list {
							sl = append(sl, l)
						}
					} else {
						log.TasksLogger(c.ctx).Warn("Merging variable 'Merge:" + k + "' with JSONPath " + jsonPath + " failed, input data is passed as $.Data")
					}
				} else {
					sl = append(sl, v)
				}
				mergeVars[k] = sl

				// Remove initial key from OutputChain - clone map to avoid direct write access to .Vars
				var i int
				for i = len(out.OutputChain) - 1; i >= 0; i-- {
					o := out.OutputChain[i]
					if o.Vars == nil {
						continue
					}
					if _, here := o.Vars[mergeKey]; !here {
						continue
					}
					vv := make(map[string]string, len(o.Vars)-1)
					for name, value := range o.Vars {
						if name != mergeKey {
							vv[name] = value
						}
					}
					o.Vars = vv
					break
				}
			}
		}
		// Append merged vars to LastOutput or new one
		if len(mergeVars) > 0 {
			if lo := out.GetLastOutput(); lo != nil {
				for k, v := range mergeVars {
					lo.SetVar(k, v)
				}
			} else {
				o := &jobs.ActionOutput{}
				for k, v := range mergeVars {
					o.SetVar(k, v)
				}
				out.OutputChain = append(out.OutputChain, o)
			}
		}
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

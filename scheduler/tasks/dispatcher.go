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

package tasks

import (
	"context"
	"fmt"
	"math"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/proto/chat"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/telemetry/metrics"
	"github.com/pydio/cells/v4/common/utils/propagator"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

const (
	// DefaultMaximumWorkers is set to 20.
	DefaultMaximumWorkers = 20
)

type RunnerFunc func(queue chan RunnerFunc)

// Dispatcher orchestrates the jobs by dispatching work to available workers.
type Dispatcher struct {
	// A pool of workers channels that are registered with the dispatcher
	fifo       broker.AsyncQueue
	fifoCancel context.CancelFunc
	fifoQueue  chan RunnerFunc
	fifoRemove func() (bool, error)

	runtime    context.Context
	jobQueue   chan RunnerFunc
	workerPool chan chan RunnerFunc
	maxWorker  int
	tags       map[string]string
	active     int
	activeChan chan int
	quit       chan bool
}

// NewDispatcher creates and initialises a new Dispatcher with this amount of workers.
func NewDispatcher(rootCtx context.Context, maxWorkers int, job *jobs.Job, tags map[string]string) *Dispatcher {
	pool := make(chan chan RunnerFunc, maxWorkers)
	jobQueue := make(chan RunnerFunc)
	d := &Dispatcher{
		workerPool: pool,
		maxWorker:  maxWorkers,
		jobQueue:   jobQueue,
		tags:       tags,
		activeChan: make(chan int, 100),
		quit:       make(chan bool, 1),
	}

	if job.AutoClean {
		log.Logger(rootCtx).Debug("Starting AutoClean job " + job.ID + " without FIFO")
		return d
	}

	var mgr manager.Manager
	ctx, can := context.WithCancel(rootCtx)
	if !propagator.Get(rootCtx, manager.ContextKey, &mgr) {
		can()
		log.Logger(rootCtx).Warn("No manager found when creating Dispatcher for " + job.ID + ", starting without FIFO")
	}

	d.fifoQueue = make(chan RunnerFunc)
	d.fifoCancel = can
	var er error

	data := map[string]interface{}{"name": "jobs", "prefix": job.ID}
	d.fifo, d.fifoRemove, er = mgr.GetQueue(ctx, "persisted", data, "job-"+job.ID+"-"+uuid.New()[:12], d.Opener(rootCtx, job, d.fifoQueue, jobQueue))

	if er != nil {
		can()
		close(d.fifoQueue)
		d.fifoQueue = nil
		d.fifoCancel = nil
		log.Logger(rootCtx).Warn("Cannot open fifo for dispatcher - job "+job.ID+", this will run without queue", zap.Error(er))
	}

	return d
}

func (d *Dispatcher) Opener(rootCtx context.Context, job *jobs.Job, queues ...chan RunnerFunc) broker.OpenWrapper {
	return func(q broker.AsyncQueue) (broker.AsyncQueue, error) {
		return q, q.Consume(func(eventCtx context.Context, mm ...broker.Message) {
			for _, msg := range mm {
				var event interface{}

				//eventCtx = propagator.ForkContext(context.Background(), rootCtx)

				tce := &tree.NodeChangeEvent{}
				ice := &idm.ChangeEvent{}
				jte := &jobs.JobTriggerEvent{}
				ce := &chat.ChatEvent{}
				if ctU, e := msg.Unmarshal(eventCtx, tce); e == nil {
					event, eventCtx = tce, ctU
				} else if ctU, e = msg.Unmarshal(eventCtx, ice); e == nil {
					event, eventCtx = ice, ctU
				} else if ctU, e = msg.Unmarshal(eventCtx, jte); e == nil {
					event, eventCtx = jte, ctU
				} else if ctU, e = msg.Unmarshal(eventCtx, ce); e == nil {
					event, eventCtx = ce, ctU
				} else {
					fmt.Println("Cannot unmarshall msg data to any known event type")
					continue
				}

				// Copy incoming info while keeping root cancellation
				eventCtx = propagator.ForkContext(eventCtx, rootCtx)
				task := NewTaskFromEvent(eventCtx, job, event)
				task.Queue(queues...)
			}
		})
	}
}

func (d *Dispatcher) Queue() chan RunnerFunc {
	return d.jobQueue
}

// Run simply starts the N workers of this dispacher.
func (d *Dispatcher) Run() {
	// starting n number of workers
	var workers []Worker

	for i := 0; i < d.maxWorker; i++ {
		worker := NewWorker(d.workerPool, d.jobQueue, d.activeChan, d.tags)
		worker.Start()

		workers = append(workers, worker)
	}

	g := metrics.TaggedHelper(d.tags).Gauge("activeWorkers", "Number of concurrent workers currently running in scheduler")
	t := time.NewTicker(500 * time.Millisecond)
	go func() {
		for {
			select {
			case <-t.C:
				g.Update(math.Abs(float64(d.active)))
			case <-d.quit:
				t.Stop()
				return
			}
		}
	}()

	if d.fifoQueue != nil {
		go func() {
			for {
				select {
				case jobImpl := <-d.fifoQueue:
					// a jobs request has been received
					// try to obtain a worker job channel that is available.
					// this will block until a worker is idle
					jobChannel := <-d.workerPool
					// dispatch the job to the worker job channel
					jobChannel <- jobImpl
				case <-d.quit:
					close(d.fifoQueue)
					r, e := d.fifoRemove()
					if e == nil && r {
						fmt.Println("Remove fifo from queue pool")
					}
					return
				}
			}
		}()
	}
	go func() {
		for {
			select {
			case a := <-d.activeChan:
				d.active += a
				//g.Update(math.Abs(float64(d.active)))
			case jobImpl := <-d.jobQueue:
				// A sub-task request has been received
				go func(job RunnerFunc) {
					jobChannel := <-d.workerPool
					jobChannel <- job
				}(jobImpl)
			case <-d.quit:
				for _, worker := range workers {
					worker.Stop()
				}
				close(d.activeChan)
				close(d.jobQueue)
				return
			}
		}
	}()
}

// Stop sends a quit signal to all workers and the main dispatcher
func (d *Dispatcher) Stop() {
	if d.fifoCancel != nil {
		d.fifoCancel()
		d.fifoCancel = nil
	}
	close(d.quit)
}

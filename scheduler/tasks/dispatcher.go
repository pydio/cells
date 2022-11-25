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
	"github.com/pydio/cells/v4/common/service/metrics"
	"math"
)

const (
	// DefaultMaximumWorkers is set to 20.
	DefaultMaximumWorkers = 20
)

type RunnerFunc func(queue chan RunnerFunc)

// Dispatcher orchestrates the jobs by dispatching work to available workers.
type Dispatcher struct {
	// A pool of workers channels that are registered with the dispatcher
	jobQueue   chan RunnerFunc
	workerPool chan chan RunnerFunc
	maxWorker  int
	tags       map[string]string
	active     int
	activeChan chan int
	quit       chan bool
}

// NewDispatcher creates and initialises a new Dispatcher with this amount of workers.
func NewDispatcher(maxWorkers int, tags map[string]string) *Dispatcher {
	pool := make(chan chan RunnerFunc, maxWorkers)
	jobQueue := make(chan RunnerFunc)
	return &Dispatcher{
		workerPool: pool,
		maxWorker:  maxWorkers,
		jobQueue:   jobQueue,
		tags:       tags,
		activeChan: make(chan int, 100),
		quit:       make(chan bool, 1),
	}
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

	g := metrics.GetMetrics().Tagged(d.tags).Gauge("activeWorkers")

	go func() {
		for {
			select {
			case a := <-d.activeChan:
				d.active += a
				g.Update(math.Abs(float64(d.active)))
			case jobImpl := <-d.jobQueue:
				// a jobs request has been received
				go func(job RunnerFunc) {
					// try to obtain a worker job channel that is available.
					// this will block until a worker is idle
					jobChannel := <-d.workerPool
					// dispatch the job to the worker job channel
					jobChannel <- job
				}(jobImpl)
			case <-d.quit:
				for _, worker := range workers {
					worker.Stop()
				}
				return
			}
		}
	}()
}

// Stop sends a quit signal to all workers and the main dispatcher
func (d *Dispatcher) Stop() {
	d.quit <- true
}

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

const (
	// DefaultMaximumWorkers is set to 20.
	DefaultMaximumWorkers = 20
)

// Dispatcher orchestrates the jobs by dispatching work to available workers.
type Dispatcher struct {
	// A pool of workers channels that are registered with the dispatcher
	JobQueue   chan Runnable
	WorkerPool chan chan Runnable
	maxWorker  int
}

// NewDispatcher creates and initialises a new Dispatcher with this amount of workers.
func NewDispatcher(maxWorkers int) *Dispatcher {
	pool := make(chan chan Runnable, maxWorkers)
	jobQueue := make(chan Runnable)
	return &Dispatcher{
		WorkerPool: pool,
		maxWorker:  maxWorkers,
		JobQueue:   jobQueue,
	}
}

// Run simply starts the N workers of this dispacher.
func (d *Dispatcher) Run() {
	// starting n number of workers
	for i := 0; i < d.maxWorker; i++ {
		worker := NewWorker(d.WorkerPool, d.JobQueue)
		worker.Start()
	}

	go d.dispatch()
}

// Stop sends a quit signal to all workers. NOT YET IMPLEMENTED
func (d *Dispatcher) Stop() {
	// TODO
	// Use a signal to send Quit to all workers
}

func (d *Dispatcher) dispatch() {
	for {
		select {
		case jobImpl := <-d.JobQueue:
			// a jobs request has been received
			go func(job Runnable) {
				// try to obtain a worker job channel that is available.
				// this will block until a worker is idle
				jobChannel := <-d.WorkerPool

				// dispatch the job to the worker job channel
				jobChannel <- job
			}(jobImpl)
		}
	}
}

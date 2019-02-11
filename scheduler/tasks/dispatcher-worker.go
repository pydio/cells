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
	"github.com/pydio/cells/common/log"
)

var (
	RC int
)

// Worker represents the worker that executes the jobs.
type Worker struct {
	WorkerPool chan chan Runnable
	JobChannel chan Runnable
	quit       chan bool
	JobReQueue chan Runnable
	activeChan chan int
	tags       map[string]string
}

// NewWorker creates and configures a new worker.
func NewWorker(workerPool chan chan Runnable, requeue chan Runnable, activeChan chan int, tags map[string]string) Worker {
	return Worker{
		WorkerPool: workerPool,
		JobChannel: make(chan Runnable),
		JobReQueue: requeue,
		tags:       tags,
		activeChan: activeChan,
		quit:       make(chan bool)}
}

// Start method starts the run loop for the worker, listening for a quit channel in
// case we need to stop it.
func (w Worker) Start() {
	go func() {
		for {
			// register the current worker into the worker queue.
			w.WorkerPool <- w.JobChannel

			select {
			case runnable := <-w.JobChannel:
				// we have received a work request.
				w.activeChan <- 1
				err := runnable.RunAction(w.JobReQueue)
				// TODO : do something with errors
				if err != nil {
					log.Logger(runnable.Context).Error("cannot run action " + runnable.ID + ": " + err.Error())
				}
				w.activeChan <- -1
				//log.Logger(runnable.Context).Info("Runnable in dispatcher: Finished", zap.Int("RC", RC), zap.String("runnable", runnable.ID))

			case <-w.quit:
				// we have received a signal to stop
				return
			}
		}
	}()
}

// Stop signals the worker to stop listening for work requests.
func (w Worker) Stop() {
	go func() {
		w.quit <- true
	}()
}

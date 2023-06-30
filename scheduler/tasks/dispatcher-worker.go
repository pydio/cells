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

import "fmt"

// Worker represents the worker that executes the jobs.
type Worker struct {
	workerPool chan chan RunnerFunc
	jobChannel chan RunnerFunc
	quit       chan bool
	jobRequeue chan RunnerFunc
	activeChan chan int
	tags       map[string]string
}

// NewWorker creates and configures a new worker.
func NewWorker(workerPool chan chan RunnerFunc, requeue chan RunnerFunc, activeChan chan int, tags map[string]string) Worker {
	return Worker{
		workerPool: workerPool,
		jobChannel: make(chan RunnerFunc),
		jobRequeue: requeue,
		tags:       tags,
		activeChan: activeChan,
		quit:       make(chan bool)}
}

// Start method starts the run loop for the worker, listening for a quit channel in
// case we need to stop it.
func (w Worker) Start() {
	go func() {
		defer func() {
			recover() // ignore send on close
		}()
		for {
			// register the current worker into the worker queue.
			w.workerPool <- w.jobChannel

			select {
			case runnerFunc := <-w.jobChannel:
				// we have received a work request.
				select {
				case w.activeChan <- 1:
				default:
					fmt.Println("[debug] dispatcher-worker could not update activeChan value +1")
				}
				//runnable.RunAction(w.jobRequeue)
				runnerFunc(w.jobRequeue)
				select {
				case w.activeChan <- -1:
				default:
					fmt.Println("[debug] dispatcher-worker could not update activeChan value -1")
				}
			case <-w.quit:
				// we have received a signal to stop
				close(w.jobChannel)
				return
			}
		}
	}()
}

// Stop signals the worker to stop listening for work requests.
func (w Worker) Stop() {
	go func() {
		close(w.quit)
	}()
}

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

package registry

import (
	"fmt"
	"sync"
	"time"
)

// Result of a Watch Message
type Result struct {
	Action  string
	Service Service
}

// Watcher defines the functions used to watch the registry
type Watcher interface {
	Next() (*Result, error)
	Stop()
}

type watcher struct {
	c chan *Result
	s chan bool
}

var (
	watching      bool
	watchersMutex = &sync.Mutex{}
	watchers      []*watcher
)

func watch() {
	watching = true

	go func() {
		current, _ := ListRunningServices()

		tick := time.Tick(Default.Options().PollInterval)

		for {
			select {

			case <-tick:
				var wg sync.WaitGroup
				running, err := ListRunningServices()
				if err != nil {
					continue
				}

				// retrieve the list of services that have started
				wg.Add(1)
				go func() {
					defer wg.Done()

					for _, r := range running {
						found := false
						for _, c := range current {
							if c.Name() == r.Name() {
								found = true
								break
							}
						}

						if !found {
							fmt.Println("We have a starter")
							// WE HAVE A NEW STARTER
							send(&Result{
								Action:  "started",
								Service: r,
							})
						}
					}
				}()

				// retrieve the list of services that have stopped
				wg.Add(1)
				go func() {
					defer wg.Done()

					for _, c := range current {
						found := false
						for _, r := range running {
							if c.Name() == r.Name() {
								found = true
								break
							}
						}
						if !found {
							// WE HAVE A NEW STOPPER
							send(&Result{
								Action:  "stopped",
								Service: c,
							})
						}
					}
				}()

				wg.Wait()

				// retrieve the list of services that have stopped
				current = running
			}
		}
	}()
}

func send(res *Result) {
	watchersMutex.Lock()
	defer watchersMutex.Unlock()

	for _, w := range watchers {
		w.c <- res
	}
}

func newWatcher() Watcher {
	if !watching {
		go watch()
	}

	c := make(chan *Result, 1)
	s := make(chan bool)

	w := &watcher{
		c: c,
		s: s,
	}

	watchersMutex.Lock()
	defer watchersMutex.Unlock()
	watchers = append(watchers, w)

	return w
}

func (w *watcher) Next() (*Result, error) {
	for {
		select {
		case res := <-w.c:
			return res, nil
		case <-w.s:
			return nil, fmt.Errorf("EOF")
		}
	}
}

func (w *watcher) Stop() {
	select {
	case w.s <- true:
	default:
	}
}

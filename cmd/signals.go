/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

// +build !windows

package cmd

import (
	"fmt"
	"os"
	"os/signal"
	"path/filepath"
	"runtime/pprof"
	"strings"
	"syscall"
	"time"

	"github.com/micro/go-micro/broker"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/registry"

	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
)

func handleSignals() {
	c := make(chan os.Signal, 1)

	// SIGUSR1 does not compile on windows. Use direct value syscall.Signal instead
	// signal.Notify(c, syscall.SIGINT, syscall.SIGHUP, syscall.SIGUSR1, syscall.SIGTERM, syscall.SIGSTOP)
	signal.Ignore()
	signal.Notify(c)

	go func() {
		for sig := range c {
			switch sig {
			case syscall.SIGTERM:
				fallthrough
			case syscall.SIGINT:
				// Start services that have not been deregistered via flags and filtering.
				for _, service := range allServices {
					service.Stop()
				}

				// Stopping the main context will trigger the stop of all services
				log.Info("Cancelling main context")
				cancel()

				log.Info("Disconnecting broker")
				// Disconnecting the broker so that we are not flooded with messages
				broker.Disconnect()
			case syscall.SIGUSR1, syscall.SIGUSR2:

				if !profiling {

					serviceMeta := registry.BuildServiceMeta()
					startTags := strings.ReplaceAll(serviceMeta["start"], ",", "-")
					startTags = strings.ReplaceAll(startTags, ":", "-")
					if startTags == "" {
						startTags = "main-process"
					}
					targetDir := filepath.Join(config.ApplicationWorkingDir(config.ApplicationDirLogs), "profiles", startTags)
					os.MkdirAll(targetDir, 0755)
					tStamp := time.Now().Format("2006-01-02T15:04:05")

					if sig == syscall.SIGUSR1 { // SIGUSR2 will NOT write to Stdout
						fmt.Printf("[Received SIGUSR1] Starting profiling session for process %d\n", os.Getpid())
						pprof.Lookup("goroutine").WriteTo(os.Stdout, 1)
					}

					if routinesFile, err := os.OpenFile(filepath.Join(targetDir, tStamp+"-goroutines"), os.O_WRONLY|os.O_CREATE, 0755); err == nil {
						pprof.Lookup("goroutine").WriteTo(routinesFile, 1)
						routinesFile.Close()
					}

					if fheap, err := os.OpenFile(filepath.Join(targetDir, tStamp+"-heap-profile"), os.O_WRONLY|os.O_CREATE, 0755); err == nil {
						pprof.WriteHeapProfile(fheap)
						fheap.Close()
					}

					if fcpu, err := os.OpenFile(filepath.Join(targetDir, tStamp+"-cpu-profile"), os.O_WRONLY|os.O_CREATE, 0755); err == nil {
						pprof.StartCPUProfile(fcpu)
						profile = fcpu
						profiling = true
					}
					// Close profiling session after 30s if user forgot to send a second call
					go func(print bool) {
						<-time.After(20 * time.Second)
						if profiling {
							if print {
								fmt.Printf("Profiling session dumped to %s for process %d\n", targetDir, os.Getpid())
							}
							pprof.StopCPUProfile()
							if err := profile.Close(); err != nil {
								log.Fatal("Cannot close cpu profile", zap.Error(err))
							}
							profiling = false
						}
					}(sig == syscall.SIGUSR1)

				} else {

					pprof.StopCPUProfile()
					if err := profile.Close(); err != nil {
						log.Fatal("Cannot close cpu profile", zap.Error(err))
					}
					profiling = false
				}

			case syscall.SIGHUP:
				// Stop all services
				for _, service := range allServices {
					if service.RequiresFork() && !IsFork {
						// Stopping here would kill the command and prevent proper de-registering of service
						// Signal will be passed along and the fork will stop by itself.
						continue
					}

					service.Stop()

					service.Start(ctx)
				}
			}
		}
	}()
}

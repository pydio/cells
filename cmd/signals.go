// +build !windows

package cmd

import (
	"io/ioutil"
	"os"
	"os/signal"
	"runtime/pprof"
	"syscall"
	"time"

	"github.com/micro/go-micro/broker"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
)

func handleSignals() {
	c := make(chan os.Signal, 1)

	// SIGUSR1 does not compile on windows. Use direct value syscall.Signal instead
	signal.Notify(c, syscall.SIGINT, syscall.SIGHUP, syscall.SIGUSR1, syscall.SIGTERM)

	go func() {
		for sig := range c {
			switch sig {
			case syscall.SIGINT:

				log.Info("Disconnecting broker")
				// Disconnecting the broker so that we are not flooded with messages
				broker.Disconnect()

				log.Info("Stopping all services")
				// Stop all services
				for _, service := range allServices {
					service.Stop()
				}

				log.Info("Exiting")
				<-time.After(2 * time.Second)
				os.Exit(0)

			case syscall.SIGUSR1:
				pprof.Lookup("goroutine").WriteTo(os.Stdout, 1)

				if !profiling {
					f, err := ioutil.TempFile("/tmp", "pydio-cpu-profile-")
					if err != nil {
						log.Fatal("Cannot create cpu profile", zap.Error(err))
					}

					pprof.StartCPUProfile(f)
					profile = f
					profiling = true

					fheap, err := ioutil.TempFile("/tmp", "pydio-cpu-heap-")
					if err != nil {
						log.Fatal("Cannot create heap profile", zap.Error(err))
					}
					pprof.WriteHeapProfile(fheap)
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
					if service.Name() == "nats" {
						continue
					}
					service.Stop()
				}

				initServices()

				// Start all services
				for _, service := range allServices {
					if service.Name() == "nats" {
						continue
					}
					service.Start()
				}
			}
		}
	}()
}

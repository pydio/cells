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

// Package main provides a command line version of sync
package main

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"log"
	"net/url"
	"os"
	"os/signal"
	"runtime"
	"strings"
	"sync"
	"syscall"

	"github.com/pydio/cells/data/source/sync/lib/common"
	"github.com/pydio/cells/data/source/sync/lib/endpoints"
	"github.com/pydio/cells/data/source/sync/lib/proc"
	"github.com/pydio/cells/data/source/sync/lib/task"
)

// Parse an argument to create a Sync Endpoint
// Expected format can be
//   + fs:///Path/to/file
//   + s3://apikey:secret@host:port/bucket/folder
//   + db://
// Resulting examples
//  source := endpoints.NewFSClient("/Users/charles/tmp/source")
//  source := endpoints.NewS3Client("127.0.0.1:9001", "minio", "miniostorage", "test", watchPath)
//  source := endpoints.NewMemDB()

func parseUrl(urlArg string, otherArgs []string) (endpoint common.Endpoint, e error) {
	u, e := url.Parse(urlArg)
	if e != nil {
		return nil, e
	}
	if u.Scheme == "fs" {
		path := u.Path
		if runtime.GOOS == "windows" {
			parts := strings.Split(path, "/")
			path = parts[1] + ":/" + strings.Join(parts[2:], "/")
		}
		return endpoints.NewFSClient(path)
	} else if u.Scheme == "db" {
		return endpoints.NewMemDB(), nil
	} else if u.Scheme == "s3" || u.Scheme == "s3mac" {
		fullPath := u.Path
		parts := strings.Split(fullPath, "/")
		bucket := parts[1]
		parts = parts[2:]
		rootPath := strings.Join(parts, "/")
		if u.User == nil {
			return nil, errors.New("Please provide API Keys and Secret in URL")
		}
		password, _ := u.User.Password()
		log.Print(u.Host, "-", u.User.Username(), "-", password, "-", bucket, "-", rootPath)
		// FS watch ?
		if len(otherArgs) == 4 {
			fsRootPath := otherArgs[3]
			client, err := endpoints.NewS3ClientFSWatch(context.Background(), u.Host, u.User.Username(), password, bucket, rootPath, fsRootPath)
			if err != nil {
				return nil, err
			}
			if u.Scheme == "s3mac" {
				client.ServerRequiresNormalization = true
			}
			return client, nil
		} else {
			client, err := endpoints.NewS3Client(context.Background(), u.Host, u.User.Username(), password, bucket, rootPath)
			if err != nil {
				return nil, err
			}
			if u.Scheme == "s3mac" {
				client.ServerRequiresNormalization = true
			}
			return client, nil
		}
	} else {
		return nil, errors.New("Unsupported scheme " + u.Scheme)
	}
}

func parseArgs(args []string) (common.PathSyncSource, common.PathSyncTarget) {
	if len(args) < 3 {
		log.Fatal("Please enter at least two arguments")
	}
	source, e1 := parseUrl(args[1], args)
	target, e2 := parseUrl(args[2], args)
	if e1 != nil || e2 != nil {
		log.Fatalf("Cannot parse urls %v, %v", e1, e2)
	}

	return interface{}(source).(common.PathSyncSource), interface{}(target).(common.PathSyncTarget)
}

func main() {

	ctx := context.Background()
	source, target := parseArgs(os.Args)

	trapCh := SignalTrap(os.Interrupt, syscall.SIGTERM)
	commandLineCh := make(chan bool)
	resyncCh := make(chan bool)

	// Initialize.. waitgroup to track the go-routine.
	wg := sync.WaitGroup{}

	// Increment wait group to wait subsequent routine.
	wg.Add(1)

	testInfo := make(chan string)
	testHeader := make(chan string)
	dbEvents := make(chan endpoints.DBEvent)
	processorEvents := make(chan common.ProcessorEvent)

	syncTask := task.NewSync(ctx, source, target)
	syncTask.Start(ctx)
	syncTask.Resync(ctx, false, nil, nil)

	// Start routine to watching on events.
	go func() {
		defer wg.Done()

		// Wait for all events.
		for {
			select {
			case <-trapCh:
				// Signal received we are done.
				log.Println("Closing")
				syncTask.Shutdown()
				return
			case <-commandLineCh:
				// Signal received we are done.
				log.Println("Closing!")
				syncTask.Shutdown()
				return
			case <-resyncCh:
				syncTask.Resync(ctx, false, nil, nil)
			case dbEvent := <-dbEvents:
				log.Printf("[DB] %v", dbEvent)
			case processorEvent := <-processorEvents:
				if processorEvent.Type == "merger:end" {
					log.Println(processorEvent.Type)
					diff, err := proc.ComputeSourcesDiff(ctx, source, interface{}(target).(common.PathSyncSource), true, nil)
					if err != nil {
						log.Println("Error while computing sources diff", err)
					} else if len(diff.MissingLeft) > 0 || len(diff.MissingRight) > 0 {
						log.Println(diff)
						log.Printf("%v %v", len(diff.MissingLeft), len(diff.MissingRight))
					} else {
						log.Println(" -- Diff is successful")
					}
				} else {
					//log.Println(processorEvent.Batch)
				}
			case testString := <-testInfo:
				log.Println(" * " + testString)
			case testString := <-testHeader:
				log.Println("")
				log.Println("")
				log.Println(testString)
			}

		}
	}()

	go func() {
		fmt.Println("Type 'exit' and enter or Ctrl+C to quit, type 'resync' and enter to launch a resync.")
		scanner := bufio.NewScanner(os.Stdin)
		for scanner.Scan() {
			text := scanner.Text()
			if text == "exit" {
				fmt.Println("Exiting ?")
				commandLineCh <- true
			} else if text == "resync" {
				syncTask.Resync(context.Background(), false, nil, nil)
			} else {
				fmt.Println("Unsupported command, type exit or resync")
			}
		}
	}()

	/*
		if(len(os.Args) > 2){
			externalPath := os.Args[2]
			f, err := os.OpenFile(filepath.Join(externalPath, "testlogfile"), os.O_RDWR | os.O_CREATE | os.O_APPEND, 0777)
			if err != nil {
				log.Printf("error opening file: %v", err)
			}else{
				defer f.Close()
				log.SetOutput(f)
			}
			common.PerformTests(watchPath, externalPath, testInfo, testHeader)
		}
	*/

	// Wait on the routine to be finished or exit.
	wg.Wait()

}

func checkErr(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

// signalTrap traps the registered signals and notifies the caller.
func SignalTrap(sig ...os.Signal) <-chan bool {
	// channel to notify the caller.
	trapCh := make(chan bool, 1)

	go func(chan<- bool) {
		// channel to receive signals.
		sigCh := make(chan os.Signal, 1)
		defer close(sigCh)

		// `signal.Notify` registers the given channel to
		// receive notifications of the specified signals.
		signal.Notify(sigCh, sig...)

		// Wait for the signal.
		<-sigCh

		// Once signal has been received stop signal Notify handler.
		signal.Stop(sigCh)

		// Notify the caller.
		trapCh <- true
	}(trapCh)

	return trapCh
}

/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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

package main

import (
	"fmt"
	"log"
	"os"
	"runtime/pprof"
	"time"

	"github.com/micro/go-micro/registry"

	"github.com/micro/go-micro/broker"

	"github.com/micro/go-micro"
	"github.com/micro/go-micro/server"
	nats2 "github.com/micro/go-plugins/broker/nats"
	grpcclient "github.com/micro/go-plugins/client/grpc"
	"github.com/micro/go-plugins/registry/nats"
	"github.com/micro/go-plugins/server/grpc"
)

func main() {
	r := nats.NewRegistry()
	c := grpcclient.NewClient()
	b1 := nats2.NewBroker(broker.Registry(r))
	b2 := nats2.NewBroker(broker.Registry(r))
	b3 := nats2.NewBroker(broker.Registry(r))
	b2.Connect()
	b3.Connect()
	b2.Subscribe("test", func(publication broker.Publication) error {
		return nil
	})
	b2.Subscribe("test2", func(publication broker.Publication) error {
		return nil
	})
	b3.Subscribe("test3", func(publication broker.Publication) error {
		return nil
	})
	// Create a new service. Optionally include some options here.
	service := micro.NewService(
		micro.Name("greeter"),
		micro.Registry(r),
		micro.Server(grpc.NewServer(server.Registry(r))),
		micro.RegisterTTL(time.Second*30),
		micro.RegisterInterval(time.Second*10),
		micro.Broker(b1),
		micro.Transport(c.Options().Transport),
	)

	// Init will parse the command line flags.
	service.Init()
	go watchRegistry(r)
	//go printRoutines()
	// Run the server
	fmt.Println("PROCESS ID", os.Getppid())
	if err := service.Run(); err != nil {
		fmt.Println(err)
	}
}

func watchRegistry(r registry.Registry) {
	for {
		w, e := r.Watch()
		printRoutines()
		if e != nil {
			log.Fatal(e)
		}
		log.Println("Got Watcher", w)
		res, e := w.Next()
		log.Println("Got Result", res)
	}
}

func printRoutines() {
	pprof.Lookup("goroutine").WriteTo(os.Stdout, 1)
}

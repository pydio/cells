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

package tests

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"html/template"
	"io"
	"log"
	"math/rand"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/pydio/cells/common/utils/std"

	"github.com/emicklei/proto"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-plugins/client/grpc"
	"github.com/micro/go-plugins/registry/nats"
)

var (
	mutex = &sync.Mutex{}

	reg = nats.NewRegistry()
	c   = grpc.NewClient(
		client.Registry(reg),
		client.PoolSize(100),
	)
	cpu                bool
	service            string
	process            *os.Process
	protofile          string
	logFailedCalls     bool
	ovs                bool // double check to insure the method found by walking the proto file should be executed
	maxParallelThreads int
	rpc                string

	// Templates for the JSON request
	Templates = map[string]map[string]map[string]string{}

	randomMutex = &sync.Mutex{}
	randoms     []string
)

func init() {
	flag.BoolVar(&cpu, "cpu", false, "run a cpu profile on the service")
	flag.StringVar(&service, "service", "", "service to benchmark")
	flag.StringVar(&protofile, "proto", "", "proto file location")
	flag.BoolVar(&logFailedCalls, "logFailedCalls", false, "percentage of failed calls per benchmark test")
	flag.IntVar(&maxParallelThreads, "maxThreads", 4, "power of 2 that defines the number of maximum parallel threads that will call the gRPC service at the very same moment. Typically 8 will trigger 256 parallel threads that is already a large value and that is known to trigger some issues on the server")
	flag.BoolVar(&ovs, "ovs", false, "double check to insure the method found by walking the proto file should be executed or not")
	flag.StringVar(&rpc, "rpc", "", "rpc service to run exclusively")
}

func register(n string, m map[string]map[string]string) {
	mutex.Lock()
	defer mutex.Unlock()

	Templates[n] = m
}

func TestMain(m *testing.M) {
	flag.Parse()

	if cpu {
		// Retrieving service
		s, err := reg.GetService(service)

		if err != nil || len(s) == 0 {
			log.Fatal("Service is not running")
		}

		// Retrieving PID of service process
		cmd := exec.Command("lsof", fmt.Sprintf("-i:%d", s[0].Nodes[0].Port), "-Fp")

		out, err := cmd.Output()
		if err != nil {
			log.Fatal(err)
		}

		r, _ := regexp.Compile("p([^\n]+)")
		pids := r.FindStringSubmatch(string(out))
		if len(pids) < 2 {
			log.Fatal("Could not retrieve pid")
		}

		pid, err := strconv.Atoi(pids[1])
		if err != nil {
			log.Fatal(err)
		}

		process, err = os.FindProcess(pid)
		if err != nil {
			log.Fatal(err)
		}

		sendCPUProfileSignal(process)
		defer sendCPUProfileSignal(process)
	}

	m.Run()
}

func clearRandoms() {
	randomMutex.Lock()
	defer randomMutex.Unlock()

	randoms = []string{}
}

func addRandomToList() string {

	r := std.Randkey(50)

	randomMutex.Lock()
	defer randomMutex.Unlock()

	randoms = append(randoms, r)

	return r
}

func getRandomFromList() string {
	randomMutex.Lock()
	defer randomMutex.Unlock()

	if len(randoms) == 0 {
		return ""
	}

	r := randoms[rand.Intn(len(randoms))]

	return r
}

func deleteRandomFromList() string {
	randomMutex.Lock()
	defer randomMutex.Unlock()

	if len(randoms) == 0 {
		return ""
	}

	i := rand.Intn(len(randoms))

	r := randoms[i]

	randoms = append(randoms[:i], randoms[i+1:]...)

	return r
}

func benchStreamClient(b *testing.B, a string, s *proto.Service, r *proto.RPC, t *template.Template) error {
	m := s.Name + "." + r.Name

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	req := c.NewJsonRequest(service, m, `{}`)
	stream, err := c.Stream(ctx, req)

	if err != nil {
		b.Log(err)
		return err
	}

	defer stream.Close()

	b.Run("stream", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			if err := stream.Send(getMsg(b, a, t)); err != nil {
				b.Log(err)
			}
		}
	})

	stream.Send(io.EOF)
	stream.Close()

	return nil
}

func benchStreamServer(b *testing.B, a string, s *proto.Service, r *proto.RPC, t *template.Template) error {
	m := s.Name + "." + r.Name

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)

	defer cancel()
	// req := c.NewJsonRequest(service, m, getMsg(b, a, t))
	req := c.NewJsonRequest(service, m, `{}`)

	stream, err := c.Stream(ctx, req)
	defer stream.Close()

	if err != nil {
		b.Log(err)
		return err
	}

	if err := stream.Send(getMsg(b, a, t)); err != nil {
		b.Log(err)
		return err
	}

	for {
		var msg json.RawMessage
		err := stream.Recv(&msg)
		if err == io.ErrUnexpectedEOF {
			break
		}
		if err != nil {
			fmt.Println(err)
			return err
		}
	}

	return nil
}

func benchCall(b *testing.B, a string, s *proto.Service, r *proto.RPC, t *template.Template) error {
	var resp json.RawMessage

	m := s.Name + "." + r.Name

	req := c.NewJsonRequest(service, m, getMsg(b, a, t))
	err := c.Call(context.Background(), req, &resp)
	if err != nil {
		b.Log(err)
		// Maybe add a retry? send various error codes for various errors?
		return err
	}

	return nil
}

func getMsg(b *testing.B, a string, t *template.Template) interface{} {

	var builder strings.Builder

	var uuid string
	switch a {

	case "create":
		uuid = addRandomToList()
	case "update":
		uuid = getRandomFromList()
	case "delete":
		uuid = deleteRandomFromList()
	}

	t.Execute(&builder, struct {
		Random string
	}{
		uuid,
	})

	var d interface{}
	json.Unmarshal([]byte(builder.String()), &d)

	return d
}

// BenchmarkService runs all proto functions against a certain service
func BenchmarkService(b *testing.B) {
	fp := protofile

	reader, _ := os.Open(fp)
	defer reader.Close()

	parser := proto.NewParser(reader)
	definition, _ := parser.Parse()

	var (
		currentService     *proto.Service
		currentTemplateMap map[string]map[string]string
	)

	handlerService := proto.WithService(func(s *proto.Service) {
		clearRandoms()
		if rpc != "" && s.Name != rpc {
			return
		}
		currentService = s
		if m, ok := Templates[s.Name]; ok {
			currentTemplateMap = m
		}
	})

	handlerRPC := proto.WithRPC(func(r *proto.RPC) {
		for _, action := range []string{"create", "update", "delete"} {
			if m, ok := currentTemplateMap[action]; ok {
				if t, ok := m[r.Name]; ok {

					b.Run(fmt.Sprintf("%s", r.Name), func(b *testing.B) {
						// if ovs { // skip unvalid service: useful when various services are defined in a single proto file
						// 	tokens := strings.Split(service, ".")
						// 	suffix := tokens[len(tokens)-1]
						// 	tcr := strings.ToLower(currentService)
						// 	if !strings.HasPrefix(tcr, suffix) {
						// 		return
						// 	}
						// }

						// Gather error count
						var gotError chan bool
						var done chan int
						if logFailedCalls {
							gotError = make(chan bool)
							done = make(chan int)
							go func() {
								errNb := 0
								for {
									select {
									case nb := <-done:
										results := float32(errNb) / float32(nb) * 100
										fmt.Printf("Benchmarking %s - %.00f%% error rate\n", currentService.Name+"."+r.Name, results)
										break
									case <-gotError:
										errNb++
									}
								}
							}()
						}

						// Retrieve the test template
						tmpl, err := template.New(r.Name).Parse(t)
						if err != nil {
							return
						}

						for i := 0; i < b.N; i++ {
							if r.StreamsRequest && !r.StreamsReturns {
								err := benchStreamClient(b, action, currentService, r, tmpl)
								if err != nil {
									if logFailedCalls {
										gotError <- true
									}
								}
							} else if !r.StreamsRequest && r.StreamsReturns {
								err := benchStreamServer(b, action, currentService, r, tmpl)
								if err != nil {
									if logFailedCalls {
										gotError <- true
									}
								}
							} else {
								err := benchCall(b, action, currentService, r, tmpl)
								if err != nil {
									if logFailedCalls {
										gotError <- true
									}
								}
							}
						}
						if logFailedCalls {
							done <- b.N
						}
					})
				}
			}
		}
	})

	proto.Walk(definition, handlerService, handlerRPC)
}

// BenchmarkRunParallel launches parallel runs of all proto
// functions found in the specified file against a certain service
func BenchmarkRunParallel(b *testing.B) {
	fp := protofile

	reader, _ := os.Open(fp)
	defer reader.Close()

	parser := proto.NewParser(reader)
	definition, _ := parser.Parse()

	var (
		currentService     *proto.Service
		currentTemplateMap map[string]map[string]string
	)

	handlerService := proto.WithService(func(s *proto.Service) {
		clearRandoms()
		if rpc != "" && s.Name != rpc {
			return
		}
		currentService = s
		if m, ok := Templates[s.Name]; ok {
			currentTemplateMap = m
		}
	})

	handlerRPC := proto.WithRPC(func(r *proto.RPC) {

		for _, action := range []string{"create", "update", "delete"} {
			if m, ok := currentTemplateMap[action]; ok {
				if t, ok := m[r.Name]; ok {

					// if ovs { // skip unvalid service: useful when various services are defined in a single proto file
					// 	tokens := strings.Split(service, ".")
					// 	suffix := tokens[len(tokens)-1]
					// 	tcr := strings.ToLower(currentService)
					// 	if !strings.HasPrefix(tcr, suffix) {
					// 		return
					// 	}
					// }

					// Retrieve the test template
					tmpl, err := template.New(r.Name).Parse(t)
					if err != nil {
						return
					}

					// range of SetParallelism
					parallelisms := make([]int, 0)
					for i := 0; i <= maxParallelThreads; i += 2 {
						parallelisms = append(parallelisms, int(1<<uint32(i)))
					}

					for _, p := range parallelisms {

						// Enable error count gathering
						var gotError chan bool
						var performed chan int
						var allDone chan bool

						if logFailedCalls {
							gotError = make(chan bool)
							performed = make(chan int)
							allDone = make(chan bool)
							go func() {
								errNb := 0
								totalNb := 0
								for {
									select {
									case <-allDone:
										results := float32(errNb) / float32(totalNb) * 100
										fmt.Printf("Benchmarking %s - %.00f%% error rate\n", fmt.Sprintf("%s/%v", r.Name, p), results)
										break
									case nb := <-performed:
										totalNb += nb
									case <-gotError:
										errNb++
									}
								}
							}()
						}

						b.Run(fmt.Sprintf("%s/%v", r.Name, p), func(b *testing.B) {
							b.SetParallelism(p)
							b.RunParallel(func(pb *testing.PB) {
								counter := 0
								for pb.Next() {
									if r.StreamsRequest && !r.StreamsReturns {
										err := benchStreamClient(b, action, currentService, r, tmpl)
										if err != nil {
											if logFailedCalls {
												gotError <- true
											}
										}
										counter = counter + b.N
									} else if !r.StreamsRequest && r.StreamsReturns {
										err := benchStreamServer(b, action, currentService, r, tmpl)
										if err != nil {
											if logFailedCalls {
												gotError <- true
												counter++
											}
										}
										counter = counter + b.N
									} else {
										err := benchCall(b, action, currentService, r, tmpl)
										if err != nil {
											if logFailedCalls {
												gotError <- true
											}
										}
										counter = counter + b.N
									}
								}
								if logFailedCalls {
									performed <- counter
								}
							})
						})
						if logFailedCalls {
							allDone <- true
						}
					}
				}
			}
		}
	})

	proto.Walk(definition, handlerService, handlerRPC)
}

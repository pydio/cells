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

package idmtest

import (
	"context"
	"flag"
	"fmt"
	"html/template"
	"log"
	"math/rand"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"testing"

	json "github.com/pydio/cells/x/jsonx"

	"github.com/pydio/cells/common/utils/std"

	"github.com/golang/protobuf/ptypes"
	ptypes_any "github.com/golang/protobuf/ptypes/any"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-plugins/registry/nats"
	"github.com/pydio/cells/common/micro/client/grpc"

	"github.com/pydio/cells/common/proto/idm"
	serviceproto "github.com/pydio/cells/common/service/proto"
)

const (
	fullQueryTemplateStr = `{"Query":{"SubQueries":[{{.SubqueryPlaceHolder}}]}}`
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
	logFailedCalls     bool
	maxParallelThreads int

	// Templates for the JSON request
	templates = map[string]*template.Template{}

	randomMutex = &sync.Mutex{}
	randoms     []string
)

func init() {
	flag.StringVar(&service, "service", "", "service to benchmark")
	flag.BoolVar(&cpu, "cpu", false, "run a cpu profile on the service")
	flag.BoolVar(&logFailedCalls, "logFailedCalls", false, "percentage of failed calls per benchmark test")
	flag.IntVar(&maxParallelThreads, "maxThreads", 4, "power of 2 that defines the number of maximum parallel threads that will call the gRPC service at the very same moment. Typically 8 will trigger 256 parallel threads that is already a large value and that is known to trigger some issues on the server")

	fullQueryTemplate := template.New("FullQueryTemplate")
	fullQueryTemplate.Parse(fullQueryTemplateStr)
	templates["FullQueryTemplate"] = fullQueryTemplate
}

// BenchmarkRunParallel define with codes the benchmark that will be launched
func BenchmarkRunParallel(b *testing.B) {
	subQueryTemplate, err := template.New("DeleteRoleSubQuery").Parse(`{"Uuid": ["{{.Random}}"]}`)
	if err != nil {
		return
	}

	var currKey string
	// Role management

	if service == "" || service == "pydio.grpc.role" {

		currKey = "RoleService.CreateRole.Label"
		doRunParallel(b, "pydio.grpc.role", "RoleService.CreateRole", "create", currKey, false, templates[currKey])
		currKey = "RoleService.SearchRole.Label"
		doRunParallel(b, "pydio.grpc.role", "RoleService.SearchRole", "update", currKey, true, subQueryTemplate)
		currKey = "RoleService.DeleteRole.Label"
		doRunParallel(b, "pydio.grpc.role", "RoleService.DeleteRole", "delete", currKey, true, subQueryTemplate)

		// Role management 2, the come back of the revenge - use UUID rather than labels
		clearRandoms()
		currKey = "RoleService.CreateRole.Uuid"
		doRunParallel(b, "pydio.grpc.role", "RoleService.CreateRole", "create", currKey, false, templates[currKey])
		currKey = "RoleService.DeleteRole.Uuid"
		doRunParallel(b, "pydio.grpc.role", "RoleService.DeleteRole", "delete", currKey, true, subQueryTemplate)
	}

	// User management
	if service == "" || service == "pydio.grpc.user" {
		clearRandoms()
		currKey = "UserService.CreateUser.Login"
		doRunParallel(b, "pydio.grpc.user", "UserService.CreateUser", "create", currKey, false, templates[currKey])
		currKey = "UserService.SearchUser.Login"
		doRunParallel(b, "pydio.grpc.user", "UserService.SearchUser", "update", currKey, true, subQueryTemplate)
		currKey = "UserService.BindUser.Login"
		doRunParallel(b, "pydio.grpc.user", "UserService.BindUser", "update", currKey, false, templates[currKey])
		currKey = "UserService.CountUser.Login"
		doRunParallel(b, "pydio.grpc.user", "UserService.CountUser", "update", currKey, true, subQueryTemplate)
		currKey = "UserService.DeleteUser.Login"
		doRunParallel(b, "pydio.grpc.user", "UserService.DeleteUser", "delete", currKey, true, subQueryTemplate)
	}

	// Workspace management
	if service == "" || service == "pydio.grpc.workspace" {
		clearRandoms()
		currKey = "WorkspaceService.CreateWorkspace.Slug"
		doRunParallel(b, "pydio.grpc.workspace", "WorkspaceService.CreateWorkspace", "create", currKey, false, templates[currKey])
		currKey = "UserService.SearchWorkspace.Slug"
		doRunParallel(b, "pydio.grpc.workspace", "WorkspaceService.SearchWorkspace", "update", currKey, true, subQueryTemplate)
		currKey = "WorkspaceService.DeleteWorkspace.Slug"
		doRunParallel(b, "pydio.grpc.workspace", "WorkspaceService.DeleteWorkspace", "delete", currKey, true, subQueryTemplate)
	}

}

func getQueryRaw(key, randomStr string, queryTemplate *template.Template) (queryRaw []byte) {

	keys := strings.Split(key, ".")

	var query *ptypes_any.Any
	var err error

	switch keys[1] {
	case "DeleteRole", "SearchRole":
		switch keys[2] {
		case "Label":
			query, err = ptypes.MarshalAny(&idm.RoleSingleQuery{Label: randomStr})
		case "Uuid":
			query, err = ptypes.MarshalAny(&idm.RoleSingleQuery{Uuid: []string{randomStr}})
		}
		if err != nil {
			log.Fatalf("cannot marshall sub query : %v", err)
			return nil
		}

		switch keys[1] {
		case "DeleteRole":
			rr := idm.DeleteRoleRequest{Query: &serviceproto.Query{SubQueries: []*ptypes_any.Any{query}}}
			queryRaw, err = json.Marshal(rr)
		case "SearchRole":
			rr := idm.SearchRoleRequest{Query: &serviceproto.Query{SubQueries: []*ptypes_any.Any{query}}}
			queryRaw, err = json.Marshal(rr)
		}

		if err != nil {
			log.Fatalf("cannot marshall query : %v", err)
			return nil
		}
		return
	case "DeleteUser", "SearchUser":
		query, err = ptypes.MarshalAny(&idm.UserSingleQuery{Login: randomStr})
		if err != nil {
			log.Fatalf("cannot marshall sub query : %v", err)
			return nil
		}

		switch keys[1] {
		case "DeleteUser":
			rr := idm.DeleteUserRequest{Query: &serviceproto.Query{SubQueries: []*ptypes_any.Any{query}}}
			queryRaw, err = json.Marshal(rr)
		case "SearchUser":
			rr := idm.SearchUserRequest{Query: &serviceproto.Query{SubQueries: []*ptypes_any.Any{query}}}
			queryRaw, err = json.Marshal(rr)
		}
		if err != nil {
			log.Fatalf("cannot marshall query : %v", err)
			return nil
		}
		return
	case "CountUser":
		rr := idm.SearchUserRequest{}
		queryRaw, err = json.Marshal(rr)
		if err != nil {
			log.Fatalf("cannot marshall query : %v", err)
			return nil
		}
		return
	case "DeleteWorkspace", "SearchWorkspace":
		query, err = ptypes.MarshalAny(&idm.WorkspaceSingleQuery{Slug: randomStr})
		if err != nil {
			log.Fatalf("cannot marshall sub query : %v", err)
			return nil
		}
		switch keys[1] {
		case "DeleteWorkspace":
			rr := idm.DeleteWorkspaceRequest{Query: &serviceproto.Query{SubQueries: []*ptypes_any.Any{query}}}
			queryRaw, err = json.Marshal(rr)
		case "SearchWorkspace":
			rr := idm.SearchWorkspaceRequest{Query: &serviceproto.Query{SubQueries: []*ptypes_any.Any{query}}}
			queryRaw, err = json.Marshal(rr)
		}
		if err != nil {
			log.Fatalf("cannot marshall query : %v", err)
			return nil
		}
		return
	default:
		log.Fatalf("unknown bench key: %s", key)
		return nil
	}
}

func register(key, jsonTemplate string) {
	mutex.Lock()
	defer mutex.Unlock()

	templ := template.New(key)
	templ, err := templ.Parse(jsonTemplate)
	if err != nil {
		log.Fatal("cannot parse template " + jsonTemplate)
	}
	templates[key] = templ
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

func benchService(b *testing.B, grpcServiceId, methodName, randomStr string, queryTemplate *template.Template) error {
	var builder strings.Builder
	var resp json.RawMessage

	// Replace the placeholder with the retrieved random value
	queryTemplate.Execute(&builder, struct {
		Random string
	}{
		randomStr,
	})

	// Finally retrieve the generic Query object
	var req interface{}
	json.Unmarshal([]byte(builder.String()), &req)

	// Get a grpc client
	jsonRequest := c.NewJsonRequest(grpcServiceId, methodName, req)
	err := c.Call(context.Background(), jsonRequest, &resp)
	if err != nil {
		b.Log(err)
		return err
	}
	return nil
}

// Benchmark a grpc service with a specific subquery
func benchServiceWithQuery(
	b *testing.B,
	serviceName, methodName, benchKey, randomStr string,
	queryTemplate *template.Template) error {

	queryRaw := getQueryRaw(benchKey, randomStr, queryTemplate)

	// Finally retrieve the generic Query object
	var req interface{}
	json.Unmarshal(queryRaw, &req)

	var resp json.RawMessage

	// Get a grpc client
	jsonRequest := c.NewJsonRequest(serviceName, methodName, req)
	err := c.Call(context.Background(), jsonRequest, &resp)
	if err != nil {
		b.Log(err)
		return err
	}
	return nil
}

func doRunParallel(b *testing.B, grpcServId, methodName, actionType, benchKey string, withQuery bool, subQueryTemplate *template.Template) {

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
						fmt.Printf("%s Benchmark - %s - Error rate: %.00f%% \n", grpcServId, fmt.Sprintf("%s/%v", methodName, p), results)
						break
					case nb := <-performed:
						totalNb += nb
					case <-gotError:
						errNb++
					}
				}
			}()
		}

		b.Run(fmt.Sprintf("%s/%s/%v", grpcServId, methodName, p), func(b *testing.B) {
			b.SetParallelism(p)
			b.RunParallel(func(pb *testing.PB) {

				counter := 0
				for pb.Next() {

					// Management of the random:
					var randomStr string
					switch actionType {
					case "create": // create a new value and store it in a local store
						randomStr = addRandomToList()
					case "update": // pick a random value from the store
						randomStr = getRandomFromList()
					case "delete": // pick a random value and remove it from the store
						randomStr = deleteRandomFromList()
					}

					var err error
					if withQuery {
						err = benchServiceWithQuery(b, grpcServId, methodName, benchKey, randomStr, subQueryTemplate)
					} else {
						err = benchService(b, grpcServId, methodName, randomStr, subQueryTemplate)
					}

					if logFailedCalls {
						if err != nil {
							gotError <- true
						}
						counter++
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

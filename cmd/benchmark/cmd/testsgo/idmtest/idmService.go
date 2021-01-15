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

// Package idmtest performs benchmarks on Roles
package idmtest

import (
	"context"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"math/rand"
	"os"
	"strings"
	"sync"
	"testing"

	ptypes_any "github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/client"
	"github.com/micro/protobuf/ptypes"

	"github.com/pydio/cells/common/micro/client/grpc"
	"github.com/pydio/cells/common/micro/registry/nats"
	"github.com/pydio/cells/common/proto/idm"
	serviceproto "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils/std"
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

	// TEMPLATES

	// Roles
	register("RoleService.CreateRole.Label", `{"Role": {"Label": "{{.Random}}"}}`)
	register("RoleService.CreateRole.Uuid", `{"Role": {"Uuid": "{{.Random}}", "Label": "{{.Random}}"}}`)

	// Users
	register("UserService.CreateUser.Login", `{"User": 
		{
			"Login": "{{.Random}}", 
			"Password": "xxxxxxxx", 			
			"GroupPath": "/",
			"Attributes": {
				"displayName": "John Doe",
				"hidden":      "false",
				"active":      "true"
			}
		}
	}`)
	// Warning: parameters keys are uppercased when generated via protoc (First letter is lower case in the idm.proto file)
	register("UserService.BindUser.Login", `{"UserName": "{{.Random}}", "Password": "xxxxxxxx"}`)

	// Workspaces
	register("WorkspaceService.CreateWorkspace.Slug", `{"Workspace": {"Uuid": "{{.Random}}", "Label": "{{.Random}}", "Slug": "{{.Random}}"}}`)

	fullQueryTemplate := template.New("FullQueryTemplate")
	fullQueryTemplate.Parse(fullQueryTemplateStr)
	templates["FullQueryTemplate"] = fullQueryTemplate

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

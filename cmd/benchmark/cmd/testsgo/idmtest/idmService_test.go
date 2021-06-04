// +build ignore

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
	"flag"
	"fmt"
	"html/template"
	"log"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"testing"
)

func init() {
	flag.StringVar(&service, "service", "", "service to benchmark")
	flag.BoolVar(&cpu, "cpu", false, "run a cpu profile on the service")
	flag.BoolVar(&logFailedCalls, "logFailedCalls", false, "percentage of failed calls per benchmark test")
	flag.IntVar(&maxParallelThreads, "maxThreads", 4, "power of 2 that defines the number of maximum parallel threads that will call the gRPC service at the very same moment. Typically 8 will trigger 256 parallel threads that is already a large value and that is known to trigger some issues on the server")
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

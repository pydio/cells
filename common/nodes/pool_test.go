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

package nodes

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/proto/tree"
)

var pools []SourcesPool

func BenchmarkClientsPoolWithoutRegistryWatch(b *testing.B) {

	go listOpenFiles()

	// run the Benchmark function b.N times
	for n := 0; n < b.N; n++ {
		pools = append(pools, NewClientsPool(context.TODO(), false))
	}
}

func BenchmarkClientsPoolWithRegistryWatch(b *testing.B) {

	go listOpenFiles()

	// run the Benchmark function b.N times
	for n := 0; n < b.N; n++ {
		pools = append(pools, NewClientsPool(context.TODO(), true))
	}
}

func listOpenFiles() {
	tick := time.Tick(10 * time.Millisecond)

	for range tick {
		lsof := exec.Command("lsof", "-p", fmt.Sprintf("%d", os.Getpid()))
		wc := exec.Command("wc", "-l")
		outPipe, err := lsof.StdoutPipe()
		if err != nil {
			continue
		}
		lsof.Start()
		wc.Stdin = outPipe
		out, err := wc.Output()
		if err != nil {
			continue
		}

		fmt.Printf("Number of Open Files : %s\n", out)
	}
}

func TestBuildAncestorsList(t *testing.T) {
	Convey("Test BuildAncestorsList", t, func() {
		m := NewHandlerMock()
		ctx := context.Background()
		m.Nodes["path"] = &tree.Node{Path: "path"}
		m.Nodes["path/to"] = &tree.Node{Path: "path/to"}
		m.Nodes["path/to/node"] = &tree.Node{Path: "path/to/node"}
		m.Nodes["path/to/node/file.txt"] = &tree.Node{Path: "path/to/node/file.txt"}
		parents, e := BuildAncestorsList(ctx, m, &tree.Node{Path: "path/to/node/file.txt"})
		So(e, ShouldBeNil)
		So(parents, ShouldHaveLength, 4)
		parents, e = BuildAncestorsList(ctx, m, &tree.Node{Path: "path/to/node/file.txt"})
		So(e, ShouldBeNil)
		So(parents, ShouldHaveLength, 4)
		parents, e = BuildAncestorsList(ctx, m, &tree.Node{Path: "path/to/node"})
		So(e, ShouldBeNil)
		So(parents, ShouldHaveLength, 3)
		parents, e = BuildAncestorsList(ctx, m, &tree.Node{Path: "path/to"})
		So(e, ShouldBeNil)
		So(parents, ShouldHaveLength, 2)
		parents, e = BuildAncestorsList(ctx, m, &tree.Node{Path: "path/to/node/file.txt"})
		So(e, ShouldBeNil)
		So(parents, ShouldHaveLength, 4)
		<-time.After(1 * time.Second)
		parents, e = BuildAncestorsList(ctx, m, &tree.Node{Path: "path/to/node/file.txt"})
		So(e, ShouldBeNil)
		So(parents, ShouldHaveLength, 4)
	})
}

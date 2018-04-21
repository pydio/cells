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

package cmd

import (
	"bytes"
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"sync"
	"time"

	"github.com/gin-gonic/gin/json"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/defaults"
)

var (
	bmPath      string
	bmUUID      string
	bmFlood     int
	bmFloodSoft int
	bmBatch     int
	bmOut       string

	dataBenchmarkCreateCmd = &cobra.Command{
		Use:   "benc-create",
		Short: "Client method for benchmarking node creates.",
		Run:   mainDataBenchmarkCreate,
	}

	dataBenchmarkStreamCreateCmd = &cobra.Command{
		Use:   "benc-stream-create",
		Short: "Client method for benchmarking node creates using stream.",
		Run:   mainDataBenchmarkStreamCreate,
	}
)

func mainDataBenchmarkCreate(cmd *cobra.Command, args []string) {
	if bmPath == "" {
		cmd.Help()
		os.Exit(1)
	}

	//source := ctx.String("source")
	serviceName := common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_TREE
	//if len(source) > 0 {
	serviceName = common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_DATA_INDEX_ + "miniods1"
	//}

	client := tree.NewNodeReceiverClient(serviceName, defaults.NewClient())

	if bmFlood > 0 {
		//log.Println("FLOOD ME " + serviceName)
		var wg sync.WaitGroup
		var seq []float64
		start := time.Now()
		for i := 0; i < bmFlood; i++ {
			c := i
			wg.Add(1)
			go func() {
				defer wg.Done()
				_, err := client.CreateNode(context.Background(), &tree.CreateNodeRequest{
					Node: &tree.Node{
						Path: fmt.Sprintf(bmPath+"-%v", c),
					},
				})
				if err != nil {
					log.Println(err)
					return
				}
			}()
			if i > 0 && (i%bmBatch) == 0 {
				wg.Wait()
				d := time.Since(start)
				seq = append(seq, d.Seconds())
				start = time.Now()
			}
		}

		data, _ := json.Marshal(seq)
		err := ioutil.WriteFile(bmOut, data, 0777)
		if err != nil {
			panic(err)
		}
		return
	}

	if bmFloodSoft > 0 {
		format := "%15s,%15s,%15s,%15s,%15s,%15s,%15s,%15s,%15s,%15s,%15s,%15s,%15s"
		var seq = []string{
			fmt.Sprintf(format, "call #", "find node", "del node", "path", "del node 2", "path 2", "get node", "push commit", "set nodes", "batch", "batch close", "event noritfy", "total"),
		}
		for i := 0; i < bmFloodSoft; i++ {
			c := i
			log.Println(fmt.Sprintf("FLOOD %v", i))
			response, err := client.CreateNode(context.Background(), &tree.CreateNodeRequest{
				Node: &tree.Node{
					Path: fmt.Sprintf(bmPath+"-%v", c),
					Etag: "blablani",
					Type: tree.NodeType_LEAF,
				},
			})

			if err != nil {
				panic(err)
			}

			if response != nil {
				bench := map[string]time.Duration{}
				err = response.Node.GetMeta("pydio:benchmark", &bench)
				if err != nil {
					panic(err)
				}

				line := fmt.Sprintf("%15s,%15d,%15d,%15d,%15d,%15d,%15d,%15d,%15d,%15d,%15d,%15d,%15d",
					fmt.Sprintf("call %d", i+1),
					bench["find node"],
					bench["del node"],
					bench["path"],
					bench["del node 2"],
					bench["path 2"],
					bench["get node"],
					bench["push commit"],
					bench["set nodes"],
					bench["batch"],
					bench["batch close"],
					bench["event notify"],
					bench["total"],
				)
				seq = append(seq, line)
			}
		}

		buf := bytes.NewBuffer([]byte{})
		for i := range seq {
			l := seq[i] + "\n"
			//log.Print(l)
			buf.Write([]byte(l))
		}

		err := ioutil.WriteFile(bmOut, buf.Bytes(), 0777)
		if err != nil {
			panic(err)
		}
		return
	}

	if _, err := client.CreateNode(context.Background(), &tree.CreateNodeRequest{
		Node: &tree.Node{
			Uuid: bmUUID,
			Path: bmPath,
		},
	}); err != nil {
		log.Println(err)
	}
}

func mainDataBenchmarkStreamCreate(cmd *cobra.Command, args []string) {
	if bmPath == "" || bmFlood <= 0 {
		cmd.Help()
		os.Exit(1)
	}
	serviceName = common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_DATA_INDEX_ + "miniods1"

	client := tree.NewNodeReceiverStreamClient(serviceName, defaults.NewClient())
	ctx, _ := context.WithDeadline(context.Background(), time.Now().Add(1000*time.Minute))
	stream, err := client.CreateNodeStream(ctx)
	if err != nil {
		log.Fatalln(err.Error())
	}

	format := "%15s,%15s,%15s,%15s,%15s,%15s,%15s,%15s,%15s,%15s,%15s,%15s,%15s"
	var seq = []string{
		fmt.Sprintf(format, "call #", "find node", "del node", "path", "del node 2", "path 2", "get node", "push commit", "set nodes", "batch", "batch close", "event noritfy", "total"),
	}
	for i := 0; i < bmFlood; i++ {
		req := &tree.CreateNodeRequest{
			Node: &tree.Node{
				Path: fmt.Sprintf(bmPath+"-%v", i),
			},
		}
		err := stream.Send(req)
		if err != nil {
			stream.Close()
			log.Fatalln(err.Error())
		}
		rsp, err := stream.Recv()
		if err != nil {
			stream.Close()
			log.Fatalln(err.Error())
		}

		bench := map[string]time.Duration{}
		err = rsp.Node.GetMeta("pydio:benchmark", &bench)
		if err != nil {
			panic(err)
		}

		line := fmt.Sprintf("%15s,%15d,%15d,%15d,%15d,%15d,%15d,%15d,%15d,%15d,%15d,%15d,%15d",
			fmt.Sprintf("call %d", i+1),
			bench["find node"],
			bench["del node"],
			bench["path"],
			bench["del node 2"],
			bench["path 2"],
			bench["get node"],
			bench["push commit"],
			bench["set nodes"],
			bench["batch"],
			bench["batch close"],
			bench["event notify"],
			bench["total"],
		)
		seq = append(seq, line)
	}
	buf := bytes.NewBuffer([]byte{})
	for i := range seq {
		l := seq[i] + "\n"
		//log.Print(l)
		buf.Write([]byte(l))
	}

	err = ioutil.WriteFile(bmOut, buf.Bytes(), 0777)
	if err != nil {
		panic(err)
	}
	stream.Close()
}

func init() {
	// Local flags which will only run when this command is called directly.
	dataBenchmarkCreateCmd.Flags().StringVar(&bmPath, "path", "", "Path to the data")
	dataBenchmarkCreateCmd.Flags().StringVar(&bmUUID, "uuid", "", "UUID of the data")
	dataBenchmarkCreateCmd.Flags().StringVar(&bmOut, "output", fmt.Sprintf("%d", time.Now().Unix()), "result output file")
	dataBenchmarkCreateCmd.Flags().IntVar(&bmFlood, "flood", 0, "Floods of n create nodes")
	dataBenchmarkCreateCmd.Flags().IntVar(&bmFloodSoft, "flood-soft", 0, "Floods one after one")
	dataBenchmarkCreateCmd.Flags().IntVar(&bmBatch, "batch", 0, "Floods by group of n")

	dataBenchmarkStreamCreateCmd.Flags().StringVar(&bmPath, "path", "", "Path to the data")
	dataBenchmarkStreamCreateCmd.Flags().StringVar(&bmOut, "output", fmt.Sprintf("stream.%d.csv", time.Now().Unix()), "result output file")
	dataBenchmarkStreamCreateCmd.Flags().IntVar(&bmFlood, "flood", 0, "Floods of n create nodes")

	dataCmd.AddCommand(dataBenchmarkCreateCmd)
	dataCmd.AddCommand(dataBenchmarkStreamCreateCmd)
}

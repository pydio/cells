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
	"fmt"

	"github.com/spf13/cobra"
)

type Service struct {
	Name string
}

// runCmd represents the run command
var runCmd = &cobra.Command{
	Use:   "run",
	Short: "A brief description of your command",
	Long: `A longer description that spans multiple lines and likely contains examples
and usage of using your command. For example:

Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.`,
	Run: func(cmd *cobra.Command, args []string) {

		fmt.Println("Unimplemented command")

		// fp := "/Users/gregory/work/src/github.com/pydio/cells/common/proto/idm/idm.proto"

		// // fd := filepath.Dir(fp)
		// // fpd := filepath.Dir(fd) // parent directory
		// // fdb := filepath.Base(fd)
		// // fb := filepath.Base(fp)

		// reader, _ := os.Open(fp)
		// defer reader.Close()
		// parser := proto.NewParser(reader)
		// definition, _ := parser.Parse()

		// var (
		// 	currentService     string
		// 	currentTemplateMap map[string]string
		// )

		// handlerService := proto.WithService(func(s *proto.Service) {
		// 	currentService = s.Name
		// 	if m, ok := tests.Templates[s.Name]; ok {
		// 		currentTemplateMap = m
		// 	}
		// })

		// handlerRPC := proto.WithRPC(func(r *proto.RPC) {

		// 	if t, ok := currentTemplateMap[r.Name]; ok {

		// 		// Retrieve the test template
		// 		tmpl, err := template.New(r.Name).Parse(t)
		// 		if err != nil {
		// 			return
		// 		}

		// 		var (
		// 			b    strings.Builder
		// 			resp json.RawMessage
		// 		)

		// 		tmpl.Execute(&b, struct {
		// 			Random string
		// 		}{
		// 			"test",
		// 		})

		// 		var jsonData interface{}
		// 		json.Unmarshal([]byte(b.String()), &jsonData)

		// 		// Get a grpc client
		// 		c := grpc.NewClient(client.Registry(nats.NewRegistry()))
		// 		c.Init(client.Registry(nats.NewRegistry()))
		// 		req := c.NewJsonRequest("pydio.grpc.role", currentService+"."+r.Name, jsonData)

		// 		err = c.Call(context.Background(), req, &resp)
		// 		if err != nil {
		// 			log.Fatal(err)
		// 		}
		// 	}
		// })

		// proto.Walk(definition, handlerService, handlerRPC)
	},
}

func init() {
	RootCmd.AddCommand(runCmd)
}

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

package cmd

import (
	"fmt"
	"os"
	"strings"
	"text/tabwriter"
	"text/template"

	"github.com/spf13/cobra"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
)

var (
	showDescription bool
	runningServices []string

	tmpl = `
	{{- block "keys" .}}
		{{- range $index, $category := .}}
			{{- if $category.Name}}
			{{- ""}} {{$category.Name}}	{{""}}	{{"\n"}}
			{{- end}}
			{{- range $index, $subcategory := .Tags}}
				{{- if $subcategory.Name}}
				{{- ""}} {{"#"}} {{$subcategory.Name}}	{{""}}	{{"\n"}}
				{{- end}}
				{{- range .Services}}
					{{- ""}} {{.Name}}	[{{if .IsRunning}}X{{else}} {{end}}]  {{.RunningNodes}}	{{"\n"}}
				{{- end}}
			{{- end}}
			{{- ""}} {{""}}	{{""}}	{{"\n"}}
		{{- end}}
	{{- end}}
	`
)

type Service interface {
	Name() string
	IsRunning() bool
}

type Tags struct {
	Name     string
	Services map[string]Service
	Tags     map[string]*Tags
}

// psCmd represents the ps command
var psCmd = &cobra.Command{
	Use:   "ps",
	Short: "List all available services and their statuses",
	Long: `
DESCRIPTION

  List all available services and their statuses

  Use this command to list all running services on this machine.
  Services fall into main categories (GENERIC, GRPC, REST, API) and are then organized by tags (broker, data, idm, etc.)

EXAMPLE

  Use the --tags/-t flag to limit display to one specific tag, use lowercase for tags.

  $ ` + os.Args[0] + ` ps -t=broker
  Will result:
	- pydio.grpc.activity   [X]
	- pydio.grpc.chat       [X]
	- pydio.grpc.mailer     [X]
	- pydio.api.websocket   [X]
	- pydio.rest.activity   [X]
	- pydio.rest.frontlogs  [X]
	- pydio.rest.mailer     [X]

`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		bindViperFlags(cmd.Flags(), map[string]string{})

		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		reg, err := registry.OpenRegistry(ctx, runtime.RegistryURL())
		if err != nil {
			return err
		}

		t, _ := template.New("t1").Parse(tmpl)

		tags := []*Tags{
			{"GENERIC SERVICES", nil, getTagsPerType(reg, func(s registry.Service) bool { return s.IsGeneric() })},
			{"GRPC SERVICES", nil, getTagsPerType(reg, func(s registry.Service) bool { return s.IsGRPC() })},
			{"REST SERVICES", nil, getTagsPerType(reg, func(s registry.Service) bool { return s.IsREST() })},
		}

		w := tabwriter.NewWriter(cmd.OutOrStdout(), 8, 8, 8, ' ', 0)
		t.Execute(w, tags)

		return nil
	},
}

func init() {

	addExternalCmdRegistryFlags(psCmd.Flags())

	RootCmd.AddCommand(psCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// psCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// psCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}

func getTagsPerType(reg registry.Registry, f func(s registry.Service) bool) map[string]*Tags {
	tags := make(map[string]*Tags)

	allServices, err := reg.List(registry.WithType(pb.ItemType_SERVICE))
	if err != nil {
		return tags
	}

	for _, i := range allServices {
		s := i.(registry.Service)

		name := s.Name()

		if f(s) {
			for _, tag := range s.Tags() {
				if _, ok := tags[tag]; !ok {
					tags[tag] = &Tags{Name: tag, Services: make(map[string]Service)}
				}

				var nodes []string
				if showDescription {
					for _, node := range s.Nodes() {
						nodes = append(nodes, fmt.Sprintf("%s (exp: %s)", node.Address(), node.Metadata()["expiry"]))
					}
				}

				tags[tag].Services[name] = &runningService{name: name, nodes: strings.Join(nodes, ",")}
			}
		}
	}

	return tags
}

type runningService struct {
	name  string
	nodes string
}

func (s *runningService) Name() string {
	return s.name
}

func (s *runningService) IsRunning() bool {
	for _, r := range runningServices {
		if r == s.name {
			return true
		}
	}

	return false
}

func (s *runningService) RunningNodes() string {
	return s.nodes
}

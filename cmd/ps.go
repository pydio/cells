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
	"regexp"
	"strings"
	"text/tabwriter"
	"text/template"

	"github.com/micro/go-micro"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service"
)

var (
	showDescription   bool
	filterListTags    []string
	filterListExclude []string
	runningServices   []string

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
	PreRun: func(cmd *cobra.Command, args []string) {

		viper.SetDefault("registry", "grpc://:8000")

		bindViperFlags(cmd.Flags(), map[string]string{})

		// Initialise the default registry
		handleRegistry()

		plugins.Init(cmd.Context(), "main")

		// If we have an error (registry not running) the running list simply is empty
		services, _ := defaults.Registry().ListServices()

		for _, srv := range services {
			runningServices = append(runningServices, srv.Name)
		}

		// Removing install services
		registry.Default.Filter(func(s registry.Service) bool {
			re := regexp.MustCompile(common.ServiceInstall)

			if re.MatchString(s.Name()) {
				return true
			}

			return false
		})

		// Removing healthcheck services
		registry.Default.Filter(func(s registry.Service) bool {
			re := regexp.MustCompile(common.ServiceHealthCheck)

			if re.MatchString(s.Name()) {
				return true
			}

			return false
		})

		// Filtering services by tags
		registry.Default.Filter(func(s registry.Service) bool {
			for _, t := range filterListTags {
				for _, st := range s.Tags() {
					if t == st {
						return false
					}
				}
			}

			return len(filterListTags) > 0
		})

		// Filtering services by args
		registry.Default.Filter(func(s registry.Service) bool {
			for _, arg := range args {
				reArg := regexp.MustCompile(arg)
				if reArg.MatchString(s.Name()) {
					return false
				}
			}
			return len(args) > 0
		})

		// Adding child services by regexp
		registry.Default.Filter(func(s registry.Service) bool {
			reg := regexp.MustCompile(`^` + s.Name() + `\..*`)
			if reg == nil {
				return false
			}

			found := false
			for _, arg := range args {
				if reg.MatchString(arg) {
					found = true
				}
			}

			if len(args) == 0 || found {
				// Adding all running services that match the service regexp
				for _, r := range runningServices {
					if reg.MatchString(r) {
						service.NewService(
							service.Name(r),
							service.Tag(s.Tags()...),
							service.WithMicro(func(m micro.Service) error { return nil }),
						)
					}
				}
			}

			return false
		})

		// Re-building allServices list
		if s, err := registry.Default.ListServices(); err != nil {
			cmd.Print("Could not retrieve list of services")
			os.Exit(0)
		} else {
			allServices = s
		}
	},
	Run: func(cmd *cobra.Command, args []string) {
		t, _ := template.New("t1").Parse(tmpl)

		tags := []*Tags{
			{"GENERIC SERVICES", nil, getTagsPerType(func(s registry.Service) bool { return s.IsGeneric() })},
			{"GRPC SERVICES", nil, getTagsPerType(func(s registry.Service) bool { return s.IsGRPC() })},
			{"REST SERVICES", nil, getTagsPerType(func(s registry.Service) bool { return s.IsREST() })},
		}

		w := tabwriter.NewWriter(cmd.OutOrStdout(), 8, 8, 8, ' ', 0)
		t.Execute(w, tags)
	},
}

func init() {
	psCmd.Flags().BoolVarP(&showDescription, "verbose", "v", false, "Show additional information")
	psCmd.Flags().StringArrayVarP(&filterListTags, "tags", "t", []string{}, "Filter by tags")
	psCmd.Flags().StringArrayVarP(&filterListExclude, "exclude", "x", []string{}, "Filter")

	addNatsFlags(psCmd.Flags())
	addNatsStreamingFlags(psCmd.Flags())
	addRegistryFlags(psCmd.Flags())

	RootCmd.AddCommand(psCmd)
}

func getTagsPerType(f func(s registry.Service) bool) map[string]*Tags {
	tags := make(map[string]*Tags)
	for _, s := range allServices {
		name := s.Name()

		if f(s) {
			for _, tag := range s.Tags() {
				if _, ok := tags[tag]; !ok {
					tags[tag] = &Tags{Name: tag, Services: make(map[string]Service)}
				}

				var nodes []string
				if showDescription {
					for _, node := range s.RunningNodes() {
						nodes = append(nodes, fmt.Sprintf("%s:%d (exp: %s)", node.Address, node.Port, node.Metadata["expiry"]))
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

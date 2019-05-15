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
	"net"
	"os"
	"regexp"
	"text/tabwriter"
	"text/template"

	micro "github.com/micro/go-micro"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service"
)

var (
	showDescription   bool
	filterListTags    []string
	filterListExclude []string

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
					{{- ""}} {{.Name}}	[{{if .IsRunning}}X{{else}} {{end}}]	{{"\n"}}
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

// servicesListCmd lists available services and their statuses.
var servicesListCmd = &cobra.Command{
	Use:   "list",
	Short: "List all available services and their statuses",
	Long: `List all available services and their statuses

Use this command to list all running services on this machine.
Services fall into main categories (GENERIC, GRPC, REST, API) and are then
organized by tags (broker, data, idm, etc.)

### Example

Use the --tags/-t flag to limit display to one specific tag, use lowercase for tags.

$ ` + os.Args[0] + ` list -t=broker

- pydio.grpc.activity   [X]
- pydio.grpc.chat       [X]
- pydio.grpc.mailer     [X]
- pydio.api.websocket   [X]
- pydio.rest.activity   [X]
- pydio.rest.frontlogs  [X]
- pydio.rest.mailer     [X]

`,
	PreRun: func(cmd *cobra.Command, args []string) {
		// If we have an error (registry not running) the running list simply is empty
		services, _ := defaults.Registry().ListServices()
		for _, r := range services {
			// Initially, we retrieve each service to ensure we have the correct list
			ss, _ := defaults.Registry().GetService(r.Name)
			for _, s := range ss {
				for _, n := range s.Nodes {
					_, err := net.Dial("tcp", fmt.Sprintf("%s:%d", n.Address, n.Port))
					if err != nil {
						continue
					}

					runningServices = append(runningServices, s)
				}
			}
		}

		// Removing install services
		registry.Default.Filter(func(s registry.Service) bool {
			re := regexp.MustCompile(common.SERVICE_INSTALL)

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

		// Filtering services by regexp
		registry.Default.Filter(func(s registry.Service) bool {
			reg := s.Regexp()
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
					if reg.MatchString(r.Name) {
						service.NewService(
							service.Name(r.Name),
							service.Tag(s.Tags()...),
							service.WithMicro(func(m micro.Service) error { return nil }),
						)
					}
				}
				// Then filter out the one with just the regexp
				return true
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
	servicesListCmd.Flags().BoolVarP(&showDescription, "verbose", "v", false, "Show services description")
	servicesListCmd.Flags().StringArrayVarP(&filterListTags, "tags", "t", []string{}, "Filter by tags")
	servicesListCmd.Flags().StringArrayVarP(&filterListExclude, "exclude", "x", []string{}, "Filter")
	RootCmd.AddCommand(servicesListCmd)
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

				tags[tag].Services[name] = &runningService{name}
			}
		}
	}

	return tags
}

type runningService struct {
	name string
}

func (s *runningService) Name() string {
	return s.name
}

func (s *runningService) IsRunning() bool {
	for _, r := range runningServices {
		if r.Name == s.name {
			return true
		}
	}

	return false
}

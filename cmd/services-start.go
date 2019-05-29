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
	"context"
	"fmt"
	"os"
	"regexp"
	"sync"

	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/registry"
)

var (
	wg sync.WaitGroup

	FilterStartTags    []string
	FilterStartExclude []string
)

type serviceContext struct {
	ctx    context.Context
	cancel context.CancelFunc
}

// StartCmd represents the start command
var StartCmd = &cobra.Command{
	Use:   "start",
	Short: "Start Cells services",
	Long: `Start one or more services on this machine

### Syntax

$ ` + os.Args[0] + ` start [flags] args...

Additional arguments are regexp that can match any of the service names available (see 'list' command).
The -t/--tags flag may limit to only a certain category of services, use lowercase like broker, idm, data, etc...
The -x/--exclude flag may exclude one or more services
Both flags may be used in conjunction with the regexp arguments.

### Examples

Start only services starting with grpc
$ ` + os.Args[0] + ` start pydio.grpc

Start only services for scheduler
$ ` + os.Args[0] + ` start --tag=scheduler

Start whole plateform except the roles service
$ ` + os.Args[0] + ` start --exclude=pydio.grpc.idm.roles

`,
	PreRunE: func(cmd *cobra.Command, args []string) error {

		if !IsFork {
			if err := checkFdlimit(); err != nil {
				return err
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
			for _, t := range FilterStartTags {
				for _, st := range s.Tags() {
					if t == st {
						registry.ProcessStartTags = append(registry.ProcessStartTags, "t:"+t)
						return false
					}
				}
			}

			return len(FilterStartTags) > 0
		})

		// Filtering services by args
		registry.Default.Filter(func(s registry.Service) bool {
			for _, arg := range args {
				reArg := regexp.MustCompile(arg)
				if reArg.MatchString(s.Name()) {
					registry.ProcessStartTags = append(registry.ProcessStartTags, "s:"+s.Name())
					return false
				}
				if s.MatchesRegexp(arg) {
					registry.ProcessStartTags = append(registry.ProcessStartTags, "s:"+s.Name())
					return false
				}
			}
			return len(args) > 0
		})

		// Filtering services that have a regexp when there is no argument to the command
		registry.Default.Filter(func(s registry.Service) bool {
			if len(args) == 0 && s.Regexp() != nil {
				return true
			}
			return false
		})

		// Re-gather exclude flag (it is applied in root.go PersistentPreRun) for startTag
		for _, x := range FilterStartExclude {
			registry.ProcessStartTags = append(registry.ProcessStartTags, "x:"+x)
		}

		// Re-building allServices list
		if s, err := registry.Default.ListServices(); err != nil {
			return fmt.Errorf("Could not retrieve list of services")
		} else {
			allServices = s
		}

		return nil
	},

	Run: func(cmd *cobra.Command, args []string) {
		//var err errors

		// Start services that have not been deregistered via flags and filtering.
		for _, service := range allServices {
			if !IsFork && service.RequiresFork() {
				if !service.AutoStart() {
					continue
				}
				go service.ForkStart()
			} else {
				go service.Start()
			}
		}

		wg.Add(1)
		wg.Wait()
	},
}

func init() {
	StartCmd.Flags().StringArrayVarP(&FilterStartTags, "tags", "t", []string{}, "Filter by tags")
	StartCmd.Flags().StringArrayVarP(&FilterStartExclude, "exclude", "x", []string{}, "Filter")

	RootCmd.AddCommand(StartCmd)
}

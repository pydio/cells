// Copyright 2015 Light Code Labs, LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// +build !windows,!plan9,!nacl

package cmd

import (
	"fmt"
	"syscall"

	"github.com/pydio/cells/common"
)

// checkFdlimit issues a warning if the OS limit for
// max file descriptors is below a recommended minimum.
func checkFdlimit() error {
	const hardMin = 1024
	const recMin = 8192

	// Warn if ulimit is too low for production sites
	rlimit := &syscall.Rlimit{}
	err := syscall.Getrlimit(syscall.RLIMIT_NOFILE, rlimit)
	if err == nil && rlimit.Cur < hardMin {
		return fmt.Errorf("File descriptor limit %d is too low for %s. "+
			"At least %d is required, %d is recommended. Fix with \"ulimit -n %d\".\n", rlimit.Cur, common.PackageLabel, hardMin, recMin, recMin)
	} else if err == nil && rlimit.Cur < recMin {
		fmt.Printf("WARNING: File descriptor limit %d is too low for running %s in production. "+
			"At least %d is recommended. Fix with \"ulimit -n %d\".\n", rlimit.Cur, common.PackageLabel, recMin, recMin)
	}

	return nil
}

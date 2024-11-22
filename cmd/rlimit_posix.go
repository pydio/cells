//go:build !windows && !plan9 && !nacl
// +build !windows,!plan9,!nacl

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
	"syscall"

	"github.com/pydio/cells/v5/common"
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

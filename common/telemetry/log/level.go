/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package log

import (
	"fmt"
	"os"
	"regexp"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/runtime"
)

var (
	EmptyServiceKey = "empty"
	dynamicDebug    []string
	ddRegexp        []*regexp.Regexp
)

func init() {
	runtime.RegisterEnvVariable("CELLS_TRACE_FATAL", "", "Better display root cause of process crashes")
}

// SetDynamicDebugLevels overrides Info level for a specific subset of services
func SetDynamicDebugLevels(reset, level bool, services ...string) {
	if reset {
		dynamicDebug = []string{}
		return
	}
	singles := make(map[string]struct{})
	var updates []string
	var updatesR []*regexp.Regexp
	for _, k := range dynamicDebug {
		singles[k] = struct{}{}
	}
	for _, s := range services {
		if level {
			singles[s] = struct{}{}
		} else {
			delete(singles, s)
		}
	}
	for k := range singles {
		re, e := regexp.Compile(k)
		if e != nil {
			fmt.Println("Skipping dynamic level service name as it's not a valid regexp:", e.Error())
			continue
		}
		updates = append(updates, k)
		updatesR = append(updatesR, re)
	}
	dynamicDebug = updates
	ddRegexp = updatesR
	fmt.Println("Updating Dynamic Debug Services", dynamicDebug)
	resetLoggerPool(mainLoggerPool)
}

func getCoreLevel() zapcore.Level {
	if common.LogLevel == zap.DebugLevel || len(dynamicDebug) > 0 {
		return zap.DebugLevel
	} else {
		return zap.InfoLevel
	}
}

func mustIncrease(serviceName string) bool {
	if common.LogLevel == zap.DebugLevel {
		return false
	}
	if len(dynamicDebug) == 0 {
		return false
	}
	if serviceName == "" {
		serviceName = "empty"
	}
	for _, dd := range ddRegexp {
		if dd.MatchString(serviceName) {
			return false // Keep as Debug
		}
	}
	return true // Increase to Info
}

func traceFatalEnabled() bool {
	return os.Getenv("CELLS_TRACE_FATAL") != ""
}

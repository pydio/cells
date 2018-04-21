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

package jobs

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common"
)

/* job.go file enriches default genrated proto structs with some custom pydio methods to ease development */

/* LOGGING SUPPORT */

// Zap simply returns a zapcore.Field object populated with this Job under a standard key
func (job *Job) Zap() zapcore.Field {
	return zap.Any(common.KEY_JOB, job)
}

// ZapId simply calls zap.String() with JobId standard key and this Job Id
func (job *Job) ZapId() zapcore.Field {
	return zap.String(common.KEY_JOB_ID, job.GetID())
}

// Zap simply returns a zapcore.Field object populated with this Task under a standard key
func (task *Task) Zap() zapcore.Field {
	return zap.Any(common.KEY_TASK, task)
}

// ZapId simply calls zap.String() with TaskId standard key and this Task Id
func (task *Task) ZapId() zapcore.Field {
	return zap.String(common.KEY_TASK_ID, task.GetID())
}

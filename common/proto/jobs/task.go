/*
 * Copyright (c) 2025. Abstrium SAS <team (at) pydio.com>
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
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v5/common"
)

func (task *Task) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	encoder.AddString("ID", task.ID)
	encoder.AddString("Status", task.Status.String())
	encoder.AddString("StatusMessage", task.StatusMessage)
	encoder.AddString("TriggerOwner", task.TriggerOwner)
	encoder.AddString("JobID", task.JobID)
	if task.StartTime > 0 {
		encoder.AddTime("StartTime", time.Unix(int64(task.StartTime), 0))
	}
	if task.EndTime > 0 {
		encoder.AddTime("EndTime", time.Unix(int64(task.EndTime), 0))
	}
	if task.CanStop {
		encoder.AddBool("CanStop", task.CanStop)
	}
	if task.CanPause {
		encoder.AddBool("CanPause", task.CanPause)
	}
	if task.HasProgress {
		encoder.AddBool("HasProgress", task.HasProgress)
		encoder.AddFloat32("Progress", task.Progress)
	}
	return nil
}

// Zap simply returns a zapcore.Field object populated with this Task under a standard key
func (task *Task) Zap() zapcore.Field {
	return zap.Object(common.KeyTask, task)
}

// ZapId simply calls zap.String() with TaskId standard key and this Task Id
func (task *Task) ZapId() zapcore.Field {
	return zap.String(common.KeyTaskId, task.GetID())
}

func (task *Task) GetCtxOperationID() string {
	return task.GetJobID() + "-" + task.GetID()[0:8]
}

func (task *Task) UserSpaceErrorStatus() bool {
	if task.Status == TaskStatus_Error && task.StatusMessage != "" {
		task.StatusMessage = "Oops, something went wrong"
		return true
	}
	return false
}

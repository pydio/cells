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

import "github.com/pydio/cells/common/proto/jobs"

// DAO provides method interface to access the store for scheduler job and task definitions.
type DAO interface {
	PutJob(job *jobs.Job) error
	GetJob(jobId string, withTasks jobs.TaskStatus) (*jobs.Job, error)
	DeleteJob(jobId string) error
	ListJobs(owner string, eventsOnly bool, timersOnly bool, withTasks jobs.TaskStatus, taskCursor ...int32) (chan *jobs.Job, chan bool, error)

	PutTask(task *jobs.Task) error
	ListTasks(jobId string, taskStatus jobs.TaskStatus, cursor ...int32) (chan *jobs.Task, chan bool, error)
	DeleteTasks(jobId string, taskId []string) error
}

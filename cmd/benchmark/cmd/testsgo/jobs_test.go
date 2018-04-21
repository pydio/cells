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

package tests

func init() {
	register("JobService", map[string]map[string]string{
		"create": {
			"PutTask":       `{"Task": {"ID": "{{.Random}}", "JobID": "fake-long-job", "Status": 0, "StatusMessage": "test", "TriggerOwner": "test", "StartTime": 0, "EndTime": 0, "CanStop": true, "CanPause": true, "HasProgress": true, "Progress": 0, "ActionsLogs": []}}`,
			"PutTaskStream": `{"Task": {"ID": "{{.Random}}", "JobID": "fake-long-job", "Status": 0, "StatusMessage": "test", "TriggerOwner": "test", "StartTime": 0, "EndTime": 0, "CanStop": true, "CanPause": true, "HasProgress": true, "Progress": 0, "ActionsLogs": []}}`,
		},
	})
}

// *****************************************************************************
//  Services Jobs: Stores Jobs and associated tasks.
// *****************************************************************************
// service JobService{
//     rpc PutJob(PutJobRequest) returns (PutJobResponse) {};
//     rpc GetJob(GetJobRequest) returns (GetJobResponse) {};
//     rpc DeleteJob(DeleteJobRequest) returns (DeleteJobResponse) {};
//     rpc ListJobs(ListJobsRequest) returns (stream ListJobsResponse){};
//
//     rpc PutTask(PutTaskRequest) returns (PutTaskResponse) {};
//     rpc PutTaskStream(stream PutTaskRequest) returns (stream PutTaskResponse) {};
//     rpc ListTasks(ListTasksRequest) returns (stream ListTasksResponse){};
//     rpc DeleteTasks(DeleteTasksRequest) returns (DeleteTasksResponse) {};
// }

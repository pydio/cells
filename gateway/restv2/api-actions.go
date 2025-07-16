/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package restv2

import (
	"context"
	"time"

	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v5/common/client/commons/jobsc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/middleware"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/utils/std"
	rest2 "github.com/pydio/cells/v5/scheduler/jobs/rest"
	"github.com/pydio/cells/v5/scheduler/jobs/userspace"
)

// PerformAction answers to POST /node/action/{Name}
func (h *Handler) PerformAction(req *restful.Request, resp *restful.Response) error {
	actionName := req.PathParameter("Name")
	var actionID rest.UserActionType
	if id, ok := rest.UserActionType_value[actionName]; ok {
		actionID = rest.UserActionType(id)
	} else {
		return errors.WithMessage(errors.StatusNotFound, "action not found")
	}
	input := &rest.ActionParameters{}
	if err := req.ReadEntity(input); err != nil {
		return err
	}
	ctx := req.Request.Context()
	ll := middleware.DetectedLanguages(ctx)
	var jj []*jobs.Job
	router := h.TreeHandler.GetRouter()
	ur := h.UuidClient(true)

	var inPaths []string

	// Pre-parse params
	for _, n := range input.GetNodes() {
		if pa := n.GetPath(); pa != "" {
			inPaths = append(inPaths, pa)
		} else if uid := n.GetUuid(); uid != "" {
			if rsp, er := ur.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: uid}}); er != nil {
				return errors.WithMessage(errors.NodeNotFound, "cannot find node with uuid "+uid)
			} else {
				inPaths = append(inPaths, rsp.GetNode().GetPath())
			}
		} else {
			return errors.WithMessage(errors.InvalidParameters, "locators must provide at least a path or a uuid")
		}
	}
	// deduplicate just in case
	inPaths = std.Unique(inPaths)

	switch actionID {
	case rest.UserActionType_copy, rest.UserActionType_move:
		cmo := input.GetCopyMoveOptions()
		if len(inPaths) == 0 || cmo == nil || cmo.GetTargetPath() == "" {
			return errors.WithMessage(errors.StatusBadRequest, "invalid copy/move parameters (no input nodes or target path)")
		}
		targetIsParent := cmo.GetTargetIsParent()
		j, er := userspace.CopyMoveTask(ctx, router, inPaths, cmo.GetTargetPath(), targetIsParent, actionID == rest.UserActionType_move, ll...)
		if er != nil {
			return errors.Tag(er, errors.StatusInternalServerError)
		}
		jj = append(jj, j)

	case rest.UserActionType_compress, rest.UserActionType_extract:
		archiveOptions := input.GetExtractCompressOptions()
		if len(inPaths) == 0 || archiveOptions == nil || archiveOptions.GetTargetPath() == "" {
			return errors.WithMessage(errors.StatusBadRequest, "invalid action parameters (no input nodes found or target path)")
		}
		format := archiveOptions.GetArchiveFormat()
		if format == "" {
			return errors.WithMessage(errors.StatusBadRequest, "invalid action parameters (missing format)")
		}
		var job *jobs.Job
		var er error
		if actionID == rest.UserActionType_compress {
			job, er = userspace.CompressTask(ctx, router, inPaths, archiveOptions.GetTargetPath(), archiveOptions.GetArchiveFormat(), ll...)
		} else {
			job, er = userspace.ExtractTask(ctx, router, inPaths[0], archiveOptions.GetTargetPath(), archiveOptions.GetArchiveFormat(), ll...)
		}
		if er != nil {
			return errors.Tag(er, errors.StatusInternalServerError)
		}
		jj = append(jj, job)

	case rest.UserActionType_delete:

		if len(inPaths) == 0 {
			return errors.WithMessage(errors.StatusBadRequest, "invalid action parameters")
		}
		var removePermanently bool
		if delOpts := input.GetDeleteOptions(); delOpts != nil {
			removePermanently = delOpts.GetPermanentDelete()
		}
		delJobs, er := userspace.DeleteNodesTask(ctx, router, inPaths, removePermanently, ll...)
		if er != nil {
			return errors.Tag(er, errors.StatusInternalServerError)
		}
		jj = append(jj, delJobs...)

	case rest.UserActionType_restore:

		if len(inPaths) == 0 {
			return errors.WithMessage(errors.StatusBadRequest, "invalid action parameters")
		}
		resJobs, _, er := userspace.RestoreTask(ctx, router, inPaths, ll...)
		if er != nil {
			return errors.Tag(er, errors.StatusInternalServerError)
		}
		jj = append(jj, resJobs...)

	}

	// Monitor Job and block until it's done!
	if input.GetAwaitStatus() > 0 {
		duration, er := time.ParseDuration(input.GetAwaitTimeout())
		if er != nil {
			return errors.Tag(er, errors.StatusBadRequest)
		}
		interval := duration / 10
		if interval < 100*time.Millisecond {
			interval = 100 * time.Millisecond
		}
		var bb []*rest.BackgroundAction
		er = std.Retry(ctx, func() error {
			var tasks []*rest.BackgroundAction
			for _, j := range jj {
				a, t, e := h.backgroundActionForJob(ctx, actionName, j.GetID())
				if e != nil || t == "" || a.Status != input.GetAwaitStatus() {
					return errors.New("not ready")
				}
				tasks = append(tasks, a)
			}
			bb = tasks
			return nil
		}, interval, duration)
		if er != nil {
			return errors.WithMessage(errors.StatusRequestTimeout, "could not receive a task status in the requested time frame")
		}
		return resp.WriteEntity(&rest.PerformActionResponse{
			Status:            rest.ActionStatus_Performed,
			BackgroundActions: bb,
		})
	} else {
		ar := &rest.PerformActionResponse{
			Status: rest.ActionStatus_Background,
		}
		for _, j := range jj {
			ar.BackgroundActions = append(ar.BackgroundActions, &rest.BackgroundAction{
				Name:    actionName,
				JobUuid: j.GetID(),
				Label:   j.GetLabel(),
				Status:  jobs.TaskStatus_Unknown,
			})
		}
		return resp.WriteEntity(ar)
	}
}

// BackgroundActionInfo answers to GET /node/action/{Name}/{JobUuid}
func (h *Handler) BackgroundActionInfo(req *restful.Request, resp *restful.Response) error {
	ctx := req.Request.Context()
	ba, _, er := h.backgroundActionForJob(ctx, req.PathParameter("Name"), req.PathParameter("JobUuid"))
	if er != nil {
		return er
	}
	return resp.WriteEntity(ba)
}

// ControlBackgroundAction answers to PATCH /node/action/{Name}/{JobUuid}
func (h *Handler) ControlBackgroundAction(req *restful.Request, resp *restful.Response) error {
	var cr jobs.CtrlCommand
	if err := req.ReadEntity(&cr); err != nil {
		return err
	}
	ctx := req.Request.Context()
	actionName := req.PathParameter("Name")
	jobUuid := req.PathParameter("JobUuid")
	// Find corresponding task
	_, task, er := h.backgroundActionForJob(ctx, actionName, jobUuid)
	if er != nil {
		return er
	}
	if task == "" {
		return errors.WithMessage(errors.StatusNotFound, "cannot find task for this job")
	}
	cr.JobId = jobUuid
	cr.TaskId = task
	_, err := rest2.SendControlCommand(ctx, &cr)
	if err != nil {
		return errors.Tag(err, errors.StatusInternalServerError)
	}

	ba, _, er := h.backgroundActionForJob(ctx, actionName, jobUuid)
	if er != nil {
		return er
	}

	return resp.WriteEntity(ba)
}

func (h *Handler) backgroundActionForJob(ctx context.Context, actionName, id string) (*rest.BackgroundAction, string, error) {
	cli := jobsc.JobServiceClient(ctx)
	j, e := cli.GetJob(ctx, &jobs.GetJobRequest{
		JobID:     id,
		LoadTasks: jobs.TaskStatus_Any,
	})
	if e != nil {
		return nil, "", e
	}
	var taskUuid string
	ba := &rest.BackgroundAction{
		Name:    actionName,
		JobUuid: j.GetJob().GetID(),
		Label:   j.GetJob().GetLabel(),
	}
	if len(j.GetJob().GetTasks()) > 0 {
		t := j.GetJob().GetTasks()[0]
		taskUuid = t.GetID()
		ba.Status = t.GetStatus()
		ba.StatusMessage = t.GetStatusMessage()
		ba.HasProgress = t.GetHasProgress()
		ba.Progress = t.GetProgress()
		ba.CanStop = t.GetCanStop()
		ba.CanPause = t.GetCanPause()
		ba.StartTime = t.GetStartTime()
		ba.EndTime = t.GetEndTime()
	}
	return ba, taskUuid, nil
}

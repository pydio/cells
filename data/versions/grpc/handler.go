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

package grpc

import (
	"context"
	"net/url"
	"sync"
	"time"

	"github.com/micro/go-micro/errors"
	"github.com/pborman/uuid"
	"go.uber.org/zap"

	"github.com/pydio/cells/broker/activity"
	"github.com/pydio/cells/broker/activity/render"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	activity2 "github.com/pydio/cells/common/proto/activity"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/i18n"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/cells/data/versions"
)

type Handler struct {
	db versions.DAO
}

func (h *Handler) buildVersionDescription(ctx context.Context, version *tree.ChangeLog) string {
	var description string
	if version.OwnerUuid != "" && version.Event != nil {
		serverLinks := render.NewServerLinks()
		serverLinks.URLS[render.ServerUrlTypeUsers], _ = url.Parse("user://")
		ac, _ := activity.DocumentActivity(version.OwnerUuid, version.Event)
		description = render.Markdown(ac, activity2.SummaryPointOfView_SUBJECT, i18n.UserLanguageFromContext(ctx, config.Get(), true), serverLinks)
	} else {
		description = "N/A"
	}
	return description
}

func NewChangeLogFromNode(ctx context.Context, node *tree.Node, event *tree.NodeChangeEvent) *tree.ChangeLog {

	c := &tree.ChangeLog{}
	c.Uuid = uuid.NewUUID().String()
	c.Data = []byte(node.Etag)
	c.MTime = node.MTime
	c.Size = node.Size
	c.Event = event
	c.OwnerUuid, _ = permissions.FindUserNameInContext(ctx)
	return c

}

func (h *Handler) ListVersions(ctx context.Context, request *tree.ListVersionsRequest, versionsStream tree.NodeVersioner_ListVersionsStream) error {

	log.Logger(ctx).Debug("[VERSION] ListVersions for node ", request.Node.Zap())
	logs, done := h.db.GetVersions(request.Node.Uuid)
	defer versionsStream.Close()

	for {
		select {
		case l := <-logs:
			if l.GetLocation() == nil {
				l.Location = versions.DefaultLocation(request.Node.Uuid, l.Uuid)
			}
			l.Description = h.buildVersionDescription(ctx, l)
			resp := &tree.ListVersionsResponse{Version: l}
			e := versionsStream.Send(resp)
			log.Logger(ctx).Debug("[VERSION] Sending version ", zap.Any("resp", resp), zap.Error(e))
		case <-done:
			return nil
		}
	}

}

func (h *Handler) HeadVersion(ctx context.Context, request *tree.HeadVersionRequest, resp *tree.HeadVersionResponse) error {

	v, e := h.db.GetVersion(request.Node.Uuid, request.VersionId)
	if e != nil {
		return e
	}
	if (v != &tree.ChangeLog{}) {
		if v.GetLocation() == nil {
			v.Location = versions.DefaultLocation(request.Node.Uuid, v.Uuid)
		}
		resp.Version = v
	}
	return nil
}

func (h *Handler) CreateVersion(ctx context.Context, request *tree.CreateVersionRequest, resp *tree.CreateVersionResponse) error {

	log.Logger(ctx).Debug("[VERSION] GetLastVersion for node " + request.Node.Uuid)
	last, err := h.db.GetLastVersion(request.Node.Uuid)
	if err != nil {
		return err
	}
	log.Logger(ctx).Debug("[VERSION] GetLastVersion for node ", zap.Any("last", last), zap.Any("request", request))
	if last == nil || string(last.Data) != request.Node.Etag {
		resp.Version = NewChangeLogFromNode(ctx, request.Node, request.TriggerEvent)
	}
	return nil
}

func (h *Handler) StoreVersion(ctx context.Context, request *tree.StoreVersionRequest, resp *tree.StoreVersionResponse) error {

	p := versions.PolicyForNode(ctx, request.Node)
	if p == nil {
		log.Logger(ctx).Info("Ignoring StoreVersion for this node")
		return nil
	}
	log.Logger(ctx).Info("Storing Version for node ", request.Node.ZapUuid())
	err := h.db.StoreVersion(request.Node.Uuid, request.Version)
	if err == nil {
		resp.Success = true
	}

	pruningPeriods, err := versions.PreparePeriods(time.Now(), p.KeepPeriods)
	if err != nil {
		log.Logger(ctx).Error("cannot prepare periods for versions policy", p.Zap(), zap.Error(err))
	}
	logs, done := h.db.GetVersions(request.Node.Uuid)
	pruningPeriods, err = versions.DispatchChangeLogsByPeriod(pruningPeriods, logs, done)
	log.Logger(ctx).Debug("[VERSION] Pruning Periods", log.DangerouslyZapSmallSlice("p", pruningPeriods))
	var toRemove []*tree.ChangeLog
	for _, period := range pruningPeriods {
		out := period.Prune()
		toRemove = append(toRemove, out...)
	}
	if p.MaxSizePerFile > 0 {
		out, _ := versions.PruneAllWithMaxSize(pruningPeriods, p.MaxSizePerFile)
		toRemove = append(toRemove, out...)
	}
	if len(toRemove) > 0 {
		log.Logger(ctx).Debug("[VERSION] Pruning should remove", zap.Int("number", len(toRemove)))
		if err := h.db.DeleteVersionsForNode(request.Node.Uuid, toRemove...); err != nil {
			return err
		}
		resp.PruneVersions = toRemove
	}
	for _, pv := range resp.PruneVersions {
		if pv.Location == nil {
			pv.Location = versions.DefaultLocation(request.Node.Uuid, pv.Uuid)
		}
	}

	return err
}

func (h *Handler) PruneVersions(ctx context.Context, request *tree.PruneVersionsRequest, resp *tree.PruneVersionsResponse) error {

	cl := tree.NewNodeProviderClient(common.ServiceGrpcNamespace_+common.ServiceTree, defaults.NewClient())

	var idsToDelete []string

	if request.AllDeletedNodes {

		// Load whole tree in memory
		existingIds := make(map[string]struct{})
		streamer, sErr := cl.ListNodes(ctx, &tree.ListNodesRequest{Node: &tree.Node{Path: "/"}, Recursive: true})
		if sErr != nil {
			return sErr
		}
		defer streamer.Close()
		for {
			r, e := streamer.Recv()
			if e != nil {
				break
			}
			existingIds[r.Node.GetUuid()] = struct{}{}
		}

		wg := &sync.WaitGroup{}
		wg.Add(1)
		runner := func() error {
			defer wg.Done()
			uuids, done, errs := h.db.ListAllVersionedNodesUuids()
			for {
				select {
				case id := <-uuids:
					if _, o := existingIds[id]; !o {
						idsToDelete = append(idsToDelete, id)
					}
				case e := <-errs:
					return e
				case <-done:
					return nil
				}
			}
		}
		err := runner()
		wg.Wait()
		if err != nil {
			return err
		}

	} else if request.UniqueNode != nil {

		idsToDelete = append(idsToDelete, request.UniqueNode.Uuid)

	} else {

		return errors.BadRequest(common.ServiceVersions, "Please provide at least a node Uuid or set the flag AllDeletedNodes to true")

	}

	for _, i := range idsToDelete {

		allLogs, done := h.db.GetVersions(i)
		wg := &sync.WaitGroup{}
		wg.Add(1)
		go func() {
			defer wg.Done()
			for {
				select {
				case cLog := <-allLogs:
					if cLog.Location == nil {
						cLog.Location = versions.DefaultLocation(i, cLog.Uuid)
					} else {
						cLog.Location.Type = tree.NodeType_LEAF
					}
					resp.DeletedVersions = append(resp.DeletedVersions, cLog)
				case <-done:
					return
				}
			}
		}()
		wg.Wait()
	}

	if e := h.db.DeleteVersionsForNodes(idsToDelete); e != nil {
		return e
	}

	log.Logger(ctx).Debug("Responding to Prune with versions", zap.Int("versions", len(resp.DeletedVersions)))

	return nil
}

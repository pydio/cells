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

package events

import (
	"context"
	"fmt"
	"io"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"
)

func WithAudit() nodes.Option {
	return func(options *nodes.RouterOptions) {
		if options.AuditEvent {
			options.Wrappers = append(options.Wrappers, &HandlerAudit{})
		}
	}
}

// HandlerAudit is responsible for auditing all events on Nodes
// as soon as the router's option flag "AuditEvent" is set to true.
type HandlerAudit struct {
	abstract.Handler
}

func (h *HandlerAudit) Adapt(c nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	h.AdaptOptions(c, options)
	return h
}

// GetObject logs an audit message on each GetObject Events after calling following handlers.
func (h *HandlerAudit) GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error) {
	auditer := log.Auditer(ctx)
	reader, e := h.Next.GetObject(ctx, node, requestData)

	isBinary, wsInfo, wsScope := checkBranchInfoForAudit(ctx, "in")
	if isBinary {
		return reader, e // do not audit thumbnail events
	}
	if e == nil && requestData.StartOffset == 0 {
		auditer.Info(
			fmt.Sprintf("Retrieved object at %s", node.Path),
			log.GetAuditId(common.AuditObjectGet),
			node.ZapUuid(),
			node.ZapPath(),
			wsInfo,
			wsScope,
		)
	}

	return reader, e
}

// PutObject logs an audit message after calling following handlers.
func (h *HandlerAudit) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (models.ObjectInfo, error) {
	auditer := log.Auditer(ctx)
	written, e := h.Next.PutObject(ctx, node, reader, requestData)
	if e != nil {
		return written, e
	}

	isBinary, wsInfo, wsScope := checkBranchInfoForAudit(ctx, "in")
	if isBinary {
		return written, e // do not audit thumbnail events
	}

	auditer.Info(
		fmt.Sprintf("Modified %s, put %d bytes", node.Path, written.Size),
		log.GetAuditId(common.AuditObjectPut),
		node.ZapUuid(),
		node.ZapPath(),
		wsInfo,
		wsScope,
		zap.Error(e), // empty if e == nil
	)

	return written, e
}

// ReadNode only forwards call to Next handler, it call too often to provide useful audit info.
func (h *HandlerAudit) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...grpc.CallOption) (*tree.ReadNodeResponse, error) {
	response, e := h.Next.ReadNode(ctx, in, opts...)
	return response, e

	// We do not log ReadNode events for the time being
	// isBinary, wsInfo, wsScope := checkBranchInfoForAudit(ctx, "in")
	// if isBinary {
	// 	return response, e // do not audit thumbnail events
	// }

	// log.Auditer(ctx).Info(
	// 	"[handler-audit-event] ReadNode",
	// 	log.GetAuditId(common.AuditNodeRead),
	// 	in.N.ZapUuid(),
	// 	in.N.ZapPath(),
	// 	wsInfo,
	// 	wsScope,
	// 	zap.Any("ReadNodeRequest", in),
	// )
}

// ListNodes logs an audit message on each call after having transferred the call to following handlers.
func (h *HandlerAudit) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...grpc.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	c, e := h.Next.ListNodes(ctx, in, opts...)
	if e != nil {
		return c, e
	}

	_, wsInfo, wsScope := checkBranchInfoForAudit(ctx, "in")
	log.Auditer(ctx).Info(
		fmt.Sprintf("Listed folder %s", in.Node.Path),
		log.GetAuditId(common.AuditNodeList),
		in.Node.ZapUuid(),
		in.Node.ZapPath(),
		wsInfo,
		wsScope,
		zap.Any("listNodeRequest", in),
	)

	return c, e
}

// CreateNode logs an audit message on each call after having transferred the call to following handlers.
func (h *HandlerAudit) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...grpc.CallOption) (*tree.CreateNodeResponse, error) {
	response, e := h.Next.CreateNode(ctx, in, opts...)
	if e != nil {
		return response, e
	}

	_, wsInfo, wsScope := checkBranchInfoForAudit(ctx, "in")
	log.Auditer(ctx).Info(
		fmt.Sprintf("Created node at %s", in.Node.Path),
		log.GetAuditId(common.AuditNodeCreate),
		in.Node.ZapUuid(),
		in.Node.ZapPath(),
		wsInfo,
		wsScope,
		zap.Any("CreateNodeRequest", in),
	)
	return response, e
}

// UpdateNode logs an audit message on each call after having transferred the call to following handlers.
func (h *HandlerAudit) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...grpc.CallOption) (*tree.UpdateNodeResponse, error) {
	response, e := h.Next.UpdateNode(ctx, in, opts...)
	if e != nil {
		return response, e
	}

	log.Auditer(ctx).Info(
		fmt.Sprintf("Update node from %s to %s", in.From.Path, in.To.Path),
		log.GetAuditId(common.AuditNodeUpdate),
		in.From.ZapUuid(),
		in.From.ZapPath(),
		zap.Any("UpdateNodeRequest", in),
	)

	return response, e
}

// DeleteNode logs an audit message on each call after having transferred the call to following handlers.
func (h *HandlerAudit) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...grpc.CallOption) (*tree.DeleteNodeResponse, error) {
	response, e := h.Next.DeleteNode(ctx, in, opts...)
	if e != nil {
		return response, e
	}
	_, wsInfo, wsScope := checkBranchInfoForAudit(ctx, "in")
	log.Auditer(ctx).Info(
		fmt.Sprintf("Deleted node at %s", in.Node.Path),
		log.GetAuditId(common.AuditNodeDelete),
		in.Node.ZapUuid(),
		in.Node.ZapPath(),
		wsInfo,
		wsScope,
		zap.Any("DeleteNodeRequest", in),
	)

	return response, e
}

func (h *HandlerAudit) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (models.ObjectInfo, error) {
	size, e := h.Next.CopyObject(ctx, from, to, requestData)
	if e != nil {
		return size, e
	}
	_, wsInfo, wsScope := checkBranchInfoForAudit(ctx, "in")
	log.Auditer(ctx).Info(
		fmt.Sprintf("Copied node from %s to %s", from.Path, to.Path),
		log.GetAuditId(common.AuditNodeCreate),
		from.ZapUuid(),
		from.ZapPath(),
		wsInfo,
		wsScope,
	)
	return size, e
}

// Multi part upload management

func (h *HandlerAudit) MultipartCreate(ctx context.Context, target *tree.Node, requestData *models.MultipartRequestData) (string, error) {
	return h.Next.MultipartCreate(ctx, target, requestData)
}

func (h *HandlerAudit) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *models.PutRequestData) (models.MultipartObjectPart, error) {
	return h.Next.MultipartPutObjectPart(ctx, target, uploadID, partNumberMarker, reader, requestData)
}

func (h *HandlerAudit) MultipartComplete(ctx context.Context, target *tree.Node, uploadID string, uploadedParts []models.MultipartObjectPart) (models.ObjectInfo, error) {
	oi, e := h.Next.MultipartComplete(ctx, target, uploadID, uploadedParts)
	if e != nil {
		return oi, e
	}
	_, wsInfo, wsScope := checkBranchInfoForAudit(ctx, "in")
	log.Auditer(ctx).Info(
		fmt.Sprintf("Uploaded node %s", target.Path),
		log.GetAuditId(common.AuditNodeCreate),
		target.ZapUuid(),
		target.ZapPath(),
		wsInfo,
		wsScope,
	)

	return oi, e
}

func (h *HandlerAudit) MultipartAbort(ctx context.Context, target *tree.Node, uploadID string, requestData *models.MultipartRequestData) error {
	return h.Next.MultipartAbort(ctx, target, uploadID, requestData)
}

func (h *HandlerAudit) MultipartList(ctx context.Context, prefix string, requestData *models.MultipartRequestData) (models.ListMultipartUploadsResult, error) {
	return h.Next.MultipartList(ctx, prefix, requestData)
}

func (h *HandlerAudit) MultipartListObjectParts(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, maxParts int) (models.ListObjectPartsResult, error) {
	return h.Next.MultipartListObjectParts(ctx, target, uploadID, partNumberMarker, maxParts)
}

/* HELPER METHODS */
// checkBranchInfoForAudit simply gather relevant information from the branch info before calling the Audit log.
func checkBranchInfoForAudit(ctx context.Context, identifier string) (isBinary bool, wsInfo zapcore.Field, wsScope zapcore.Field) {
	// Retrieve Datasource and Workspace info
	wsInfo = zap.String(common.KeyWorkspaceUuid, "")
	wsScope = zap.String(common.KeyWorkspaceScope, "")

	branchInfo, ok := nodes.GetBranchInfo(ctx, identifier)
	if ok && branchInfo.IsInternal() {
		return true, wsInfo, wsScope
	}

	// Try to retrieve Wksp UUID
	if ok && branchInfo.Workspace != nil && branchInfo.Workspace.UUID != "" {
		wsInfo = zap.String(common.KeyWorkspaceUuid, branchInfo.Workspace.UUID)
		wsScope = zap.String(common.KeyWorkspaceScope, branchInfo.Scope.String())
	}
	return false, wsInfo, wsScope
}

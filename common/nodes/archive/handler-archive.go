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

package archive

import (
	"context"
	"io"
	"path"
	"strings"
	"time"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/commons/docstorec"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/abstract"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/docstore"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

func WithArchives() nodes.Option {
	return func(options *nodes.RouterOptions) {
		options.Wrappers = append(options.Wrappers, NewArchiveHandler())
	}
}

type selectionProvider interface {
	getSelectionByUuid(ctx context.Context, selectionUuid string) (bool, []*tree.Node, error)
	deleteSelectionByUuid(ctx context.Context, selectionUuid string)
}

// Handler dynamically create archives when downloading folders and supports archive contents listing.
type Handler struct {
	abstract.Handler
	selectionProvider selectionProvider
}

func (a *Handler) Adapt(h nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	a.AdaptOptions(h, options)
	return a
}

// NewArchiveHandler creates a new Handler
func NewArchiveHandler() *Handler {
	a := &Handler{}
	a.selectionProvider = a
	return a
}

// GetObject overrides the response of GetObject if it is sent on a folder key : create an archive on-the-fly.
func (a *Handler) GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error) {

	originalPath := node.Path

	if ok, format, archivePath, innerPath := a.isArchivePath(ctx, originalPath); ok && len(innerPath) > 0 {
		extractor := &Reader{Router: a.Next}
		statResp, _ := a.Next.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: archivePath}})
		archiveNode := statResp.Node
		log.Logger(ctx).Debug("[ARCHIVE:GET] "+archivePath+" -- "+innerPath, zap.Any("archiveNode", archiveNode))

		if format == "zip" {
			return extractor.ReadChildZip(ctx, archiveNode, innerPath)
		} else {
			reader, writer := io.Pipe()
			gzip := false
			if format == "tar.gz" {
				gzip = true
			}
			go func() {
				extractor.ReadChildTar(ctx, gzip, writer, archiveNode, innerPath)
			}()
			return reader, nil
		}

	}

	readCloser, err := a.Next.GetObject(ctx, node, requestData)
	if err != nil {
		if selectionUuid := a.selectionFakeName(originalPath); selectionUuid != "" {
			ok, selection, er := a.selectionProvider.getSelectionByUuid(ctx, selectionUuid)
			if er != nil {
				return readCloser, er
			}
			if ok && len(selection) > 0 {
				ext := strings.Trim(path.Ext(originalPath), ".")
				r, w := io.Pipe()
				go func() {
					defer w.Close()
					defer func() {
						// Delete selection after download
						a.selectionProvider.deleteSelectionByUuid(a.RuntimeCtx, selectionUuid)
					}()
					a.generateArchiveFromSelection(ctx, w, selection, ext)
				}()
				return r, nil
			}
		} else if testFolder := a.archiveFolderName(originalPath); len(testFolder) > 0 {
			// Send a ReadNodeRequest.ObjectStats on folder to check for specific download permission
			if _, e := a.Next.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{
				Path:      testFolder,
				MetaStore: map[string]string{nodes.MetaAclCheckDownload: "true"},
			}}); e != nil {
				return nil, e
			}
			r, w := io.Pipe()
			go func() {
				defer w.Close()
				a.generateArchiveFromFolder(ctx, w, originalPath)
			}()
			return r, nil
		}
	}

	return readCloser, err

}

// ReadNode overrides the response of ReadNode to create a fake stat for archive file
func (a *Handler) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...grpc.CallOption) (*tree.ReadNodeResponse, error) {
	originalPath := in.Node.Path

	if ok, format, archivePath, innerPath := a.isArchivePath(ctx, originalPath); ok && len(innerPath) > 0 {
		log.Logger(ctx).Debug("[ARCHIVE:READ] " + originalPath + " => " + archivePath + " -- " + innerPath)
		extractor := &Reader{Router: a.Next}
		statResp, _ := a.Next.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: archivePath}})
		archiveNode := statResp.Node

		var statNode *tree.Node
		var err error
		if format == "zip" {
			statNode, err = extractor.StatChildZip(ctx, archiveNode, innerPath)
		} else {
			gzip := false
			if format == "tar.gz" {
				gzip = true
			}
			statNode, err = extractor.StatChildTar(ctx, gzip, archiveNode, innerPath)
		}
		if err == nil {
			if statNode.Size == 0 {
				statNode.Size = -1
			}
			statNode.MustSetMeta(common.MetaNamespaceNodeName, path.Base(statNode.Path))
		}
		return &tree.ReadNodeResponse{Node: statNode}, err
	}

	response, err := a.Next.ReadNode(ctx, in, opts...)
	if err != nil {
		// Check if it's a selection Uuid
		if selectionUuid := a.selectionFakeName(originalPath); selectionUuid != "" {
			ok, selection, er := a.selectionProvider.getSelectionByUuid(ctx, selectionUuid)
			if er != nil {
				return response, er
			}
			if ok && len(selection) > 0 {
				// Send a fake stat
				fakeNode := &tree.Node{
					Path:      path.Dir(originalPath) + "selection.zip",
					Type:      tree.NodeType_LEAF,
					Size:      -1,
					Etag:      selectionUuid,
					MTime:     time.Now().Unix(),
					MetaStore: map[string]string{"name": "selection.zip"},
				}
				return &tree.ReadNodeResponse{Node: fakeNode}, nil
			}
		} else if folderName := a.archiveFolderName(originalPath); folderName != "" {
			// Check if it's a folder
			fakeNode, err := a.archiveFakeStat(ctx, originalPath)
			if err == nil && fakeNode != nil {
				response = &tree.ReadNodeResponse{
					Node: fakeNode,
				}
				return response, nil
			}
		}
	}
	return response, err
}

func (a *Handler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...grpc.CallOption) (tree.NodeProvider_ListNodesClient, error) {

	if ok, format, archivePath, innerPath := a.isArchivePath(ctx, in.Node.Path); ok {
		extractor := &Reader{Router: a.Next}
		statResp, e := a.Next.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: archivePath}})
		if e != nil {
			return nil, e
		}
		archiveNode := statResp.Node

		if in.Limit == 1 && innerPath == "" {
			archiveNode.Type = tree.NodeType_COLLECTION
			streamer := nodes.NewWrappingStreamer(ctx)
			go func() {
				defer streamer.CloseSend()
				log.Logger(ctx).Debug("[ARCHIVE:LISTNODE/READ]", zap.String("path", archiveNode.Path))
				streamer.Send(&tree.ListNodesResponse{Node: archiveNode})
			}()
			return streamer, nil
		}

		log.Logger(ctx).Debug("[ARCHIVE:LIST] "+archivePath+" -- "+innerPath, zap.Any("archiveNode", archiveNode))
		var children []*tree.Node
		var err error
		if format == "zip" {
			children, err = extractor.ListChildrenZip(ctx, archiveNode, innerPath)
		} else {
			gzip := false
			if format == "tar.gz" {
				gzip = true
			}
			children, err = extractor.ListChildrenTar(ctx, gzip, archiveNode, innerPath)
		}
		streamer := nodes.NewWrappingStreamer(ctx)
		if err != nil {
			return streamer, err
		}
		go func() {
			defer streamer.CloseSend()
			for _, child := range children {
				log.Logger(ctx).Debug("[ARCHIVE:LISTNODE]", zap.String("path", child.Path))
				streamer.Send(&tree.ListNodesResponse{Node: child})
			}
		}()
		return streamer, nil
	}

	return a.Next.ListNodes(ctx, in, opts...)
}

func (a *Handler) isArchivePath(ctx context.Context, nodePath string) (ok bool, format string, archivePath string, innerPath string) {
	formats := []string{"zip", "tar", "tar.gz"}
	for _, f := range formats {
		test := strings.SplitN(nodePath, "."+f+"/", 2)
		if len(test) == 2 {
			archivePath = test[0] + "." + f
			innerPath = test[1]
			format = f
			break
		}
		if strings.HasSuffix(nodePath, "."+f) {
			format = f
			archivePath = nodePath
			break
		}
	}
	if archivePath != "" {
		// TEST CASE ONLY
		if a.Next == nil {
			ok = true
			return
		}
		// Read node and make sure it is a zip FILE, not a folder named toto.zip !
		if resp, er := a.Next.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: archivePath}}); er == nil && resp.GetNode().IsLeaf() {
			ok = true
			return
		}
	}
	return
}

func (a *Handler) selectionFakeName(nodePath string) string {
	if strings.HasSuffix(nodePath, "-selection.zip") || strings.HasSuffix(nodePath, "-selection.tar") || strings.HasSuffix(nodePath, "-selection.tar.gz") {
		fName := path.Base(nodePath)
		return strings.TrimSuffix(strings.TrimSuffix(strings.TrimSuffix(fName, "-selection.zip"), "-selection.tar.gz"), "-selection.tar")
	}
	return ""
}

func (a *Handler) archiveFolderName(nodePath string) string {
	if strings.HasSuffix(nodePath, ".zip") || strings.HasSuffix(nodePath, ".tar") || strings.HasSuffix(nodePath, ".tar.gz") {
		fName := strings.TrimSuffix(strings.TrimSuffix(strings.TrimSuffix(nodePath, ".zip"), ".gz"), ".tar")
		return strings.Trim(fName, "/")
	}
	return ""
}

func (a *Handler) archiveFakeStat(ctx context.Context, nodePath string) (node *tree.Node, e error) {

	if noExt := a.archiveFolderName(nodePath); noExt != "" {

		n, er := a.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: noExt}})
		if er == nil && n != nil {
			n.Node.Type = tree.NodeType_LEAF
			n.Node.Path = nodePath
			n.Node.Size = -1 // This will avoid a Content-Length discrepancy
			n.Node.MustSetMeta(common.MetaNamespaceNodeName, path.Base(nodePath))
			log.Logger(ctx).Debug("This is a zip, sending folder info instead", zap.Any("node", n.Node))
			return n.Node, nil
		}

	}

	return nil, errors.WithMessage(errors.NodeNotFound, "Could not find corresponding folder for archive "+nodePath)

}

func (a *Handler) generateArchiveFromFolder(ctx context.Context, writer io.Writer, nodePath string) (bool, error) {

	if noExt := a.archiveFolderName(nodePath); noExt != "" {

		n, er := a.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: noExt}})
		if er == nil && n != nil {
			ext := strings.Trim(path.Ext(nodePath), ".")
			err := a.generateArchiveFromSelection(ctx, writer, []*tree.Node{n.Node}, ext)
			return true, err
		}
	}

	return false, nil
}

// generateArchiveFromSelection Create a zip/tar/tar.gz on the fly
func (a *Handler) generateArchiveFromSelection(ctx context.Context, writer io.Writer, selection []*tree.Node, format string) error {

	archiveWriter := &Writer{
		Router: a,
	}
	var err error
	if format == "zip" {
		log.Logger(ctx).Debug("This is a zip, create a zip on the fly")
		_, err = archiveWriter.ZipSelection(ctx, writer, selection)
	} else if format == "tar" {
		log.Logger(ctx).Debug("This is a tar, create a tar on the fly")
		_, err = archiveWriter.TarSelection(ctx, writer, false, selection)
	} else if format == "gz" {
		log.Logger(ctx).Debug("This is a tar.gz, create a tar.gz on the fly")
		_, err = archiveWriter.TarSelection(ctx, writer, true, selection)
	}

	return err

}

// getSelectionByUuid loads a selection stored in DocStore service by its id.
func (a *Handler) getSelectionByUuid(ctx context.Context, selectionUuid string) (bool, []*tree.Node, error) {

	var data []*tree.Node
	if resp, e := docstorec.DocStoreClient(ctx).GetDocument(ctx, &docstore.GetDocumentRequest{
		StoreID:    common.DocStoreIdSelections,
		DocumentID: selectionUuid,
	}); e == nil {
		doc := resp.Document
		username, _ := permissions.FindUserNameInContext(ctx)
		if username != doc.Owner {
			return false, data, errors.WithMessage(errors.StatusForbidden, "this selection does not belong to you")
		}
		if er := json.Unmarshal([]byte(doc.Data), &data); er != nil {
			return false, data, er
		} else {
			return true, data, nil
		}
	} else {
		return false, data, nil
	}

}

// deleteSelectionByUuid Delete selection
func (a *Handler) deleteSelectionByUuid(ctx context.Context, selectionUuid string) {

	_, e := docstorec.DocStoreClient(ctx).DeleteDocuments(ctx, &docstore.DeleteDocumentsRequest{
		StoreID:    common.DocStoreIdSelections,
		DocumentID: selectionUuid,
	})
	if e != nil {
		log.Logger(ctx).Error("Could not delete selection")
	} else {
		log.Logger(ctx).Debug("Deleted selection after download " + selectionUuid)
	}
}

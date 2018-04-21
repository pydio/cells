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

package views

import (
	"context"
	"io"
	"path/filepath"
	"strings"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
)

type ArchiveHandler struct {
	AbstractHandler
}

// Override the response of GetObject if it is sent on a folder key : create an archive on-the-fly.
func (a *ArchiveHandler) GetObject(ctx context.Context, node *tree.Node, requestData *GetRequestData) (io.ReadCloser, error) {

	originalPath := node.Path

	if ok, format, archivePath, innerPath := a.isArchivePath(originalPath); ok && len(innerPath) > 0 {
		extractor := &ArchiveReader{Router: a.next}
		statResp, _ := a.next.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: archivePath}})
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

	readCloser, err := a.next.GetObject(ctx, node, requestData)
	if testFolder := a.archiveFolderName(originalPath); err != nil && len(testFolder) > 0 {
		r, w := io.Pipe()
		go func() {
			defer w.Close()
			a.generateArchiveFromFolder(ctx, w, originalPath)
		}()
		return r, nil
	}

	return readCloser, err

}

// Override the response of ReadNode to create a fake stat for archive file
func (a *ArchiveHandler) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...client.CallOption) (*tree.ReadNodeResponse, error) {
	originalPath := in.Node.Path

	if ok, format, archivePath, innerPath := a.isArchivePath(originalPath); ok && len(innerPath) > 0 {
		log.Logger(ctx).Debug("[ARCHIVE:READ] " + originalPath + " => " + archivePath + " -- " + innerPath)
		extractor := &ArchiveReader{Router: a.next}
		statResp, _ := a.next.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: archivePath}})
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
			statNode.SetMeta("name", filepath.Base(statNode.Path))
		}
		return &tree.ReadNodeResponse{Node: statNode}, err
	}

	response, err := a.next.ReadNode(ctx, in, opts...)
	if folderName := a.archiveFolderName(originalPath); folderName != "" && err != nil {
		fakeNode, err := a.archiveFakeStat(ctx, originalPath)
		if err == nil && fakeNode != nil {
			response = &tree.ReadNodeResponse{
				Node: fakeNode,
			}
			return response, nil
		}
	}
	return response, err
}

func (a *ArchiveHandler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...client.CallOption) (tree.NodeProvider_ListNodesClient, error) {

	if ok, format, archivePath, innerPath := a.isArchivePath(in.Node.Path); ok {
		extractor := &ArchiveReader{Router: a.next}
		statResp, _ := a.next.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: archivePath}})
		archiveNode := statResp.Node

		if in.Limit == 1 && innerPath == "" {
			archiveNode.Type = tree.NodeType_COLLECTION
			streamer := NewWrappingStreamer()
			go func() {
				defer streamer.Close()
				log.Logger(ctx).Debug("[ARCHIVE:LISTNODE/READ]", zap.String("path", archiveNode.Path))
				streamer.Send(&tree.ListNodesResponse{archiveNode})
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
		streamer := NewWrappingStreamer()
		if err != nil {
			return streamer, err
		}
		go func() {
			defer streamer.Close()
			for _, child := range children {
				log.Logger(ctx).Debug("[ARCHIVE:LISTNODE]", zap.String("path", child.Path))
				streamer.Send(&tree.ListNodesResponse{child})
			}
		}()
		return streamer, nil
	}

	return a.next.ListNodes(ctx, in, opts...)
}

func (a *ArchiveHandler) isArchivePath(nodePath string) (ok bool, format string, archivePath string, innerPath string) {
	formats := []string{"zip", "tar", "tar.gz"}
	for _, f := range formats {
		test := strings.SplitN(nodePath, "."+f+"/", 2)
		if len(test) == 2 {
			return true, f, test[0] + "." + f, test[1]
		}
		if strings.HasSuffix(nodePath, "."+f) {
			return true, f, nodePath, ""
		}
	}
	return false, "", "", ""
}

func (a *ArchiveHandler) archiveFolderName(nodePath string) string {
	if strings.HasSuffix(nodePath, ".zip") || strings.HasSuffix(nodePath, ".tar") || strings.HasSuffix(nodePath, ".tar.gz") {
		fName := strings.TrimSuffix(strings.TrimSuffix(strings.TrimSuffix(nodePath, ".zip"), ".gz"), ".tar")
		return strings.Trim(fName, "/")
	}
	return ""
}

func (a *ArchiveHandler) archiveFakeStat(ctx context.Context, nodePath string) (node *tree.Node, e error) {

	if noExt := a.archiveFolderName(nodePath); noExt != "" {

		n, er := a.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: noExt}})
		if er == nil && n != nil {
			n.Node.Type = tree.NodeType_LEAF
			n.Node.Path = nodePath
			n.Node.Size = -1 // This will avoid a Content-Length discrepancy
			n.Node.SetMeta("name", filepath.Base(nodePath))
			log.Logger(ctx).Debug("This is a zip, sending folder info instead", zap.Any("node", n.Node))
			return n.Node, nil
		}

	}

	return nil, errors.NotFound(VIEWS_LIBRARY_NAME, "Could not find corresponding folder for archive")

}

func (a *ArchiveHandler) generateArchiveFromFolder(ctx context.Context, writer io.Writer, nodePath string) (bool, error) {

	if noExt := a.archiveFolderName(nodePath); noExt != "" {

		n, er := a.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: noExt}})
		if er == nil && n != nil {
			// This is a folder, trigger a zip download
			archiveWriter := &ArchiveWriter{
				Router: a,
			}
			selection := []*tree.Node{n.Node}
			var err error
			if strings.HasSuffix(nodePath, ".zip") {
				log.Logger(ctx).Debug("This is a zip, create a zip on the fly")
				_, err = archiveWriter.ZipSelection(ctx, writer, selection)
			} else if strings.HasSuffix(nodePath, ".tar") {
				log.Logger(ctx).Debug("This is a tar, create a tar on the fly")
				_, err = archiveWriter.TarSelection(ctx, writer, false, selection)
			} else if strings.HasSuffix(nodePath, ".tar.gz") {
				log.Logger(ctx).Debug("This is a tar.gz, create a tar.gz on the fly")
				_, err = archiveWriter.TarSelection(ctx, writer, true, selection)
			}
			return true, err
		}
	}

	return false, nil
}

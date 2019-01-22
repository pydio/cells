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
	"archive/tar"
	"archive/zip"
	"compress/gzip"
	"context"
	"io"
	"path/filepath"
	"strings"
	"time"

	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
)

type ArchiveWriter struct {
	Router Handler
}

type walkFunction func(node *tree.Node) error

func (w *ArchiveWriter) walkObjectsWithCallback(ctx context.Context, nodePath string, cb walkFunction) error {

	r, e := w.Router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: nodePath}})
	if e != nil {
		return e
	}
	if r.Node.IsLeaf() {
		cb(r.Node)
		return nil
	}
	lNodeClient, err := w.Router.ListNodes(ctx, &tree.ListNodesRequest{
		Node: &tree.Node{
			Path: nodePath,
		},
		Recursive: true,
		Limit:     0,
	}, client.WithRequestTimeout(6*time.Hour))
	if err != nil {
		return err
	}
	defer lNodeClient.Close()
	for {
		clientResponse, err := lNodeClient.Recv()
		if clientResponse == nil || err != nil {
			break
		}
		n := clientResponse.Node
		// Ignore folders
		if !n.IsLeaf() || strings.HasSuffix(n.Path, common.PYDIO_SYNC_HIDDEN_FILE_META) {
			continue
		}
		e := cb(n)
		if e != nil {
			log.Logger(ctx).Error("Error trying to add file to archive", zap.String("path", n.Path))
			return e
		}
	}

	return nil

}

func (w *ArchiveWriter) commonRoot(nodes []*tree.Node) string {

	// TODO
	// Assume nodes have same parent for now
	if len(nodes) == 1 && !nodes[0].IsLeaf() {
		return nodes[0].Path
	} else {
		return filepath.Dir(nodes[0].Path)
	}

}

func (w *ArchiveWriter) ZipSelection(ctx context.Context, output io.Writer, nodes []*tree.Node, logsChannels ...chan string) (int64, error) {

	z := zip.NewWriter(output)
	defer z.Close()
	var totalSizeWritten int64

	parentRoot := w.commonRoot(nodes)

	log.Logger(ctx).Debug("ZipSelection", zap.String("parent", parentRoot), zap.Any("selection", nodes))

	for _, node := range nodes {

		w.walkObjectsWithCallback(ctx, node.Path, func(n *tree.Node) error {

			if n.Size <= 0 {
				return nil
			}
			internalPath := strings.TrimPrefix(n.Path, parentRoot)
			log.Logger(ctx).Debug("Adding file to archive: ", zap.String("path", internalPath), zap.Any("node", n))
			header := &zip.FileHeader{
				Name:               internalPath,
				Method:             zip.Deflate,
				UncompressedSize64: uint64(n.Size),
			}
			header.SetMode(0777)
			header.SetModTime(n.GetModTime())
			zW, e := z.CreateHeader(header)
			if e != nil {
				log.Logger(ctx).Error("Error while creating path", zap.String("path", internalPath), zap.Error(e))
				return e
			}
			r, e1 := w.Router.GetObject(ctx, n, &GetRequestData{StartOffset: 0, Length: -1})
			if e1 != nil {
				log.Logger(ctx).Error("Error while getting object", zap.String("path", n.Path), zap.Error(e1))
				return e1
			}
			defer r.Close()
			written, e2 := io.Copy(zW, r)
			if e2 != nil {
				log.Logger(ctx).Error("Error while copying streams", zap.Error(e2))
				return e2
			}
			totalSizeWritten += written

			if len(logsChannels) > 0 {
				logsChannels[0] <- "File " + internalPath + " added to archive"
			}
			return nil
		})

	}

	log.Logger(ctx).Debug("Total Size Written", zap.Int64("size", totalSizeWritten))

	return totalSizeWritten, nil
}

func (w *ArchiveWriter) TarSelection(ctx context.Context, output io.Writer, gzipFile bool, nodes []*tree.Node, logsChannel ...chan string) (int64, error) {

	var tw *tar.Writer
	var totalSizeWritten int64

	if gzipFile {
		// set up the gzip writer
		gw := gzip.NewWriter(output)
		defer gw.Close()

		tw = tar.NewWriter(gw)
		defer tw.Close()
	} else {
		tw = tar.NewWriter(output)
		defer tw.Close()
	}

	parentRoot := w.commonRoot(nodes)

	for _, node := range nodes {

		err := w.walkObjectsWithCallback(ctx, node.Path, func(n *tree.Node) error {

			internalPath := strings.TrimPrefix(n.Path, parentRoot)
			if n.Size <= 0 {
				return nil
			}
			header := &tar.Header{
				Name:    internalPath,
				ModTime: n.GetModTime(),
				Size:    n.Size,
				Mode:    0777,
			}
			if !n.IsLeaf() {
				header.Typeflag = tar.TypeDir
			} else {
				header.Typeflag = tar.TypeReg
			}
			log.Logger(ctx).Debug("Adding file to archive: ", zap.String("path", internalPath), zap.Any("node", n))
			e := tw.WriteHeader(header)
			if e != nil {
				log.Logger(ctx).Error("Error while creating path", zap.String("path", internalPath), zap.Error(e))
				return e
			}
			reader, e1 := w.Router.GetObject(ctx, n, &GetRequestData{StartOffset: 0, Length: -1})
			defer reader.Close()
			if e1 != nil {
				log.Logger(ctx).Error("Error while getting object and writing to tarball", zap.String("path", internalPath), zap.Error(e1))
				return e1
			}
			size, _ := io.Copy(tw, reader)
			totalSizeWritten += size

			if len(logsChannel) > 0 {
				logsChannel[0] <- "File " + internalPath + " added to archive"
			}

			return nil
		})

		if err != nil {
			return totalSizeWritten, err
		}

	}

	return totalSizeWritten, nil

}

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
	"archive/tar"
	"archive/zip"
	"compress/gzip"
	"context"
	"fmt"
	"io"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/krolaw/zipstream"
	"go.uber.org/zap"
	"golang.org/x/text/unicode/norm"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"
)

type Reader struct {
	Router nodes.Handler
}

const UnCompressThreshold = int64(100)

func (a *Reader) openArchiveStream(ctx context.Context, archiveNode *tree.Node) (io.ReadCloser, error) {

	var archive io.ReadCloser
	var openErr error
	if localFolder := archiveNode.GetStringMeta(common.MetaNamespaceNodeTestLocalFolder); localFolder != "" {
		archive, openErr = os.Open(filepath.Join(localFolder, archiveNode.Uuid))
	} else {
		archive, openErr = a.Router.GetObject(ctx, archiveNode, &models.GetRequestData{StartOffset: 0, Length: -1})
		if openErr != nil {
			log.Logger(ctx).Error("Cannot open Archive", zap.Any("node", archiveNode), zap.Error(openErr))
		}
	}
	return archive, openErr

}

// ListChildrenZip extracts all children from a zip archive
func (a *Reader) ListChildrenZip(ctx context.Context, archiveNode *tree.Node, parentPath string, stat ...bool) ([]*tree.Node, error) {

	var results []*tree.Node

	archive, openErr := a.openArchiveStream(ctx, archiveNode)
	if openErr != nil {
		return results, openErr
	}
	defer archive.Close()

	isStat := false
	if len(stat) > 0 && stat[0] {
		isStat = true
	}

	if !isStat && len(parentPath) > 0 {
		parentPath = strings.TrimSuffix(parentPath, "/") + "/"
	}

	folders := map[string]string{}
	reader := zipstream.NewReader(archive)
	for {
		file, err := reader.Next()
		if err == io.EOF || file == nil {
			break
		}

		innerPath := strings.TrimPrefix(file.Name, "/")
		innerPath = string(norm.NFC.Bytes([]byte(innerPath)))
		if !isStat {
			if !strings.HasPrefix(strings.TrimSuffix(innerPath, "/"), parentPath) {
				continue
			}

			testPath := strings.TrimPrefix(strings.TrimSuffix(innerPath, "/"), parentPath)
			if strings.Contains(testPath, "/") {
				// Check if there is an unreported folder
				f := strings.SplitN(testPath, "/", 2)
				baseDir := f[0]
				if _, already := folders[parentPath+baseDir]; !already {
					// There might be an additional folder here
					innerPath = parentPath + baseDir + "/"
				} else {
					continue
				}
			}

			log.Logger(ctx).Debug("Read File: " + innerPath + "--" + testPath + "--" + parentPath)
		} else {
			if strings.TrimSuffix(innerPath, "/") != parentPath {
				// unreported folder entry in path
				if strings.HasPrefix(innerPath, parentPath+"/") {
					innerPath = parentPath + "/"
				} else {
					continue
				}
			}
		}

		nodeType := tree.NodeType_LEAF
		if strings.HasSuffix(innerPath, "/") {
			nodeType = tree.NodeType_COLLECTION
			innerPath = strings.TrimSuffix(innerPath, "/")
			if _, already := folders[innerPath]; already {
				continue
			}
			folders[innerPath] = innerPath
		}

		node := &tree.Node{
			Path:  archiveNode.Path + "/" + innerPath,
			Size:  int64(file.UncompressedSize64),
			Type:  nodeType,
			MTime: file.ModTime().Unix(),
		}
		results = append(results, node)
		if isStat {
			break
		}
	}

	return results, nil
}

// StatChildZip finds information about a given entry of a zip archive (by its internal path)
func (a *Reader) StatChildZip(ctx context.Context, archiveNode *tree.Node, innerPath string) (*tree.Node, error) {

	nn, err := a.ListChildrenZip(ctx, archiveNode, innerPath, true)
	if err != nil || len(nn) == 0 {
		return nil, errors.WithMessage(errors.NodeNotFound, "File "+innerPath+" not found inside archive "+archiveNode.Path)
	}
	return nn[0], nil

}

// ReadChildZip reads content of a file contained in a zip archive
func (a *Reader) ReadChildZip(ctx context.Context, archiveNode *tree.Node, innerPath string) (io.ReadCloser, error) {

	// We have to download whole archive to read its content
	var archiveName string
	if localFolder := archiveNode.GetStringMeta(common.MetaNamespaceNodeTestLocalFolder); localFolder != "" {
		archiveName = filepath.Join(localFolder, archiveNode.Uuid)
	} else {
		remoteReader, openErr := a.Router.GetObject(ctx, archiveNode, &models.GetRequestData{StartOffset: 0, Length: -1})
		if openErr != nil {
			return nil, openErr
		}
		defer remoteReader.Close()
		// Create tmp file
		file, e := os.CreateTemp("", "pydio-archive-")
		if e != nil {
			return nil, e
		}
		defer file.Close()
		_, e2 := io.Copy(file, remoteReader)
		if e2 != nil {
			return nil, e2
		}
		file.Close()
		remoteReader.Close()
		archiveName = file.Name()
		defer os.Remove(archiveName)
	}

	reader, err := zip.OpenReader(archiveName)
	if err != nil {
		return nil, err
	}

	for _, file := range reader.File {
		if file.Name == innerPath || file.Name == "/"+innerPath {
			fileReader, err := file.Open()
			return fileReader, err
		}
	}
	return nil, errors.WithMessage(errors.NodeNotFound, "File "+innerPath+" not found inside archive")

}

// ExtractAllZip extracts all files contained in a zip archive to a given location
func (a *Reader) ExtractAllZip(ctx context.Context, archiveNode *tree.Node, targetNode *tree.Node, logChannels ...chan string) error {

	// We have to download whole archive to read its content
	var archiveName string
	var archiveSize, uncompressed int64
	maxRatio := config.Get("defaults", "archiveMaxRatio").Default(UnCompressThreshold).Int64()

	if localFolder := archiveNode.GetStringMeta(common.MetaNamespaceNodeTestLocalFolder); localFolder != "" {
		archiveName = filepath.Join(localFolder, archiveNode.Uuid)
		s, e := os.Stat(archiveName)
		if e != nil {
			return e
		}
		archiveSize = s.Size()
	} else {
		remoteReader, openErr := a.Router.GetObject(ctx, archiveNode, &models.GetRequestData{StartOffset: 0, Length: -1})
		if openErr != nil {
			return openErr
		}
		defer remoteReader.Close()
		// Create tmp file
		file, e := os.CreateTemp("", "pydio-archive-")
		if e != nil {
			return e
		}
		defer file.Close()
		_, e2 := io.Copy(file, remoteReader)
		if e2 != nil {
			return e2
		}
		file.Close()
		remoteReader.Close()
		archiveName = file.Name()
		archiveSize = archiveNode.GetSize()
		defer os.Remove(archiveName)
	}

	reader, err := zip.OpenReader(archiveName)
	if err != nil {
		return err
	}

	for _, file := range reader.File {
		fName := string(norm.NFC.Bytes([]byte(file.Name)))
		pa := path.Join(targetNode.GetPath(), path.Clean("/"+strings.TrimSuffix(fName, "/")))
		if file.FileInfo().IsDir() {
			_, e := a.Router.CreateNode(ctx, &tree.CreateNodeRequest{Node: &tree.Node{Path: pa, Type: tree.NodeType_COLLECTION}})
			if nodes.Is403(e) {
				continue
			}
			if e != nil {
				return e
			}
			if len(logChannels) > 0 {
				logChannels[0] <- "Creating directory " + path.Base(strings.TrimSuffix(fName, "/"))
			}
		} else {
			fileReader, err := file.Open()
			if err != nil {
				return err
			}
			defer fileReader.Close()

			uncompressed += int64(file.UncompressedSize64)
			if uncompressed/archiveSize > maxRatio {
				log.Auditer(ctx).Error("Decompression of archive " + archiveNode.GetPath() + " was interrupted because compression ratio seems too high. It could be a zip bomb. You can set the defaults/archiveMaxRatio value to override default threshold (100).")
				return fmt.Errorf("interrupting archive decompression: ratio seems too high, it could be a zip-bomb.")
			}

			_, err = a.Router.PutObject(ctx, &tree.Node{Path: pa}, fileReader, &models.PutRequestData{Size: int64(file.UncompressedSize64)})
			if nodes.Is403(err) {
				continue
			}
			if err != nil {
				return err
			}
			if len(logChannels) > 0 {
				logChannels[0] <- "Extracting file " + path.Base(strings.TrimSuffix(fName, "/"))
			}
		}

	}

	return nil

}

// ListChildrenTar extracts all children from a tar/tar.gz archive
func (a *Reader) ListChildrenTar(ctx context.Context, gzipFormat bool, archiveNode *tree.Node, parentPath string, stat ...bool) ([]*tree.Node, error) {

	var results []*tree.Node

	archive, openErr := a.openArchiveStream(ctx, archiveNode)
	if openErr != nil {
		return results, openErr
	}
	defer archive.Close()

	isStat := false
	if len(stat) > 0 && stat[0] {
		isStat = true
	}

	if !isStat && len(parentPath) > 0 {
		parentPath = strings.TrimSuffix(parentPath, "/") + "/"
	}

	var tarReader *tar.Reader
	if gzipFormat {
		uncompressedStream, err := gzip.NewReader(archive)
		if err != nil {
			return results, err
		}
		tarReader = tar.NewReader(uncompressedStream)
	} else {
		tarReader = tar.NewReader(archive)
	}

	folders := map[string]string{}
	log.Logger(ctx).Debug("TAR:LIST-START: " + parentPath)
	for {
		file, err := tarReader.Next()
		if err != nil {
			break
		}

		innerPath := strings.TrimPrefix(file.Name, "/")
		innerPath = string(norm.NFC.Bytes([]byte(innerPath)))

		log.Logger(ctx).Debug("TAR:LIST " + innerPath)
		if !isStat {
			if !strings.HasPrefix(strings.TrimSuffix(innerPath, "/"), parentPath) {
				continue
			}

			testPath := strings.TrimPrefix(strings.TrimSuffix(innerPath, "/"), parentPath)
			if strings.Contains(testPath, "/") {
				// Check if there is an unreported folder
				f := strings.SplitN(testPath, "/", 2)
				baseDir := f[0]
				if _, already := folders[parentPath+baseDir]; !already {
					// There might be an additional folder here
					innerPath = parentPath + baseDir + "/"
					file.Typeflag = tar.TypeDir
					file.Size = 0
				} else {
					continue
				}
			}

			log.Logger(ctx).Debug("Read File: " + innerPath + "--" + testPath + "--" + parentPath)
		} else {
			if strings.TrimSuffix(innerPath, "/") != parentPath {
				// unreported folder entry in path
				if strings.HasPrefix(innerPath, parentPath+"/") {
					innerPath = parentPath + "/"
					file.Typeflag = tar.TypeDir
					file.Size = 0
				} else {
					continue
				}
			}
		}

		nodeType := tree.NodeType_LEAF
		if file.Typeflag == tar.TypeDir {
			nodeType = tree.NodeType_COLLECTION
			innerPath = strings.TrimSuffix(innerPath, "/")
			if _, already := folders[innerPath]; already {
				continue
			}
			folders[innerPath] = innerPath
		} else if file.Typeflag != tar.TypeReg && file.Typeflag != 0 {
			// Unhandled type, must be Dir or Regular file
			continue
		}

		node := &tree.Node{
			Path:  archiveNode.Path + "/" + innerPath,
			Size:  file.Size,
			Type:  nodeType,
			MTime: file.ModTime.Unix(),
		}
		results = append(results, node)
		if isStat {
			break
		}
	}

	return results, nil
}

// StatChildTar finds information about a given entry of a tar/tar.gz archive (by its internal path)
func (a *Reader) StatChildTar(ctx context.Context, gzipFormat bool, archiveNode *tree.Node, innerPath string) (*tree.Node, error) {

	nn, err := a.ListChildrenTar(ctx, gzipFormat, archiveNode, innerPath, true)
	if err != nil || len(nn) == 0 {
		return nil, errors.WithMessage(errors.NodeNotFound, "File "+innerPath+" not found inside archive "+archiveNode.Path)
	}
	return nn[0], nil

}

// ReadChildTar reads content of a file contained in a tar/tar.gz archive
func (a *Reader) ReadChildTar(ctx context.Context, gzipFormat bool, writer io.WriteCloser, archiveNode *tree.Node, innerPath string) (int64, error) {

	// We have to download whole archive to read its content
	var inputStream io.ReadCloser
	var openErr error
	if localFolder := archiveNode.GetStringMeta(common.MetaNamespaceNodeTestLocalFolder); localFolder != "" {
		inputStream, openErr = os.Open(filepath.Join(localFolder, archiveNode.Uuid))
	} else {
		inputStream, openErr = a.openArchiveStream(ctx, archiveNode)
	}
	if openErr != nil {
		return 0, openErr
	}
	defer inputStream.Close()

	var tarReader *tar.Reader
	if gzipFormat {
		uncompressedStream, err := gzip.NewReader(inputStream)
		if err != nil {
			return 0, err
		}
		tarReader = tar.NewReader(uncompressedStream)
	} else {
		tarReader = tar.NewReader(inputStream)
	}

	for {
		file, err := tarReader.Next()
		if err == io.EOF {
			break
		}
		if file == nil {
			return 0, err
		}
		if file.Name == innerPath || file.Name == "/"+innerPath {
			log.Logger(ctx).Debug("Should Start copying tar data to writer")
			written, err := io.Copy(writer, tarReader)
			writer.Close()
			log.Logger(ctx).Debug("After write", zap.Int64("written", written), zap.Error(err))
			return written, err
		}
	}
	return 0, errors.WithMessage(errors.NodeNotFound, "File "+innerPath+" not found inside archive")

}

// ExtractAllTar extracts all files contained in a tar/tar.gz archive to a given location
func (a *Reader) ExtractAllTar(ctx context.Context, gzipFormat bool, archiveNode *tree.Node, targetNode *tree.Node, logChannels ...chan string) error {

	// We have to download whole archive to read its content
	var inputStream io.ReadCloser
	var openErr error
	var archiveSize, uncompressed int64
	maxRatio := config.Get("defaults", "archiveMaxRatio").Default(UnCompressThreshold).Int64()
	if localFolder := archiveNode.GetStringMeta(common.MetaNamespaceNodeTestLocalFolder); localFolder != "" {
		inputStream, openErr = os.Open(filepath.Join(localFolder, archiveNode.Uuid))
		s, e := os.Stat(filepath.Join(localFolder, archiveNode.Uuid))
		if e != nil {
			return e
		}
		archiveSize = s.Size()
	} else {
		inputStream, openErr = a.openArchiveStream(ctx, archiveNode)
		archiveSize = archiveNode.GetSize()
	}
	if openErr != nil {
		return openErr
	}
	defer inputStream.Close()

	var tarReader *tar.Reader
	if gzipFormat {
		uncompressedStream, err := gzip.NewReader(inputStream)
		if err != nil {
			return err
		}
		tarReader = tar.NewReader(uncompressedStream)
	} else {
		tarReader = tar.NewReader(inputStream)
	}

	for {
		file, err := tarReader.Next()
		if err == io.EOF {
			break
		}
		if file == nil {
			return err
		}
		fName := string(norm.NFC.Bytes([]byte(file.Name)))
		pa := path.Join(targetNode.GetPath(), path.Clean("/"+strings.TrimSuffix(fName, "/")))
		if file.FileInfo().IsDir() {
			_, e := a.Router.CreateNode(ctx, &tree.CreateNodeRequest{Node: &tree.Node{Path: pa, Type: tree.NodeType_COLLECTION}})
			if nodes.Is403(e) {
				continue
			}
			if e != nil {
				return e
			}
			if len(logChannels) > 0 {
				logChannels[0] <- "Creating directory " + path.Base(strings.TrimSuffix(fName, "/"))
			}
		} else {
			uncompressed += file.Size
			if uncompressed/archiveSize > maxRatio {
				log.Auditer(ctx).Error("Decompression of archive " + archiveNode.GetPath() + " was interrupted because compression ratio seems too high. It could be a tar bomb. You can set the defaults/archiveMaxRatio value to override default threshold (100).")
				return fmt.Errorf("interrupting archive decompression: ratio seems too high, it could be a zip-bomb.")
			}
			_, err = a.Router.PutObject(ctx, &tree.Node{Path: pa}, tarReader, &models.PutRequestData{Size: file.Size})
			if nodes.Is403(err) {
				continue
			}
			if err != nil {
				return err
			}
			if len(logChannels) > 0 {
				logChannels[0] <- "Extracting file " + path.Base(strings.TrimSuffix(fName, "/"))
			}
		}

	}

	return nil

}

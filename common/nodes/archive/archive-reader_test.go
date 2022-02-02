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
	"github.com/pydio/cells/v4/common/config/mock"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

func getTempArchive(formatOrName string) (*tree.Node, string, error) {
	// Create tmp archive file
	var fName string
	switch formatOrName {
	case "zip":
		fName = "actions.zip"
	case "tar":
		fName = "actions.tar"
	case "tar.gz":
		fName = "actions.tar.gz"
	default:
		fName = formatOrName
	}

	refFile := filepath.Join(os.Getenv("GOPATH"), "src", "github.com", "pydio", "cells", "common", "nodes", "testdata", fName)
	nodeUuid := uuid.New()
	tmpDir := os.TempDir()
	refData, e := ioutil.ReadFile(refFile)
	if e != nil {
		return nil, "", e
	}
	tmpArchive := filepath.Join(tmpDir, nodeUuid)
	e2 := ioutil.WriteFile(tmpArchive, refData, 0755)
	if e2 != nil {
		return nil, "", e2
	}

	archiveNode := &tree.Node{
		Path: "fake-path",
		Uuid: nodeUuid,
	}
	archiveNode.MustSetMeta(common.MetaNamespaceNodeTestLocalFolder, tmpDir)
	return archiveNode, tmpArchive, nil
}

func TestReader_ListChildren(t *testing.T) {

	Convey("List Children Zip", t, func() {

		archiveNode, tmpArchive, e := getTempArchive("zip")
		So(e, ShouldBeNil)
		defer os.Remove(tmpArchive)

		archiveReader := &Reader{
			Router: nodes.NewHandlerMock(),
		}

		results, e := archiveReader.ListChildrenZip(context.Background(), archiveNode, "actions")
		So(e, ShouldBeNil)

		log.Logger(context.Background()).Debug("Files Read", zap.Int("length", len(results)))
		So(results, ShouldHaveLength, 8)

	})

	Convey("List Children Zip with files but no folder nodes", t, func() {

		archiveNode, tmpArchive, e := getTempArchive("MissingFolders.zip")
		So(e, ShouldBeNil)
		defer os.Remove(tmpArchive)

		archiveReader := &Reader{
			Router: nodes.NewHandlerMock(),
		}

		results, e := archiveReader.ListChildrenZip(context.Background(), archiveNode, "")
		So(e, ShouldBeNil)

		log.Logger(context.Background()).Debug("Files Read", zap.Int("length", len(results)))
		So(results, ShouldHaveLength, 2)

		results, e = archiveReader.ListChildrenZip(context.Background(), archiveNode, "TestZip/")
		So(e, ShouldBeNil)

		log.Logger(context.Background()).Debug("Files Read", zap.Int("length", len(results)))
		So(results, ShouldHaveLength, 3)

	})

	Convey("List Children Tar", t, func() {

		archiveNode, tmpArchive, e := getTempArchive("tar")
		So(e, ShouldBeNil)
		defer os.Remove(tmpArchive)

		archiveReader := &Reader{
			Router: nodes.NewHandlerMock(),
		}

		results, e := archiveReader.ListChildrenTar(context.Background(), false, archiveNode, "actions")
		So(e, ShouldBeNil)

		log.Logger(context.Background()).Debug("Files Read", zap.Int("length", len(results)))
		So(results, ShouldHaveLength, 8)

	})

	Convey("List Children Tar.gz", t, func() {

		archiveNode, tmpArchive, e := getTempArchive("tar.gz")
		So(e, ShouldBeNil)
		defer os.Remove(tmpArchive)

		archiveReader := &Reader{
			Router: nodes.NewHandlerMock(),
		}

		results, e := archiveReader.ListChildrenTar(context.Background(), true, archiveNode, "actions")
		So(e, ShouldBeNil)

		log.Logger(context.Background()).Debug("Files Read", zap.Int("length", len(results)))
		So(results, ShouldHaveLength, 8)

	})

	Convey("List Children Other Tar.gz", t, func() {

		archiveNode, tmpArchive, e := getTempArchive("MissingFolders.tar.gz")
		So(e, ShouldBeNil)
		defer os.Remove(tmpArchive)

		archiveReader := &Reader{
			Router: nodes.NewHandlerMock(),
		}

		results, e := archiveReader.ListChildrenTar(context.Background(), true, archiveNode, "")
		So(e, ShouldBeNil)

		log.Logger(context.Background()).Debug("Files Read", zap.Int("length", len(results)))
		So(results, ShouldHaveLength, 3)

	})

}

func TestReader_StatChild(t *testing.T) {

	Convey("Stat Child Zip", t, func() {

		archiveNode, tmpArchive, e := getTempArchive("zip")
		So(e, ShouldBeNil)
		defer os.Remove(tmpArchive)

		archiveReader := &Reader{
			Router: nodes.NewHandlerMock(),
		}
		{
			_, e := archiveReader.StatChildZip(context.Background(), archiveNode, "actions/nonexistingfile.go")
			So(e, ShouldNotBeNil)
			So(errors.FromError(e).Code, ShouldEqual, 404)
		}
		{
			stat, e := archiveReader.StatChildZip(context.Background(), archiveNode, "actions/interfaces.go")
			So(e, ShouldBeNil)
			So(stat, ShouldResemble, &tree.Node{
				Path:  "fake-path/actions/interfaces.go",
				Type:  tree.NodeType_LEAF,
				MTime: 1506114710,
			})
		}
		{
			stat, e := archiveReader.StatChildZip(context.Background(), archiveNode, "actions/images")
			So(e, ShouldBeNil)
			So(stat, ShouldResemble, &tree.Node{
				Path:  "fake-path/actions/images",
				Type:  tree.NodeType_COLLECTION,
				MTime: 1506114680,
			})
		}

	})

	Convey("Stat Child Zip - Missing Folders", t, func() {

		archiveNode, tmpArchive, e := getTempArchive("MissingFolders.zip")
		So(e, ShouldBeNil)
		defer os.Remove(tmpArchive)

		archiveReader := &Reader{
			Router: nodes.NewHandlerMock(),
		}
		{
			stat, e := archiveReader.StatChildZip(context.Background(), archiveNode, "TestZip")
			So(e, ShouldBeNil)
			So(stat, ShouldResemble, &tree.Node{
				Path:  "fake-path/TestZip",
				Type:  tree.NodeType_COLLECTION,
				MTime: 1506070808,
			})
		}
	})

	Convey("Stat Child Tar", t, func() {

		archiveNode, tmpArchive, e := getTempArchive("tar")
		So(e, ShouldBeNil)
		defer os.Remove(tmpArchive)

		archiveReader := &Reader{
			Router: nodes.NewHandlerMock(),
		}
		{
			_, e := archiveReader.StatChildTar(context.Background(), false, archiveNode, "actions/nonexistingfile.go")
			So(e, ShouldNotBeNil)
			So(errors.FromError(e).Code, ShouldEqual, 404)
		}
		{
			stat, e := archiveReader.StatChildTar(context.Background(), false, archiveNode, "actions/interfaces.go")
			So(e, ShouldBeNil)
			So(stat, ShouldResemble, &tree.Node{
				Path:  "fake-path/actions/interfaces.go",
				Type:  tree.NodeType_LEAF,
				Size:  449,
				MTime: 1506107509,
			})
		}
		{
			stat, e := archiveReader.StatChildTar(context.Background(), false, archiveNode, "actions/images")
			So(e, ShouldBeNil)
			So(stat, ShouldResemble, &tree.Node{
				Path:  "fake-path/actions/images",
				Type:  tree.NodeType_COLLECTION,
				MTime: 1506107479,
			})
		}

	})

	Convey("Stat Child Tar.gz", t, func() {

		archiveNode, tmpArchive, e := getTempArchive("tar.gz")
		So(e, ShouldBeNil)
		defer os.Remove(tmpArchive)

		archiveReader := &Reader{
			Router: nodes.NewHandlerMock(),
		}
		{
			_, e := archiveReader.StatChildTar(context.Background(), true, archiveNode, "actions/nonexistingfile.go")
			So(e, ShouldNotBeNil)
			So(errors.FromError(e).Code, ShouldEqual, 404)
		}
		{
			stat, e := archiveReader.StatChildTar(context.Background(), true, archiveNode, "actions/interfaces.go")
			So(e, ShouldBeNil)
			So(stat, ShouldResemble, &tree.Node{
				Path:  "fake-path/actions/interfaces.go",
				Type:  tree.NodeType_LEAF,
				Size:  449,
				MTime: 1506107509,
			})
		}
		{
			stat, e := archiveReader.StatChildTar(context.Background(), true, archiveNode, "actions/images")
			So(e, ShouldBeNil)
			So(stat, ShouldResemble, &tree.Node{
				Path:  "fake-path/actions/images",
				Type:  tree.NodeType_COLLECTION,
				MTime: 1506107479,
			})
		}

	})

	Convey("Stat Child - Missing Folders Tar.gz", t, func() {

		archiveNode, tmpArchive, e := getTempArchive("MissingFolders.tar.gz")
		So(e, ShouldBeNil)
		defer os.Remove(tmpArchive)

		archiveReader := &Reader{
			Router: nodes.NewHandlerMock(),
		}
		{
			stat, e := archiveReader.StatChildTar(context.Background(), true, archiveNode, "AFolder")
			So(e, ShouldBeNil)
			So(stat, ShouldResemble, &tree.Node{
				Path:  "fake-path/AFolder",
				Type:  tree.NodeType_COLLECTION,
				MTime: 1506070808,
			})
		}

	})

}

func TestReader_ReadChild(t *testing.T) {

	Convey("Read Child", t, func() {

		archiveNode, tmpArchive, e := getTempArchive("zip")
		So(e, ShouldBeNil)
		defer os.Remove(tmpArchive)

		archiveReader := &Reader{
			Router: nodes.NewHandlerMock(),
		}

		reader, e := archiveReader.ReadChildZip(context.Background(), archiveNode, "actions/interfaces.go")
		So(e, ShouldBeNil)
		defer reader.Close()

		tmpRead, _ := ioutil.TempFile("", "pydio-read-archive-file")
		tmpName := tmpRead.Name()
		defer tmpRead.Close()
		defer os.Remove(tmpName)

		written, e := io.Copy(tmpRead, reader)
		So(e, ShouldBeNil)
		So(written, ShouldEqual, 449)

	})

	Convey("Read Child Tar", t, func() {

		archiveNode, tmpArchive, e := getTempArchive("tar")
		So(e, ShouldBeNil)
		defer os.Remove(tmpArchive)

		archiveReader := &Reader{
			Router: nodes.NewHandlerMock(),
		}

		tmpWriter, _ := ioutil.TempFile("", "pydio-read-archive-file")
		tmpName := tmpWriter.Name()
		defer tmpWriter.Close()
		defer os.Remove(tmpName)

		written, e := archiveReader.ReadChildTar(context.Background(), false, tmpWriter, archiveNode, "actions/interfaces.go")
		So(e, ShouldBeNil)
		So(written, ShouldEqual, 449)

	})

	Convey("Read Child Tar.gz", t, func() {

		archiveNode, tmpArchive, e := getTempArchive("tar.gz")
		So(e, ShouldBeNil)
		defer os.Remove(tmpArchive)

		archiveReader := &Reader{
			Router: nodes.NewHandlerMock(),
		}

		tmpWriter, _ := ioutil.TempFile("", "pydio-read-archive-file")
		tmpName := tmpWriter.Name()
		defer tmpWriter.Close()
		defer os.Remove(tmpName)

		written, e := archiveReader.ReadChildTar(context.Background(), true, tmpWriter, archiveNode, "actions/interfaces.go")
		So(e, ShouldBeNil)
		So(written, ShouldEqual, 449)

	})

}

func TestReader_ExtractAll(t *testing.T) {

	Convey("ExtractAllZip", t, func() {

		So(mock.RegisterMockConfig(), ShouldBeNil)
		archiveNode, tmpArchive, e := getTempArchive("zip")
		So(e, ShouldBeNil)
		defer os.Remove(tmpArchive)

		archiveReader := &Reader{
			Router: nodes.NewHandlerMock(),
		}

		er := archiveReader.ExtractAllZip(context.Background(), archiveNode, &tree.Node{
			Path: "path/to/target",
		})
		So(er, ShouldBeNil)

	})

	Convey("ExtractAllTar", t, func() {

		archiveNode, tmpArchive, e := getTempArchive("tar")
		So(e, ShouldBeNil)
		defer os.Remove(tmpArchive)

		archiveReader := &Reader{
			Router: nodes.NewHandlerMock(),
		}

		er := archiveReader.ExtractAllTar(context.Background(), false, archiveNode, &tree.Node{
			Path: "path/to/target",
		})
		So(er, ShouldBeNil)

	})

	Convey("ExtractAllTar", t, func() {

		archiveNode, tmpArchive, e := getTempArchive("tar.gz")
		So(e, ShouldBeNil)
		defer os.Remove(tmpArchive)

		archiveReader := &Reader{
			Router: nodes.NewHandlerMock(),
		}

		er := archiveReader.ExtractAllTar(context.Background(), true, archiveNode, &tree.Node{
			Path: "path/to/target",
		})
		So(er, ShouldBeNil)

	})

}

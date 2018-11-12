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

package images

import (
	"bytes"
	"context"
	"fmt"
	"image"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"sync"

	"github.com/disintegration/imaging"
	"github.com/golang/protobuf/proto"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/pydio/minio-go"
	"go.uber.org/zap"
	"golang.org/x/image/colornames"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	context2 "github.com/pydio/cells/common/utils/context"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/scheduler/actions"
)

const (
	METADATA_THUMBNAILS       = "ImageThumbnails"
	METADATA_IMAGE_DIMENSIONS = "ImageDimensions"

	METADATA_COMPAT_IS_IMAGE                  = "is_image"
	METADATA_COMPAT_IMAGE_WIDTH               = "image_width"
	METADATA_COMPAT_IMAGE_HEIGHT              = "image_height"
	METADATA_COMPAT_IMAGE_READABLE_DIMENSIONS = "readable_dimension"
)

var (
	thumbnailsActionName = "actions.images.thumbnails"
)

type ThumbnailData struct {
	Format string `json:"format"`
	Size   int    `json:"size"`
	Url    string `json:"url"`
}

type ThumbnailsMeta struct {
	Processing bool
	Thumbnails []ThumbnailData `json:"thumbnails"`
}

type ThumbnailExtractor struct {
	Router     views.Handler
	thumbSizes []int
	metaClient tree.NodeReceiverClient
	Client     client.Client
}

// GetName returns this action unique identifier.
func (t *ThumbnailExtractor) GetName() string {
	return thumbnailsActionName
}

// Init passes parameters to the action.
func (t *ThumbnailExtractor) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	// Todo : get sizes from parameters
	t.Router = views.NewStandardRouter(views.RouterOptions{
		AdminView:     true,
		WatchRegistry: false,
	})

	if action.Parameters != nil {
		t.thumbSizes = []int{}
		if params, ok := action.Parameters["ThumbSizes"]; ok {
			for _, s := range strings.Split(params, ",") {
				parsed, _ := strconv.ParseInt(s, 10, 32)
				t.thumbSizes = append(t.thumbSizes, int(parsed))
			}
		}
	} else {
		t.thumbSizes = []int{512}
	}
	t.metaClient = tree.NewNodeReceiverClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_META, cl)
	t.Client = cl
	return nil
}

// Run the actual action code.
func (t *ThumbnailExtractor) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	if len(input.Nodes) == 0 || input.Nodes[0].Size == -1 || input.Nodes[0].Etag == common.NODE_FLAG_ETAG_TEMPORARY {
		// Nothing to do
		log.Logger(ctx).Debug("[THUMB EXTRACTOR] task ignored")
		return input.WithIgnore(), nil
	}

	log.Logger(ctx).Debug("[THUMB EXTRACTOR] Resizing image...")
	node := input.Nodes[0]
	err := t.resize(ctx, node, t.thumbSizes...)
	if err != nil {
		return input.WithError(err), err
	}

	output := input
	output.Nodes[0] = node
	output.AppendOutput(&jobs.ActionOutput{
		Success:    true,
		StringBody: "Created thumbnails for image",
	})

	return output, nil
}

func displayMemStat(ctx context.Context, position string) {
	return
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	log.Logger(ctx).Debug("---- MEMORY USAGE AT: "+position, zap.Uint64("Alloc", m.Alloc/1024/1024), zap.Uint64("TotalAlloc", m.TotalAlloc/1024/1024), zap.Uint64("Sys", m.Sys/1024/1024), zap.Uint32("NumGC", m.NumGC))
	//stdlog.Printf("%s : \nAlloc = %v\nTotalAlloc = %v\nSys = %v\nNumGC = %v\n\n", position, m.Alloc / 1024 / 1024, m.TotalAlloc / 1024 / 1024, m.Sys / 1024, m.NumGC)

}

func (t *ThumbnailExtractor) resize(ctx context.Context, node *tree.Node, sizes ...int) error {
	displayMemStat(ctx, "START RESIZE")
	// Open the test image.
	if !node.HasSource() {
		return errors.InternalServerError(common.SERVICE_JOBS, "Node does not have enough metadata for Resize (missing Source data)")
	}

	log.Logger(ctx).Debug("[THUMB EXTRACTOR]  Getting object content", zap.String("Path", node.Path), zap.Int64("Size", node.Size))
	var reader io.ReadCloser
	var err error

	if localPath := getNodeLocalPath(node); len(localPath) > 0 {
		reader, err = os.Open(localPath)
	} else {
		// TODO : tmp security until Router is transmitting nodes immutably
		routerNode := proto.Clone(node).(*tree.Node)
		reader, err = t.Router.GetObject(ctx, routerNode, &views.GetRequestData{Length: -1})
	}
	if err != nil {
		return err
	}
	defer reader.Close()

	displayMemStat(ctx, "BEFORE DECODE")
	src, err := imaging.Decode(reader)
	if err != nil {
		return errors.InternalServerError(common.SERVICE_JOBS, "Error during decode :"+err.Error())
	}
	displayMemStat(ctx, "AFTER DECODE")

	// Extract dimensions
	bounds := src.Bounds()
	width := bounds.Max.X
	height := bounds.Max.Y
	// Send update event right now
	node.SetMeta(METADATA_IMAGE_DIMENSIONS, struct {
		Width  int
		Height int
	}{
		Width:  width,
		Height: height,
	})
	node.SetMeta(METADATA_COMPAT_IS_IMAGE, true)
	node.SetMeta(METADATA_THUMBNAILS, &ThumbnailsMeta{Processing: true})
	node.SetMeta(METADATA_COMPAT_IMAGE_HEIGHT, height)
	node.SetMeta(METADATA_COMPAT_IMAGE_WIDTH, width)
	node.SetMeta(METADATA_COMPAT_IMAGE_READABLE_DIMENSIONS, fmt.Sprintf("%dpx X %dpx", width, height))

	_, err = t.metaClient.UpdateNode(ctx, &tree.UpdateNodeRequest{From: node, To: node})

	if err != nil {
		return err
	}

	log.Logger(ctx).Debug("Thumbnails - Extracted dimension and saved in metadata", zap.Any("dimension", bounds))
	meta := &ThumbnailsMeta{}
	wg := &sync.WaitGroup{}

	for _, size := range sizes {

		wg.Add(1)
		displayMemStat(ctx, "BEFORE WRITE SIZE FROM SRC")
		updateMeta, err := t.writeSizeFromSrc(ctx, src, node, size, wg)
		if err != nil {
			return err
		}
		displayMemStat(ctx, "AFTER WRITE SIZE FROM SRC")
		if updateMeta {
			meta.Thumbnails = append(meta.Thumbnails, ThumbnailData{
				Format: "jpg",
				Size:   size,
			})
		}
	}
	wg.Wait()

	if (meta != &ThumbnailsMeta{}) {
		node.SetMeta(METADATA_THUMBNAILS, meta)
	} else {
		node.SetMeta(METADATA_THUMBNAILS, nil)
	}

	log.Logger(ctx).Info("Updating Meta After Thumbs Generation", zap.Any("meta", meta))
	_, err = t.metaClient.UpdateNode(ctx, &tree.UpdateNodeRequest{From: node, To: node})

	return err
}

func (t *ThumbnailExtractor) writeSizeFromSrc(ctx context.Context, img image.Image, node *tree.Node, targetSize int, wg *sync.WaitGroup) (bool, error) {

	localTest := false
	localFolder := ""

	var thumbsClient *minio.Core
	var thumbsBucket string
	objectName := fmt.Sprintf("%s-%d.jpg", node.Uuid, targetSize)

	if localFolder = node.GetStringMeta(common.META_NAMESPACE_NODE_TEST_LOCAL_FOLDER); localFolder != "" {
		localTest = true
	}

	if !localTest {

		var e error
		thumbsClient, thumbsBucket, e = views.GetGenericStoreClient(ctx, common.PYDIO_THUMBSTORE_NAMESPACE, t.Client)
		if e != nil {
			log.Logger(ctx).Error("Cannot find client for thumbstore", zap.Error(e))
			wg.Done()
			return false, e
		}

		opts := minio.StatObjectOptions{}
		if meta, mOk := context2.MinioMetaFromContext(ctx); mOk {
			for k, v := range meta {
				opts.Set(k, v)
			}
		}
		// First Check if thumb already exists with same original etag
		oi, check := thumbsClient.StatObject(thumbsBucket, objectName, opts)
		log.Logger(ctx).Debug("Object Info", zap.Any("object", oi), zap.Error(check))
		if check == nil {
			foundOriginal := oi.Metadata.Get("X-Amz-Meta-Original-Etag")
			if len(foundOriginal) > 0 && foundOriginal == node.Etag {
				// No update necessary
				log.Logger(ctx).Debug("Ignoring Resize: thumb already exists in store", zap.Any("original", oi))
				wg.Done()
				return false, nil
			}
		}

	}

	log.Logger(ctx).Debug("WriteSizeFromSrc", zap.String("nodeUuid", node.Uuid))
	// Resize the cropped image to width = 256px preserving the aspect ratio.
	dst := imaging.Resize(img, targetSize, 0, imaging.Lanczos)
	ol := imaging.New(dst.Bounds().Dx(), dst.Bounds().Dy(), colornames.Lightgrey)
	ol = imaging.Overlay(ol, dst, image.Pt(0, 0), 1.0)

	var out io.WriteCloser

	if !localTest {
		// We have to compute the size first
		var reader io.ReadCloser

		reader, out = io.Pipe()
		defer out.Close()

		go func() {
			defer func() {
				reader.Close()
				wg.Done()
			}()
			displayMemStat(ctx, "BEGIN GOFUNC")
			requestMeta := map[string]string{"X-Amz-Meta-Original-Etag": node.Etag}
			options := minio.PutObjectOptions{
				UserMetadata: requestMeta,
				ContentType:  "image/jpeg",
			}
			log.Logger(ctx).Debug("Writing thumbnail to thumbs bucket", zap.Any("image size", targetSize), zap.Any("options", options))
			displayMemStat(ctx, "BEFORE PUT OBJECT WITH CONTEXT")
			allData, err := ioutil.ReadAll(reader)
			putReader := bytes.NewReader(allData)
			written, err := thumbsClient.PutObjectWithContext(ctx, thumbsBucket, objectName, putReader, int64(len(allData)), options)
			if err != nil {
				log.Logger(ctx).Error("Error while calling PutObject", zap.Error(err), zap.Any("client", thumbsClient))
			} else {
				log.Logger(ctx).Debug("Finished putting thumb for size", zap.Int64("written", written), zap.Int("size ", targetSize))
			}
			displayMemStat(ctx, "SHOULD EXIT GO FUNC")
		}()

	} else {

		defer wg.Done()
		var e error
		out, e = os.OpenFile(filepath.Join(localFolder, objectName), os.O_CREATE|os.O_WRONLY, 0755)
		if e != nil {
			return false, e
		}
		defer out.Close()
	}

	displayMemStat(ctx, "BEFORE ENCODE")
	err := imaging.Encode(out, ol, imaging.JPEG)
	displayMemStat(ctx, "AFTER ENCODE")

	log.Logger(ctx).Debug("WriteSizeFromSrc: END", zap.String("nodeUuid", node.Uuid))

	return true, err

}

func getNodeLocalPath(node *tree.Node) string {
	if localFolder := node.GetStringMeta(common.META_NAMESPACE_NODE_TEST_LOCAL_FOLDER); localFolder != "" {
		baseName := node.GetStringMeta("name")
		targetFileName := filepath.Join(localFolder, baseName)
		return targetFileName
	}
	return ""
}

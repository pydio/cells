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
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/rwcarlsen/goexif/exif"
	"go.uber.org/zap"

	"github.com/golang/protobuf/proto"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/scheduler/actions"
)

const (
	METADATA_EXIF               = "ImageExif"
	METADATA_GEOLOCATION        = "GeoLocation"
	METADATA_COMPAT_ORIENTATION = "image_exif_orientation"
)

var (
	exifTaskName = "actions.images.exif"
)

type ExifProcessor struct {
	Router     views.Handler
	metaClient tree.NodeReceiverClient
}

// GetName returns this action unique identifier
func (e *ExifProcessor) GetName() string {
	return exifTaskName
}

// Init passes parameters to the action
func (e *ExifProcessor) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	e.Router = views.NewStandardRouter(views.RouterOptions{AdminView: true, WatchRegistry: false})
	e.metaClient = tree.NewNodeReceiverClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_META, cl)
	return nil
}

// Run the actual action code
func (e *ExifProcessor) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	if len(input.Nodes) == 0 || input.Nodes[0].Size == -1 || input.Nodes[0].Etag == common.NODE_FLAG_ETAG_TEMPORARY {
		return input.WithIgnore(), nil
	}
	node := input.Nodes[0]
	exifData, err := e.ExtractExif(ctx, node)

	if err != nil {
		log.Logger(ctx).Debug("Could not extract exif : ", zap.Error(err), zap.Any("ctx", ctx))
		return input.WithError(err), err
	}

	if exifData == nil {
		log.Logger(ctx).Debug("No Exif extracted")
		return input, nil
	}

	output := input
	node.SetMeta(METADATA_EXIF, exifData)
	orientation, oe := exifData.Get(exif.Orientation)
	if oe == nil {
		t := orientation.String()
		if t != "" {
			node.SetMeta(METADATA_COMPAT_ORIENTATION, t)
		}
	}
	lat, long, err := exifData.LatLong()
	if err == nil {
		var readLat, readLong string
		geoLocation := map[string]interface{}{
			"lat": lat,
			"lon": long,
		}
		if lat2, e := exifData.Get(exif.GPSLatitude); e == nil {
			if l0, e1 := lat2.Rat(0); e1 == nil {
				l1, _ := lat2.Rat(1)
				l2, _ := lat2.Rat(2)
				ref, _ := exifData.Get(exif.GPSLatitudeRef)
				refStr, _ := ref.StringVal()
				readLat = fmt.Sprintf("%d deg %d' %d %s", l0.Num(), l1.Num(), l2.Num(), refStr)
			}
		}
		if long2, e := exifData.Get(exif.GPSLongitude); e == nil {
			if l0, e1 := long2.Rat(0); e1 == nil {
				l1, _ := long2.Rat(1)
				l2, _ := long2.Rat(2)
				ref, _ := exifData.Get(exif.GPSLatitudeRef)
				refStr, _ := ref.StringVal()
				readLong = fmt.Sprintf("%d deg %d' %d %s", l0.Num(), l1.Num(), l2.Num(), refStr)
			}
		}
		if readLat != "" && readLong != "" {
			geoLocation["GPS_latitude"] = readLat
			geoLocation["GPS_longitude"] = readLong
		}
		if alt, e := exifData.Get(exif.GPSAltitude); e == nil {
			if a0, e1 := alt.Rat(0); e1 == nil {
				geoLocation["GPS_altitude"] = fmt.Sprintf("%d", a0.Num())
			}
		}
		node.SetMeta(METADATA_GEOLOCATION, geoLocation)
	}

	e.metaClient.UpdateNode(ctx, &tree.UpdateNodeRequest{From: node, To: node})

	output.Nodes[0] = node
	output.AppendOutput(&jobs.ActionOutput{
		Success:    true,
		StringBody: "Successfully Extracted EXIF data",
	})

	return output, nil
}

func (e *ExifProcessor) ExtractExif(ctx context.Context, node *tree.Node) (*exif.Exif, error) {

	// Open the test image.
	if !node.HasSource() {
		return nil, errors.InternalServerError(common.SERVICE_JOBS, "Node does not have enough metadata")
	}

	var reader io.ReadCloser

	var rer error
	if localFolder := node.GetStringMeta(common.META_NAMESPACE_NODE_TEST_LOCAL_FOLDER); localFolder != "" {
		baseName := node.GetStringMeta("name")
		targetFileName := filepath.Join(localFolder, baseName)
		reader, rer = os.Open(targetFileName)
	} else {
		reader, rer = e.Router.GetObject(ctx, proto.Clone(node).(*tree.Node), &views.GetRequestData{Length: -1})
	}

	//reader, rer := node.ReadFile(ctx)
	if rer != nil {
		return nil, rer
	}
	defer func() {
		ioutil.ReadAll(reader)
		reader.Close()
	}()

	// Optionally register camera makenote data parsing - currently Nikon and
	// Canon are supported.
	// exif.RegisterParsers(mknote.All...)
	x, err := exif.Decode(reader)
	if err != nil {
		return nil, err
	}

	return x, nil
}

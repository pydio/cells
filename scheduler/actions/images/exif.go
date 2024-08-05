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
	"os"
	"path/filepath"

	"github.com/rwcarlsen/goexif/exif"
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/forms"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/scheduler/actions"
)

const (
	MetadataExif              = "ImageExif"
	MetadataCompatOrientation = "image_exif_orientation"
)

var (
	exifTaskName = "actions.images.exif"
)

type ExifProcessor struct {
	common.RuntimeHolder
	metaClient tree.NodeReceiverClient
}

// GetDescription returns action description
func (e *ExifProcessor) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:                exifTaskName,
		Label:             "Extract EXIF",
		Icon:              "image-search",
		Description:       "Extract EXIF data from jpeg images and store them as indexed metadata",
		SummaryTemplate:   "",
		HasForm:           false,
		Category:          actions.ActionCategoryContents,
		InputDescription:  "Single-selection of file. Temporary and zero-bytes will be ignored",
		OutputDescription: "Input file with updated metadata",
	}
}

// GetParametersForm returns a UX form
func (e *ExifProcessor) GetParametersForm() *forms.Form {
	return nil
}

// GetName returns this action unique identifier
func (e *ExifProcessor) GetName() string {
	return exifTaskName
}

// Init passes parameters to the action
func (e *ExifProcessor) Init(job *jobs.Job, action *jobs.Action) error {
	//e.Router = views.NewStandardRouter(views.RouterOptions{AdminView: true, WatchRegistry: false})
	if !nodes.IsUnitTestEnv {
		e.metaClient = tree.NewNodeReceiverClient(grpc.ResolveConn(e.GetRuntimeContext(), common.ServiceMetaGRPC))
	}
	return nil
}

// Run the actual action code
func (e *ExifProcessor) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {

	if len(input.Nodes) == 0 || input.Nodes[0].Size == -1 || input.Nodes[0].Etag == common.NodeFlagEtagTemporary {
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

	output := input.Clone()
	node.MustSetMeta(MetadataExif, exifData)
	orientation, oe := exifData.Get(exif.Orientation)
	if oe == nil {
		t := orientation.String()
		if t != "" {
			node.MustSetMeta(MetadataCompatOrientation, t)
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
		node.MustSetMeta(common.MetaNamespaceGeoLocation, geoLocation)
	}

	if _, er := e.metaClient.UpdateNode(ctx, &tree.UpdateNodeRequest{From: node, To: node}); er != nil {
		return output.WithError(er), er
	}

	output.Nodes[0] = node
	log.TasksLogger(ctx).Info("Extracted EXIF data from "+node.GetPath(), node.ZapPath())
	output.AppendOutput(&jobs.ActionOutput{
		Success: true,
	})

	return output, nil
}

func (e *ExifProcessor) ExtractExif(ctx context.Context, node *tree.Node) (*exif.Exif, error) {

	// Open the test image.
	if !node.HasSource() {
		return nil, errors.WithMessagef(errors.StatusInternalServerError, "Node does not have enough metadata")
	}

	var reader io.ReadCloser

	var rer error
	if localFolder := node.GetStringMeta(common.MetaNamespaceNodeTestLocalFolder); localFolder != "" {
		baseName := node.GetStringMeta(common.MetaNamespaceNodeName)
		targetFileName := filepath.Join(localFolder, baseName)
		reader, rer = os.Open(targetFileName)
	} else {
		reader, rer = getRouter(e.GetRuntimeContext()).GetObject(ctx, proto.Clone(node).(*tree.Node), &models.GetRequestData{Length: -1})
	}

	//reader, rer := node.ReadFile(ctx)
	if rer != nil {
		return nil, rer
	}
	defer func() {
		_, _ = io.ReadAll(reader)
		_ = reader.Close()
	}()

	// Optionally register camera makenote data parsing - currently Nikon and
	// Canon are supported.
	// exif.RegisterParsers(mknote.All...)
	x, err := exif.Decode(reader)

	// Do not throw an error when there are no exif data
	if err != nil && err.Error() != "EOF" {
		return nil, err
	}

	return x, nil
}

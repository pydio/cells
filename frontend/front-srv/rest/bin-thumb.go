package rest

import (
	"bytes"
	"context"
	"fmt"
	"image"
	"io"
	"net/http"

	"github.com/disintegration/imaging"
	"go.uber.org/zap"
	"golang.org/x/image/colornames"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"
)

func readBinary(ctx context.Context, router nodes.Client, node *tree.Node, output io.Writer, headers http.Header, extension string, resize ...int) error {

	headers.Add("Content-Security-Policy", "script-src 'none'")
	headers.Add("X-Content-Security-Policy", "sandbox")
	info, e := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: node})
	if e != nil {
		return e
	}
	if len(resize) == 0 {

		ctx = context.WithValue(context.Background(), common.PydioContextUserKey, common.PydioSystemUsername)
		reader, e := router.GetObject(ctx, node, &models.GetRequestData{Length: info.Node.Size})
		if e != nil {
			return e
		}
		defer reader.Close()
		headers.Set("Content-Type", "image/"+extension)

		if _, e := io.Copy(output, reader); e != nil {
			return e
		}

	} else {
		d := resize[0]
		newNode := node.Clone()
		newNode.Path = fmt.Sprintf("%s-thumb-%d", node.Path, d)

		if thumb, e := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: newNode}); e == nil {
			log.Logger(ctx).Debug("Thumbnail exists, return it", newNode.Zap())
			headers.Set("Content-Type", "image/jpeg")
			reader, _ := router.GetObject(ctx, newNode, &models.GetRequestData{Length: thumb.Node.Size})
			defer reader.Close()
			io.Copy(output, reader)
			return nil
		}

		reader, e := router.GetObject(ctx, node, &models.GetRequestData{Length: info.Node.Size})
		if e != nil {
			return e
		}
		src, err := imaging.Decode(reader)
		if err != nil {
			return err
		} else {
			reader.Close()
		}
		dst := imaging.Resize(src, d, 0, imaging.Lanczos)
		ol := imaging.New(dst.Bounds().Dx(), dst.Bounds().Dy(), colornames.Lightgrey)
		ol = imaging.Overlay(ol, dst, image.Pt(0, 0), 1.0)
		headers.Set("Content-Type", "image/jpeg")

		var buffer []byte
		w := bytes.NewBuffer(buffer)
		multi := io.MultiWriter(w, output)
		if err := imaging.Encode(multi, ol, imaging.JPEG, imaging.JPEGQuality(85)); err != nil {
			return err
		}
		defer func() {
			// Now store buffered data
			_, e := router.PutObject(ctx, newNode, w, &models.PutRequestData{Size: int64(w.Len())})
			log.Logger(ctx).Debug("Storing thumbnail", newNode.Zap(), zap.Error(e))
		}()

	}

	return nil
}

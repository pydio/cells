package dav

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"os"
	"path"
	"strconv"
	"strings"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/nodes/posix"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/telemetry/log"
)

var (
	MultipartSize int64 = 20 * 1024 * 1024
)

func init() {
	runtime.RegisterEnvVariable("CELLS_DAV_MULTIPART_SIZE", "20", "Default part size used to automatically chunk DAV uploads, in MB")
	if v := os.Getenv("CELLS_DAV_MULTIPART_SIZE"); v != "" {
		if s, e := strconv.Atoi(v); e == nil {
			if s%10 != 0 {
				fmt.Println("[WARNING] CELLS_DAV_MULTIPART_SIZE : multipart size must be always a multiple of 10MB")
			} else {
				MultipartSize = int64(s) * 1024 * 1024
			}
		}
	}
}

// File implements the webdav.File interface and translates various file accesses into object client
// PutObject / GetObject calls.
type File struct {
	fs   *FileSystem
	node *tree.Node
	ctx  context.Context

	// wrappedCtx context.Context
	name       string
	off        int64
	children   []os.FileInfo
	openReader io.ReadCloser

	// When writing to new node, remove temporary on error
	createErrorCallback func() error
}

// ReadFrom bypasses the usual Reader interface to implement multipart uploads to the minio server,
// rather than using the default Write method that is called by webdav via io.Copy.
// It enables among others the definition of a part size that is more appropriate than the default 32K used by io.COPY
func (f *File) ReadFrom(r io.Reader) (n int64, err error) {

	var multipartID string
	applyError := func(e error, msg string) (int64, error) {
		if multipartID != "" {
			_ = f.fs.Router.MultipartAbort(f.ctx, f.node, multipartID, &models.MultipartRequestData{})
		}
		if f.createErrorCallback != nil {
			if e := f.createErrorCallback(); e != nil {
				log.Logger(f.ctx).Error("Error while deleting temporary node")
			}
		}
		return 0, errors.WithMessage(e, msg)
	}

	partNumber := 0
	var completeParts []models.MultipartObjectPart

	multipartID, err = f.fs.Router.MultipartCreate(f.ctx, f.node, &models.MultipartRequestData{})
	if err != nil {
		return applyError(err, "multipart creation error")
	}
	log.Logger(f.ctx).Debug("READ FROM - starting effective dav parts upload for " + f.name + " with id " + multipartID)
	for {
		buf := make([]byte, MultipartSize)
		buffer := bytes.NewBuffer(buf)
		nn, e := io.ReadFull(r, buf)
		if e == io.EOF {
			// No bytes were read, either stop or break
			if partNumber == 0 {
				_ = f.fs.Router.MultipartAbort(f.ctx, f.node, multipartID, &models.MultipartRequestData{})
				return 0, nil
			}
			break
		}
		partNumber++
		log.Logger(f.ctx).Debug(fmt.Sprintf("Should now create new part %d of size %d", partNumber, nn))
		// Make sure to LimitReader as nn may be smaller than buffer size
		objPart, ew := f.fs.Router.MultipartPutObjectPart(f.ctx, f.node, multipartID, partNumber, io.LimitReader(buffer, int64(nn)), &models.PutRequestData{
			Size:              int64(nn),
			MultipartUploadID: multipartID,
			MultipartPartID:   partNumber,
		})
		if ew != nil {
			return applyError(ew, "multipart put object")
		}
		completeParts = append(completeParts, objPart)
		if int64(nn) < MultipartSize || e == io.ErrUnexpectedEOF {
			break
		}
	}

	objInfo, err := f.fs.Router.MultipartComplete(f.ctx, f.node, multipartID, completeParts)
	if err != nil {
		return applyError(err, "multipart complete")
	}

	log.Logger(f.ctx).Info(fmt.Sprintf("Multipart upload of %s (%d parts for a total of %d bytes)", f.name, len(completeParts), objInfo.Size))
	return objInfo.Size, nil

}

// Write is unused but left to respect Writer interface. This method is bypassed by io.Copy to use ReadFrom (see above)
func (f *File) Write(p []byte) (int, error) {
	return 0, errors.WithMessage(errors.StatusInternalServerError, "Write method must not be called, rather use ReadFrom")
}

// Close closes the underlying reader if it is open
func (f *File) Close() error {
	log.Logger(f.ctx).Debug("File.Close", zap.Any("file", f))
	if f.openReader != nil {
		return f.openReader.Close()
	}
	return nil
}

// Seek sets the internal pointer, and clearing any existing reader
func (f *File) Seek(offset int64, whence int) (int64, error) {
	f.fs.mu.Lock()
	defer f.fs.mu.Unlock()

	var err error
	switch whence {
	case io.SeekStart:
		f.off = 0
	case io.SeekCurrent:
		break
	case io.SeekEnd:
		f.off = f.node.Size
	}
	f.off += offset
	if f.off < 0 {
		f.off = 0
		return 0, fmt.Errorf("invalid negative offset %d - (offset %d - whence %d)", f.off, offset, whence)
	}
	if f.off > f.node.Size {
		f.off = 0
		return 0, io.EOF
	}
	log.Logger(f.ctx).Debug("File.Seek", zap.Int64("file size", f.node.Size), zap.Int64("f.off", f.off), zap.Int64("req offset", offset), zap.Int("whence", whence))

	if f.openReader != nil {
		if e := f.openReader.Close(); e != nil {
			return 0, e
		}
		f.openReader = nil
	}
	log.Logger(f.ctx).Debug("File.Seek", zap.Any("file", f), zap.Int64("f.offset", f.off), zap.Int64("offset required", offset), zap.Int("whence", whence))
	return f.off, err
}

// Read reads the requested number of bytes starting at the internal cursor.
// It updates the cursor afterward.
func (f *File) Read(p []byte) (int, error) {
	f.fs.mu.Lock()
	defer f.fs.mu.Unlock()

	// If offset is superior to size, return io.EOF !
	if f.off >= f.node.Size {
		return 0, io.EOF
	}
	if f.openReader == nil {
		// Open reader at current offset, until the end. If offset is reset by Seek, it will nil-ify the reader
		reader, err := f.fs.Router.GetObject(f.ctx, f.node, &models.GetRequestData{StartOffset: f.off, Length: f.node.Size - f.off})
		if err != nil {
			log.Logger(f.ctx).Debug("File.Read Failed", zap.Int("size", len(p)), zap.Int64("offset", f.off), f.node.Zap(), zap.Error(err))
			return 0, err
		}
		log.Logger(f.ctx).Debug("File.Read Open", zap.Int("size", len(p)), zap.Int64("offset", f.off), f.node.Zap())
		f.openReader = reader
	}
	log.Logger(f.ctx).Debug("File.Read Required", zap.Int("length", len(p)), zap.Int64("offset", f.off))
	length, err := f.openReader.Read(p)
	log.Logger(f.ctx).Debug("File.Read Received", zap.Int("length", length))
	f.off += int64(length)
	if length == 0 {
		return 0, io.EOF
	}
	if err != nil && err != io.EOF {
		log.Logger(f.ctx).Error("Error while reading buffer", zap.Error(err))
		return length, err
	}
	return length, nil
}

// Readdir lists the directory children as a slice of os.FileInfo
func (f *File) Readdir(count int) ([]os.FileInfo, error) {
	f.fs.mu.Lock()
	defer f.fs.mu.Unlock()

	log.Logger(f.ctx).Debug("File.Readdir", zap.Any("file", f))

	if f.children == nil {

		nodesClient, err := f.fs.Router.ListNodes(f.ctx, &tree.ListNodesRequest{Node: f.node})
		if err != nil {
			return nil, err
		}

		f.children = []os.FileInfo{}
		for {

			resp, err := nodesClient.Recv()
			if resp == nil || err != nil {
				break
			}
			if strings.HasPrefix(path.Base(resp.GetNode().GetPath()), "._") {
				log.Logger(f.ctx).Warn("Ignoring file " + path.Base(resp.GetNode().GetPath()))
				continue
			}
			f.children = append(f.children, posix.NewFileInfo(resp.GetNode()))
		}
	}

	old := f.off
	if old >= int64(len(f.children)) {
		if count > 0 {
			return nil, io.EOF
		}
		return nil, nil
	}
	if count > 0 {
		f.off += int64(count)
		if f.off > int64(len(f.children)) {
			f.off = int64(len(f.children))
		}
	} else {
		f.off = int64(len(f.children))
		old = 0
	}
	return f.children[old:f.off], nil
}

// Stat returns an os.FileInfo, calling the underlying fs if it is not already loaded
func (f *File) Stat() (os.FileInfo, error) {
	if f.node != nil {
		return posix.NewFileInfo(f.node), nil
	}

	f.fs.mu.Lock()
	defer f.fs.mu.Unlock()

	log.Logger(f.ctx).Info("File.Stat", zap.Object("file node", f.node))

	return f.fs.stat(f.ctx, f.name)
}

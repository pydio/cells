package dav

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"os"
	"path"
	"strings"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/nodes/posix"
	"github.com/pydio/cells/v4/common/proto/tree"
	cerrors "github.com/pydio/cells/v4/common/service/errors"
)

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
	//f.fs.mu.Lock()
	//defer f.fs.mu.Unlock()

	// Initialize the multipart upload
	// TO BE REMOVED: was used to reset the path to initial value (end user / external world point of view )
	// inPath := f.node.Path
	// multipartID, err := f.fs.Router.MultipartCreate(f.ctx, f.node, &views.MultipartRequestData{})
	// if err != nil {
	// 	return 0, err
	// }
	// f.node.Path = inPath

	partsInfo := make(map[int]models.MultipartObjectPart)
	var multipartID string

	//	partSize := 100 * 1024 * 1024

	// Write by part
	var written int64
	// Minimum size is 5 MB, trying to upload parts that are smaller will fail with EntityTooSmall error
	minSize := 10 * 1024 * 1024
	// TODO put this in a go routine
	for i := 1; ; i++ {
		nr := 0
		longBuf := make([]byte, 0, 8*1024*1024)

		// Manually insure that the blocks are longer than 5MB:
		// when the input buffer is empty, Read might returns before EOF; even if the array is not yet full.
		for ii := 0; nr < minSize; ii++ {
			shortBuf := make([]byte, 2*1024*1024)
			sr, er := r.Read(shortBuf)
			longBuf = append(longBuf[:nr], shortBuf[:sr]...)
			nr += sr
			log.Logger(f.ctx).Debug(fmt.Sprintf("#%d - Sizes:  sr: %d, shortbuf: %d, longBuf: %d", ii, nr, len(shortBuf), len(longBuf)))

			if er != nil {
				if er != io.EOF {
					log.Logger(f.ctx).Error("Read buffer exception ", zap.Error(er))
				}
				err = er
				break
			}
		}

		if nr > 0 {

			if multipartID == "" {
				var err error
				multipartID, err = f.fs.Router.MultipartCreate(f.ctx, f.node, &models.MultipartRequestData{})
				if err != nil {
					log.Logger(f.ctx).Error("Error while creating multipart")
					if f.createErrorCallback != nil {
						if e := f.createErrorCallback(); e != nil {
							log.Logger(f.ctx).Error("Error while deleting temporary node")
						}
					}
					return 0, err
				}
				log.Logger(f.ctx).Debug("READ FROM - starting effective dav parts upload for " + f.name + " with id " + multipartID)
			}

			reqData := models.PutRequestData{
				Size:              int64(nr), // int64(len(buf)),
				MultipartUploadID: multipartID,
				MultipartPartID:   i, // must be >= 1
				//Md5Sum:            sumMD5(longBuf),
				Sha256Sum: sum256(longBuf),
				// TODO:     Metadata map[string]string, EncryptionMaterial encrypt.Materials
			}

			objPart, ew := f.fs.Router.MultipartPutObjectPart(f.ctx, f.node, multipartID, i, bytes.NewBuffer(longBuf), &reqData)
			if ew != nil {
				log.Logger(f.ctx).Error("MultipartPutObjectPart exception ", zap.Error(ew))
				err = ew
				break
			}

			written += objPart.Size
			if int64(nr) > objPart.Size { // objInfo.Size may be bigger if data was encrypted
				err = io.ErrShortWrite
				break
			}
			// Save successfully uploaded part metadata.
			partsInfo[i] = objPart
		}
		if err != nil {
			if err == io.EOF {
				err = nil
			}
			break
		}
	}

	if err != nil {
		log.Logger(f.ctx).Error("fail to write multiple part ", zap.Error(err))
		if f.createErrorCallback != nil {
			if e := f.createErrorCallback(); e != nil {
				log.Logger(f.ctx).Error("Error while deleting temporary node")
			}
		}
		return written, err
	}

	// Complete multipart write
	completeParts := make([]models.MultipartObjectPart, len(partsInfo))
	// Loop over total uploaded parts to save them in completeParts array before completing the multipart request.
	for j := 1; j <= len(partsInfo); j++ {
		part, ok := partsInfo[j]
		if !ok {
			if f.createErrorCallback != nil {
				if e := f.createErrorCallback(); e != nil {
					log.Logger(f.ctx).Error("Error while deleting temporary node")
				}
			}
			return written, fmt.Errorf("multipart - missing part number %d", j)
		}
		completeParts[j-1] = models.MultipartObjectPart{
			ETag:       part.ETag,
			PartNumber: part.PartNumber,
		}
	}

	log.Logger(f.ctx).Info(fmt.Sprintf("Uploaded %d parts", len(partsInfo)), zap.Int("CompleteParts count", len(completeParts)))

	// Will be useful when we use goroutines and channels
	// // Sort all completed parts.
	// sort.Sort(completedParts(complMultipartUpload.Parts))
	// if _, err = c.completeMultipartUpload(ctx, bucketName, objectName, uploadID, complMultipartUpload); err != nil {
	// 	return totalUploadedSize, err
	// }

	if len(completeParts) == 0 || written == 0 {
		return 0, nil
	}

	objInfo, err := f.fs.Router.MultipartComplete(f.ctx, f.node, multipartID, completeParts)
	if err != nil {
		if f.createErrorCallback != nil {
			if e := f.createErrorCallback(); e != nil {
				log.Logger(f.ctx).Error("Error while deleting temporary node")
			}
		}
		return written, err
	}

	if written > objInfo.Size { // objInfo.Size may be bigger if data was encrypted
		err = io.ErrShortWrite
		if f.createErrorCallback != nil {
			if e := f.createErrorCallback(); e != nil {
				log.Logger(f.ctx).Error("Error while deleting temporary node")
			}
		}
		return written, err
	}

	log.Logger(f.ctx).Info(fmt.Sprintf("Multipart upload of %s (%d parts for a total of %d bytes)", f.name, len(partsInfo), written))
	return written, err
}

// Write is unused but left to respect Writer interface. This method is bypassed by io.Copy to use ReadFrom (see above)
func (f *File) Write(p []byte) (int, error) {
	return 0, cerrors.BadRequest("unauthorized method", "this method must not be called, rather use ReadFrom")
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

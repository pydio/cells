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

package s3

import (
	"context"
	"io"
	"io/ioutil"
	"math"
	"sort"
	"sync"

	context2 "github.com/pydio/cells/common/utils/context"

	"github.com/pydio/minio-go"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
)

// minPartSize - minimum part size 64MiB per object after which
// putObject behaves internally as multipart.
const minPartSize = 1024 * 1024 * 64

// maxPartsCount - maximum number of parts for a single multipart session.
const maxPartsCount = 10000

// MaxCopyObjectSize is 5GB => if greater, we have to switch to multipart
const MaxCopyObjectSize = 1024 * 1024 * 1024 * 5

func optimalPartInfo(objectSize int64) (totalPartsCount int, partSize int64, lastPartSize int64) {
	// Use floats for part size for all calculations to avoid
	// overflows during float64 to int64 conversions.
	partSizeFlt := math.Ceil(float64(objectSize / maxPartsCount))
	partSizeFlt = math.Ceil(partSizeFlt/minPartSize) * minPartSize
	// Total parts count.
	totalPartsCount = int(math.Ceil(float64(objectSize) / partSizeFlt))
	// Part size.
	partSize = int64(partSizeFlt)
	// Last part size.
	lastPartSize = objectSize - int64(totalPartsCount-1)*partSize
	return totalPartsCount, partSize, lastPartSize
}

func CopyObjectMultipart(ctx context.Context, client *minio.Core, srcObject minio.ObjectInfo, srcBucket, srcPath, destBucket, destPath string, metadata map[string]string, progress io.Reader) error {
	log.Logger(ctx).Debug("Entering MultipartUpload for COPY")
	if metadata != nil {
		ctx = context2.WithAdditionalMetadata(ctx, metadata)
	}
	// We have to use multipart copy
	uploadID, err := client.NewMultipartUploadWithContext(ctx, destBucket, destPath, minio.PutObjectOptions{UserMetadata: metadata})
	if err != nil {
		log.Logger(ctx).Error("New Multipart Error", zap.Error(err))
		return err
	}
	partSize := srcObject.Size / 10
	totalPartsCount, partSize, lastPartSize := optimalPartInfo(srcObject.Size)
	var parts []minio.CompletePart
	queue := make(chan struct{}, 15)
	wg := &sync.WaitGroup{}
	wg.Add(totalPartsCount)
	var copyErr error
	for i := 0; i < totalPartsCount; i++ {
		queue <- struct{}{}
		go func(index int) {
			defer func() {
				wg.Done()
				<-queue
			}()
			if copyErr != nil {
				return
			}
			length := partSize
			if index == totalPartsCount-1 {
				length = lastPartSize
			}
			startOffset := int64(index) * partSize
			log.Logger(ctx).Debug("COPY PART", zap.Int("part", index), zap.Int64("offset", startOffset), zap.Int64("length", length))
			p, er := client.CopyObjectPartWithContext(ctx, srcBucket, srcPath, destBucket, destPath, uploadID, index+1, startOffset, length, nil)
			if er != nil {
				log.Logger(ctx).Error("CopyObjectPart Error - other parts will be ignored", zap.Error(err))
				copyErr = er
			} else if progress != nil {
				io.CopyN(ioutil.Discard, progress, length)
			}
			parts = append(parts, p)
		}(i)
	}
	wg.Wait()
	if copyErr != nil {
		client.AbortMultipartUploadWithContext(ctx, destBucket, destPath, uploadID)
		return copyErr
	}
	// Resort parts in correct order
	sort.Slice(parts, func(i, j int) bool {
		return parts[i].PartNumber < parts[j].PartNumber
	})
	log.Logger(ctx).Debug("Finishing Multipart")
	_, er := client.CompleteMultipartUploadWithContext(ctx, destBucket, destPath, uploadID, parts)
	if er != nil {
		log.Logger(ctx).Error("CompleteMultipart Error", zap.Error(err))
	}
	return er
}

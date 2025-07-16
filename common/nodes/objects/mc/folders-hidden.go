package mc

import (
	"context"
	"crypto/md5"
	"fmt"
	"io"
	"path"
	"strings"

	minio "github.com/minio/minio-go/v7"
	"github.com/pborman/uuid"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes/models"
)

const (
	metaFolderUUID = "X-Amz-Meta-Cells-Folder-Uuid"
)

type HiddenFoldersWrapper struct {
	*Client
	translateHidden string
}

func (c *HiddenFoldersWrapper) GetObject(ctx context.Context, bucketName, objectName string, opts models.ReadMeta) (io.ReadCloser, models.ObjectInfo, error) {
	getOpts := c.readMetaToMinioOpts(ctx, opts)
	if emptyKey, ok := c.hiddenToEmpty(objectName); ok {
		return c.readEmptyMetaAsContent(ctx, bucketName, emptyKey, getOpts)
	}
	return c.Client.GetObject(ctx, bucketName, objectName, opts)
}

func (c *HiddenFoldersWrapper) StatObject(ctx context.Context, bucketName, objectName string, opts models.ReadMeta) (models.ObjectInfo, error) {
	if emptyKey, o := c.hiddenToEmpty(objectName); o {
		return c.getHiddenObjectInfo(ctx, bucketName, objectName, emptyKey, c.readMetaToMinioOpts(ctx, opts))
	}
	return c.Client.StatObject(ctx, bucketName, objectName, opts)
}

func (c *HiddenFoldersWrapper) PutObject(ctx context.Context, bucketName, objectName string, reader io.Reader, objectSize int64, opts models.PutMeta) (n models.ObjectInfo, err error) {
	if emptyKey, o := c.hiddenToEmpty(objectName); o {
		return c.putContentAsEmptyMeta(ctx, bucketName, objectName, emptyKey, reader, opts)
	}
	return c.Client.PutObject(ctx, bucketName, objectName, reader, objectSize, opts)
}

func (c *HiddenFoldersWrapper) RemoveObject(ctx context.Context, bucketName, objectName string) error {
	objectName, _ = c.hiddenToEmpty(objectName)
	return c.Client.RemoveObject(ctx, bucketName, objectName)
}

func (c *HiddenFoldersWrapper) CopyObject(ctx context.Context, sourceBucket, sourceObject, destBucket, destObject string, srcMeta, metadata map[string]string, progress io.Reader) (models.ObjectInfo, error) {
	sourceObject, _ = c.hiddenToEmpty(sourceObject)
	destObject, _ = c.hiddenToEmpty(destObject)
	return c.Client.CopyObject(ctx, sourceBucket, sourceObject, destBucket, destObject, srcMeta, metadata, progress)
}

func (c *HiddenFoldersWrapper) ListObjects(ctx context.Context, bucket, prefix, marker, delimiter string, max ...int) (result models.ListBucketResult, err error) {

	recursive := true
	if delimiter == "/" {
		recursive = false
	}
	limit := 0
	if len(max) > 0 && max[0] > 0 {
		limit = max[0]
		var can context.CancelFunc
		ctx, can = context.WithCancel(ctx)
		defer can()
	}
	ch := c.mc.Client.ListObjects(ctx, bucket, minio.ListObjectsOptions{
		Prefix:     prefix,
		Recursive:  recursive,
		StartAfter: marker,
	})
	r := models.ListBucketResult{
		Delimiter: delimiter,
		Marker:    marker,
		Name:      bucket,
		Prefix:    prefix,
	}

	i := 0
	var cc []models.ObjectInfo
	for oi := range ch {
		if oi.Err != nil {
			return result, oi.Err
		}
		i++
		cc = append(cc, minioInfoToModelsInfo(oi))
		/*
			if strings.HasSuffix(oi.Key, "/") {
				r.CommonPrefixes = append(r.CommonPrefixes, models.CommonPrefix{Prefix: oi.Key})
			} else {
				r.Contents = append(r.Contents, minioInfoToModelsInfo(oi))
			}
		*/
		if limit > 0 && i >= limit {
			break
		}
	}

	cc = c.updateListingResults(ctx, bucket, cc)
	for _, o := range cc {
		if strings.HasSuffix(o.Key, "/") {
			r.CommonPrefixes = append(r.CommonPrefixes, models.CommonPrefix{Prefix: o.Key})
		} else {
			r.Contents = append(r.Contents, o)
		}
	}

	return r, nil
}

func (c *HiddenFoldersWrapper) updateListingResults(ctx context.Context, bucket string, contents []models.ObjectInfo) (output []models.ObjectInfo) {
	existingPydios := make(map[string]models.ObjectInfo)
	for _, o := range contents {
		if e, t := c.hiddenToEmpty(o.Key); t {
			existingPydios[e] = o
		}
	}
	for _, oi := range contents {
		oo, changed, ignore := c.updateListingEntry(ctx, bucket, oi, existingPydios)
		if ignore {
			continue
		}
		if changed {
			output = append(output, oo)
		} else {
			output = append(output, oi)
		}
	}
	return
}

// updateListingEntry tries does two things : transform on-the-fly empty objects with Uuid meta to fake .pydio,
// and if a .pydio does really exist, get the Uuid from its content and attach it to an empty object, then delete it (migration).
func (c *HiddenFoldersWrapper) updateListingEntry(ctx context.Context, bucket string, oi models.ObjectInfo, pydios map[string]models.ObjectInfo) (models.ObjectInfo, bool, bool) {
	if h, ok := c.emptyToHidden(oi.Key); ok {
		emptyOi, err := c.mc.StatObject(ctx, bucket, oi.Key, minio.StatObjectOptions{})
		if err != nil {
			//fmt.Println("86 cannot stat empty object")
			return oi, false, false
		}
		var uid string
		if id, has := emptyOi.Metadata[metaFolderUUID]; has {
			//fmt.Println("empty has Uuid", id)
			uid = strings.Join(id, "")
		} else if _, hasP := pydios[oi.Key]; hasP {
			//fmt.Println("empty will be migrated at next step, ignore")
			// This will be migrated at next step, return ignore
			return oi, false, true
		} else {
			//fmt.Println("empty - create an uuid and attach it as meta")
			// Create an Uuid and attach it as meta to existing empty folder object
			uid = uuid.New()
			newMeta := map[string]string{
				common.XAmzMetaDirective: "REPLACE",
				metaFolderUUID:           uid,
			}
			srcOptions := minio.CopySrcOptions{
				Bucket: bucket,
				Object: oi.Key,
			}
			destOptions := minio.PutObjectOptions{}

			if _, e := c.mc.CopyObject(ctx, bucket, oi.Key, bucket, oi.Key, newMeta, srcOptions, destOptions); e != nil {
				fmt.Println("[INFO] Could not attach metadata to existing empty object", oi.Key, " - err was ", e.Error())
			}
		}
		oi.Size = int64(len(uid))
		mH := md5.New()
		mH.Write([]byte(uid))
		oi.ETag = fmt.Sprintf("%x", mH.Sum(nil))
		oi.Key = h
		return oi, true, false
	} else if empty, o2 := c.hiddenToEmpty(oi.Key); o2 {
		// This is an existing .pydio - migrate it to empty folder with meta instead, and let it go through the listing
		fmt.Println("[INFO] Migrating .pydio to S3 empty object")
		reader, _, _, er := c.mc.GetObject(ctx, bucket, oi.Key, minio.GetObjectOptions{})
		if er == nil {
			//fmt.Println("hidden - got reader")
			data, _ := io.ReadAll(reader)
			uid := strings.TrimSpace(string(data))
			var e error
			if _, err := c.mc.StatObject(ctx, bucket, empty, minio.StatObjectOptions{}); err == nil {
				//fmt.Println("hidden - got corresponding empty folder, attach meta to it")
				// Attach the Uuid as meta to existing empty folder object
				newMeta := map[string]string{
					common.XAmzMetaDirective: "REPLACE",
					metaFolderUUID:           uid,
				}
				srcOptions := minio.CopySrcOptions{
					Bucket: bucket,
					Object: empty,
				}
				destOptions := minio.PutObjectOptions{}
				if _, e = c.mc.CopyObject(ctx, bucket, empty, bucket, empty, newMeta, srcOptions, destOptions); e != nil {
					fmt.Println("[INFO] Could not attach metadata to existing empty object", empty, " - err was ", e.Error())
				} else {
					//fmt.Println("hidden - got corresponding empty folder, attached meta OK")
				}
			} else {
				//fmt.Println("hidden - create an empty object with meta")
				if _, e = c.mc.PutObject(ctx, bucket, empty, strings.NewReader(""), 0, "", "", minio.PutObjectOptions{UserMetadata: map[string]string{metaFolderUUID: uid}}); e != nil {
					fmt.Println("[INFO] Could not create empty object to replace .pydio", empty, " - err was ", e.Error())
				}
			}
			if e == nil {
				//fmt.Println("hidden - now delete original .pydio")
				// Now delete original file .pydio
				if err := c.mc.RemoveObject(ctx, bucket, oi.Key, minio.RemoveObjectOptions{}); err != nil {
					fmt.Println("[INFO] Could not remove legacy .pydio file on bucket")
				}
			}
		}
	}
	return oi, false, false
}

func (c *HiddenFoldersWrapper) putContentAsEmptyMeta(ctx context.Context, bucket, object, emptyKey string, data io.Reader, opts models.PutMeta) (models.ObjectInfo, error) {
	content, er := io.ReadAll(data)
	if er != nil {
		return models.ObjectInfo{}, er
	}
	meta := map[string]string{metaFolderUUID: string(content)}
	for k, v := range opts.UserMetadata {
		meta[k] = v
	}
	putOpts := minio.PutObjectOptions{UserMetadata: meta}
	oi, err := c.mc.PutObject(ctx, bucket, emptyKey, strings.NewReader(""), 0, "", "", putOpts)
	if err == nil {
		oi.Size = 36 // Manually update size for notification
	}
	return minioUploadInfoToModelsInfo(opts, oi), err
}

type srcloser struct {
	io.Reader
}

func (s *srcloser) Close() error {
	return nil
}

func (c *HiddenFoldersWrapper) readEmptyMetaAsContent(ctx context.Context, bucket, emptyKey string, st minio.StatObjectOptions) (io.ReadCloser, models.ObjectInfo, error) {
	oi, err := c.mc.StatObject(ctx, bucket, emptyKey, st)
	if err != nil {
		return nil, models.ObjectInfo{}, err
	}
	if id, has := oi.Metadata[metaFolderUUID]; has {
		rc := strings.NewReader(strings.Join(id, ""))
		return &srcloser{Reader: rc}, minioInfoToModelsInfo(oi), nil
	}
	return nil, models.ObjectInfo{}, errors.New("no attached id found")
}

func (c *HiddenFoldersWrapper) getHiddenObjectInfo(ctx context.Context, bucket, object, emptyKey string, st minio.StatObjectOptions) (models.ObjectInfo, error) {
	oi, err := c.mc.StatObject(ctx, bucket, emptyKey, st)
	if err != nil {
		return models.ObjectInfo{}, err //minio.ErrorRespToObjectError(err, bucket, object)
	}
	mo := minioInfoToModelsInfo(oi)
	if id, has := oi.Metadata[metaFolderUUID]; has {
		uid := strings.Join(id, "")
		mo.Size = int64(len(uid))
		mo.Key = object
		mH := md5.New()
		mH.Write([]byte(uid))
		mo.ETag = fmt.Sprintf("%x", mH.Sum(nil))
	}
	return mo, nil
}

func (c *HiddenFoldersWrapper) hiddenToEmpty(k string) (string, bool) {
	if c.translateHidden != "" && strings.HasSuffix(k, c.translateHidden) && path.Dir(k) != "." {
		return path.Dir(k) + "/", true
	}
	return k, false
}

func (c *HiddenFoldersWrapper) emptyToHidden(k string) (string, bool) {
	if c.translateHidden != "" && strings.HasSuffix(k, "/") {
		return k + c.translateHidden, true
	}
	return k, false
}

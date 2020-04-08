package s3

import (
	"crypto/md5"
	"fmt"
	"io"
	"io/ioutil"
	"path"
	"strings"

	"github.com/pborman/uuid"
	"github.com/pydio/minio-go"
	"github.com/pydio/minio-go/pkg/encrypt"
	miniosrv "github.com/pydio/minio-srv/cmd"
)

const (
	metaFolderUUID = "X-Amz-Meta-Cells-Folder-Uuid"
)

func (l *s3Objects) updateListingResults(bucket string, contents []minio.ObjectInfo) (output []minio.ObjectInfo) {
	output = make([]minio.ObjectInfo, len(contents))

	existingPydios := make(map[string]minio.ObjectInfo)
	for _, o := range contents {
		if e, t := l.hiddenToEmpty(o.Key); t {
			existingPydios[e] = o
		}
	}
	for _, oi := range contents {
		oo, changed, ignore := l.updateListingEntry(bucket, oi, existingPydios);
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
// and if a .pydio does really exists, get the Uuid from its content and attach it to an empty object, then delete it (migration).
func (l *s3Objects) updateListingEntry(bucket string, oi minio.ObjectInfo, pydios map[string]minio.ObjectInfo) (minio.ObjectInfo, bool, bool) {
	if h, ok := l.emptyToHidden(oi.Key); ok {
		emptyOi, err := l.Client.StatObject(bucket, oi.Key, minio.StatObjectOptions{})
		if err != nil {
			return oi, false, false
		}
		var uid string
		if id, has := emptyOi.Metadata[metaFolderUUID]; has {
			uid = strings.Join(id, "")
		} else if _, hasP := pydios[oi.Key]; hasP {
			// This will be migrated at next step, return ignore
			return oi, false, true
		} else {
			// Create an Uuid and attach it as meta to existing empty folder object
			uid = uuid.New()
			newMeta := map[string]string{
				"x-amz-metadata-directive" : "REPLACE",
				metaFolderUUID:              uid,
			}
			if _, e := l.Client.CopyObject(bucket, oi.Key, bucket, oi.Key, newMeta); e != nil {
				fmt.Println("[INFO] Could not attach metadata to existing empty object", oi.Key, " - err was ", e.Error())
			}
		}
		oi.Size = int64(len(uid))
		mH := md5.New()
		mH.Write([]byte(uid))
		oi.ETag = fmt.Sprintf("%x", mH.Sum(nil))
		oi.Key = h
		return oi, true, false
	} else if empty, o2 := l.hiddenToEmpty(oi.Key); o2 {
		// This is an existing .pydio - migrate it to empty folder with meta instead, and let it go through the listing
		fmt.Println("[INFO] Migrating .pydio to S3 empty object")
		reader, _, _ := l.Client.GetObject(bucket, oi.Key, minio.GetObjectOptions{})
		data, _ := ioutil.ReadAll(reader)
		uid := strings.TrimSpace(string(data))
		var e error
		if _, err := l.Client.StatObject(bucket, empty, minio.StatObjectOptions{}); err == nil{
			// Attach the Uuid as meta to existing empty folder object
			newMeta := map[string]string{
				"x-amz-metadata-directive" : "REPLACE",
				metaFolderUUID:              uid,
			}
			if _, e = l.Client.CopyObject(bucket, empty, bucket, empty, newMeta); e != nil {
				fmt.Println("[INFO] Could not attach metadata to existing empty object", empty, " - err was ", e.Error())
			}
		} else {
			if _, e = l.Client.PutObject(bucket, empty, strings.NewReader(""), 0, "", "", map[string]string{metaFolderUUID:uid}, nil); e != nil {
				fmt.Println("[INFO] Could not create empty object to replace .pydio", empty, " - err was ", e.Error())
			}
		}
		if e == nil {
			// Now delete original file .pydio
			if err := l.Client.RemoveObject(bucket, oi.Key); err != nil {
				fmt.Println("[INFO] Could not remove legacy .pydio file on bucket")
			}
		}
	}
	return oi, false, false
}

func (l *s3Objects) putContentAsEmptyMeta(bucket, object, emptyKey string, data io.Reader, metadata map[string]string, sse encrypt.ServerSide) (minio.ObjectInfo, error) {
	content, er := ioutil.ReadAll(data)
	if er != nil {
		return minio.ObjectInfo{}, er
	}
	meta := map[string]string{metaFolderUUID: string(content)}
	for k, v := range metadata {
		meta[k] = v
	}
	oi, err := l.Client.PutObject(bucket, emptyKey, strings.NewReader(""), 0, "", "", miniosrv.ToMinioClientMetadata(meta), sse)
	if err == nil {
		oi.Size = 36 // Manually update size for notification
	}
	return oi, err
}

func (l *s3Objects) readEmptyMetaAsContent(bucket, object, emptyKey string, writer io.Writer, sse encrypt.ServerSide) error {
	oi, err := l.Client.StatObject(bucket, emptyKey, minio.StatObjectOptions{GetObjectOptions:minio.GetObjectOptions{ServerSideEncryption: sse}})
	if err != nil {
		return miniosrv.ErrorRespToObjectError(err, bucket, object)
	}
	if id, has := oi.Metadata[metaFolderUUID]; has {
		if _, err = writer.Write([]byte(strings.Join(id, ""))); err != nil {
			return miniosrv.ErrorRespToObjectError(err, bucket, object)
		}
		return nil
	}
	return miniosrv.ErrorRespToObjectError(fmt.Errorf("uuid not found"), bucket, object)
}

func (l *s3Objects) getHiddenObjectInfo(bucket, object, emptyKey string, sse encrypt.ServerSide) (miniosrv.ObjectInfo, error) {
	oi, err := l.Client.StatObject(bucket, emptyKey, minio.StatObjectOptions{GetObjectOptions:minio.GetObjectOptions{ServerSideEncryption: sse}})
	if err != nil {
		return miniosrv.ObjectInfo{}, miniosrv.ErrorRespToObjectError(err, bucket, object)
	}
	if id, has := oi.Metadata[metaFolderUUID]; has {
		uid := strings.Join(id, "")
		oi.Size = int64(len(uid))
		oi.Key = object
		mH := md5.New()
		mH.Write([]byte(uid))
		oi.ETag = fmt.Sprintf("%x", mH.Sum(nil))
	}
	return miniosrv.FromMinioClientObjectInfo(bucket, oi), nil
}

func (l *s3Objects) hiddenToEmpty(k string) (string, bool) {
	if l.translateHidden != "" && strings.HasSuffix(k, l.translateHidden) && path.Dir(k) != "." {
		return path.Dir(k) + "/", true
	}
	return k, false
}

func (l *s3Objects) emptyToHidden(k string) (string, bool) {
	if l.translateHidden != "" && strings.HasSuffix(k, "/") {
		return k + l.translateHidden, true
	}
	return k, false
}
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

package endpoints

import (
	"context"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/pydio/cells/data/source/sync/lib/common"
	"github.com/pydio/minio-go"
	"github.com/rjeczalik/notify"
)

type S3ClientFSWatch struct {
	S3Client
	FSRootPath string
}

func NewS3ClientFSWatch(ctx context.Context, url string, key string, secret string, bucket string, rootPath string, fsRootPath string) (*S3ClientFSWatch, error) {

	log.Print("FS client watch")
	mc, e := minio.New(url, key, secret, false)
	mc.SetAppInfo(UserAgentAppName, UserAgentVersion)
	if e != nil {
		return nil, e
	}
	s3Client, e := NewS3Client(ctx, url, key, secret, bucket, rootPath)
	if e != nil {
		return nil, e
	}
	return &S3ClientFSWatch{
		S3Client:   *s3Client,
		FSRootPath: fsRootPath,
	}, e

}

func (c *S3ClientFSWatch) Watch(recursivePath string) (*common.WatchObject, error) {

	eventChan := make(chan common.EventInfo)
	errorChan := make(chan error)
	doneChan := make(chan bool)
	// Make the channel buffered to ensure no event is dropped. Notify will drop
	// an event if the receiver is not able to keep up the sending pace.
	in, out := PipeChan(1000)

	var fsEvents []notify.Event
	fsEvents = append(fsEvents, EventTypeAll...)

	recursivePath = c.denormalize(recursivePath)

	if e := notify.Watch(filepath.Join(c.FSRootPath, recursivePath)+"...", in, fsEvents...); e != nil {
		return nil, e
	}

	// wait for doneChan to close the watcher, eventChan and errorChan
	go func() {
		<-doneChan

		notify.Stop(in)
		log.Println("Closing event channel for " + c.FSRootPath)
		close(eventChan)
		close(errorChan)
	}()

	// Get fsnotify notifications for events and errors, and sent them
	// using eventChan and errorChan
	go func() {
		for event := range out {

			if common.IsIgnoredFile(event.Path()) {
				continue
			}

			eventInfo, eventError := c.fsEventToEventInfo(event)
			if eventError != nil {
				log.Println("Sending  event error for ", event, eventError, eventInfo)
				errorChan <- eventError
			} else if eventInfo.Path != "" {
				//log.Println("Sending  event info for " + c.RootPath)
				eventChan <- eventInfo
			}

		}
	}()

	return &common.WatchObject{
		EventInfoChan: eventChan,
		ErrorChan:     errorChan,
		DoneChan:      doneChan,
	}, nil

}

// Transforms an OS notify event to a standard pydio EventInfo.
func (c *S3ClientFSWatch) fsEventToEventInfo(event notify.EventInfo) (common.EventInfo, error) {

	var i os.FileInfo
	var empty common.EventInfo
	eventPath := strings.TrimPrefix(CanonicalPath(event.Path()), c.FSRootPath+"/")
	normalizedPath := c.normalize(eventPath)
	log.Print(eventPath, " - ", event.Path(), " - ", c.FSRootPath)
	if isEventType(EventTypeCreate, event.Event()) || isEventType(EventTypeWrite, event.Event()) {

		var e error
		i, e = c.Stat(eventPath)
		if e != nil {
			log.Println("Ignoring Create/Write event on non-existing file")
			return empty, nil
		}
		return common.EventInfo{
			Time:           now(),
			Size:           i.Size(),
			Folder:         i.IsDir(),
			Path:           normalizedPath,
			Type:           common.EventCreate,
			PathSyncSource: c,
		}, nil

	} else if isEventType(EventTypeRename, event.Event()) {

		var e error
		i, e = c.Stat(eventPath)
		if e != nil {
			return common.EventInfo{
				Time:           now(),
				Path:           normalizedPath,
				Type:           common.EventRemove,
				PathSyncSource: c,
			}, nil
		}
		return common.EventInfo{
			Time:           now(),
			Size:           i.Size(),
			Folder:         i.IsDir(),
			Path:           normalizedPath,
			Type:           common.EventRename,
			PathSyncSource: c,
		}, nil

	} else if isEventType(EventTypeDelete, event.Event()) {

		return common.EventInfo{
			Time:           now(),
			Path:           normalizedPath,
			Type:           common.EventRemove,
			PathSyncSource: c,
		}, nil
	} else {
		// Ignore other events
		return empty, nil
	}

}

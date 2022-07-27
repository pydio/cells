package chanwatcher

import (
	"context"
	"path"
	"strings"
	"time"

	servicescommon "github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/sync/model"
)

type Watcher struct {
	model.PathSyncSource
	Context     context.Context
	NodeChanges chan *tree.NodeChangeEvent
	Prefix      string
}

func NewWatcher(ctx context.Context, src model.PathSyncSource, prefix string) *Watcher {
	return &Watcher{
		PathSyncSource: src,
		NodeChanges:    make(chan *tree.NodeChangeEvent, 1000),
		Prefix:         prefix,
		Context:        ctx,
	}
}

func (w *Watcher) Watch(recursivePath string) (*model.WatchObject, error) {

	eventChan := make(chan model.EventInfo)
	errorChan := make(chan error)
	doneChan := make(chan bool)
	wConn := make(chan model.WatchConnectionInfo)

	wo := &model.WatchObject{
		EventInfoChan:  eventChan,
		ErrorChan:      errorChan,
		DoneChan:       doneChan,
		ConnectionInfo: wConn,
	}

	go func() {
		for {
			select {
			case event := <-w.NodeChanges:
				var node *tree.Node
				var eType model.EventType
				switch event.Type {
				case tree.NodeChangeEvent_CREATE:
					eType = model.EventCreate
					node = event.GetTarget()
				case tree.NodeChangeEvent_DELETE:
					eType = model.EventRemove
					node = event.GetSource()
				default:
					break
				}
				if node != nil {
					meta := event.Metadata
					if meta == nil {
						meta = make(map[string]string)
					}
					cleanMeta := make(map[string]string)
					for k, v := range meta {
						if k == servicescommon.XPydioSessionUuid && strings.HasPrefix(v, servicescommon.SyncSessionClose_) {
							cleanMeta[k] = strings.TrimPrefix(v, servicescommon.SyncSessionClose_)
						} else {
							cleanMeta[k] = v
						}
					}
					objectPath := strings.TrimPrefix(node.GetPath(), w.Prefix)
					log.Logger(w.Context).Debug("Got Event", event.Zap())
					// If file is .pydio, also send an event on corresponding folder
					if strings.HasSuffix(objectPath, servicescommon.PydioSyncHiddenFile) {
						eventChan <- model.EventInfo{
							Type:     eType,
							Time:     time.Now().Format(time.RFC822),
							Path:     path.Dir(objectPath),
							Etag:     node.GetEtag(),
							Folder:   true,
							Size:     node.GetSize(),
							Source:   w.PathSyncSource,
							Metadata: cleanMeta,
						}
					}
					eventChan <- model.EventInfo{
						Type:     eType,
						Time:     time.Now().Format(time.RFC822),
						Path:     objectPath,
						Etag:     node.GetEtag(),
						Folder:   !node.IsLeaf(),
						Size:     node.GetSize(),
						Source:   w.PathSyncSource,
						Metadata: meta,
					}
				}

			case <-w.Context.Done():
				break
			}
		}
	}()

	return wo, nil

	//ctx, cancel := context.WithCancel(context.Background())
	/*
		ctx := context.Background()
		wConn := make(chan model.WatchConnectionInfo)

		wo := &model.WatchObject{
			EventInfoChan:  eventChan,
			ErrorChan:      errorChan,
			DoneChan:       doneChan,
			ConnectionInfo: wConn,
		}
		e := broker.SubscribeCancellable(ctx, w.TopicName, func(message broker.Message) error {
			event := &tree.NodeChangeEvent{}
			ct, er := message.Unmarshal(event)
			if er != nil {
				return er
			}
			var node *tree.Node
			var eType model.EventType
			switch event.Type {
			case tree.NodeChangeEvent_CREATE:
				eType = model.EventCreate
				node = event.GetTarget()
			case tree.NodeChangeEvent_DELETE:
				eType = model.EventRemove
				node = event.GetSource()
			default:
				break
			}
			if node != nil {
				mm := make(map[string]string)
				cleanMeta := make(map[string]string)
				if meta, has := metadata.MinioMetaFromContext(ct, false); has {
					mm = meta
					// Strip close_xxx session for additional fake event
					for k, v := range meta {
						if k == servicescommon.XPydioSessionUuid && strings.HasPrefix(v, servicescommon.SyncSessionClose_) {
							cleanMeta[k] = strings.TrimPrefix(v, servicescommon.SyncSessionClose_)
						} else {
							cleanMeta[k] = v
						}
					}
				}
				objectPath := strings.TrimPrefix(node.GetPath(), w.Prefix)
				fmt.Println("Got Event", eType, objectPath, node.IsLeaf(), node.GetSize(), node.GetEtag(), mm)
				// If file is .pydio, also send an event on corresponding folder
				if strings.HasSuffix(objectPath, servicescommon.PydioSyncHiddenFile) {
					eventChan <- model.EventInfo{
						Type:     eType,
						Time:     time.Now().Format(time.RFC822),
						Path:     path.Dir(objectPath),
						Etag:     node.GetEtag(),
						Folder:   true,
						Size:     node.GetSize(),
						Source:   w.PathSyncSource,
						Metadata: cleanMeta,
					}
				}
				eventChan <- model.EventInfo{
					Type:     eType,
					Time:     time.Now().Format(time.RFC822),
					Path:     objectPath,
					Etag:     node.GetEtag(),
					Folder:   !node.IsLeaf(),
					Size:     node.GetSize(),
					Source:   w.PathSyncSource,
					Metadata: mm,
				}
			}
			return nil
		}, broker.Queue("s3events"))
		if e != nil {
			return nil, e
		}
		return wo, nil
	*/
	// wait for events to occur and sent them through the eventChan and errorChan
	/*
		go func() {
			defer func() {
				close(eventChan)
				close(errorChan)
				close(wConn)
			}()

			for {
				select {
				case <-doneChan:
					return
				case notificationInfo, closed := <-eventsCh:
					if notificationInfo.Err != nil {
						if nErr, ok := notificationInfo.Err.(minio.ErrorResponse); ok && nErr.Code == "APINotSupported" {
							errorChan <- errors.New("API Not Supported")
							return
						}
						errorChan <- notificationInfo.Err
						wConn <- model.WatchDisconnected
						if closed {
							return
						}
					}
					for _, record := range notificationInfo.Records {
						//bucketName := record.S3.Bucket.Name
						key, e := url.QueryUnescape(record.S3.Object.Key)
						if e != nil {
							errorChan <- e
							continue
						}
						objectPath := key
						folder := false
						var additionalCreate string
						if strings.HasSuffix(key, servicescommon.PydioSyncHiddenFile) {
							additionalCreate = objectPath
							additionalCreate = c.getLocalPath(additionalCreate)
							objectPath = path.Dir(key)
							folder = true
						}
						if c.isIgnoredFile(objectPath, record) {
							continue
						}
						objectPath = c.getLocalPath(objectPath)

						if strings.HasPrefix(record.EventName, "s3:ObjectCreated:") {
							log.Logger(c.globalContext).Debug("S3 Event", zap.String("event", "ObjectCreated"), zap.Any("event", record))
							eventChan <- model.EventInfo{
								Time:      record.EventTime,
								Size:      record.S3.Object.Size,
								Etag:      record.S3.Object.ETag,
								Path:      objectPath,
								Folder:    folder,
								Source:    c,
								Type:      model.EventCreate,
								Host:      record.Source.Host,
								Port:      record.Source.Port,
								UserAgent: record.Source.UserAgent,
								Metadata:  stripCloseParameters(additionalCreate != "", record.RequestParameters),
							}
							if additionalCreate != "" {
								// Send also the PydioSyncHiddenFile event
								log.Logger(c.globalContext).Debug("S3 Event", zap.String("event", "ObjectCreated"), zap.String("path", additionalCreate))
								eventChan <- model.EventInfo{
									Time:      record.EventTime,
									Size:      record.S3.Object.Size,
									Etag:      record.S3.Object.ETag,
									Path:      additionalCreate,
									Folder:    false,
									Source:    c,
									Type:      model.EventCreate,
									Host:      record.Source.Host,
									Port:      record.Source.Port,
									UserAgent: record.Source.UserAgent,
									Metadata:  record.RequestParameters,
								}
							}

						} else if strings.HasPrefix(record.EventName, "s3:ObjectRemoved:") {
							log.Logger(c.globalContext).Debug("S3 Event", zap.String("event", "ObjectRemoved"), zap.String("path", objectPath))
							eventChan <- model.EventInfo{
								Time:      record.EventTime,
								Path:      objectPath,
								Folder:    folder,
								Source:    c,
								Type:      model.EventRemove,
								Host:      record.Source.Host,
								Port:      record.Source.Port,
								UserAgent: record.Source.UserAgent,
								Metadata:  stripCloseParameters(additionalCreate != "", record.RequestParameters),
							}
							if additionalCreate != "" {
								log.Logger(c.globalContext).Debug("S3 Event", zap.String("event", "ObjectRemoved"), zap.String("path", additionalCreate))
								eventChan <- model.EventInfo{
									Time:      record.EventTime,
									Path:      additionalCreate,
									Folder:    false,
									Source:    c,
									Type:      model.EventRemove,
									Host:      record.Source.Host,
									Port:      record.Source.Port,
									UserAgent: record.Source.UserAgent,
									Metadata:  record.RequestParameters,
								}
							}
						} else if record.EventName == notification.ObjectAccessedGet {
							eventChan <- model.EventInfo{
								Time:      record.EventTime,
								Size:      record.S3.Object.Size,
								Etag:      record.S3.Object.ETag,
								Path:      objectPath,
								Source:    c,
								Type:      model.EventAccessedRead,
								Host:      record.Source.Host,
								Port:      record.Source.Port,
								UserAgent: record.Source.UserAgent,
								Metadata:  record.RequestParameters,
							}
						} else if record.EventName == notification.ObjectAccessedHead {
							eventChan <- model.EventInfo{
								Time:      record.EventTime,
								Size:      record.S3.Object.Size,
								Etag:      record.S3.Object.ETag,
								Path:      objectPath,
								Source:    c,
								Type:      model.EventAccessedStat,
								Host:      record.Source.Host,
								Port:      record.Source.Port,
								UserAgent: record.Source.UserAgent,
								Metadata:  record.RequestParameters,
							}
						}
					}
				}
			}
		}()

		return wo, nil

	*/

}

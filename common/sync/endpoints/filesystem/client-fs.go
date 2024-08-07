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

// Package file system provides endpoints for reading/writing from/to a local folder
package filesystem

import (
	"bytes"
	"context"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"path"
	"path/filepath"
	"reflect"
	"runtime"
	"strings"
	"sync"

	"github.com/karrick/godirwalk"
	"github.com/rjeczalik/notify"
	"github.com/spf13/afero"
	"go.uber.org/zap"
	"golang.org/x/text/unicode/norm"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/sync/merger"
	"github.com/pydio/cells/v4/common/sync/model"
	"github.com/pydio/cells/v4/common/sync/proc"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/filesystem"
	"github.com/pydio/cells/v4/common/utils/hasher"
	"github.com/pydio/cells/v4/common/utils/hasher/simd"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

const (
	SyncTmpPrefix = ".tmp.write."
)

type Discarder struct {
	bytes.Buffer
}

func (d *Discarder) Close() error {
	return nil
}

type WrapperWriter struct {
	io.WriteCloser
	tmpPath      string
	targetPath   string
	client       *FSClient
	snapshotPath string
	cancellable  context.Context
}

func (w *WrapperWriter) Close() error {
	select {
	case <-w.cancellable.Done():
		w.client.FS.Remove(w.tmpPath)
		return w.cancellable.Err()
	default:
		err := w.WriteCloser.Close()
		if err != nil {
			w.client.FS.Remove(w.tmpPath)
			return err
		} else {
			e := w.client.FS.Rename(w.tmpPath, w.targetPath)
			if e == nil && w.client.updateSnapshot != nil {
				ctx := context.Background()
				n, _ := w.client.LoadNode(ctx, w.snapshotPath)
				log.Logger(ctx).Debug("[FS] Update Snapshot", n.ZapPath())
				w.client.updateSnapshot.CreateNode(ctx, n, true)
			}
			return e
		}
	}
}

func (c *FSClient) normalize(path string) string {
	path = strings.TrimLeft(path, string(os.PathSeparator))
	if runtime.GOOS == "darwin" {
		return string(norm.NFC.Bytes([]byte(path)))
	} else if runtime.GOOS == "windows" {
		return strings.Replace(path, string(os.PathSeparator), model.InternalPathSeparator, -1)
	}
	return path
}

func (c *FSClient) denormalize(path string) string {
	// Make sure it starts with a /
	if runtime.GOOS != "windows" {
		path = fmt.Sprintf("/%v", strings.TrimLeft(path, model.InternalPathSeparator))
	}
	if runtime.GOOS == "darwin" {
		return string(norm.NFD.Bytes([]byte(path)))
	} else if runtime.GOOS == "windows" {
		return strings.Replace(path, model.InternalPathSeparator, string(os.PathSeparator), -1)
	}
	return path
}

// FSClient implementation of an endpoint
// Implements all Sync interfaces (PathSyncTarget, PathSyncSource, DataSyncTarget and DataSyncSource)
// Takes a root folder as main parameter
// Underlying calls to FS are done through Afero.FS virtualization, allowing for mockups and automated testings.
type FSClient struct {
	RootPath       string
	FS             afero.Fs
	updateSnapshot model.PathSyncTarget
	refHashStore   model.PathSyncSource
	options        model.EndpointOptions
	uriPath        string
}

// StartSession forwards session management to underlying snapshot
func (c *FSClient) StartSession(ctx context.Context, rootNode tree.N, silent bool) (string, error) {
	if c.updateSnapshot != nil {
		if sessionProvider, ok := c.updateSnapshot.(model.SessionProvider); ok {
			return sessionProvider.StartSession(ctx, rootNode, silent)
		}
	}
	return uuid.New(), nil
}

// FlushSession forwards session management to underlying snapshot
func (c *FSClient) FlushSession(ctx context.Context, sessionUuid string) error {
	if c.updateSnapshot != nil {
		if sessionProvider, ok := c.updateSnapshot.(model.SessionProvider); ok {
			return sessionProvider.FlushSession(ctx, sessionUuid)
		}
	}
	return nil
}

// FinishSession forwards session management to underlying snapshot
func (c *FSClient) FinishSession(ctx context.Context, sessionUuid string) error {
	if c.updateSnapshot != nil {
		if sessionProvider, ok := c.updateSnapshot.(model.SessionProvider); ok {
			return sessionProvider.FinishSession(ctx, sessionUuid)
		}
	}
	return nil
}

// NewFSClient initiate a FileSystem client and stats the provided root.
// It returns an error if the folder is not reachable
func NewFSClient(rootPath string, options model.EndpointOptions) (*FSClient, error) {
	c := &FSClient{
		options: options,
		uriPath: rootPath,
	}
	rootPath = c.denormalize(rootPath)
	rootPath = strings.TrimRight(rootPath, model.InternalPathSeparator)
	var e error
	if c.RootPath, e = filesystem.CanonicalPath(rootPath); e != nil {
		return nil, e
	}
	if options.BrowseOnly && c.RootPath == "" {
		c.RootPath = "/"
	}
	c.FS = afero.NewBasePathFs(afero.NewOsFs(), c.RootPath)
	if _, e = c.FS.Stat("/"); e != nil {
		return nil, errors.WithMessage(errors.NodeNotFound, "Cannot stat root folder "+c.RootPath+"!")
	}
	return c, nil
}

// SetUpdateSnapshot attaches a snapshot to this client, that will be updated at the same
// time that the client processes operations on the filesystem
func (c *FSClient) SetUpdateSnapshot(target model.PathSyncTarget) {
	c.updateSnapshot = target
}

// PatchUpdateSnapshot applies a patch of Operations on the underlying snapshot, if there is one.
func (c *FSClient) PatchUpdateSnapshot(ctx context.Context, patch interface{}) {
	// Reapply event-based patch to snapshot
	if c.updateSnapshot == nil {
		return
	}
	p, ok := patch.(merger.Patch)
	if !ok {
		return
	}
	newPatch := merger.ClonePatch(c, c.updateSnapshot, p)
	newPatch.SetSessionData(ctx, true)

	pr := proc.NewProcessor(ctx)
	pr.Silent = true
	pr.SkipTargetChecks = true
	pr.Process(newPatch, nil)

	// For Create Folders, updateSnapshot with associated .pydio's
	// Use a session to batch inserts if possible
	indexationSessionId, _ := newPatch.StartSession(&tree.Node{})
	newPatch.WalkOperations([]merger.OperationType{merger.OpCreateFolder}, func(operation merger.Operation) {
		folderUuid := operation.GetNode().GetUuid()
		c.updateSnapshot.CreateNode(ctx, &tree.Node{
			Uuid:  uuid.New(),
			Path:  path.Join(operation.GetNode().GetPath(), common.PydioSyncHiddenFile),
			Etag:  model.StringContentToETag(folderUuid),
			Size:  int64(len(folderUuid)),
			MTime: operation.GetNode().GetMTime(),
		}, true)
	})
	newPatch.FinishSession(indexationSessionId)
}

func (c *FSClient) SetRefHashStore(source model.PathSyncSource) {
	c.refHashStore = source
}

func (c *FSClient) GetEndpointInfo() model.EndpointInfo {

	return model.EndpointInfo{
		URI:                   "fs://" + c.uriPath,
		RequiresFoldersRescan: true,
		RequiresNormalization: runtime.GOOS == "darwin",
		//		Ignores:               []string{common.PydioSyncHiddenFile},
	}

}

// LoadNode is the Read in CRUD.
// leaf bools are used to avoid doing an FS.stat if we already know a node to be
// a leaf.  NOTE : is it useful?  Examine later.
func (c *FSClient) LoadNode(ctx context.Context, path string, extendedStats ...bool) (node tree.N, err error) {
	n, e := c.loadNode(ctx, path, nil)
	if len(extendedStats) > 0 && extendedStats[0] && e == nil {
		if er := c.loadNodeExtendedStats(ctx, n); er != nil {
			log.Logger(ctx).Error("Cannot load node extended stats", zap.Error(er))
		}
	}
	return n, e
}

func (c *FSClient) Walk(ctx context.Context, walkFunc model.WalkNodesFunc, root string, recursive bool) (err error) {
	wrappingFunc := func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return walkFunc("", nil, err)
		}
		if len(path) == 0 || path == "/" || c.normalize(path) == strings.TrimLeft(root, "/") || strings.HasPrefix(filepath.Base(path), SyncTmpPrefix) {
			return nil
		}

		path = c.normalize(path)
		if node, e := c.loadNode(ctx, path, info); e != nil {
			return walkFunc("", nil, e)
		} else {
			return walkFunc(path, node, nil)
		}

	}
	if recursive {
		return afero.Walk(c.FS, root, wrappingFunc)
	}

	ii, er := afero.ReadDir(c.FS, root)
	if er != nil {
		return er
	}
	for _, i := range ii {
		if er := wrappingFunc(path.Join(root, i.Name()), i, nil); er != nil {
			return er
		}
	}
	return nil

}

// Watch watches all fs events on an input path.
func (c *FSClient) Watch(recursivePath string) (*model.WatchObject, error) {

	eventChan := make(chan model.EventInfo)
	errorChan := make(chan error)
	doneChan := make(chan bool)
	// Make the channel buffered to ensure no event is dropped. Notify will drop
	// an event if the receiver is not able to keep up the sending pace.
	in, out := PipeChan(1000)

	var fsEvents []notify.Event
	fsEvents = append(fsEvents, EventTypeAll...)

	recursivePath = c.denormalize(recursivePath)
	// Check if FS is in-memory
	_, ok := (c.FS).(*afero.MemMapFs)
	if ok {
		return &model.WatchObject{
			EventInfoChan: eventChan,
			ErrorChan:     errorChan,
			DoneChan:      doneChan,
		}, nil
	}

	if e := notify.Watch(filepath.Join(c.RootPath, recursivePath)+"...", in, fsEvents...); e != nil {
		return nil, e
	}

	// wait for doneChan to close the watcher, eventChan and errorChan
	go func() {
		<-doneChan

		notify.Stop(in)
		close(eventChan)
		close(errorChan)
		close(in)
	}()

	// Get fsnotify notifications for events and errors, and sent them
	// using eventChan and errorChan
	go func() {
		writes := make(map[string]*FSEventDebouncer)
		writesMux := &sync.Mutex{}
		for event := range out {
			if strings.HasPrefix(filepath.Base(event.Path()), SyncTmpPrefix) {
				continue
			}
			eventInfo, eventError := notifyEventToEventInfo(c, event)
			if eventError != nil {
				errorChan <- eventError
			} else if eventInfo.Path != "" {

				if !eventInfo.Folder {

					var d *FSEventDebouncer
					writesMux.Lock()
					d, o := writes[event.Path()]
					if !o {
						p := event.Path()
						d = NewFSEventDebouncer(eventChan, errorChan, c, func() {
							writesMux.Lock()
							delete(writes, p)
							writesMux.Unlock()
						})
						writes[event.Path()] = d
					}
					writesMux.Unlock()
					d.Input <- eventInfo

				} else {

					eventChan <- eventInfo

				}

			}

		}
	}()

	return &model.WatchObject{
		EventInfoChan: eventChan,
		ErrorChan:     errorChan,
		DoneChan:      doneChan,
	}, nil
}

func (c *FSClient) CreateNode(ctx context.Context, node tree.N, updateIfExists bool) (err error) {
	if node.IsLeaf() {
		return errors.WithMessage(errors.StatusBadRequest, "this is a DataSyncTarget, use PutNode for leafs instead of CreateNode")
	}
	fPath := c.denormalize(node.GetPath())
	_, e := c.FS.Stat(fPath)
	if os.IsNotExist(e) {
		err = c.FS.MkdirAll(fPath, 0777)
		if node.GetUuid() != "" && !c.options.BrowseOnly && err == nil {
			err = afero.WriteFile(c.FS, filepath.Join(fPath, common.PydioSyncHiddenFile), []byte(node.GetUuid()), 0777)
			if err == nil {
				_ = c.SetHidden(filepath.Join(fPath, common.PydioSyncHiddenFile), true)
			}
		}
		if c.updateSnapshot != nil && err == nil {
			log.Logger(ctx).Debug("[FS] Update Snapshot - Create", node.ZapPath())
			if err := c.updateSnapshot.CreateNode(ctx, node, updateIfExists); err == nil {
				// Create associated .pydio in snapshot as well
				c.updateSnapshot.CreateNode(ctx, &tree.Node{
					Uuid:  uuid.New(),
					Path:  path.Join(node.GetPath(), common.PydioSyncHiddenFile),
					Etag:  model.StringContentToETag(node.GetUuid()),
					Size:  int64(len(node.GetUuid())),
					MTime: node.GetMTime(),
				}, true)
			}
		}
	}
	return err
}

func (c *FSClient) DeleteNode(ctx context.Context, path string) (err error) {
	_, e := c.FS.Stat(c.denormalize(path))
	if !os.IsNotExist(e) {
		err = c.FS.RemoveAll(c.denormalize(path))
	}
	if err == nil && c.updateSnapshot != nil {
		log.Logger(ctx).Debug("[FS] Update Snapshot - Delete " + path)
		c.updateSnapshot.DeleteNode(ctx, path)
	}
	return err
}

// MoveNode move file or folder around.
func (c *FSClient) MoveNode(ctx context.Context, oldPath string, newPath string) (err error) {

	oldInitial := oldPath
	newInitial := newPath

	oldPath = c.denormalize(oldPath)
	newPath = c.denormalize(newPath)

	stat, e := c.FS.Stat(oldPath)
	if !os.IsNotExist(e) {
		typeOfMem := reflect.TypeOf(afero.NewMemMapFs())
		typeOfBasePathFs := reflect.TypeOf(&afero.BasePathFs{})
		typeOfFs := reflect.TypeOf(c.FS)
		if stat.IsDir() && (typeOfFs == typeOfMem || typeOfFs == typeOfBasePathFs) {
			c.moveRecursively(ctx, oldPath, newPath)
		} else {
			err = c.FS.Rename(oldPath, newPath)
		}
	}
	if err == nil && c.updateSnapshot != nil {
		log.Logger(ctx).Debug("[FS] Update Snapshot - Move from " + oldPath + " to " + newPath)
		c.updateSnapshot.MoveNode(ctx, oldInitial, newInitial)
	}
	return err

}

func (c *FSClient) ExistingFolders(ctx context.Context) (map[string][]tree.N, error) {
	data := make(map[string][]tree.N)
	final := make(map[string][]tree.N)
	err := c.Walk(nil, func(path string, node tree.N, err error) error {
		if err != nil || node == nil {
			return err
		}
		if node.IsLeaf() {
			return nil
		}
		nUuid := node.GetUuid()
		if s, ok := data[nUuid]; ok {
			s = append(s, node)
			final[nUuid] = s
		} else {
			data[nUuid] = make([]tree.N, 1)
			data[nUuid] = append(data[nUuid], node)
		}
		return nil
	}, "/", true)
	return final, err
}

func (c *FSClient) UpdateFolderUuid(ctx context.Context, node tree.N) (tree.N, error) {
	p := c.denormalize(node.GetPath())
	var err error
	pFile := filepath.Join(p, common.PydioSyncHiddenFile)
	if err = c.FS.Remove(pFile); err == nil {
		log.Logger(ctx).Info("Refreshing folder Uuid for", node.ZapPath())
		err = afero.WriteFile(c.FS, pFile, []byte(node.GetUuid()), 0666)
		if err == nil {
			c.SetHidden(pFile, true)
		}
	}
	return node, err
}

func (c *FSClient) GetWriterOn(cancel context.Context, path string, targetSize int64) (out io.WriteCloser, writeDone chan bool, writeErr chan error, err error) {

	// Ignore .pydio except for root folder .pydio
	if filepath.Base(path) == common.PydioSyncHiddenFile && strings.Trim(path, "/") != common.PydioSyncHiddenFile {
		w := &Discarder{}
		return w, writeDone, writeErr, nil
	}
	snapshotPath := path
	path = c.denormalize(path)
	tmpPath := filepath.Join(filepath.Dir(path), SyncTmpPrefix+filepath.Base(path))
	file, openErr := c.FS.OpenFile(tmpPath, os.O_CREATE|os.O_WRONLY, 0666)
	if openErr != nil {
		return nil, writeDone, writeErr, openErr
	}
	wrapper := &WrapperWriter{
		WriteCloser:  file,
		cancellable:  cancel,
		client:       c,
		tmpPath:      tmpPath,
		targetPath:   path,
		snapshotPath: snapshotPath,
	}
	return wrapper, writeDone, writeErr, nil

}

func (c *FSClient) GetReaderOn(_ context.Context, path string) (out io.ReadCloser, err error) {

	return c.FS.Open(c.denormalize(path))

}

// Internal function expects already denormalized form
func (c *FSClient) moveRecursively(ctx context.Context, oldPath string, newPath string) (err error) {

	// Some fs require moving resources recursively
	moves := make(map[int]string)
	indexes := make([]int, 0)
	i := 0
	afero.Walk(c.FS, oldPath, func(wPath string, info os.FileInfo, err error) error {
		//newWPath := newPath + strings.TrimPrefix(wPath, oldPath)
		indexes = append(indexes, i)
		moves[i] = wPath
		i++
		return nil
	})
	total := len(indexes)
	for key := range indexes {
		//c.FS.Rename(moveK, moveV)
		key = total - key
		wPath := moves[key]
		if len(wPath) == 0 {
			continue
		}
		msg := fmt.Sprintf("Moving %v to %v", wPath, newPath+strings.TrimPrefix(wPath, oldPath))
		log.Logger(ctx).Debug(msg)
		c.FS.Rename(wPath, newPath+strings.TrimPrefix(wPath, oldPath))
	}
	return c.FS.Rename(oldPath, newPath)

}

// Expects already denormalized form
func (c *FSClient) readOrCreateFolderId(ctx context.Context, path string) (uid string, e error) {

	if c.options.BrowseOnly {
		return uuid.New(), nil
	}
	hiddenFilePath := filepath.Join(path, common.PydioSyncHiddenFile)

	_, uidErr := c.FS.Stat(hiddenFilePath)
	if uidErr != nil && os.IsNotExist(uidErr) {
		uid = uuid.New()
		we := afero.WriteFile(c.FS, hiddenFilePath, []byte(uid), 0666)
		if we != nil {
			return "", we
		}
		if err := c.SetHidden(hiddenFilePath, true); err != nil {
			log.Logger(ctx).Error("Cannot set file as hidden", zap.Error(err))
		}
	} else {
		content, re := afero.ReadFile(c.FS, hiddenFilePath)
		if re != nil {
			return "", re
		}
		uid = fmt.Sprintf("%s", content)
	}
	return uid, nil

}

// Expects already denormalized form
func (c *FSClient) getFileHash(path string) (hash string, e error) {

	f, err := c.FS.Open(path)
	if err != nil {
		return "", err
	}
	defer f.Close()
	h := hasher.NewBlockHash(simd.MD5(), hasher.DefaultBlockSize)
	if _, e = io.Copy(h, f); e != nil {
		return
	}
	hx := hex.EncodeToString(h.Sum(nil))
	return hx, nil
}

// loadNode takes an optional os.FileInfo if we are already walking folders (no need for a second stat call)
func (c *FSClient) loadNode(ctx context.Context, path string, stat os.FileInfo) (node tree.N, err error) {

	dnPath := c.denormalize(path)
	if stat == nil {
		if stat, err = c.FS.Stat(dnPath); err != nil {
			if os.IsNotExist(err) {
				return nil, errors.WithStack(errors.NodeNotFound)
			}
			return nil, err
		}
	}

	var nType tree.NodeType
	var nETag, nUuid string

	if stat.IsDir() {
		id, err := c.readOrCreateFolderId(ctx, dnPath)
		if err != nil {
			return nil, err
		}
		nUuid = id
		nType = tree.NodeType_COLLECTION
	} else {
		var hash string
		if c.refHashStore != nil {
			refNode, e := c.refHashStore.LoadNode(ctx, path)
			if e == nil && refNode.GetSize() == stat.Size() && refNode.GetMTime() == stat.ModTime().Unix() && refNode.GetEtag() != "" {
				hash = refNode.GetEtag()
			}
		}
		if len(hash) == 0 {
			if hash, err = c.getFileHash(dnPath); err != nil {
				return nil, err
			}
		}
		nType = tree.NodeType_LEAF
		nETag = hash

	}
	n := tree.LightNode(nType, nUuid, path, nETag, stat.Size(), stat.ModTime().Unix(), int32(stat.Mode()))
	return n, nil
}

func (c *FSClient) loadNodeExtendedStats(ctx context.Context, node tree.N) error {
	if node.IsLeaf() {
		return nil
	}
	var folders, files, totalSize int64
	realPath := filepath.Join(c.RootPath, c.normalize(node.GetPath()))
	im := model.IgnoreMatcher()
	e := godirwalk.Walk(realPath, &godirwalk.Options{
		Unsorted: true,
		Callback: func(osPathname string, directoryEntry *godirwalk.Dirent) error {
			// Check if file is ignored (must use forward slash)
			if im(strings.Join(strings.Split(osPathname, string(filepath.Separator)), "/")) {
				return nil
			}
			if !directoryEntry.IsRegular() {
				if osPathname != realPath {
					folders++
				}
			} else {
				if i, e := os.Stat(osPathname); e == nil {
					totalSize += i.Size()
				}
				if directoryEntry.Name() != common.PydioSyncHiddenFile {
					files++
				}
			}
			return nil
		},
	})
	if e != nil {
		return e
	}
	if totalSize > 0 {
		node.SetSize(totalSize)
		node.SetChildrenSize(uint64(totalSize)) // MustSetMeta(model.MetaRecursiveChildrenSize, totalSize)
	}
	node.SetChildrenFiles(uint64(files))
	node.SetChildrenFolders(uint64(folders))
	return nil
}

func (c *FSClient) SetHidden(relativePath string, hidden bool) error {
	osPath := filepath.Join(c.RootPath, relativePath)
	return filesystem.SetHidden(osPath, hidden)
}

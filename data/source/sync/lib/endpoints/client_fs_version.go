// +build ignore

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
	"crypto/md5"
	"encoding/gob"
	"errors"
	"fmt"
	"io"
	"log"
	"math"
	"os"
	"path"
	"path/filepath"
	"reflect"
	"strconv"
	"strings"

	"github.com/monmohan/xferspdy"
	"github.com/rjeczalik/notify"
	uuid "github.com/satori/go.uuid"
	"github.com/spf13/afero"

	servicescommon "github.com/pydio/cells/common"
	"github.com/pydio/cells/data/source/sync/lib/common"
)

// FileSystem implementation of an endpoint
// Implements all Sync interfaces (PathSyncTarget, PathSyncSource, DataSyncTarget and DataSyncSource)
// Takes a root folder as main parameter
// Underlying calls to FS are done through Afero.FS virtualization, allowing for mockups and automated testings.
type FSClientVersion struct {
	RootPath string
	FS       afero.Fs
}

func (c *FSClientVersion) getLocalPath(eventPath string) string {
	return strings.TrimPrefix(eventPath, c.RootPath)
}

func (c *FSClientVersion) Walk(walknFc common.WalkNodesFunc, pathes ...string) (err error) {
	wrappingFunc := func(path string, info os.FileInfo, err error) error {
		if err != nil || len(path) == 0 || path == "/" {
			return nil
		}
		if strings.Contains(path, ".pydio.versions") || strings.Contains(path, ".pydio.writes") {
			return nil
		}
		node, lErr := c.LoadNode(path, !info.IsDir())
		//log.Printf("Walking node %v => %v, %v" , path, node, lErr )
		if lErr != nil {
			return lErr
		}
		node.FileInfo = info
		walknFc(path, node)
		return nil
	}
	// Todo : check pathes exists and return error if not ?
	if len(pathes) > 0 {
		for _, path := range pathes {
			// Go be send in concurrency?
			err = afero.Walk(c.FS, path, wrappingFunc)
			if err != nil {
				return err
			}
		}
		return nil
	} else {
		return afero.Walk(c.FS, "/", wrappingFunc)
	}
}

func (c *FSClientVersion) LoadNode(path string, leaf ...bool) (node *common.Node, err error) {
	var isLeaf bool = false
	var stat os.FileInfo
	var eStat error
	if len(leaf) > 0 {
		isLeaf = leaf[0]
	} else {
		stat, eStat = c.FS.Stat(path)
		if eStat != nil {
			log.Println(eStat)
			return nil, eStat
		} else {
			isLeaf = !stat.IsDir()
		}
	}
	var hash, uid string = "", ""
	hash, err = c.getNodeIdentifier(path, isLeaf)
	if err != nil {
		return nil, err
	}
	if !isLeaf {
		uid = hash
		hash = ""
	}
	node = &common.Node{
		Path: path,
		Leaf: isLeaf,
		Uuid: uid,
		Hash: hash,
	}
	if stat != nil {
		node.FileInfo = stat
	}
	return node, nil
}

func (c *FSClientVersion) CreateNode(path string, leaf bool, uuid string, hash string) (err error) {
	if leaf {
		return errors.New("This is a DataSyncTarget, use PutNode for leafs instead of CreateNode")
	}
	_, e := c.FS.Stat(path)
	if os.IsNotExist(e) {
		err = c.FS.MkdirAll(path, 0777)
		if uuid != "" {
			afero.WriteFile(c.FS, filepath.Join(path, servicescommon.PYDIO_SYNC_HIDDEN_FILE_META), []byte(uuid), 0777)
		}
	}
	return err
}

func (c *FSClientVersion) UpdateNode(node *common.Node, updateIfExists bool) (err error) {
	return c.CreateNode(node.Path, node.Leaf, node.Uuid, node.Hash)
}

func (c *FSClientVersion) DeleteNode(deletePath string) (err error) {
	_, e := c.FS.Stat(deletePath)
	if !os.IsNotExist(e) {
		vFolder := path.Join(path.Dir(deletePath), ".pydio.versions")
		vFExists, _ := afero.Exists(c.FS, vFolder)
		if !vFExists {
			c.FS.Mkdir(vFolder, 0777)
		}
		c.FS.Rename(deletePath, path.Join(vFolder, "deleted."+path.Base(deletePath)))
		//err = c.FS.RemoveAll(deletePath)
	}
	return err
}

func (c *FSClientVersion) MoveNode(oldPath string, newPath string) (err error) {

	stat, e := c.FS.Stat(oldPath)
	if !os.IsNotExist(e) {
		if stat.IsDir() && reflect.TypeOf(c.FS) == reflect.TypeOf(afero.NewMemMapFs()) {
			log.Println("Move Recursively?")
			c.moveRecursively(oldPath, newPath)
		} else {
			err = c.FS.Rename(oldPath, newPath)
		}
		if !stat.IsDir() {
			go func() {
				// Rename versions files in concurrency
				oldBase := path.Base(oldPath)
				newBase := path.Base(newPath)
				versions, _ := c.ListVersions(&common.Node{Path: oldPath})
				for _, vPath := range versions {
					newVPath := strings.Replace(vPath, oldBase, newBase, 1)
					c.FS.Rename(vPath, newVPath)
				}
			}()
		}
	}
	return err

}

func (c *FSClientVersion) moveRecursively(oldPath string, newPath string) (err error) {

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
		log.Printf("Moving %v to %v", wPath, newPath+strings.TrimPrefix(wPath, oldPath))
		c.FS.Rename(wPath, newPath+strings.TrimPrefix(wPath, oldPath))
	}
	c.FS.Rename(oldPath, newPath)
	//rename(oldPath,)
	return nil

}

func (c *FSClientVersion) GetWriterOn(nodePath string, targetSize int64) (out io.WriteCloser, err error) {

	_, e := c.FS.Stat(nodePath)
	var file afero.File
	var openErr, writesFolderError error
	writesFolder := path.Join(path.Dir(nodePath), ".pydio.writes")
	if t, _ := afero.Exists(c.FS, writesFolder); t == false {
		writesFolderError = c.FS.Mkdir(writesFolder, 0777)
	}
	if writesFolderError == nil {
		nodePath = path.Join(writesFolder, path.Base(nodePath))
	}
	if os.IsNotExist(e) || writesFolderError == nil {
		file, openErr = c.FS.Create(nodePath)
	} else {
		file, openErr = c.FS.Open(nodePath)
	}
	return file, openErr

}

func (c *FSClientVersion) GetReaderOn(path string) (out io.ReadCloser, err error) {

	return c.FS.Open(path)

}

func (c *FSClientVersion) Commit(node *common.Node) {
	nodePath := node.Path
	log.Println("Entering commit for " + nodePath)
	writesFolder := path.Join(path.Dir(nodePath), ".pydio.writes")
	if t, _ := afero.Exists(c.FS, writesFolder); t == false {
		return
	}
	writePath := path.Join(writesFolder, path.Base(nodePath))
	version := c.CreateVersion(node, writePath)
	log.Printf("Creating new version in background %v", version)
	c.FS.Rename(writePath, node.Path)

	// TEMPORARY :
	// Verify patch is working correctly : current version + patch.versionNumber = file.versionNumber
	/*
		versionsFolder := path.Join(path.Dir(nodePath), ".pydio.versions")
		patchFile := path.Join(versionsFolder, fmt.Sprintf("patch." + path.Base(node.Path) + ".%v", version))
		targetFile := path.Join(versionsFolder, fmt.Sprintf("rebuilt." + path.Base(node.Path) + ".%v", version))
		log.Printf("Rebuilding target file %s from last version %s", targetFile, node.Path)
		pf, err := c.FS.Open(patchFile)
		if err != nil {
			log.Printf("Error in reading patch file %v \n, Error :%s", patchFile, err)
		}else{
			defer pf.Close()
			var pd []xferspdy.Block
			dec := gob.NewDecoder(pf)
			err = dec.Decode(&pd)

			target, _ := c.FS.OpenFile(targetFile, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0777)
			defer target.Close()
			xferspdy.PatchFile(pd, path.Join(c.RootPath, node.Path), target)
		}
	*/
}

func (c *FSClientVersion) CreateVersion(node *common.Node, newVersionPath string) (version int) {

	log.Println("Now create a version!")
	if t, _ := afero.Exists(c.FS, node.Path); t == false {
		log.Println("Cannot find node " + node.Path)
		return
	}
	dirName := path.Dir(node.Path)
	baseName := path.Base(node.Path)
	versionFolder := path.Join(dirName, ".pydio.versions")

	_, version = c.ListVersions(node)
	version++
	var mkErr error
	if t, _ := afero.Exists(c.FS, versionFolder); t == false {
		mkErr = c.FS.Mkdir(versionFolder, 0777)
	}
	if mkErr == nil {
		versionPath := path.Join(versionFolder, fmt.Sprintf(baseName+".%v", version))
		patchPath := path.Join(versionFolder, fmt.Sprintf("patch."+baseName+".%v", version))
		fgprt := xferspdy.NewFingerprint(path.Join(c.RootPath, newVersionPath), uint32(2*1024))
		c.FS.Rename(node.Path, versionPath)
		go func() {
			diff := xferspdy.NewDiff(path.Join(c.RootPath, versionPath), *fgprt)
			patchFile, pErr := c.FS.OpenFile(patchPath, os.O_WRONLY|os.O_TRUNC|os.O_CREATE, 0777)
			if pErr == nil {
				defer patchFile.Close()
				enc := gob.NewEncoder(patchFile)
				enc.Encode(diff)
			}
			c.FS.Remove(versionPath)
		}()
	} else {
		log.Println("Could not create folder for versions " + versionFolder)
	}
	return version
}

func (c *FSClientVersion) ListVersions(node *common.Node) (versions map[int]string, last int) {

	versions = make(map[int]string)

	dirName := path.Dir(node.Path)
	baseName := path.Base(node.Path)
	versionFolder := path.Join(dirName, ".pydio.versions")
	last = 0
	if t, _ := afero.Exists(c.FS, versionFolder); t == false {
		return versions, 0
	} else {
		afero.Walk(c.FS, versionFolder, func(wPath string, info os.FileInfo, err error) error {
			walkBase := path.Base(wPath)
			if strings.HasPrefix(walkBase, "patch."+baseName+".") {
				crt, e := strconv.Atoi(strings.Replace(walkBase, "patch."+baseName+".", "", 1))
				if e == nil {
					last = int(math.Max(float64(last), float64(crt)))
					versions[crt] = c.getLocalPath(wPath)
				}
			}
			return nil
		})
	}
	log.Print(versions)
	return versions, last

}

func (c *FSClientVersion) getNodeIdentifier(path string, leaf bool) (uid string, e error) {
	if leaf {
		return c.getFileHash(path)
	} else {
		return c.readOrCreateFolderId(path)
	}
}

func (c *FSClientVersion) readOrCreateFolderId(path string) (uid string, e error) {

	uidFile, uidErr := c.FS.OpenFile(filepath.Join(path, servicescommon.PYDIO_SYNC_HIDDEN_FILE_META), os.O_RDONLY, 0777)
	if uidErr != nil && os.IsNotExist(uidErr) {
		uid = fmt.Sprintf("%s", uuid.NewV4())
		we := afero.WriteFile(c.FS, filepath.Join(path, servicescommon.PYDIO_SYNC_HIDDEN_FILE_META), []byte(uid), 0777)
		if we != nil {
			return "", we
		}
	} else {
		uidFile.Close()
		content, re := afero.ReadFile(c.FS, filepath.Join(path, servicescommon.PYDIO_SYNC_HIDDEN_FILE_META))
		if re != nil {
			return "", re
		}
		uid = fmt.Sprintf("%s", content)
	}
	return uid, nil

}

func (c *FSClientVersion) getFileHash(path string) (hash string, e error) {

	f, err := c.FS.Open(path)
	if err != nil {
		return "", err
	}
	defer f.Close()

	h := md5.New()
	if _, err := io.Copy(h, f); err != nil {
		return "", err
	}

	return fmt.Sprintf("%x", h.Sum(nil)), nil

}

func (c *FSClientVersion) isIgnoredFile(eventPath string) bool {
	return common.IsIgnoredFile(eventPath) || strings.Contains(eventPath, ".pydio.versions") || strings.Contains(eventPath, ".pydio.writes")
}

// Watches for all fs events on an input path.
func (c *FSClientVersion) Watch(recursivePath string) (*common.WatchObject, error) {

	eventChan := make(chan common.EventInfo)
	errorChan := make(chan error)
	doneChan := make(chan bool)
	// Make the channel buffered to ensure no event is dropped. Notify will drop
	// an event if the receiver is not able to keep up the sending pace.
	in, out := PipeChan(1000)

	var fsEvents []notify.Event
	fsEvents = append(fsEvents, EventTypeAll...)

	if e := notify.Watch(filepath.Join(c.RootPath, recursivePath)+"...", in, fsEvents...); e != nil {
		return nil, e
	}

	// wait for doneChan to close the watcher, eventChan and errorChan
	go func() {
		<-doneChan

		notify.Stop(in)
		log.Println("Closing event channel for " + c.RootPath)
		close(eventChan)
		close(errorChan)
	}()

	// Get fsnotify notifications for events and errors, and sent them
	// using eventChan and errorChan
	go func() {
		for event := range out {

			if c.isIgnoredFile(event.Path()) {
				continue
			}

			eventInfo, eventError := notifyEventToEventInfo(c, event)
			if eventError != nil {
				log.Println("Sending  event error for " + c.RootPath)
				errorChan <- eventError
			} else if eventInfo != (common.EventInfo{}) {
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

func NewFSClientVersion(rootPath string) *FSClientVersion {
	return &FSClientVersion{
		RootPath: strings.TrimRight(rootPath, "/"),
		FS:       afero.NewBasePathFs(afero.NewOsFs(), CanonicalPath(rootPath)),
	}
}

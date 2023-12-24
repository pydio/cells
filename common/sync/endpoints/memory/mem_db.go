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

// Package memory provides an in-memory basic implementation of an Endpoint, with nodes stored in a map.
package memory

import (
	"context"
	"errors"
	"fmt"
	"os"
	"sort"
	"strings"
	"sync"
	"time"

	"golang.org/x/text/unicode/norm"

	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/sync/model"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

type DBEvent struct {
	Type   string
	Source string
	Target string
}

type MemDB struct {
	eventChannels []chan DBEvent
	// Used for testing
	ignores     []string
	testPathURI string

	indexLock *sync.RWMutex
	pathIndex map[string]tree.N
}

func NewMemDB() *MemDB {
	db := &MemDB{
		indexLock: &sync.RWMutex{},
		pathIndex: make(map[string]tree.N),
	}
	_ = db.CreateNode(context.Background(), &tree.Node{
		Path: "/",
		Type: tree.NodeType_COLLECTION,
		Uuid: "root",
	}, true)
	return db
}

func (db *MemDB) GetEndpointInfo() model.EndpointInfo {

	return model.EndpointInfo{
		URI:                   "memdb://" + db.testPathURI,
		RequiresFoldersRescan: true,
		RequiresNormalization: false,
		Ignores:               db.ignores,
	}

}

// AddIgnore register a filename to be ignored (for tests only)
func (db *MemDB) AddIgnore(s string) {
	db.ignores = append(db.ignores, s)
}

func (db *MemDB) SetTestPathURI(s string) {
	db.testPathURI = s
}

/*************************/
/* Event Emitter 	 */
/*************************/

func (db *MemDB) RegisterEventChannel(out chan DBEvent) {
	db.eventChannels = append(db.eventChannels, out)
}

func (db *MemDB) sendEvent(event DBEvent) {
	for _, channel := range db.eventChannels {
		channel <- event
	}
}

/*************************/
/* Path Sync Target 	 */
/*************************/

func normalize(s string) string {
	return strings.TrimLeft(norm.NFC.String(s), "/")
}

func (db *MemDB) LoadNode(ctx context.Context, path string, extendedStats ...bool) (node tree.N, err error) {

	db.indexLock.RLock()
	defer db.indexLock.RUnlock()
	if n, ok := db.pathIndex[normalize(path)]; ok {
		return n, nil
	} else {
		return nil, errors.New("not found")
	}

}

func (db *MemDB) CreateNode(ctx context.Context, node tree.N, updateIfExists bool) (err error) {
	db.indexLock.Lock()
	defer db.indexLock.Unlock()
	db.pathIndex[normalize(node.GetPath())] = node
	db.sendEvent(DBEvent{
		Type:   "Create",
		Target: node.GetPath(),
	})
	return nil
}

func (db *MemDB) DeleteNode(ctx context.Context, path string) (err error) {
	db.indexLock.Lock()
	defer db.indexLock.Unlock()
	nfc := normalize(path)
	var dd []string
	for p := range db.pathIndex {
		if p == nfc || strings.HasPrefix(p, nfc+"/") {
			dd = append(dd, p)
		}
	}
	for _, rd := range dd {
		n := db.pathIndex[rd]
		delete(db.pathIndex, rd)
		db.sendEvent(DBEvent{
			Type:   "Delete",
			Source: n.GetPath(),
		})
	}

	return nil
}

func (db *MemDB) MoveNode(ctx context.Context, oldPath string, newPath string) (err error) {

	db.indexLock.Lock()
	defer db.indexLock.Unlock()
	nfcOld := normalize(oldPath)

	todos := map[string]tree.N{}
	for p, node := range db.pathIndex {
		if strings.HasPrefix(p, nfcOld+"/") || p == nfcOld {
			node.SetPath(newPath + strings.TrimPrefix(node.GetPath(), oldPath))
			todos[p] = node
		}
	}
	if len(todos) > 0 {
		for p, node := range todos {
			delete(db.pathIndex, p)
			db.pathIndex[normalize(node.GetPath())] = node
		}
		db.sendEvent(DBEvent{
			Type:   "Moved",
			Source: oldPath,
			Target: newPath,
		})
	}
	return nil
}

/*************************/
/* Path Sync Source 	 */
/*************************/

func (db *MemDB) Walk(ctx context.Context, walknFc model.WalkNodesFunc, root string, recursive bool) (err error) {
	var nn []string
	db.indexLock.RLock()
	defer db.indexLock.RUnlock()
	for p := range db.pathIndex {
		nn = append(nn, p)
	}
	sort.Strings(nn)
	for _, p := range nn {
		node := db.pathIndex[p]
		if root != "/" && !strings.HasPrefix(node.GetPath(), root) {
			continue
		}
		if !recursive && strings.Contains(strings.TrimPrefix(node.GetPath(), root), "/") {
			return nil
		}
		if er := walknFc(node.GetPath(), node, nil); er != nil {
			return er
		}
	}
	return nil
}

func (db *MemDB) Watch(recursivePath string) (*model.WatchObject, error) {
	inChan := make(chan DBEvent)
	eventChan := make(chan model.EventInfo)
	errorChan := make(chan error)
	doneChan := make(chan bool)

	// wait for doneChan to close the other channels
	go func() {
		<-doneChan

		close(eventChan)
		close(errorChan)
		close(inChan)
	}()

	wo := &model.WatchObject{
		EventInfoChan: eventChan,
		ErrorChan:     errorChan,
		DoneChan:      doneChan,
	}

	go func() {
		defer wo.Close()

		for ev := range inChan {
			switch v := ev.Type; v {
			case "Create":
				eventChan <- model.EventInfo{
					Time:   time.Now().String(),
					Size:   0,
					Etag:   "",
					Path:   ev.Target,
					Folder: false,
					Source: db,
					Type:   model.EventCreate,
				}
			case "Moved":
				eventChan <- model.EventInfo{
					Time:   time.Now().String(),
					Size:   0,
					Etag:   "",
					Path:   ev.Target,
					Folder: false,
					Source: db,
					Type:   model.EventSureMove,
				}
			case "Deleted":
				eventChan <- model.EventInfo{
					Time:   time.Now().String(),
					Size:   0,
					Etag:   "",
					Path:   ev.Source,
					Folder: false,
					Source: db,
					Type:   model.EventRemove,
				}
			}

		}
	}()

	return wo, nil
}

/*************************/
/* Other Methods 		 */
/*************************/

func (db *MemDB) String() string {
	output := ""
	db.indexLock.RLock()
	defer db.indexLock.RUnlock()
	i := 0
	for _, node := range db.pathIndex {
		leaf := "Leaf"
		if !node.IsLeaf() {
			leaf = "Folder"
		}
		output += leaf + "\t'" + node.GetPath() + "' (" + node.GetUuid() + node.GetEtag() + ")" + "\n"
		i++
		if i > 20 {
			output += "\n, stopping at 20"
			break
		}
	}
	return output
}

func (db *MemDB) Stats() string {
	var leafs, colls int
	db.indexLock.RLock()
	defer db.indexLock.RUnlock()
	for _, node := range db.pathIndex {
		if node.IsLeaf() {
			leafs++
		} else {
			colls++
		}
	}
	return fmt.Sprintf("Snapshot contains %v files and %v folders", leafs, colls)
}

// ToJSON outputs contents to JSON file
func (db *MemDB) ToJSON(name string) error {
	data, _ := db.ToJSONBytes()
	return os.WriteFile(name, data, 0666)
}

// FromJSON read a JSON file in memory
func (db *MemDB) FromJSON(name string) error {
	data, err := os.ReadFile(name)
	if err != nil {
		return err
	}
	var nn []*tree.Node
	er := json.Unmarshal(data, &nn)
	if er != nil {
		return er
	}
	db.indexLock.Lock()
	for _, n := range nn {
		db.pathIndex[normalize(n.GetPath())] = n
	}
	db.indexLock.Unlock()
	return nil
}

// ToJSONBytes marshal contents to JSON
func (db *MemDB) ToJSONBytes() ([]byte, error) {
	// Backward compat, keep as slice
	var nn []tree.N
	db.indexLock.RLock()
	for _, n := range db.pathIndex {
		nn = append(nn, n)
	}
	db.indexLock.RUnlock()
	return json.Marshal(nn)
}

// MemDBWithCacheTest provides a structure for testing CachedBranchProvider related functions
type MemDBWithCacheTest struct {
	MemDB
}

// NewMemDBWithCacheTest creates a new MemDB implementing CachedBranchProvider interface
func NewMemDBWithCacheTest() *MemDBWithCacheTest {
	return &MemDBWithCacheTest{
		MemDB: *NewMemDB(),
	}
}

// GetCachedBranches loads branch in memory
func (m *MemDBWithCacheTest) GetCachedBranches(ctx context.Context, roots ...string) (model.PathSyncSource, error) {
	memDB := NewMemDB()
	// Make sure to dedup roots
	rts := make(map[string]string)
	for _, root := range roots {
		rts[root] = root
	}
	for _, root := range rts {
		er := m.Walk(nil, func(path string, node tree.N, err error) error {
			if err == nil {
				err = memDB.CreateNode(ctx, node, false)
			}
			return err
		}, root, true)
		if er != nil {
			return nil, er
		}
	}
	return memDB, nil
}

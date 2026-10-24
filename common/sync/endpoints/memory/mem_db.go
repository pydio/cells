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
	"fmt"
	"net/url"
	"os"
	"sort"
	"strings"
	"sync"
	"time"

	"golang.org/x/text/unicode/norm"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints"
	"github.com/pydio/cells/v5/common/sync/model"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

func init() {
	endpoints.Register("mem", endpoints.OpenURLFunc(func(context.Context, *url.URL, ...*url.URL) (model.Endpoint, error) {
		return NewMemDB(), nil
	}))
}

type DBEvent struct {
	Type   string
	Source string
	Target string
	// Node is the created or deleted node, or the moved node at its new location
	Node tree.N
	// MoveSource is the moved node at its original location
	MoveSource tree.N
}

type MemDB struct {
	eventLock     sync.Mutex
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

// RegisterEventChannel registers a channel receiving all DB events. Events are sent
// synchronously: the channel must be read until it is unregistered.
func (db *MemDB) RegisterEventChannel(out chan DBEvent) {
	db.eventLock.Lock()
	db.eventChannels = append(db.eventChannels, out)
	db.eventLock.Unlock()
}

// unregisterEventChannel removes and closes a channel registered with RegisterEventChannel.
// The channel must be drained while unregistering, as a pending sendEvent holds eventLock.
func (db *MemDB) unregisterEventChannel(out chan DBEvent) {
	db.eventLock.Lock()
	defer db.eventLock.Unlock()
	for i, c := range db.eventChannels {
		if c == out {
			db.eventChannels = append(db.eventChannels[:i], db.eventChannels[i+1:]...)
			break
		}
	}
	close(out)
}

// sendEvents must be called without holding indexLock, so that receivers can read the DB.
func (db *MemDB) sendEvents(events ...DBEvent) {
	db.eventLock.Lock()
	defer db.eventLock.Unlock()
	for _, event := range events {
		for _, channel := range db.eventChannels {
			channel <- event
		}
	}
}

/*************************/
/* Path Sync Target 	 */
/*************************/

func normalize(s string) string {
	return strings.Trim(norm.NFC.String(s), "/")
}

// cloneNode avoids mutating nodes that were already handed out
func cloneNode(n tree.N) tree.N {
	return n.AsProto().Clone()
}

func (db *MemDB) LoadNode(ctx context.Context, path string, extendedStats ...bool) (node tree.N, err error) {

	db.indexLock.RLock()
	defer db.indexLock.RUnlock()
	if n, ok := db.pathIndex[normalize(path)]; ok {
		return cloneNode(n), nil
	} else {
		return nil, errors.WithMessagef(errors.NodeNotFound, "node not found in memdb %s", path)
	}

}

func (db *MemDB) CreateNode(ctx context.Context, node tree.N, updateIfExists bool) (err error) {
	// Store a copy, like a real storage: the caller may keep modifying its node
	node = cloneNode(node)
	db.indexLock.Lock()
	db.pathIndex[normalize(node.GetPath())] = node
	db.indexLock.Unlock()
	db.sendEvents(DBEvent{
		Type:   "Create",
		Target: node.GetPath(),
		Node:   node,
	})
	return nil
}

func (db *MemDB) DeleteNode(ctx context.Context, path string) (err error) {
	db.indexLock.Lock()
	nfc := normalize(path)
	var dd []string
	for p := range db.pathIndex {
		if p == nfc || strings.HasPrefix(p, nfc+"/") {
			dd = append(dd, p)
		}
	}
	sort.Strings(dd)
	var events []DBEvent
	for _, rd := range dd {
		n := db.pathIndex[rd]
		delete(db.pathIndex, rd)
		events = append(events, DBEvent{
			Type:   "Delete",
			Source: n.GetPath(),
			Node:   n,
		})
	}
	db.indexLock.Unlock()
	db.sendEvents(events...)

	return nil
}

func (db *MemDB) MoveNode(ctx context.Context, oldPath string, newPath string) (err error) {

	db.indexLock.Lock()
	nfcOld := normalize(oldPath)
	nfcNew := normalize(newPath)

	var source, target tree.N
	todos := map[string]tree.N{}
	for p, node := range db.pathIndex {
		if strings.HasPrefix(p, nfcOld+"/") || p == nfcOld {
			// Store a moved copy: nodes already handed out keep their original path
			moved := cloneNode(node)
			newKey := nfcNew + strings.TrimPrefix(p, nfcOld)
			if strings.HasPrefix(node.GetPath(), "/") {
				moved.SetPath("/" + newKey)
			} else {
				moved.SetPath(newKey)
			}
			todos[p] = moved
			if p == nfcOld {
				source, target = node, moved
			}
		}
	}
	for p := range todos {
		delete(db.pathIndex, p)
	}
	for _, node := range todos {
		db.pathIndex[normalize(node.GetPath())] = node
	}
	db.indexLock.Unlock()
	if len(todos) > 0 {
		ev := DBEvent{
			Type:       "Moved",
			Source:     oldPath,
			Target:     newPath,
			Node:       target,
			MoveSource: source,
		}
		if target != nil {
			ev.Target = target.GetPath()
		}
		db.sendEvents(ev)
	}
	return nil
}

/*************************/
/* Path Sync Source 	 */
/*************************/

// Walk lists nodes sorted by path. The root node itself is included. Nodes are collected
// before calling walknFc, which can therefore modify the DB.
func (db *MemDB) Walk(ctx context.Context, walknFc model.WalkNodesFunc, root string, recursive bool) (err error) {
	r := normalize(root)
	var nn []string
	db.indexLock.RLock()
	for p := range db.pathIndex {
		if r != "" && p != r && !strings.HasPrefix(p, r+"/") {
			continue
		}
		if !recursive {
			rel := p
			if r != "" {
				rel = strings.TrimPrefix(strings.TrimPrefix(p, r), "/")
			}
			if strings.Contains(rel, "/") {
				continue
			}
		}
		nn = append(nn, p)
	}
	sort.Strings(nn)
	nodes := make([]tree.N, 0, len(nn))
	for _, p := range nn {
		nodes = append(nodes, cloneNode(db.pathIndex[p]))
	}
	db.indexLock.RUnlock()

	for _, node := range nodes {
		if er := walknFc(node.GetPath(), node, nil); er != nil {
			return er
		}
	}
	return nil
}

func (db *MemDB) Watch(ctx context.Context, recursivePath string) (*model.WatchObject, error) {
	inChan := make(chan DBEvent)
	eventChan := make(chan model.EventInfo)
	errorChan := make(chan error)
	doneChan := make(chan bool)
	db.RegisterEventChannel(inChan)

	wo := &model.WatchObject{
		EventInfoChan: eventChan,
		ErrorChan:     errorChan,
		DoneChan:      doneChan,
	}

	// Stops on a value sent on DoneChan, or when it is closed (WatchObject.Close)
	go func() {
		defer func() {
			// Drain pending sends while unregistering
			drained := make(chan struct{})
			go func() {
				for range inChan {
				}
				close(drained)
			}()
			db.unregisterEventChannel(inChan)
			<-drained
			close(eventChan)
			close(errorChan)
		}()
		for {
			select {
			case ev := <-inChan:
				ei, ok := db.toEventInfo(ev)
				if !ok {
					continue
				}
				select {
				case eventChan <- ei:
				case <-doneChan:
					return
				}
			case <-doneChan:
				return
			}
		}
	}()

	return wo, nil
}

func (db *MemDB) toEventInfo(ev DBEvent) (model.EventInfo, bool) {
	ei := model.EventInfo{
		Time:   time.Now().String(),
		Source: db,
	}
	switch ev.Type {
	case "Create":
		ei.Type = model.EventCreate
		ei.Path = ev.Target
	case "Moved":
		ei.Type = model.EventSureMove
		ei.Path = ev.Target
		ei.MoveSource = ev.MoveSource
		ei.MoveTarget = ev.Node
	case "Delete":
		ei.Type = model.EventRemove
		ei.Path = ev.Source
	default:
		return ei, false
	}
	if ev.Node != nil {
		ei.Folder = !ev.Node.IsLeaf()
		ei.Etag = ev.Node.GetEtag()
		ei.Size = ev.Node.GetSize()
	}
	return ei, true
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
	var nn []tree.INode
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

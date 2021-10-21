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
	"io/ioutil"
	"strings"
	"time"

	json "github.com/pydio/cells/x/jsonx"

	"golang.org/x/text/unicode/norm"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

type DBEvent struct {
	Type   string
	Source string
	Target string
}

type MemDB struct {
	Nodes         []*tree.Node
	eventChannels []chan DBEvent
	// Used for testing
	ignores     []string
	testPathURI string
}

func NewMemDB() *MemDB {
	db := &MemDB{}
	db.CreateNode(context.Background(), &tree.Node{
		Path: "/",
		Type: tree.NodeType_COLLECTION,
		Uuid: "root",
	}, true)
	return db
}

func (c *MemDB) GetEndpointInfo() model.EndpointInfo {

	return model.EndpointInfo{
		URI: "memdb://" + c.testPathURI,
		RequiresFoldersRescan: true,
		RequiresNormalization: false,
		Ignores:               c.ignores,
	}

}

// AddIgnore register a filename to be ignored (for tests only)
func (c *MemDB) AddIgnore(s string) {
	c.ignores = append(c.ignores, s)
}

func (c *MemDB) SetTestPathURI(s string) {
	c.testPathURI = s
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
func (db *MemDB) LoadNode(ctx context.Context, path string, extendedStats ...bool) (node *tree.Node, err error) {

	for _, node := range db.Nodes {
		// fmt.Printf("Path:%s Nodes %s\n", norm.NFC.String(path), norm.NFC.String(node.Path))
		if norm.NFC.String(node.Path) == norm.NFC.String(path) {
			return node, nil
		}
	}

	return nil, errors.New("Node not found")
}

func (db *MemDB) CreateNode(ctx context.Context, node *tree.Node, updateIfExists bool) (err error) {
	db.Nodes = append(db.Nodes, node)

	db.sendEvent(DBEvent{
		Type:   "Create",
		Target: node.Path,
	})
	return nil
}

func (db *MemDB) DeleteNode(ctx context.Context, path string) (err error) {
	removed := db.removeNodeNoEvent(path)
	if removed != nil {
		db.sendEvent(DBEvent{
			Type:   "Delete",
			Source: removed.Path,
		})
	}
	return nil
}

func (db *MemDB) MoveNode(ctx context.Context, oldPath string, newPath string) (err error) {
	moved := false
	for _, node := range db.Nodes {
		if strings.HasPrefix(node.Path, oldPath+"/") || node.Path == oldPath {
			node.Path = newPath + strings.TrimPrefix(node.Path, oldPath)
			moved = true
		}
	}
	if moved {
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
func (db *MemDB) Walk(walknFc model.WalkNodesFunc, root string, recursive bool) (err error) {
	for _, node := range db.Nodes {
		if root != "/" && !strings.HasPrefix(node.Path, root) {
			continue
		}
		if !recursive && strings.Contains(strings.TrimPrefix(node.Path, root), "/") {
			return nil
		}
		walknFc(node.Path, node, nil)
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
/* Other Methods 	 */
/*************************/
func (db *MemDB) removeNodeNoEvent(path string) (removed *tree.Node) {
	var newNodes []*tree.Node
	for _, node := range db.Nodes {
		if !strings.HasPrefix(node.Path, path+"/") && node.Path != path {
			newNodes = append(newNodes, node)
		} else {
			removed = node
		}
	}
	db.Nodes = newNodes
	return removed
}

func (db *MemDB) FindByHash(hash string) (node *tree.Node) {

	for _, node := range db.Nodes {
		if node.Etag == hash {
			return node
		}
	}
	return
}

func (db *MemDB) FindByUuid(id string) (node *tree.Node) {

	for _, node := range db.Nodes {
		if node.Uuid == id {
			return node
		}
	}
	return
}

func (db *MemDB) String() string {
	output := ""
	for _, node := range db.Nodes {
		leaf := "Leaf"
		if !node.IsLeaf() {
			leaf = "Folder"
		}
		output += leaf + "\t'" + node.Path + "' (" + node.Uuid + node.Etag + ")" + "\n"
	}
	return output
}

func (db *MemDB) Stats() string {
	var leafs, colls int
	for _, node := range db.Nodes {
		if node.IsLeaf() {
			leafs++
		} else {
			colls++
		}
	}
	return fmt.Sprintf("Snapshot contains %v files and %v folders", leafs, colls)
}

func (db *MemDB) ToJSON(name string) error {
	data, _ := json.Marshal(db.Nodes)
	return ioutil.WriteFile(name, data, 0666)
}

func (db *MemDB) FromJSON(name string) error {
	data, err := ioutil.ReadFile(name)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, &db.Nodes)
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
func (m *MemDBWithCacheTest) GetCachedBranches(ctx context.Context, roots ...string) model.PathSyncSource {
	memDB := NewMemDB()
	// Make sure to dedup roots
	rts := make(map[string]string)
	for _, root := range roots {
		rts[root] = root
	}
	for _, root := range rts {
		m.Walk(func(path string, node *tree.Node, err error) {
			if err == nil {
				memDB.CreateNode(ctx, node, false)
			}
		}, root, true)
	}
	return memDB
}

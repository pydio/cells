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

package merger

import (
	"context"
	"crypto/md5"
	"fmt"
	"path"
	"sort"
	"strings"
	"sync"

	json "github.com/pydio/cells/x/jsonx"

	"github.com/gobwas/glob"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

// TreeNode builds a Merkle Tree but with N children and the ability
// to compute the COLLECTION Nodes hashes to detect changes in branches more rapidly
type TreeNode struct {
	tree.Node
	sync.Mutex
	children     map[string]*TreeNode
	childrenKeys []string
	parent       *TreeNode
	sorted       []*TreeNode

	// PathOperation defines an operation on path, like mkdir, move, delete...
	PathOperation Operation
	// DataOperation defines an operation on data transfer
	DataOperation Operation
	// Conflict encapsulates two conflicting operations on the same node
	Conflict Operation
	// OpMoveTarget is a reference to the target node for move operations
	OpMoveTarget *TreeNode
	// MoveSourcePath is a reference to the source node path if there is a move operation (necessary for detecting conflicts)
	MoveSourcePath string
}

// TreeNodeFromSource populates a hash tree with leafs and folders by walking a source.
// When it comes across a LEAF without Etag value, it asks the source to recompute it in a
// parallel fashion with throttling (max 15 at the same time).  At the end of the operation,
// the tree should be fully loaded with all LEAF etags (but not COLL etags).
func TreeNodeFromSource(source model.PathSyncSource, root string, ignores []glob.Glob, includeMetas []glob.Glob, status ...chan model.Status) (*TreeNode, error) {
	var statusChan chan model.Status
	if len(status) > 0 {
		statusChan = status[0]
	}
	rootNode := NewTreeNode(&tree.Node{Path: "/", Etag: "-1"})
	dirs := map[string]*TreeNode{".": rootNode}
	crtRoot := rootNode
	// Create branch for root
	if len(strings.Trim(root, "/")) > 0 {
		for _, part := range strings.Split(strings.Trim(root, "/"), "/") {
			f := NewTreeNode(&tree.Node{
				Path: path.Join(strings.TrimLeft(crtRoot.Path, "/"), part),
				Etag: "-1",
				Type: tree.NodeType_COLLECTION,
			})
			crtRoot.AddChild(f)
			dirs[f.Path] = f
			crtRoot = f
		}
	}
	wg := &sync.WaitGroup{}
	throttle := make(chan struct{}, 15)
	checksumProvider, isCsProvider := source.(model.ChecksumProvider)
	uri := source.GetEndpointInfo().URI

	err := source.Walk(func(p string, node *tree.Node, err error) {
		if statusChan != nil {
			defer func() {
				s := model.NewProcessingStatus(fmt.Sprintf("Indexing node %s", p)).SetEndpoint(uri).SetProgress(1, true).SetNode(node)
				if err != nil {
					s.SetError(err)
				}
				statusChan <- s
			}()
		}
		if model.IsIgnoredFile(p, ignores...) || len(p) == 0 || p == "/" {
			return
		}
		//log.Logger(context.Background()).Info("Walking Node", node.Zap(), zap.String("endpoint", source.GetEndpointInfo().URI))
		t := NewTreeNode(node)
		parent, ok := dirs[t.ParentPath()]
		if !ok {
			log.Logger(context.Background()).Error("Cannot find parent path for node, this is not normal - skipping node!", node.ZapPath())
			return
		}
		if model.NodeRequiresChecksum(node) && isCsProvider {
			wg.Add(1)
			throttle <- struct{}{}
			go func() {
				defer func() {
					<-throttle
					wg.Done()
				}()
				if statusChan != nil {
					statusChan <- model.NewProcessingStatus(fmt.Sprintf("Computing hash for %s", p)).SetEndpoint(uri).SetNode(node)
				}
				if e := checksumProvider.ComputeChecksum(node); e != nil {
					log.Logger(context.Background()).Error("Cannot compute checksum for "+node.Path, zap.Error(e))
					if statusChan != nil {
						statusChan <- model.NewProcessingStatus(fmt.Sprintf("Could not compute hash for %s", p)).SetEndpoint(uri).SetNode(node).SetError(e)
					}
				}
				childNode := NewTreeNode(node)
				parent.AddChild(childNode)
				addMetadataAsChildNodes(childNode, includeMetas)
			}()
		} else {
			parent.AddChild(t)
			if !t.IsLeaf() {
				dirs[strings.Trim(t.GetPath(), "/")] = t
			}
			addMetadataAsChildNodes(t, includeMetas)
		}
	}, root, true)
	wg.Wait()

	return rootNode, err
}

func NewTree() *TreeNode {
	return NewTreeNode(&tree.Node{Path: "", Etag: "-1"})
}

// NewTreeNode creates a new node from a tree.Node. Can be a root, a COLL or a LEAF.
func NewTreeNode(n *tree.Node) *TreeNode {
	tN := &TreeNode{
		children: make(map[string]*TreeNode),
	}
	tN.Node = *n
	return tN
}

// GetCursor gives a cursor to crawl the current node children
func (t *TreeNode) GetCursor() *ChildrenCursor {
	return &ChildrenCursor{
		children: t.SortedChildren(),
		crt:      -1,
	}
}

// Enqueue recursively appends al tree.Node and the children's tree.Node to a slice
func (t *TreeNode) Enqueue(nodes []*tree.Node) []*tree.Node {
	nodes = append(nodes, &t.Node)
	if !t.IsLeaf() {
		for _, c := range t.SortedChildren() {
			nodes = c.Enqueue(nodes)
		}
	}
	return nodes
}

// SortedChildren sorts children by their labels. An internal flag avoids resorting if
// it was already sorted once.
func (t *TreeNode) SortedChildren() []*TreeNode {
	if t.sorted != nil {
		return t.sorted
	}
	t.Lock()
	defer t.Unlock()
	sort.Strings(t.childrenKeys)
	for _, k := range t.childrenKeys {
		t.sorted = append(t.sorted, t.children[k])
	}
	return t.sorted
}

// PrintOut sends to fmt.Println a tree version of this node
func (t *TreeNode) PrintTree() string {
	level := t.GetLevel()
	op := ""
	var ops []string
	if t.PathOperation != nil {
		ops = append(ops, t.PathOperation.String())
	}
	if t.DataOperation != nil {
		ops = append(ops, t.DataOperation.String())
	}
	if len(ops) > 0 {
		op = "\t\t ** " + strings.Join(ops, "|")
	}
	s := fmt.Sprintf(strings.Repeat("  ", level) + "- " + t.Label() + "\t\t" + t.GetHash() + op + "\n")
	for _, c := range t.SortedChildren() {
		s += c.PrintTree()
	}
	return s
}

// AddChild appends a child to the children map (with lock)
func (t *TreeNode) AddChild(n *TreeNode) {
	t.Lock()
	t.children[n.GetPath()] = n
	t.childrenKeys = append(t.childrenKeys, n.GetPath())
	t.Unlock()
	n.parent = t
	// Will force resorting keys next time
	t.sorted = nil
}

func (t *TreeNode) ClearChildren() {
	t.Lock()
	t.children = make(map[string]*TreeNode)
	t.sorted = []*TreeNode{}
	t.childrenKeys = []string{}
	t.Unlock()
}

// GetLevel computes the current level of this node (depth)
func (t *TreeNode) GetLevel() int {
	return len(strings.Split(strings.Trim(t.Path, "/"), "/"))
}

// ParentPath returns the parent Dir path
func (t *TreeNode) ParentPath() string {
	p := strings.Trim(t.Path, "/")
	return path.Dir(p)
}

// Label returns the basename of the path
func (t *TreeNode) Label() string {
	p := strings.Trim(t.Path, "/")
	return path.Base(p)
}

// GetHash returns the Etag of the node. For leaf it should be available,
// for Folders if it is not already computed, it will compute an etag from
// the children recursively, using their name and Etag.
func (t *TreeNode) GetHash() string {
	if t.Type == NodeType_METADATA {
		return t.Etag
	} else if t.IsLeaf() {
		// append t.Etag and metadata
		sorted := t.SortedChildren()
		if len(sorted) == 0 {
			return t.Etag
		} else {
			h := md5.New()
			h.Write([]byte(t.Etag))
			for _, c := range t.SortedChildren() {
				h.Write([]byte(c.Label() + c.GetHash()))
			}
			return fmt.Sprintf("%x", h.Sum(nil))
		}
	} else {
		// Now Collections
		if t.Etag != "-1" && t.Etag != "" {
			return t.Etag
		}
		h := md5.New()
		for _, c := range t.SortedChildren() {
			h.Write([]byte(c.Label() + c.GetHash()))
		}
		t.Etag = fmt.Sprintf("%x", h.Sum(nil))
		return t.Etag
	}
}

func (t *TreeNode) getRoot() *TreeNode {
	if t.parent == nil {
		return t
	} else {
		return t.parent.getRoot()
	}
}

func (t *TreeNode) createNodeDeep(p string) *TreeNode {
	crtParent := t
	split := strings.Split(p, "/")
	for i, _ := range split {
		childPath := strings.Join(split[:i+1], "/")
		if c, o := crtParent.children[childPath]; o {
			crtParent = c
		} else {
			n := NewTreeNode(&tree.Node{Path: childPath})
			crtParent.AddChild(n)
			crtParent = n
		}
	}
	return crtParent
}

func (t *TreeNode) Walk(cb func(n *TreeNode) bool) {
	if pruneBranch := cb(t); pruneBranch {
		t.ClearChildren()
		return
	}
	for _, c := range t.SortedChildren() {
		c.Walk(cb)
	}
}

func (t *TreeNode) ChildByPath(p string) *TreeNode {
	if p == "" {
		p = "/"
	}
	if p == t.Path {
		return t
	}
	for _, c := range t.SortedChildren() {
		if strings.HasPrefix(p, c.Path) {
			return c.ChildByPath(p)
		}
	}
	return nil
}

// ChildrenCursor provides a Nexter for browsing a node children
type ChildrenCursor struct {
	children []*TreeNode
	crt      int
}

// Next sends the next child or nil
func (c *ChildrenCursor) Next() *TreeNode {
	c.crt++
	if c.crt > len(c.children)-1 {
		return nil
	} else {
		return c.children[c.crt]
	}
}

// MarshalJSON serializes specific fields for output to JSON
func (t *TreeNode) MarshalJSON() ([]byte, error) {
	data := map[string]interface{}{
		"Base": path.Base(t.Node.Path),
		"Node": t.Node,
	}
	if len(t.children) > 0 {
		data["Children"] = t.SortedChildren()
	}
	if t.PathOperation != nil {
		data["PathOperation"] = t.PathOperation
		if t.OpMoveTarget != nil {
			data["MoveTargetPath"] = t.PathOperation.GetRefPath()
		}
	}
	if t.DataOperation != nil {
		data["DataOperation"] = t.DataOperation
	}
	if t.Conflict != nil {
		data["Conflict"] = t.Conflict
	}
	if t.MoveSourcePath != "" {
		data["MoveSourcePath"] = t.MoveSourcePath
	}
	return json.Marshal(data)
}

package merger

import (
	"context"
	"crypto/md5"
	"fmt"
	"path"
	"sort"
	"strings"
	"sync"

	"github.com/pydio/cells/common/sync/model"

	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
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

	Operation    *Operation
	OpMoveTarget *TreeNode
}

// TreeNodeFromSource populates a hash tree with leafs and folders by walking a source.
// When it comes accross a LEAF without Etag value, it asks the source to recompute it in a
// parallel fashion with throttling (max 15 at the same time).  At the end of the operation,
// the tree should be fully loaded with all LEAF etags (but not COLL etags).
func TreeNodeFromSource(source model.PathSyncSource, root string) (*TreeNode, error) {
	rootNode := NewTreeNode(&tree.Node{Path: "/", Etag: "-1"})
	dirs := map[string]*TreeNode{".": rootNode}
	crtRoot := rootNode
	// Create branch for root
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
	wg := &sync.WaitGroup{}
	throttle := make(chan struct{}, 15)
	checksumProvider := source.(model.ChecksumProvider)

	err := source.Walk(func(path string, node *tree.Node, err error) {
		if model.IsIgnoredFile(path) || len(path) == 0 || path == "/" {
			return
		}
		t := NewTreeNode(node)
		parent, ok := dirs[t.ParentPath()]
		if !ok {
			log.Logger(context.Background()).Error("Cannot find parent path for node, this is not normal - skipping node!", node.ZapPath())
			return
		}
		if model.NodeRequiresChecksum(node) && checksumProvider != nil {
			wg.Add(1)
			go func() {
				throttle <- struct{}{}
				defer func() {
					<-throttle
					wg.Done()
				}()
				if e := checksumProvider.ComputeChecksum(node); e != nil {
					log.Logger(context.Background()).Info("Cannot compute checksum for "+node.Path, zap.Error(e))
				}
				parent.AddChild(NewTreeNode(node))
			}()
		} else {
			parent.AddChild(t)
			if !t.IsLeaf() {
				dirs[strings.Trim(t.GetPath(), "/")] = t
			}
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
	sort.Strings(t.childrenKeys)
	for _, k := range t.childrenKeys {
		t.sorted = append(t.sorted, t.children[k])
	}
	return t.sorted
}

// PrintOut sends to fmt.Println a tree version of this node
func (t *TreeNode) PrintOut() {
	level := t.GetLevel()
	op := ""
	if t.Operation != nil {
		op = "\t\t ** " + t.Operation.String()
	}
	fmt.Println(strings.Repeat("  ", level) + "- " + t.Label() + "\t\t" + t.GetHash() + op)
	for _, c := range t.SortedChildren() {
		c.PrintOut()
	}
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
	if t.IsLeaf() || (t.Etag != "-1" && t.Etag != "") {
		return t.Etag
	}
	h := md5.New()
	for _, c := range t.SortedChildren() {
		h.Write([]byte(c.Label() + c.GetHash()))
	}
	t.Etag = fmt.Sprintf("%x", h.Sum(nil))
	return t.Etag
}

// OriginalPath when this is an operation tree, return the Source path of the node
func (t *TreeNode) OriginalPath() string {
	if t.parent == nil {
		return t.Path
	}
	return path.Join(t.parent.OriginalPath(), t.Label())
}

// ModifiedPath when this is an operation tree, return the Target path of the node
func (t *TreeNode) ModifiedPath(first bool) string {
	if t.parent == nil {
		return t.Path
	}
	label := t.Label()
	if !first && t.Operation != nil && (t.Operation.Type == OpMoveFolder || t.Operation.Type == OpMoveFile) {
		// Compute target from t.Operation.Event.Path instead of Node Path
		label = path.Base(strings.Trim(t.Operation.EventInfo.Path, "/"))
	}
	return path.Join(t.parent.ModifiedPath(false), label)
}

// QueueOperation registers an operation at a given path, by eventually building
// traversing nodes without operations on them
func (t *TreeNode) QueueOperation(op *Operation) {
	crtParent := t
	p := op.Node.Path
	split := strings.Split(p, "/")
	for i, _ := range split {
		childPath := strings.Join(split[:i+1], "/")
		if i == len(split)-1 {
			var last *TreeNode
			if c, o := crtParent.children[childPath]; o {
				last = c
			} else {
				last = NewTreeNode(op.Node)
				crtParent.AddChild(last)
			}
			last.Operation = op
			if op.Type == OpMoveFolder || op.Type == OpMoveFile {
				// Link to the target
				last.OpMoveTarget = t.getRoot().createNodeDeep(op.Key)
			}
		} else if c, o := crtParent.children[childPath]; o {
			crtParent = c
		} else {
			n := NewTreeNode(&tree.Node{Path: childPath})
			crtParent.AddChild(n)
			crtParent = n
		}
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

func (t *TreeNode) WalkOperations(opTypes []OperationType, callback func(*Operation)) {
	filter := func(o *Operation) (call bool, walk bool) {
		if o == nil {
			return false, true
		}
		walk = o.Type != OpDelete
		if len(opTypes) == 0 {
			return true, walk
		}
		for _, oT := range opTypes {
			if o.Type == oT {
				return true, walk
			}
		}
		return false, walk
	}

	call, walk := filter(t.Operation)
	if call {
		if t.OpMoveTarget != nil {
			// Check modified are ok
			modSrc := t.ModifiedPath(true)
			modTarget := t.OpMoveTarget.ModifiedPath(true)
			if modSrc == modTarget {
				fmt.Println("Move will finally be identic, ignoring", modSrc, modTarget)
				return
			}
		}
		callback(t.Operation)
	}
	if !walk {
		return
	}
	for _, c := range t.SortedChildren() {
		c.WalkOperations(opTypes, callback)
	}
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

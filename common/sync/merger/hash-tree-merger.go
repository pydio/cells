package merger

import (
	"strings"
)

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

// MergeNodes will recursively detect differences between two hash trees.
func MergeNodes(left *TreeNode, right *TreeNode, diff *Diff) {
	if left.GetHash() == right.GetHash() {
		return
	}
	if left.IsLeaf() && right.IsLeaf() {
		// Compare on MTimes and Enqueue
		if left.MTime >= right.MTime {
			diff.MissingRight = left.Enqueue(diff.MissingRight)
		} else {
			diff.MissingLeft = right.Enqueue(diff.MissingLeft)
		}
		return
	} else if left.Type != right.Type {
		// Node type changed ! Enqueue both as missing and browse children if necessary
		diff.MissingRight = left.Enqueue(diff.MissingRight)
		diff.MissingLeft = right.Enqueue(diff.MissingLeft)
	} else if !left.IsLeaf() && !right.IsLeaf() && left.Uuid != right.Uuid {
		diff.FolderUUIDs = append(diff.FolderUUIDs, &Conflict{
			NodeLeft:  &left.Node,
			NodeRight: &right.Node,
			Type:      ConflictFolderUUID,
		})
	}
	cL := left.GetCursor()
	cR := right.GetCursor()
	a := cL.Next()
	b := cR.Next()
	for a != nil || b != nil {
		if a != nil && b != nil {
			switch strings.Compare(a.Label(), b.Label()) {
			case 0:
				MergeNodes(a, b, diff)
				a = cL.Next()
				b = cR.Next()
				continue
			case 1:
				diff.MissingLeft = b.Enqueue(diff.MissingLeft)
				b = cR.Next()
				continue
			case -1:
				diff.MissingRight = a.Enqueue(diff.MissingRight)
				a = cL.Next()
				continue
			}
		} else if a == nil && b != nil {
			diff.MissingLeft = b.Enqueue(diff.MissingLeft)
			b = cR.Next()
			continue
		} else if b == nil && a != nil {
			diff.MissingRight = a.Enqueue(diff.MissingRight)
			a = cL.Next()
			continue
		}
	}
}

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
	if left.Type != right.Type {
		// Node changed of type - Register conflict and keep browsing
		diff.Conflicts = append(diff.Conflicts, &Conflict{
			Type:      ConflictNodeType,
			NodeLeft:  &left.Node,
			NodeRight: &right.Node,
		})
	} else if !left.IsLeaf() && left.Uuid != right.Uuid {
		// Folder has different UUID - Register conflict and keep browsing
		diff.Conflicts = append(diff.Conflicts, &Conflict{
			Type:      ConflictFolderUUID,
			NodeLeft:  &left.Node,
			NodeRight: &right.Node,
		})
	} else if left.IsLeaf() {
		// Files differ - Register conflict and return (no children)
		diff.Conflicts = append(diff.Conflicts, &Conflict{
			Type:      ConflictFileContent,
			NodeLeft:  &left.Node,
			NodeRight: &right.Node,
		})
		return
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

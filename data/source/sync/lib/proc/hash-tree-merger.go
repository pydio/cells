package proc

import "strings"

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
func MergeNodes(left *TreeNode, right *TreeNode, diff *SourceDiff) {
	if left.GetHash() == right.GetHash() {
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

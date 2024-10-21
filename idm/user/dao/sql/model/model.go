package user_model

import (
	"gorm.io/gorm/schema"

	"github.com/pydio/cells/v4/common/proto/tree"
)

type User struct {
	tree.TreeNode
}

// NewTreeNode creates an ITreeNode with a path, and optionally more node info for creation
func NewTreeNode(path string, withNode ...*tree.Node) tree.ITreeNode {
	var n *tree.Node
	if len(withNode) > 0 {
		n = withNode[0].Clone()
	} else {
		n = &tree.Node{}
	}
	n.SetPath(path)
	u := &User{}
	u.TreeNode.Node = n
	return u
}

// NewTreeNodePtr creates an ITreeNode with a path, and optionally more node info for creation, and return its pointer
func NewTreeNodePtr(path string, withNode ...*tree.Node) *tree.ITreeNode {
	tn := NewTreeNode(path, withNode...)
	return &tn
}

// TableName is kept for backward compatibility
func (*User) TableName(namer schema.Namer) string {
	return namer.TableName("user_idx_tree")
}

var _ tree.ITreeNode = (*tree.TreeNode)(nil)

var _ tree.ITreeNode = (*User)(nil)

type UserAttribute struct {
	UUID  string `gorm:"column:uuid; primaryKey; type: varchar(128) not null; index:,composite:ui;"`
	Name  string `gorm:"column:name; primaryKey;type: varchar(255) not null;"`
	Value string `gorm:"column:value;"`
	User  *User  `gorm:"foreignKey:UUID;constraint:OnDelete:CASCADE;"`
}

type UserRole struct {
	UUID   string `gorm:"column:uuid; primaryKey; type: varchar(128) not null; index:,composite:ui;"`
	Role   string `gorm:"column:name; primaryKey; type: varchar(255) not null;"`
	Weight int    `gorm:"column:weight; type:int default 0;"`
	User   *User  `gorm:"foreignKey:UUID;constraint:OnDelete:CASCADE;"`
}

type Querier interface {
	// FilterWithLowerVal is a code snippet to filter a column using its lower value
	//
	// where lower(@@column) = lower(@value) (gen.M, error)
	FilterWithLowerVal(column string, value string)
}

package user_model

import "github.com/pydio/cells/v4/common/proto/tree"

type User struct {
	tree.TreeNode
}

var _ tree.ITreeNode = (*tree.TreeNode)(nil)
var _ tree.ITreeNode = (*User)(nil)

type UserAttribute struct {
	UUID  string `gorm:"column:uuid; primaryKey"`
	Name  string `gorm:"column:name; primaryKey"`
	Value string `gorm:"column:value;"`
	User  *User  `gorm:"foreignKey:UUID"`
}

type UserRole struct {
	UUID   string `gorm:"column:uuid; primaryKey"`
	Role   string `gorm:"column:name; primaryKey"`
	Weight int    `gorm:"column:weight"`
	User   *User  `gorm:"foreignKey:UUID"`
}

type Querier interface {
	// FilterWithLowerVal is a code snippet to filter a column using its lower value
	//
	// where lower(@@column) = lower(@value) (gen.M, error)
	FilterWithLowerVal(column string, value string)
}

package tree

import (
	"errors"
	"google.golang.org/protobuf/proto"
	"reflect"
)

type ITreeNode interface {
	proto.Message
	TreeNodeGetter
	TreeNodeSetter
}

func NewITreeNode(x any) error {
	v := reflect.ValueOf(x)
	for v.Kind() == reflect.Ptr {
		if v.IsNil() && v.CanAddr() {
			v.Set(reflect.New(v.Type().Elem()))
		}

		v = v.Elem()
	}
	if !v.IsValid() {
		return errors.New("not initialized")
	}
	return nil
}

type TreeNodeGetter interface {
	GetNode() *Node
	GetName() string
	GetLevel() int64
	GetMPath() *MPath
	GetHash() string
	GetHash2() string
}

type TreeNodeSetter interface {
	SetNode(*Node)
	SetName(string)
	SetLevel(int64)
	SetMPath(*MPath)
	SetHash(string)
	SetHash2(string)
}

func (x *TreeNode) SetNode(v *Node) {
	if x == nil {
		x = new(TreeNode)
	}

	x.Node = v
}
func (x *TreeNode) SetName(v string) {
	if x == nil {
		x = new(TreeNode)
	}

	x.Name = v
}
func (x *TreeNode) SetLevel(v int64) {
	if x == nil {
		x = new(TreeNode)
	}

	x.Level = v
}
func (x *TreeNode) SetMPath(v *MPath) {
	if x == nil {
		x = new(TreeNode)
	}

	x.MPath = v
}
func (x *TreeNode) SetHash(v string) {
	if x == nil {
		x = new(TreeNode)
	}

	x.Hash = v
}
func (x *TreeNode) SetHash2(v string) {
	if x == nil {
		x = new(TreeNode)
	}

	x.Hash2 = v
}

type IMPath interface {
	proto.Message
	MPathGetter
	MPathSetter
}

func NewIMPath(x any) error {
	v := reflect.ValueOf(x)
	for v.Kind() == reflect.Ptr {
		if v.IsNil() && v.CanAddr() {
			v.Set(reflect.New(v.Type().Elem()))
		}

		v = v.Elem()
	}
	if !v.IsValid() {
		return errors.New("not initialized")
	}
	return nil
}

type MPathGetter interface {
	GetMPath1() string
	GetMPath2() string
	GetMPath3() string
	GetMPath4() string
}

type MPathSetter interface {
	SetMPath1(string)
	SetMPath2(string)
	SetMPath3(string)
	SetMPath4(string)
}

func (x *MPath) SetMPath1(v string) {
	if x == nil {
		x = new(MPath)
	}

	x.MPath1 = v
}
func (x *MPath) SetMPath2(v string) {
	if x == nil {
		x = new(MPath)
	}

	x.MPath2 = v
}
func (x *MPath) SetMPath3(v string) {
	if x == nil {
		x = new(MPath)
	}

	x.MPath3 = v
}
func (x *MPath) SetMPath4(v string) {
	if x == nil {
		x = new(MPath)
	}

	x.MPath4 = v
}

type INode interface {
	proto.Message
	NodeGetter
	NodeSetter
}

func NewINode(x any) error {
	v := reflect.ValueOf(x)
	for v.Kind() == reflect.Ptr {
		if v.IsNil() && v.CanAddr() {
			v.Set(reflect.New(v.Type().Elem()))
		}

		v = v.Elem()
	}
	if !v.IsValid() {
		return errors.New("not initialized")
	}
	return nil
}

type NodeGetter interface {
	GetUuid() string
	GetPath() string
	GetType() NodeType
	GetSize() int64
	GetMTime() int64
	GetMode() int32
	GetEtag() string
	GetCommits() []*ChangeLog
	GetMetaStore() map[string]string
	GetAppearsIn() []*WorkspaceRelativePath
}

type NodeSetter interface {
	SetUuid(string)
	SetPath(string)
	SetType(NodeType)
	SetSize(int64)
	SetMTime(int64)
	SetMode(int32)
	SetEtag(string)
	SetCommits([]*ChangeLog)
	SetMetaStore(map[string]string)
	SetAppearsIn([]*WorkspaceRelativePath)
}

func (x *Node) SetUuid(v string) {
	if x == nil {
		x = new(Node)
	}

	x.Uuid = v
}
func (x *Node) SetPath(v string) {
	if x == nil {
		x = new(Node)
	}

	x.Path = v
}
func (x *Node) SetType(v NodeType) {
	if x == nil {
		x = new(Node)
	}

	x.Type = v
}
func (x *Node) SetSize(v int64) {
	if x == nil {
		x = new(Node)
	}

	x.Size = v
}
func (x *Node) SetMTime(v int64) {
	if x == nil {
		x = new(Node)
	}

	x.MTime = v
}
func (x *Node) SetMode(v int32) {
	if x == nil {
		x = new(Node)
	}

	x.Mode = v
}
func (x *Node) SetEtag(v string) {
	if x == nil {
		x = new(Node)
	}

	x.Etag = v
}
func (x *Node) SetCommits(v []*ChangeLog) {
	if x == nil {
		x = new(Node)
	}

	x.Commits = v
}
func (x *Node) SetMetaStore(v map[string]string) {
	if x == nil {
		x = new(Node)
	}

	x.MetaStore = v
}
func (x *Node) SetAppearsIn(v []*WorkspaceRelativePath) {
	if x == nil {
		x = new(Node)
	}

	x.AppearsIn = v
}

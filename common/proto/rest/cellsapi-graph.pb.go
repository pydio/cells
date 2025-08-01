// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.34.2
// 	protoc        (unknown)
// source: cellsapi-graph.proto

package rest

import (
	idm "github.com/pydio/cells/v5/common/proto/idm"
	tree "github.com/pydio/cells/v5/common/proto/tree"
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type UserStateRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Segment string `protobuf:"bytes,1,opt,name=Segment,proto3" json:"Segment,omitempty"`
}

func (x *UserStateRequest) Reset() {
	*x = UserStateRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_cellsapi_graph_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *UserStateRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*UserStateRequest) ProtoMessage() {}

func (x *UserStateRequest) ProtoReflect() protoreflect.Message {
	mi := &file_cellsapi_graph_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use UserStateRequest.ProtoReflect.Descriptor instead.
func (*UserStateRequest) Descriptor() ([]byte, []int) {
	return file_cellsapi_graph_proto_rawDescGZIP(), []int{0}
}

func (x *UserStateRequest) GetSegment() string {
	if x != nil {
		return x.Segment
	}
	return ""
}

type UserStateResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Workspaces         []*idm.Workspace  `protobuf:"bytes,1,rep,name=Workspaces,proto3" json:"Workspaces,omitempty"`
	WorkspacesAccesses map[string]string `protobuf:"bytes,2,rep,name=WorkspacesAccesses,proto3" json:"WorkspacesAccesses,omitempty" protobuf_key:"bytes,1,opt,name=key,proto3" protobuf_val:"bytes,2,opt,name=value,proto3"`
}

func (x *UserStateResponse) Reset() {
	*x = UserStateResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_cellsapi_graph_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *UserStateResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*UserStateResponse) ProtoMessage() {}

func (x *UserStateResponse) ProtoReflect() protoreflect.Message {
	mi := &file_cellsapi_graph_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use UserStateResponse.ProtoReflect.Descriptor instead.
func (*UserStateResponse) Descriptor() ([]byte, []int) {
	return file_cellsapi_graph_proto_rawDescGZIP(), []int{1}
}

func (x *UserStateResponse) GetWorkspaces() []*idm.Workspace {
	if x != nil {
		return x.Workspaces
	}
	return nil
}

func (x *UserStateResponse) GetWorkspacesAccesses() map[string]string {
	if x != nil {
		return x.WorkspacesAccesses
	}
	return nil
}

type RelationRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	UserId string `protobuf:"bytes,1,opt,name=UserId,proto3" json:"UserId,omitempty"`
}

func (x *RelationRequest) Reset() {
	*x = RelationRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_cellsapi_graph_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *RelationRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*RelationRequest) ProtoMessage() {}

func (x *RelationRequest) ProtoReflect() protoreflect.Message {
	mi := &file_cellsapi_graph_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use RelationRequest.ProtoReflect.Descriptor instead.
func (*RelationRequest) Descriptor() ([]byte, []int) {
	return file_cellsapi_graph_proto_rawDescGZIP(), []int{2}
}

func (x *RelationRequest) GetUserId() string {
	if x != nil {
		return x.UserId
	}
	return ""
}

type RelationResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	SharedCells    []*idm.Workspace `protobuf:"bytes,1,rep,name=SharedCells,proto3" json:"SharedCells,omitempty"`
	BelongsToTeams []*idm.Role      `protobuf:"bytes,3,rep,name=BelongsToTeams,proto3" json:"BelongsToTeams,omitempty"`
}

func (x *RelationResponse) Reset() {
	*x = RelationResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_cellsapi_graph_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *RelationResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*RelationResponse) ProtoMessage() {}

func (x *RelationResponse) ProtoReflect() protoreflect.Message {
	mi := &file_cellsapi_graph_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use RelationResponse.ProtoReflect.Descriptor instead.
func (*RelationResponse) Descriptor() ([]byte, []int) {
	return file_cellsapi_graph_proto_rawDescGZIP(), []int{3}
}

func (x *RelationResponse) GetSharedCells() []*idm.Workspace {
	if x != nil {
		return x.SharedCells
	}
	return nil
}

func (x *RelationResponse) GetBelongsToTeams() []*idm.Role {
	if x != nil {
		return x.BelongsToTeams
	}
	return nil
}

type RecommendRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Segment  string `protobuf:"bytes,1,opt,name=Segment,proto3" json:"Segment,omitempty"`
	Category string `protobuf:"bytes,2,opt,name=Category,proto3" json:"Category,omitempty"`
	Neighbor string `protobuf:"bytes,3,opt,name=Neighbor,proto3" json:"Neighbor,omitempty"`
	Limit    int32  `protobuf:"varint,4,opt,name=Limit,proto3" json:"Limit,omitempty"`
}

func (x *RecommendRequest) Reset() {
	*x = RecommendRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_cellsapi_graph_proto_msgTypes[4]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *RecommendRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*RecommendRequest) ProtoMessage() {}

func (x *RecommendRequest) ProtoReflect() protoreflect.Message {
	mi := &file_cellsapi_graph_proto_msgTypes[4]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use RecommendRequest.ProtoReflect.Descriptor instead.
func (*RecommendRequest) Descriptor() ([]byte, []int) {
	return file_cellsapi_graph_proto_rawDescGZIP(), []int{4}
}

func (x *RecommendRequest) GetSegment() string {
	if x != nil {
		return x.Segment
	}
	return ""
}

func (x *RecommendRequest) GetCategory() string {
	if x != nil {
		return x.Category
	}
	return ""
}

func (x *RecommendRequest) GetNeighbor() string {
	if x != nil {
		return x.Neighbor
	}
	return ""
}

func (x *RecommendRequest) GetLimit() int32 {
	if x != nil {
		return x.Limit
	}
	return 0
}

type RecommendResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Nodes []*tree.Node `protobuf:"bytes,1,rep,name=Nodes,proto3" json:"Nodes,omitempty"`
}

func (x *RecommendResponse) Reset() {
	*x = RecommendResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_cellsapi_graph_proto_msgTypes[5]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *RecommendResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*RecommendResponse) ProtoMessage() {}

func (x *RecommendResponse) ProtoReflect() protoreflect.Message {
	mi := &file_cellsapi_graph_proto_msgTypes[5]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use RecommendResponse.ProtoReflect.Descriptor instead.
func (*RecommendResponse) Descriptor() ([]byte, []int) {
	return file_cellsapi_graph_proto_rawDescGZIP(), []int{5}
}

func (x *RecommendResponse) GetNodes() []*tree.Node {
	if x != nil {
		return x.Nodes
	}
	return nil
}

var File_cellsapi_graph_proto protoreflect.FileDescriptor

var file_cellsapi_graph_proto_rawDesc = []byte{
	0x0a, 0x14, 0x63, 0x65, 0x6c, 0x6c, 0x73, 0x61, 0x70, 0x69, 0x2d, 0x67, 0x72, 0x61, 0x70, 0x68,
	0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12, 0x04, 0x72, 0x65, 0x73, 0x74, 0x1a, 0x0f, 0x63, 0x65,
	0x6c, 0x6c, 0x73, 0x2d, 0x69, 0x64, 0x6d, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x1a, 0x10, 0x63,
	0x65, 0x6c, 0x6c, 0x73, 0x2d, 0x74, 0x72, 0x65, 0x65, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x22,
	0x2c, 0x0a, 0x10, 0x55, 0x73, 0x65, 0x72, 0x53, 0x74, 0x61, 0x74, 0x65, 0x52, 0x65, 0x71, 0x75,
	0x65, 0x73, 0x74, 0x12, 0x18, 0x0a, 0x07, 0x53, 0x65, 0x67, 0x6d, 0x65, 0x6e, 0x74, 0x18, 0x01,
	0x20, 0x01, 0x28, 0x09, 0x52, 0x07, 0x53, 0x65, 0x67, 0x6d, 0x65, 0x6e, 0x74, 0x22, 0xeb, 0x01,
	0x0a, 0x11, 0x55, 0x73, 0x65, 0x72, 0x53, 0x74, 0x61, 0x74, 0x65, 0x52, 0x65, 0x73, 0x70, 0x6f,
	0x6e, 0x73, 0x65, 0x12, 0x2e, 0x0a, 0x0a, 0x57, 0x6f, 0x72, 0x6b, 0x73, 0x70, 0x61, 0x63, 0x65,
	0x73, 0x18, 0x01, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x0e, 0x2e, 0x69, 0x64, 0x6d, 0x2e, 0x57, 0x6f,
	0x72, 0x6b, 0x73, 0x70, 0x61, 0x63, 0x65, 0x52, 0x0a, 0x57, 0x6f, 0x72, 0x6b, 0x73, 0x70, 0x61,
	0x63, 0x65, 0x73, 0x12, 0x5f, 0x0a, 0x12, 0x57, 0x6f, 0x72, 0x6b, 0x73, 0x70, 0x61, 0x63, 0x65,
	0x73, 0x41, 0x63, 0x63, 0x65, 0x73, 0x73, 0x65, 0x73, 0x18, 0x02, 0x20, 0x03, 0x28, 0x0b, 0x32,
	0x2f, 0x2e, 0x72, 0x65, 0x73, 0x74, 0x2e, 0x55, 0x73, 0x65, 0x72, 0x53, 0x74, 0x61, 0x74, 0x65,
	0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x2e, 0x57, 0x6f, 0x72, 0x6b, 0x73, 0x70, 0x61,
	0x63, 0x65, 0x73, 0x41, 0x63, 0x63, 0x65, 0x73, 0x73, 0x65, 0x73, 0x45, 0x6e, 0x74, 0x72, 0x79,
	0x52, 0x12, 0x57, 0x6f, 0x72, 0x6b, 0x73, 0x70, 0x61, 0x63, 0x65, 0x73, 0x41, 0x63, 0x63, 0x65,
	0x73, 0x73, 0x65, 0x73, 0x1a, 0x45, 0x0a, 0x17, 0x57, 0x6f, 0x72, 0x6b, 0x73, 0x70, 0x61, 0x63,
	0x65, 0x73, 0x41, 0x63, 0x63, 0x65, 0x73, 0x73, 0x65, 0x73, 0x45, 0x6e, 0x74, 0x72, 0x79, 0x12,
	0x10, 0x0a, 0x03, 0x6b, 0x65, 0x79, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x03, 0x6b, 0x65,
	0x79, 0x12, 0x14, 0x0a, 0x05, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09,
	0x52, 0x05, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x3a, 0x02, 0x38, 0x01, 0x22, 0x29, 0x0a, 0x0f, 0x52,
	0x65, 0x6c, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x16,
	0x0a, 0x06, 0x55, 0x73, 0x65, 0x72, 0x49, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x06,
	0x55, 0x73, 0x65, 0x72, 0x49, 0x64, 0x22, 0x77, 0x0a, 0x10, 0x52, 0x65, 0x6c, 0x61, 0x74, 0x69,
	0x6f, 0x6e, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x30, 0x0a, 0x0b, 0x53, 0x68,
	0x61, 0x72, 0x65, 0x64, 0x43, 0x65, 0x6c, 0x6c, 0x73, 0x18, 0x01, 0x20, 0x03, 0x28, 0x0b, 0x32,
	0x0e, 0x2e, 0x69, 0x64, 0x6d, 0x2e, 0x57, 0x6f, 0x72, 0x6b, 0x73, 0x70, 0x61, 0x63, 0x65, 0x52,
	0x0b, 0x53, 0x68, 0x61, 0x72, 0x65, 0x64, 0x43, 0x65, 0x6c, 0x6c, 0x73, 0x12, 0x31, 0x0a, 0x0e,
	0x42, 0x65, 0x6c, 0x6f, 0x6e, 0x67, 0x73, 0x54, 0x6f, 0x54, 0x65, 0x61, 0x6d, 0x73, 0x18, 0x03,
	0x20, 0x03, 0x28, 0x0b, 0x32, 0x09, 0x2e, 0x69, 0x64, 0x6d, 0x2e, 0x52, 0x6f, 0x6c, 0x65, 0x52,
	0x0e, 0x42, 0x65, 0x6c, 0x6f, 0x6e, 0x67, 0x73, 0x54, 0x6f, 0x54, 0x65, 0x61, 0x6d, 0x73, 0x22,
	0x7a, 0x0a, 0x10, 0x52, 0x65, 0x63, 0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x64, 0x52, 0x65, 0x71, 0x75,
	0x65, 0x73, 0x74, 0x12, 0x18, 0x0a, 0x07, 0x53, 0x65, 0x67, 0x6d, 0x65, 0x6e, 0x74, 0x18, 0x01,
	0x20, 0x01, 0x28, 0x09, 0x52, 0x07, 0x53, 0x65, 0x67, 0x6d, 0x65, 0x6e, 0x74, 0x12, 0x1a, 0x0a,
	0x08, 0x43, 0x61, 0x74, 0x65, 0x67, 0x6f, 0x72, 0x79, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52,
	0x08, 0x43, 0x61, 0x74, 0x65, 0x67, 0x6f, 0x72, 0x79, 0x12, 0x1a, 0x0a, 0x08, 0x4e, 0x65, 0x69,
	0x67, 0x68, 0x62, 0x6f, 0x72, 0x18, 0x03, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08, 0x4e, 0x65, 0x69,
	0x67, 0x68, 0x62, 0x6f, 0x72, 0x12, 0x14, 0x0a, 0x05, 0x4c, 0x69, 0x6d, 0x69, 0x74, 0x18, 0x04,
	0x20, 0x01, 0x28, 0x05, 0x52, 0x05, 0x4c, 0x69, 0x6d, 0x69, 0x74, 0x22, 0x35, 0x0a, 0x11, 0x52,
	0x65, 0x63, 0x6f, 0x6d, 0x6d, 0x65, 0x6e, 0x64, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65,
	0x12, 0x20, 0x0a, 0x05, 0x4e, 0x6f, 0x64, 0x65, 0x73, 0x18, 0x01, 0x20, 0x03, 0x28, 0x0b, 0x32,
	0x0a, 0x2e, 0x74, 0x72, 0x65, 0x65, 0x2e, 0x4e, 0x6f, 0x64, 0x65, 0x52, 0x05, 0x4e, 0x6f, 0x64,
	0x65, 0x73, 0x42, 0x2d, 0x5a, 0x2b, 0x67, 0x69, 0x74, 0x68, 0x75, 0x62, 0x2e, 0x63, 0x6f, 0x6d,
	0x2f, 0x70, 0x79, 0x64, 0x69, 0x6f, 0x2f, 0x63, 0x65, 0x6c, 0x6c, 0x73, 0x2f, 0x76, 0x35, 0x2f,
	0x63, 0x6f, 0x6d, 0x6d, 0x6f, 0x6e, 0x2f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2f, 0x72, 0x65, 0x73,
	0x74, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_cellsapi_graph_proto_rawDescOnce sync.Once
	file_cellsapi_graph_proto_rawDescData = file_cellsapi_graph_proto_rawDesc
)

func file_cellsapi_graph_proto_rawDescGZIP() []byte {
	file_cellsapi_graph_proto_rawDescOnce.Do(func() {
		file_cellsapi_graph_proto_rawDescData = protoimpl.X.CompressGZIP(file_cellsapi_graph_proto_rawDescData)
	})
	return file_cellsapi_graph_proto_rawDescData
}

var file_cellsapi_graph_proto_msgTypes = make([]protoimpl.MessageInfo, 7)
var file_cellsapi_graph_proto_goTypes = []any{
	(*UserStateRequest)(nil),  // 0: rest.UserStateRequest
	(*UserStateResponse)(nil), // 1: rest.UserStateResponse
	(*RelationRequest)(nil),   // 2: rest.RelationRequest
	(*RelationResponse)(nil),  // 3: rest.RelationResponse
	(*RecommendRequest)(nil),  // 4: rest.RecommendRequest
	(*RecommendResponse)(nil), // 5: rest.RecommendResponse
	nil,                       // 6: rest.UserStateResponse.WorkspacesAccessesEntry
	(*idm.Workspace)(nil),     // 7: idm.Workspace
	(*idm.Role)(nil),          // 8: idm.Role
	(*tree.Node)(nil),         // 9: tree.Node
}
var file_cellsapi_graph_proto_depIdxs = []int32{
	7, // 0: rest.UserStateResponse.Workspaces:type_name -> idm.Workspace
	6, // 1: rest.UserStateResponse.WorkspacesAccesses:type_name -> rest.UserStateResponse.WorkspacesAccessesEntry
	7, // 2: rest.RelationResponse.SharedCells:type_name -> idm.Workspace
	8, // 3: rest.RelationResponse.BelongsToTeams:type_name -> idm.Role
	9, // 4: rest.RecommendResponse.Nodes:type_name -> tree.Node
	5, // [5:5] is the sub-list for method output_type
	5, // [5:5] is the sub-list for method input_type
	5, // [5:5] is the sub-list for extension type_name
	5, // [5:5] is the sub-list for extension extendee
	0, // [0:5] is the sub-list for field type_name
}

func init() { file_cellsapi_graph_proto_init() }
func file_cellsapi_graph_proto_init() {
	if File_cellsapi_graph_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_cellsapi_graph_proto_msgTypes[0].Exporter = func(v any, i int) any {
			switch v := v.(*UserStateRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_cellsapi_graph_proto_msgTypes[1].Exporter = func(v any, i int) any {
			switch v := v.(*UserStateResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_cellsapi_graph_proto_msgTypes[2].Exporter = func(v any, i int) any {
			switch v := v.(*RelationRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_cellsapi_graph_proto_msgTypes[3].Exporter = func(v any, i int) any {
			switch v := v.(*RelationResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_cellsapi_graph_proto_msgTypes[4].Exporter = func(v any, i int) any {
			switch v := v.(*RecommendRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_cellsapi_graph_proto_msgTypes[5].Exporter = func(v any, i int) any {
			switch v := v.(*RecommendResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_cellsapi_graph_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   7,
			NumExtensions: 0,
			NumServices:   0,
		},
		GoTypes:           file_cellsapi_graph_proto_goTypes,
		DependencyIndexes: file_cellsapi_graph_proto_depIdxs,
		MessageInfos:      file_cellsapi_graph_proto_msgTypes,
	}.Build()
	File_cellsapi_graph_proto = out.File
	file_cellsapi_graph_proto_rawDesc = nil
	file_cellsapi_graph_proto_goTypes = nil
	file_cellsapi_graph_proto_depIdxs = nil
}

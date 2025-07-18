// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.34.2
// 	protoc        (unknown)
// source: cells-share.proto

package share

import (
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

type ParseRootsRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Nodes       []*tree.Node `protobuf:"bytes,1,rep,name=Nodes,proto3" json:"Nodes,omitempty"`
	CreateEmpty bool         `protobuf:"varint,2,opt,name=CreateEmpty,proto3" json:"CreateEmpty,omitempty"`
	CreateLabel string       `protobuf:"bytes,3,opt,name=CreateLabel,proto3" json:"CreateLabel,omitempty"`
}

func (x *ParseRootsRequest) Reset() {
	*x = ParseRootsRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_cells_share_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ParseRootsRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ParseRootsRequest) ProtoMessage() {}

func (x *ParseRootsRequest) ProtoReflect() protoreflect.Message {
	mi := &file_cells_share_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ParseRootsRequest.ProtoReflect.Descriptor instead.
func (*ParseRootsRequest) Descriptor() ([]byte, []int) {
	return file_cells_share_proto_rawDescGZIP(), []int{0}
}

func (x *ParseRootsRequest) GetNodes() []*tree.Node {
	if x != nil {
		return x.Nodes
	}
	return nil
}

func (x *ParseRootsRequest) GetCreateEmpty() bool {
	if x != nil {
		return x.CreateEmpty
	}
	return false
}

func (x *ParseRootsRequest) GetCreateLabel() string {
	if x != nil {
		return x.CreateLabel
	}
	return ""
}

type ParseRootsResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Nodes []*tree.Node `protobuf:"bytes,1,rep,name=Nodes,proto3" json:"Nodes,omitempty"`
}

func (x *ParseRootsResponse) Reset() {
	*x = ParseRootsResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_cells_share_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ParseRootsResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ParseRootsResponse) ProtoMessage() {}

func (x *ParseRootsResponse) ProtoReflect() protoreflect.Message {
	mi := &file_cells_share_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ParseRootsResponse.ProtoReflect.Descriptor instead.
func (*ParseRootsResponse) Descriptor() ([]byte, []int) {
	return file_cells_share_proto_rawDescGZIP(), []int{1}
}

func (x *ParseRootsResponse) GetNodes() []*tree.Node {
	if x != nil {
		return x.Nodes
	}
	return nil
}

var File_cells_share_proto protoreflect.FileDescriptor

var file_cells_share_proto_rawDesc = []byte{
	0x0a, 0x11, 0x63, 0x65, 0x6c, 0x6c, 0x73, 0x2d, 0x73, 0x68, 0x61, 0x72, 0x65, 0x2e, 0x70, 0x72,
	0x6f, 0x74, 0x6f, 0x12, 0x05, 0x73, 0x68, 0x61, 0x72, 0x65, 0x1a, 0x10, 0x63, 0x65, 0x6c, 0x6c,
	0x73, 0x2d, 0x74, 0x72, 0x65, 0x65, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x22, 0x79, 0x0a, 0x11,
	0x50, 0x61, 0x72, 0x73, 0x65, 0x52, 0x6f, 0x6f, 0x74, 0x73, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73,
	0x74, 0x12, 0x20, 0x0a, 0x05, 0x4e, 0x6f, 0x64, 0x65, 0x73, 0x18, 0x01, 0x20, 0x03, 0x28, 0x0b,
	0x32, 0x0a, 0x2e, 0x74, 0x72, 0x65, 0x65, 0x2e, 0x4e, 0x6f, 0x64, 0x65, 0x52, 0x05, 0x4e, 0x6f,
	0x64, 0x65, 0x73, 0x12, 0x20, 0x0a, 0x0b, 0x43, 0x72, 0x65, 0x61, 0x74, 0x65, 0x45, 0x6d, 0x70,
	0x74, 0x79, 0x18, 0x02, 0x20, 0x01, 0x28, 0x08, 0x52, 0x0b, 0x43, 0x72, 0x65, 0x61, 0x74, 0x65,
	0x45, 0x6d, 0x70, 0x74, 0x79, 0x12, 0x20, 0x0a, 0x0b, 0x43, 0x72, 0x65, 0x61, 0x74, 0x65, 0x4c,
	0x61, 0x62, 0x65, 0x6c, 0x18, 0x03, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0b, 0x43, 0x72, 0x65, 0x61,
	0x74, 0x65, 0x4c, 0x61, 0x62, 0x65, 0x6c, 0x22, 0x36, 0x0a, 0x12, 0x50, 0x61, 0x72, 0x73, 0x65,
	0x52, 0x6f, 0x6f, 0x74, 0x73, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x20, 0x0a,
	0x05, 0x4e, 0x6f, 0x64, 0x65, 0x73, 0x18, 0x01, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x0a, 0x2e, 0x74,
	0x72, 0x65, 0x65, 0x2e, 0x4e, 0x6f, 0x64, 0x65, 0x52, 0x05, 0x4e, 0x6f, 0x64, 0x65, 0x73, 0x32,
	0x53, 0x0a, 0x0c, 0x53, 0x68, 0x61, 0x72, 0x65, 0x53, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x12,
	0x43, 0x0a, 0x0a, 0x50, 0x61, 0x72, 0x73, 0x65, 0x52, 0x6f, 0x6f, 0x74, 0x73, 0x12, 0x18, 0x2e,
	0x73, 0x68, 0x61, 0x72, 0x65, 0x2e, 0x50, 0x61, 0x72, 0x73, 0x65, 0x52, 0x6f, 0x6f, 0x74, 0x73,
	0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a, 0x19, 0x2e, 0x73, 0x68, 0x61, 0x72, 0x65, 0x2e,
	0x50, 0x61, 0x72, 0x73, 0x65, 0x52, 0x6f, 0x6f, 0x74, 0x73, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e,
	0x73, 0x65, 0x22, 0x00, 0x42, 0x2e, 0x5a, 0x2c, 0x67, 0x69, 0x74, 0x68, 0x75, 0x62, 0x2e, 0x63,
	0x6f, 0x6d, 0x2f, 0x70, 0x79, 0x64, 0x69, 0x6f, 0x2f, 0x63, 0x65, 0x6c, 0x6c, 0x73, 0x2f, 0x76,
	0x35, 0x2f, 0x63, 0x6f, 0x6d, 0x6d, 0x6f, 0x6e, 0x2f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2f, 0x73,
	0x68, 0x61, 0x72, 0x65, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_cells_share_proto_rawDescOnce sync.Once
	file_cells_share_proto_rawDescData = file_cells_share_proto_rawDesc
)

func file_cells_share_proto_rawDescGZIP() []byte {
	file_cells_share_proto_rawDescOnce.Do(func() {
		file_cells_share_proto_rawDescData = protoimpl.X.CompressGZIP(file_cells_share_proto_rawDescData)
	})
	return file_cells_share_proto_rawDescData
}

var file_cells_share_proto_msgTypes = make([]protoimpl.MessageInfo, 2)
var file_cells_share_proto_goTypes = []any{
	(*ParseRootsRequest)(nil),  // 0: share.ParseRootsRequest
	(*ParseRootsResponse)(nil), // 1: share.ParseRootsResponse
	(*tree.Node)(nil),          // 2: tree.Node
}
var file_cells_share_proto_depIdxs = []int32{
	2, // 0: share.ParseRootsRequest.Nodes:type_name -> tree.Node
	2, // 1: share.ParseRootsResponse.Nodes:type_name -> tree.Node
	0, // 2: share.ShareService.ParseRoots:input_type -> share.ParseRootsRequest
	1, // 3: share.ShareService.ParseRoots:output_type -> share.ParseRootsResponse
	3, // [3:4] is the sub-list for method output_type
	2, // [2:3] is the sub-list for method input_type
	2, // [2:2] is the sub-list for extension type_name
	2, // [2:2] is the sub-list for extension extendee
	0, // [0:2] is the sub-list for field type_name
}

func init() { file_cells_share_proto_init() }
func file_cells_share_proto_init() {
	if File_cells_share_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_cells_share_proto_msgTypes[0].Exporter = func(v any, i int) any {
			switch v := v.(*ParseRootsRequest); i {
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
		file_cells_share_proto_msgTypes[1].Exporter = func(v any, i int) any {
			switch v := v.(*ParseRootsResponse); i {
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
			RawDescriptor: file_cells_share_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   2,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_cells_share_proto_goTypes,
		DependencyIndexes: file_cells_share_proto_depIdxs,
		MessageInfos:      file_cells_share_proto_msgTypes,
	}.Build()
	File_cells_share_proto = out.File
	file_cells_share_proto_rawDesc = nil
	file_cells_share_proto_goTypes = nil
	file_cells_share_proto_depIdxs = nil
}

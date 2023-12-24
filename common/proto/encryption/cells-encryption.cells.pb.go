package encryption

import (
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type NodeKeyORM struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	NodeId  string `gorm:"column:node_id;"`
	UserId  string `gorm:"column:user_id;"`
	OwnerId string `gorm:"column:owner_id;"`
	KeyData []byte `gorm:"column:key_data;"`
}

type NodeORM struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	NodeId string `gorm:"column:node_id;"`
	Legacy bool   `gorm:"column:legacy;"`
}

type RangedBlockORM struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	OwnerId    string `gorm:"column:owner;"`
	PartId     uint32 `gorm:"column:part_id;"`
	SeqStart   uint32 `gorm:"column:seq_start;"`
	SeqEnd     uint32 `gorm:"column:seq_end;"`
	HeaderSize uint32 `gorm:"column:block_header_size;"`
	BlockSize  uint32 `gorm:"column:block_data_size;"`
	NodeId     string `gorm:"column:node_id;"`
	Nonce      []byte `gorm:"column:nonce;"`
}

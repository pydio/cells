package service

import (
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type ResourcePolicyORM struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Id             int64                       `gorm:"column:id;"`
	Resource       string                      `gorm:"column:resource;"`
	Action         ResourcePolicyAction        `gorm:"column:action;"`
	Subject        string                      `gorm:"column:subject;"`
	Effect         ResourcePolicy_PolicyEffect `gorm:"column:effect;"`
	JsonConditions string                      `gorm:"column:conditions;"`
}

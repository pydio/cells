// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.1.0
// - protoc             (unknown)
// source: cells-storage.proto

package storage

import (
	context "context"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
	sync "sync"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.32.0 or later.
const _ = grpc.SupportPackageIsVersion7

var (
	enhancedStorageEndpointServers     = make(map[string]StorageEndpointEnhancedServer)
	enhancedStorageEndpointServersLock = sync.RWMutex{}
)

type idStorageEndpointServer interface {
	ID() string
}
type StorageEndpointEnhancedServer interface {
	StorageEndpointServer
	AddFilter(func(context.Context, interface{}) bool)
	addHandler(StorageEndpointServer)
	filter(context.Context) []StorageEndpointServer
}
type StorageEndpointEnhancedServerImpl struct {
	filters  []func(context.Context, interface{}) bool
	handlers []StorageEndpointServer
}

func (m *StorageEndpointEnhancedServerImpl) AddFilter(f func(context.Context, interface{}) bool) {
	m.filters = append(m.filters, f)
}
func (m *StorageEndpointEnhancedServerImpl) addHandler(srv StorageEndpointServer) {
	m.handlers = append(m.handlers, srv)
}
func (m *StorageEndpointEnhancedServerImpl) filter(ctx context.Context) []StorageEndpointServer {
	var ret []StorageEndpointServer
	for _, i := range m.handlers {
		valid := true
		for _, filter := range m.filters {
			if !filter(ctx, i) {
				valid = false
				break
			}
			if valid {
				ret = append(ret, i)
			}
		}
	}
	return ret
}

func (m *StorageEndpointEnhancedServerImpl) Propose(ctx context.Context, r *ProposeRequest) (*ProposeResponse, error) {
	for _, handler := range m.filter(ctx) {
		return handler.Propose(ctx, r)
	}
	return nil, status.Errorf(codes.Unimplemented, "method Propose not implemented")
}

func (m *StorageEndpointEnhancedServerImpl) Lookup(ctx context.Context, r *LookupRequest) (*LookupResponse, error) {
	for _, handler := range m.filter(ctx) {
		return handler.Lookup(ctx, r)
	}
	return nil, status.Errorf(codes.Unimplemented, "method Lookup not implemented")
}
func (m *StorageEndpointEnhancedServerImpl) mustEmbedUnimplementedStorageEndpointServer() {}
func RegisterStorageEndpointEnhancedServer(s grpc.ServiceRegistrar, srv StorageEndpointServer) {
	idServer, ok := s.(idStorageEndpointServer)
	if ok {
		enhancedStorageEndpointServersLock.Lock()
		defer enhancedStorageEndpointServersLock.Unlock()
		instance, ok := enhancedStorageEndpointServers[idServer.ID()]
		if !ok {
			instance = &StorageEndpointEnhancedServerImpl{}
			enhancedStorageEndpointServers[idServer.ID()] = instance
		}
		instance.addHandler(srv)
		RegisterStorageEndpointServer(s, instance)
	} else {
		RegisterStorageEndpointServer(s, srv)
	}
}

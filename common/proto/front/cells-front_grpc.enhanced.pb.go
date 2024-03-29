// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.1.0
// - protoc             v3.18.1
// source: cells-front.proto

package front

import (
	context "context"
	fmt "fmt"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	metadata "google.golang.org/grpc/metadata"
	status "google.golang.org/grpc/status"
	sync "sync"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.32.0 or later.
const _ = grpc.SupportPackageIsVersion7

var (
	enhancedManifestServiceServers     = make(map[string]ManifestServiceEnhancedServer)
	enhancedManifestServiceServersLock = sync.RWMutex{}
)

type NamedManifestServiceServer interface {
	ManifestServiceServer
	Name() string
}
type ManifestServiceEnhancedServer map[string]NamedManifestServiceServer

func (m ManifestServiceEnhancedServer) ExposedParameters(ctx context.Context, r *ExposedParametersRequest) (*ExposedParametersResponse, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok || len(md.Get("targetname")) == 0 {
		return nil, status.Errorf(codes.FailedPrecondition, "method ExposedParameters should have a context")
	}
	enhancedManifestServiceServersLock.RLock()
	defer enhancedManifestServiceServersLock.RUnlock()
	for _, mm := range m {
		if mm.Name() == md.Get("targetname")[0] {
			return mm.ExposedParameters(ctx, r)
		}
	}
	return nil, status.Errorf(codes.Unimplemented, "method ExposedParameters not implemented")
}
func (m ManifestServiceEnhancedServer) mustEmbedUnimplementedManifestServiceServer() {}
func RegisterManifestServiceEnhancedServer(s grpc.ServiceRegistrar, srv NamedManifestServiceServer) {
	enhancedManifestServiceServersLock.Lock()
	defer enhancedManifestServiceServersLock.Unlock()
	addr := fmt.Sprintf("%p", s)
	m, ok := enhancedManifestServiceServers[addr]
	if !ok {
		m = ManifestServiceEnhancedServer{}
		enhancedManifestServiceServers[addr] = m
		RegisterManifestServiceServer(s, m)
	}
	m[srv.Name()] = srv
}
func DeregisterManifestServiceEnhancedServer(s grpc.ServiceRegistrar, name string) {
	enhancedManifestServiceServersLock.Lock()
	defer enhancedManifestServiceServersLock.Unlock()
	addr := fmt.Sprintf("%p", s)
	m, ok := enhancedManifestServiceServers[addr]
	if !ok {
		return
	}
	delete(m, name)
}

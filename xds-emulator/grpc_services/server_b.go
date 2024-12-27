package main

import (
	"context"
	"fmt"
	"google.golang.org/grpc/reflection"
	"google.golang.org/grpc/xds"
	"log"
	"net"

	pb "example.com/xds-emulator/grpc_services"
)

type serverB struct {
	pb.UnimplementedHelloServiceServer
}

func (s *serverB) SayHello(ctx context.Context, req *pb.HelloRequest) (*pb.HelloResponse, error) {
	return &pb.HelloResponse{Message: fmt.Sprintf("Hello from Server B, %s!", req.Name)}, nil
}

func main() {
	lis, err := net.Listen("tcp", ":50052")
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	s, err := xds.NewGRPCServer()
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	pb.RegisterHelloServiceServer(s, &serverB{})
	reflection.Register(s)
	log.Println("Server B is listening on port 50052")
	if err := s.Serve(lis); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}

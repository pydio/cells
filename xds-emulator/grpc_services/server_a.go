package main

import (
	"context"
	"fmt"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
	"log"
	"net"

	pb "example.com/xds-emulator/grpc_services"
)

type serverA struct {
	pb.UnimplementedHelloServiceServer
}

func (s *serverA) SayHello(ctx context.Context, req *pb.HelloRequest) (*pb.HelloResponse, error) {
	return &pb.HelloResponse{Message: fmt.Sprintf("Hello from Server A, %s!", req.Name)}, nil
}

func main() {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	//s, err := xds.NewGRPCServer()
	//if err != nil {
	//	log.Fatalf("Failed to listen: %v", err)
	//}

	s := grpc.NewServer()
	
	pb.RegisterHelloServiceServer(s, &serverA{})
	reflection.Register(s)
	log.Println("Server A is listening on port 50051")
	if err := s.Serve(lis); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}

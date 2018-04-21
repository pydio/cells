#!/bin/bash

protoc -I$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis \
       -I$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway \
       -I$GOPATH/src/github.com/google/protobuf/src \
       -I$GOPATH/src/github.com/golang/protobuf \
       -I$GOPATH/src \
       -I. \
       --swagger_out=. rest.proto

protoc -I$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis \
       -I$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway \
       -I$GOPATH/src/github.com/google/protobuf/src \
       -I$GOPATH/src/github.com/golang/protobuf \
       -I$GOPATH/src \
       -I. \
       --go_out=plugins=micro:. *.proto

go run cmd/main.go
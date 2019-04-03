#!/usr/bin/env bash

cd $1

protoc -I$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis \
       -I$GOPATH/src/github.com/google/protobuf/src \
       -I$GOPATH/src \
       -I. \
       --go_out=. \
       --micro_out=. \
       --govalidators_out=. \
       *.proto

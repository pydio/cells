#!/usr/bin/env bash

cd $1

protoc -I$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis \
       -I$GOPATH/src/github.com/google/protobuf/src \
       -I$GOPATH/src \
       -I. \
       --go_out=. \
       --go_out=plugins=grpc:$GOPATH/src/github.com/pydio/cells-client/grpc/proto/$1 \
       --micro_out=. \
       --govalidators_out=. \
       *.proto


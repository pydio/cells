#!/usr/bin/env bash

#
# Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
# This file is part of Pydio Cells.
#
# Pydio Cells is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Pydio Cells is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
#
# The latest code can be found at <https://pydio.com>.
#

if [ ! -d "./bin" ]
then
  mkdir -p ./bin
  export GOBIN=$PWD/bin
  export PATH=$GOBIN:$PATH
  go install google.golang.org/protobuf/cmd/protoc-gen-go
  go install google.golang.org/grpc/cmd/protoc-gen-go-grpc
  go install github.com/pydio/cells/cmd/protoc-gen-go-enhanced-grpc@main
  go install github.com/pydio/cells/cmd/protoc-gen-go-client-stub@main
  go install github.com/pydio/cells/cmd/protoc-gen-go-tags
  go install github.com/pydio/cells/cmd/protoc-gen-go-setter
  go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-grpc-gateway
  go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-openapiv2
  go install github.com/mwitkow/go-proto-validators/protoc-gen-govalidators
else
  export GOBIN=$PWD/bin
  export PATH=$GOBIN:$PATH
fi

cd $1

echo "Generate protobufs for $1"
buf generate --output .
if [ -f  "buf.gen.tag.yaml" ]; then
  buf generate --template=buf.gen.tag.yaml --output .
fi
#go run ../patch-imports.go

if [ $1 == "rest" ]
then
  echo "Generate OpenAPIv2 JSON specification"
  buf generate --path cellsapi-rest.proto --template buf.openapi.yaml
  go run cmd/main.go
fi

cd -

#!/bin/bash

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

[ -z "$BRANCH_PATH" ] && BRANCH_PATH=$GOPATH
[ -z "$MODULE_SRC_PATH" ] && MODULE_SRC_PATH=~/Sources/cells-sdk-js/src

protoc -I$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis \
       -I$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway \
       -I$GOPATH/src/github.com/google/protobuf/src \
       -I$GOPATH/src/github.com/golang/protobuf \
       -I$BRANCH_PATH/src \
       -I. \
       --swagger_out=. rest.proto

protoc -I$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis \
       -I$GOPATH/src/github.com/grpc-ecosystem/grpc-gateway \
       -I$GOPATH/src/github.com/google/protobuf/src \
       -I$GOPATH/src/github.com/golang/protobuf \
       -I$BRANCH_PATH/src \
       -I. \
       --govalidators_out=. \
       --go_out=plugins=micro:. *.proto

go run cmd/main.go


echo "Generating Javascript client"

swagger-codegen generate -i $BRANCH_PATH/src/github.com/pydio/cells/common/proto/rest/rest.swagger.json -l javascript -c swagger-jsclient.json -o /tmp/js-client
rm -rf $MODULE_SRC_PATH
mv /tmp/js-client/src $MODULE_SRC_PATH

echo "GIT: Revert cyclic models and add new ones"

cd $MODULE_SRC_PATH
git checkout -- model/ActivityObject.js
git checkout -- model/JobsAction.js
git checkout -- model/RestTemplateNode.js
git checkout -- model/ProtobufAny.js
git add .
cd -
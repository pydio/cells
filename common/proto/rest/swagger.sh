#!/bin/bash

[ -z "$BRANCH_PATH" ] && BRANCH_PATH=$GOPATH

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
       --go_out=plugins=micro:. *.proto

go run cmd/main.go


echo "Generating Javascript client"

swagger-codegen generate -i $BRANCH_PATH/src/github.com/pydio/cells/common/proto/rest/rest.swagger.json -l javascript -c swagger-jsclient.json -o /tmp/js-client
rm -rf $BRANCH_PATH/src/github.com/pydio/cells/frontend/front-srv/assets/gui.ajax/res/js/core/http/gen
mv /tmp/js-client/src $BRANCH_PATH/src/github.com/pydio/cells/frontend/front-srv/assets/gui.ajax/res/js/core/http/gen

echo "GIT: Revert cyclic models and add new ones"

git checkout -- $BRANCH_PATH/src/github.com/pydio/cells/frontend/front-srv/assets/gui.ajax/res/js/core/http/gen/model/ActivityObject.js
git checkout -- $BRANCH_PATH/src/github.com/pydio/cells/frontend/front-srv/assets/gui.ajax/res/js/core/http/gen/model/JobsAction.js
git checkout -- $BRANCH_PATH/src/github.com/pydio/cells/frontend/front-srv/assets/gui.ajax/res/js/core/http/gen/model/RestTemplateNode.js
git add $BRANCH_PATH/src/github.com/pydio/cells/frontend/front-srv/assets/gui.ajax/res/js/core/http/gen
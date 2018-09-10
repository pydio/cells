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


echo "Generating Javascript client"

swagger-codegen generate -i $GOPATH/src/github.com/pydio/cells/common/proto/rest/rest.swagger.json -l javascript -c swagger-jsclient.json -o /tmp/js-client
rm -rf $GOPATH/src/github.com/pydio/cells/frontend/front-srv/assets/gui.ajax/res/js/core/http/gen
mv /tmp/js-client/src $GOPATH/src/github.com/pydio/cells/frontend/front-srv/assets/gui.ajax/res/js/core/http/gen

echo "GIT: Revert cyclic models and add new ones"

git checkout -- $GOPATH/src/github.com/pydio/cells/frontend/front-srv/assets/gui.ajax/res/js/core/http/gen/model/ActivityObject.js
git checkout -- $GOPATH/src/github.com/pydio/cells/frontend/front-srv/assets/gui.ajax/res/js/core/http/gen/model/JobsAction.js
git add $GOPATH/src/github.com/pydio/cells/frontend/front-srv/assets/gui.ajax/res/js/core/http/gen
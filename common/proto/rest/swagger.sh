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

echo "Generating Javascript client"

/usr/local/bin/openapi-generator generate -i $BRANCH_PATH/src/github.com/pydio/cells/common/proto/rest/cellsapi-rest.swagger.json -g javascript -c swagger-jsclient.json -o /tmp/js-client
rm -rf $MODULE_SRC_PATH
mv /tmp/js-client/src $MODULE_SRC_PATH

echo "GIT: Revert cyclic models and add new ones"

cd $MODULE_SRC_PATH
git checkout -- model/ProtobufAny.js
git add .
cd -
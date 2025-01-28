#!/bin/bash

#
# Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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
if [[ -n "${GENERATE_SDKS_V2}" ]]; then

#  echo "Generate TS version with fetch"
#  openapi-generator generate -i ./cellsapi-rest-v2.swagger.json -g typescript-fetch -o $GENERATE_SDKS_V2/cells-sdk-ts/fetch

  echo "Generate TS version with axios"

  openapi-generator generate -i ./cellsapi-rest-v2.swagger.json -g typescript-axios -c swagger-ts-axios.json -o $GENERATE_SDKS_V2/cells-sdk-ts

  echo "Generate Swift version"

  openapi-generator generate -i ./cellsapi-rest-v2.swagger.json -g swift6 -c swagger-swift.json -o $GENERATE_SDKS_V2/cells-sdk-swift

  echo "Generate Swift Classes version"

  openapi-generator generate -i ./cellsapi-rest-v2.swagger.json -g swift6 -c swagger-swift-classes.json -o $GENERATE_SDKS_V2/cells-sdk-swift-classes

echo "Patching Swift ActivityObject Struct as Sendable Class"

  mv $GENERATE_SDKS_V2/cells-sdk-swift-classes/Sources/CellsSDK/Models/ActivityObject.swift $GENERATE_SDKS_V2/cells-sdk-swift/Sources/CellsSDK/Models/ActivityObject.swift
  rm -r $GENERATE_SDKS_V2/cells-sdk-swift-classes
  # Cross-platform version
  sed -i.bak -e 's/Hashable/Hashable, Sendable/g' -e 's/public var/public let/g' $GENERATE_SDKS_V2/cells-sdk-swift/Sources/CellsSDK/Models/ActivityObject.swift && rm -f $GENERATE_SDKS_V2/cells-sdk-swift/Sources/CellsSDK/Models/ActivityObject.swift.bak



else

  echo "Skipping SDK v2 generation - Use GENERATE_SDKS_V2 flag to generate TS and Swift"

fi;


if [[ -n "${GENERATE_SDKS_V1}" ]]; then

  echo "Generate Javascript version"
  [ -z "$BRANCH_PATH" ] && BRANCH_PATH=$GOPATH
  [ -z "$MODULE_SRC_PATH" ] && MODULE_SRC_PATH=~/Sources/cells-sdk-js/src

  openapi-generator generate -i $BRANCH_PATH/src/github.com/pydio/cells/common/proto/rest/cellsapi-rest.swagger.json -g javascript -c swagger-jsclient.json -o /tmp/js-client
  rm -rf $MODULE_SRC_PATH
  mv /tmp/js-client/src $MODULE_SRC_PATH

  echo "GIT: Revert cyclic models and add new ones"

  cd $MODULE_SRC_PATH || exit
  git checkout -- model/ProtobufAny.js
  git add .
  cd -  || exit
else

  echo "Skipping SDK v1 generation - Use GENERATE_SDKS_V1 flag to generate v1 Javascript client"

fi;

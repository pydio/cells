DEV_VERSION=4.0.0-dev
ENV=env GOOS=linux
TODAY:=$(shell date -u +%Y-%m-%dT%H:%M:%S)
TIMESTAMP:=$(shell date -u +%Y%m%d%H%M%S)
GITREV:=$(shell git rev-parse HEAD)
CELLS_VERSION?=${DEV_VERSION}.${TIMESTAMP}

XGO_TARGETS?="linux/amd64,linux/arm64,darwin/amd64,windows/amd64"
#XGO_IMAGE?=pydio/xgo:latest
XGO_IMAGE?=techknowlogick/xgo:go-1.16.x
XGO_BIN?=${GOPATH}/bin/xgo

.PHONY: all clean build main dev

all: clean build

build: main

main:
	go build -a -trimpath\
	 -ldflags "-X github.com/pydio/cells/v4/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/v4/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/v4/common.BuildRevision=${GITREV}"\
	 -o cells\
	 .

xgo:
	GO111MODULE=auto ${XGO_BIN} -go 1.16 \
	 --image ${XGO_IMAGE} \
	 --targets ${XGO_TARGETS} \
	 -ldflags "-X github.com/pydio/cells/v4/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/common.BuildRevision=${GITREV}"\
	 .

win:
	env GOOS=windows GOARCH=amd64 go build -a -trimpath\
	 -ldflags "-X github.com/pydio/cells/v4/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/v4/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/v4/common.BuildRevision=${GITREV}"\
	 -o cells.exe\
	 .

dev:
	go build\
	 -tags dev\
	 -gcflags "all=-N -l"\
	 -ldflags "-X github.com/pydio/cells/v4/common.version=${DEV_VERSION}\
	 -X github.com/pydio/cells/v4/common.BuildStamp=2022-01-01T00:00:00\
	 -X github.com/pydio/cells/v4/common.BuildRevision=dev\
	 -X github.com/pydio/cells/v4/common.LogFileDefaultValue=false\
	 -X google.golang.org/protobuf/reflect/protoregistry.conflictPolicy=warn"\
	 -o cells\
	 .

start:
	./cells start

ds: dev start

clean:
	rm -f cells cells-*
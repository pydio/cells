DEV_VERSION=4.4.14-dev
ENV=env GOOS=linux
TODAY:=$(shell date -u +%Y-%m-%dT%H:%M:%S)
TIMESTAMP:=$(shell date -u +%Y%m%d%H%M%S)
GITREV?=$(shell git rev-parse HEAD)
CELLS_VERSION?=${DEV_VERSION}.${TIMESTAMP}
GOBIN?=go

.PHONY: all clean build main dev

all: clean build

build: main

main:
	env CGO_ENABLED=0 ${GOBIN} build -a -trimpath\
	 -ldflags "-X github.com/pydio/cells/v4/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/v4/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/v4/common.BuildRevision=${GITREV}"\
	 -o cells\
	 .

arm:
	env CGO_ENABLED=0 GOOS=linux GOARM=7 GOARCH=arm ${GOBIN} build -a -trimpath\
	 -ldflags "-X github.com/pydio/cells/v4/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/v4/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/v4/common.BuildRevision=${GITREV}"\
	 -o cells\
	 .

arm64:
	env CGO_ENABLED=0 GOOS=linux GOARCH=arm64 ${GOBIN} build -a -trimpath\
	 -ldflags "-X github.com/pydio/cells/v4/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/v4/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/v4/common.BuildRevision=${GITREV}"\
	 -o cells\
	 .

darwin:
	env CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 ${GOBIN} build -a -trimpath\
	 -ldflags "-X github.com/pydio/cells/v4/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/v4/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/v4/common.BuildRevision=${GITREV}"\
	 -o cells\
	 .

win:
	env CGO_ENABLED=0 GOOS=windows GOARCH=amd64 ${GOBIN} build -a -trimpath\
	 -ldflags "-X github.com/pydio/cells/v4/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/v4/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/v4/common.BuildRevision=${GITREV}"\
	 -o cells.exe\
	 .

dev:
	env CGO_ENABLED=0 ${GOBIN} build\
	 -tags dev\
	 -gcflags "all=-N -l"\
	 -ldflags "-X github.com/pydio/cells/v4/common.version=${DEV_VERSION}\
	 -X github.com/pydio/cells/v4/common.BuildStamp=2022-01-01T00:00:00\
	 -X github.com/pydio/cells/v4/common.BuildRevision=dev\
	 -X github.com/pydio/cells/v4/common.LogFileDefaultValue=false\
	 -X google.golang.org/protobuf/reflect/protoregistry.conflictPolicy=warn"\
	 -o cells\
	 .

docker:
	GOARCH=amd64 GOOS=linux ${GOBIN} build -trimpath\
	 -ldflags "-X github.com/pydio/cells/v4/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/v4/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/v4/common.BuildRevision=${GITREV}"\
	 -o cells-linux\
	 .

dockercp:
	docker stop ${CONTAINER}; docker cp ./cells-linux ${CONTAINER}:/bin/cells; docker start ${CONTAINER}

#//// to be removed ?
#thirtytwo:
#	GOARCH=386 GOOS=linux ${GOBIN} build -trimpath\
#	 -ldflags "-X github.com/pydio/cells/v4/common.version=${CELLS_VERSION}\
#	 -X github.com/pydio/cells/v4/common.BuildStamp=${TODAY}\
#	 -X github.com/pydio/cells/v4/common.BuildRevision=${GITREV}"\
#	 -o cells-32bits\
#	 .

start:
	./cells start

ds: dev start

licenses:
	go-licenses report . --template ${GOPATH}/src/github.com/google/go-licenses/testdata/modules/hello01/licenses.tpl > DEPENDENCIES

clean:
	rm -f cells cells-*
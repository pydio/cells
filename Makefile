DEV_VERSION=5.0.3-dev
ENV=env GOOS=linux
TODAY:=$(shell date -u +%Y-%m-%dT%H:%M:%S)
TIMESTAMP:=$(shell date -u +%Y%m%d%H%M%S)
GITREV?=$(shell git rev-parse HEAD)
CELLS_VERSION?=${DEV_VERSION}.${TIMESTAMP}
GOBIN?=go
# Set FORCE_REBUILD=1 to pass -a and rebuild packages instead of reusing Go's build cache.
FORCE_REBUILD ?=
REBUILD_FLAGS := $(if $(FORCE_REBUILD),-a,)
GO_BUILD_FLAGS := $(REBUILD_FLAGS) -trimpath

.PHONY: all clean build main dev darwin arm win docker docker-image start ds licenses

GO_TOOLCHAIN := $(shell awk '/^toolchain/ {sub("go","",$$2); print $$2}' go.mod)
DOCKER_IMAGE ?= pydio/cells
DOCKER_TAG ?= $(CELLS_VERSION)
DOCKER_ENTRYPOINT_SRC_DIR ?= ./tools/docker/images/cells

## Historic Aliases

all: clean main

build: main

main: linux-amd64

darwin: darwin-arm64

arm64: linux-arm64

arm: linux-arm

win: windows-amd64

## Standard names

linux-amd64:
	env CGO_ENABLED=0 ${GOBIN} build $(GO_BUILD_FLAGS)\
	 -ldflags "-X github.com/pydio/cells/v5/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/v5/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/v5/common.BuildRevision=${GITREV}"\
	 -o cells\
	 .

linux-arm64:
	env CGO_ENABLED=0 GOOS=linux GOARCH=arm64 ${GOBIN} build $(GO_BUILD_FLAGS)\
	 -ldflags "-X github.com/pydio/cells/v5/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/v5/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/v5/common.BuildRevision=${GITREV}"\
	 -o cells\
	 .

linux-arm:
	env CGO_ENABLED=0 GOOS=linux GOARM=7 GOARCH=arm ${GOBIN} build $(GO_BUILD_FLAGS)\
	 -ldflags "-X github.com/pydio/cells/v5/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/v5/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/v5/common.BuildRevision=${GITREV}"\
	 -o cells\
	 .

darwin-arm64:
	env CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 ${GOBIN} build $(GO_BUILD_FLAGS)\
	 -ldflags "-X github.com/pydio/cells/v5/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/v5/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/v5/common.BuildRevision=${GITREV}"\
	 -o cells\
	 .

darwin-amd64:
	env CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 ${GOBIN} build $(GO_BUILD_FLAGS)\
	 -ldflags "-X github.com/pydio/cells/v5/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/v5/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/v5/common.BuildRevision=${GITREV}"\
	 -o cells\
	 .

windows-amd64:
	env CGO_ENABLED=0 GOOS=windows GOARCH=amd64 ${GOBIN} build $(GO_BUILD_FLAGS)\
	 -ldflags "-X github.com/pydio/cells/v5/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/v5/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/v5/common.BuildRevision=${GITREV}"\
	 -o cells.exe\
	 .

dev:
	env CGO_ENABLED=0 ${GOBIN} build\
	 -tags dev\
	 -gcflags "all=-N -l"\
	 -ldflags "-X github.com/pydio/cells/v5/common.version=${DEV_VERSION}\
	 -X github.com/pydio/cells/v5/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/v5/common.BuildRevision=dev\
	 -X github.com/pydio/cells/v5/common.LogFileDefaultValue=false\
	 -X google.golang.org/protobuf/reflect/protoregistry.conflictPolicy=warn"\
	 -o cells\
	 .

docker:
	GOARCH=amd64 GOOS=linux ${GOBIN} build -trimpath\
	 -ldflags "-X github.com/pydio/cells/v5/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/v5/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/v5/common.BuildRevision=${GITREV}"\
	 -o cells-linux\
	 .

dockercp:
	docker stop ${CONTAINER}; docker cp ./cells-linux ${CONTAINER}:/bin/cells; docker start ${CONTAINER}

docker-image-compile:
	docker buildx build \
	 --build-arg BUILD_MODE=compile \
	 --build-arg GO_VERSION=$(GO_TOOLCHAIN) \
	 --build-arg VERSION=$(CELLS_VERSION) \
	 --build-arg GIT_REV=$(GITREV) \
	 --build-arg BUILD_STAMP=$(TODAY) \
	 --build-arg DOCKER_ENTRYPOINT_SRC_DIR=$(DOCKER_ENTRYPOINT_SRC_DIR) \
	 -f tools/docker/images/cells/buildx-dockerfile \
	 -t $(DOCKER_IMAGE):$(DOCKER_TAG) \
         --load \
	 .

docker-image-local:
	docker buildx build \
	 --build-arg BUILD_MODE=local \
	 --build-arg DOCKER_ENTRYPOINT_SRC_DIR=$(DOCKER_ENTRYPOINT_SRC_DIR) \
	 -f tools/docker/images/cells/buildx-dockerfile \
	 -t $(DOCKER_IMAGE):$(DOCKER_TAG) \
	 --load \
	 .

docker-image-download:
	docker buildx build \
	 --build-arg BUILD_MODE=download \
	 --build-arg VERSION=$(CELLS_VERSION) \
	 --build-arg DOCKER_ENTRYPOINT_SRC_DIR=$(DOCKER_ENTRYPOINT_SRC_DIR) \
	 -f tools/docker/images/cells/buildx-dockerfile \
	 -t $(DOCKER_IMAGE):$(DOCKER_TAG) \
	 --load \
	 .

start:
	./cells start

ds: dev start

licenses:
	go-licenses report . --template ${GOPATH}/src/github.com/google/go-licenses/testdata/modules/hello01/licenses.tpl > DEPENDENCIES

clean:
	rm -f cells cells-*

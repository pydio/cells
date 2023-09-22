DEV_VERSION=4.2.8-dev
TODAY:=$(shell date -u +%Y-%m-%dT%H:%M:%S)
TIMESTAMP:=$(shell date -u +%Y%m%d%H%M%S)
GITREV?=$(shell git rev-parse HEAD)
CELLS_VERSION?=${DEV_VERSION}.${TIMESTAMP}
GOBIN?=go

main:
	${GOBIN} build -a -trimpath\
	 -ldflags "-X github.com/pydio/cells-fuse/vars.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells-fuse/vars.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells-fuse/vars.BuildRevision=${GITREV}"\
	 -o cells-fuse .

dev:
	${GOBIN} build \
	 -ldflags "-X github.com/pydio/cells-fuse/vars.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells-fuse/vars.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells-fuse/vars.BuildRevision=${GITREV}"\
	 -o cells-fuse .

DEV_VERSION=3.0.0-dev
ENV=env GOOS=linux
TODAY:=$(shell date -u +%Y-%m-%dT%H:%M:%S)
TIMESTAMP:=$(shell date -u +%Y%m%d%H%M%S)
GITREV:=$(shell git rev-parse HEAD)
CELLS_VERSION?="${DEV_VERSION}.${TIMESTAMP}"

XGO_TARGETS?="linux/amd64,darwin/amd64,windows/amd64"
XGO_IMAGE?=pydio/xgo:latest

.PHONY: all clean build main dev

all: clean build

build: generate main

generate:
	# Removing existing packr files and running packr
	find . -name *-packr.go | xargs rm -f
	# manually filtering out ory/x/dbal package
	grep -ri --exclude-dir=vendor/* --exclude-dir=frontend/front-srv/assets/* -l "packr.NewBox" */* | while read -r line; do if ! [ "$$line" = "vendor/github.com/ory/x/dbal/migrate.go" ]; then cd `dirname "$$line"`; echo "Run packr for $$line"; ${GOPATH}/bin/packr --compress --input=. ; cd -;  fi; done;

main:
	go build -a -trimpath\
	 -ldflags "-X github.com/pydio/cells/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/common.BuildRevision=${GITREV}\
	 -X github.com/pydio/cells/vendor/github.com/pydio/minio-srv/cmd.Version=${GITREV}\
	 -X github.com/pydio/cells/vendor/github.com/pydio/minio-srv/cmd.ReleaseTag=${GITREV}"\
	 -o cells\
	 .

xgo:
	${GOPATH}/bin/xgo -go 1.15 \
	 --image ${XGO_IMAGE} \
	 --targets ${XGO_TARGETS} \
	 -ldflags "-X github.com/pydio/cells/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/common.BuildRevision=${GITREV}\
	 -X github.com/pydio/cells/vendor/github.com/pydio/minio-srv/cmd.Version=${GITREV}\
	 -X github.com/pydio/cells/vendor/github.com/pydio/minio-srv/cmd.ReleaseTag=${GITREV}"\
	 ${GOPATH}/src/github.com/pydio/cells

dev:
	go build\
	 -tags dev\
         -gcflags "all=-N -l"\
	 -ldflags "-X github.com/pydio/cells/common.version=${DEV_VERSION}\
	 -X github.com/pydio/cells/common.BuildStamp=2018-01-01T00:00:00\
	 -X github.com/pydio/cells/common.BuildRevision=dev\
	 -X github.com/pydio/cells/common.LogFileDefaultValue=false"\
	 -o cells\
	 .

start:
	./cells start

ds: dev start

clean:
	rm -f cells cells-*
	${GOPATH}/bin/packr clean

vdrminio:
	${GOPATH}/bin/govendor update github.com/pydio/minio-srv
	rm -rf vendor/github.com/pydio/minio-srv/vendor/golang.org/x/net/trace

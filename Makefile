GOBUILD=go build
ENV=env GOOS=linux
TODAY=`date -u +%Y-%m-%dT%H:%M:%S`
GITREV=`git rev-parse HEAD`

.PHONY: all clean build front main client static

all: clean build

build: generate main

generate:
	# Removing existing packr files and running packr
	find . -name *-packr.go | xargs rm -f
	grep -ri -l "packr.NewBox" */* | while read -r line; do cd `dirname "$$line"`; echo "Run packr for $$line" ; ${GOPATH}/bin/packr --compress --input=. ; cd -; done

main:
	go build -a\
	 -ldflags "-X github.com/pydio/cells/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/common.BuildRevision=${GITREV}\
	 -X github.com/pydio/cells/vendor/github.com/pydio/minio-srv/cmd.Version=${GITREV}\
	 -X github.com/pydio/cells/vendor/github.com/pydio/minio-srv/cmd.ReleaseTag=${GITREV}"\
	 -o cells\
	 .

xgo:
	${GOPATH}/bin/xgo -go 1.12 \
	--targets linux/amd64,darwin/amd64 \
	 -ldflags "-X github.com/pydio/cells/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/common.BuildStamp=${TODAY}\
	 -X github.com/pydio/cells/common.BuildRevision=${GITREV}\
	 -X github.com/pydio/cells/vendor/github.com/pydio/minio-srv/cmd.Version=${GITREV}\
	 -X github.com/pydio/cells/vendor/github.com/pydio/minio-srv/cmd.ReleaseTag=${GITREV}"\
	 ${GOPATH}/src/github.com/pydio/cells

dev:
	go build\
	 -tags dev\
	 -ldflags "-X github.com/pydio/cells/common.version=0.2.0\
	 -X github.com/pydio/cells/common.BuildStamp=2018-01-01T00:00:00\
	 -X github.com/pydio/cells/common.BuildRevision=dev"\
	 -o cells\
	 .

ctl:
	go build\
	 -ldflags "-X github.com/pydio/cells/common.version=${CELLS_VERSION}\
	 -X github.com/pydio/cells/common.BuildStamp=`date -u +%Y-%m-%dT%H:%M:%S`\
	 -X github.com/pydio/cells/common.BuildRevision=`git rev-parse HEAD`"\
	 -o cells-ctl\
	 cmd/ctl/main.go

start:
	./cells start

ds: dev start

clean:
	rm -f cells cells-*
	${GOPATH}/bin/packr clean

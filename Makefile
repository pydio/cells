GOBUILD=go build
ENV=env GOOS=linux

.PHONY: all clean build front main client static

all: clean build

build: generate main

front:
	find assets/src/pydio -name composer.json -not -path "*vendor*" -execdir composer install \;
	find assets/src/pydio -name package.json -not -path "*/node_modules/*" -execdir npm install \;
	find assets/src/pydio -name Gruntfile.js -not -path "*/node_modules/*" -execdir grunt \;
	# Removing everything that's used for building dependency but is not necessary for the frontend to run
	find assets/src/pydio \
		-type l -o \
		-path "*/.git/*" -o \
		-path "*/res/js/*" -o \
		-path "*/js/react/*" -o \
		-path "*/tests/*" -o \
		-name .git -o \
		-name .gitignore | xargs rm -rf

	find assets/src/pydio \
	    -maxdepth 3 \
		-name node_modules -o \
		-name package.json -o \
		-name composer.json -o \
		-name Gruntfile.js | xargs rm -rf

generate:
	# Removing existing packr files and running packr
	find . -name *-packr.go | xargs rm -f
	grep -ri -l "packr.NewBox" */* | while read -r line; do cd `dirname "$$line"`; echo "Run packr for $$line" ; ${GOPATH}/bin/packr --compress --input=. ; cd -; done

main:
	go build -a -ldflags "-X github.com/pydio/cells/common.version=0.2.0 -X github.com/pydio/cells/common.BuildStamp=`date -u +%Y-%m-%dT%H:%M:%S` -X github.com/pydio/cells/common.BuildRevision=`git rev-parse HEAD`" -o cells main.go

dev:
	go build -ldflags "-X github.com/pydio/cells/common.version=0.2.0 -X github.com/pydio/cells/common.BuildStamp=2018-01-01T00:00:00 -X github.com/pydio/cells/common.BuildRevision=dev" -o cells main.go

ctl:
	go build -ldflags "-X github.com/pydio/cells/common.version=0.2.0 -X github.com/pydio/cells/common.BuildStamp=2018-01-01T00:00:00 -X github.com/pydio/cells/common.BuildRevision=dev" -o cells-ctl cmd/ctl/main.go

linux:
	CC=x86_64-pc-linux-gcc GOOS=linux GOARCH=amd64 CGO_ENABLED=1 go build -ldflags "-X main.version=0.2 -X main.buildStamp=`date -u +%Y-%m-%dT%H:%M:%S` -X main.buildRevision=`git rev-parse HEAD`" -o dist/linux/cells main.go

cleanall: stop clean rm

clean:
	rm -f cells pydioctl
	${GOPATH}/bin/packr clean

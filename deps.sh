#!/bin/bash

go get

rm -rf build >> /dev/null
rm -rf dex >> /dev/null
rm -rf survey >> /dev/null
rm -rf survey.v1 >> /dev/null
rm -rf go-os >> /dev/null

rm -rf $GOPATH/src/github.com/coreos >> /dev/null
rm -rf $GOPATH/src/github.com/Masterminds >> /dev/null
rm -rf $GOPATH/src/gopkg.in/AlecAivazis >> /dev/null
rm -rf $GOPATH/src/github.com/pydio/go-os >> /dev/null

go get github.com/Masterminds/sprig
go get github.com/Masterminds/glide
go get github.com/micro/protobuf/...

mkdir build >> /dev/null
cd build
git clone https://github.com/pydio/dex.git
git clone https://github.com/pydio/survey.git
git clone https://github.com/pydio/go-os.git
mkdir -p $GOPATH/src/github.com/coreos
mv dex $GOPATH/src/github.com/coreos/dex
mkdir -p $GOPATH/src/gopkg.in/AlecAivazis
mv survey survey.v1
mv survey.v1 $GOPATH/src/gopkg.in/AlecAivazis
mkdir -p $GOPATH/src/github.com/micro
mv go-os $GOPATH/src/github.com/pydio/go-os

cd ..

folder=$(pwd)
cd $GOPATH/src/github.com/Masterminds/glide
go build -o glide
cd ../sprig
../glide/glide update
cd $folder

rm -rf build >> /dev/null

module github.com/pydio/cells/v4/cmd/protoc-gen-go-tags

go 1.23

toolchain go1.23.2

require (
	github.com/fatih/structtag v1.2.0
	github.com/lyft/protoc-gen-star/v2 v2.0.3
	github.com/pydio/cells/v4 v4.0.0-00010101000000-000000000000
	google.golang.org/protobuf v1.35.1
)

require (
	github.com/spf13/afero v1.11.0 // indirect
	golang.org/x/mod v0.21.0 // indirect
	golang.org/x/text v0.19.0 // indirect
	golang.org/x/tools v0.26.0 // indirect
)

replace github.com/pydio/cells/v4 => ../../

replace github.com/minio/minio => github.com/pydio/minio v0.0.0-20240105133831-b78b44f45a00

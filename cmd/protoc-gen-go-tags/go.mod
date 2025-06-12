module github.com/pydio/cells/v5/cmd/protoc-gen-go-tags

go 1.23.0

toolchain go1.23.2

require (
	github.com/fatih/structtag v1.2.0
	github.com/lyft/protoc-gen-star/v2 v2.0.3
	github.com/pydio/cells/v5 v5.0.0-20241203095551-b98a0e99a514
	google.golang.org/protobuf v1.36.1
)

require (
	github.com/spf13/afero v1.11.0 // indirect
	golang.org/x/mod v0.25.0 // indirect
	golang.org/x/sync v0.15.0 // indirect
	golang.org/x/text v0.26.0 // indirect
	golang.org/x/tools v0.33.0 // indirect
)

replace github.com/pydio/cells/v5 => ../../

replace github.com/minio/minio => github.com/pydio/minio v0.0.0-20240105133831-b78b44f45a00

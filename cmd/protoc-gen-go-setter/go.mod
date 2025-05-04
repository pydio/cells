module github.com/pydio/cells/v5/cmd/protoc-gen-go-setter

go 1.23.0

toolchain go1.23.2

require (
	github.com/lyft/protoc-gen-star/v2 v2.0.3
	github.com/pydio/cells/v5 v5.0.0-20241203095551-b98a0e99a514
	golang.org/x/text v0.24.0
	google.golang.org/protobuf v1.36.1
)

require (
	github.com/spf13/afero v1.11.0 // indirect
	golang.org/x/mod v0.22.0 // indirect
	golang.org/x/sync v0.13.0 // indirect
	golang.org/x/tools v0.28.0 // indirect
)

replace github.com/pydio/cells/v5 => ../../

replace github.com/minio/minio => github.com/pydio/minio v0.0.0-20240105133831-b78b44f45a00

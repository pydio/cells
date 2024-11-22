module github.com/pydio/cells/v5/cmd/protoc-gen-go-setter

go 1.23

toolchain go1.23.2

require (
	github.com/lyft/protoc-gen-star/v2 v2.0.3
	github.com/pydio/cells/v5 v4.4.0
	golang.org/x/text v0.19.0
	google.golang.org/protobuf v1.35.1
)

require (
	github.com/spf13/afero v1.11.0 // indirect
	golang.org/x/mod v0.21.0 // indirect
	golang.org/x/tools v0.26.0 // indirect
)

replace github.com/pydio/cells/v5 => ../../

replace github.com/minio/minio => github.com/pydio/minio v0.0.0-20240105133831-b78b44f45a00

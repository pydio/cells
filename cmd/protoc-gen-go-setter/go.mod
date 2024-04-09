module github.com/pydio/cells/v4/cmd/protoc-gen-go-setter

go 1.21

require (
	github.com/lyft/protoc-gen-star/v2 v2.0.3
	github.com/pydio/cells/v4 v4.4.0
	golang.org/x/text v0.14.0
	google.golang.org/protobuf v1.33.0
)

require (
	github.com/spf13/afero v1.11.0 // indirect
	golang.org/x/mod v0.17.0 // indirect
	golang.org/x/tools v0.20.0 // indirect
)

replace github.com/pydio/cells/v4 => ../../

replace github.com/minio/minio => github.com/pydio/minio v0.0.0-20240105133831-b78b44f45a00

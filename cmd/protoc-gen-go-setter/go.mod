module github.com/pydio/cells/v5/cmd/protoc-gen-go-setter

go 1.26.1

require (
	github.com/lyft/protoc-gen-star/v2 v2.0.3
	github.com/pydio/cells/v5 v5.0.0-20241203095551-b98a0e99a514
	golang.org/x/text v0.35.0
	google.golang.org/protobuf v1.36.11
)

require (
	github.com/spf13/afero v1.15.0 // indirect
	golang.org/x/mod v0.34.0 // indirect
	golang.org/x/sync v0.20.0 // indirect
	golang.org/x/tools v0.42.0 // indirect
)

replace github.com/pydio/cells/v5 => ../../

replace github.com/minio/minio => github.com/pydio/minio v0.0.0-20240105133831-b78b44f45a00

module github.com/pydio/cells/v5/cmd/protoc-gen-go-tags

go 1.25

require (
	github.com/fatih/structtag v1.2.0
	github.com/lyft/protoc-gen-star/v2 v2.0.3
	github.com/pydio/cells/v5 v5.0.0-20241203095551-b98a0e99a514
	google.golang.org/protobuf v1.36.9
)

require (
	github.com/spf13/afero v1.15.0 // indirect
	golang.org/x/mod v0.29.0 // indirect
	golang.org/x/sync v0.18.0 // indirect
	golang.org/x/text v0.31.0 // indirect
	golang.org/x/tools v0.38.0 // indirect
)

replace github.com/pydio/cells/v5 => ../../

replace github.com/minio/minio => github.com/pydio/minio v0.0.0-20240105133831-b78b44f45a00

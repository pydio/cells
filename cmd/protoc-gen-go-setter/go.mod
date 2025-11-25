module github.com/pydio/cells/v5/cmd/protoc-gen-go-setter

go 1.25

require (
	github.com/lyft/protoc-gen-star/v2 v2.0.3
	github.com/pydio/cells/v5 v5.0.0-20241203095551-b98a0e99a514
<<<<<<< HEAD
	golang.org/x/text v0.32.0
<<<<<<< Updated upstream
	google.golang.org/protobuf v1.36.11
=======
	google.golang.org/protobuf v1.36.10
>>>>>>> Stashed changes
=======
	golang.org/x/text v0.31.0
	google.golang.org/protobuf v1.36.9
>>>>>>> 2262ffccd (feat(meta): initiate a dialog prompting for metadata at upload time.)
)

require (
	github.com/spf13/afero v1.15.0 // indirect
<<<<<<< HEAD
	golang.org/x/mod v0.31.0 // indirect
	golang.org/x/sync v0.19.0 // indirect
	golang.org/x/tools v0.40.0 // indirect
=======
	golang.org/x/mod v0.29.0 // indirect
	golang.org/x/sync v0.18.0 // indirect
	golang.org/x/tools v0.38.0 // indirect
>>>>>>> 2262ffccd (feat(meta): initiate a dialog prompting for metadata at upload time.)
)

replace github.com/pydio/cells/v5 => ../../

replace github.com/minio/minio => github.com/pydio/minio v0.0.0-20240105133831-b78b44f45a00

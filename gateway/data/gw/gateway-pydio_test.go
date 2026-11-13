package pydio

import (
	"strings"
	"testing"

	minio "github.com/minio/minio/cmd"

	cellserrors "github.com/pydio/cells/v5/common/errors"
)

func TestPydioToMinioErrorMapsInvalidParameters(t *testing.T) {
	validationErr := cellserrors.WithMessage(cellserrors.InvalidParameters, "invalid destination name")
	mapped := pydioToMinioError(validationErr, "bucket", "object")

	invalidArgument, ok := mapped.(minio.InvalidArgument)
	if !ok {
		t.Fatalf("mapped error type = %T, want minio.InvalidArgument", mapped)
	}
	if invalidArgument.Bucket != "bucket" || invalidArgument.Object != "object" {
		t.Fatalf("mapped location = %s/%s, want bucket/object", invalidArgument.Bucket, invalidArgument.Object)
	}
	if !strings.Contains(invalidArgument.Error(), "invalid destination name") {
		t.Fatalf("mapped error = %q, want validation detail", invalidArgument.Error())
	}
}

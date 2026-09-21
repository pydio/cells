package hooks

import (
	"context"
	"net/http"
	"net/http/httptest"
	"reflect"
	"testing"

	"github.com/minio/minio-go/v7/pkg/signer"
	"github.com/minio/minio/cmd"
)

func TestValidateCopySourceSignature(t *testing.T) {
	tests := []struct {
		name      string
		request   func() *http.Request
		wantError cmd.APIErrorCode
	}{
		{
			name: "query presigned copy source missing from signed headers is denied",
			request: func() *http.Request {
				r := httptest.NewRequest(http.MethodPut, "/io/destination?X-Amz-SignedHeaders=host", nil)
				r.Header.Set("X-Amz-Copy-Source", "/io/source")
				return r
			},
			wantError: cmd.ErrAccessDenied,
		},
		{
			name: "signed query presigned copy source is allowed",
			request: func() *http.Request {
				r := httptest.NewRequest(http.MethodPut, "/io/destination?X-Amz-SignedHeaders=host%3Bx-amz-copy-source", nil)
				r.Header.Set("X-Amz-Copy-Source", "/io/source")
				return r
			},
			wantError: cmd.ErrNone,
		},
		{
			name: "normal put without copy source is allowed",
			request: func() *http.Request {
				return httptest.NewRequest(http.MethodPut, "/io/destination?X-Amz-SignedHeaders=host", nil)
			},
			wantError: cmd.ErrNone,
		},
		{
			name: "multipart copy part missing from signed headers is denied",
			request: func() *http.Request {
				r := httptest.NewRequest(http.MethodPut, "/io/destination?uploadId=upload&partNumber=1&X-Amz-SignedHeaders=host", nil)
				r.Header.Set("X-Amz-Copy-Source", "/io/source")
				return r
			},
			wantError: cmd.ErrAccessDenied,
		},
		{
			name: "authorization copy source missing from signed headers is denied",
			request: func() *http.Request {
				r := httptest.NewRequest(http.MethodPut, "/io/destination", nil)
				r.Header.Set("Authorization", "AWS4-HMAC-SHA256 Credential=key/date/region/s3/aws4_request, SignedHeaders=host, Signature=signature")
				r.Header.Set("X-Amz-Copy-Source", "/io/source")
				return r
			},
			wantError: cmd.ErrAccessDenied,
		},
		{
			name: "authorization query disagreement is denied",
			request: func() *http.Request {
				r := httptest.NewRequest(http.MethodPut, "/io/destination?X-Amz-SignedHeaders=host%3Bx-amz-copy-source", nil)
				r.Header.Set("Authorization", "AWS4-HMAC-SHA256 Credential=key/date/region/s3/aws4_request, SignedHeaders=host, Signature=signature")
				r.Header.Set("X-Amz-Copy-Source", "/io/source")
				return r
			},
			wantError: cmd.ErrAccessDenied,
		},
		{
			name: "authorization copy source matching case is allowed",
			request: func() *http.Request {
				r := httptest.NewRequest(http.MethodPut, "/io/destination", nil)
				r.Header.Set("Authorization", "AWS4-HMAC-SHA256 Credential=key/date/region/s3/aws4_request, SignedHeaders=HOST;X-AMZ-COPY-SOURCE, Signature=signature")
				r.Header.Set("x-amz-copy-source", "/io/source")
				return r
			},
			wantError: cmd.ErrNone,
		},
		{
			name: "duplicate query signed headers are denied",
			request: func() *http.Request {
				r := httptest.NewRequest(http.MethodPut, "/io/destination?X-Amz-SignedHeaders=host%3Bx-amz-copy-source&X-Amz-SignedHeaders=host", nil)
				r.Header.Set("X-Amz-Copy-Source", "/io/source")
				return r
			},
			wantError: cmd.ErrAccessDenied,
		},
		{
			name: "duplicate copy source headers are denied",
			request: func() *http.Request {
				r := httptest.NewRequest(http.MethodPut, "/io/destination?X-Amz-SignedHeaders=host%3Bx-amz-copy-source", nil)
				r.Header.Add("X-Amz-Copy-Source", "/io/source-a")
				r.Header.Add("X-Amz-Copy-Source", "/io/source-b")
				return r
			},
			wantError: cmd.ErrAccessDenied,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := validateCopySourceSignature(tt.request()); got != tt.wantError {
				t.Fatalf("validateCopySourceSignature() = %v, want %v", got, tt.wantError)
			}
		})
	}
}

func TestValidateExtractSignature(t *testing.T) {
	tests := []struct {
		name      string
		request   func() *http.Request
		wantError cmd.APIErrorCode
	}{
		{
			name: "query presigned extract header missing from signed headers is denied",
			request: func() *http.Request {
				r := httptest.NewRequest(http.MethodPut, "/io/destination?X-Amz-SignedHeaders=host", nil)
				r.Header.Set("X-Amz-Meta-Snowball-Auto-Extract", "true")
				return r
			},
			wantError: cmd.ErrAccessDenied,
		},
		{
			name: "query presigned extract header in signed headers is allowed",
			request: func() *http.Request {
				r := httptest.NewRequest(http.MethodPut, "/io/destination?X-Amz-SignedHeaders=host%3Bx-amz-meta-snowball-auto-extract", nil)
				r.Header.Set("X-Amz-Meta-Snowball-Auto-Extract", "true")
				return r
			},
			wantError: cmd.ErrNone,
		},
		{
			name: "extract header without a dispatch value is allowed",
			request: func() *http.Request {
				r := httptest.NewRequest(http.MethodPut, "/io/destination?X-Amz-SignedHeaders=host", nil)
				r.Header.Set("X-Amz-Meta-Snowball-Auto-Extract", "false")
				return r
			},
			wantError: cmd.ErrNone,
		},
		{
			name: "authorization extract header missing from signed headers is denied",
			request: func() *http.Request {
				r := httptest.NewRequest(http.MethodPut, "/io/destination", nil)
				r.Header.Set("Authorization", "AWS4-HMAC-SHA256 Credential=key/date/region/s3/aws4_request, SignedHeaders=host, Signature=signature")
				r.Header.Set("X-Amz-Meta-Snowball-Auto-Extract", "true")
				return r
			},
			wantError: cmd.ErrAccessDenied,
		},
		{
			name: "authorization extract header covered by signed headers is allowed",
			request: func() *http.Request {
				r := httptest.NewRequest(http.MethodPut, "/io/destination", nil)
				r.Header.Set("Authorization", "AWS4-HMAC-SHA256 Credential=key/date/region/s3/aws4_request, SignedHeaders=host;x-amz-meta-snowball-auto-extract, Signature=signature")
				r.Header.Set("X-Amz-Meta-Snowball-Auto-Extract", "true")
				return r
			},
			wantError: cmd.ErrNone,
		},
		{
			name: "request without extract header is allowed",
			request: func() *http.Request {
				return httptest.NewRequest(http.MethodPut, "/io/destination?X-Amz-SignedHeaders=host", nil)
			},
			wantError: cmd.ErrNone,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := validateExtractSignature(tt.request()); got != tt.wantError {
				t.Fatalf("validateExtractSignature() = %v, want %v", got, tt.wantError)
			}
		})
	}
}

func TestValidateLegacyCopySource(t *testing.T) {
	withCopySource := httptest.NewRequest(http.MethodPut, "/io/destination?pydio_jwt=legacy", nil)
	withCopySource.Header.Set("X-Amz-Copy-Source", "/io/source")
	if got := validateLegacyCopySource(withCopySource); got != cmd.ErrAccessDenied {
		t.Fatalf("validateLegacyCopySource() = %v, want %v", got, cmd.ErrAccessDenied)
	}

	normalPut := httptest.NewRequest(http.MethodPut, "/io/destination?pydio_jwt=legacy", nil)
	if got := validateLegacyCopySource(normalPut); got != cmd.ErrNone {
		t.Fatalf("validateLegacyCopySource() = %v, want %v", got, cmd.ErrNone)
	}
}

func TestValidateCopySourceSignatureSignedV4(t *testing.T) {
	r := httptest.NewRequest(http.MethodPut, "https://example.test/io/destination", nil)
	r.Header.Set("X-Amz-Copy-Source", "/io/source")
	signed := signer.PreSignV4(*r, "review-access", "review-secret", "", "us-east-1", 600)
	signed = signed.WithContext(reviewGlobalsContext{Context: signed.Context(), globals: reviewGlobals()})

	if got := cmd.ExposedValidateRequestSignature(signed); got != cmd.ErrNone {
		t.Fatalf("real MinIO signature validation failed: %v", got)
	}
	if got := validateCopySourceSignature(signed); got != cmd.ErrNone {
		t.Fatalf("validateCopySourceSignature() for signed SigV4 = %v, want %v", got, cmd.ErrNone)
	}
}

func TestValidateCopySourceSignatureSignedV2(t *testing.T) {
	r := httptest.NewRequest(http.MethodPut, "/io/destination", nil)
	r.Header.Set("X-Amz-Copy-Source", "/io/source")
	signed := signer.SignV2(*r, "access-key", "secret-key", false)

	if got := validateCopySourceSignature(signed); got != cmd.ErrNone {
		t.Fatalf("validateCopySourceSignature() for signed SigV2 = %v, want %v", got, cmd.ErrNone)
	}
}

func TestValidateCopySourceSignaturePresignedWithAuthorization(t *testing.T) {
	for _, authorization := range []string{"Basic Zm9vOmJhcg==", "Bearer example-token"} {
		t.Run(authorization, func(t *testing.T) {
			r := httptest.NewRequest(http.MethodPut, "https://example.test/io/destination", nil)
			signed := signer.PreSignV4(*r, "review-access", "review-secret", "", "us-east-1", 600)
			signed.Header.Set("X-Amz-Copy-Source", "/io/source")
			signed.Header.Set("Authorization", authorization)
			signed = signed.WithContext(reviewGlobalsContext{Context: signed.Context(), globals: reviewGlobals()})

			if got := cmd.ExposedValidateRequestSignature(signed); got != cmd.ErrNone {
				t.Fatalf("real MinIO signature validation failed: %v", got)
			}
			if got := validateCopySourceSignature(signed); got != cmd.ErrAccessDenied {
				t.Fatalf("copy-source without signature coverage accepted: got %v, want %v", got, cmd.ErrAccessDenied)
			}
		})
	}
}

func TestValidateExtractSignatureSignedV4(t *testing.T) {
	// The extract header is set before presigning, so the signer covers it.
	r := httptest.NewRequest(http.MethodPut, "https://example.test/io/destination", nil)
	r.Header.Set("X-Amz-Meta-Snowball-Auto-Extract", "true")
	signed := signer.PreSignV4(*r, "review-access", "review-secret", "", "us-east-1", 600)
	signed = signed.WithContext(reviewGlobalsContext{Context: signed.Context(), globals: reviewGlobals()})

	if got := cmd.ExposedValidateRequestSignature(signed); got != cmd.ErrNone {
		t.Fatalf("real MinIO signature validation failed: %v", got)
	}
	if got := validateExtractSignature(signed); got != cmd.ErrNone {
		t.Fatalf("validateExtractSignature() for signed extract header = %v, want %v", got, cmd.ErrNone)
	}
}

func TestValidateExtractSignaturePresignedUncovered(t *testing.T) {
	// The extract header is added after presigning, so it stays outside the
	// signed headers.
	r := httptest.NewRequest(http.MethodPut, "https://example.test/io/destination", nil)
	signed := signer.PreSignV4(*r, "review-access", "review-secret", "", "us-east-1", 600)
	signed.Header.Set("X-Amz-Meta-Snowball-Auto-Extract", "true")
	signed = signed.WithContext(reviewGlobalsContext{Context: signed.Context(), globals: reviewGlobals()})

	if got := cmd.ExposedValidateRequestSignature(signed); got != cmd.ErrNone {
		t.Fatalf("real MinIO signature validation failed: %v", got)
	}
	if got := validateExtractSignature(signed); got != cmd.ErrAccessDenied {
		t.Fatalf("validateExtractSignature() for extract header outside signed headers = %v, want %v", got, cmd.ErrAccessDenied)
	}
}

func TestValidateExtractSignatureSignedV2(t *testing.T) {
	r := httptest.NewRequest(http.MethodPut, "/io/destination", nil)
	r.Header.Set("X-Amz-Meta-Snowball-Auto-Extract", "true")
	signed := signer.SignV2(*r, "access-key", "secret-key", false)

	if got := validateExtractSignature(signed); got != cmd.ErrNone {
		t.Fatalf("validateExtractSignature() for signed SigV2 = %v, want %v", got, cmd.ErrNone)
	}
}

func TestValidateExtractSignaturePresignedWithAuthorization(t *testing.T) {
	for _, authorization := range []string{"Basic Zm9vOmJhcg==", "Bearer example-token"} {
		t.Run(authorization, func(t *testing.T) {
			r := httptest.NewRequest(http.MethodPut, "https://example.test/io/destination", nil)
			signed := signer.PreSignV4(*r, "review-access", "review-secret", "", "us-east-1", 600)
			signed.Header.Set("X-Amz-Meta-Snowball-Auto-Extract", "true")
			signed.Header.Set("Authorization", authorization)
			signed = signed.WithContext(reviewGlobalsContext{Context: signed.Context(), globals: reviewGlobals()})

			if got := cmd.ExposedValidateRequestSignature(signed); got != cmd.ErrNone {
				t.Fatalf("real MinIO signature validation failed: %v", got)
			}
			if got := validateExtractSignature(signed); got != cmd.ErrAccessDenied {
				t.Fatalf("extract header without signature coverage accepted: got %v, want %v", got, cmd.ErrAccessDenied)
			}
		})
	}
}

// reviewGlobalsContext supplies MinIO's private globals context key without
// changing the production verifier. This exercises the actual verifier before
// the production copy-source validation.
type reviewGlobalsContext struct {
	context.Context
	globals *cmd.Globals
}

func (c reviewGlobalsContext) Value(key interface{}) interface{} {
	if reflect.TypeOf(key).String() == "*cmd.globalCtxType" {
		return c.globals
	}
	return c.Context.Value(key)
}

func reviewGlobals() *cmd.Globals {
	g := cmd.NewGlobals()
	g.IsGateway = true
	g.ActiveCred.AccessKey = "review-access"
	g.ActiveCred.SecretKey = "review-secret"
	g.ServerRegion = "us-east-1"
	return g
}

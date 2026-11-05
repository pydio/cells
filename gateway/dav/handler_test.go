package dav

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	cellserrors "github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes/writevalidation"
)

func TestValidationRequestAllowsWritesWithoutRules(t *testing.T) {
	methods := []string{http.MethodPut, "MKCOL", "COPY", "MOVE"}
	for _, method := range methods {
		t.Run(method, func(t *testing.T) {
			called := false
			handler := validationRequestWithRegistry(http.HandlerFunc(func(http.ResponseWriter, *http.Request) { called = true }), writevalidation.NewRegistry(), "/dav")
			req := httptest.NewRequest(method, "/dav/source", nil)
			if method == "COPY" || method == "MOVE" {
				req.Header.Set("Destination", "/dav/target")
			}
			handler.ServeHTTP(httptest.NewRecorder(), req)
			if !called {
				t.Fatal("downstream DAV handler was not called")
			}
		})
	}
}

func TestValidationRequestCanonicalizesDotSegmentsAndUnicode(t *testing.T) {
	registry := writevalidation.NewRegistry()
	if err := registry.RegisterRule("canonical", 0, func(_ context.Context, request writevalidation.Request) error {
		if request.Destination.GetPath() != "/unicode/é" || (request.Source != nil && request.Source.GetPath() != "/unicode/é") {
			return writevalidation.Reject("non-canonical path")
		}
		return nil
	}); err != nil {
		t.Fatal(err)
	}
	for _, method := range []string{http.MethodPut, "MKCOL", "COPY", "MOVE"} {
		t.Run(method, func(t *testing.T) {
			called := false
			handler := validationRequestWithRegistry(http.HandlerFunc(func(http.ResponseWriter, *http.Request) { called = true }), registry, "/dav")
			req := httptest.NewRequest(method, "/dav/a/../unicode/e%CC%81", nil)
			if method == "COPY" || method == "MOVE" {
				req.Header.Set("Destination", "/dav/a/../unicode/e%CC%81")
			}
			resp := httptest.NewRecorder()
			handler.ServeHTTP(resp, req)
			if resp.Code != http.StatusOK || !called {
				t.Fatalf("status=%d called=%v body=%q", resp.Code, called, resp.Body.String())
			}
		})
	}
}

func TestValidationRequestPreservesForbiddenStatus(t *testing.T) {
	registry := writevalidation.NewRegistry()
	if err := registry.RegisterRule("forbidden", 0, func(context.Context, writevalidation.Request) error {
		return cellserrors.WithMessage(cellserrors.StatusForbidden, "forbidden by test")
	}); err != nil {
		t.Fatal(err)
	}
	handler := validationRequestWithRegistry(http.HandlerFunc(func(http.ResponseWriter, *http.Request) { t.Fatal("downstream called") }), registry, "/dav")
	resp := httptest.NewRecorder()
	handler.ServeHTTP(resp, httptest.NewRequest(http.MethodPut, "/dav/file", nil))
	if resp.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want 403", resp.Code)
	}
	if !strings.Contains(resp.Body.String(), "forbidden by test") {
		t.Fatalf("body = %q", resp.Body.String())
	}
}

func TestValidationRequestLeavesMalformedDestinationToWebDAVWithoutRules(t *testing.T) {
	called := false
	handler := validationRequestWithRegistry(http.HandlerFunc(func(http.ResponseWriter, *http.Request) { called = true }), writevalidation.NewRegistry(), "/dav")
	req := httptest.NewRequest("COPY", "/dav/source", nil)
	req.Header.Set("Destination", "://bad")
	handler.ServeHTTP(httptest.NewRecorder(), req)
	if !called {
		t.Fatal("downstream WebDAV handler was not called")
	}
}

func TestValidationRequestRejectsDAVWriteBeforeHandler(t *testing.T) {
	registry := writevalidation.NewRegistry()
	if err := registry.RegisterRule("dav-test-reject", -100, func(_ context.Context, request writevalidation.Request) error {
		if strings.Contains(request.Destination.GetPath(), "blocked") {
			return writevalidation.Reject("blocked by test rule")
		}
		return nil
	}); err != nil {
		t.Fatal(err)
	}

	called := false
	handler := validationRequestWithRegistry(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		called = true
	}), registry, "/dav")
	req := httptest.NewRequest(http.MethodPut, "/dav/blocked.txt", nil)
	resp := httptest.NewRecorder()

	handler.ServeHTTP(resp, req)
	if resp.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400", resp.Code)
	}
	if !strings.Contains(resp.Body.String(), "blocked by test rule") {
		t.Fatalf("body = %q, want validation detail", resp.Body.String())
	}
	if called {
		t.Fatal("downstream DAV handler was called")
	}
}

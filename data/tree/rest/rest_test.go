package rest

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	restful "github.com/emicklei/go-restful/v3"

	cellserrors "github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes/writevalidation"
)

func TestCreateNodesRejectsBatchBeforeRouterWrite(t *testing.T) {
	registry := writevalidation.NewRegistry()
	if err := registry.RegisterRule("tree-rest-batch-test", -200, func(_ context.Context, request writevalidation.Request) error {
		if strings.Contains(request.Destination.GetPath(), "blocked") {
			return writevalidation.Reject("blocked by test rule")
		}
		return nil
	}); err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodPost, "/node/create", strings.NewReader(`{"Nodes":[{"Path":"valid"},{"Path":"blocked"}]}`))
	req.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	handler := &Handler{}
	if err := handler.createNodes(restful.NewRequest(req), restful.NewResponse(response), registry); !cellserrors.Is(err, cellserrors.InvalidParameters) {
		t.Fatalf("CreateNodes() error = %v, want InvalidParameters", err)
	}
	if response.Code != http.StatusOK {
		t.Fatalf("response status before outer mapping = %d, want default 200", response.Code)
	}
}

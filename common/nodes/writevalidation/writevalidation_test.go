package writevalidation

import (
	"context"
	"errors"
	"io"
	"reflect"
	"strings"
	"testing"

	"github.com/pydio/cells/v5/common"
	cellserrors "github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/proto/tree"
	"google.golang.org/grpc"
)

func TestRegistryRunsRulesByPriorityThenName(t *testing.T) {
	registry := NewRegistry()
	var calls []string
	for _, rule := range []struct {
		name     string
		priority int
	}{
		{name: "second", priority: 20},
		{name: "last-alphabetically", priority: 10},
		{name: "first-alphabetically", priority: 10},
	} {
		rule := rule
		if err := registry.RegisterRule(rule.name, rule.priority, func(context.Context, Request) error {
			calls = append(calls, rule.name)
			return nil
		}); err != nil {
			t.Fatal(err)
		}
	}

	if err := registry.Validate(context.Background(), Request{Operation: OperationCreate}); err != nil {
		t.Fatal(err)
	}
	if want := []string{"first-alphabetically", "last-alphabetically", "second"}; !reflect.DeepEqual(calls, want) {
		t.Fatalf("rule order = %v, want %v", calls, want)
	}
}

func TestRegistryRejectsDuplicateAndInvalidRegistrations(t *testing.T) {
	registry := NewRegistry()
	rule := func(context.Context, Request) error { return nil }
	if err := registry.RegisterRule("rule", 0, rule); err != nil {
		t.Fatal(err)
	}
	for _, test := range []struct {
		name string
		rule Rule
	}{
		{name: "rule", rule: rule},
		{name: "nil-rule", rule: nil},
		{name: "", rule: rule},
	} {
		if err := registry.RegisterRule(test.name, 0, test.rule); err == nil {
			t.Errorf("RegisterRule(%q) unexpectedly succeeded", test.name)
		}
	}
}

func TestRegistryValidatesBatchBeforeContinuing(t *testing.T) {
	registry := NewRegistry()
	var checked []string
	if err := registry.RegisterRule("capture", 0, func(_ context.Context, request Request) error {
		checked = append(checked, request.Destination.Path)
		if request.Destination.Path == "invalid" {
			return Reject("blocked")
		}
		return nil
	}); err != nil {
		t.Fatal(err)
	}

	err := registry.ValidateAll(context.Background(), []Request{
		{Operation: OperationCreate, Destination: &tree.Node{Path: "valid"}},
		{Operation: OperationCreate, Destination: &tree.Node{Path: "invalid"}},
		{Operation: OperationCreate, Destination: &tree.Node{Path: "not-checked"}},
	})
	if !errors.Is(err, cellserrors.InvalidParameters) {
		t.Fatalf("ValidateAll() error = %v, want InvalidParameters", err)
	}
	if want := []string{"valid", "invalid"}; !reflect.DeepEqual(checked, want) {
		t.Fatalf("checked paths = %v, want %v", checked, want)
	}
}

func TestRegistryPassesClonedNodesToRules(t *testing.T) {
	registry := NewRegistry()
	if err := registry.RegisterRule("mutate", 0, func(_ context.Context, request Request) error {
		request.Destination.Path = "changed"
		return nil
	}); err != nil {
		t.Fatal(err)
	}
	destination := &tree.Node{Path: "original"}
	if err := registry.Validate(context.Background(), Request{Operation: OperationUpload, Destination: destination}); err != nil {
		t.Fatal(err)
	}
	if destination.Path != "original" {
		t.Fatalf("caller destination path = %q, want original", destination.Path)
	}
}

func TestRegistryStopsAtFirstRuleError(t *testing.T) {
	registry := NewRegistry()
	wantErr := Reject("blocked")
	var calls []string
	_ = registry.RegisterRule("first", 1, func(context.Context, Request) error {
		calls = append(calls, "first")
		return wantErr
	})
	_ = registry.RegisterRule("second", 2, func(context.Context, Request) error {
		calls = append(calls, "second")
		return nil
	})

	err := registry.Validate(context.Background(), Request{Operation: OperationUpload})
	if !errors.Is(err, cellserrors.InvalidParameters) {
		t.Fatalf("Validate() error = %v, want InvalidParameters", err)
	}
	if got := len(calls); got != 1 || calls[0] != "first" {
		t.Fatalf("rule calls = %v, want [first]", calls)
	}
}

type writeSpy struct {
	*nodes.HandlerMock
	calls int
}

func newWriteSpy() *writeSpy {
	return &writeSpy{HandlerMock: nodes.NewHandlerMock()}
}

func (s *writeSpy) CreateNode(context.Context, *tree.CreateNodeRequest, ...grpc.CallOption) (*tree.CreateNodeResponse, error) {
	s.calls++
	return nil, nil
}

func (s *writeSpy) PutObject(context.Context, *tree.Node, io.Reader, *models.PutRequestData) (models.ObjectInfo, error) {
	s.calls++
	return models.ObjectInfo{}, nil
}

func (s *writeSpy) MultipartCreate(context.Context, *tree.Node, *models.MultipartRequestData) (string, error) {
	s.calls++
	return "upload-id", nil
}

func (s *writeSpy) CopyObject(context.Context, *tree.Node, *tree.Node, *models.CopyRequestData) (models.ObjectInfo, error) {
	s.calls++
	return models.ObjectInfo{}, nil
}

func (s *writeSpy) MultipartPutObjectPart(context.Context, *tree.Node, string, int, io.Reader, *models.PutRequestData) (models.MultipartObjectPart, error) {
	s.calls++
	return models.MultipartObjectPart{}, nil
}

func (s *writeSpy) MultipartComplete(context.Context, *tree.Node, string, []models.MultipartObjectPart) (models.ObjectInfo, error) {
	s.calls++
	return models.ObjectInfo{}, nil
}

func (s *writeSpy) UpdateNode(context.Context, *tree.UpdateNodeRequest, ...grpc.CallOption) (*tree.UpdateNodeResponse, error) {
	s.calls++
	return nil, nil
}

func newValidationClient(registry *Registry, next nodes.Handler) nodes.Handler {
	options := nodes.RouterOptions{}
	WithRegistry(registry)(&options)
	return options.Wrappers[0].Adapt(next, options)
}

func TestHandlerRejectsWritesBeforeForwarding(t *testing.T) {
	testCases := []struct {
		name      string
		operation Operation
		write     func(nodes.Handler) error
	}{
		{
			name:      "create",
			operation: OperationCreate,
			write: func(client nodes.Handler) error {
				_, err := client.CreateNode(context.Background(), &tree.CreateNodeRequest{Node: &tree.Node{Path: "folder"}})
				return err
			},
		},
		{
			name:      "single upload",
			operation: OperationUpload,
			write: func(client nodes.Handler) error {
				_, err := client.PutObject(context.Background(), &tree.Node{Path: "file"}, strings.NewReader("data"), &models.PutRequestData{})
				return err
			},
		},
		{
			name:      "multipart initiation",
			operation: OperationMultipartUpload,
			write: func(client nodes.Handler) error {
				_, err := client.MultipartCreate(context.Background(), &tree.Node{Path: "file"}, &models.MultipartRequestData{})
				return err
			},
		},
		{
			name:      "multipart part",
			operation: OperationMultipartUpload,
			write: func(client nodes.Handler) error {
				_, err := client.MultipartPutObjectPart(context.Background(), &tree.Node{Path: "file"}, "upload", 1, strings.NewReader("data"), &models.PutRequestData{})
				return err
			},
		},
		{
			name:      "multipart completion",
			operation: OperationMultipartUpload,
			write: func(client nodes.Handler) error {
				_, err := client.MultipartComplete(context.Background(), &tree.Node{Path: "file"}, "upload", nil)
				return err
			},
		},
		{
			name:      "copy",
			operation: OperationCopy,
			write: func(client nodes.Handler) error {
				_, err := client.CopyObject(context.Background(), &tree.Node{Path: "source"}, &tree.Node{Path: "target"}, &models.CopyRequestData{})
				return err
			},
		},
		{
			name:      "move",
			operation: OperationMove,
			write: func(client nodes.Handler) error {
				_, err := client.CopyObject(context.Background(), &tree.Node{Path: "source"}, &tree.Node{Path: "target"}, &models.CopyRequestData{Metadata: map[string]string{common.XAmzMetaDirective: "COPY"}})
				return err
			},
		},
		{
			name:      "flat move",
			operation: OperationMove,
			write: func(client nodes.Handler) error {
				_, err := client.UpdateNode(context.Background(), &tree.UpdateNodeRequest{From: &tree.Node{Path: "source"}, To: &tree.Node{Path: "target"}})
				return err
			},
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			registry := NewRegistry()
			if err := registry.RegisterRule("reject", 0, func(_ context.Context, request Request) error {
				if request.Operation != testCase.operation {
					t.Errorf("operation = %q, want %q", request.Operation, testCase.operation)
				}
				return Reject("blocked")
			}); err != nil {
				t.Fatal(err)
			}
			spy := newWriteSpy()
			client := newValidationClient(registry, spy)

			err := testCase.write(client)
			if !errors.Is(err, cellserrors.InvalidParameters) {
				t.Fatalf("write error = %v, want InvalidParameters", err)
			}
			if spy.calls != 0 {
				t.Fatalf("forwarded write %d times, want 0", spy.calls)
			}
		})
	}
}

func TestHandlerValidatesSamePathCopiesButSkipsNonRenameUpdates(t *testing.T) {
	registry := NewRegistry()
	if err := registry.RegisterRule("reject", 0, func(context.Context, Request) error {
		return Reject("blocked")
	}); err != nil {
		t.Fatal(err)
	}
	spy := newWriteSpy()
	client := newValidationClient(registry, spy)

	if _, err := client.UpdateNode(context.Background(), &tree.UpdateNodeRequest{
		From: &tree.Node{Path: "same"},
		To:   &tree.Node{Path: "same"},
	}); err != nil {
		t.Fatal(err)
	}
	if spy.calls != 1 {
		t.Fatalf("forwarded same-path update = %d, want 1", spy.calls)
	}
	if _, err := client.CopyObject(context.Background(), &tree.Node{Path: "same"}, &tree.Node{Path: "same"}, &models.CopyRequestData{}); !errors.Is(err, cellserrors.InvalidParameters) {
		t.Fatalf("same-path copy error = %v, want InvalidParameters", err)
	}
	if spy.calls != 1 {
		t.Fatalf("forwarded rejected copy, writes = %d, want 1", spy.calls)
	}
}

func TestHandlerWithoutRulesForwardsWritesUnchanged(t *testing.T) {
	spy := newWriteSpy()
	client := newValidationClient(NewRegistry(), spy)

	_, err := client.PutObject(context.Background(), &tree.Node{Path: "existing.name"}, strings.NewReader("data"), &models.PutRequestData{})
	if err != nil {
		t.Fatal(err)
	}
	if spy.calls != 1 {
		t.Fatalf("forwarded writes = %d, want 1", spy.calls)
	}
}

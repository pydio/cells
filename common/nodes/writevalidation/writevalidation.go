// Package writevalidation provides opt-in rules for node-creation and content-write operations.
//
// Register rules during process startup, before serving requests. Rules run in ascending
// priority order; rules with equal priority run by name. A non-nil error rejects the
// operation and stops evaluation. With no registered rules, validation is a no-op.
package writevalidation

import (
	"context"
	"fmt"
	"io"
	"sort"
	"sync"

	cellserrors "github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/abstract"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/proto/tree"
	"google.golang.org/grpc"
)

type Operation string

const (
	OperationCreate          Operation = "create"
	OperationUpload          Operation = "upload"
	OperationMultipartUpload Operation = "multipart-upload"
	OperationCopy            Operation = "copy"
	OperationMove            Operation = "move"
)

// Request describes the write being checked. Source is set for copy and move operations;
// Destination is the node path that the operation would create or modify.
type Request struct {
	Operation   Operation
	Source      *tree.Node
	Destination *tree.Node
}

// Rule validates one write request. Return nil to allow it, or an error to reject it.
// Use Reject to return a client-visible invalid-parameters error. Rules must be deterministic
// and side-effect-free because batch preflight may evaluate a request again at the node-client
// boundary before the operation writes.
type Rule func(ctx context.Context, request Request) error

type registeredRule struct {
	name     string
	priority int
	rule     Rule
}

// Registry stores ordered validation rules. It is safe to register and evaluate rules
// concurrently; production callers should register during startup for stable behavior.
type Registry struct {
	mu    sync.RWMutex
	rules []registeredRule
}

func NewRegistry() *Registry {
	return &Registry{}
}

// RegisterRule adds a uniquely named rule. Lower priorities run first; equal priorities
// are ordered by name so execution does not depend on registration timing.
// Empty reports whether the registry has no rules.
func (r *Registry) Empty() bool {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return len(r.rules) == 0
}

func (r *Registry) RegisterRule(name string, priority int, rule Rule) error {
	if name == "" {
		return fmt.Errorf("write validation rule name cannot be empty")
	}
	if rule == nil {
		return fmt.Errorf("write validation rule %q cannot be nil", name)
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	for _, existing := range r.rules {
		if existing.name == name {
			return fmt.Errorf("write validation rule %q is already registered", name)
		}
	}

	r.rules = append(r.rules, registeredRule{name: name, priority: priority, rule: rule})
	sort.Slice(r.rules, func(i, j int) bool {
		if r.rules[i].priority == r.rules[j].priority {
			return r.rules[i].name < r.rules[j].name
		}
		return r.rules[i].priority < r.rules[j].priority
	})
	return nil
}

// Validate runs a snapshot of the registered rules in deterministic order.
func (r *Registry) Validate(ctx context.Context, request Request) error {
	return validate(ctx, r.snapshot(), request)
}

// ValidateAll validates a batch against one rules snapshot before its caller begins writes.
func (r *Registry) ValidateAll(ctx context.Context, requests []Request) error {
	rules := r.snapshot()
	for _, request := range requests {
		if err := validate(ctx, rules, request); err != nil {
			return err
		}
	}
	return nil
}

func (r *Registry) snapshot() []registeredRule {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return append([]registeredRule(nil), r.rules...)
}

func validate(ctx context.Context, rules []registeredRule, request Request) error {
	for _, entry := range rules {
		if err := entry.rule(ctx, cloneRequest(request)); err != nil {
			return err
		}
	}
	return nil
}

// ValidateWrite checks a request against the process-wide registry.
func ValidateWrite(ctx context.Context, request Request) error {
	return defaultRegistry.Validate(ctx, request)
}

// ValidateWrites checks a batch against the process-wide registry before its caller writes.
func ValidateWrites(ctx context.Context, requests []Request) error {
	return defaultRegistry.ValidateAll(ctx, requests)
}

func cloneRequest(request Request) Request {
	if request.Source != nil {
		request.Source = request.Source.Clone()
	}
	if request.Destination != nil {
		request.Destination = request.Destination.Clone()
	}
	return request
}

// Reject creates a client-visible invalid-parameters error for a rejected write.
func Reject(message string) error {
	return cellserrors.WithMessage(cellserrors.InvalidParameters, message)
}

var defaultRegistry = NewRegistry()

// DefaultRegistry returns the process-wide registry used by composed node clients.
func DefaultRegistry() *Registry { return defaultRegistry }

// RegisterRule registers a process-wide rule. Call this during startup before serving writes.
func RegisterRule(name string, priority int, rule Rule) error {
	return defaultRegistry.RegisterRule(name, priority, rule)
}

// WithRegisteredRules adds the default registry to a node router. Compose this in routers
// that expose writes to clients. No registered rules means existing behavior is unchanged.
func WithRegisteredRules() nodes.Option {
	return WithRegistry(defaultRegistry)
}

// WithRegistry adds a specific registry to a node router. It is primarily useful for
// isolated router compositions and tests.
func WithRegistry(registry *Registry) nodes.Option {
	if registry == nil {
		registry = NewRegistry()
	}
	return nodes.WithWrapper(&handler{registry: registry})
}

type handler struct {
	abstract.Handler
	registry *Registry
}

func (h *handler) Adapt(next nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	h.AdaptOptions(next, options)
	return h
}

func (h *handler) validate(ctx context.Context, request Request) error {
	return h.registry.Validate(ctx, request)
}

func (h *handler) CreateNode(ctx context.Context, request *tree.CreateNodeRequest, opts ...grpc.CallOption) (*tree.CreateNodeResponse, error) {
	if err := h.validate(ctx, Request{Operation: OperationCreate, Destination: request.GetNode()}); err != nil {
		return nil, err
	}
	return h.Next.CreateNode(ctx, request, opts...)
}

func (h *handler) UpdateNode(ctx context.Context, request *tree.UpdateNodeRequest, opts ...grpc.CallOption) (*tree.UpdateNodeResponse, error) {
	from, to := request.GetFrom(), request.GetTo()
	if from.GetPath() != to.GetPath() {
		if err := h.validate(ctx, Request{Operation: OperationMove, Source: from, Destination: to}); err != nil {
			return nil, err
		}
	}
	return h.Next.UpdateNode(ctx, request, opts...)
}

func (h *handler) PutObject(ctx context.Context, destination *tree.Node, reader io.Reader, request *models.PutRequestData) (models.ObjectInfo, error) {
	if err := h.validate(ctx, Request{Operation: OperationUpload, Destination: destination}); err != nil {
		return models.ObjectInfo{}, err
	}
	return h.Next.PutObject(ctx, destination, reader, request)
}

func (h *handler) CopyObject(ctx context.Context, source, destination *tree.Node, request *models.CopyRequestData) (models.ObjectInfo, error) {
	operation := OperationCopy
	if request != nil && request.IsMove() {
		operation = OperationMove
	}
	if err := h.validate(ctx, Request{Operation: operation, Source: source, Destination: destination}); err != nil {
		return models.ObjectInfo{}, err
	}
	return h.Next.CopyObject(ctx, source, destination, request)
}

func (h *handler) MultipartCreate(ctx context.Context, destination *tree.Node, request *models.MultipartRequestData) (string, error) {
	if err := h.validate(ctx, Request{Operation: OperationMultipartUpload, Destination: destination}); err != nil {
		return "", err
	}
	return h.Next.MultipartCreate(ctx, destination, request)
}

func (h *handler) MultipartPutObjectPart(ctx context.Context, destination *tree.Node, uploadID string, partNumber int, reader io.Reader, request *models.PutRequestData) (models.MultipartObjectPart, error) {
	if err := h.validate(ctx, Request{Operation: OperationMultipartUpload, Destination: destination}); err != nil {
		return models.MultipartObjectPart{PartNumber: partNumber}, err
	}
	return h.Next.MultipartPutObjectPart(ctx, destination, uploadID, partNumber, reader, request)
}

func (h *handler) MultipartComplete(ctx context.Context, destination *tree.Node, uploadID string, uploadedParts []models.MultipartObjectPart) (models.ObjectInfo, error) {
	if err := h.validate(ctx, Request{Operation: OperationMultipartUpload, Destination: destination}); err != nil {
		return models.ObjectInfo{}, err
	}
	return h.Next.MultipartComplete(ctx, destination, uploadID, uploadedParts)
}

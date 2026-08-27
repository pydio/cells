/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package manager

import (
	"context"
	"fmt"
	"io"
	"reflect"
	"runtime"
	"strings"
	"unsafe"

	"github.com/valyala/fasttemplate"
	"go.opentelemetry.io/otel/trace"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	registry2 "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/storage"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/telemetry/tracing"
	"github.com/pydio/cells/v5/common/utils/kv"
	"github.com/pydio/cells/v5/common/utils/openurl"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/std"
)

func init() {
	propagator.RegisterKeyInjector[Manager](managerKey{})

	openurl.RegisterTemplateInjector(func(_ context.Context, m map[string]any) error {
		m["Meta"] = map[string]any{}
		return nil
	})
}

type InitProvider interface {
	Init(ctx context.Context, store kv.Values) error
}

type ResolveOptions struct {
	Name             string
	CleanBeforeClose bool
}

type ResolveOption func(*ResolveOptions)

// ResolveExplanation describes the registry state used when resolving a DAO.
// It is intentionally side-effect free: storage connections are not opened and
// DAO handlers are not called.
type ResolveExplanation struct {
	ServiceName string
	ServiceID   string
	StorageName string
	Handlers    []ResolveHandler
	Storages    []ResolveStorage
	Edges       []ResolveEdge
	Attempts    []ResolveAttempt
}

type ResolveHandler struct {
	Name       string
	Parameters []string
}

type ResolveStorage struct {
	ID         string
	Name       string
	Driver     string
	ReturnType string
	Usable     bool
	returnType reflect.Type
}

type ResolveEdge struct {
	ID       string
	Name     string
	Vertices []string
	Metadata map[string]string
}

type ResolveAttempt struct {
	Handler       string
	Parameter     int
	ParameterType string
	StorageID     string
	HasEdge       bool
	Compatible    bool
	Reason        string
}

// Summary returns a compact, safe-to-log explanation. It deliberately omits
// storage metadata values, which may contain credentials or other secrets.
func (e *ResolveExplanation) Summary() string {
	if e == nil {
		return "no explanation available"
	}
	parts := []string{fmt.Sprintf("service=%s storage=%s handlers=%d storages=%d edges=%d", e.ServiceName, e.StorageName, len(e.Handlers), len(e.Storages), len(e.Edges))}
	for _, attempt := range e.Attempts {
		parts = append(parts, fmt.Sprintf("%s parameter[%d] %s storage=%s: %s", attempt.Handler, attempt.Parameter, attempt.ParameterType, attempt.StorageID, attempt.Reason))
	}
	return strings.Join(parts, "; ")
}

func WithName(name string) ResolveOption {
	return func(o *ResolveOptions) {
		o.Name = name
	}
}

func WithCleanBeforeClose() ResolveOption {
	return func(o *ResolveOptions) {
		o.CleanBeforeClose = true
	}
}

// ExplainResolve reports why the current service's DAO handlers can or cannot
// be matched to the storages and edges visible in the registry.
func ExplainResolve(ctx context.Context, opts ...ResolveOption) (*ResolveExplanation, error) {
	o := ResolveOptions{Name: "main"}
	for _, opt := range opts {
		opt(&o)
	}

	var reg registry.Registry
	if !propagator.Get(ctx, registry.ContextKey, &reg) {
		return nil, errors.WithMessage(errors.ResolveError, "cannot find registry in context")
	}
	var svc service.Service
	if !propagator.Get(ctx, service.ContextKey, &svc) {
		return nil, errors.WithMessage(errors.ResolveError, "cannot find service in context")
	}

	explanation := &ResolveExplanation{
		ServiceName: svc.Name(),
		ServiceID:   svc.ID(),
		StorageName: o.Name,
	}

	edges, err := reg.List(
		registry.WithType(registry2.ItemType_EDGE),
		registry.WithFilter(func(item registry.Item) bool {
			if item.Name() != "storage_"+o.Name {
				return false
			}
			var edge registry.Edge
			if !item.As(&edge) {
				return false
			}
			vertices := edge.Vertices()
			return len(vertices) >= 2 && vertices[0] == svc.ID()
		}),
	)
	if err != nil {
		return nil, errors.Tag(err, errors.ResolveError)
	}
	for _, item := range edges {
		var edge registry.Edge
		if item.As(&edge) {
			explanation.Edges = append(explanation.Edges, ResolveEdge{
				ID: edge.ID(), Name: edge.Name(), Vertices: append([]string(nil), edge.Vertices()...), Metadata: cloneStringMap(edge.Metadata()),
			})
		}
	}

	storages, err := reg.List(registry.WithType(registry2.ItemType_STORAGE))
	if err != nil {
		return nil, errors.Tag(err, errors.ResolveError)
	}
	for _, item := range storages {
		var st storage.Storage
		entry := ResolveStorage{ID: item.ID(), Name: item.Name(), Driver: item.Metadata()["driver"]}
		if item.As(&st) {
			entry.Usable = true
			if returnType := st.ReturnType(); returnType != nil {
				entry.returnType = returnType
				entry.ReturnType = returnType.String()
			}
		}
		explanation.Storages = append(explanation.Storages, entry)
	}

	for _, driver := range svc.Options().StorageOptions.SupportedDrivers[o.Name] {
		handlerType := reflect.TypeOf(driver.Handler)
		if handlerType == nil || handlerType.Kind() != reflect.Func {
			continue
		}
		handlerName := resolveHandlerName(driver.Handler)
		handler := ResolveHandler{Name: handlerName}
		for i := 0; i < handlerType.NumIn(); i++ {
			handler.Parameters = append(handler.Parameters, handlerType.In(i).String())
		}
		explanation.Handlers = append(explanation.Handlers, handler)

		start := 0
		if handlerType.NumIn() > 0 && handlerType.In(0).Implements(reflect.TypeOf((*context.Context)(nil)).Elem()) {
			start = 1
		}
		for parameter := start; parameter < handlerType.NumIn(); parameter++ {
			parameterType := handlerType.In(parameter)
			for _, storageEntry := range explanation.Storages {
				attempt := ResolveAttempt{
					Handler: handlerName, Parameter: parameter, ParameterType: parameterType.String(), StorageID: storageEntry.ID,
				}
				for _, edge := range explanation.Edges {
					if len(edge.Vertices) >= 2 && edge.Vertices[1] == storageEntry.ID {
						attempt.HasEdge = true
						break
					}
				}
				if !attempt.HasEdge {
					attempt.Reason = "no matching storage edge"
				} else if !storageEntry.Usable {
					attempt.Reason = "registry item cannot be converted to storage.Storage"
				} else if storageEntry.ReturnType == "" {
					attempt.Reason = "storage has no return type"
				} else if returnTypeAssignable(storageEntry.returnType, parameterType) {
					attempt.Compatible = true
					attempt.Reason = "compatible"
				} else {
					attempt.Reason = "storage return type is not assignable to parameter"
				}
				explanation.Attempts = append(explanation.Attempts, attempt)
			}
		}
	}

	return explanation, nil
}

func resolveHandlerName(handler any) string {
	value := reflect.ValueOf(handler)
	if value.IsValid() && value.Kind() == reflect.Func {
		if fn := runtime.FuncForPC(value.Pointer()); fn != nil {
			return fn.Name()
		}
	}
	return "<invalid handler>"
}

func cloneStringMap(input map[string]string) map[string]string {
	if input == nil {
		return nil
	}
	output := make(map[string]string, len(input))
	for key, value := range input {
		output[key] = value
	}
	return output
}

// returnTypeAssignable mirrors the useful part of the resolver's reflection
// check while keeping the explanation independent of opening a storage.
func returnTypeAssignable(returnType, parameterType reflect.Type) bool {
	if returnType == nil || parameterType == nil {
		return false
	}
	return returnType.AssignableTo(parameterType)
}

func Resolve[T any](ctx context.Context, opts ...ResolveOption) (s T, final error) {
	defer func() {
		if re := recover(); re != nil {
			if err, ok := re.(error); ok {
				final = errors.Tag(err, errors.ResolveError)
			} else if se, o := re.(string); o {
				final = errors.WithMessage(errors.ResolveError, se)
			}
		}
	}()

	o := ResolveOptions{
		Name: "main",
	}

	for _, opt := range opts {
		opt(&o)
	}

	var t T

	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "Resolve")
	defer span.End()

	span.AddEvent("Retrieving from context")

	// First we get the contextualized sotwRegistry
	var reg registry.Registry
	if !propagator.Get(ctx, registry.ContextKey, &reg) {
		return t, errors.WithMessage(errors.ResolveError, "cannot find sotwRegistry &reg in context")
	}

	// Then we get the service from the context
	var svc service.Service
	if !propagator.Get(ctx, service.ContextKey, &svc) {
		return t, errors.WithMessage(errors.ResolveError, "cannot find service &svc in context")
	}

	// And we load current config
	var cfg config.Store
	if !propagator.Get(ctx, config.ContextKey, &cfg) {
		//cfg = mg.GetConfig(ctx)
		//} else {
		return t, errors.WithMessage(errors.ResolveError, "cannot find manager to load configs")
	}

	//for {

	span.AddEvent("Before Listing")
	edges, err := reg.List(
		//registry.WithMeta("name", o.Name),
		registry.WithType(registry2.ItemType_EDGE),
		registry.WithFilter(func(item registry.Item) bool {
			if item.Name() != "storage_"+o.Name {
				return false
			}

			edge, ok := item.(registry.Edge)
			if !ok {
				return false
			}

			vv := edge.Vertices()

			if vv[0] == svc.ID() {
				return true
			}

			return false
		}),
	)
	if err != nil {
		return t, errors.Tag(err, errors.ResolveError)
	}
	span.AddEvent("After Listing Edges")

	storages, err := reg.List(
		registry.WithType(registry2.ItemType_STORAGE),
	)
	if err != nil {
		return t, errors.Tag(err, errors.ResolveError)
	}

	span.AddEvent("After Listing Storages")

	// Inject dao in handler
	for _, driver := range svc.Options().StorageOptions.SupportedDrivers[o.Name] {
		handler := driver.Handler
		handlerV := reflect.ValueOf(handler)
		handlerT := reflect.TypeOf(handler)
		if handlerV.Kind() != reflect.Func {
			return t, errors.WithMessage(errors.ResolveError, "storage handler is not a function")
		}

		var assigned int
		var args = make([]reflect.Value, handlerT.NumIn())

		// Check if first expected parameter is a context, if so, use the input context
		if handlerT.In(0).Implements(reflect.TypeOf((*context.Context)(nil)).Elem()) {
			args[0] = reflect.ValueOf(ctx)
			assigned++
		}

		// Try to fit Input parameter type and Storage types
		for _, edge := range registry.ItemsAs[registry.Edge](edges) {

			for _, st := range storages {
				if edge.Vertices()[1] == st.ID() {
					meta := edge.Metadata()
					resolutionData := make(map[string]string, len(meta))
					for k, v := range meta {
						t := fasttemplate.New(v, "{{", "}}")
						resolutionData[k] = t.ExecuteFuncString(func(w io.Writer, tag string) (int, error) {
							var s string
							propagator.Get(ctx, svc.Options().MigrateIterator.ContextKey, &s)

							return w.Write([]byte(s))
						})
					}

					var stt storage.Storage
					if st.As(&stt) {
						sttt, err := stt.Get(ctx, map[string]interface{}{"Meta": resolutionData})
						if err != nil {
							return t, errors.Tag(err, errors.ResolveError)
						}

						connT := reflect.TypeOf(sttt)
						conn := reflect.ValueOf(sttt)

						for pos := 0; pos < handlerT.NumIn(); pos++ {
							if connT.AssignableTo(handlerT.In(pos)) {
								args[pos] = conn
								assigned++
							}
						}
					}
				}
			}
		}

		// TODO - if we don't have all storages yet, we should wait for them to become available
		// The context timeout should decide how long we wait for the storage to become available
		if handlerT.NumIn() != assigned {
			continue
		}

		span.AddEvent("After Service Version")

		dao := handlerV.Call(args)[0].Interface()

		span.AddEvent("After Handler.Call")

		if initProvider, ok := dao.(InitProvider); ok {
			serviceConfigs := cfg.Context(ctx).Val(std.FormatPath("services", svc.Name()))
			if er := initProvider.Init(ctx, serviceConfigs); er != nil {
				return t, errors.Tag(er, errors.ResolveError)
			}
		}

		span.AddEvent("After Init")

		if conv, ok := dao.(T); ok {
			return conv, nil
		}

		return t, errors.WithMessage(errors.ResolveError, "cannot convert to T for "+svc.Name())
	}

	message := "could not find compatible storage for DAO parameter"
	if explanation, err := ExplainResolve(ctx, opts...); err == nil {
		message += ": " + explanation.Summary()
	}
	return t, errors.WithMessage(errors.ResolveError, message)
}

func CloseStoragesForContext(ctx context.Context, opts ...ResolveOption) error {
	o := ResolveOptions{
		Name: "main",
	}

	for _, opt := range opts {
		opt(&o)
	}

	// First we get the contextualized sotwRegistry
	var reg registry.Registry
	propagator.Get(ctx, registry.ContextKey, &reg)

	// Then we get the service from the context
	var svc service.Service
	if !propagator.Get(ctx, service.ContextKey, &svc) {
		return errors.New("resolve cannot find service &svc in context")
	}

	//ss := reg.ListAdjacentItems(
	//	sotwRegistry.WithAdjacentSourceItems([]sotwRegistry.Item{svc}),
	//	sotwRegistry.WithAdjacentTargetOptions(sotwRegistry.WithType(registry2.ItemType_STORAGE)),
	//	sotwRegistry.WithAdjacentEdgeOptions(sotwRegistry.WithMeta("name", o.Name)),
	//)
	//
	//for _, s := range sotwRegistry.ItemsAs[storage.Storage[any]](ss) {
	//	if o.CleanBeforeClose {
	//		if er := s.CloseConns(ctx, true); er != nil {
	//			return er
	//		}
	//	} else {
	//		if er := s.CloseConns(ctx); er != nil {
	//			return er
	//		}
	//	}
	//}

	return nil
}

func MustGetConfig(ctx context.Context) config.Store {
	var conf config.Store
	if !propagator.Get(ctx, config.ContextKey, &conf) {
		panic("manager must be set")
	}
	return conf
}

// StorageMigration produces a function for Resolving a storage.Migrator and apply its Migrate function
func StorageMigration(opts ...ResolveOption) func(ctx2 context.Context) error {
	return func(ctx context.Context) error {
		mig, err := Resolve[storage.Migrator](ctx, opts...)
		if err != nil {
			return errors.WithMessage(err, "could not resolve storage migrator")
		}
		log.Logger(ctx).Info("Running storage migration")
		return mig.Migrate(ctx)
	}
}

func printContextInternals(ctx interface{}, inner bool) {
	contextValues := reflect.ValueOf(ctx).Elem()
	contextKeys := reflect.TypeOf(ctx).Elem()

	if !inner {
		fmt.Printf("\nFields for %s.%s\n", contextKeys.PkgPath(), contextKeys.Name())
	}

	if contextKeys.Kind() == reflect.Struct {
		for i := 0; i < contextValues.NumField(); i++ {
			reflectValue := contextValues.Field(i)
			reflectValue = reflect.NewAt(reflectValue.Type(), unsafe.Pointer(reflectValue.UnsafeAddr())).Elem()

			reflectField := contextKeys.Field(i)

			if reflectField.Name == "Context" {
				printContextInternals(reflectValue.Interface(), true)
			} else {
				fmt.Printf("field name: %+v\n", reflectField.Name)
				fmt.Printf("value: %+v\n", reflectValue.Interface())
			}
		}
	} else {
		fmt.Printf("context is empty (int)\n")
	}
}

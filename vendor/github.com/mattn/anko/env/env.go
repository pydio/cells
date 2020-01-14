package env

import (
	"bytes"
	"errors"
	"fmt"
	"reflect"
	"sync"
)

type (
	// ExternalLookup for Env external lookup of values and types.
	ExternalLookup interface {
		Get(string) (reflect.Value, error)
		Type(string) (reflect.Type, error)
	}

	// Env is the environment needed for a VM to run in.
	Env struct {
		rwMutex        *sync.RWMutex
		parent         *Env
		values         map[string]reflect.Value
		types          map[string]reflect.Type
		externalLookup ExternalLookup
	}
)

var (
	// Packages is a where packages can be stored so VM import command can be used to import them.
	// reflect.Value must be valid or VM may crash.
	// For nil must use NilValue.
	Packages = make(map[string]map[string]reflect.Value)
	// PackageTypes is a where package types can be stored so VM import command can be used to import them
	// reflect.Type must be valid or VM may crash.
	// For nil type must use NilType.
	PackageTypes = make(map[string]map[string]reflect.Type)

	// NilType is the reflect.type of nil
	NilType = reflect.TypeOf(nil)
	// NilValue is the reflect.value of nil
	NilValue = reflect.New(reflect.TypeOf((*interface{})(nil)).Elem()).Elem()

	basicTypes = map[string]reflect.Type{
		"interface": reflect.ValueOf([]interface{}{int64(1)}).Index(0).Type(),
		"bool":      reflect.TypeOf(true),
		"string":    reflect.TypeOf("a"),
		"int":       reflect.TypeOf(int(1)),
		"int32":     reflect.TypeOf(int32(1)),
		"int64":     reflect.TypeOf(int64(1)),
		"uint":      reflect.TypeOf(uint(1)),
		"uint32":    reflect.TypeOf(uint32(1)),
		"uint64":    reflect.TypeOf(uint64(1)),
		"byte":      reflect.TypeOf(byte(1)),
		"rune":      reflect.TypeOf('a'),
		"float32":   reflect.TypeOf(float32(1)),
		"float64":   reflect.TypeOf(float64(1)),
	}

	// ErrSymbolContainsDot symbol contains .
	ErrSymbolContainsDot = errors.New("symbol contains '.'")
)

// NewEnv creates new global scope.
func NewEnv() *Env {
	return &Env{
		rwMutex: &sync.RWMutex{},
		values:  make(map[string]reflect.Value),
	}
}

// NewEnv creates new child scope.
func (e *Env) NewEnv() *Env {
	return &Env{
		rwMutex: &sync.RWMutex{},
		parent:  e,
		values:  make(map[string]reflect.Value),
	}
}

// NewModule creates new child scope and define it as a symbol.
// This is a shortcut for calling e.NewEnv then Define that new Env.
func (e *Env) NewModule(symbol string) (*Env, error) {
	module := &Env{
		rwMutex: &sync.RWMutex{},
		parent:  e,
		values:  make(map[string]reflect.Value),
	}
	return module, e.Define(symbol, module)
}

// SetExternalLookup sets an external lookup
func (e *Env) SetExternalLookup(externalLookup ExternalLookup) {
	e.externalLookup = externalLookup
}

// String returns string of values and types in current scope.
func (e *Env) String() string {
	var buffer bytes.Buffer
	e.rwMutex.RLock()

	if e.parent == nil {
		buffer.WriteString("No parent\n")
	} else {
		buffer.WriteString("Has parent\n")
	}

	for symbol, value := range e.values {
		buffer.WriteString(fmt.Sprintf("%v = %#v\n", symbol, value))
	}

	for symbol, aType := range e.types {
		buffer.WriteString(fmt.Sprintf("%v = %v\n", symbol, aType))
	}

	e.rwMutex.RUnlock()
	return buffer.String()
}

// GetEnvFromPath returns Env from path
func (e *Env) GetEnvFromPath(path []string) (*Env, error) {
	if len(path) < 1 {
		return e, nil
	}

	var value reflect.Value
	var ok bool
	for {
		// find starting env
		value, ok = e.values[path[0]]
		if ok {
			e, ok = value.Interface().(*Env)
			if ok {
				break
			}
		}
		if e.parent == nil {
			return nil, fmt.Errorf("no namespace called: %v", path[0])
		}
		e = e.parent
	}

	for i := 1; i < len(path); i++ {
		// find child env
		value, ok = e.values[path[i]]
		if ok {
			e, ok = value.Interface().(*Env)
			if ok {
				continue
			}
		}
		return nil, fmt.Errorf("no namespace called: %v", path[i])
	}

	return e, nil
}

// Copy the Env for current scope
func (e *Env) Copy() *Env {
	e.rwMutex.RLock()
	copy := Env{
		rwMutex:        &sync.RWMutex{},
		parent:         e.parent,
		values:         make(map[string]reflect.Value, len(e.values)),
		externalLookup: e.externalLookup,
	}
	for name, value := range e.values {
		copy.values[name] = value
	}
	if e.types != nil {
		copy.types = make(map[string]reflect.Type, len(e.types))
		for name, t := range e.types {
			copy.types[name] = t
		}
	}
	e.rwMutex.RUnlock()
	return &copy
}

// DeepCopy the Env for current scope and parent scopes.
// Note that each scope is a consistent snapshot but not the whole.
func (e *Env) DeepCopy() *Env {
	e = e.Copy()
	if e.parent != nil {
		e.parent = e.parent.DeepCopy()
	}
	return e
}

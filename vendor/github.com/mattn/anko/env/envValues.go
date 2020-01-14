package env

import (
	"fmt"
	"reflect"
	"strings"
)

// define

// Define defines/sets interface value to symbol in current scope.
func (e *Env) Define(symbol string, value interface{}) error {
	if value == nil {
		return e.DefineValue(symbol, NilValue)
	}
	return e.DefineValue(symbol, reflect.ValueOf(value))
}

// DefineValue defines/sets reflect value to symbol in current scope.
func (e *Env) DefineValue(symbol string, value reflect.Value) error {
	if strings.Contains(symbol, ".") {
		return ErrSymbolContainsDot
	}
	e.rwMutex.Lock()
	e.values[symbol] = value
	e.rwMutex.Unlock()

	return nil
}

// DefineGlobal defines/sets interface value to symbol in global scope.
func (e *Env) DefineGlobal(symbol string, value interface{}) error {
	for e.parent != nil {
		e = e.parent
	}
	return e.Define(symbol, value)
}

// DefineGlobalValue defines/sets reflect value to symbol in global scope.
func (e *Env) DefineGlobalValue(symbol string, value reflect.Value) error {
	for e.parent != nil {
		e = e.parent
	}
	return e.DefineValue(symbol, value)
}

// set

// Set interface value to the scope where symbol is frist found.
func (e *Env) Set(symbol string, value interface{}) error {
	if value == nil {
		return e.SetValue(symbol, NilValue)
	}
	return e.SetValue(symbol, reflect.ValueOf(value))
}

// SetValue reflect value to the scope where symbol is frist found.
func (e *Env) SetValue(symbol string, value reflect.Value) error {
	e.rwMutex.RLock()
	_, ok := e.values[symbol]
	e.rwMutex.RUnlock()
	if ok {
		e.rwMutex.Lock()
		e.values[symbol] = value
		e.rwMutex.Unlock()
		return nil
	}

	if e.parent == nil {
		return fmt.Errorf("undefined symbol '%s'", symbol)
	}
	return e.parent.SetValue(symbol, value)
}

// get

// Get returns interface value from the scope where symbol is frist found.
func (e *Env) Get(symbol string) (interface{}, error) {
	rv, err := e.GetValue(symbol)
	return rv.Interface(), err
}

// GetValue returns reflect value from the scope where symbol is frist found.
func (e *Env) GetValue(symbol string) (reflect.Value, error) {
	e.rwMutex.RLock()
	value, ok := e.values[symbol]
	e.rwMutex.RUnlock()
	if ok {
		return value, nil
	}

	if e.externalLookup != nil {
		var err error
		value, err = e.externalLookup.Get(symbol)
		if err == nil {
			return value, nil
		}
	}

	if e.parent == nil {
		return NilValue, fmt.Errorf("undefined symbol '%s'", symbol)
	}

	return e.parent.GetValue(symbol)
}

// delete

// Delete deletes symbol in current scope.
func (e *Env) Delete(symbol string) {
	e.rwMutex.Lock()
	delete(e.values, symbol)
	e.rwMutex.Unlock()
}

// DeleteGlobal deletes the first matching symbol found in current or parent scope.
func (e *Env) DeleteGlobal(symbol string) {
	if e.parent == nil {
		e.Delete(symbol)
		return
	}

	e.rwMutex.RLock()
	_, ok := e.values[symbol]
	e.rwMutex.RUnlock()

	if ok {
		e.Delete(symbol)
		return
	}

	e.parent.DeleteGlobal(symbol)
}

// Addr

// Addr returns reflect.Addr of value for first matching symbol found in current or parent scope.
func (e *Env) Addr(symbol string) (reflect.Value, error) {
	e.rwMutex.RLock()
	defer e.rwMutex.RUnlock()

	if v, ok := e.values[symbol]; ok {
		if v.CanAddr() {
			return v.Addr(), nil
		}
		return NilValue, fmt.Errorf("unaddressable")
	}
	if e.externalLookup != nil {
		v, err := e.externalLookup.Get(symbol)
		if err == nil {
			if v.CanAddr() {
				return v.Addr(), nil
			}
			return NilValue, fmt.Errorf("unaddressable")
		}
	}
	if e.parent == nil {
		return NilValue, fmt.Errorf("undefined symbol '%s'", symbol)
	}
	return e.parent.Addr(symbol)
}

package herodot

import (
	"fmt"
	"net/http"

	"github.com/pkg/errors"
)

type DefaultError struct {
	CodeField    int                      `json:"code,omitempty"`
	StatusField  string                   `json:"status,omitempty"`
	RIDField     string                   `json:"request,omitempty"`
	ReasonField  string                   `json:"reason,omitempty"`
	DebugField   string                   `json:"debug,omitempty"`
	DetailsField map[string][]interface{} `json:"details,omitempty"`
	ErrorField   string                   `json:"message"`

	trace errors.StackTrace
}

// StackTrace returns the error's stack trace.
func (e *DefaultError) StackTrace() errors.StackTrace {
	return e.trace
}

func (e *DefaultError) Status() string {
	return e.StatusField
}

func (e *DefaultError) Error() string {
	return e.ErrorField
}

func (e *DefaultError) RequestID() string {
	return e.RIDField
}

func (e *DefaultError) Reason() string {
	return e.ReasonField
}

func (e *DefaultError) Debug() string {
	return e.DebugField
}

func (e *DefaultError) Details() map[string][]interface{} {
	return e.DetailsField
}

func (e *DefaultError) StatusCode() int {
	return e.CodeField
}

func (e *DefaultError) WithReason(reason string) *DefaultError {
	err := *e
	err.ReasonField = reason
	return &err
}

func (e *DefaultError) WithReasonf(debug string, args ...interface{}) *DefaultError {
	return e.WithReason(fmt.Sprintf(debug, args...))
}

func (e *DefaultError) WithError(m string) *DefaultError {
	err := *e
	err.ErrorField = m
	return &err
}

func (e *DefaultError) WithErrorf(debug string, args ...interface{}) *DefaultError {
	return e.WithDebug(fmt.Sprintf(debug, args...))
}

func (e *DefaultError) WithDebugf(debug string, args ...interface{}) *DefaultError {
	return e.WithDebug(fmt.Sprintf(debug, args...))
}

func (e *DefaultError) WithDebug(debug string) *DefaultError {
	err := *e
	err.DebugField = debug
	return &err
}

func (e *DefaultError) WithDetail(key string, message ...interface{}) *DefaultError {
	err := *e
	if err.DetailsField == nil {
		err.DetailsField = map[string][]interface{}{}
	}
	err.DetailsField[key] = append(err.DetailsField[key], message...)
	return &err
}

func ToDefaultError(err error, id string) *DefaultError {
	var trace []errors.Frame
	var reason, status, debug string

	if e, ok := err.(stackTracer); ok {
		trace = e.StackTrace()
	}

	err = errors.Cause(err)

	statusCode := http.StatusInternalServerError
	details := map[string][]interface{}{}
	rid := id

	if e, ok := err.(statusCodeCarrier); ok {
		statusCode = e.StatusCode()
	}

	if e, ok := err.(reasonCarrier); ok {
		reason = e.Reason()
	}

	if e, ok := err.(requestIDCarrier); ok && e.RequestID() != "" {
		rid = e.RequestID()
	}

	if e, ok := err.(detailsCarrier); ok && e.Details() != nil {
		details = e.Details()
	}

	if e, ok := err.(statusCarrier); ok {
		status = e.Status()
	}

	if e, ok := err.(debugCarrier); ok {
		debug = e.Debug()
	}

	return &DefaultError{
		CodeField:    statusCode,
		ReasonField:  reason,
		RIDField:     rid,
		ErrorField:   err.Error(),
		DetailsField: details,
		StatusField:  status,
		DebugField:   debug,
		trace:        trace,
	}
}

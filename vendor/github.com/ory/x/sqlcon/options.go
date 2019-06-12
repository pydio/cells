package sqlcon

import "github.com/pborman/uuid"

type options struct {
	UseTracedDriver  bool
	OmitArgs         bool
	AllowRoot        bool
	forcedDriverName string
}

// OptionModifier is a wrapper for options.
type OptionModifier func(*options)

// WithDistributedTracing will make it so that a wrapped driver is used that supports the opentracing API.
func WithDistributedTracing() OptionModifier {
	return func(o *options) {
		o.UseTracedDriver = true
	}
}

// WithOmitArgsFromTraceSpans will make it so that query arguments are omitted from tracing spans.
func WithOmitArgsFromTraceSpans() OptionModifier {
	return func(o *options) {
		o.OmitArgs = true
	}
}

// WithAllowRoot will make it so that root spans will be created if a trace could not be found using
// opentracing's SpanFromContext method.
func WithAllowRoot() OptionModifier {
	return func(o *options) {
		o.AllowRoot = true
	}
}

// WithRandomDriverName is specifically for writing tests as you can't register a driver with the same name more than once.
func WithRandomDriverName() OptionModifier {
	return func(o *options) {
		o.forcedDriverName = uuid.New()
	}
}

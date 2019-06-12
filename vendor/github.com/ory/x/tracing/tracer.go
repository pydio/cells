package tracing

import (
	"fmt"
	"io"
	"strings"

	"github.com/opentracing/opentracing-go"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	jeagerConf "github.com/uber/jaeger-client-go/config"
)

// Tracer encapsulates tracing abilities.
type Tracer struct {
	ServiceName  string
	Provider     string
	Logger       logrus.FieldLogger
	JaegerConfig *JaegerConfig

	tracer opentracing.Tracer
	closer io.Closer
}

// JaegerConfig encapsulates jaeger's configuration.
type JaegerConfig struct {
	LocalAgentHostPort string
	SamplerType        string
	SamplerValue       float64
	SamplerServerURL   string
}

// Setup sets up the tracer. Currently supports jaeger.
func (t *Tracer) Setup() error {
	switch strings.ToLower(t.Provider) {
	case "jaeger":
		jc := jeagerConf.Configuration{
			Sampler: &jeagerConf.SamplerConfig{
				SamplingServerURL: t.JaegerConfig.SamplerServerURL,
				Type:              t.JaegerConfig.SamplerType,
				Param:             t.JaegerConfig.SamplerValue,
			},
			Reporter: &jeagerConf.ReporterConfig{
				LocalAgentHostPort: t.JaegerConfig.LocalAgentHostPort,
			},
		}

		closer, err := jc.InitGlobalTracer(
			t.ServiceName,
		)

		if err != nil {
			return err
		}

		t.closer = closer
		t.tracer = opentracing.GlobalTracer()
		t.Logger.Infof("Jaeger tracer configured!")
	case "":
		t.Logger.Infof("No tracer configured - skipping tracing setup")
	default:
		return errors.Errorf("unknown tracer: %s", t.Provider)
	}
	return nil
}

// IsLoaded returns true if the tracer has been loaded.
func (t *Tracer) IsLoaded() bool {
	if t == nil || t.tracer == nil {
		return false
	}
	return true
}

// Close closes the tracer.
func (t *Tracer) Close() {
	if t.closer != nil {
		err := t.closer.Close()
		if err != nil {
			t.Logger.Warn(err)
		}
	}
}

// HelpMessage returns a help message for CLIs using tracing.
func HelpMessage(defaultName string) string {
	return fmt.Sprintf(`- TRACING_PROVIDER: Set this to the tracing backend you wish to use. Currently supported tracing backends:
		- "": No tracing enabled (default)
		- "jaeger": Enables Jaeger tracing

	Example: TRACING_PROVIDER=jaeger

- TRACING_PROVIDER_JAEGER_SAMPLING_SERVER_URL: The address of Jaeger-agent's HTTP sampling server.

	Example: TRACING_PROVIDER_JAEGER_SAMPLING_SERVER_URL=http://localhost:5778/sampling

- TRACING_PROVIDER_JAEGER_SAMPLING_TYPE: The type of the sampler you want to use. Supported values:
		- const (default)
		- probabilistic
		- ratelimiting

	Example: TRACING_PROVIDER_JAEGER_SAMPLING_TYPE=const

- TRACING_PROVIDER_JAEGER_SAMPLING_VALUE: The value passed to the sampler type that has been configured.

	Supported values (dependant on sampling strategy used):
		- const: 0 or 1 (all or nothing)
		- rateLimiting: a constant rate (e.g. setting this to 3 will sample requests with the rate of 3 traces per second)
		- probabilistic: a value between 0..1

	Example: TRACING_PROVIDER_JAEGER_SAMPLING_VALUE=1

- TRACING_PROVIDER_JAEGER_LOCAL_AGENT_ADDRESS: The address of the jaeger-agent where spans should be sent to

	Example: TRACING_PROVIDER_JAEGER_LOCAL_AGENT_ADDRESS=127.0.0.1:6831

- TRACING_SERVICE_NAME: Specifies the service name to use on the tracer.
	Default: ORY Hydra

	Example: TRACING_SERVICE_NAME="%s"
`, defaultName)
}

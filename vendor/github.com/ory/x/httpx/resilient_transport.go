package httpx

import (
	"context"
	"net/http"
	"time"

	"github.com/cenkalti/backoff"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

var _ http.RoundTripper = new(ResilientRoundTripper)
var errRetry = errors.New("retry")

// RetryPolicy returns true if the request should be retried.
type RetryPolicy func(*http.Response, error) (retry bool)

// ResilientRoundTripper wraps a RoundTripper and retries requests on failure.
type ResilientRoundTripper struct {
	// RoundTripper the wrapped RoundTripper.
	http.RoundTripper

	// ShouldRetry defines a strategy for retries.
	ShouldRetry RetryPolicy

	MaxInterval    time.Duration
	MaxElapsedTime time.Duration
}

func defaultShouldRetry(res *http.Response, err error) bool {
	if err != nil || res.StatusCode == 0 || res.StatusCode >= 500 {
		return true
	}
	return false
}

// LoggedShouldRetry returns a RetryPolicy that logs erros.
func LoggedShouldRetry(l logrus.FieldLogger) RetryPolicy {
	return func(res *http.Response, err error) bool {
		if err != nil {
			l.WithError(err).Errorf("Unable to connect to DSN: %s", res.Request.URL.String())
			return true
		}
		if res.StatusCode == 0 || res.StatusCode >= 500 {
			l.WithError(errors.Errorf("received error status code %d", res.StatusCode)).Errorf("Unable to connect to DSN: %s", res.Request.URL.String())
			return true
		}
		return false
	}
}

// NewDefaultResilientRoundTripper returns a new ResilientRoundTripper with defaults.
func NewDefaultResilientRoundTripper(
	backOffMaxInterval time.Duration,
	backOffDieAfter time.Duration,
) *ResilientRoundTripper {
	return &ResilientRoundTripper{
		RoundTripper:   http.DefaultTransport,
		ShouldRetry:    defaultShouldRetry,
		MaxInterval:    backOffMaxInterval,
		MaxElapsedTime: backOffDieAfter,
	}
}

// NewResilientRoundTripper returns a new ResilientRoundTripper.
func NewResilientRoundTripper(
	roundTripper http.RoundTripper,
	backOffMaxInterval time.Duration,
	backOffDieAfter time.Duration,
) *ResilientRoundTripper {
	return &ResilientRoundTripper{
		RoundTripper:   roundTripper,
		ShouldRetry:    defaultShouldRetry,
		MaxInterval:    backOffMaxInterval,
		MaxElapsedTime: backOffDieAfter,
	}
}

// WithShouldRetry sets a RetryPolicy.
func (rt *ResilientRoundTripper) WithShouldRetry(policy RetryPolicy) *ResilientRoundTripper {
	rt.ShouldRetry = policy
	return rt
}

// RoundTrip executes a single HTTP transaction, returning
// a Response for the provided Request.
func (rt *ResilientRoundTripper) RoundTrip(r *http.Request) (*http.Response, error) {
	ctx, cancel := context.WithCancel(r.Context())
	bc := backoff.WithContext(&backoff.ExponentialBackOff{
		InitialInterval:     backoff.DefaultInitialInterval,
		RandomizationFactor: backoff.DefaultRandomizationFactor,
		Multiplier:          backoff.DefaultMultiplier,
		Clock:               backoff.SystemClock,
		MaxElapsedTime:      rt.MaxElapsedTime,
		MaxInterval:         rt.MaxInterval,
	}, ctx)
	bc.Reset()

	var res *http.Response
	err := backoff.Retry(func() (err error) {
		res, err = rt.RoundTripper.RoundTrip(r)
		if rt.ShouldRetry(res, err) {
			if err != nil {
				return errors.WithStack(err)
			}
			return errRetry
		}

		cancel()
		return errors.WithStack(err)
	}, bc)

	return res, err
}

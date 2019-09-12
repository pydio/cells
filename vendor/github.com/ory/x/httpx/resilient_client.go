package httpx

import (
	"net/http"
	"time"
)

// NewResilientClientLatencyToleranceSmall creates a new http.Client for environments with small latency tolerance.
// If transport is set (not nil) it will be wrapped by NewDefaultResilientRoundTripper.
func NewResilientClientLatencyToleranceSmall(rt http.RoundTripper) *http.Client {
	transport := NewDefaultResilientRoundTripper(time.Millisecond*50, time.Second)
	if rt != nil {
		transport = NewResilientRoundTripper(rt, time.Millisecond*50, time.Second)
	}

	return &http.Client{
		Timeout:   time.Millisecond * 500,
		Transport: transport,
	}
}

// NewResilientClientLatencyToleranceMedium creates a new http.Client for environments with medium latency tolerance.
// If transport is set (not nil) it will be wrapped by NewDefaultResilientRoundTripper.
// The client will stop requests after 5 seconds.
func NewResilientClientLatencyToleranceMedium(rt http.RoundTripper) *http.Client {
	transport := NewDefaultResilientRoundTripper(time.Millisecond*500, time.Second*5)
	if rt != nil {
		transport = NewResilientRoundTripper(rt, time.Millisecond*500, time.Second*5)
	}

	return &http.Client{
		Timeout:   time.Second,
		Transport: transport,
	}
}

// NewResilientClientLatencyToleranceHigh creates a new http.Client for environments with high latency tolerance.
// If transport is set (not nil) it will be wrapped by NewDefaultResilientRoundTripper.
// The client will stop requests after 15 seconds.
func NewResilientClientLatencyToleranceHigh(rt http.RoundTripper) *http.Client {
	transport := NewDefaultResilientRoundTripper(time.Second*5, time.Second*15)
	if rt != nil {
		transport = NewResilientRoundTripper(rt, time.Second*5, time.Second*15)
	}
	return &http.Client{
		Timeout:   time.Second * 5,
		Transport: transport,
	}
}

// NewResilientClientLatencyToleranceExtreme creates a new http.Client for environments with extreme latency tolerance.
// If transport is set (not nil) it will be wrapped by NewDefaultResilientRoundTripper.
// The client will stop requests after 30 minutes.
func NewResilientClientLatencyToleranceExtreme(rt http.RoundTripper) *http.Client {
	transport := NewDefaultResilientRoundTripper(time.Minute, time.Minute*30)
	if rt != nil {
		transport = NewResilientRoundTripper(rt, time.Minute, time.Minute*30)
	}
	return &http.Client{
		Timeout:   time.Minute,
		Transport: transport,
	}
}

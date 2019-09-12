package urlx

import (
	"net/url"

	"github.com/sirupsen/logrus"
)

// ParseOrPanic parses a url or panics.
func ParseOrPanic(in string) *url.URL {
	out, err := url.Parse(in)
	if err != nil {
		panic(err.Error())
	}
	return out
}

// ParseOrFatal parses a url or fatals.
func ParseOrFatal(l logrus.FieldLogger, in string) *url.URL {
	out, err := url.Parse(in)
	if err != nil {
		l.WithError(err).Fatalf("Unable to parse url: %s", in)
	}
	return out
}

// ParseRequestURIOrPanic parses a request uri or panics.
func ParseRequestURIOrPanic(in string) *url.URL {
	out, err := url.ParseRequestURI(in)
	if err != nil {
		panic(err.Error())
	}
	return out
}

// ParseRequestURIOrFatal parses a request uri or fatals.
func ParseRequestURIOrFatal(l logrus.FieldLogger, in string) *url.URL {
	out, err := url.ParseRequestURI(in)
	if err != nil {
		l.WithError(err).Fatalf("Unable to parse url: %s", in)
	}
	return out
}

package corsx

import (
	"net/http"
	"strings"

	"github.com/rs/cors"
	"github.com/sirupsen/logrus"

	"github.com/ory/x/viperx"
)

func p(prefix string) string {
	if len(prefix) > 0 {
		prefix = strings.TrimRight(prefix, ".") + "."
	}

	return prefix
}

// ParseOptions parses CORS settings by using the `viper` framework.
func ParseOptions(l logrus.FieldLogger, prefix string) cors.Options {
	prefix = p(prefix)
	return cors.Options{
		AllowedOrigins:     viperx.GetStringSlice(l, prefix+"cors.allowed_origins", []string{}, "CORS_ALLOWED_ORIGINS"),
		AllowedMethods:     viperx.GetStringSlice(l, prefix+"cors.allowed_methods", []string{"GET", "POST", "PUT", "PATCH", "DELETE"}, "CORS_ALLOWED_METHODS"),
		AllowedHeaders:     viperx.GetStringSlice(l, prefix+"cors.allowed_headers", []string{"Authorization", "Content-Type"}, "CORS_ALLOWED_HEADERS"),
		ExposedHeaders:     viperx.GetStringSlice(l, prefix+"cors.exposed_headers", []string{"Content-Type"}, "CORS_EXPOSED_HEADERS"),
		AllowCredentials:   viperx.GetBool(l, prefix+"cors.allow_credentials", true, "CORS_ALLOWED_CREDENTIALS"),
		OptionsPassthrough: viperx.GetBool(l, prefix+"cors.options_passthrough", false),
		MaxAge:             viperx.GetInt(l, prefix+"cors.max_age", 0, "CORS_MAX_AGE"),
		Debug:              viperx.GetBool(l, prefix+"cors.debug", false, "CORS_DEBUG"),
	}
}

// IsEnabled returns true when CORS is enabled.
func IsEnabled(l logrus.FieldLogger, prefix string) bool {
	prefix = p(prefix)
	return viperx.GetBool(l, prefix+"cors.enabled", false, "CORS_ENABLED")
}

// Initialize starts the CORS middleware for a http.Handler when cors is enabled.
func Initialize(h http.Handler, l logrus.FieldLogger, prefix string) http.Handler {
	if IsEnabled(l, prefix) {
		return cors.New(ParseOptions(l, prefix)).Handler(h)
	}

	return h
}

package logrusx

import (
	"github.com/sirupsen/logrus"

	"github.com/ory/viper"

	"github.com/ory/x/stringsx"
)

// New initializes logrus with environment variable configuration LOG_LEVEL and LOG_FORMAT.
func New() *logrus.Logger {
	l := logrus.New()
	ll, err := logrus.ParseLevel(
		stringsx.Coalesce(
			viper.GetString("log.level"),
			viper.GetString("LOG_LEVEL"),
		),
	)
	if err != nil {
		ll = logrus.InfoLevel
	}
	l.Level = ll

	if stringsx.Coalesce(
		viper.GetString("log.format"),
		viper.GetString("LOG_FORMAT"),
	) == "json" {
		l.Formatter = new(logrus.JSONFormatter)
	}

	return l
}

// HelpMessage returns a string containing a help message for setting up the logger.
func HelpMessage() string {
	return `- LOG_LEVEL: Set the log level, supports "panic", "fatal", "error", "warn", "info" and "debug". Defaults to "info".

	Example: LOG_LEVEL=panic

- LOG_FORMAT: Leave empty for text based log format, or set to "json" for JSON formatting.

	Example: LOG_FORMAT=json`
}

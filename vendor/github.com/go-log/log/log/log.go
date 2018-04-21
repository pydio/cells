package log

import (
	golog "log"

	"github.com/go-log/log"
)

type logLogger struct{}

var (
	_ log.Logger = New()
)

func (t *logLogger) Log(v ...interface{}) {
	golog.Print(v...)
}

func (t *logLogger) Logf(format string, v ...interface{}) {
	golog.Printf(format, v...)
}

func New() *logLogger {
	return &logLogger{}
}

package otlp

import (
	"context"
	"net/url"
	"os"

	bridge "github.com/odigos-io/opentelemetry-zap-bridge"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v4/common/log"
)

func init() {
	log.DefaultURLMux().RegisterCore("otlp", &opener{})
}

type opener struct{}

func (o *opener) OpenCore(ctx context.Context, u *url.URL, _ zapcore.Encoder, level zapcore.LevelEnabler) (zapcore.Core, error) {
	u.Scheme = "http"

	if err := os.Setenv("OTEL_EXPORTER_OTLP_ENDPOINT", u.String()); err == nil {
		_ = os.Setenv("OTEL_SERVICE_NAME", "cells")
	}

	return zapcore.NewIncreaseLevelCore(bridge.NewOtelZapCore(), level)
}

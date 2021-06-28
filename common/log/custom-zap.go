package log

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// DangerouslyZapSmallSlice is a simple clone for zap.Any, allowing the linter
// to consider the slice zap as legitimate. It informs the developer to make sure
// that the slice passed must be small, otherwise it can hang the internal logger
func DangerouslyZapSmallSlice(key string, value interface{}) zapcore.Field {
	return zap.Any(key, value)
}

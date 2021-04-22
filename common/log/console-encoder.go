package log

import (
	"fmt"
	"strings"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/service/context"
	"go.uber.org/zap/buffer"
	"go.uber.org/zap/zapcore"
)

func newColorConsoleEncoder(config zapcore.EncoderConfig) zapcore.Encoder {
	return &colorConsoleEncoder{Encoder: zapcore.NewConsoleEncoder(config)}
}

var (
	ConsoleSkipKeys = []string{
		// Tracing Keys
		common.KeySpanUuid,
		common.KeySpanRootUuid,
		common.KeySpanParentUuid,
		common.KeySchedulerJobId,
		common.KeySchedulerActionPath,
		common.KeySchedulerTaskId,
		// Claims Keys
		common.KeyUsername,
		common.KeyUserUuid,
		common.KeyGroupPath,
		common.KeyProfile,
		common.KeyRoles,
		// HTTP Meta Keys
		servicecontext.HttpMetaRemoteAddress,
		servicecontext.HttpMetaUserAgent,
		servicecontext.HttpMetaContentType,
		servicecontext.HttpMetaProtocol,
	}
)

type colorConsoleEncoder struct {
	zapcore.Encoder
}

func (c *colorConsoleEncoder) AddString(key string, value string) {
	for _, k := range ConsoleSkipKeys {
		if k == key {
			return
		}
	}
	c.Encoder.AddString(key, value)
}

func (c *colorConsoleEncoder) Clone() zapcore.Encoder {
	return &colorConsoleEncoder{Encoder: c.Encoder.Clone()}
}

func (c *colorConsoleEncoder) EncodeEntry(e zapcore.Entry, ff []zapcore.Field) (*buffer.Buffer, error) {
	color := servicecontext.ServiceColorOther
	if strings.HasPrefix(e.LoggerName, common.ServiceGrpcNamespace_) {
		color = servicecontext.ServiceColorGrpc
	} else if strings.HasPrefix(e.LoggerName, common.ServiceRestNamespace_) {
		color = servicecontext.ServiceColorRest
	}
	e.LoggerName = fmt.Sprintf("\x1b[%dm%s\x1b[0m", color, e.LoggerName)
	return c.Encoder.EncodeEntry(e, ff)
}

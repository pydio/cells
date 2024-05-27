package file

import (
	"context"
	"net/url"
	"strconv"

	"go.uber.org/zap/zapcore"
	lumberjack "gopkg.in/natefinch/lumberjack.v2"

	"github.com/pydio/cells/v4/common/log"
)

func init() {
	log.DefaultURLMux().RegisterSync("file", &op{})
}

type op struct{}

func (o *op) OpenSync(ctx context.Context, u *url.URL) (zapcore.WriteSyncer, error) {
	lj := &lumberjack.Logger{
		Filename:   u.Path,
		MaxSize:    10, // megabytes
		MaxBackups: 100,
		MaxAge:     28, // days
		Compress:   false,
	}
	params := u.Query()
	if s := params.Get("maxSize"); s != "" {
		if i, e := strconv.Atoi(s); e == nil {
			lj.MaxSize = i
		}
	}
	if s := params.Get("maxBackups"); s != "" {
		if i, e := strconv.Atoi(s); e == nil {
			lj.MaxBackups = i
		}
	}
	if s := params.Get("maxAge"); s != "" {
		if i, e := strconv.Atoi(s); e == nil {
			lj.MaxAge = i
		}
	}
	if s := params.Get("compress"); s == "true" {
		lj.Compress = true
	}
	return zapcore.AddSync(lj), nil

}

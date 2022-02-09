package dao

import (
	"net/url"
	"strconv"
	"strings"
)

const DefaultRotationSize = int64(200 * 1024 * 1024)

type BleveConfig struct {
	BlevePath    string
	MappingName  string
	RotationSize int64
}

func (b *BleveConfig) Open(dsn string) (Conn, error) {
	b.BlevePath = dsn
	b.MappingName = "docs"
	b.RotationSize = DefaultRotationSize
	if strings.Contains(dsn, "?") {
		parts := strings.Split(dsn, "?")
		b.BlevePath = parts[0]
		if values, er := url.ParseQuery(parts[1]); er == nil {
			if rs := values.Get("rotationSize"); rs != "" {
				if prs, e := strconv.ParseInt(rs, 10, 64); e == nil {
					b.RotationSize = prs
				}
			}
			if mn := values.Get("mapping"); mn != "" {
				b.MappingName = mn
			}
		}
	}
	return b, nil
}

func (b *BleveConfig) GetConn() Conn {
	return b
}

func (b *BleveConfig) SetMaxConnectionsForWeight(_ int) {}

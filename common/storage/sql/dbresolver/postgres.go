package dbresolver

import (
	"github.com/lib/pq"
)

func IsPostGreConn(conn any) bool {
	_, ok := conn.(*pq.Driver)
	return ok
}

package sql

import (
	"context"
	"database/sql"
	"github.com/pydio/cells/v4/common/log"
	"time"

	"github.com/pydio/cells/v4/common/service/metrics"
)

var (
	ConnectionOpenTimeout = 60 * time.Second
	ConnectionOpenRetries = 10 * time.Second
)

func GetSqlConnection(ctx context.Context, driver string, dsn string) (*sql.DB, error) {
	if db, err := sql.Open(driver, dsn); err != nil {
		return nil, err
	} else {
		if err := pingWithRetries(ctx, db); err != nil {
			return nil, err
		}
		computeStats(ctx, db)
		return db, nil
	}
}

func pingWithRetries(ctx context.Context, db *sql.DB) error {
	//var lastErr error
	if err := db.Ping(); err == nil {
		return nil
	} else {
		//lastErr = err
		log.Logger(ctx).Warn("[SQL] Server does not answer yet, will retry in 10 seconds...")
	}
	tick := time.NewTicker(ConnectionOpenRetries)
	// timeout := time.NewTimer(ConnectionOpenTimeout)
	defer tick.Stop()
	// defer timeout.Stop()
	for {
		select {
		case <-tick.C:
			if err := db.Ping(); err == nil {
				return nil
			} else {
				// lastErr = err
				log.Logger(ctx).Warn("[SQL] Server does not answer yet, will retry in 10 seconds...")
			}
			//case <-timeout.C:
			//	return lastErr
		}
	}
}

func computeStats(ctx context.Context, db *sql.DB) {
	go func() {
		for {
			select {
			case <-time.After(30 * time.Second):
				s := db.Stats()
				metrics.GetMetrics().Gauge("db_open_connections").Update(float64(s.OpenConnections))
			case <-ctx.Done():
				return
			}
		}
	}()
}

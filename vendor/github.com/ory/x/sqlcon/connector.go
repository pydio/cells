/*
 * Copyright © 2015-2018 Aeneas Rekkas <aeneas+oss@aeneas.io>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author		Aeneas Rekkas <aeneas+oss@aeneas.io>
 * @copyright 	2015-2018 Aeneas Rekkas <aeneas+oss@aeneas.io>
 * @license 	Apache-2.0
 */

// Package sqlcon provides helpers for dealing with SQL connectivity.
package sqlcon

import (
	"database/sql"
	"fmt"
	"net/url"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
	"github.com/luna-duclos/instrumentedsql"
	"github.com/luna-duclos/instrumentedsql/opentracing"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"

	"github.com/ory/x/resilience"
	"github.com/ory/x/stringslice"
)

// SQLConnection represents a connection to a SQL database.
type SQLConnection struct {
	DSN string
	L   logrus.FieldLogger

	db            *sqlx.DB
	driverName    string
	driverPackage string
	options
}

// NewSQLConnection returns a new SQLConnection.
func NewSQLConnection(dsn string, l logrus.FieldLogger, opts ...OptionModifier) (*SQLConnection, error) {
	if l == nil {
		logger := logrus.New()

		// Basically avoids any logging because no one uses panics
		// logger.Level = logrus.PanicLevel

		l = logger
	}

	connection := &SQLConnection{DSN: dsn, L: l}
	for _, opt := range opts {
		opt(&connection.options)
	}

	return connection, nil
}

func cleanURLQuery(in url.Values) (out url.Values) {
	out, _ = url.ParseQuery(in.Encode())
	out.Del("max_conns")
	out.Del("max_idle_conns")
	out.Del("max_conn_lifetime")
	out.Del("parseTime")
	return out
}

// GetDatabaseRetry tries to connect to a database and fails after failAfter.
func (c *SQLConnection) GetDatabaseRetry(maxWait time.Duration, failAfter time.Duration) (*sqlx.DB, error) {
	if err := resilience.Retry(c.L, maxWait, failAfter, func() (err error) {
		c.db, err = c.GetDatabase()
		if err != nil {
			c.L.WithError(err).Error("Unable to connect to database, retrying...")
			return err
		}
		return nil
	}); err != nil {
		return nil, errors.WithStack(err)
	}

	return c.db, nil
}

func classifyDSN(dsn string) string {
	scheme := strings.Split(dsn, "://")[0]
	parts := strings.Split(dsn, "@")
	host := parts[len(parts)-1]
	return fmt.Sprintf("%s://*:*@%s", scheme, host)
}

// GetDatabase returns a database instance.
func (c *SQLConnection) GetDatabase() (*sqlx.DB, error) {
	if c.db != nil {
		return c.db, nil
	}

	driverName, driverPackage, err := c.registerDriver()
	if err != nil {
		return nil, errors.Wrap(err, "could not register driver")
	}

	dsn, err := connectionString(c.DSN)
	if err != nil {
		return nil, err
	}

	classifiedDSN := classifyDSN(dsn)
	c.L.WithField("dsn", classifiedDSN).Info("Establishing connection with SQL database backend")

	db, err := sql.Open(driverName, dsn)
	if err != nil {
		c.L.WithError(err).WithField("dsn", classifiedDSN).Error("Unable to open SQL connection")
		return nil, errors.Wrapf(err, "could not open SQL connection")
	}

	c.db = sqlx.NewDb(db, driverPackage) // This must be clean.Scheme otherwise things like `Rebind()` won't work
	if err := c.db.Ping(); err != nil {
		c.L.WithError(err).WithField("dsn", classifiedDSN).Error("Unable to ping SQL database backend")
		return nil, errors.Wrapf(err, "could not ping SQL connection")
	}

	c.L.WithField("dsn", classifiedDSN).Info("Successfully connected to SQL database backend")

	_, query, err := parseQuery(c.DSN)
	if err != nil {
		return nil, err
	}

	maxConns := maxParallelism() * 2
	if v := query.Get("max_conns"); v != "" {
		s, err := strconv.ParseInt(v, 10, 64)
		if err != nil {
			c.L.WithError(err).Warnf(`Query parameter "max_conns" value %v could not be parsed to int, falling back to default value %d`, v, maxConns)
		} else {
			maxConns = int(s)
		}
	}

	maxIdleConns := maxParallelism()
	if v := query.Get("max_idle_conns"); v != "" {
		s, err := strconv.ParseInt(v, 10, 64)
		if err != nil {
			c.L.Warnf("max_idle_conns value %s could not be parsed to int: %s", v, err)
			c.L.WithError(err).Warnf(`Query parameter "max_idle_conns" value %v could not be parsed to int, falling back to default value %d`, v, maxIdleConns)
		} else {
			maxIdleConns = int(s)
		}
	}

	maxConnLifetime := time.Duration(0)
	if v := query.Get("max_conn_lifetime"); v != "" {
		s, err := time.ParseDuration(v)
		if err != nil {
			c.L.WithError(err).Warnf(`Query parameter "max_conn_lifetime" value %v could not be parsed to int, falling back to default value %d`, v, maxConnLifetime)
		} else {
			maxConnLifetime = s
		}
	}

	c.db.SetMaxOpenConns(maxConns)
	c.db.SetMaxIdleConns(maxIdleConns)
	c.db.SetConnMaxLifetime(maxConnLifetime)

	return c.db, nil
}

func maxParallelism() int {
	maxProcs := runtime.GOMAXPROCS(0)
	numCPU := runtime.NumCPU()
	if maxProcs < numCPU {
		return maxProcs
	}
	return numCPU
}

func parseQuery(dsn string) (clean string, query url.Values, err error) {
	query = url.Values{}
	parts := strings.Split(dsn, "?")
	clean = parts[0]
	if len(parts) == 2 {
		if query, err = url.ParseQuery(parts[1]); err != nil {
			return "", query, errors.WithStack(err)
		}
	}
	return
}

func connectionString(dsn string) (string, error) {
	dsn, query, err := parseQuery(dsn)
	if err != nil {
		return "", err
	}

	query = cleanURLQuery(query)
	if strings.HasPrefix(dsn, "mysql://") {
		query.Set("parseTime", "true")
		dsn = strings.TrimPrefix(dsn, "mysql://")
	}

	if strings.HasPrefix(dsn, "cockroach://") {
		dsn = strings.Replace(dsn, "cockroach://", "postgres://", -1)
	}

	return dsn + "?" + query.Encode(), nil
}

// registerDriver checks if tracing is enabled and registers a custom "instrumented-sql-driver" driver that internally
// wraps the proper driver (mysql/postgres) with an instrumented driver.
func (c *SQLConnection) registerDriver() (string, string, error) {
	if c.driverName != "" {
		return c.driverName, c.driverPackage, nil
	}

	scheme := strings.Split(c.DSN, "://")[0]
	driverName := scheme
	driverPackage := scheme

	if c.UseTracedDriver {
		driverName = "instrumented-sql-driver"
		if len(c.options.forcedDriverName) > 0 {
			driverName = c.options.forcedDriverName
		}

		tracingOpts := []instrumentedsql.Opt{instrumentedsql.WithTracer(opentracing.NewTracer(c.AllowRoot))}
		if c.OmitArgs {
			tracingOpts = append(tracingOpts, instrumentedsql.WithOmitArgs())
		}

		if !stringslice.Has(sql.Drivers(), driverName) {
			switch scheme {
			case "mysql":
				sql.Register(driverName,
					instrumentedsql.WrapDriver(mysql.MySQLDriver{}, tracingOpts...))
			case "cockroach":
				sql.Register(driverName,
					instrumentedsql.WrapDriver(&pq.Driver{}, tracingOpts...))
			case "postgres":
				// Why does this have to be a pointer? Because the Open method for postgres has a pointer receiver
				// and does not satisfy the driver.Driver interface.
				sql.Register(driverName,
					instrumentedsql.WrapDriver(&pq.Driver{}, tracingOpts...))
			default:
				return "", "", fmt.Errorf("unsupported scheme (%s) in DSN", scheme)
			}
		}
	} else if driverName == "cockroach" {
		// If we're not using the instrumented driver, we need to replace "cockroach" with "postgres"
		driverName = "postgres"
	}

	switch scheme {
	case "cockroach":
		driverPackage = "postgres"
	}

	c.driverName = driverName
	c.driverPackage = driverPackage
	return driverName, driverPackage, nil
}

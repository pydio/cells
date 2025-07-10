package sql

import (
	"context"
	"crypto/tls"
	"database/sql"
	"fmt"
	"net/url"
	"os"
	"path"
	"strconv"
	"strings"
	"text/template"
	"time"

	"github.com/go-sql-driver/mysql"
	pgx "github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/spf13/viper"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"github.com/pydio/cells/v5/common/crypto"
	"github.com/pydio/cells/v5/common/errors"
	pb "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

var (
	reservedVariables = map[string]string{
		"prefix":                   "",
		"policies":                 "",
		"singular":                 "",
		"hookNames":                "",
		"ssl":                      "",
		"maxConnections":           "10",
		"maxIdleConnections":       "5",
		"connMaxLifetime":          "1m",
		crypto.KeyCertUUID:         "",
		crypto.KeyCertCAUUID:       "",
		crypto.KeyCertKeyUUID:      "",
		crypto.KeyCertStoreName:    "",
		crypto.KeyCertInsecureHost: "",
	}
)

type StorageDSN interface {
	// Parse parses standard DSN and extract reserved variables
	Parse() error
	// Driver returns driver type
	Driver() string
	// DBName returns the name of the target DB as extracted from the dsn string
	DBName() string
	// DSN returns clean DSN for opening DB
	DSN() string
	// OpenDB Opens a DB connection
	OpenDB(ctx context.Context) (*sql.DB, error)
	// Set updates a field from the DSN, like DB, User, Password, etc. it returns an error if the key is not supported
	Set(key, value string) error
	// GetReservedVar returns a parsed variable if it is set
	GetReservedVar(string) string
	// Check tests the connection and eventually creates the DB if it does not exists
	Check(ctx context.Context, create bool) error
}

func NewStorageDSN(dsn string) (StorageDSN, error) {
	parts := strings.SplitN(dsn, "://", 2)
	if len(parts) < 2 {
		return nil, errors.WithMessage(errors.SqlDAO, "wrong format")
	}
	scheme := parts[0]
	vv := make(map[string]string, len(reservedVariables))
	for k, v := range reservedVariables {
		vv[k] = v
	}
	cd := &cellDsn{
		original: dsn,
		scheme:   scheme,
		vars:     vv,
	}
	if err := cd.Parse(); err != nil {
		return nil, err
	}
	return cd, nil
}

type cellDsn struct {
	original string
	clean    string
	scheme   string
	vars     map[string]string
}

func (d *cellDsn) Parse() (er error) {
	switch d.scheme {
	case "gorm":
		gU, _ := url.Parse(d.original)
		d.scheme = gU.Query().Get("driver")
		d.clean, er = d.cleanDSN(d.original, "gorm")
	case MySQLDriver:
		d.clean, er = d.cleanDSN(d.original, "mysql")
	case SqliteDriver, PostgreDriver:
		d.clean, er = d.cleanDSN(d.original, "url")
	default:
		return errors.WithMessage(errors.SqlDAO, "unsupported scheme")
	}
	if er != nil {
		return er
	}
	// Remove scheme for everything else than mysql
	if d.scheme != PostgreDriver {
		d.clean = strings.TrimPrefix(d.clean, d.scheme+"://")
	}
	return nil
}

func (d *cellDsn) Driver() string {
	return d.scheme
}

func (d *cellDsn) DSN() string {
	return d.clean
}

func (d *cellDsn) OpenDB(ctx context.Context) (*sql.DB, error) {
	var conn *sql.DB
	var tlsConfig *tls.Config
	var er error

	if d.vars["ssl"] == "true" {
		tlsConfig, er = varsToTLSConfig(d.vars)
		if er != nil {
			return nil, er
		}
	}

	// Open sql connection pool - special case to force PG to use PGX driver, not PQ
	switch d.scheme {
	case PostgreDriver:
		pgxConfig, err := pgx.ParseConfig(d.clean)
		if err != nil {
			return nil, err
		}
		if tlsConfig != nil {
			pgxConfig.TLSConfig = tlsConfig
		}

		conn = stdlib.OpenDB(*pgxConfig)
	case MySQLDriver:
		openClean := d.clean // copy for possible TLS modification
		if tlsConfig != nil {
			configID := uuid.New()
			if err := mysql.RegisterTLSConfig(configID, &tls.Config{}); err != nil {
				return nil, err
			}
			if !strings.Contains(openClean, "?") {
				openClean += "?tls=" + configID
			} else {
				openClean += "&tls=" + configID
			}
		}
		conn, er = sql.Open(d.scheme, openClean)
		if er != nil {
			return nil, er
		}

		maxIdleConnections, err := strconv.Atoi(d.vars["maxIdleConnections"])
		if err != nil {
			return nil, err
		}

		maxOpenConnections, err := strconv.Atoi(d.vars["maxConnections"])
		if err != nil {
			return nil, err
		}

		connMaxLifetime, err := time.ParseDuration(d.vars["connMaxLifetime"])
		if err != nil {
			return nil, err
		}

		log.Logger(ctx).Info("MySQL Config", zap.Any("maxOpenConns", maxOpenConnections), zap.Any("maxIdleConns", maxIdleConnections), zap.Any("connMaxLifetime", connMaxLifetime))
		conn.SetMaxIdleConns(maxIdleConnections)
		conn.SetMaxOpenConns(maxOpenConnections)
		conn.SetConnMaxLifetime(connMaxLifetime)
	default:
		conn, er = sql.Open(d.scheme, d.clean)
	}
	return conn, er

}

func (d *cellDsn) DBName() string {
	switch d.scheme {
	case MySQLDriver:
		md, _ := mysql.ParseDSN(d.clean)
		return md.DBName
	default:
		u, _ := url.Parse(d.original)
		return u.Path
	}
}

func (d *cellDsn) Set(key, value string) error {
	var md *mysql.Config
	var u *url.URL
	var er error

	switch d.scheme {
	case MySQLDriver:
		md, er = mysql.ParseDSN(d.clean)
	default:
		u, er = url.Parse(d.original)
	}
	if er != nil {
		return er
	}

	switch key {
	case "DB":
		if md != nil {
			md.DBName = value
		} else if u != nil {
			u.Path = value
		}
	case "ADDR":
		if md != nil {
			md.Addr = value
		} else if u != nil {
			u.Host = value
		}
	case "USER":
		if md != nil {
			md.User = value
		} else if u != nil {
			pwd := ""
			if u.User != nil {
				pwd, _ = u.User.Password()
			}
			u.User = url.UserPassword(value, pwd)
		}
	case "PASSWORD":
		if md != nil {
			md.User = value
		} else if u != nil {
			user := ""
			if u.User != nil {
				user = u.User.Username()
			}
			u.User = url.UserPassword(user, value)
		}
	default:
		return errors.WithMessage(errors.SqlDAO, "unsupported key")
	}

	// Now recompute clean DSN
	if md != nil {
		d.clean = md.FormatDSN()
	} else if u != nil {
		d.original = u.String()
		return d.Parse()
	}
	return nil
}

func (d *cellDsn) GetReservedVar(s string) string {
	return d.vars[s]
}

func (d *cellDsn) Check(ctx context.Context, create bool) error {
	// return nil
	tmpl, err := template.New("storages").Parse(`
storages:
  {{ with .Root }}
  root:
    uri: {{ . }}
  {{ end }}
  main:
    uri: {{ .Main }}
`)
	if err != nil {
		return err
	}

	var yamlTpl strings.Builder

	switch d.scheme {
	case MySQLDriver, PostgreDriver:
		rootDSN, _ := NewStorageDSN(d.original)
		var root string
		if d.scheme == PostgreDriver {
			_ = rootDSN.Set("DB", "postgres")
			root = rootDSN.DSN()
		} else {
			_ = rootDSN.Set("DB", "")
			root = "mysql://" + rootDSN.DSN()
		}
		if err = tmpl.Execute(&yamlTpl, struct {
			Root string
			Main string
		}{
			Root: root,
			Main: d.original,
		}); err != nil {
			return err
		}
	default:
		if err = tmpl.Execute(&yamlTpl, struct {
			Main string
			Root string
		}{
			Main: d.original,
		}); err != nil {
			return err
		}
	}

	// BUILD A LOCAL RUNTIME MANAGER
	localRuntime := viper.New()
	bootstrap, err := manager.NewBootstrap(ctx, localRuntime)
	if err != nil {
		return err
	}
	if err := bootstrap.RegisterTemplate(ctx, "yaml", yamlTpl.String()); err != nil {
		return err
	}
	bootstrap.MustReset(ctx, nil)
	localRuntime.Set(runtime.KeyBootstrapYAML, bootstrap)
	runtime.GetRuntime().Set(runtime.KeyBootstrapYAML, bootstrap)
	mgr, err := manager.NewManager(ctx, runtime.NsInstall, nil, localRuntime)
	if err != nil {
		return err
	}
	if err := mgr.Bootstrap(bootstrap.String()); err != nil {
		return err
	}
	item, err := mgr.Registry().Get("main", registry.WithType(pb.ItemType_STORAGE))
	if err != nil {
		return err
	}

	var st storage.Storage
	if !item.As(&st) {
		return errors.WithMessage(errors.SqlDAO, "registry item not found")
	}

	resolved, err := st.Resolve(ctx)
	if err != nil {
		return err
	}
	resolvedDSN, err := NewStorageDSN(resolved)
	if err != nil {
		return err
	}

	// First try a ping
	var dbNotFound bool
	if _, err = st.Get(ctx); err != nil {
		switch resolvedDSN.Driver() {
		case MySQLDriver:
			if me, ok := err.(*mysql.MySQLError); ok && me.Number == 1049 {
				dbNotFound = true
			}
		case PostgreDriver:
			if strings.Contains(err.Error(), "3D000") {
				dbNotFound = true
			}
		case SqliteDriver:
			if errors.Is(err, os.ErrNotExist) {
				dbNotFound = true
			}
		}
		if !dbNotFound {
			return err
		}
	} else {
		return nil
	}

	if create {
		log.Logger(ctx).Infof("Database %s not found in %s, trying to create it, this may require some specific permissions", resolvedDSN.DSN(), d.original)
		switch resolvedDSN.Driver() {
		case SqliteDriver:
			dbPath := resolvedDSN.DBName()
			dir := path.Dir(dbPath)
			if s, e := os.Stat(dir); e == nil {
				if !s.IsDir() {
					return fmt.Errorf("%s is not a directory", dir)
				}
			} else if er := os.MkdirAll(dir, 0755); er == nil {
			} else {
				return fmt.Errorf("cannot create directory %s: %v", dir, e)
			}
		case MySQLDriver, PostgreDriver:
			dbName := strings.Trim(resolvedDSN.DBName(), "/")
			rootItem, err := mgr.Registry().Get("root", registry.WithType(pb.ItemType_STORAGE))
			if err != nil {
				return err
			}

			var rootSt storage.Storage
			rootItem.As(&rootSt)

			rootDB, err := rootSt.Get(ctx)
			if err != nil {
				return errors.New("couldn't get root storage")
			}

			rootGormDB, ok := rootDB.(*gorm.DB)
			if !ok {
				return errors.New("not a gorm DB")
			}
			if tx := rootGormDB.Exec(fmt.Sprintf("create database %s", dbName)); tx.Error != nil {
				return tx.Error
			}
		}

	}
	return nil
}

func (d *cellDsn) cleanDSN(dsn string, parserType string) (string, error) {
	switch parserType {
	case "mysql":
		conf, err := mysql.ParseDSN(dsn)
		if err != nil {
			return "", err
		}
		for k := range d.vars {
			if v, ok := conf.Params[k]; ok {
				if v != "<no value>" {
					d.vars[k] = v
				}
				delete(conf.Params, k)
			}
		}
		return conf.FormatDSN(), nil
	case "gorm":
		u, er := url.Parse(dsn)
		if er != nil {
			return dsn, er
		}
		query := u.Query()
		driver := query.Get("driver")
		if driver == "" {
			return "", fmt.Errorf("please provide a driver parameter for gorm scheme")
		}
		query.Del("driver")
		// Replace scheme
		u.Scheme = driver
		if u.Scheme == "mysql" {
			conn := query.Get("conn")
			query.Del("conn")
			u.Host = fmt.Sprintf("%s(%s:%s)", conn, u.Hostname(), u.Port())
			u.RawQuery = query.Encode()
			return d.cleanDSN(u.String(), "mysql")
		} else {
			u.RawQuery = query.Encode()
			return d.cleanDSN(u.String(), "url")
		}
	default:
		u, er := url.Parse(dsn)
		if er != nil {
			return dsn, er
		}
		query := u.Query()
		for k := range d.vars {
			if query.Has(k) {
				if query.Get(k) != "<no value>" {
					d.vars[k] = query.Get(k)
				}
				query.Del(k)
			}
		}
		u.RawQuery = query.Encode()
		return u.String(), nil
	}
}

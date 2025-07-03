/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package lib

import (
	"context"
	"crypto/sha1"
	"database/sql"
	"errors"
	"fmt"
	"io"
	"os"
	"path"
	"regexp"
	"strings"
	"text/template"

	"github.com/go-sql-driver/mysql"
	"github.com/spf13/viper"
	"gorm.io/gorm"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/proto/install"
	pb "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

var (
	ErrMySQLCharsetNotSupported = errors.New("Charset is not supported for this version of MySQL")
	ErrMySQLVersionNotSupported = errors.New("This version of the database is currently not supported")
)

func dsnFromInstallConfig(c *install.InstallConfig) (string, error) {

	var err error

	var conf *mysql.Config

	switch c.GetDbConnectionType() {
	case "tcp":
		conf, err = addDatabaseTCPConnection(c)
	case "socket":
		conf, err = addDatabaseSocketConnection(c)
	case "manual":
		return c.GetDbManualDSN(), nil
	default:
		return "", fmt.Errorf("Unknown type")
	}

	if err != nil {
		return "", err
	}

	conf.ParseTime = true

	// Check DB Connection
	// TODO - HARDCODE SCHEME FOR NOW
	dsn := "mysql://" + conf.FormatDSN() + "&prefix={{.Meta.prefix}}&policies={{.Meta.policies}}&singular={{.Meta.singular}}"

	return dsn, nil

}

func installDocumentDSN(ctx context.Context, c *install.InstallConfig) error {
	if c.UseDocumentsDSN && strings.HasPrefix(c.DocumentsDSN, "mongodb://") {
		if err := config.SetDatabase(ctx, "mongodb", "mongodb", c.DocumentsDSN, "documentsDSN"); err != nil {
			return err
		}
	} else {
		if err := config.SetDatabase(ctx, "boltdb", "bolt", "boltdb://{{ autoMkdir (serviceDataDir .Service) }}/{{ .Meta.file }}", ""); err != nil {
			return err
		}

		if err := config.SetDatabase(ctx, "bleve", "bleve", "bleve://{{ autoMkdir (serviceDataDir .Service) }}/{{ .Meta.file }}", ""); err != nil {
			return err
		}
	}

	return nil
}

// DATABASES
func actionDatabaseAdd(ctx context.Context, c *install.InstallConfig, flags byte) error {

	// First removing the old install
	config.Del(ctx, "databases")

	if er := installDocumentDSN(ctx, c); er != nil {
		return er
	}

	if flags&InstallDSNOnly != 0 {
		return config.Save(ctx, "cli", "Installed new Document DSN")
	}

	dsn, err := dsnFromInstallConfig(c)
	if err != nil {
		return err
	}

	if e := checkConnection(ctx, dsn); e != nil {
		return e
	}

	h := sha1.New()
	_, _ = io.WriteString(h, dsn)
	id := fmt.Sprintf("%x", h.Sum(nil))

	if e := config.SetDatabase(ctx, id, "sql", dsn, "database"); e != nil {
		return e
	}

	return config.Save(ctx, "cli", "Install / Setting Databases")
}

func addDatabaseTCPConnection(c *install.InstallConfig) (*mysql.Config, error) {
	conf := mysql.NewConfig()

	conf.User = c.GetDbTCPUser()
	conf.Passwd = c.GetDbTCPPassword()
	conf.Net = "tcp"
	conf.Addr = fmt.Sprintf("%s:%s", c.GetDbTCPHostname(), c.GetDbTCPPort())
	conf.DBName = c.GetDbTCPName()

	return conf, nil
}

func addDatabaseSocketConnection(c *install.InstallConfig) (*mysql.Config, error) {
	conf := mysql.NewConfig()

	conf.User = c.GetDbSocketUser()
	conf.Passwd = c.GetDbSocketPassword()
	conf.Net = "unix"
	conf.Addr = c.GetDbSocketFile()
	conf.DBName = c.GetDbSocketName()

	return conf, nil
}

func addDatabaseManualConnection(c *install.InstallConfig) (*mysql.Config, error) {
	// DSN has already been validated - no need to check the error
	conf, _ := mysql.ParseDSN(c.GetDbManualDSN())

	return conf, nil
}

func checkConnection(ctx context.Context, dsn string) error {
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

	var str strings.Builder

	if strings.HasPrefix(dsn, "mysql") {
		rootconf, _ := mysql.ParseDSN(dsn)
		rootconf.DBName = ""

		rootdsn := rootconf.FormatDSN()

		if err := tmpl.Execute(&str, struct {
			Root string
			Main string
		}{
			Root: rootdsn,
			Main: dsn,
		}); err != nil {
			return err
		}
	} else {
		if err := tmpl.Execute(&str, struct {
			Main string
			Root string
		}{
			Main: dsn,
		}); err != nil {
			return err
		}
	}

	localRuntime := viper.New()

	bootstrap, err := manager.NewBootstrap(ctx, localRuntime)
	if err != nil {
		return err
	}

	if err := bootstrap.RegisterTemplate(ctx, "yaml", str.String()); err != nil {
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
	if item.As(&st) {
		resolvedDSN, err := st.Resolve(ctx)

		if strings.HasPrefix(resolvedDSN, "sqlite") {
			dir := path.Dir(resolvedDSN[9:])
			if s, e := os.Stat(dir); e == nil {
				if !s.IsDir() {
					return fmt.Errorf("%s is not a directory", dir)
				}
			} else if er := os.MkdirAll(dir, 0755); er == nil {
			} else {
				return fmt.Errorf("cannot create directory %s: %v", dir, e)
			}
		}

		if strings.HasPrefix(dsn, "mysql") {
			rootconf, _ := mysql.ParseDSN(resolvedDSN)
			dbname := rootconf.DBName

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

			if tx := rootGormDB.Exec(fmt.Sprintf("create database if not exists %s", dbname)); tx.Error != nil {
				return tx.Error
			}
		}

		db, err := st.Get(ctx)
		if err != nil {
			return err
		}

		gormDB, ok := db.(*gorm.DB)
		if !ok {
			return errors.New("not a gorm DB")
		}

		sqlDB, err := gormDB.DB()
		if err != nil {
			return err
		}

		if err := sqlDB.Ping(); err != nil {
			return err
		}
	}

	//for {
	//	st, err := ctrl.Open(context.Background(), "mysql://"+dsn)
	//	if err != nil {
	//		return err
	//	} else {
	/* Open doesn't open a connection. Validate DSN data:
	c, cf := context.WithTimeout(context.Background(), 3*time.Second)
	defer cf()
	if err := db.PingContext(c); err != nil && strings.HasPrefix(err.Error(), "Error 1049") {
		rootconf, _ := mysql.ParseDSN(dsn)
		dbname := rootconf.DBName
		rootconf.DBName = ""

		rootdsn := rootconf.FormatDSN()

		if rootdb, rooterr := sql.Open("mysql+tls", rootdsn); rooterr != nil {
			return rooterr
		} else {
			version, err := getMysqlVersion(rootdb)
			if err != nil {
				return err
			}

			if err := checkMysqlCompat(version); err != nil {
				return err
			}

			errCharset := checkMysqlCharset(rootdb, version)
			switch {
			case errCharset == ErrMySQLCharsetNotSupported:
				dbname = dbname + " CHARACTER SET utf8 COLLATE utf8_general_ci"
			case errCharset != nil:
				return errCharset
			}

			if _, err = rootdb.Exec(fmt.Sprintf("create database if not exists %s", dbname)); err != nil {
				return err
			}
		}
	} else if err != nil {
		return err
	} else {
		version, err := getMysqlVersion(db)
		if err != nil {
			return err
		}

		if err := checkMysqlCompat(version); err != nil {
			return err
		}
		if err := checkMysqlCharset(db, version); err != nil {
			return err
		}

		break
	}
	*/
	//	}
	//
	//	fmt.Println(st)
	//}
	return nil
}

func getMysqlVersion(db *sql.DB) (string, error) {
	// Here we check the version of mysql and the default charset
	var version string
	err := db.QueryRow("SELECT VERSION()").Scan(&version)
	switch {
	case err == sql.ErrNoRows:
		return "", fmt.Errorf("Could not retrieve your mysql version - Please create the database manually and retry")
	case err != nil:
		return "", err
	}

	return version, nil
}

func checkMysqlCompat(version string) error {
	mysql8022Matched, err := regexp.MatchString("^8.0.22$", version)
	if err != nil {
		return fmt.Errorf("Could not determine db version")
	}

	if mysql8022Matched {
		log.Error(ErrMySQLVersionNotSupported.Error())
		return ErrMySQLVersionNotSupported
	}

	return nil
}

func checkMysqlCharset(db *sql.DB, version string) error {
	// Matches
	mysqlMatched, err1 := regexp.MatchString("^5.[456].*$", version)
	mariaMatched, err2 := regexp.MatchString("^10.1.*-MariaDB$", version)

	if err1 != nil || err2 != nil {
		return fmt.Errorf("Could not determine db version")
	}

	if mysqlMatched || mariaMatched {
		var charname, charvalue string
		err := db.QueryRow("SHOW VARIABLES LIKE 'character_set_database'").Scan(&charname, &charvalue)
		switch {
		case err == sql.ErrNoRows:
			return fmt.Errorf("Could not retrieve your default charset - Please create the database manually and retry")
		case err != nil:
			return err
		default:
		}

		if charvalue == "utf8mb4" {
			return ErrMySQLCharsetNotSupported
		}
	}

	return nil
}

func checkCellsInstallExists(dsn string) (install bool, admin bool, e error) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return
	}
	rows, er := db.Query("SHOW TABLES LIKE 'idm_user_%'")
	if er != nil {
		return
	}
	defer rows.Close()
	//var tables []string
	var table string
	var iut, iua bool
	for rows.Next() {
		if er = rows.Scan(&table); er == nil {
			switch table {
			case "idm_user_idx_tree":
				iut = true
			case "idm_user_attributes":
				iua = true
			}
		}
	}
	if iut && iua {
		install = true
		q := "SELECT count(t.name) FROM `idm_user_idx_tree` as t , `idm_user_attributes` as a WHERE (a.name = 'profile' AND a.value = 'admin') AND (t.uuid = a.uuid) LIMIT 1"
		var count int
		if er := db.QueryRow(q).Scan(&count); er == nil && count > 0 {
			admin = true
		}
	}

	return
}

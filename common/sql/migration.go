/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package sql

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"path"
	"sort"
	"strings"

	"github.com/pydio/cells/v4/common/utils/statics"

	migrate "github.com/rubenv/sql-migrate"
)

type byId []*migrate.Migration

func (b byId) Len() int           { return len(b) }
func (b byId) Swap(i, j int)      { b[i], b[j] = b[j], b[i] }
func (b byId) Less(i, j int) bool { return b[i].Less(b[j]) }

// FSMigrationSource is a set of migrations loaded from a packr box.
type FSMigrationSource struct {
	Box statics.FS

	// Path in the box to use.
	Dir string

	TablePrefix string
}

var _ migrate.MigrationSource = (*FSMigrationSource)(nil)

func (p FSMigrationSource) FindMigrations() ([]*migrate.Migration, error) {
	migrations := make([]*migrate.Migration, 0)
	items := p.Box.List()

	prefix := ""
	dir := path.Clean(p.Dir)
	if dir != "." {
		prefix = fmt.Sprintf("%s/", dir)
	}

	for _, item := range items {
		// On windows, items can have \\ (not packed) or / (packed)
		lookup := strings.Replace(item, "\\", "/", -1)
		if !strings.HasPrefix(lookup, prefix) {
			continue
		}
		name := strings.TrimPrefix(lookup, prefix)
		if strings.Contains(name, "/") {
			continue
		}

		// Making sure we have the table prefix
		name = p.TablePrefix + "_" + name

		if strings.HasSuffix(name, ".sql") {

			file, e := p.Box.Open(item)
			if e != nil {
				return nil, e
			}
			data, _ := ioutil.ReadAll(file)
			file.Close()
			content := bytes.Replace(data, []byte("%%PREFIX%%"), []byte(p.TablePrefix), -1)

			migration, err := migrate.ParseMigration(name, bytes.NewReader(content))
			if err != nil {
				return nil, err
			}

			migrations = append(migrations, migration)
		}
	}

	// Make sure migrations are sorted
	sort.Sort(byId(migrations))

	return migrations, nil
}

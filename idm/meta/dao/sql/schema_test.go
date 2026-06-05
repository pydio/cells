//go:build storage || sql

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
	"sync"
	"testing"

	"gorm.io/driver/mysql"
	"gorm.io/gorm/schema"
)

func TestMetaValueJoinTableUsesMySQLCompatibleUUIDTypes(t *testing.T) {
	namer := &schema.NamingStrategy{TablePrefix: "idm_usr_"}
	cache := &sync.Map{}
	dialector := mysql.New(mysql.Config{SkipInitializeWithVersion: true}).(*mysql.Dialector)

	metaSchema, err := schema.Parse(&Meta{}, cache, namer)
	if err != nil {
		t.Fatal(err)
	}
	if field := metaSchema.LookUpField("uuid"); field == nil {
		t.Fatal("missing Meta uuid field")
	} else if got := dialector.DataTypeOf(field); got != "varchar(255)" {
		t.Fatalf("Meta uuid MySQL type = %q, want varchar(255)", got)
	}

	evSchema, err := schema.Parse(&EntityValues{}, cache, namer)
	if err != nil {
		t.Fatal(err)
	}
	rel := evSchema.Relationships.Relations["Metas"]
	if rel == nil || rel.JoinTable == nil {
		t.Fatal("missing Metas join table relation")
	}

	for _, name := range []string{"e_value_uuid", "meta_uuid"} {
		field := rel.JoinTable.LookUpField(name)
		if field == nil {
			t.Fatalf("missing join table field %s", name)
		}
		if got := dialector.DataTypeOf(field); got != "varchar(255)" {
			t.Fatalf("join table field %s MySQL type = %q, want varchar(255)", name, got)
		}
	}
}

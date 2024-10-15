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
	"database/sql"
	"reflect"

	"gorm.io/gorm"
	"gorm.io/gorm/schema"
)

type OrderedUpdate struct {
	Key   string
	Value interface{}
}

type Helper interface {
	Concat(...string) string
	Hash(...string) string
	HashParent(nameKey string, levelKey string, mpathes ...string) string
	ApplyOrderedUpdates(db *gorm.DB, tableName string, sets []OrderedUpdate, wheres []sql.NamedArg) (int64, error)
	MPathOrdering(...string) string
}

// TableNameFromModel computes table name from model using standard GORM strategy
func TableNameFromModel(db *gorm.DB, model any) string {
	value := reflect.ValueOf(model)
	if value.Kind() == reflect.Ptr && value.IsNil() {
		value = reflect.New(value.Type().Elem())
	}
	modelType := reflect.Indirect(value).Type()

	tableName := db.NamingStrategy.TableName(modelType.Name())
	modelValue := reflect.New(modelType)
	if tabler, ok := modelValue.Interface().(schema.Tabler); ok {
		tableName = tabler.TableName()
	}
	if tabler, ok := modelValue.Interface().(schema.TablerWithNamer); ok {
		tableName = tabler.TableName(db.NamingStrategy)
	}
	return tableName
}

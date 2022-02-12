/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package mongodb

import (
	"fmt"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/utils/configx"
)

const Driver = "mongodb"

func init() {
	dao.RegisterDAODriver(Driver, NewDAO, func(driver, dsn string) dao.ConnDriver {
		return &mongodb{}
	})
	dao.RegisterIndexerDriver(Driver, NewIndexer)
}

// DAO defines the functions specific to the boltdb dao
type DAO interface {
	dao.DAO
	DB() *mongo.Database
}

// Handler for the main functions of the DAO
type Handler struct {
	dao.DAO
}

// NewDAO creates a new handler for the boltdb dao
func NewDAO(driver string, dsn string, prefix string) (dao.DAO, error) {
	conn, err := dao.NewConn(driver, dsn)
	if err != nil {
		return nil, err
	}
	if prefix == "" {
		fmt.Println("Warning, mongodb DAO must provide a prefix")
	}
	return &Handler{
		DAO: dao.NewDAO(conn, driver, prefix),
	}, nil
}

// Init initialises the handler
func (h *Handler) Init(cfg configx.Values) error {
	return nil
}

// DB returns the bolt DB object
func (h *Handler) DB() *mongo.Database {
	if h == nil {
		return nil
	}

	if conn := h.GetConn(); conn != nil {
		client := conn.(*mongo.Client)
		return client.Database(h.Prefix())
	}
	return nil
}

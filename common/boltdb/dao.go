// Package BoltDB provides tools for using Bolt as a standard persistence layer for services
package boltdb

import (
	"github.com/pydio/cells/common/dao"
	"github.com/pydio/cells/x/configx"
	bolt "go.etcd.io/bbolt"
)

// DAO defines the functions specific to the boltdb dao
type DAO interface {
	dao.DAO
	DB() *bolt.DB
}

// Handler for the main functions of the DAO
type Handler struct {
	dao.DAO
}

// NewDAO creates a new handler for the boltdb dao
func NewDAO(driver string, dsn string, prefix string) *Handler {
	conn, err := dao.NewConn(driver, dsn)
	if err != nil {
		return nil
	}
	return &Handler{
		DAO: dao.NewDAO(conn, driver, prefix),
	}
}

// Init initialises the handler
func (h *Handler) Init(configx.Values) error {
	return nil
}

// DB returns the bolt DB object
func (h *Handler) DB() *bolt.DB {
	if h == nil {
		return nil
	}

	if conn := h.GetConn(); conn != nil {
		return conn.(*bolt.DB)
	}
	return nil
}

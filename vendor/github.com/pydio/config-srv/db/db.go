package db

import (
	"errors"

	proto "github.com/pydio/config-srv/proto/config"
)

type DB interface {
	Init() error
	Create(*proto.Change) error
	Read(id string) (*proto.Change, error)
	Update(*proto.Change) error
	Delete(*proto.Change) error
	Search(id, author string, limit, offset int64) ([]*proto.Change, error)
	AuditLog(from, to int64, limit, offset int64, reverse bool) ([]*proto.ChangeLog, error)
}

var (
	db DB

	ErrNotFound = errors.New("not found")
)

func Register(backend DB) {
	db = backend
}

func Init() error {
	return db.Init()
}

func Create(ch *proto.Change) error {
	return db.Create(ch)
}

func Read(id string) (*proto.Change, error) {
	return db.Read(id)
}

func Update(ch *proto.Change) error {
	return db.Update(ch)
}

func Delete(ch *proto.Change) error {
	return db.Delete(ch)
}

func Search(id, author string, limit, offset int64) ([]*proto.Change, error) {
	return db.Search(id, author, limit, offset)
}

func AuditLog(from, to, limit, offset int64, reverse bool) ([]*proto.ChangeLog, error) {
	return db.AuditLog(from, to, limit, offset, reverse)
}

package storage

import "fmt"

func UnsupportedDriver(storage Storage) error {
	return &UnsupportedDriverTypeErr{Driver: fmt.Sprintf("%v", storage)}
}

type UnsupportedDriverTypeErr struct {
	Driver string
}

func (u *UnsupportedDriverTypeErr) Error() string {
	return fmt.Sprintf("DAO: unsupported driver type %s", u.Driver)
}

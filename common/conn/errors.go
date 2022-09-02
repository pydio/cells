package conn

import "fmt"

func UnknownDriverType(name string) error {
	return &UnknownDriverTypeErr{Driver: name}
}

type UnknownDriverTypeErr struct {
	Driver string
}

func (u *UnknownDriverTypeErr) Error() string {
	return fmt.Sprintf("DAO: unknown driver type %s, maybe it was not properly registered", u.Driver)
}

func UnsupportedDriverType(name string) error {
	return &UnsupportedDriverTypeErr{Driver: name}
}

func UnsupportedDriver(o Conn) error {
	return &UnsupportedDriverTypeErr{Driver: fmt.Sprintf("%v", o)}
}

type UnsupportedDriverTypeErr struct {
	Driver string
}

func (u *UnsupportedDriverTypeErr) Error() string {
	return fmt.Sprintf("DAO: unsupported driver type %s", u.Driver)
}

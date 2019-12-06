package packages

import (
	"fmt"
	"reflect"

	"github.com/mattn/anko/env"
)

func init() {
	env.Packages["fmt"] = map[string]reflect.Value{
		"Errorf":   reflect.ValueOf(fmt.Errorf),
		"Fprint":   reflect.ValueOf(fmt.Fprint),
		"Fprintf":  reflect.ValueOf(fmt.Fprintf),
		"Fprintln": reflect.ValueOf(fmt.Fprintln),
		"Fscan":    reflect.ValueOf(fmt.Fscan),
		"Fscanf":   reflect.ValueOf(fmt.Fscanf),
		"Fscanln":  reflect.ValueOf(fmt.Fscanln),
		"Print":    reflect.ValueOf(fmt.Print),
		"Printf":   reflect.ValueOf(fmt.Printf),
		"Println":  reflect.ValueOf(fmt.Println),
		"Scan":     reflect.ValueOf(fmt.Scan),
		"Scanf":    reflect.ValueOf(fmt.Scanf),
		"Scanln":   reflect.ValueOf(fmt.Scanln),
		"Sprint":   reflect.ValueOf(fmt.Sprint),
		"Sprintf":  reflect.ValueOf(fmt.Sprintf),
		"Sprintln": reflect.ValueOf(fmt.Sprintln),
		"Sscan":    reflect.ValueOf(fmt.Sscan),
		"Sscanf":   reflect.ValueOf(fmt.Sscanf),
		"Sscanln":  reflect.ValueOf(fmt.Sscanln),
	}
}

package packages

import (
	"log"
	"reflect"

	"github.com/mattn/anko/env"
)

func init() {
	env.Packages["log"] = map[string]reflect.Value{
		"Fatal":     reflect.ValueOf(log.Fatal),
		"Fatalf":    reflect.ValueOf(log.Fatalf),
		"Fatalln":   reflect.ValueOf(log.Fatalln),
		"Flags":     reflect.ValueOf(log.Flags),
		"New":       reflect.ValueOf(log.New),
		"Output":    reflect.ValueOf(log.Output),
		"Panic":     reflect.ValueOf(log.Panic),
		"Panicf":    reflect.ValueOf(log.Panicf),
		"Panicln":   reflect.ValueOf(log.Panicln),
		"Prefix":    reflect.ValueOf(log.Prefix),
		"Print":     reflect.ValueOf(log.Print),
		"Printf":    reflect.ValueOf(log.Printf),
		"Println":   reflect.ValueOf(log.Println),
		"SetFlags":  reflect.ValueOf(log.SetFlags),
		"SetOutput": reflect.ValueOf(log.SetOutput),
		"SetPrefix": reflect.ValueOf(log.SetPrefix),
	}
}

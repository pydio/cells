package web

import (
	"net/http"
	"time"

	"github.com/pborman/uuid"
)

type Service interface {
	Init(opts ...Option) error
	Handle(pattern string, handler http.Handler)
	HandleFunc(pattern string, handler func(http.ResponseWriter, *http.Request))
	Run() error
	Options() Options
}

type Option func(o *Options)

var (
	// For serving
	DefaultName    = "go-web"
	DefaultVersion = "latest"
	DefaultId      = uuid.NewUUID().String()
	DefaultAddress = ":0"

	// for registration
	DefaultRegisterTTL      = time.Minute
	DefaultRegisterInterval = time.Second * 30
)

func NewService(opts ...Option) Service {
	return newService(opts...)
}

# Go Web [![GoDoc](https://godoc.org/github.com/micro/go-web?status.svg)](https://godoc.org/github.com/micro/go-web) [![Travis CI](https://travis-ci.org/micro/go-web.svg?branch=master)](https://travis-ci.org/micro/go-web) [![Go Report Card](https://goreportcard.com/badge/micro/go-web)](https://goreportcard.com/report/github.com/micro/go-web)

**Go-web** is a framework for micro web app development.

Go-web is a tiny HTTP web server library which leverages [go-micro](https://github.com/micro/go-micro) to create 
micro web services as first class citizens in a microservice world. It wraps go-micro to give you service discovery, 
heartbeating and the ability to create web apps as microservices.

## Getting Started

### Dependencies

Go-web makes use of go-micro which means it needs service discovery

See the go-micro [readme](https://github.com/micro/go-micro#service-discovery) for install instructions

### Usage

```go
service := web.NewService(
	web.Name("example"),
)

service.HandleFunc("/foo", fooHandler)

if err := service.Init(); err != nil {
	log.Fatal(err)
}

if err := service.Run(); err != nil {
	log.Fatal(err)
}
```

### Custom Handler

You might have a preference for a HTTP handler, so use something else. This loses the ability to register endpoints in discovery 
but we'll fix that soon.

```go
import "github.com/gorilla/mux"

r := mux.NewRouter()
r.HandleFunc("/", indexHandler)
r.HandleFunc("/objects/{object}", objectHandler)

service := web.NewService(
	web.Handler(r)
)
```

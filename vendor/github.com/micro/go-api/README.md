# Go API [![License](https://img.shields.io/:license-apache-blue.svg)](https://opensource.org/licenses/Apache-2.0) [![GoDoc](https://godoc.org/github.com/micro/go-api?status.svg)](https://godoc.org/github.com/micro/go-api) [![Travis CI](https://api.travis-ci.org/micro/go-api.svg?branch=master)](https://travis-ci.org/micro/go-api) [![Go Report Card](https://goreportcard.com/badge/micro/go-api)](https://goreportcard.com/report/github.com/micro/go-api)

Go API is a pluggable API framework

It builds on go-micro and includes a set of packages for composing HTTP based APIs

Note: This is a WIP

## Getting Started

- [Handlers](#handlers) - The http handlers supported
- [Endpoints](#endpoints) - Defining custom routes using endpoints

## Handlers

Handlers are HTTP handlers which provide a single entry point and act as a gateway to backend services. 
Handlers manage dynamic routing from a http request to unique microservices.

Current handlers implemented

- [`api`](#api-handler) - Handles any HTTP request. Gives full control over the http request/response via RPC.
- [`event`](#event-handler) -  Handles any HTTP request and publishes to a message bus.
- [`http`](#http-handler) - Handles any HTTP request and forwards as a reverse proxy.
- [`rpc`](#rpc-handler) - Handles json and protobuf POST requests. Forwards as RPC.
- [`web`](#web-handler) - The HTTP handler with web socket support included.

### API Handler

The API handler is the default handler. It serves any HTTP requests and forwards on as an RPC request with a specific format.

- Content-Type: Any
- Body: Any
- Forward Format: [api.Request](https://github.com/micro/go-api/blob/master/proto/api.proto#L11)/[api.Response](https://github.com/micro/go-api/blob/master/proto/api.proto#L21)
- Path: `/[service]/[method]`
- Resolver: Path is used to resolve service and method

### Event Handler

The event handler serves HTTP and forwards the request as a message over a message bus using the go-micro broker.

- Content-Type: Any
- Body: Any
- Forward Format: Request is formatted as [go-api/proto.Event](https://github.com/micro/go-api/blob/master/proto/api.proto#L28L39) 
- Path: `/[topic]/[event]`
- Resolver: Path is used to resolve topic and event name

### HTTP Handler

The http handler is a http reserve proxy with built in service discovery.

- Content-Type: Any
- Body: Any
- Forward Format: HTTP Reverse proxy
- Path: `/[service]`
- Resolver: Path is used to resolve service name

### RPC Handler

The RPC handler serves json or protobuf HTTP POST requests and forwards as an RPC request.

- Content-Type: `application/json` or `application/protobuf`
- Body: JSON or Protobuf
- Forward Format: json-rpc or proto-rpc based on content
- Path: `/[service]/[method]`
- Resolver: Path is used to resolve service and method

### Web Handler

The web handler is a http reserve proxy with built in service discovery and web socket support.

- Content-Type: Any
- Body: Any
- Forward Format: HTTP Reverse proxy including web sockets
- Path: `/[service]`
- Resolver: Path is used to resolve service name


## Endpoints

Endpoints allow a service to dynamically configure the micro api handler

When defining your service also include the endpoint mapping

### Example

This example serves `/greeter` with http methods GET and POST to the Greeter.Hello RPC handler.

```go
type Greeter struct 

// Define the handler
func (g *Greeter) Hello(ctx context.Context, req *proto.Request, rsp *proto.Response) error {
	log.Print("Received Greeter.Hello API request")

	// make the request
	response, err := g.Client.Hello(ctx, &hello.Request{Name: req.Name})
	if err != nil {
		return err
	}

	// set api response
	rsp.Msg = response.Msg
	return nil
}

// A greeter service
service := micro.NewService(
	micro.Name("go.micro.api.greeter"),
)
// Parse command line flags
service.Init()

// Register handler and the endpoint mapping
proto.RegisterGreeterHandler(service.Server(), new(Greeter), api.WithEndpoint(&api.Endpoint{
	// The RPC method
	Name: "Greeter.Hello",
	// The HTTP paths. This can be a POSIX regex
	Path: []string{"/greeter"},
	// The HTTP Methods for this endpoint
	Method: []string{"GET", "POST"},
	// The API handler to use
	Handler: api.Rpc,
})

// Run it as usual
service.Run()
```


package rpc

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"

	"github.com/micro/go-api"
	"github.com/micro/go-api/handler"
	proto "github.com/micro/go-api/internal/proto"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/selector"
	"github.com/micro/util/go/lib/ctx"
)

type rpcHandler struct {
	opts handler.Options
	s    *api.Service
}

// strategy is a hack for selection
func strategy(services []*registry.Service) selector.Strategy {
	return func(_ []*registry.Service) selector.Next {
		// ignore input to this function, use services above
		return selector.Random(services)
	}
}

func (h *rpcHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var service *api.Service

	if h.s != nil {
		// we were given the service
		service = h.s
	} else if h.opts.Router != nil {
		// try get service from router
		s, err := h.opts.Router.Route(r)
		if err != nil {
			er := errors.InternalServerError("go.micro.api", err.Error())
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(500)
			w.Write([]byte(er.Error()))
			return
		}
		service = s
	} else {
		// we have no way of routing the request
		er := errors.InternalServerError("go.micro.api", "no route found")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(500)
		w.Write([]byte(er.Error()))
		return
	}

	// only allow post when we have the router
	if h.opts.Router != nil && r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ct := r.Header.Get("Content-Type")

	// Strip charset from Content-Type (like `application/json; charset=UTF-8`)
	if idx := strings.IndexRune(ct, ';'); idx >= 0 {
		ct = ct[:idx]
	}

	c := h.opts.Service.Client()

	// create strategy
	so := selector.WithStrategy(strategy(service.Services))

	switch ct {
	case "application/json":
		// response content type
		w.Header().Set("Content-Type", "application/json")

		// get request
		br, err := ioutil.ReadAll(r.Body)
		if err != nil {
			e := errors.InternalServerError("go.micro.api", err.Error())
			http.Error(w, e.Error(), 500)
			return
		}
		// use as raw json
		request := json.RawMessage(br)

		// create request/response
		var response json.RawMessage
		req := c.NewJsonRequest(service.Name, service.Endpoint.Name, &request)

		// create context
		cx := ctx.FromRequest(r)

		// make the call
		if err := c.Call(cx, req, &response, client.WithSelectOption(so)); err != nil {
			ce := errors.Parse(err.Error())
			switch ce.Code {
			case 0:
				// assuming it's totally screwed
				ce.Code = 500
				ce.Id = "go.micro.api"
				ce.Status = http.StatusText(500)
				ce.Detail = "error during request: " + ce.Detail
				w.WriteHeader(500)
			default:
				w.WriteHeader(int(ce.Code))
			}
			w.Write([]byte(ce.Error()))
			return
		}

		b, _ := response.MarshalJSON()
		w.Header().Set("Content-Length", strconv.Itoa(len(b)))
		w.Write(b)
	case "application/proto", "application/protobuf":
		// get request
		br, err := ioutil.ReadAll(r.Body)
		if err != nil {
			e := errors.InternalServerError("go.micro.api", err.Error())
			http.Error(w, e.Error(), 500)
			return
		}

		// use as raw proto
		request := proto.NewMessage(br)

		// create request/response
		response := &proto.Message{}
		req := c.NewProtoRequest(service.Name, service.Endpoint.Name, request)

		// create context
		cx := ctx.FromRequest(r)

		// make the call
		if err := c.Call(cx, req, response, client.WithSelectOption(so)); err != nil {
			ce := errors.Parse(err.Error())
			switch ce.Code {
			case 0:
				// assuming it's totally screwed
				ce.Code = 500
				ce.Id = "go.micro.api"
				ce.Status = http.StatusText(500)
				ce.Detail = "error during request: " + ce.Detail
				w.WriteHeader(500)
			default:
				w.WriteHeader(int(ce.Code))
			}

			// response content type
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(ce.Error()))
			return
		}

		b, _ := response.Marshal()
		w.Header().Set("Content-Type", r.Header.Get("Content-Type"))
		w.Header().Set("Content-Length", strconv.Itoa(len(b)))
		w.Write(b)
	default:
		http.Error(w, "unsupported content-type", 500)
		return
	}
}

func (rh *rpcHandler) String() string {
	return "rpc"
}

func NewHandler(opts ...handler.Option) handler.Handler {
	options := handler.NewOptions(opts...)
	return &rpcHandler{
		opts: options,
	}
}

func WithService(s *api.Service, opts ...handler.Option) handler.Handler {
	options := handler.NewOptions(opts...)
	return &rpcHandler{
		opts: options,
		s:    s,
	}
}

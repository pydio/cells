package rest

import (
	"net/http"

	restful "github.com/emicklei/go-restful/v3"
	"google.golang.org/grpc/health/grpc_health_v1"

	grpccli "github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/server"
)

type Handler struct{}

func (h *Handler) SwaggerTags() []string {
	return []string{"HealthService"}
}

func (h *Handler) Filter() func(string) string {
	return nil
}

func (h *Handler) ApiPing(req *restful.Request, rsp *restful.Response) error {
	return rsp.WriteEntity(&rest.HealthServiceResponse{})
}

func (h *Handler) ApiLive(req *restful.Request, rsp *restful.Response) error {
	return rsp.WriteEntity(&rest.HealthServiceResponse{})
}

func (h *Handler) ApiReady(req *restful.Request, rsp *restful.Response) error {
	return rsp.WriteEntity(&rest.HealthServiceResponse{})
}

func (h *Handler) ServiceReady(req *restful.Request, rsp *restful.Response) error {
	ctx := req.Request.Context()
	serviceName := req.PathParameter("ServiceName")
	cc := grpccli.ResolveConn(ctx, serviceName)
	healthCli := server.NewReadyzClient(cc)
	healthResp, err := healthCli.Ready(ctx, &server.ReadyCheckRequest{
		HealthCheckRequest: &grpc_health_v1.HealthCheckRequest{},
	})
	if err != nil {
		return errors.Tag(err, errors.StatusServiceUnavailable)
	}
	code := http.StatusOK
	if healthResp.ReadyStatus != server.ReadyStatus_Ready {
		code = http.StatusServiceUnavailable
	}
	resp := &rest.HealthServiceResponse{
		Status: healthResp.ReadyStatus.String(),
	}
	for k, v := range healthResp.Components {
		if resp.Components == nil {
			resp.Components = make(map[string]*rest.ComponentStatus)
		}
		resp.Components[k] = &rest.ComponentStatus{
			Status:  v.GetReadyStatus().String(),
			Details: v.GetDetails(),
		}
	}
	return rsp.WriteHeaderAndEntity(code, resp)
}

func (h *Handler) ServiceLive(req *restful.Request, rsp *restful.Response) error {
	ctx := req.Request.Context()
	serviceName := req.PathParameter("ServiceName")
	cc := grpccli.ResolveConn(ctx, serviceName)
	healthCli := grpc_health_v1.NewHealthClient(cc)
	healthResp, err := healthCli.Check(ctx, &grpc_health_v1.HealthCheckRequest{})
	if err != nil {
		return errors.Tag(err, errors.StatusServiceUnavailable)
	} else if healthResp.Status == grpc_health_v1.HealthCheckResponse_SERVING {
		resp := &rest.HealthServiceResponse{
			Status: healthResp.Status.String(),
		}
		return rsp.WriteEntity(resp)
	} else {
		return errors.WithMessage(errors.StatusServiceUnavailable, "service status is not SERVING")
	}
}

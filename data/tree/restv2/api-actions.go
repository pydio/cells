package restv2

import (
	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v5/common/errors"
)

func (h *Handler) PerformAction(req *restful.Request, resp *restful.Response) error {
	return errors.WithMessage(errors.StatusNotImplemented, "method not implemented yet")
}

func (h *Handler) GetActionJob(req *restful.Request, resp *restful.Response) error {
	return errors.WithMessage(errors.StatusNotImplemented, "method not implemented yet")
}

func (h *Handler) ControlActionJob(req *restful.Request, resp *restful.Response) error {
	return errors.WithMessage(errors.StatusNotImplemented, "method not implemented yet")
}

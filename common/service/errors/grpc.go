package errors

import (
	"net/http"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	pb "github.com/pydio/cells/v4/common/proto/service"
)

// CodeFromHTTPStatus converts an HTTP response status into the corresponding
// gRPC error code.
func CodeFromHTTPStatus(status int) codes.Code {
	switch status {
	case http.StatusOK:
		return codes.OK
	case http.StatusTooManyRequests:
		return codes.ResourceExhausted
	case http.StatusRequestTimeout:
		return codes.DeadlineExceeded
	case http.StatusInternalServerError:
		return codes.Unknown
	case http.StatusBadRequest:
		return codes.InvalidArgument
	case http.StatusNotFound:
		return codes.NotFound
	case http.StatusConflict:
		return codes.AlreadyExists
	case http.StatusForbidden:
		return codes.PermissionDenied
	case http.StatusUnauthorized:
		return codes.Unauthenticated
	case http.StatusPreconditionFailed:
		return codes.FailedPrecondition
	case http.StatusNotImplemented:
		return codes.Unimplemented
	case http.StatusServiceUnavailable:
		return codes.Unavailable
	default:
		return codes.Unknown
	}
}

func ToGRPC(er error) error {
	if er == nil {
		return nil
	}

	err := FromError(er)

	s, serr := status.New(CodeFromHTTPStatus(int(err.Code)), err.Detail).WithDetails(&pb.Error{
		ID:      err.Id,
		Code:    uint32(err.Code),
		Status:  err.Status,
		Details: err.Detail,
	})
	if serr != nil {
		return serr
	}

	return s.Err()
}

func FromGRPC(er error) error {
	if er == nil {
		return nil
	}

	s, ok := status.FromError(er)
	if !ok {
		return er
	}

	details := s.Details()
	for _, detail := range details {
		err := detail.(*pb.Error)

		return &Error{
			Id:     err.ID,
			Code:   int32(err.Code),
			Status: err.Status,
			Detail: err.Details,
		}
	}

	return er
}

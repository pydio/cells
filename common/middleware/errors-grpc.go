/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	grpc_retry "github.com/grpc-ecosystem/go-grpc-middleware/retry"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/protoadapt"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/telemetry/log"
)

var HandledError = errors.RegisterBaseSentinel(errors.CellsError, "handled")

var (
	bo = grpc_retry.BackoffExponential(100 * time.Millisecond)
)

func ErrorNoMatchedRouteRetryUnaryClientInterceptor() grpc.UnaryClientInterceptor {
	return func(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
		var retry uint = 0
		for {
			err := invoker(ctx, method, req, reply, cc, opts...)
			if err != nil && (strings.Contains(err.Error(), "no matched route was found") || strings.Contains(err.Error(), "unknown cluster")) {
				log.Logger(ctx).Warn("No matched route found for " + method)
				retry++
				<-time.After(bo(retry))
				continue
			}
			return err
		}
	}
}

func ErrorNoMatchedRouteRetryStreamClientInterceptor() grpc.StreamClientInterceptor {
	return func(ctx context.Context, desc *grpc.StreamDesc, cc *grpc.ClientConn, method string, streamer grpc.Streamer, opts ...grpc.CallOption) (grpc.ClientStream, error) {
		var retry uint = 0
		for {
			str, err := streamer(ctx, desc, cc, method, opts...)
			if err != nil && (strings.Contains(err.Error(), "no matched route was found") || strings.Contains(err.Error(), "unknown cluster")) {
				retry++
				<-time.After(bo(retry))
				continue
			}
			return str, err
		}
	}
}

func ErrorFormatUnaryInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
	resp, err := handler(ctx, req)
	err = handleGrpcError(ctx, err, "[GRPC]"+info.FullMethod)
	return resp, ToGRPC(err)
}

func ErrorFormatStreamInterceptor(srv interface{}, stream grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
	err := handler(srv, stream)
	err = handleGrpcError(stream.Context(), err, "[GRPC]"+info.FullMethod)
	return ToGRPC(err)
}

func ErrorFormatUnaryClientInterceptor() grpc.UnaryClientInterceptor {
	return func(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
		err := invoker(ctx, method, req, reply, cc, opts...)
		return FromGRPC(err)
	}
}

func ErrorFormatStreamClientInterceptor() grpc.StreamClientInterceptor {
	return func(ctx context.Context, desc *grpc.StreamDesc, cc *grpc.ClientConn, method string, streamer grpc.Streamer, opts ...grpc.CallOption) (grpc.ClientStream, error) {
		str, err := streamer(ctx, desc, cc, method, opts...)
		return &errorFormatStreamClientInterceptor{str}, err
	}
}

type errorFormatStreamClientInterceptor struct {
	grpc.ClientStream
}

func (e *errorFormatStreamClientInterceptor) RecvMsg(m interface{}) error {
	err := e.ClientStream.RecvMsg(m)
	if err != nil {
		return FromGRPC(err)
	}

	return nil
}

var sc = map[codes.Code]error{
	codes.Canceled:           errors.StatusCancelled,
	codes.Unknown:            errors.CellsError,
	codes.DeadlineExceeded:   errors.StatusRequestTimeout,
	codes.NotFound:           errors.StatusNotFound,
	codes.AlreadyExists:      errors.StatusConflict,
	codes.PermissionDenied:   errors.StatusForbidden,
	codes.ResourceExhausted:  errors.StatusTooManyRequests,
	codes.FailedPrecondition: errors.StatusPreconditionFailed,
	codes.Aborted:            errors.StatusAborted,
	codes.OutOfRange:         errors.StatusOutOfRange,
	codes.Unimplemented:      errors.StatusNotImplemented,
	codes.Internal:           errors.StatusInternalServerError,
	codes.Unavailable:        errors.StatusServiceUnavailable,
	codes.Unauthenticated:    errors.StatusUnauthorized,
	codes.DataLoss:           errors.StatusDataLoss,
	codes.Code(422):          errors.StatusQuotaReached,
	codes.Code(423):          errors.StatusLocked,
}

func errToCode(err error) codes.Code {
	code := codes.Internal
	for c, e := range sc {
		if errors.Is(err, e) {
			code = c
		}
	}
	return code
}

func wrapErrFromCode(s *status.Status, err error) error {
	for c, e := range sc {
		if s.Code() == c {
			// No need to tag if error is already identified
			return errors.Tag(err, e)
		}
	}
	// If code is not recognized
	return errors.Tag(err, errors.StatusInternalServerError)
}

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
		return codes.Code(uint32(status))
	}
}

func ToGRPC(er error) error {
	if er == nil {
		return nil
	}
	if errors.Is(er, errors.CellsError) {

		var dd []protoadapt.MessageV1
		for _, sentinel := range errors.AsLeafs(er) {
			dd = append(dd, &service.ErrorSentinel{Name: sentinel.Name()})
		}

		for k, v := range errors.AllDetails(er) {
			switch d := v.(type) {
			case string:
				dd = append(dd, &service.ErrorDetail{Key: k, StringValue: d})
			case protoadapt.MessageV1:
				dd = append(dd, d)
			}
		}

		gE, _ := status.New(errToCode(er), er.Error()).WithDetails(dd...)
		return gE.Err()

	}
	return status.New(codes.Internal, er.Error()).Err()
}

func FromGRPC(er error) error {
	if er == nil {
		return nil
	}

	s, ok := status.FromError(er)
	if !ok {
		return er
	}

	var details []any
	for idx, d := range s.Details() {
		switch detail := d.(type) {
		case *service.ErrorDetail:
			details = append(details, detail.Key, detail.StringValue)
		case *service.ErrorSentinel:
			if sen := errors.ByName(detail.GetName()); sen != nil {
				er = errors.Tag(er, sen)
			}
		default:
			details = append(details, fmt.Sprintf("Detail %d (unknown type: %T)", idx, detail), detail)
		}
	}
	if len(details) > 0 {
		er = errors.WithDetails(er, details...)
	}

	er = wrapErrFromCode(s, er)

	return er
}

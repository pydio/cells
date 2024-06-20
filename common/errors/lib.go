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

package errors

import (
	"context"
	"errors"
	"io"
	"strings"

	tozd "gitlab.com/tozd/go/errors"
	"go.uber.org/zap"
	"google.golang.org/grpc/balancer"

	"github.com/pydio/cells/v4/common/utils/jsonx"
)

// E is an alias to original library
type E tozd.E

var (

	// New creates an error including a stack trace
	New = tozd.New
	// Errorf creates an error including a stack trace. You can use %w to reference a known sentinel or another error.
	Errorf = tozd.Errorf

	// WithDetails appends details to an error, eventually recording a stack trace
	WithDetails = tozd.WithDetails
	// WithStack records a stack trace using a Sentinel error
	WithStack = tozd.WithStack
	// WithMessage initialize a Sentinel error with a message and records a stack trace
	WithMessage = tozd.WithMessage
	// WithMessagef initialize a Sentinel error with formatting arguments
	WithMessagef = tozd.WithMessagef
	// Details reads the map[string]interface{} details of a given error (not recursively unwrapping)
	Details = tozd.Details

	// Is replaces stdlib.Is
	Is = tozd.Is
	// As replaces stdlib.As
	As = tozd.As
)

// WithAPICode adds APICode and optional formatting arguments as error Details
func WithAPICode(base error, code ApiCode, kv ...interface{}) E {
	details := []interface{}{"apiCode", code}
	if len(kv) > 0 {
		if len(kv)%2 != 0 {
			panic(New("odd number of arguments for initial details"))
		}
		details = append(details, "apiCodeArgs", kv)
	}
	return WithDetails(base, details...)
}

// Tag an existing error with a known sentinel. If it is already responding to Is(er, sentinel), it will be unmodified.
func Tag(err error, sentinel error) error {
	if err == nil {
		return err
	}
	if Is(err, sentinel) {
		return err
	}
	return tozd.Join(err, sentinel)
}

func Zap(err error) zap.Field {
	if err == nil {
		return zap.Skip()
	}
	if Is(err, CellsError) {
		js, _ := jsonx.Marshal(err)
		return zap.ByteString("jsonErr", js)
	} else {
		return zap.Error(err)
	}
}

// AllDetails stacks all Details from all unwrapped errors. It overrides tozd version to avoid stopping on Cause() case.
func AllDetails(err error) map[string]interface{} {
	out := tozd.AllDetails(err)
	if c := tozd.Cause(err); c != nil {
		for k, v := range AllDetails(c) {
			out[k] = v
		}
	}
	return out
}

// IsNetworkError tries to detect if error is a network error.
func IsNetworkError(err error) bool {
	s := err.Error()
	return errors.Is(err, context.DeadlineExceeded) ||
		errors.Is(err, context.Canceled) ||
		errors.Is(err, io.ErrUnexpectedEOF) ||
		errors.Is(err, balancer.ErrTransientFailure) ||
		strings.Contains(s, "can't assign requested address")
}

func IsStreamFinished(err error) bool {
	return err != nil && errors.Is(err, io.EOF) || errors.Is(err, io.ErrUnexpectedEOF)
}

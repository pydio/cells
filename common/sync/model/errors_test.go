/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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
package model

import (
	"fmt"
	"io/fs"
	"os"
	"testing"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/pydio/cells/v5/common/errors"
)

func TestIsNotFound(t *testing.T) {
	for _, tc := range []struct {
		err  error
		want bool
	}{
		{nil, false},
		{fmt.Errorf("connection refused"), false},
		{errors.WithMessage(errors.NodeNotFound, "node not found in memdb"), true},
		{errors.WithStack(errors.ObjectNotFound), true},
		{errors.Tag(fmt.Errorf("rpc error"), errors.StatusNotFound), true},
		{fmt.Errorf("wrapped: %w", fs.ErrNotExist), true},
		{&os.PathError{Op: "stat", Path: "/x", Err: fs.ErrNotExist}, true},
		{status.Error(codes.NotFound, "not found"), true},
		{status.Error(codes.Unavailable, "unavailable"), false},
		{errors.WithStack(errors.StatusForbidden), false},
	} {
		if got := IsNotFound(tc.err); got != tc.want {
			t.Errorf("IsNotFound(%v) = %v, want %v", tc.err, got, tc.want)
		}
	}
}

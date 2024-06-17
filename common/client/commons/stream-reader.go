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

package commons

import (
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common/errors"
)

type ResponseHandler[T any] func(T) error

type StreamClient[T any] interface {
	grpc.ClientStream
	Recv() (T, error)
}

type StreamClientWrapper[T any] interface {
	ForEach(handler ResponseHandler[T]) error
}

// ForEach loops on the stream Recv() methods with proper error checking. The stream opening error is also checked first.
func ForEach[T any](streamClient StreamClient[T], openError error, handler ResponseHandler[T]) error {
	if openError != nil {
		return openError
	}
	for {
		resp, err := streamClient.Recv()
		if errors.IsStreamFinished(err) {
			break
		}
		if err != nil {
			return err
		}
		if er := handler(resp); er != nil {
			return er
		}
	}
	return nil
}

// WrapStream wraps a grpc stream client to add ForEach method
func WrapStream[T any](sc StreamClient[T]) StreamClientWrapper[T] {
	return &wrapperStreamClient[T]{StreamClient: sc}
}

type wrapperStreamClient[T any] struct {
	StreamClient[T]
}

// ForEach loops on the stream Recv() methods with proper error checking. The stream opening error is also checked first.
func (receiver *wrapperStreamClient[T]) ForEach(handler ResponseHandler[T]) error {
	for {
		resp, err := receiver.Recv()
		if errors.IsStreamFinished(err) {
			break
		}
		if err != nil {
			return err
		}
		if er := handler(resp); er != nil {
			return er
		}
	}
	return nil
}

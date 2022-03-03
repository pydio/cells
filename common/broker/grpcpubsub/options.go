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

package grpcpubsub

import (
	"context"

	pb "github.com/pydio/cells/v4/common/proto/broker"
)

type publisherKey struct{}

type subscriberKey struct{}

type Option func(*Options)

type Options struct {
	Context context.Context
	Queue   string
}

type Publisher interface {
	Send(*pb.PublishRequest) error
}

type Subscriber interface {
	Recv() (*pb.SubscribeResponse, error)
}

func WithContext(ctx context.Context) Option {
	return func(o *Options) {
		o.Context = ctx
	}
}

// WithPublisher sets the RPC client
func WithPublisher(pub Publisher) Option {
	return func(o *Options) {
		if o.Context == nil {
			o.Context = context.Background()
		}

		o.Context = context.WithValue(o.Context, publisherKey{}, pub)
	}
}

// WithSubscriber sets the client
func WithSubscriber(sub interface{}) Option {
	return func(o *Options) {
		if o.Context == nil {
			o.Context = context.Background()
		}

		o.Context = context.WithValue(o.Context, subscriberKey{}, sub)
	}
}

// WithQueue defines the queue used by the subscriber
func WithQueue(s string) Option {
	return func(o *Options) {
		o.Queue = s
	}
}

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

package broker

import "github.com/micro/go-micro/broker"

type brokerwrap struct {
	b    broker.Broker
	opts Options
}

// NewBroker wraps a standard broker but prevents it from disconnecting while there still is a service running
func NewBroker(b broker.Broker, opts ...Option) broker.Broker {
	return &brokerwrap{b, newOptions(opts...)}
}

// Options wraps standard function
func (b *brokerwrap) Options() broker.Options {
	return b.b.Options()
}

// Address wraps standard function
func (b *brokerwrap) Address() string {
	return b.b.Address()
}

// Connect wraps standard function
func (b *brokerwrap) Connect() error {
	return b.b.Connect()
}

// Disconnect handles the disconnection to the broker. It prevents it if there is a service that is still active
func (b *brokerwrap) Disconnect() error {
	for _, o := range b.opts.beforeDisconnect {
		if err := o(); err != nil {
			return err
		}
	}

	return b.b.Disconnect()
}

// Init wraps standard function
func (b *brokerwrap) Init(opts ...broker.Option) error {
	return b.b.Init(opts...)
}

// Publish wraps standard function
func (b *brokerwrap) Publish(s string, m *broker.Message, opts ...broker.PublishOption) error {
	return b.b.Publish(s, m, opts...)
}

// Publish wraps standard function
func (b *brokerwrap) Subscribe(s string, h broker.Handler, opts ...broker.SubscribeOption) (broker.Subscriber, error) {
	return b.b.Subscribe(s, h, opts...)
}

// Publish wraps standard function
func (b *brokerwrap) String() string {
	return b.b.String()
}

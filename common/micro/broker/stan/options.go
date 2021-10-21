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

package stan

import (
	"context"
	"time"

	"github.com/micro/go-micro/broker"
	stan "github.com/nats-io/stan.go"
)

type optionsKey struct{}

// Options accepts stan.Options
func Options(opts stan.Options) broker.Option {
	return setBrokerOption(optionsKey{}, opts)
}

type clusterIDKey struct{}

// ClusterID specify cluster id to connect
func ClusterID(clusterID string) broker.Option {
	return setBrokerOption(clusterIDKey{}, clusterID)
}

type clientIDKey struct{}

// ClientID specify client id to connect
func ClientID(clientID string) broker.Option {
	return setBrokerOption(clientIDKey{}, clientID)
}

type subscribeOptionKey struct{}

func SubscribeOption(opts ...stan.SubscriptionOption) broker.SubscribeOption {
	return setSubscribeOption(subscribeOptionKey{}, opts)
}

// func ServerSubscriberOption(opts ...stan.SubscriptionOption) server.SubscriberOption {
// 	return setServerSubscriberOption(subscribeOptionKey{}, opts)
// }

type subscribeContextKey struct{}

// SubscribeContext set the context for broker.SubscribeOption
func SubscribeContext(ctx context.Context) broker.SubscribeOption {
	return setSubscribeOption(subscribeContextKey{}, ctx)
}

type ackSuccessKey struct{}

// AckOnSuccess will automatically acknowledge messages when no error is returned
func AckOnSuccess() broker.SubscribeOption {
	return setSubscribeOption(ackSuccessKey{}, true)
}

type connectTimeoutKey struct{}

// ConnectTimeout timeout for connecting to broker -1 infinitive or time.Duration value
func ConnectTimeout(td time.Duration) broker.Option {
	return setBrokerOption(connectTimeoutKey{}, td)
}

type connectRetryKey struct{}

// ConnectRetry reconnect to broker in case of errors
func ConnectRetry(v bool) broker.Option {
	return setBrokerOption(connectRetryKey{}, v)
}

type durableKey struct{}

// DurableName sets the DurableName for the subscriber
func DurableName(name string) broker.Option {
	return setBrokerOption(durableKey{}, name)
}

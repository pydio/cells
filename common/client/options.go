/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package client

import (
	"net"
	"os"
	"strconv"
	"strings"
	"sync"

	"google.golang.org/grpc/attributes"

	"github.com/pydio/cells/v5/common/runtime"
)

type attKeyTargetServerID struct{}

type attKeyTargetServerPID struct{}

var (
	localAddrOnce sync.Once
	localAddress  string
)

// BalancerTarget is a load balancer target providing its own internal info
type BalancerTarget interface {
	// Address must return the target address. It can include a port
	Address() string
	// Attributes returns a set of grpc.Attributes
	Attributes() *attributes.Attributes
}

// BalancerTargetFilter is a generic signature for matching a BalancerTarget against specific condition.
type BalancerTargetFilter func(BalancerTarget) bool

// BalancerOptions holds internal load balancer strategies
type BalancerOptions struct {
	// Filters is a list of filters that will reduce the possible list of targets
	Filters []BalancerTargetFilter
	// Priority is a list of filters that will be tested first. If no target match, the load balancer
	// continues to the non-matching values
	Priority []BalancerTargetFilter
}

type BalancerOption func(o *BalancerOptions)

// WithRestrictToLocal provides a BalancerOption to forbid connection to hosts other than local.
func WithRestrictToLocal() BalancerOption {
	return func(o *BalancerOptions) {
		o.Filters = append(o.Filters, func(target BalancerTarget) bool {
			return TargetHostMatches(target, getLocalAddress())
		})
	}
}

// WithPriorityToLocal provides a BalancerOption to prioritize connections to local host.
func WithPriorityToLocal() BalancerOption {
	return func(o *BalancerOptions) {
		o.Priority = append(o.Priority, func(target BalancerTarget) bool {
			return TargetHostMatches(target, getLocalAddress())
		})
	}
}

// WithRestrictToProcess is mainly for testing purpose, forbidding connection to other processes
func WithRestrictToProcess() BalancerOption {
	return func(o *BalancerOptions) {
		o.Filters = append(o.Filters, TargetPIDMatches)
	}
}

// WithPriorityToProcess is mainly for testing purpopse, to prioritize connections to current process.
func WithPriorityToProcess() BalancerOption {
	return func(o *BalancerOptions) {
		o.Priority = append(o.Priority, TargetPIDMatches)
	}
}

// TargetHostMatches checks target.Address host against the passed string.
// hosts string is a pipe-separated list of hostname or IPs.
func TargetHostMatches(target BalancerTarget, hosts string) bool {
	//fmt.Println("Check if we restrict to host here!", hosts, "vs", target.Address())
	hh := strings.Split(hosts, "|")
	aHost, _, er := net.SplitHostPort(target.Address())
	if er != nil {
		return false
	}
	for _, h := range hh {
		if aHost == h {
			return true
		}
	}
	return false
}

// TargetPIDMatches is a generic matcher for PID
func TargetPIDMatches(target BalancerTarget) bool {
	srvPID := target.Attributes().Value(attKeyTargetServerPID{})
	//fmt.Println("Check if we restrict to PID here!", srvPID, "vs", os.Getpid())
	if srvPID != nil {
		localPID := strconv.Itoa(os.Getpid())
		return srvPID.(string) == localPID
	}
	return false
}

func getLocalAddress() string {
	localAddrOnce.Do(func() {
		localAddress = runtime.DefaultAdvertiseAddress()
	})
	return localAddress
}

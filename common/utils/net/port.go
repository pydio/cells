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

package net

import (
	"fmt"
	"net"
	"os"
	"syscall"
)

// CheckPortAvailability - check if given port is already in use.
// Note: The check method tries to listen on given port and closes it.
// It is possible to have a disconnected client in this tiny window of time.
func CheckPortAvailability(port string) (err error) {
	// Return true if err is "address already in use" error.
	isAddrInUseErr := func(err error) (b bool) {
		if opErr, ok := err.(*net.OpError); ok {
			if sysErr, ok := opErr.Err.(*os.SyscallError); ok {
				if errno, ok := sysErr.Err.(syscall.Errno); ok {
					b = (errno == syscall.EADDRINUSE)
				}
			}
		}

		return b
	}

	network := []string{"tcp", "tcp4", "tcp6"}
	for _, n := range network {
		l, err := net.Listen(n, net.JoinHostPort("", port))
		if err == nil {
			// As we are able to listen on this network, the port is not in use.
			// Close the listener and continue check other networks.
			if err = l.Close(); err != nil {
				return err
			}
		} else if isAddrInUseErr(err) {
			// As we got EADDRINUSE error, the port is in use by other process.
			// Return the error.
			return err
		}
	}

	return nil
}

// GetAvailableHttpAltPort tries to find best available port for HTTP
func GetAvailableHttpAltPort() int {
	alts := []int{8080, 8008, 591, 8081, 8082}
	for _, port := range alts {
		if e := CheckPortAvailability(fmt.Sprintf("%d", port)); e == nil {
			return port
		}
	}
	// Return random now
	return GetAvailablePort()
}

func GetAvailableRegistryAltPort() int {
	alts := []int{8000, 8100, 8200, 8300, 8400}
	for _, port := range alts {
		if e := CheckPortAvailability(fmt.Sprintf("%d", port)); e == nil {
			return port
		}
	}
	// Return random now
	return GetAvailablePort()
}

func GetAvailableBrokerAltPort() int {
	alts := []int{8003, 8103, 8203, 8303, 8403}
	for _, port := range alts {
		if e := CheckPortAvailability(fmt.Sprintf("%d", port)); e == nil {
			return port
		}
	}
	// Return random now
	return GetAvailablePort()
}

// GetAvailablePort finds an available TCP port on which to listen to.
func GetAvailablePort() int {
	addr, err := net.ResolveTCPAddr("tcp", "localhost:0")
	if err != nil {
		return 0
	}

	l, err := net.ListenTCP("tcp", addr)
	if err != nil {
		return 0
	}
	defer l.Close()
	return l.Addr().(*net.TCPAddr).Port
}

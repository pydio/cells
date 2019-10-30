/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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

// Package net provides tools for reading IPs, available Ports, extending HTTP requests, etc.
package net

import (
	"errors"
	"net"
	"os"
	"time"
)

// GetExternalIP retrieves the preferred outbound ip of this machine
// by scanning the network interfaces of this (virtual) machine
func GetExternalIP() (net.IP, error) {
	ifaces, err := net.Interfaces()
	if err != nil {
		return nil, err
	}
	for _, iface := range ifaces {
		if iface.Flags&net.FlagUp == 0 {
			continue // interface down
		}
		if iface.Flags&net.FlagLoopback != 0 {
			continue // loopback interface
		}
		addrs, err := iface.Addrs()
		if err != nil {
			return nil, err
		}
		for _, addr := range addrs {
			var ip net.IP
			switch v := addr.(type) {
			case *net.IPNet:
				ip = v.IP
			case *net.IPAddr:
				ip = v.IP
			}
			if ip == nil || ip.IsLoopback() {
				continue
			}
			ip = ip.To4()
			if ip == nil {
				continue // not an ipv4 address
			}
			return ip, nil
		}
	}
	return nil, errors.New("are you connected to the network?")
}

// GetExternalIP retrieves the preferred outbound ip of this machine
// by scanning the network interfaces of this (virtual) machine
func GetAvailableIPs() (ips []net.IP, e error) {
	ifaces, err := net.Interfaces()
	if err != nil {
		return nil, err
	}
	for _, iface := range ifaces {
		if iface.Flags&net.FlagUp == 0 {
			continue // interface down
		}
		if iface.Flags&net.FlagLoopback != 0 {
			continue // loopback interface
		}
		addrs, err := iface.Addrs()
		if err != nil {
			return nil, err
		}
		for _, addr := range addrs {
			var ip net.IP
			switch v := addr.(type) {
			case *net.IPNet:
				ip = v.IP
			case *net.IPAddr:
				ip = v.IP
			}
			if ip == nil {
				continue
			}
			ip = ip.To4()
			if ip == nil {
				continue // not an ipv4 address
			}
			ips = append(ips, ip)
		}
	}
	ips = append(ips, net.ParseIP("127.0.0.1"))
	return
}

// GetOutboundIP restrieves the preferred outbound ip of this machine
// by simply connecting to a well known ip of the internet.
func GetOutboundIP() (net.IP, error) {
	conn, err := net.DialTimeout("udp", "8.8.8.8:80", 500*time.Millisecond)
	if err != nil {
		return nil, err
	}
	defer conn.Close()

	localAddr := conn.LocalAddr().(*net.UDPAddr)

	return localAddr.IP, nil
}

// PeerAddressIsLocal compares and address (can be an IP or Hostname) to the current server values
func PeerAddressIsLocal(address string) bool {
	if address == "localhost" {
		return true
	}

	if host, e := os.Hostname(); e == nil && address == host {
		return true
	}
	peerIP := net.ParseIP(address)
	localIPs, _ := GetAvailableIPs()

	found := false
	for _, localIP := range localIPs {
		if peerIP.Equal(localIP) {
			found = true
		}
	}

	return found
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

// +build !appengine

package packages

import (
	"net"
	"reflect"

	"github.com/mattn/anko/env"
)

func init() {
	env.Packages["net"] = map[string]reflect.Value{
		"CIDRMask":                   reflect.ValueOf(net.CIDRMask),
		"Dial":                       reflect.ValueOf(net.Dial),
		"DialIP":                     reflect.ValueOf(net.DialIP),
		"DialTCP":                    reflect.ValueOf(net.DialTCP),
		"DialTimeout":                reflect.ValueOf(net.DialTimeout),
		"DialUDP":                    reflect.ValueOf(net.DialUDP),
		"DialUnix":                   reflect.ValueOf(net.DialUnix),
		"ErrWriteToConnected":        reflect.ValueOf(net.ErrWriteToConnected),
		"FileConn":                   reflect.ValueOf(net.FileConn),
		"FileListener":               reflect.ValueOf(net.FileListener),
		"FilePacketConn":             reflect.ValueOf(net.FilePacketConn),
		"FlagBroadcast":              reflect.ValueOf(net.FlagBroadcast),
		"FlagLoopback":               reflect.ValueOf(net.FlagLoopback),
		"FlagMulticast":              reflect.ValueOf(net.FlagMulticast),
		"FlagPointToPoint":           reflect.ValueOf(net.FlagPointToPoint),
		"FlagUp":                     reflect.ValueOf(net.FlagUp),
		"IPv4":                       reflect.ValueOf(net.IPv4),
		"IPv4Mask":                   reflect.ValueOf(net.IPv4Mask),
		"IPv4allrouter":              reflect.ValueOf(net.IPv4allrouter),
		"IPv4allsys":                 reflect.ValueOf(net.IPv4allsys),
		"IPv4bcast":                  reflect.ValueOf(net.IPv4bcast),
		"IPv4len":                    reflect.ValueOf(net.IPv4len),
		"IPv4zero":                   reflect.ValueOf(net.IPv4zero),
		"IPv6interfacelocalallnodes": reflect.ValueOf(net.IPv6interfacelocalallnodes),
		"IPv6len":                    reflect.ValueOf(net.IPv6len),
		"IPv6linklocalallnodes":      reflect.ValueOf(net.IPv6linklocalallnodes),
		"IPv6linklocalallrouters":    reflect.ValueOf(net.IPv6linklocalallrouters),
		"IPv6loopback":               reflect.ValueOf(net.IPv6loopback),
		"IPv6unspecified":            reflect.ValueOf(net.IPv6unspecified),
		"IPv6zero":                   reflect.ValueOf(net.IPv6zero),
		"InterfaceAddrs":             reflect.ValueOf(net.InterfaceAddrs),
		"InterfaceByIndex":           reflect.ValueOf(net.InterfaceByIndex),
		"InterfaceByName":            reflect.ValueOf(net.InterfaceByName),
		"Interfaces":                 reflect.ValueOf(net.Interfaces),
		"JoinHostPort":               reflect.ValueOf(net.JoinHostPort),
		"Listen":                     reflect.ValueOf(net.Listen),
		"ListenIP":                   reflect.ValueOf(net.ListenIP),
		"ListenMulticastUDP":         reflect.ValueOf(net.ListenMulticastUDP),
		"ListenPacket":               reflect.ValueOf(net.ListenPacket),
		"ListenTCP":                  reflect.ValueOf(net.ListenTCP),
		"ListenUDP":                  reflect.ValueOf(net.ListenUDP),
		"ListenUnix":                 reflect.ValueOf(net.ListenUnix),
		"ListenUnixgram":             reflect.ValueOf(net.ListenUnixgram),
		"LookupAddr":                 reflect.ValueOf(net.LookupAddr),
		"LookupCNAME":                reflect.ValueOf(net.LookupCNAME),
		"LookupHost":                 reflect.ValueOf(net.LookupHost),
		"LookupIP":                   reflect.ValueOf(net.LookupIP),
		"LookupMX":                   reflect.ValueOf(net.LookupMX),
		"LookupNS":                   reflect.ValueOf(net.LookupNS),
		"LookupPort":                 reflect.ValueOf(net.LookupPort),
		"LookupSRV":                  reflect.ValueOf(net.LookupSRV),
		"LookupTXT":                  reflect.ValueOf(net.LookupTXT),
		"ParseCIDR":                  reflect.ValueOf(net.ParseCIDR),
		"ParseIP":                    reflect.ValueOf(net.ParseIP),
		"ParseMAC":                   reflect.ValueOf(net.ParseMAC),
		"Pipe":                       reflect.ValueOf(net.Pipe),
		"ResolveIPAddr":              reflect.ValueOf(net.ResolveIPAddr),
		"ResolveTCPAddr":             reflect.ValueOf(net.ResolveTCPAddr),
		"ResolveUDPAddr":             reflect.ValueOf(net.ResolveUDPAddr),
		"ResolveUnixAddr":            reflect.ValueOf(net.ResolveUnixAddr),
		"SplitHostPort":              reflect.ValueOf(net.SplitHostPort),
	}
}

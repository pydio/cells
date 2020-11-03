package net

import (
	"strings"

	"github.com/jaytaylor/go-hostsfile"
)

// HostsFileLookup loads host defined in /etc/hosts using jaytaylor/go-hostsfile library
func HostsFileLookup() ([]string, error) {
	res, err := hostsfile.ReverseLookup("127.0.0.1")
	if err != nil {
		return nil, err
	}
	var out []string
	for _, r := range res {
		if !strings.HasPrefix(strings.TrimSpace(r), "#") {
			out = append(out, r)
		}
	}
	return out, nil
}

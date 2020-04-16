package hostsfile

import (
	"io/ioutil"
	"strings"
)

// ReadHostsFile reads the hosts file.
func ReadHostsFile() ([]byte, error) {
	bs, err := ioutil.ReadFile(HostsPath)
	if err != nil {
		return nil, err
	}
	return bs, nil
}

// ParseHosts takes in hosts file content and returns a map of parsed results.
func ParseHosts(hostsFileContent []byte, err error) (map[string][]string, error) {
	if err != nil {
		return nil, err
	}
	hostsMap := map[string][]string{}
	for _, line := range strings.Split(strings.Trim(string(hostsFileContent), " \t\r\n"), "\n") {
		line = strings.Replace(strings.Trim(line, " \t"), "\t", " ", -1)
		if len(line) == 0 || line[0] == ';' || line[0] == '#' {
			continue
		}
		pieces := strings.SplitN(line, " ", 2)
		if len(pieces) > 1 && len(pieces[0]) > 0 {
			if names := strings.Fields(pieces[1]); len(names) > 0 {
				if _, ok := hostsMap[pieces[0]]; ok {
					hostsMap[pieces[0]] = append(hostsMap[pieces[0]], names...)
				} else {
					hostsMap[pieces[0]] = names
				}
			}
		}
	}
	return hostsMap, nil
}

// ReverseLookup takes an IP address and returns a slice of matching hosts file
// entries.
func ReverseLookup(ip string) ([]string, error) {
	hostsMap, err := ParseHosts(ReadHostsFile())
	if err != nil {
		return nil, err
	}
	return hostsMap[ip], nil
}

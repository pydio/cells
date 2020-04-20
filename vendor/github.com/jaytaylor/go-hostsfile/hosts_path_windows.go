// +build windows

package hostsfile

import (
	"os"
)

var HostsPath = os.Getenv("SystemRoot") + `\System32\drivers\etc\hosts`

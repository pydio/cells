/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package cmd

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"strings"

	p "github.com/manifoldco/promptui"
	_ "github.com/mholt/caddy/caddyhttp"

	"github.com/pydio/cells/common/proto/install"
	"github.com/pydio/cells/discovery/install/lib"
)

var (
	emailRegexp = regexp.MustCompile("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
)

func cliInstall(proxyConfig *install.ProxyConfig) (*install.InstallConfig, error) {

	cliConfig := lib.GenerateDefaultConfig()
	cliConfig.InternalUrl = proxyConfig.GetBindURL()
	cliConfig.ProxyConfig = proxyConfig

	fmt.Println("\n\033[1m## Database Connection\033[0m")
	adminRequired, e := promptDB(cliConfig)
	if e != nil {
		return nil, e
	}

	fmt.Println("\n\033[1m## Frontend Configuration\033[0m")
	if e := promptFrontendAdmin(cliConfig, adminRequired); e != nil {
		return nil, e
	}

	fmt.Println("\n\033[1m## Advanced Settings\033[0m")
	if e := promptAdvanced(cliConfig); e != nil {
		return nil, e
	}

	fmt.Println("\n\033[1m## Performing Installation\033[0m")
	e = lib.Install(context.Background(), cliConfig, lib.INSTALL_ALL, func(event *lib.InstallProgressEvent) {
		fmt.Println(p.IconGood + " " + event.Message)
	})
	if e != nil {
		return nil, fmt.Errorf("could not perform installation: %s", e.Error())
	}

	fmt.Println("")
	fmt.Println(p.IconGood + "\033[1m Installation Finished: please restart with '" + os.Args[0] + " start' command\033[0m")
	fmt.Println("")
	return cliConfig, nil

}

func promptDB(c *install.InstallConfig) (adminRequired bool, err error) {

	connType := p.Select{
		Label: "Database Connection Type",
		Items: []string{"TCP", "Socket", "Manual"},
	}
	dbTcpHost := p.Prompt{Label: "Database Hostname", Validate: notEmpty, Default: c.DbTCPHostname}
	dbTcpPort := p.Prompt{Label: "Database Port", Validate: validPortNumber, Default: c.DbTCPPort}

	dbName := p.Prompt{Label: "Database Name", Validate: notEmpty, Default: c.DbTCPName}
	dbUser := p.Prompt{Label: "Database User", Validate: notEmpty, Default: c.DbTCPUser}
	dbPass := p.Prompt{Label: "Database Password (leave empty if not needed)", Mask: '*'}

	dbSocketFile := p.Prompt{Label: "Socket File", Validate: notEmpty}
	dbDSN := p.Prompt{Label: "Manual DSN", Validate: notEmpty}

	uConnIdx, _, _ := connType.Run()
	var e error
	if uConnIdx == 2 {
		if c.DbManualDSN, e = dbDSN.Run(); e != nil {
			return false, e
		}
	} else {
		if uConnIdx == 0 {
			c.DbConnectionType = "tcp"
			if c.DbTCPHostname, e = dbTcpHost.Run(); e != nil {
				return false, e
			}
			if c.DbTCPPort, e = dbTcpPort.Run(); e != nil {
				return false, e
			}
		} else if uConnIdx == 1 {
			c.DbConnectionType = "socket"
			if c.DbSocketFile, e = dbSocketFile.Run(); e != nil {
				return false, e
			}
		}
		var name, user, pass string
		if name, e = dbName.Run(); e != nil {
			return false, e
		}
		if user, e = dbUser.Run(); e != nil {
			return false, e
		}
		if pass, e = dbPass.Run(); e != nil {
			return false, e
		}
		if uConnIdx == 0 {
			c.DbTCPName = name
			c.DbTCPUser = user
			c.DbTCPPassword = pass
		} else {
			c.DbSocketName = name
			c.DbSocketUser = user
			c.DbSocketPassword = pass
		}
	}
	adminRequired = true
	if res := lib.PerformCheck(context.Background(), "DB", c); !res.Success {
		fmt.Println(p.IconBad + " Cannot connect to database, please review the parameters")
		return promptDB(c)
	} else {
		var info map[string]interface{}
		var existConfirm string
		if e := json.Unmarshal([]byte(res.JsonResult), &info); e == nil {
			if a, o := info["adminFound"]; o && a.(bool) {
				existConfirm = "An existing installation was found in this database, and an administrator user already exists!"
				adminRequired = false
			} else if t, o := info["tablesFound"]; o && t.(bool) {
				existConfirm = "An existing installation was found in this database!"
			}
		}
		if existConfirm != "" {
			confirm := p.Prompt{Label: p.IconWarn + " " + existConfirm + " Do you want to continue?", IsConfirm: true}
			if _, e := confirm.Run(); e != nil {
				return promptDB(c)
			}
		}
	}
	fmt.Println(p.IconGood + " Successfully connected to the database")
	return
}

func promptFrontendAdmin(c *install.InstallConfig, adminRequired bool) error {

	login := p.Prompt{Label: "Admin Login (leave empty if you want to use existing admin)", Default: ""}
	pwd := p.Prompt{Label: "Admin Password", Mask: '*'}
	pwd2 := p.Prompt{Label: "Confirm Password", Mask: '*', Validate: func(s string) error {
		if c.FrontendPassword != s {
			return fmt.Errorf("Passwords differ!")
		}
		return nil
	}}
	if adminRequired {
		login.Label = "Admin Login"
		login.Default = "admin"
		login.Validate = notEmpty
		pwd.Validate = notEmpty
	}
	var e error
	if c.FrontendLogin, e = login.Run(); e != nil {
		return e
	}
	if adminRequired || c.FrontendLogin != "" {
		if c.FrontendPassword, e = pwd.Run(); e != nil {
			return e
		}
		if c.FrontendRepeatPassword, e = pwd2.Run(); e != nil {
			return e
		}
	}
	return nil

}

func promptAdvanced(c *install.InstallConfig) error {

	confirm := p.Prompt{Label: "There are some advanced settings for ports and initial data storage. Do you want to edit them", IsConfirm: true}
	if _, e := confirm.Run(); e != nil {
		return nil
	}
	dsPath := p.Prompt{Label: "Path to the default datasource", Default: c.DsFolder, Validate: notEmpty}

	if folder, e := dsPath.Run(); e == nil {
		c.DsFolder = folder
	} else {
		return e
	}

	return nil
}

/* VARIOUS HELPERS */

func validateMailFormat(input string) error {
	if !emailRegexp.MatchString(input) {
		return fmt.Errorf("Please enter a valid e-mail address!")
	}
	return nil
}

func notEmpty(input string) error {
	if len(input) == 0 {
		return fmt.Errorf("Field cannot be empty!")
	}
	return nil
}

func validHostPort(input string) error {
	if e := notEmpty(input); e != nil {
		return e
	}
	parts := strings.Split(input, ":")
	if len(parts) != 2 {
		return fmt.Errorf("Please use an [IP|DOMAIN]:[PORT] string")
	}
	if e := validPortNumber(parts[1]); e != nil {
		return e
	}
	return nil
}

// ValidScheme validates that url is [SCHEME]://[IP or DOMAIN] "[http/https]://......."
func validScheme(input string) error {
	if e := notEmpty(input); e != nil {
		return e
	}

	u, err := url.Parse(input)
	if err != nil {
		return fmt.Errorf("could not parse URL")
	}

	if len(u.Scheme) > 0 && len(u.Host) > 0 {
		if u.Scheme == "http" || u.Scheme == "https" {
			return nil
		}
		return fmt.Errorf("scheme %s is not supported (only http/https are supported)", u.Scheme)
	}

	return fmt.Errorf("Please use a [SCHEME]://[IP|DOMAIN] string")
}

func validPortNumber(input string) error {
	port, e := strconv.ParseInt(input, 10, 64)
	if e == nil && port == 0 {
		return fmt.Errorf("Please use a non empty port!")
	}
	return e
}

func validUrl(input string) error {
	_, e := url.Parse(input)
	return e
}

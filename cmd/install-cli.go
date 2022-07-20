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

package cmd

import (
	"context"
	"fmt"
	"net"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"strings"

	p "github.com/manifoldco/promptui"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/install"
	"github.com/pydio/cells/v4/common/runtime"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/discovery/install/lib"
)

type CellsCliPromptStep struct {
	Step   string
	Prompt func(*install.InstallConfig) error
}

var (
	emailRegexp       = regexp.MustCompile("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
	additionalPrompts []CellsCliPromptStep
)

func cliInstall(cmd *cobra.Command, proxyConfig *install.ProxyConfig) (*install.InstallConfig, error) {

	cliConfig := lib.GenerateDefaultConfig()
	cliConfig.ProxyConfig = proxyConfig

	if e := applyAdditionalPrompt("boot", cliConfig); e != nil {
		return nil, e
	}

	fmt.Println("\n\033[1m## Database Connection\033[0m")
	adminRequired, e := promptDB(cliConfig)
	if e != nil {
		return nil, e
	}

	if e := applyAdditionalPrompt("post-db", cliConfig); e != nil {
		return nil, e
	}

	applyDocumentsDSN := ""
	if e := promptAdditionalMongoDSN(cliConfig, false); e != nil {
		return nil, e
	} else if cliConfig.DocumentsDSN != "" {
		// Copy DSN and apply it later on, or it will trigger configs warning
		applyDocumentsDSN = cliConfig.DocumentsDSN
		cliConfig.DocumentsDSN = ""
	}

	e = lib.Install(context.Background(), cliConfig, lib.InstallDb, func(event *lib.InstallProgressEvent) {
		fmt.Println(p.Styler(p.FGFaint)("... " + event.Message))
	})
	if e != nil {
		return nil, fmt.Errorf("could not perform installation: %s", e.Error())
	}

	// TODO initConfig()

	fmt.Println("\n\033[1m## Administrative User Configuration\033[0m")
	if e := promptFrontendAdmin(cliConfig, adminRequired); e != nil {
		return nil, e
	}

	if e := applyAdditionalPrompt("post-admin", cliConfig); e != nil {
		return nil, e
	}

	fmt.Println("\n\033[1m## Default storage location\033[0m")
	if e := promptAdvanced(cliConfig); e != nil {
		return nil, e
	}

	if e := applyAdditionalPrompt("post-advanced", cliConfig); e != nil {
		return nil, e
	}

	fmt.Println("\n\033[1m## Applying configuration\033[0m")
	e = lib.Install(context.Background(), cliConfig, lib.InstallAll, func(event *lib.InstallProgressEvent) {
		fmt.Println(p.Styler(p.FGFaint)("... " + event.Message))
	})
	if e != nil {
		return nil, fmt.Errorf("could not perform installation: %s", e.Error())
	}
	fmt.Println(p.IconGood + " Configuration done")

	if applyDocumentsDSN != "" {
		cliConfig.DocumentsDSN = applyDocumentsDSN
		cliConfig.UseDocumentsDSN = true
		e = lib.Install(context.Background(), cliConfig, lib.InstallDb, func(event *lib.InstallProgressEvent) {
			fmt.Println(p.Styler(p.FGFaint)("... " + event.Message))
		})
		fmt.Println(p.IconGood + " Documents DSN set up")
	}

	fmt.Println("\n\033[1m## Software is ready to run!\033[0m")

	fmt.Println(p.Styler(p.FGFaint)("Cells will be accessible through the following URLs:"))
	ss, _ := config.LoadSites()
	var urls []string
	for _, s := range ss {
		for _, u := range s.GetExternalUrls() {
			urls = append(urls, u.String())
		}
	}
	fmt.Println(p.Styler(p.FGFaint)(strings.Join(urls, ", ")))
	if _, busyPort, _ := checkDefaultBusy(cmd, cliConfig.ProxyConfig, false); busyPort != "" {
		fmt.Println(p.Styler(p.BGRed, p.FGWhite)(fmt.Sprintf("Warning, it seems that port %s is already busy. You may want to change default port by running '"+os.Args[0]+" configure sites' command.", busyPort)))
	} else {
		fmt.Println(p.Styler(p.FGFaint)("Edit these URLs by running '") + p.Styler(p.FGFaint, p.FGBold)(os.Args[0]+" configure sites") + p.Styler(p.FGFaint)("' command."))
	}

	if cmd.Name() != "start" {
		fmt.Println("")
		fmt.Println("Now use '" + p.Styler(p.FGBold)(os.Args[0]+" start") + "' to start the server.")
		fmt.Println("")
	}

	return cliConfig, nil

}

func promptDB(c *install.InstallConfig) (adminRequired bool, err error) {

	connType := p.Select{
		Label: "Database Connection Type",
		Items: []string{"TCP", "Socket", "Manual"},
	}
	dbTcpHost := p.Prompt{Label: "Database Hostname", Validate: notEmpty, Default: c.DbTCPHostname, AllowEdit: true}
	dbTcpPort := p.Prompt{Label: "Database Port", Validate: validPortNumber, Default: c.DbTCPPort, AllowEdit: true}

	dbName := p.Prompt{Label: "Database Name", Validate: notEmpty, Default: c.DbTCPName, AllowEdit: true}
	dbUser := p.Prompt{Label: "Database User", Validate: notEmpty, Default: c.DbTCPUser, AllowEdit: true}
	dbPass := p.Prompt{Label: "Database Password (leave empty if not needed)", Mask: '*'}

	dbSocketFile := p.Prompt{Label: "Socket File", Validate: notEmpty}
	dbDSN := p.Prompt{Label: "Manual DSN", Validate: notEmpty}

	uConnIdx, _, er := connType.Run()
	if er == p.ErrInterrupt {
		return false, er
	}
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
	if res, e := lib.PerformCheck(context.Background(), "DB", c); e != nil {
		fmt.Println(p.IconBad + " Cannot connect to database, please review the parameters: " + e.Error())
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
			confirm := p.Prompt{Label: p.IconWarn + " " + existConfirm + " Do you want to continue", IsConfirm: true}
			if _, e := confirm.Run(); e != nil && e != p.ErrInterrupt {
				return promptDB(c)
			} else if e == p.ErrInterrupt {
				return false, e
			}
		}
	}
	fmt.Println(p.IconGood + " Successfully connected to the database")
	return
}

func promptAdditionalMongoDSN(c *install.InstallConfig, loop bool) error {

	if !loop {
		_, e := (&p.Prompt{
			Label:     "Do you wish to configure a MongoDB connection (better for scalability and required for clustering deployment)",
			IsConfirm: true,
			Default:   "N",
		}).Run()
		if e != nil {
			return nil
		}

		connString := "mongodb://username:password@localhost:27017/?maxPoolSize=20&w=majority"
		fmt.Println("")
		fmt.Println("Connection string will use the basic format '" + connString + "'. ")
		fmt.Println("You can use additional MongoDB features (like DNS SRV or ReplicaSet) by editing configuration directly.")
	}

	var e error
	targetUrl, _ := url.Parse("mongodb://localhost:27017/cells?maxPoolSize=20&w=majority")
	host, port, _ := net.SplitHostPort(targetUrl.Host)
	dbName := strings.TrimLeft(targetUrl.Path, "/")
	dsnHost := p.Prompt{
		Label:   "Server host",
		Default: host,
	}
	dsnPort := p.Prompt{
		Label:   "Server port",
		Default: port,
	}
	dsnDB := p.Prompt{
		Label:   "Database Name",
		Default: dbName,
	}

	if host, e = dsnHost.Run(); e != nil {
		return e
	}
	if port, e = dsnPort.Run(); e != nil {
		return e
	}
	if dbName, e = dsnDB.Run(); e != nil {
		return e
	}
	targetUrl.Host = net.JoinHostPort(host, port)
	targetUrl.Path = "/" + dbName
	dsnAuth := p.Prompt{
		Label:     "Do you wish to setup authentication?",
		IsConfirm: true,
		Default:   "y",
	}
	if _, e := dsnAuth.Run(); e == nil {
		dsnUser := p.Prompt{
			Label:   "User name",
			Default: "",
		}
		dsnPassword := p.Prompt{
			Label:   "Password",
			Default: "",
			Mask:    '*',
		}
		dsnAuthDB := p.Prompt{
			Label:   "Use an other database for authentication (authSource query parameter, leave empty if default)",
			Default: "",
		}
		var user, pass, authDB string
		if user, e = dsnUser.Run(); e != nil {
			return e
		}
		if pass, e = dsnPassword.Run(); e != nil {
			return e
		}
		if authDB, e = dsnAuthDB.Run(); e != nil {
			return e
		}
		targetUrl.User = url.UserPassword(user, pass)
		if authDB != "" {
			targetUrl.Query().Set("authSource", authDB)
		}
	}

	c.DocumentsDSN = targetUrl.String()

	fmt.Println("")
	fmt.Println("Performing test connection to " + targetUrl.Redacted())
	if _, er := lib.PerformCheck(context.Background(), "MONGO", c); er != nil {
		fmt.Println(p.IconBad + " " + er.Error())
		fmt.Println(p.IconBad + " Cannot connect, please review your parameters!")
		return promptAdditionalMongoDSN(c, true)
	}

	return nil

}

func promptDocumentsDSN(c *install.InstallConfig) error {
	driverType := p.Select{
		Label: "Select driver type",
		Items: []string{"mongodb", "boltdb", "bleve"},
	}
	_, driver, e := driverType.Run()
	if e != nil {
		return e
	}
	switch driver {
	case "mongodb":
		dsnP := p.Prompt{
			Label:   "Please enter MongoDB server address. Can be in the form user:pass@host:port/dbName?key=value",
			Default: "localhost:27017/cells?maxPoolSize=20&w=majority",
		}
		mHost, e := dsnP.Run()
		if e != nil {
			return e
		}
		c.DocumentsDSN = "mongodb://" + mHost
	case "bleve", "boltdb":
		fileP := p.Prompt{
			Label:   "Provide a filepath to the on-file database",
			Default: runtime.ApplicationWorkingDir(runtime.ApplicationDirServices) + "/",
		}
		fpath, e := fileP.Run()
		if e != nil {
			return e
		}
		c.DocumentsDSN = driver + "://" + fpath
	default:
		return fmt.Errorf("unsupported driver type")
	}
	return nil
}

func promptFrontendAdmin(c *install.InstallConfig, adminRequired bool) error {

	login := p.Prompt{Label: "Admin Login (leave empty if you want to use existing admin)", Default: "", Validate: func(s string) error {
		if s != "" && strings.ToLower(s) != s {
			return fmt.Errorf("Use lowercase characters only for login")
		}
		return nil
	}}
	pwd := p.Prompt{Label: "Admin Password", Mask: '*'}
	pwd2 := p.Prompt{Label: "Confirm Password", Mask: '*', Validate: func(s string) error {
		if c.FrontendPassword != s {
			return fmt.Errorf("Passwords differ! Change confirmation or hit Ctrl+C to change first value.")
		}
		return nil
	}}
	if adminRequired {
		login.Label = "Admin Login"
		login.Default = "admin"
		login.AllowEdit = true
		login.Validate = notEmpty
		pwd.Validate = notEmpty
	}
	if c.FrontendLogin != "" {
		login.Default = c.FrontendLogin
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
			if c.FrontendRepeatPassword != c.FrontendPassword {
				fmt.Println(p.IconBad, "Passwords differ, please try again!")
				return promptFrontendAdmin(c, adminRequired)
			}
			return e
		}
	}
	return nil

}

func promptAdvanced(c *install.InstallConfig) error {

	dsType := p.Select{
		Label: "Your files will be stored on local filesystem under '" + c.DsFolder + "'. Do you want to change this?",
		Items: []string{
			"It's ok for me, use default location",
			"Select another local folder",
			"Store data in S3-compatible storage (requires api key/secret)",
		},
	}
	i, _, e := dsType.Run()
	if e != nil {
		return e
	}
	if i == 1 {
		dsPath := p.Prompt{Label: "Enter path to a local folder", Default: c.DsFolder, AllowEdit: true, Validate: notEmpty}
		if folder, e := dsPath.Run(); e == nil {
			c.DsFolder = folder
		} else {
			return e
		}
	} else if i == 2 {
		// CHECK S3 CONNECTION
		c.DsType = "S3"
		buckets, canCreate, err := setupS3Connection(c)
		if err != nil {
			return err
		}
		fmt.Println(p.IconGood + fmt.Sprintf(" Successfully connected to S3, listed %d buckets, ability to create: %v", len(buckets), canCreate))
		// NOW SET UP BUCKETS
		usedBuckets, created, err := setupS3Buckets(c, buckets, canCreate)
		if err != nil {
			return err
		}
		if len(created) > 0 {
			fmt.Println(p.IconGood + fmt.Sprintf(" Successfully created the following buckets %s", strings.Join(created, ", ")))
		} else {
			fmt.Println(p.IconGood + fmt.Sprintf(" Buckets used for installing cells were correctly detected (%s)", strings.Join(usedBuckets, ", ")))
		}
	}
	return nil
}

/* VARIOUS HELPERS */
func setupS3Connection(c *install.InstallConfig) (buckets []string, canCreate bool, e error) {

	pr := p.Prompt{Label: "For S3 compatible storage, please provide storage URL (leave empty for Amazon)", Default: c.DsS3Custom, AllowEdit: true}
	if s3Custom, e := pr.Run(); e != nil {
		return buckets, canCreate, e
	} else if s3Custom != "" {
		c.DsS3Custom = strings.Trim(s3Custom, " ")
	}
	pr = p.Prompt{Label: "Provide storage custom region (leave empty for default)", Default: c.DsS3CustomRegion, AllowEdit: true}
	if s3CustomRegion, e := pr.Run(); e != nil {
		return buckets, canCreate, e
	} else if s3CustomRegion != "" {
		c.DsS3CustomRegion = strings.Trim(s3CustomRegion, " ")
	}
	pr = p.Prompt{Label: "Please enter S3 Api Key", Validate: notEmpty}
	if apiKey, e := pr.Run(); e != nil {
		return buckets, canCreate, e
	} else {
		c.DsS3ApiKey = strings.Trim(apiKey, " ")
	}
	pr = p.Prompt{Label: "Please enter S3 Api Secret", Validate: notEmpty, Mask: '*'}
	if apiSecret, e := pr.Run(); e != nil {
		return buckets, canCreate, e
	} else {
		c.DsS3ApiSecret = strings.Trim(apiSecret, " ")
	}
	psItems := []string{
		"v2",
		"v4",
		"v4streaming",
		"anonymous",
	}
	ps := p.Select{
		Label: "Please choose the signature version",
		Items: psItems,
	}
	_, s, e := ps.Run()
	c.DsS3Signature = s

	check, _ := lib.PerformCheck(context.Background(), "S3_KEYS", c)
	var res map[string]interface{}
	e = json.Unmarshal([]byte(check.JsonResult), &res)
	if e != nil {
		return buckets, canCreate, e
	}
	if check.Success {
		if bb, ok := res["buckets"].([]interface{}); ok {
			for _, b := range bb {
				buckets = append(buckets, b.(string))
			}
		}
		if create, ok := res["canCreate"].(bool); ok {
			canCreate = create
		}
		fmt.Println(p.IconGood + " Successfully connected to S3 and list buckets")
		return
	} else {
		fmt.Println(p.IconBad+" Could not connect to S3: ", check.JsonResult)
		retry := p.Prompt{Label: "Do you want to retry with different keys", IsConfirm: true}
		if _, e := retry.Run(); e == nil {
			return setupS3Connection(c)
		} else if e == p.ErrInterrupt {
			return buckets, canCreate, e
		} else {
			return buckets, canCreate, e
		}
	}
}

func setupS3Buckets(c *install.InstallConfig, knownBuckets []string, canCreate bool) (used []string, created []string, e error) {
	var pref string
	prefPrompt := p.Prompt{Label: "Select a unique prefix for this installation buckets.", Default: "cells-"}
	pref, e = prefPrompt.Run()
	if e != nil {
		return
	}
	used = []string{
		pref + "pydiods1",
		pref + "personal",
		pref + "cellsdata",
		pref + "binaries",
		pref + "thumbs",
		pref + "versions",
	}
	var toCreate []string
	for _, bName := range used {
		var exists bool
		for _, k := range knownBuckets {
			if k == bName {
				exists = true
				break
			}
		}
		if exists {
			continue
		}
		toCreate = append(toCreate, bName)
	}
	c.DsS3BucketDefault = pref + "pydiods1"
	c.DsS3BucketPersonal = pref + "personal"
	c.DsS3BucketCells = pref + "cellsdata"
	c.DsS3BucketThumbs = pref + "thumbs"
	c.DsS3BucketBinaries = pref + "binaries"
	c.DsS3BucketVersions = pref + "versions"

	if len(toCreate) == 0 {
		return used, []string{}, nil
	}
	if !canCreate {
		fmt.Printf(p.IconBad+" The following buckets do not exists: %s, and you are not allowed to create them with the current credentials. Please create them first or change the prefix.\n", strings.Join(toCreate, ", "))
		retry := p.Prompt{Label: "Do you want to retry with different keys", IsConfirm: true}
		if _, e := retry.Run(); e == nil {
			return setupS3Buckets(c, knownBuckets, canCreate)
		} else if e == p.ErrInterrupt {
			return used, []string{}, e
		} else {
			return used, []string{}, e
		}
	} else {
		fmt.Printf(p.IconWarn+" The following buckets will be created: %s\n", strings.Join(toCreate, ", "))
		retry := p.Prompt{Label: "Do you wish to continue or to use a different prefix", IsConfirm: true, Default: "y"}
		if _, e = retry.Run(); e != nil {
			return setupS3Buckets(c, knownBuckets, canCreate)
		} else if e == p.ErrInterrupt {
			return used, []string{}, e
		} else {
			check, er := lib.PerformCheck(context.Background(), "S3_BUCKETS", c)
			if !check.Success {
				return used, []string{}, fmt.Errorf("Error while creating buckets: %s", er.Error())
			}
			var dd map[string][]interface{}
			if e = json.Unmarshal([]byte(check.JsonResult), &dd); e == nil {
				for _, b := range dd["bucketsCreated"] {
					created = append(created, b.(string))
				}
			}
			return
		}
	}
}

func RegisterAdditionalPrompt(step CellsCliPromptStep) {
	additionalPrompts = append(additionalPrompts, step)
}

func applyAdditionalPrompt(step string, i *install.InstallConfig) error {
	for _, s := range additionalPrompts {
		if s.Step == step {
			return s.Prompt(i)
		}
	}
	return nil
}

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

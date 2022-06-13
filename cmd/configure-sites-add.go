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
	"fmt"
	net2 "net"
	"net/url"
	"strings"

	p "github.com/manifoldco/promptui"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/install"
	"github.com/pydio/cells/v4/common/utils/net"
)

var sitesAdd = &cobra.Command{
	Use:   "add",
	Short: "Add a site",
	Long: `
DESCRIPTION

  Add a site for binding Cells to another address.
  See 'sites' command help for more info about Sites management.
`,
	Run: func(cmd *cobra.Command, args []string) {

		sites, _ := config.LoadSites(true)

		newSite := &install.ProxyConfig{}

		e := promptSite(newSite, false)
		if e != nil {
			fatalIfError(cmd, e)
		}
		sites = append(sites, newSite)

		if e := confirmAndSave(cmd, args, sites); e != nil {
			fatalIfError(cmd, e)
		}
	},
}

func init() {
	sitesCmd.AddCommand(sitesAdd)
}

func promptSite(site *install.ProxyConfig, edit bool) (e error) {

	if edit {
		label := "Site already declares the followings hosts: [" + strings.Join(site.Binds, ", ") + "]. Do you want to change this"
		maintenanceString := "Set in maintenance mode"
		if site.Maintenance {
			maintenanceString = "Switch-off maintenance mode"
		}
		pr := p.Select{Label: label, Items: []string{
			"Leave as is",
			"Reset list and set a new host",
			"Append hosts to this list",
			maintenanceString,
		}}
		i, _, e := pr.Run()
		if e != nil {
			return e
		}
		if i == 1 {
			site.Binds = []string{}
			promptBindURLs(site, false, "")
		} else if i == 2 {
			promptBindURLs(site, false, "")
		} else if i == 3 {
			promptMaintenanceMode(site)
			return nil
		}
	} else {
		// Get URL info from end user
		e = promptBindURLs(site, false, "")
		if e != nil {
			return
		}

	}

	_, e = promptTLSMode(site)
	if e != nil {
		return
	}

	e = promptExtURL(site)
	if e != nil {
		return
	}

	return
}

func promptMaintenanceMode(site *install.ProxyConfig) (e error) {
	if site.Maintenance {
		fmt.Println("# Switching site back to production")
		site.Maintenance = false
		return
	}
	fmt.Println("# Switching site to maintenance mode")
	site.Maintenance = true
	confPrompt := p.Prompt{
		Label:     "Define/change custom conditions for maintenance mode (use comma-separated-list, clear value to remove all)",
		Default:   strings.Join(site.MaintenanceConditions, ","),
		AllowEdit: true,
	}
	conditions, e := confPrompt.Run()
	if e != nil {
		return e
	}
	site.MaintenanceConditions = []string{}
	for _, cond := range strings.Split(conditions, ",") {
		cond = strings.TrimSpace(cond)
		if cond == "" {
			continue
		}
		site.MaintenanceConditions = append(site.MaintenanceConditions, cond)
	}
	return nil
}

func promptBindURLs(site *install.ProxyConfig, resolveHosts bool, bindingPort string) (e error) {

	if bindingPort == "" {
		def := strings.Split(config.DefaultBindingSite.Binds[0], ":")[1]
		portPrompt := &p.Prompt{
			Label:     "Binding Port",
			Validate:  validPortNumber,
			Default:   def,
			AllowEdit: true,
		}
		var er error
		bindingPort, er = portPrompt.Run()
		if er != nil {
			return er
		}
	}
	var bindHost string
	defaultIps, e := net.GetAvailableIPs()
	if e != nil {
		return
	}
	var items []string
	var hasLocalhost bool
	if resolveHosts {
		if res, err := net.HostsFileLookup(); err == nil {
			for _, h := range res {
				if h == "localhost" {
					hasLocalhost = true
				}
				items = append(items, h)
			}
		}
	}

	testExt, eExt := net.GetOutboundIP()
	if eExt == nil {
		items = append(items, testExt.String())
	}
	for _, ip := range defaultIps {
		if testExt != nil && testExt.String() == ip.String() {
			continue
		}
		items = append(items, ip.String())
	}
	if !hasLocalhost {
		items = append([]string{"0.0.0.0", "localhost"}, items...)
	}
	resolveString := "Additional hosts from /etc/hosts..."
	if !resolveHosts {
		items = append(items, resolveString)
	}

	prompt := p.SelectWithAdd{
		Label:    "Binding Host (webserver will listen to {Host}:{Port}. Use an IP or domain name)",
		Items:    items,
		AddLabel: "Other (enter your own ip/domain)",
	}
	_, bindHost, e = prompt.Run()
	if e != nil {
		return
	}
	if bindHost == resolveString {
		return promptBindURLs(site, true, bindingPort)
	}

	bindHost = fmt.Sprintf("%s:%s", bindHost, bindingPort)
	// Sanity checks
	tmpBindStr, e1 := guessParsableURL(bindHost, true)
	if e1 != nil {
		return fmt.Errorf("could not parse provided host URL %s, please use an [IP|DOMAIN]:[PORT] string", bindHost)
	}
	bindURL, e1 := url.Parse(tmpBindStr)
	if e1 != nil {
		return fmt.Errorf("could not parse provided host URL %s, please use an [IP|DOMAIN]:[PORT] string", bindHost)
	}

	// Insure we have a port
	// TODO let end user try again
	parts := strings.Split(bindURL.Host, ":")
	if len(parts) != 2 {
		return fmt.Errorf("Please provide an [IP|DOMAIN]:[PORT] string")
	}

	site.Binds = append(site.Binds, fmt.Sprintf("%s:%s", bindURL.Hostname(), bindURL.Port()))

	// TLS not included by default, still ask the user if he wants to change it
	addOtherHost := p.Prompt{Label: "Do you want to add another host? [y/N] ", Default: ""}
	if val, e1 := addOtherHost.Run(); e1 == nil && (val == "Y" || val == "y") {
		return promptBindURLs(site, false, "")
	}

	return nil
}

func promptExtURL(site *install.ProxyConfig) error {

	prompt := p.Prompt{
		Label:     "If this site is accessed through a reverse proxy, provide full external URL (https://mydomain.com)",
		Validate:  validUrl,
		Default:   site.ReverseProxyURL,
		AllowEdit: true,
	}
	val, _ := prompt.Run()
	if val != "" {
		site.ReverseProxyURL = val
	}

	return nil
}

func promptTLSMode(site *install.ProxyConfig) (enabled bool, e error) {

	selector := p.Select{
		Label: "Choose TLS activation mode",
		Items: []string{
			"Self-signed: generate your own locally trusted certificate (recommended behind a reverse proxy)",
			"Custom Certificate: provide paths to certificate/key files",
			"Let's Encrypt: automagically generate domain certificates signed by LetsEncrypt Authority",
			"Disabled: staging environments only (not recommended!)",
		},
	}
	var i int
	i, _, e = selector.Run()
	if e != nil {
		return
	}

	enabled = true
	switch i {
	case 0:

		site.TLSConfig = &install.ProxyConfig_SelfSigned{
			SelfSigned: &install.TLSSelfSigned{},
		}

	case 1:
		var certFile, keyFile string
		if site.HasTLS() && site.GetTLSCertificate() != nil {
			certFile = site.GetTLSCertificate().GetCertFile()
			keyFile = site.GetTLSCertificate().GetKeyFile()
		}
		certPrompt := p.Prompt{Label: "Provide absolute path to the HTTP certificate", Default: certFile, Validate: notEmpty, AllowEdit: true}
		keyPrompt := p.Prompt{Label: "Provide absolute path to the HTTP private key", Default: keyFile, Validate: notEmpty, AllowEdit: true}
		if certFile, e = certPrompt.Run(); e != nil {
			if e == p.ErrInterrupt {
				return promptTLSMode(site)
			}
			return
		}
		if keyFile, e = keyPrompt.Run(); e != nil {
			if e == p.ErrInterrupt {
				return promptTLSMode(site)
			}
			return
		}
		site.TLSConfig = &install.ProxyConfig_Certificate{
			Certificate: &install.TLSCertificate{
				CertFile: certFile,
				KeyFile:  keyFile,
			},
		}

	case 2:
		var certEmail string
		if site.HasTLS() && site.GetTLSLetsEncrypt() != nil {
			certEmail = site.GetTLSLetsEncrypt().GetEmail()
		}
		mailPrompt := p.Prompt{Label: "Please enter the mail address for certificate generation", Validate: validateMailFormat, Default: certEmail, AllowEdit: true}
		acceptEulaPrompt := p.Prompt{Label: "Do you agree to the Let's Encrypt SA? [Y/n] ", Default: ""}

		certMail, e1 := mailPrompt.Run()
		if e1 != nil {
			if e1 == p.ErrInterrupt {
				return promptTLSMode(site)
			}
			e = e1
			return
		}

		if val, e1 := acceptEulaPrompt.Run(); e1 != nil {
			if e1 == p.ErrInterrupt {
				return promptTLSMode(site)
			}
			e = e1
			return
		} else if !(val == "Y" || val == "y" || val == "") {
			e = fmt.Errorf("You must agree to Let's Encrypt SA to use automated certificate generation feature.")
			return
		}

		useStagingPrompt := p.Prompt{Label: "Do you want to use Let's Encrypt staging entrypoint? [y/N] ", Default: ""}
		useStaging := true
		if val, e1 := useStagingPrompt.Run(); e1 != nil {
			if e1 == p.ErrInterrupt {
				return promptTLSMode(site)
			}
			e = e1
			return
		} else if val == "N" || val == "n" || val == "" {
			useStaging = false
		}

		site.TLSConfig = &install.ProxyConfig_LetsEncrypt{
			LetsEncrypt: &install.TLSLetsEncrypt{
				Email:      certMail,
				AcceptEULA: true,
				StagingCA:  useStaging,
			},
		}

	case 3:
		enabled = false
		site.TLSConfig = nil
	}

	// Reset redirect URL: for the time being we rather use this as a flag
	var has443 bool
	for _, b := range site.Binds {
		if _, port, e := net2.SplitHostPort(b); e == nil && port == "443" {
			has443 = true
			break
		}
	}
	if enabled && has443 {
		redirPrompt := p.Select{
			Label: "Do you want to automatically redirect HTTP (80) to HTTPS? Warning: this requires the right to bind to port 80 on this machine.",
			Items: []string{
				"Yes",
				"No",
			}}
		if i, _, e = redirPrompt.Run(); e == nil && i == 0 {
			site.SSLRedirect = true
		}
	}

	return
}

// helper to add a not-so-stupid scheme to URL strings to be then able to rely on the net/url package to manipulate URL.
func guessSchemeAndParseBaseURL(rawURL string, tlsEnabled bool) (*url.URL, error) {

	wScheme, err := guessParsableURL(rawURL, tlsEnabled)
	if err != nil {
		return nil, fmt.Errorf("could not guess scheme for %s: %s", niBindUrl, err.Error())
	}
	return url.Parse(wScheme)
}

func guessParsableURL(rawURL string, tlsEnabled bool) (string, error) {

	if strings.HasPrefix(rawURL, "http") {
		return rawURL, nil
	}

	parts := strings.Split(rawURL, ":")

	scheme := "https" // default to TLS
	if len(parts) > 2 {
		return rawURL, fmt.Errorf("could not process URL %s. We expect a host of form [IP|DOMAIN](:[PORT]) string", rawURL)
	} else if len(parts) == 2 && parts[1] == "80" {
		scheme = "http"
	} else if !tlsEnabled {
		scheme = "http"
	}

	return fmt.Sprintf("%s://%s", scheme, rawURL), nil
}

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
	"net"
	"os"
	"strconv"
	"strings"

	"github.com/manifoldco/promptui"
	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/install"
)

var sitesCmd = &cobra.Command{
	Use:   "sites",
	Short: "Manage site addresses",
	Long: `
DESCRIPTION
  
  Manage how Cells is binding to the localhost's network interface addresses and accepting traffic coming from external URLs.
  This is the main tool for listing, editing, adding and removing sites. Additional sub-commands allow you to directly create or delete sites.
  
  Each site has following parameters:
   1. <Bind Addresse(s)>: one or more <ip/hostname:port> to bind Cells to localhost's network interface addresses. 
   2. <TLS Settings>: TLS configuration for HTTPS support.
   3. <External URL>: Accept traffic coming from this url and redirect to one of the bind address.
      Typically if the app is behind a reverse proxy or inside a container with ports mapping.
   4. <Maintenance Mode> [On|Off]: expose a maintenance page on this endpoint, although Cells is running.

EXAMPLES 

  1. Default value (used when no sites is configured)
    - Bind Address: 0.0.0.0:8080
    - TLS: SelfSigned
    - External URL: [left empty]
  
  2. Provided certificate
    - Bind Address: 0.0.0.0:8080
    - TLS: Your own key/cert pair
    - External URL: https://share.mydomain.tld
  
  3. Auto-TLS using Let's Encrypt 
    - Bind Address: share.mydomain.tld:443
    - TLS: LetsEncrypt
    - External URL: https://share.mydomain.tld
  
  4. Self-signed
    - Bind Address: IP:1515         # internal port
    - TLS: Self-signed
    - External URL: https://IP:8080   # external port mapped by docker
  
  5. HTTP only
    - Bind Address: localhost:8080
    - TLS: Disabled
    - External URL: http://localhost:8080  # Non-secured local installation

`,
	PersistentPreRun: func(cmd *cobra.Command, args []string) {
		initConfig()
	},
	Run: func(cmd *cobra.Command, args []string) {
		sites, e := config.LoadSites(true)
		fatalIfError(cmd, e)
		if len(sites) == 0 {
			fmt.Println("No site is currently configured. Cells exposes automatically the following URLs : ")
			ss, _ := config.LoadSites()
			autoSite := ss[0]
			for _, u := range autoSite.GetBindURLs() {
				fmt.Println("   - " + u)
			}
			p := &promptui.Prompt{
				Label:     "Do you want to create a new site (it will replace the default one)",
				IsConfirm: true,
			}
			if _, e := p.Run(); e == nil {
				sitesAdd.Run(cmd, args)
			} else if e == promptui.ErrInterrupt {
				fatalIfError(cmd, e)
			}
		} else {
			fmt.Println("The following sites are currently defined:")
			listSites(cmd, sites)
			editString := "Edit an existing site"
			deleteString := "Delete an existing site"
			if len(sites) == 1 {
				editString = "Edit current site"
				deleteString = "Delete current site (will fallback to defaults)"
			}
			actionP := promptui.Select{
				Items: []string{
					"Add a new site",
					editString,
					deleteString,
					"Quit",
				},
				Label: "What do you want to do",
			}
			action, _, e := actionP.Run()
			fatalIfError(cmd, e)
			switch action {
			case 0:
				sitesAdd.Run(cmd, args)
			case 1:
				index := 0
				if len(sites) > 1 {
					p := &promptui.Prompt{
						Label: "Provide the site number to edit",
						Validate: func(s string) error {
							i, e := strconv.ParseInt(s, 10, 64)
							if e != nil {
								return e
							}
							if int(i) >= len(sites) {
								return fmt.Errorf("please provide a number smaller than %d", len(sites))
							}
							return nil
						},
					}
					if n, e := p.Run(); e != nil || n == "" {
						fatalIfError(cmd, e)
					} else if idx, e := strconv.ParseInt(n, 10, 64); e == nil && int(idx) < len(sites) {
						index = int(idx)
					}
				}
				e := promptSite(sites[index], true)
				fatalIfError(cmd, e)
				e = confirmAndSave(cmd, args, sites)
				fatalIfError(cmd, e)
			case 2:
				index := "0"
				if len(sites) > 1 {
					p := &promptui.Prompt{
						Label: "Provide the site number to be removed",
						Validate: func(s string) error {
							i, e := strconv.ParseInt(s, 10, 64)
							if e != nil {
								return e
							}
							if int(i) >= len(sites) {
								return fmt.Errorf("please provide a number smaller than %d", len(sites))
							}
							return nil
						},
					}
					if n, e := p.Run(); e != nil || n == "" {
						return
					} else if idx, e := strconv.ParseInt(n, 10, 64); e == nil && int(idx) < len(sites) {
						index = n
					}
				}
				sitesDelete.Run(cmd, []string{index})
			case 3:
				return

			}
			cmd.Run(cmd, args)
		}
	},
}

func listSites(cmd *cobra.Command, sites []*install.ProxyConfig) {

	oneHasMaintenance := false
	for _, s := range sites {
		if s.Maintenance {
			oneHasMaintenance = true
			break
		}
	}

	table := tablewriter.NewWriter(cmd.OutOrStdout())
	table.SetRowLine(true)
	headers := []string{"#", "Bind(s)", "TLS", "External URL"}
	if oneHasMaintenance {
		headers = append(headers, "Maintenance Mode")
	}
	table.SetHeader(headers)

	for i, s := range sites {
		tlsString := "No Tls"
		if s.TLSConfig != nil {
			// TLSConfig
			switch s.TLSConfig.(type) {
			case *install.ProxyConfig_SelfSigned:
				tlsString = "Self-signed"
			case *install.ProxyConfig_LetsEncrypt:
				tlsString = "Lets Encrypt"
			case *install.ProxyConfig_Certificate:
				tlsString = "Custom Certificate"
			}
		}
		data := []string{fmt.Sprintf("%d", i), strings.Join(s.GetBindURLs(), ", "), tlsString, s.ReverseProxyURL}
		if oneHasMaintenance {
			m := ""
			if s.Maintenance {
				m = "On"
				if len(s.MaintenanceConditions) > 0 {
					m = strings.Join(s.MaintenanceConditions, ",")
				}
			}
			data = append(data, m)
		}
		table.Append(data)
	}

	table.Render()
}

func confirmAndSave(cmd *cobra.Command, args []string, sites []*install.ProxyConfig) error {

	if len(args) > 0 && args[0] == "skipConfirm" {
		return config.SaveSites(sites, common.PydioSystemUsername, "Updating config sites")
	}
	has1024 := false
	hasLE := false
	for _, s := range sites {
		for _, b := range s.Binds {
			if _, p, e := net.SplitHostPort(b); e == nil {
				if i, er := strconv.ParseInt(p, 10, 32); er == nil && i < 1024 {
					has1024 = true
					break
				}
			}
		}
		if s.GetLetsEncrypt() != nil {
			hasLE = true
		}
	}

	// Reprint before saving
	cmd.Println("*************************************************")
	cmd.Println("  Please review your parameters before saving     ")
	cmd.Println("*************************************************")
	listSites(cmd, sites)

	if has1024 || hasLE {
		cmd.Println("")
		cmd.Println(promptui.IconWarn + " WARNING")
		cmd.Println("Binding to a port below 1024 (typically 80 or 443) requires specific permissions on some OS.")
		if hasLE {
			cmd.Println("Note that Let's Encrypt validation protocol requires a temporary access to port 80.")
		}
		cmd.Println("On Linux, run (as root user): " + promptui.Styler(promptui.FGBold)("$> setcap 'cap_net_bind_service=+ep' "+os.Args[0]))
		cmd.Println("")
	}
	confirm := promptui.Prompt{Label: "Do you want to save this configuration", IsConfirm: true}
	if _, e := confirm.Run(); e == nil {
		e = config.SaveSites(sites, common.PydioSystemUsername, "Updating config sites")
		if e != nil {
			cmd.Println("***********************************************")
			cmd.Println("[ERROR] Could not save config : " + e.Error())
			cmd.Println("***********************************************")
			return e
		} else {
			cmd.Println("********************************************************")
			cmd.Println("   Config has been updated, please restart Cells now.   ")
			cmd.Println("********************************************************")
		}
	} else {
		cmd.Println("***********************************************")
		cmd.Println("   Operation aborted, nothing has been saved   ")
		cmd.Println("***********************************************")
	}
	return nil
}

func init() {
	ConfigureCmd.AddCommand(sitesCmd)
}

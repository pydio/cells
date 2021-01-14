package cmd

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/manifoldco/promptui"
	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/install"
)

var sitesCmd = &cobra.Command{
	Use:   "sites",
	Short: "Manage sites where application is exposed",
	Long: `
Manage how Cells is binding to network interfaces and how it is exposed to outside world.
This is the main tool for listing, editing, adding and removing URLs.
Additional sub-commands allow you to directly create/delete sites.

Each site has following parameters:
   1. Bind Host: the name (or IP) and port to hook the internal webserver on a the network interface 
   2. TLS Settings: choose the TLS configuration that is exposed by this internal webserver
   3. External URL: the URL you communicate to your end-users. It can differ from your bind address, 
      typically if the app is behind a reverse-proxy or inside a container with ports mapping.

 Here is a list with a few examples of valid URL couples:
 
 - Bind Host: 0.0.0.0:8080
 - External Host: https://share.mydomain.tld
 Or
 - Bind Host: share.mydomain.tld:443
 - External Host: https://share.mydomain.tld
 Or
 - Bind Host: IP:1515               # internal port
 - External Host: https://IP:8080   # external port mapped by docker
 Or
 - Bind Host: localhost:8080
 - External Host: http://localhost:8080  # Non-secured local installation

`,
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
						Label: "Provide the site number to be remove",
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

	// Reprint before saving
	cmd.Println("*************************************************")
	cmd.Println("  Please review your parameters before saving     ")
	cmd.Println("*************************************************")
	listSites(cmd, sites)

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

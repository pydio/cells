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
Manage how Cells is binding to network interfaces and how it is exposed to outside world (or not).

Sub-commands allow you to create/edit/delete multiple sites.
`,
	Run: func(cmd *cobra.Command, args []string) {
		sites, e := config.LoadSites(true)
		fatalQuitIfError(cmd, e)
		if len(sites) == 0 {
			fmt.Println("No site is currently configured. Cells exposes automatically the following URLs : ")
			ss, _ := config.LoadSites()
			autoSite := ss[0]
			for _, u := range autoSite.GetBindURLs() {
				fmt.Println("   - " + u)
			}
			p := &promptui.Prompt{
				Label:     "Do you want to create a new site? It will replace the automatic one",
				IsConfirm: true,
			}
			if _, e := p.Run(); e == nil {
				sitesAdd.Run(cmd, args)
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
			fatalQuitIfError(cmd, e)
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
						return
					} else if idx, e := strconv.ParseInt(n, 10, 64); e == nil && int(idx) < len(sites) {
						index = int(idx)
					}
				}
				e := promptSite(sites[index], true)
				fatalQuitIfError(cmd, e)
				e = confirmAndSave(cmd, sites)
				fatalQuitIfError(cmd, e)
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

func confirmAndSave(cmd *cobra.Command, sites []*install.ProxyConfig) error {
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
			cmd.Println("*********************************************************************")
			cmd.Println(" Config has been updated, internal proxy will restart automatically  ")
			cmd.Println("*********************************************************************")
		}
	} else {
		cmd.Println("***********************************************")
		cmd.Println("   Operation aborted, nothing has been saved   ")
		cmd.Println("***********************************************")
	}
	return nil
}

func init() {
	ConfigCmd.AddCommand(sitesCmd)
}

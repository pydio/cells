package cmd

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/olekukonko/tablewriter"

	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/install"
)

var sitesCmd = &cobra.Command{
	Use:   "sites",
	Short: "Manage sites where application is exposed",
	Long:  ``,
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
			actionP := promptui.Prompt{
				Label: "What do you want to do? Type " + promptui.IconSelect + "[A] to add a new site, " + promptui.IconSelect + "[E] to edit an existing one, " + promptui.IconSelect + "[D] to delete a site, or " + promptui.IconSelect + "[Q] to quit",
				Validate: func(s string) error {
					s = strings.ToLower(s)
					if s != "a" && s != "e" && s != "d" && s != "q" {
						return fmt.Errorf("Please use one of [A|E|D|Q] values")
					}
					return nil
				},
			}
			action, e := actionP.Run()
			fatalQuitIfError(cmd, e)
			action = strings.ToLower(action)
			switch action {
			case "q":
				return
			case "a":
				sitesAdd.Run(cmd, args)
			case "e":
				p := &promptui.Prompt{
					Label: "Use the site number to edit it or hit Enter to exit",
				}
				if n, e := p.Run(); e != nil || n == "" {
					return
				} else if idx, e := strconv.ParseInt(n, 10, 64); e == nil && int(idx) < len(sites) {
					e := promptSite(sites[int(idx)], true)
					fatalQuitIfError(cmd, e)
					e = confirmAndSave(cmd, sites)
					fatalQuitIfError(cmd, e)
				}
			case "d":
				p := &promptui.Prompt{
					Label: "Provide the site number to be remove",
				}
				if n, e := p.Run(); e != nil || n == "" {
					return
				} else if idx, e := strconv.ParseInt(n, 10, 64); e == nil && int(idx) < len(sites) {
					sitesDelete.Run(cmd, []string{n})
				}
			}
			cmd.Run(cmd, args)
		}
	},
}

func listSites(cmd *cobra.Command, sites []*install.ProxyConfig) {

	table := tablewriter.NewWriter(cmd.OutOrStdout())
	table.SetRowLine(true)
	table.SetHeader([]string{"#", "Bind(s)", "TLS", "External URL"})

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
		table.Append([]string{fmt.Sprintf("%d", i), strings.Join(s.GetBindURLs(), ", "), tlsString, s.ReverseProxyURL})
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
		e = config.SaveSites(sites, common.PYDIO_SYSTEM_USERNAME, "Updating config sites")
		if e != nil {
			cmd.Println("***********************************************")
			cmd.Println("[ERROR] Could not save config : " + e.Error())
			cmd.Println("***********************************************")
			return e
		} else {
			cmd.Println("***********************************************")
			cmd.Println(" Config has been updated, please restart now!  ")
			cmd.Println("***********************************************")
		}
	} else {
		cmd.Println("***********************************************")
		cmd.Println(" Operation aborted, nothing has been saved     ")
		cmd.Println("***********************************************")
	}
	return nil
}

func init() {
	ConfigCmd.AddCommand(sitesCmd)
}

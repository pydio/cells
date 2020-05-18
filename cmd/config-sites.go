package cmd

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/pydio/cells/common"

	"github.com/manifoldco/promptui"
	"github.com/pydio/cells/common/config"
	"github.com/spf13/cobra"
)

var sitesCmd = &cobra.Command{
	Use:   "sites",
	Short: "Manage sites where application is exposed",
	Long:  ``,
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
				Label:     "Do you want to create a new site? It will replace the automatic one",
				IsConfirm: true,
			}
			if _, e := p.Run(); e == nil {
				sitesAdd.Run(cmd, args)
			}
		} else {
			fmt.Println("The following sites are already defined in configurations : ")
			for i, s := range sites {
				fmt.Printf(" - [%d] %s\n", i, strings.Join(s.GetBindURLs(), ", "))
			}
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
			fatalIfError(cmd, e)
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
					fatalIfError(cmd, e)
					e = config.SaveSites(sites, common.PYDIO_SYSTEM_USERNAME, "Updating config sites")
					fatalIfError(cmd, e)
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

func init() {
	configCmd.AddCommand(sitesCmd)
}

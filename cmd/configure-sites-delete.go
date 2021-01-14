package cmd

import (
	"fmt"
	"log"
	"strconv"

	"github.com/spf13/cobra"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/install"
)

func init() {
	sitesCmd.AddCommand(sitesDelete)
}

var sitesDelete = &cobra.Command{
	Use:   "delete",
	Short: "Remove a site by its index",
	Long: `
DESCRIPTION

  Remove a site exposing Cells to a given URL, by providing its index.
  See 'sites' command help for more info about Sites management.
`,
	Run: func(cmd *cobra.Command, args []string) {
		sites, e := config.LoadSites(true)
		if len(sites) == 0 {
			cmd.Println("No sites are defined in config, currently using defaults. Nothing to do.")
			return
		}
		fatalIfError(cmd, e)
		err := fmt.Errorf("Please provide an index between 0 and %d", len(sites)-1)
		if len(sites) == 1 {
			err = fmt.Errorf("Please confirm you wish to delete this site by providing index 0 as argument")
		}
		if len(args) == 0 {
			fatalIfError(cmd, err)
		}
		idx, er := strconv.ParseInt(args[0], 10, 64)
		if er != nil {
			fatalIfError(cmd, err)
		}
		if int(idx) >= len(sites) {
			fatalIfError(cmd, err)
		}
		var newSites []*install.ProxyConfig
		for i, s := range sites {
			if i == int(idx) {
				continue
			}
			newSites = append(newSites, s)
		}
		if e := confirmAndSave(cmd, args, newSites); e != nil {
			log.Fatal(e)
		}
	},
}

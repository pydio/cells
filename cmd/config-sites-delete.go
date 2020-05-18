package cmd

import (
	"fmt"
	"strconv"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/install"

	"github.com/pydio/cells/common/config"
	"github.com/spf13/cobra"
)

func init() {
	sitesCmd.AddCommand(sitesDelete)
}

var sitesDelete = &cobra.Command{
	Use:   "delete",
	Short: "Remove a site by its index",
	Long:  "Remove a site by its index",
	Run: func(cmd *cobra.Command, args []string) {
		sites, e := config.LoadSites(true)
		fatalIfError(cmd, e)
		err := fmt.Errorf("Please provide an index between 0 and %d", len(sites)-1)
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
		config.SaveSites(newSites, common.PYDIO_SYSTEM_USERNAME, "Saving sites")
	},
}

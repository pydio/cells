package cmd

import (
	"context"
	"time"

	"github.com/pydio/cells/common/utils/permissions"

	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/auth"
	"github.com/pydio/cells/common/registry"
)

var (
	tokUserLogin   string
	tokExpireTime  string
	tokAutoRefresh int
	tokScopes      []string
)

var pTokCmd = &cobra.Command{
	Use:   "token",
	Short: "Generate a personal token for a given user",
	Run: func(cmd *cobra.Command, args []string) {

		var expire time.Time
		if tokExpireTime != "" {
			if d, e := time.ParseDuration(tokExpireTime); e == nil {
				expire = time.Now().Add(d)
			}
		}
		u, e := permissions.SearchUniqueUser(context.Background(), tokUserLogin, "")
		if e != nil {
			cmd.Println("Cannot find user")
			return
		}
		cli := auth.NewPersonalAccessTokenServiceClient(registry.GetClient(common.ServiceToken))
		resp, e := cli.Generate(context.Background(), &auth.PatGenerateRequest{
			Type:              auth.PatType_PERSONAL,
			UserUuid:          u.Uuid,
			UserLogin:         tokUserLogin,
			Label:             "Command generated token",
			ExpiresAt:         expire.Unix(),
			AutoRefreshWindow: int32(tokAutoRefresh),
			Scopes:            tokScopes,
		})
		if e != nil {
			log.Fatal(e.Error())
			return
		}
		cmd.Println(resp.AccessToken)

	},
}

func init() {
	RootCmd.AddCommand(pTokCmd)
	pTokCmd.Flags().StringVarP(&tokUserLogin, "user", "u", "", "User login")
	pTokCmd.Flags().StringVarP(&tokExpireTime, "expire", "e", "", "Expire after ... ")
	pTokCmd.Flags().IntVarP(&tokAutoRefresh, "auto", "a", 0, "Auto-refresh (in seconds)")
	pTokCmd.Flags().StringSliceVarP(&tokScopes, "scope", "s", []string{}, "Optional scopes (multiple)")
}

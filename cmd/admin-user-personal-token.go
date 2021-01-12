package cmd

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/auth"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/utils/permissions"
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
	Long: `
This command generates an authentication token for a specific user. 

Expiration can be either a "hard" limit, by using the -e flag and a golang duration, or a "sliding window" 
defined in seconds using the -a flag. 

Generation examples
--------------------
Generate a token that lasts 24 hours for user admin
$ ` + os.Args[0] + ` user token -u admin -e 24h

Generate a token that lasts by default 10mn, but which expiration is refreshed to the next 10mn each time 
token is used.
$ ` + os.Args[0] + ` user token -u admin -a 600

Usage
-----
These token can be used in replacement of an OAuth2-based access token : they can replace the "Bearer" access 
token when calling any REST API. They can also be used as the password (in conjunction with username) for all 
basic-auth based APIs (e.g. webDAV).

Token Scope
-----------
By default, generated tokens grant the same level of access as a standard login operation. To improve security, 
it is possible to restrict these accesses to a specific file or folder (given it is accessible by the user in 
first place) with a "scope" in the format "node:NODE_UUID:PERMISSION" where PERMISSION string contains either "r"
(read) or "w" (write) or both.

`,
	Run: func(cmd *cobra.Command, args []string) {

		if tokUserLogin == "" && tokExpireTime == "" && tokAutoRefresh == 0 {
			cmd.Help()
			return
		}

		var expire time.Time
		if tokExpireTime != "" {
			if d, e := time.ParseDuration(tokExpireTime); e == nil {
				expire = time.Now().Add(d)
			} else {
				fmt.Println(promptui.IconBad + " Cannot parse expire duration. Use golang format like 30s, 30m, 24h")
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
		var uDisplay = u.Login
		if u.Attributes != nil && u.Attributes[idm.UserAttrDisplayName] != "" {
			uDisplay = u.Attributes[idm.UserAttrDisplayName]
		}
		cmd.Println(promptui.IconGood + fmt.Sprintf(" This token for %s will expire on %s.", uDisplay, expire))
		cmd.Println(promptui.IconGood + " " + resp.AccessToken)
		cmd.Println("")
		cmd.Println(promptui.IconWarn + " Make sure to secure it as it grants access to the user resources!")

	},
}

func init() {
	UserCmd.AddCommand(pTokCmd)
	pTokCmd.Flags().StringVarP(&tokUserLogin, "user", "u", "", "User login (mandatory)")
	pTokCmd.Flags().StringVarP(&tokExpireTime, "expire", "e", "", "Expire after (golang duration format)...")
	pTokCmd.Flags().IntVarP(&tokAutoRefresh, "auto", "a", 0, "Auto-refresh (number of seconds, see help)")
	pTokCmd.Flags().StringSliceVarP(&tokScopes, "scope", "s", []string{}, "Optional scopes")
}

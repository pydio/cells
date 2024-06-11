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
	"context"
	"fmt"
	"os"
	"time"

	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/proto/auth"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/permissions"
	"github.com/pydio/cells/v4/common/utils/std"
)

var (
	tokUserLogin     string
	tokExpireTime    string
	tokAutoRefresh   string
	tokCreationQuiet bool
	tokScopes        []string
)

var pTokCmd = &cobra.Command{
	Use:   "token",
	Short: "Generate a personal token for a user",
	Long: `
DESCRIPTION

  Generate a personal authentication token for a user. 
  Expiration can be set in two ways:  
    + A hard limit, by using the -e flag (duration)
    + A sliding window by using the -a flag (duration): in that case the token expiration will be refreshed each time
      the token is used (e.g a request using this token is received).

EXAMPLES

  Generate a token that lasts 24 hours for user admin
  $ ` + os.Args[0] + ` admin user token -u admin -e 24h

  Generate a token that lasts by default 10mn, but which expiration is refreshed to the next 10mn each time 
  the token is used.
  $ ` + os.Args[0] + ` admin user token -u admin -a 10m

TOKEN USAGE

  These token can be used in replacement of an OAuth2-based access token: they can replace the "Bearer" access 
  token when calling any REST API. They can also be used as the password (in conjunction with username) for all 
  basic-auth based APIs (e.g. webDAV).

TOKEN SCOPE

  By default, generated tokens grant the same level of access as a standard login operation. To improve security, 
  it is possible to restrict these accesses to a specific file or folder (given it is accessible by the user in 
  first place) with a "scope" in the format "node:NODE_UUID:PERMISSION" where PERMISSION string contains either "r"
  (read) or "w" (write) or both.
`,
	Run: func(cmd *cobra.Command, args []string) {

		if tokUserLogin == "" || (tokExpireTime == "" && tokAutoRefresh == "") {
			cmd.Println("Missing Arguments")
			cmd.Help()
			return
		}

		var expire time.Time
		var refreshSeconds int32
		if tokExpireTime != "" {
			if d, e := std.ParseCellsDuration(tokExpireTime); e == nil {
				expire = time.Now().Add(d)
			} else {
				fmt.Println(promptui.IconBad + " Cannot parse expire duration. Use golang format like 30s, 30m, 24h, 28d")
			}
		}
		if tokAutoRefresh != "" {
			if d, e := std.ParseCellsDuration(tokAutoRefresh); e == nil {
				refreshSeconds = int32(d.Seconds())
			} else {
				fmt.Println(promptui.IconBad + " Cannot parse auto-refresh duration. Use golang format like 30s, 30m, 24h, 28d")
			}
		}
		u, e := permissions.SearchUniqueUser(context.Background(), tokUserLogin, "")
		if e != nil {
			cmd.Println("Cannot find user")
			return
		}
		cli := auth.NewPersonalAccessTokenServiceClient(grpc.ResolveConn(ctx, common.ServiceToken))
		resp, e := cli.Generate(context.Background(), &auth.PatGenerateRequest{
			Type:              auth.PatType_PERSONAL,
			UserUuid:          u.Uuid,
			UserLogin:         tokUserLogin,
			Label:             "Command generated token",
			ExpiresAt:         expire.Unix(),
			AutoRefreshWindow: refreshSeconds,
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
		if tokCreationQuiet {
			fmt.Printf("%s", resp.AccessToken)
			//cmd.Print()
		} else {
			if tokAutoRefresh != "" {
				cmd.Println(promptui.IconGood + fmt.Sprintf(" This token for %s will expire on %s unless it is automatically refreshed.", uDisplay, time.Now().Add(time.Duration(refreshSeconds)*time.Second).Format(time.RFC850)))
			} else {
				cmd.Println(promptui.IconGood + fmt.Sprintf(" This token for %s will expire on %s.", uDisplay, expire.Format(time.RFC850)))
			}
			cmd.Println(promptui.IconGood + " " + resp.AccessToken)
			cmd.Println("")
			cmd.Println(promptui.IconWarn + " Make sure to secure it as it grants access to the user resources!")
		}
	},
}

func init() {
	UserCmd.AddCommand(pTokCmd)
	pTokCmd.Flags().StringVarP(&tokUserLogin, "user", "u", "", "User login (mandatory)")
	pTokCmd.Flags().StringVarP(&tokExpireTime, "expire", "e", "", "Expire after duration. Format is 20u where u is a unit: s (second), (minute), h (hour), d(day).")
	pTokCmd.Flags().StringVarP(&tokAutoRefresh, "auto", "a", "", "Auto-refresh expiration when token is used. Format is 20u where u is a unit: s (second), (minute), h (hour), d(day).")
	pTokCmd.Flags().StringSliceVarP(&tokScopes, "scope", "s", []string{}, "Optional scopes")
	pTokCmd.Flags().BoolVarP(&tokCreationQuiet, "quiet", "q", false, "Only return the newly created token value (typically useful in automation scripts with a short expiry time)")
}

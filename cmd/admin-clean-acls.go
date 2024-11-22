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
	"os"
	"strconv"
	"time"

	"github.com/spf13/cobra"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/proto/idm"
)

var (
	cleanAclAfter  string
	cleanAclBefore string
)

var dataCleanACLsCmd = &cobra.Command{
	Use:   "acls",
	Short: "Clean Expired ACLs",
	Long: `
DESCRIPTION

  When deleted after a node deletion, ACLs are not really deleted but only expired, to be able to restore them
  if necessary. This can lead to keep unused data, and particularly shared links information that may prevent users to 
  re-use an existing custom link value. Use this command to definitely delete expired ACLs based on a period. 

  Parameters accept either timestamps or durations. In the later case, corresponding time is computed using "Now - Duration".

EXAMPLES

  Clean all ACLs expired before last 24h 

  $ ` + os.Args[0] + ` clean admin acls --before 24h 

`,
	Run: func(cmd *cobra.Command, args []string) {
		if cleanAclAfter == "" && cleanAclBefore == "" {
			cmd.Println("Please provide at least one of --after | --before")
			cmd.Help()
			return
		}

		req := &idm.DeleteACLRequest{}
		if ea, err := strconv.ParseInt(cleanAclAfter, 10, 64); err == nil && ea > 0 {
			req.ExpiredAfter = ea
		} else if d, er := time.ParseDuration(cleanAclAfter); er == nil {
			req.ExpiredAfter = time.Now().Add(-d).Unix()
		}
		if eb, err := strconv.ParseInt(cleanAclBefore, 10, 64); err == nil && eb > 0 {
			req.ExpiredBefore = eb
		} else if d, er := time.ParseDuration(cleanAclBefore); er == nil {
			req.ExpiredBefore = time.Now().Add(-d).Unix()
		}

		if req.ExpiredAfter == 0 && req.ExpiredBefore == 0 {
			cmd.Println("[ERROR] please provide at least one valid parameter")
			cmd.Help()
			return
		}

		aclClient := idm.NewACLServiceClient(grpc.ResolveConn(ctx, common.ServiceAclGRPC))
		resp, e := aclClient.DeleteACL(ctx, req)
		if e != nil {
			cmd.Println("[ERROR] " + e.Error())
			cmd.Help()
			return
		}
		if resp.GetRowsDeleted() > 0 {

			cmd.Println(fmt.Sprintf("Definitely deleted %d ACLs (period %v-%v)", resp.GetRowsDeleted(), time.Unix(req.ExpiredAfter, 0), time.Unix(req.ExpiredBefore, 0)))
		} else {
			cmd.Println(fmt.Sprintf("Nothing to delete for period %v-%v", time.Unix(req.ExpiredAfter, 0), time.Unix(req.ExpiredBefore, 0)))
		}
	},
}

func init() {
	dataCleanACLsCmd.PersistentFlags().StringVarP(&cleanAclAfter, "after", "a", "", "Expiration date is greater than...")
	dataCleanACLsCmd.PersistentFlags().StringVarP(&cleanAclBefore, "before", "b", "240h", "Expiration date is lower than...")
	CleanCmd.AddCommand(dataCleanACLsCmd)
}

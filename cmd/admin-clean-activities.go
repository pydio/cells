//go:build exclude

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
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	pu "github.com/manifoldco/promptui"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v4/broker/activity"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/dao/boltdb"
	activity2 "github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var (
	purgeActivityAdminUser string
	activityType           string
	activityOwner          string
	boxName                string
	keepAtLeast            int
	keepMax                int
	acUpdated              string
	purgeTimeout           string
	compactDB              bool
	clearBackups           bool
	offlineDB              string
)

var cleanActivities = &cobra.Command{
	Use:   "activities",
	Short: "Purge user or file activities based on various criteria",
	Long: `
DESCRIPTION

  Launch a dedicated job to purge activities. The server must be running when launching this command.

  Activities are "social" events displayed in the interface. They can be either attached to "users" (notifications feed)
  or "nodes" (files/folders activities shown in the right panel when selecting a node).

  As they can grow indefinitely, this command can help for housekeeping and maintaining the activities database small.

EXAMPLES

  Purge users notifications, keeping at least 5 and maximum 20 items per user: 

  $ ` + os.Args[0] + ` admin clean activities --type users --box inbox -a admin --min 5 --max 20

`,
	Run: func(cmd *cobra.Command, args []string) {

		if acUpdated == "" && keepMax == 0 {
			fmt.Println(pu.IconBad + " Please set at least the --updated or --max flags select activities to purge")
			cmd.Help()
			return
		}
		if purgeActivityAdminUser == "" {
			fmt.Println(pu.IconBad + " Please provide --admin_user (-a) flag with an administrative user login.")
			cmd.Help()
			return
		}

		var internalType int
		var jobTitle string
		switch activityType {
		case "nodes":
			internalType = 0
			jobTitle = "Purge files/folders activities"
		case "users":
			internalType = 1
			jobTitle = "Purge users activities"
		default:
			fmt.Println(pu.IconBad + " The --type flag must be one of 'users' or 'nodes'")
			cmd.Help()
			return
		}
		if boxName != "inbox" && boxName != "outbox" {
			fmt.Println(pu.IconBad + " The --box flag must be one of 'inbox' or 'outbox'")
			cmd.Help()
			return
		}
		jobTitle += " (" + boxName + ")"

		requestParameters := map[string]interface{}{
			"OwnerType":    internalType,
			"OwnerID":      activityOwner,
			"BoxName":      boxName,
			"minCount":     keepAtLeast,
			"maxCount":     keepMax,
			"CompactDB":    compactDB,
			"ClearBackups": clearBackups,
		}
		var updatedTime time.Time
		if acUpdated != "" {
			var dur time.Duration
			if strings.HasSuffix(acUpdated, "d") {
				days, e := strconv.ParseInt(strings.TrimSuffix(acUpdated, "d"), 10, 32)
				if e != nil {
					fmt.Println(pu.IconBad + " Could not parse goland duration for --updated flag. Supported units are s,h,d")
					return
				}
				dur = time.Duration(days) * 24 * time.Hour
			} else if d, e := time.ParseDuration(acUpdated); e == nil {
				dur = d
			} else {
				fmt.Println(pu.IconBad + " Could not parse goland duration for --updated flag. Supported units are s,h,d")
				return
			}
			fmt.Println("Purging activities stored before " + time.Now().Add(-dur).Format(time.RFC822))
			updatedTime = time.Now().Add(-dur)
			requestParameters["updatedBeforeTimestamp"] = updatedTime.Unix()
		}
		if offlineDB != "" {

			ctx := cmd.Context()
			db, er := boltdb.NewDAO(ctx, "boltdb", offlineDB, "")
			if er != nil {
				log.Fatalln("Cannot open DB file", er.Error())
			}
			da, e := activity.NewDAO(ctx, db)
			if e != nil {
				log.Fatalln("Cannot open DAO", e.Error())
			}
			dao := da.(activity.DAO)
			loggerFunc := func(s string, _ int) {
				cmd.Println(s)
			}
			er = dao.Purge(cmd.Context(), loggerFunc, activity2.OwnerType(internalType), activityOwner, activity.BoxName(boxName), keepAtLeast, keepMax, updatedTime, compactDB, clearBackups)
			if er != nil {
				log.Fatalln(er)
			}

		} else {
			requestData, _ := json.Marshal(requestParameters)

			jobClient := jobs.NewJobServiceClient(grpc.ResolveConn(ctx, common.ServiceJobs))
			job := &jobs.Job{
				ID:             uuid.New(),
				Owner:          purgeActivityAdminUser,
				Label:          jobTitle,
				AutoStart:      true,
				AutoClean:      true,
				MaxConcurrency: 1,
				Actions: []*jobs.Action{
					{
						ID: "actions.cmd.rpc",
						Parameters: map[string]string{
							"service": "pydio.grpc.activity",
							"method":  "ActivityService.PurgeActivities",
							"request": string(requestData),
							"timeout": purgeTimeout,
						},
					},
				},
			}

			_, err := jobClient.PutJob(context.Background(), &jobs.PutJobRequest{
				Job: job,
			})
			if err != nil {
				log.Fatalln("error", err.Error())
			}

			cmd.Println(pu.IconGood + " Job launched for cleaning activities - See the scheduler to follow its status")
		}

	},
}

func init() {
	flags := cleanActivities.Flags()
	flags.StringVarP(&purgeActivityAdminUser, "admin", "a", "", "Provide login of the administrator user")
	flags.StringVarP(&activityType, "type", "t", "nodes", "Activity type, one of 'nodes' or 'users'")
	flags.StringVarP(&activityOwner, "owner", "o", "*", "Specific user or node ID, or all")
	flags.StringVarP(&boxName, "box", "b", "outbox", "Either inbox (notifications received) or outbox (user activity / file activity)")
	flags.StringVarP(&acUpdated, "updated", "", "", "Clear by keeping all records updated before a given date. Use golang duration, e.g. '3d' will keep all records updated in the last 3 days and remove older entries.")
	flags.StringVarP(&purgeTimeout, "timeout", "", "6h", "Set a longer timeout if there are tons of activities to purge (duration)")
	flags.IntVarP(&keepMax, "max", "", 0, "Clear by keeping a maximum number of records inside each box")
	flags.IntVarP(&keepAtLeast, "min", "", 1, "Keep at least N, 0 for clearing all records")
	flags.BoolVarP(&compactDB, "compact", "", true, "Trigger DB compaction by copying boltDB into a new file")
	flags.BoolVarP(&clearBackups, "clear", "", false, "After DB compaction, remove original file, otherwise keep it as a backup")
	flags.StringVarP(&offlineDB, "db", "", "", "Point directly to a DB file to perform the purge offline")

	CleanCmd.AddCommand(cleanActivities)
}

package cmd

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/proto/jobs"
	cmd2 "github.com/pydio/cells/v4/scheduler/actions/cmd"
	"github.com/spf13/cobra"
)

var JsonRequest = &cobra.Command{
	Use: "json",
	Run: func(cmd *cobra.Command, args []string) {
		action := &cmd2.RpcAction{}
		action.Init(&jobs.Job{}, &jobs.Action{
			Parameters: map[string]string{
				"service": "pydio.grpc.mailer",
				"method":  "mailer.MailerService.ConsumeQueue",
				"request": "{}",
			},
		})
		action.Run(context.Background(), nil, jobs.ActionMessage{})

		action2 := &cmd2.RpcAction{}
		action2.Init(&jobs.Job{}, &jobs.Action{
			Parameters: map[string]string{
				"service": "pydio.grpc.role",
				"method":  "idm.RoleService.SearchRole",
				"request": "{}",
			},
		})
		_, e := action2.Run(context.Background(), nil, jobs.ActionMessage{})
		fmt.Println(e)

	},
}

func init() {
	RootCmd.AddCommand(JsonRequest)
}

/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
	"log"

	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/mailer"
	"github.com/spf13/cobra"
)

// metaCmd represents the meta command
var jobsMailerTestCmd = &cobra.Command{
	Use:   "mailer-test",
	Short: "Sends an email.",
	Run:   newMailerTestJob,
}
var (
	mtMailContent, mtFrom, mtFromName, mtTo, mtToName, mtSubject string
)

func newMailerTestJob(cmd *cobra.Command, args []string) {

	if mtFrom == "" || mtTo == "" || mtSubject == "" || mtMailContent == "" {
		cmd.Help()
		return
	}

	client := mailer.NewMailerServiceClient("pydio.grpc.mailer", defaults.NewClient())

	ctx := context.Background()
	smr, err := client.SendMail(ctx, &mailer.SendMailRequest{
		InQueue: false,
		Mail: &mailer.Mail{
			From: &mailer.User{
				Name:    mtFromName,
				Address: mtFrom,
			},
			To: []*mailer.User{
				{
					Name:    mtToName,
					Address: mtTo,
				},
			},
			ContentPlain: mtMailContent,
			Subject:      mtSubject,
		},
	})

	if err != nil {
		log.Fatalln("send mail", err.Error())
	}

	log.Println("success:", smr.Success)
}

func init() {
	jobsMailerTestCmd.PersistentFlags().StringVar(&mtMailContent, "content", "", "Mail string content")
	jobsMailerTestCmd.PersistentFlags().StringVar(&mtFrom, "from", "", "Sender mail")
	jobsMailerTestCmd.PersistentFlags().StringVar(&mtFromName, "from-name", "", "Sender name")
	jobsMailerTestCmd.PersistentFlags().StringVar(&mtTo, "to", "", "Recipient mail")
	jobsMailerTestCmd.PersistentFlags().StringVar(&mtToName, "to-name", "", "Recipient name")
	jobsMailerTestCmd.PersistentFlags().StringVar(&mtSubject, "subject", "", "Mail subject")

	JobsCmd.AddCommand(jobsMailerTestCmd)
}

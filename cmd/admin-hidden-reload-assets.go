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

	"github.com/spf13/cobra"
	"google.golang.org/protobuf/types/known/emptypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
)

// docDepsCmd shows dependencies between services.
var reloadAssetsCmd = &cobra.Command{
	Use:    "reload-assets",
	Hidden: true,
	Short:  "Trigger frontend assets reload",
	Long: `
DESCRIPTION

  [For development only] Clear in-memory assets and refresh all, including the i18n JSON files.
`,
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Println("Sending a reload command on ReloadAssets topic")
		broker.MustPublish(context.Background(), common.TopicReloadAssets, &emptypb.Empty{})
	},
}

func init() {

	AdminCmd.AddCommand(reloadAssetsCmd)
}
